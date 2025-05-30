from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from decimal import ROUND_HALF_UP, Decimal
from io import BytesIO
from reportlab.lib.pagesizes import A4  # type: ignore
from reportlab.pdfgen import canvas      # type: ignore
import traceback
from p_invoice.models import PharmacyInvoice, PharmacyInvoiceItem
from p_invoice.serializers import (
    PharmacyInvoiceItemSerializer,
    PharmacyInvoiceSerializer,
    MedicationSerializer,
)
from pharmacy.models import Medication
from django.db.models import Q, Sum
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError
from patients.models import Patient
from .serializers import RecentPharmacyInvoicesSerializer
from notifications.models import Notification
 
 
# # -------------------- CREATE -------------------------------------

class CreatePharmacyInvoiceAPIView(APIView):
    def get(self, request, *args, **kwargs):
        patient_id = request.query_params.get("patient_id")
        if not patient_id:
            return Response({
                "success": 0,
                "message": "patient_id is required in query parameters",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)
 
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            data = {
                "patient_id": patient.patient_id,
                "patient_name": patient.patient_name,
                "age": patient.age,
                "gender": patient.gender,
                "doctor": patient.doctor.d_name,
                "appointment_type": patient.appointment_type
            }
            return Response({
                "success": 1,
                "message": "Patient data fetched successfully",
                "data": data
            }, status=status.HTTP_200_OK)
        except Patient.DoesNotExist:
            return Response({
                "success": 0,
                "message": "No patient found with this ID.",
                "data": {}
            }, status=status.HTTP_404_NOT_FOUND)
        
    def post(self, request, *args, **kwargs):
        try:
            with transaction.atomic():
                serializer = PharmacyInvoiceSerializer(data=request.data)
                serializer.is_valid(raise_exception=True)
                invoice = serializer.save()
                invoice.finalize_invoice()

                # Format values to 2 decimal places
                paid_amount = Decimal(invoice.paid_amount).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                item_count = invoice.items.count()
                typeof_transaction = invoice.typeof_transaction or "N/A"

                # Optional patient instance if required
                patient_instance = None
                if invoice.patient_id:
                    try:
                        patient_instance = Patient.objects.get(patient_id=invoice.patient_id)
                    except Patient.DoesNotExist:
                        pass

                # Create Notification
                Notification.objects.create(
                    title="Pharmacy Sale Completed",
                    message=(
                        f"Pharmacy sale (Patient ID: {invoice.patient_id}) for ₹{paid_amount} "
                        f"has been completed for {invoice.patient_name}. "
                        f"Items: {item_count} medications. "
                        f"Payment: {typeof_transaction}"
                    ),
                    notification_type="bills",
                    patient=patient_instance if patient_instance else None
                )

            return Response({
                "success": 1,
                "message": "Invoice created and finalized successfully",
                "data": PharmacyInvoiceSerializer(invoice).data
            }, status=status.HTTP_201_CREATED)

        except DjangoValidationError as ve:
            return Response({
                "success": 0,
                "message": f"Validation error: {ve.message}",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)

        except DRFValidationError as ve:
            return Response({
                "success": 0,
                "message": f"Validation error: {ve.detail}",
                "data": {}
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response({
                "success": 0,
                "message": f"An unexpected error occurred: {str(e)}",
                "data": {}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

 
# -------------------- LIST ------------------------------------------
 
class PharmacyInvoiceListAPIView(APIView):
    def get(self, request):
        context = {"success": 1, "message": "Invoices fetched successfully.", "data": []}
 
        try:
            invoices = PharmacyInvoice.objects.all().order_by("-id").prefetch_related("items")
            for invoice in invoices:
                items = invoice.items.all()
 
                summary = {
                    "total_amount": 0, "total_discount": 0, "total_tax": 0,
                    "total_net_amount": 0, "total_final_amount": 0
                }
 
                item_list = []
                for item in items:
                    summary["total_amount"] += item.amount
                    summary["total_discount"] += item.discount_amount
                    summary["total_tax"] += item.tax_amount
                    summary["total_net_amount"] += item.net_amount
                    summary["total_final_amount"] += item.final_amount
 
                    item_list.append({
                        "medication_name": item.medication_name.medication_name,
                        "quantity": item.quantity,
                        "mrp": float(item.mrp),
                        "expiry_date": item.expiry_date,
                        "amount": float(item.amount),
                        "discount_percentage": float(item.discount_percentage),
                        "discount_amount": float(item.discount_amount),
                        "tax_percentage": float(item.tax_percentage),
                        "tax_amount": float(item.tax_amount),
                        "net_amount": float(item.net_amount),
                        "final_amount": float(item.final_amount),
                    })
 
                context["data"].append({
                    "invoice_id": invoice.id,
                    "bill_no": invoice.Bill_No,
                    "bill_date": invoice.Bill_Date,
                    "patient_name": invoice.patient_name,
                    "patient_id": invoice.patient_id,
                    "appointment_type": invoice.appointment_type,
                    "age": invoice.age,
                    "gender": invoice.gender,
                    "doctor": invoice.doctor,
                    "typeof_transaction": invoice.typeof_transaction,
                    "description": invoice.description,
                    "paid_amount": float(invoice.paid_amount),
                    "items": item_list,
                    "summary": {
                        **{k: float(v) for k, v in summary.items()},
                        "total_paid_amount": float(invoice.paid_amount),
                    }
                })
 
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
        return Response(context, status=status.HTTP_200_OK)
 
# -------------------- DETAIL / UPDATE -------------------------------
 
class PharmacyInvoiceDetailAPIView(APIView):
    def get(self, request, invoice_id):
        context = {"success": 1, "message": "Invoice details fetched successfully.", "data": {}}
        try:
            invoice = PharmacyInvoice.objects.prefetch_related("items").get(id=invoice_id)
            items = invoice.items.all()
 
            summary = {
                "total_amount": Decimal('0.00'),
                "total_discount": Decimal('0.00'),
                "total_tax": Decimal('0.00'),
                "total_net_amount": Decimal('0.00'),
                "total_final_amount": Decimal('0.00')
            }
 
            item_list = []
            for item in items:
                summary["total_amount"] += item.amount
                summary["total_discount"] += item.discount_amount
                summary["total_tax"] += item.tax_amount
                summary["total_net_amount"] += item.net_amount
                summary["total_final_amount"] += item.final_amount
 
                item_list.append({
                    "medication_name": item.medication_name.medication_name,
                    "quantity": item.quantity,
                    "mrp": float(item.mrp),
                    "expiry_date": item.expiry_date,
                    "amount": float(item.amount),
                    "discount_percentage": float(item.discount_percentage),
                    "discount_amount": float(item.discount_amount),
                    "tax_percentage": float(item.tax_percentage),
                    "tax_amount": float(item.tax_amount),
                    "net_amount": float(item.net_amount),
                    "final_amount": float(item.final_amount),
                })
 
            invoice_data = {
                "invoice_id": invoice.id,
                "bill_no": invoice.Bill_No,
                "bill_date": invoice.Bill_Date,
                "patient_name": invoice.patient_name,
                "age": invoice.age,
                "gender": invoice.gender,
                "doctor": invoice.doctor,
                "typeof_transaction": invoice.typeof_transaction,
                "description": invoice.description,
                "paid_amount": float(invoice.paid_amount),
            }
 
            context["data"] = {
                "invoice": invoice_data,
                "items": item_list,
                "summary": {
                    **{k: float(v) for k, v in summary.items()},
                    "total_paid_amount": float(invoice.paid_amount),
                }
            }
 
        except PharmacyInvoice.DoesNotExist:
            return Response({"success": 0, "message": "Invoice not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"success": 0, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
        return Response(context, status=status.HTTP_200_OK)
    


class MedicationSearchByNameAPIView(APIView):
    def get(self, request, medication_name=None):
        batch_no = request.query_params.get("batch_no")
 
        context = {
            "success": 1,
            "message": "Fetched Successfully",
            "data": [],
            "batches": []
        }
 
        if not medication_name:
            return Response({"success": 0, "message": "Medication name is required."}, status=status.HTTP_400_BAD_REQUEST)
 
        try:
            if batch_no:
                # Return details for specific batch_no with that medication_name
                medication = Medication.objects.filter(
                    medication_name=medication_name,
                    batch_no=batch_no
                ).first()
 
                if not medication:
                    return Response({"success": 0, "message": "No medication found for given batch number."}, status=status.HTTP_404_NOT_FOUND)
 
                serializer = MedicationSerializer(medication)
                context["data"] = serializer.data
                return Response(context, status=status.HTTP_200_OK)
 
            else:
                # Return all batches for medication_name
                medications = Medication.objects.filter(medication_name=medication_name)
                if not medications.exists():
                    return Response({"success": 0, "message": "No medications found."}, status=status.HTTP_404_NOT_FOUND)
 
                batches = [med.batch_no for med in medications]
                serializer = MedicationSerializer(medications, many=True)
                context["batches"] = batches
                context["data"] = serializer.data
 
                return Response(context, status=status.HTTP_200_OK)
 
        except Exception as e:
            return Response({"success": 0, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
 
 
 
#---------------------SEARCH WITH MEDICATION ID-----------------------
 
class MedicationSearchByIdAPIView(APIView):
    def get(self, request, medication_id=None):
        if not medication_id:
            return Response({"success": 0, "message": "Medication ID is required."}, status=status.HTTP_400_BAD_REQUEST)
 
        try:
            medication = Medication.objects.filter(id=medication_id).first()
            if not medication:
                return Response({"success": 0, "message": "Medication not found."}, status=status.HTTP_404_NOT_FOUND)
 
            serializer = MedicationSerializer(medication)
            return Response({"success": 1, "message": "Medication fetched successfully.", "data": serializer.data}, status=status.HTTP_200_OK)
 
        except Exception as e:
            return Response({"success": 0, "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
# -------------------- PDF DOWNLOAD ----------------------------------
 
class InvoiceDownloadAPIView(APIView):
    def get(self, request, pk):
        invoice = get_object_or_404(PharmacyInvoice, pk=pk)
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4
 
        p.setFont("Helvetica-Bold", 16)
        p.drawString(200, 800, "Pharmacy Invoice")
 
        p.setFont("Helvetica", 12)
        p.drawString(50, 770, f"Invoice No: {invoice.Bill_No}")
        p.drawString(50, 750, f"Date: {invoice.Bill_Date}")
        p.drawString(50, 730, f"Patient: {invoice.patient_name}")
        p.drawString(50, 710, f"Doctor: {invoice.doctor}")
        p.drawString(50, 690, f"Transaction Type: {invoice.typeof_transaction}")
        y = 660
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "Medicine")
        p.drawString(200, y, "Qty")
        p.drawString(250, y, "MRP")
        p.drawString(300, y, "Amount")
        p.drawString(370, y, "Discount")
        p.drawString(450, y, "Final")
 
        p.setFont("Helvetica", 12)
        y -= 20
        for item in invoice.items.all():
            p.drawString(50, y, item.medication_name.medication_name)
            p.drawString(200, y, str(item.quantity))
            p.drawString(250, y, f"{item.mrp:.2f}")
            p.drawString(300, y, f"{item.amount:.2f}")
            p.drawString(370, y, f"{item.discount_amount:.2f}")
            p.drawString(450, y, f"{item.final_amount:.2f}")
            y -= 20
            if y < 100:
                p.showPage()
                y = 800
 
        p.setFont("Helvetica-Bold", 12)
        y -= 20
        p.drawString(250, y, "Total:")
        p.drawString(300, y, f"{invoice.items.aggregate(Sum('amount'))['amount__sum'] or 0:.2f}")
        p.drawString(370, y, f"{invoice.items.aggregate(Sum('discount_amount'))['discount_amount__sum'] or 0:.2f}")
        p.drawString(450, y, f"{invoice.items.aggregate(Sum('final_amount'))['final_amount__sum'] or 0:.2f}")
 
        p.showPage()
        p.save()
        buffer.seek(0)
        return FileResponse(buffer, as_attachment=True, filename=f"Invoice_{invoice.Bill_No}.pdf")
 
# -------------------- RECENT ----------------------------------------
 
 
class RecentPharmacyInvoicesAPIView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            # Extract query parameters
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            appointment_type = request.query_params.get('appointment_type')
            payment_status = request.query_params.get('payment_status')
 
            # Build dynamic filters
            filters = Q()
            if start_date:
                filters &= Q(Bill_Date__gte=start_date)
            if end_date:
                filters &= Q(Bill_Date__lte=end_date)
            if appointment_type:
                filters &= Q(appointment_type=appointment_type)
            if payment_status:
                filters &= Q(typeof_transaction=payment_status)
 
            # Apply filters
            invoices_qs = PharmacyInvoice.objects.filter(filters).order_by('-id')
 
            # Aggregations
            total_paid_amount = invoices_qs.aggregate(total=Sum('paid_amount'))['total'] or 0
 
            item_aggregates = PharmacyInvoiceItem.objects.filter(invoice__in=invoices_qs).aggregate(
                total_discount_amount=Sum('discount_amount'),
                total_net_amount=Sum('net_amount'),
            )
 
            total_discount_amount = item_aggregates.get('total_discount_amount') or 0
            total_net_amount = item_aggregates.get('total_net_amount') or 0
 
            # Serialize invoices
            serializer = RecentPharmacyInvoicesSerializer(invoices_qs, many=True)
 
            return Response({
                "success": 1,
                "message": "Filtered invoices fetched successfully",
                "data": serializer.data,
                "totals": {
                    "total_amount": total_paid_amount,
                    "total_discount_amount": total_discount_amount,
                    "total_after_discount_amount": total_net_amount,
                    "total_net_amount": total_net_amount,
                }
            }, status=status.HTTP_200_OK)
 
        except Exception as e:
            return Response({
                "success": 0,
                "message": f"An error occurred: {str(e)}",
                "data": []
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)