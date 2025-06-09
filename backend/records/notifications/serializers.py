from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import Notification

# create your notifications serializers here

class NotificationSerializer(serializers.ModelSerializer):
    status_alert = serializers.SerializerMethodField()
    invoice_id = serializers.SerializerMethodField()
    patient_phone = serializers.SerializerMethodField()
    doctor_id = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()
    created_date = serializers.SerializerMethodField()
    approval_required = serializers.SerializerMethodField()
    approval_status = serializers.CharField(read_only=True)  # explicitly from model field

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type', 'is_read', 'created_at',
            'patient', 'doctor', 'medication', 'invoice', 'p_invoice',
            'patient_id_value', 'patient_name', 'discount_percentage',

            'status_alert', 'invoice_id', 'patient_phone',
            'doctor_id', 'doctor_name', 'added_by', 'created_date',
            'approval_required', 'approval_status'
        ]

    def get_invoice_id(self, obj):
        return obj.p_invoice.id if obj.p_invoice else None

    def get_status_alert(self, obj):
        if obj.medication:
            medication = obj.medication
            today = timezone.now().date()

            # Expiry alert - within 180 days
            if medication.expiry_date:
                expiry_threshold = today + timedelta(days=180)
                if medication.expiry_date <= expiry_threshold:
                    return "Nearing Expiry"

            # Low stock alert - less than 40% of initial stock
            if medication.initial_stock and medication.stock_quantity is not None:
                threshold = 0.4 * medication.initial_stock
                if medication.stock_quantity < threshold:
                    return "Low Stock"

            # Stagnant alert - not updated for 120 days or more
            if medication.updated_at <= timezone.now() - timedelta(days=120):
                return "Stagnant"

            return "In Stock"
        return None

    def get_patient_phone(self, obj):
        return obj.patient.phno if obj.patient else None

    def get_doctor_id(self, obj):
        return obj.doctor.d_id if obj.doctor else None

    def get_doctor_name(self, obj):
        return obj.doctor.d_name if obj.doctor else None

    def get_added_by(self, obj):
        # Extract "Added by" from message for doctor notifications
        if obj.notification_type == 'doctor' and obj.message:
            lines = obj.message.split("\n")
            for line in lines:
                if "Added by:" in line:
                    return line.split("Added by:")[-1].strip()
        return None

    def get_created_date(self, obj):
        # Extract "Date" from message or fallback to created_at
        if obj.notification_type == 'doctor' and obj.message:
            lines = obj.message.split("\n")
            for line in lines:
                if "Date:" in line:
                    return line.split("Date:")[-1].strip()
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_approval_required(self, obj):
        # You can customize which types require approval
        return obj.notification_type == 'discount_approval'
