from rest_framework import serializers
from .models import Notification
from django.utils import timezone
from datetime import timedelta

class NotificationSerializer(serializers.ModelSerializer):
    status_alert = serializers.SerializerMethodField()
    invoice_id = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'notification_type',
            'is_read', 'created_at', 'patient', 'doctor', 'medication', 'status_alert'
            ,'invoice','invoice_id'
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


