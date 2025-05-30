from django.db import models
from django.forms import ValidationError
from django.utils import timezone
from patients.models import Patient
from doctors.models import DoctorAvailability
from pharmacy.models import Medication
from invoice.models import Invoice
from p_invoice.models import PharmacyInvoice


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('info', 'Info'),
        ('low_stock', 'Low Stock'),
        ('expiry', 'Expiry Alert'),
        ('stagnant', 'Stagnant Drug'),
        ('medication_add', 'Medication Added'),
        ('lab_invoice', 'Lab Invoice'),
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('invoice', 'Invoice'), 
        ('sales', 'Sales'),
        ('bills','Bills')
    ]

    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, blank=True)
    doctor = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE, null=True, blank=True)
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True, related_name='billing_notifications')
    p_invoice = models.ForeignKey(PharmacyInvoice, on_delete=models.CASCADE, null=True, blank=True, related_name='pharmacy_notifications')

    def __str__(self):
        return f"{self.title}"