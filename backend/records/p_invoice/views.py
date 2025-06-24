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
from django.db import models
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from decimal import Decimal
from django.db import models
from django.db.models import Max
from rec_app.models import Prescription  # Ensure this import is present
 
 
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

            completed_prescriptions = patient.prescriptions.filter(status="completed")
            prescription_data = []

            for prescription in completed_prescriptions:
                # Fetch all batches of medication with the same medication_name
                medications = Medication.objects.filter(medication_name=prescription.medication.medication_name)

                batches = []
                for med in medications:
                    batches.append({
                        "batch_no": med.batch_no,
                        "expiry_date": med.expiry_date,
                        "mrp": med.mrp,
                    })

                prescription_data.append({
                    "medication_name": prescription.medication.medication_name,
                    "dosage": prescription.dosage,
                    "quantity": prescription.quantity,
                    "duration": prescription.duration,
                    "status": prescription.status,
                    "category": prescription.category,
                    "summary": prescription.summary,
                    "batches": batches,
                })

            data = {
                "patient_id": patient.patient_id,
                "patient_name": patient.patient_name,
                "age": patient.age,
                "gender": patient.gender,
                "doctor": patient.doctor.d_name if hasattr(patient.doctor, 'd_name') else str(patient.doctor),
                "appointment_type": patient.appointment_type,
                "completed_prescriptions": prescription_data
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

                discount_requires_approval = serializer.validated_data.get('discount_requires_approval', False)
                discount_approved = serializer.validated_data.get('discount_approved', False)

                patient = serializer.validated_data.get('patient', None)
                patient_id = patient.patient_id if patient else ''
                patient_name = serializer.validated_data.get('patient_name', '')

                items_data = request.data.get('items', [])
                max_discount = max(
                    [Decimal(str(item.get('discount_percentage', 0))) for item in items_data],
                    default=Decimal("0.00")
                )

                invoice = serializer.save()

                if discount_requires_approval and not discount_approved:
                    print("Creating Notification for discount approval:", invoice.id)
                    Notification.objects.create(
                        title = "Discount Approval Needed",
                        message=(
                            f"Invoice #{invoice.id}: Discount of {max_discount}% requested for "
                            f"Patient {patient_name} (ID: {patient_id}). Approval required."
                        ),
                        notification_type="discount_approval",
                        created_at=now(),
                        patient=invoice.patient,
                        patient_id_value=patient_id,
                        patient_name=patient_name,
                        discount_percentage=max_discount,
                        p_invoice=invoice,
                    )

                    return Response({
                        "success": 1,
                        "message": f"Invoice #{invoice.id}: Discount of {max_discount}% requested for Patient {patient_name} (ID: {patient_id}). Approval required.",
                        "invoice_id": invoice.id,
                        "patient_id": patient_id,
                        "patient_name": patient_name,
                        "discount_percentage": str(max_discount),
                        "Bill_No": invoice.Bill_No,
                        "Bill_Date": invoice.Bill_Date,
                    }, status=status.HTTP_201_CREATED)

                # Finalize invoice immediately if no approval needed
                invoice.finalize_invoice()
                print("Creating Notification for finalized invoice:", invoice.id)

                invoice.refresh_from_db()

                net_amount = getattr(invoice, 'paid_amount', 0)

                Notification.objects.create(
                    title = "Pharmacy Sale Completed",
                    message=(
                        f"Pharmacy sale (Patient ID: {patient_id}) for ₹{net_amount} has been "
                        f"completed for {patient_name}. Items: {invoice.items.count()} medications. "
                        f"Payment: {invoice.typeof_transaction}"
                    ),
                    notification_type="sale_complete",
                    created_at=now(),
                    patient=invoice.patient,
                    patient_id_value=patient_id,
                    patient_name=patient_name,
                    discount_percentage=max_discount,
                    p_invoice=invoice,
                )

                return Response({
                    "success": 1,
                    "message": "Invoice created successfully",
                    "invoice_id": invoice.id,
                    "patient_id": patient_id,
                    "patient_name": patient_name,
                    "discount_percentage": str(max_discount),
                    "Bill_No": invoice.Bill_No,
                    "Bill_Date": invoice.Bill_Date,
                }, status=status.HTTP_201_CREATED)

        except DRFValidationError as e:
            return Response({
                "success": 0,
                "message": "Validation error",
                "errors": e.detail
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            traceback.print_exc()
            return Response({
                "success": 0,
                "message": f"Unexpected error: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class DiscountApprovalAPIView(APIView):
    """
    POST: Admin decision to approve or reject discount for a given invoice_id.
    """
 
    def post(self, request, invoice_id):
        user = request.user
        if not user.is_staff and not user.is_superuser:
            return Response({
                "success": 0,
                "message": "Permission denied."
            }, status=status.HTTP_403_FORBIDDEN)
 
        decision = request.data.get("decision")
        if decision not in ["approve", "reject"]:
            return Response({
                "success": 0,
                "message": "Invalid decision. Must be 'approve' or 'reject'."
            }, status=status.HTTP_400_BAD_REQUEST)
 
        try:
            invoice = PharmacyInvoice.objects.get(pk=invoice_id)
        except PharmacyInvoice.DoesNotExist:
            return Response({
                "success": 0,
                "message": "Invoice not found."
            }, status=status.HTTP_404_NOT_FOUND)
 
        if not invoice.discount_requires_approval:
            return Response({
                "success": 0,
                "message": "Invoice does not require discount approval."
            })
 
        # Safe patient ID for guests
        patient_id_value = (
            invoice.patient.patient_id if invoice.patient else invoice.patient_id_value
        )
 
        # Fetch or create the related notification
        notification, created = Notification.objects.get_or_create(
            p_invoice=invoice,
            notification_type='discount_approval',
            defaults={
                'title': f"Discount approval for Invoice #{invoice.id}",
                'message': f"Discount approval pending for invoice #{invoice.id} and patient {invoice.patient_name}",
                'approval_status': 'pending',
                'patient': invoice.patient,
                'patient_name': invoice.patient_name,
                'patient_id_value': patient_id_value,
                'discount_percentage': invoice.discount_percentage if hasattr(invoice, 'discount_percentage') else None,
                "Bill_No": invoice.Bill_No,
                "Bill_Date": invoice.Bill_Date,
            }
        )
 
        if decision == "approve":
            if invoice.discount_approved:
                return Response({
                    "success": 0,
                    "message": "Invoice discount already approved."
                })
 
            # Mark invoice as approved
            invoice.discount_approved = True
            invoice.discount_approved_by = user
            invoice.discount_approval_date = now()
            invoice.save(update_fields=['discount_approved', 'discount_approved_by', 'discount_approval_date'])
 
            # Finalize invoice
            invoice.finalize_invoice()
            invoice.refresh_from_db()
 
            net_amount = getattr(invoice, 'net_amount', invoice.paid_amount)
            max_discount = invoice.items.aggregate(
                max_discount=Max('discount_percentage')
            )['max_discount'] or Decimal('0.00')
 
            # Update the notification
            notification.approval_status = 'approved'
            notification.title = "Pharmacy Sale Completed"
            notification.message = (
                f"Pharmacy sale (Patient ID: {patient_id_value}) for ₹{net_amount} has been "
                f"completed for {invoice.patient_name}. Items: {invoice.items.count()} medications. "
                f"Payment: {invoice.typeof_transaction}"
            )
            notification.discount_percentage = max_discount
            notification.created_at = now()
            notification.save()
 
            return Response({
                "success": 1,
                "message": f"Discount approved successfully for Patient {invoice.patient_name} with ID: {patient_id_value}, invoice finalized.",
                "patient_id": patient_id_value,
                "patient_name": invoice.patient_name,
                "discount_percentage": str(max_discount),
                "invoice_id": invoice.id,
            }, status=status.HTTP_200_OK)
 
        else:  # decision == "reject"
            notification.approval_status = 'rejected'
            notification.message += "\nDiscount rejected by admin."
            notification.save()
 
            invoice_id = invoice.id
            invoice.delete()
 
            return Response({
                "success": 1,
                "message": f"Discount rejected. Invoice #{invoice_id} for patient {invoice.patient_name} with Patient ID: {patient_id_value} has been deleted."
            }, status=status.HTTP_200_OK)


 
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
    def get(self, request):
        medication_name = request.query_params.get("medication_name")
        batch_no = request.query_params.get("batch_no")
        query = request.query_params.get("q")
        context = {
            "success": 1,
            "message": "",
            "suggestions": [],
            "batches": [],
            "data": {}
        }
        try:
            if query:
                # Autocomplete suggestions (case-insensitive substring match)
                suggestions = Medication.objects.filter(
                    medication_name__icontains=query
                ).values_list("medication_name", flat=True).distinct()
                context["suggestions"] = list(suggestions)
                context["message"] = "Suggestions fetched."
                return Response(context, status=status.HTTP_200_OK)
            if medication_name and not batch_no:
                # Get batch numbers for a medication name (partial match too)
                meds = Medication.objects.filter(medication_name__icontains=medication_name)
                if not meds.exists():
                    return Response({"success": 0, "message": "No medications found."}, status=status.HTTP_404_NOT_FOUND)
                context["batches"] = list(meds.values_list("batch_no", flat=True).distinct())
                context["message"] = "Batches fetched."
                return Response(context, status=status.HTTP_200_OK)
            if medication_name and batch_no:
                # Get specific batch details
                med = Medication.objects.filter(
                    medication_name__icontains=medication_name,
                    batch_no=batch_no
                ).first()
                if not med:
                    return Response({"success": 0, "message": "No such batch."}, status=status.HTTP_404_NOT_FOUND)
                context["data"] = {
                    "mrp": med.mrp,
                    "expiry_date": med.expiry_date,
                    "manufacturer": med.manufacturer,
                    "strength": med.strength,
                }
                context["message"] = "Details fetched."
                return Response(context, status=status.HTTP_200_OK)
            return Response({"success": 0, "message": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)
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
            start_date = request.query_params.get('start_date')
            end_date = request.query_params.get('end_date')
            appointment_type = request.query_params.get('appointment_type')
            payment_status = request.query_params.get('payment_status')

            filters = Q()
            if start_date:
                filters &= Q(Bill_Date__gte=start_date)
            if end_date:
                filters &= Q(Bill_Date__lte=end_date)
            if appointment_type:
                filters &= Q(appointment_type=appointment_type)
            if payment_status:
                filters &= Q(typeof_transaction=payment_status)

            invoices_qs = PharmacyInvoice.objects.filter(filters).order_by('-id')

            total_paid_amount = invoices_qs.aggregate(total=Sum('paid_amount'))['total'] or 0

            item_aggregates = PharmacyInvoiceItem.objects.filter(invoice__in=invoices_qs).aggregate(
                total_discount_amount=Sum('discount_amount'),
                total_net_amount=Sum('net_amount'),
            )

            total_discount_amount = item_aggregates.get('total_discount_amount') or 0
            total_net_amount = item_aggregates.get('total_net_amount') or 0

            # Prepare data with status logic
            invoice_data = []
            for invoice in invoices_qs:
                items = PharmacyInvoiceItem.objects.filter(invoice=invoice)
                total_mrp = sum(item.mrp * item.quantity for item in items)
                total_discount = sum(item.discount_amount for item in items)

                discount_percent = (total_discount / total_mrp) * 100 if total_mrp > 0 else 0

                if discount_percent <= 15:
                    approval_status = 'NA'
                elif invoice.discount_requires_approval:
                    if invoice.discount_approved is True:
                        approval_status = 'Approved'
                    else:
                        approval_status = 'Pending'
                else:
                    approval_status = 'Pending'

                serialized = RecentPharmacyInvoicesSerializer(invoice).data
                serialized['status'] = approval_status
                serialized['discount_percent'] = round(discount_percent, 2)
                invoice_data.append(serialized)

            return Response({
                "success": 1,
                "message": "Filtered invoices fetched successfully",
                "data": invoice_data,
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
