from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ObjectDoesNotExist
from .serializers import InvoiceSerializer
from patients.models import Patient
from .models import Invoice
from django.db import transaction
from .serializers import *
from django.db.models import Q
from doctors.models import DoctorAvailability
from rest_framework.exceptions import ErrorDetail
from core.exceptions import SerializerError
from rest_framework.exceptions import ValidationError
from p_invoice.models import PharmacyInvoice
from labs.models import LabInvoice
from datetime import datetime, time
from django.utils import timezone
from num2words import num2words

# Create your views here.

def get_first_error_message(errors):
    """
    Recursively extract the first error message from nested serializer errors.
    """
    if isinstance(errors, dict):
        for key in errors:
            return get_first_error_message(errors[key])
    elif isinstance(errors, list):
        for item in errors:
            return get_first_error_message(item)
    elif isinstance(errors, ErrorDetail):
        return str(errors)
    else:
        return str(errors)


class InvoiceAPIView(APIView):

    def get(self, request):
        patient_id = request.query_params.get('patient_id')
        if not patient_id:
            return Response(
                {
                    "success": 0,
                    "message": "patient_id query parameter is required.",
                    "data": {}
                }, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            patient_info = {
                "patient_id":patient.patient_id,
                "patient_name": patient.patient_name,
                "appointment_type": patient.appointment_type,
                "age": patient.age,
                "gender": patient.gender,
                "mobile_number": patient.phno,
                "doctor_name": patient.doctor.d_name,
                "ward": patient.ward_no
            }
            return Response(
                {
                    "success": 1,
                    "message": "Patient info retrieved successfully",
                    "data": patient_info
                },
                status=status.HTTP_200_OK
            )
        except Patient.DoesNotExist:
            return Response(
                {
                    "success": 0,
                    "message": f"No patient found with patient_id {patient_id}",
                    "data": {}
                },
                status=status.HTTP_404_NOT_FOUND
            )
        

    def post(self, request):
        context = {
            "success": 1,
            "message": "Invoice created successfully",
            "data": {}
        }

        try:
            serializer = InvoiceSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            invoice = serializer.save()

            # Fetching related data
            service_charges_data = ServiceChargeSerializer(
                invoice.service_charges.all(), many=True
            ).data
            print("service_charges_data =", service_charges_data)
            print("Types inside service_charges_data =", [type(sc) for sc in service_charges_data])

            investigation_data = InvestigationChargeSerializer(invoice.investigation_charges).data
            pharmacy_data = PharmacyChargeSerializer(invoice.pharmacy_charges).data
            consultation_data = ConsultationChargeSerializer(invoice.consultation_charges).data

            # Totals calculation
            service_total = sum(
                float(sc['amount']) for sc in service_charges_data
            )
            consultation_total = float(consultation_data['no_of_visits']) * float(consultation_data['amount_per_visit'])
            investigation_total = float(investigation_data['amount'])
            pharmacy_total = float(pharmacy_data['amount'])

            before_concession = (
                service_total + consultation_total + investigation_total + pharmacy_total
            )
            final_total = before_concession - float(invoice.concession)

            patient = invoice.patient
            patient_info = {
                "patient_name": patient.patient_name,
                "appointment_type": patient.appointment_type,
                "age": patient.age,
                "gender": patient.gender,
                "mobile_number": patient.phno,
                "doctor_name": patient.doctor.d_name,
                "ward": patient.ward_no
            }

            context["data"] = {
                "invoice": {
                    "id": invoice.id,
                    "invoice_id":invoice.invoice_id,
                    "patient": patient.patient_id,
                    "due_on_receipt": invoice.due_on_receipt,
                    "payment_method": invoice.payment_method,
                    "notes": invoice.notes,
                    "concession": str(invoice.concession),
                    "consultant":invoice.consultant,
                    "room_type":invoice.room_type,
                    "attendant_name":invoice.attendant_name,
                    "attendant_phno":invoice.attendant_phno,
                    "admitted_date":invoice.admitted_date,
                    "discharged_date":invoice.discharged_date,
                    "care_type":invoice.care_type,
                    "date":invoice.created_at.date(),
                    "service_charges": service_charges_data,
                    "investigation_charges": investigation_data,
                    "pharmacy_charges": pharmacy_data,
                    "consultation_charges": consultation_data
                },
                "patient_info": patient_info,
                "totals": {
                    "service": round(service_total, 2),
                    "investigation": round(investigation_total, 2),
                    "pharmacy": round(pharmacy_total, 2),
                    "consultation": round(consultation_total, 2),
                    "before_concession": round(before_concession, 2),
                    "concession": float(invoice.concession),
                    "final_total": round(final_total, 2)
                }
            }
            
        except ValidationError as e:
            context['success'] = 0
            context['message'] = get_first_error_message(e.detail)

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)

        return Response(context, status=status.HTTP_201_CREATED)


