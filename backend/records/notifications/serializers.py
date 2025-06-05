from rest_framework import serializers
from .models import Notification
from django.utils import timezone
from datetime import timedelta

class NotificationSerializer(serializers.ModelSerializer):
    status_alert = serializers.SerializerMethodField()
    invoice_id = serializers.SerializerMethodField()
    patient_phone = serializers.SerializerMethodField()

    doctor_id = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()
    created_date = serializers.SerializerMethodField()
    approval_required = serializers.SerializerMethodField()
    approval_status = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type',
            'is_read', 'created_at', 'patient', 'doctor', 'medication', 'status_alert'
            ,'invoice','invoice_id','patient_phone' ,'doctor_id', 'doctor_name', 'added_by', 'created_date', 'approval_required',
            'approval_status'
        ]

    def get_status_alert(self, obj):
        if obj.medication:
            medication = obj.medication
            today = timezone.now().date()

            # Expiry alert
            if medication.expiry_date:
                expiry_threshold = today + timedelta(days=180)
                if medication.expiry_date <= expiry_threshold:
                    return "Nearing Expiry"

            # Low stock alert
            if medication.initial_stock and medication.stock_quantity is not None:
                threshold = 0.4 * medication.initial_stock
                if medication.stock_quantity < threshold:
                    return "Low Stock"

            # Stagnant alert
            if medication.updated_at <= timezone.now() - timedelta(days=120):
                return "Stagnant"

            return "In Stock"
        return None
    
    def get_invoice_id(self, obj):
        return obj.invoice.id if obj.invoice else None
    
    def get_patient_phone(self, obj):
        if obj.patient:
            return obj.patient.phno
        return None

    def get_doctor_id(self, obj):
            return obj.doctor.d_id if obj.doctor else None
    
    def get_doctor_name(self, obj):
        return obj.doctor.d_name if obj.doctor else None

    def get_added_by(self, obj):
        # This assumes you stored it in `message` earlier
        if obj.notification_type == 'doctor' and obj.message:
            lines = obj.message.split("\n")
            for line in lines:
                if "Added by" in line:
                    return line.split("Added by:")[-1].strip()
        return None

    def get_created_date(self, obj):
        # Extracting the date from message or fallback to created_at
        if obj.notification_type == 'doctor' and obj.message:
            lines = obj.message.split("\n")
            for line in lines:
                if "Date:" in line:
                    return line.split("Date:")[-1].strip()
        return obj.created_at.strftime('%Y-%m-%d %H:%M:%S')

    def get_approval_required(self, obj):
        return obj.notification_type == 'doctor'

    def get_approval_status(self, obj):
        if "Status: Approved" in obj.message:
            return "approved"
        elif "Status: Rejected" in obj.message:
            return "rejected"
        return "pending"
