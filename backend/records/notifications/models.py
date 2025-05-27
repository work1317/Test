from django.db import models
from django.utils import timezone
from patients.models import Patient
from doctors.models import DoctorAvailability
from pharmacy.models import Medication
from invoice.models import Invoice


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
        ('sales', 'Sales') 
    ]
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, blank=True)
    doctor = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE, null=True, blank=True)
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.title