class InvoiceDetailAPIView(APIView):
    def get(self, request, patient_id):
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            invoice = Invoice.objects.filter(patient=patient).last()

            if not invoice:
                return Response(
                    {
                        "success": 0,
                        "message": f"No invoice found for patient_id {patient_id}",
                        "data": {}
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            service_charges_data = ServiceChargeSerializer(invoice.service_charges.all(), many=True).data
            investigation_data = InvestigationChargeSerializer(invoice.investigation_charges).data
            pharmacy_data = PharmacyChargeSerializer(invoice.pharmacy_charges).data
            consultation_data = ConsultationChargeSerializer(invoice.consultation_charges).data

            service_total = sum(
                float(sc['amount']) for sc in service_charges_data
            )
            consultation_total = float(consultation_data['no_of_visits']) * float(consultation_data['amount_per_visit'])
            investigation_total = float(investigation_data['amount'])
            pharmacy_total = float(pharmacy_data['amount'])
            before_concession = service_total + consultation_total + investigation_total + pharmacy_total
            final_total = before_concession - float(invoice.concession)

            patient_info = {
                "patient_name": patient.patient_name,
                "appointment_type": patient.appointment_type,
                "age": patient.age,
                "gender": patient.gender,
                "mobile_number": patient.phno,
                "doctor_name": patient.doctor.d_name,
                "ward": patient.ward_no
            }

            response_data = {
                "success": 1,
                "message": "Invoice and patient info retrieved successfully",
                "data": {
                    "invoice": {
                        "id": invoice.id,
                        "invoice_id":invoice.invoice_id,
                        "patient": patient.patient_id,
                        "due_on_receipt": invoice.due_on_receipt,
                        "payment_method": invoice.payment_method,
                        "notes": invoice.notes,
                        "concession": str(invoice.concession),
                        "service_charges": service_charges_data,
                        "investigation_charges": investigation_data,
                        "pharmacy_charges": pharmacy_data,
                        "consultation_charges": consultation_data
                    },
                    "patient_info": patient_info,
                    "totals": {
                        "service": round(service_total, 2),
                        "investigation": round(investigation_total, 2),
                        "pharmacy": round(pharmacy_total, 2),
                        "consultation": round(consultation_total, 2),
                        "before_concession": round(before_concession, 2),
                        "concession": float(invoice.concession),
                        "final_total": round(final_total, 2)
                    }
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except Patient.DoesNotExist:
            return Response(
                {
                    "success": 0,
                    "message": f"No patient found with patient_id {patient_id}",
                    "data": {}
                },
                status=status.HTTP_404_NOT_FOUND
            )
        
        except Exception as e:
            return Response(
                {
                    "success": 0,
                    "message": f"Error: {str(e)}",
                    "data": {}
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



    
class AllInvoiceListAPIView(APIView):
    def get(self, request):
        # Query Params
        patient_id = request.query_params.get('patient_id')
        patient_name = request.query_params.get('patient_name')
        mobile_number = request.query_params.get('mobile_number')
        department = request.query_params.get('department')
        service_name = request.query_params.get('service_name')

        # Base queryset
        invoices = Invoice.objects.select_related(
            'patient', 'investigation_charges', 'pharmacy_charges', 'consultation_charges'
        ).prefetch_related('service_charges').order_by('-created_at')

        # Filtering
        if patient_id or patient_name or mobile_number:
            invoices = invoices.filter(
                Q(patient__patient_id__icontains=patient_id or "") &
                Q(patient__patient_name__icontains=patient_name or "") &
                Q(patient__phno__icontains=mobile_number or "")
            )

        if department:
            invoices = invoices.filter(patient__doctor__d_department__name__icontains=department)

        if service_name:
            invoices = invoices.filter(service_charges__service_name__icontains=service_name).distinct()

        # Response build
        invoice_list = []
        for invoice in invoices:
            patient = invoice.patient
            service_charges_data = ServiceChargeSerializer(invoice.service_charges.all(), many=True).data
            investigation_data = InvestigationChargeSerializer(invoice.investigation_charges).data
            pharmacy_data = PharmacyChargeSerializer(invoice.pharmacy_charges).data
            consultation_data = ConsultationChargeSerializer(invoice.consultation_charges).data


            # Totals
            service_total = sum(
                float(sc['amount']) for sc in service_charges_data
            )
            consultation_total = float(consultation_data['no_of_visits']) * float(consultation_data['amount_per_visit'])
            investigation_total = float(investigation_data['amount'])
            pharmacy_total = float(pharmacy_data['amount'])
            before_concession = service_total + consultation_total + investigation_total + pharmacy_total
            final_total = before_concession - float(invoice.concession)

            invoice_data = {
                "invoice": {
                    "id": invoice.id,
                    "invoice_id":invoice.invoice_id,
                    "patient": patient.patient_id,
                    "due_on_receipt": invoice.due_on_receipt,
                    "payment_method": invoice.payment_method,
                    "notes": invoice.notes,
                    "concession": str(invoice.concession),
                    "consultant":invoice.consultant,
                    "room_type":invoice.room_type,
                    "attendant_name":invoice.attendant_name,
                    "attendant_phno":invoice.attendant_phno,
                    "admitted_date":invoice.admitted_date,
                    "discharged_date":invoice.discharged_date,
                    "care_type":invoice.care_type,
                    "date":invoice.created_at.date(),
                    "service_charges": service_charges_data,
                    "investigation_charges": investigation_data,
                    "pharmacy_charges": pharmacy_data,
                    "consultation_charges": consultation_data
                },
                "patient_info": {
                    "patient_name": patient.patient_name,
                    "appointment_type": patient.appointment_type,
                    "age": patient.age,
                    "gender": patient.gender,
                    "mobile_number": patient.phno,
                    "doctor_name": patient.doctor.d_name,
                    "ward": patient.ward_no,
                    "department":patient.doctor.d_department.name
                },
                # "pharmacy_info":pharmacy_info,
                "totals": {
                    "service": round(service_total, 2),
                    "investigation": round(investigation_total, 2),
                    "pharmacy": round(pharmacy_total, 2),
                    "consultation": round(consultation_total, 2),
                    "before_concession": round(before_concession, 2),
                    "concession": float(invoice.concession),
                    "final_total": round(final_total, 2)
                }
            }

            invoice_list.append(invoice_data)

        return Response(
            {
                "success": 1,
                "message": "Invoices retrieved successfully",
                "count": len(invoice_list),
                "data": invoice_list
            },
            status=status.HTTP_200_OK
        )
    



class InvoicePrintAPIView(APIView):
    def get(self, request, id):
        try:
            # patient = Patient.objects.get(patient_id=patient_id)
            invoice = Invoice.objects.get(pk=id)  

            if not invoice:
                return Response(
                    {
                        "success": 0,
                        "message": f"No invoice found for invoice_id {invoice.invoice_id}",
                        "data": {}
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            service_charges_data = ServiceChargeSerializer(invoice.service_charges.all(), many=True).data
            investigation_data = InvestigationChargeSerializer(invoice.investigation_charges).data
            pharmacy_data = PharmacyChargeSerializer(invoice.pharmacy_charges).data
            consultation_data = ConsultationChargeSerializer(invoice.consultation_charges).data

            start_date_str = investigation_data['from_date']
            end_date_str = investigation_data['to_date']

            # Convert to date objects
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
            end_date = datetime.strptime(end_date_str, "%Y-%m-%d").date()

            # Cover the full day range
            start_datetime = timezone.make_aware(datetime.combine(start_date, time.min))
            end_datetime = timezone.make_aware(datetime.combine(end_date, time.max))

            pharmacy_invoices = PharmacyInvoice.objects.filter(created_at__range=(start_datetime, end_datetime), patient=invoice.patient).prefetch_related("items")
            lab_invoices = LabInvoice.objects.filter(created_at__range=(start_datetime, end_datetime), patient=invoice.patient)
            
            pharmacy_info = []
            lab_info = []

            for pharmacy_invoice in pharmacy_invoices:
                for item in pharmacy_invoice.items.all():
                    pharmacy_info.append({
                        "Bill_No":pharmacy_invoice.Bill_No,
                        "created_date":pharmacy_invoice.created_at.date(),
                        "total_amount":float(item.amount),
                        "discount_amount":float(item.discount_amount),
                        "net_amount":float(item.net_amount),
                        "paid_amount":float(item.final_amount)
                    })

            for lab_invoice in lab_invoices:
                lab_info.append({
                    "bill_no":lab_invoice.lab_id,
                    "created_at":lab_invoice.created_at.date(),
                    "total_amount":lab_invoice.amount
                })

            service_total = sum(
                float(sc['amount']) for sc in service_charges_data
            )
            consultation_total = float(consultation_data['no_of_visits']) * float(consultation_data['amount_per_visit'])
            investigation_total = float(investigation_data['amount'])
            pharmacy_total = float(pharmacy_data['amount'])
            before_concession = service_total + consultation_total + investigation_total + pharmacy_total
            final_total = before_concession - float(invoice.concession)

            words = num2words(final_total, to='cardinal', lang='en')
            words = words.replace(',', '')  # Removes commas if any
            words_in_rupees = words.title() + " Rupees Only"

            print(words_in_rupees)

            patient_info = {
                "patient_name": invoice.patient.patient_name,
                "appointment_type": invoice.patient.appointment_type,
                "age": invoice.patient.age,
                "gender": invoice.patient.gender,
                "mobile_number": invoice.patient.phno,
                "doctor_name": invoice.patient.doctor.d_name,
                "ward": invoice.patient.ward_no
            }

            response_data = {
                "success": 1,
                "message": "Invoice and patient info retrieved successfully",
                "data": {
                    "invoice": {
                        "id": invoice.id,
                        "invoice_id":invoice.invoice_id,
                        "patient": invoice.patient.patient_id,
                        "due_on_receipt": invoice.due_on_receipt,
                        "payment_method": invoice.payment_method,
                        "notes": invoice.notes,
                        "concession": str(invoice.concession),
                        "consultant":invoice.consultant,
                        "room_type":invoice.room_type,
                        "attendant_name":invoice.attendant_name,
                        "attendant_phno":invoice.attendant_phno,
                        "admitted_date":invoice.admitted_date,
                        "discharged_date":invoice.discharged_date,
                        "care_type":invoice.care_type,
                        "date":invoice.created_at.date(),
                        "time":invoice.created_at.time(),
                        "service_charges": service_charges_data,
                        "investigation_charges": investigation_data,
                        "pharmacy_charges": pharmacy_data,
                        "consultation_charges": consultation_data
                    },
                    "patient_info": patient_info,
                    "pharmacy_info":pharmacy_info,
                    "lab_info":lab_info,
                    "totals": {
                        "service": round(service_total, 2),
                        "investigation": round(investigation_total, 2),
                        "pharmacy": round(pharmacy_total, 2),
                        "consultation": round(consultation_total, 2),
                        "before_concession": round(before_concession, 2),
                        "concession": float(invoice.concession),
                        "final_total": round(final_total, 2),
                        "words_in_rupees":words_in_rupees
                    }
                }
            }
            return Response(response_data, status=status.HTTP_200_OK)

        except Patient.DoesNotExist:
            return Response(
                {
                    "success": 0,
                    "message": f"No patient found with patient_id {invoice.patient.patient_id}",
                    "data": {}
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {
                    "success": 0,
                    "message": f"Error: {str(e)}",
                    "data": {}
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
