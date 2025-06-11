from rest_framework.views import APIView
from rest_framework.response import Response
from core import messages
from core.exceptions import SerializerError
from . import models, serializers, validators
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from .models import Notification
from patients.models import Patient
from pharmacy.models import Medication
from invoice.models import Invoice
from p_invoice.models import PharmacyInvoice
from django.db.models import Q

# Create the Views Here

class CombinedDashboardNotificationAPIView(APIView):
    def get(self, request):
        context = {
            "success": 1,
            "message": "Data fetched successfully.",
            "data": []
        }

        try:
            today = timezone.now().date()

            dashboard_summary = {
                "total_unread": Notification.objects.filter(is_read=False).count(),
                "new_patients_today": Patient.objects.filter(created_at__date=today).count(),
                "invoices_today": Invoice.objects.filter(created_at__date=today).count(),
                "pharmacy_sales_today": PharmacyInvoice.objects.filter(Date=today).count(),
            }

            context["data"].append(dashboard_summary)

            filter_type = request.GET.get('filter', '').strip().lower()
            search_query = request.GET.get('search', '').strip()
            notifications = Notification.objects.all().order_by('-created_at')  # latest first

            filter_map = {
                'patient': ['patient'],
                'doctor': ['doctor'],
                'lab_invoice': ['lab_invoice'],
                'medication_add': ['medication_add', 'low_stock', 'stagnant', 'expiry'],
                'low_stock': ['low_stock'],
                'stagnant': ['stagnant'],
                'expiry': ['expiry'],
                'invoice': ['invoice'], 
                'sales': ['sales'],  
                'bills':['bills']
            }

            if filter_type == 'read':
                notifications = notifications.filter(is_read=True)
            elif filter_type == 'unread':
                notifications = notifications.filter(is_read=False)
            elif filter_type in filter_map:
                notifications = notifications.filter(notification_type__in=filter_map[filter_type])
            elif filter_type != '':
                context["success"] = 0
                context["message"] = f"Invalid filter type: {filter_type}"
                return Response(context, status=status.HTTP_400_BAD_REQUEST)

            if search_query:
                notifications = notifications.filter(
                    Q(title__icontains=search_query) |
                    Q(message__icontains=search_query) |
                    Q(patient__patient_name__icontains=search_query) |
                    Q(patient__patient_id__icontains=search_query) |
                    Q(patient__phno__icontains=search_query)
                )

            # Assuming NotificationSerializer includes 'approval_status'
            serializer = serializers.NotificationSerializer(notifications, many=True, context={"request": request})

            # The serialized data will include latest approval_status for each notification
            context["data"].extend(serializer.data)

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context)
    

    def post(self, request):
        context = {
            "success": 1,
            "message": "Notification saved successfully.",
            "data": {}
        }

        try:
            validator = validators.NotificationValidator(data=request.data)
            if not validator.is_valid():
                raise serializers.ValidationError(validator.errors)

            validated_data = validator.validated_data

            is_read_value = validated_data.get('is_read', False)

            notification = Notification(
                title=validated_data['title'],
                message=validated_data['message'],
                notification_type=validated_data['notification_type'],
                is_read=is_read_value,
                patient=validated_data.get('patient'),
                doctor=validated_data.get('doctor'),
                medication=validated_data.get('medication'),
                invoice=validated_data.get('invoice', None),
                p_invoice=validated_data.get('p_invoice', None),
                approval_status=validated_data.get('approval_status', 'pending'),  # explicitly set approval_status
            )
            notification.clean()
            notification.save()

            serializer = serializers.NotificationSerializer(notification, context={"request": request})
            context['data'] = serializer.data

        except serializers.ValidationError as e:
            context['success'] = 0
            context['message'] = str(e)

        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)



class MarkAsReadView(APIView):
    def get(self, request, pk):
        return self.post(request, pk)

    def post(self, request, pk):
        """
        Marks a notification as read
        """
        context = {
            "success": 1,
            "message": "Notification marked as read.",
            "data": {}
        }

        try:
            notification = models.Notification.objects.get(pk=pk)

            if notification.is_read:
                context["message"] = "Notification already marked as read."
            else:
                notification.is_read = True
                notification.save()
                context["data"] = {
                    "id": notification.id,
                    "title": notification.title,
                    "is_read": notification.is_read
                }

        except models.Notification.DoesNotExist:
            context['success'] = 0
            context['message'] = "Notification not found."
            return Response(context, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            context['success'] = 0
            context['message'] = f"Error: {str(e)}"
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(context, status=status.HTTP_200_OK)

class NotificationApprovalAPIView(APIView):
    def post(self, request, pk):
        action = request.data.get("status")  # 'approved' or 'rejected'
        context = {"success": 0, "message": "Something went wrong"}

        try:
            notification = Notification.objects.get(pk=pk)

            if notification.notification_type != 'doctor':
                context["message"] = "Only doctor notifications can be approved or rejected."
                return Response(context, status=status.HTTP_400_BAD_REQUEST)

            doctor = notification.doctor
            if not doctor:
                context["message"] = "Associated doctor not found."
                return Response(context, status=status.HTTP_404_NOT_FOUND)

            if action == "approved":
                notification.approval_status = "approved"  # ✅ Fix: update approval_status
                notification.message += "\nStatus: Approved"
                context["success"] = 1
                context["message"] = f"Doctor '{doctor.d_name}' approved successfully."

            elif action == "rejected":
                doctor_name = doctor.d_name
                doctor.delete()
                notification.doctor = None
                notification.approval_status = "rejected"  # ✅ Fix: update approval_status
                notification.message += f"\nStatus: Rejected"
                context["success"] = 1
                context["message"] = f"Doctor '{doctor_name}' rejected."

            else:
                context["message"] = "Invalid status value. Use 'approved' or 'rejected'."
                return Response(context, status=status.HTTP_400_BAD_REQUEST)

            notification.save()

        except Notification.DoesNotExist:
            context["message"] = "Notification not found."
            return Response(context, status=status.HTTP_404_NOT_FOUND)

        return Response(context)

 
 
 