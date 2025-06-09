from django.db import models
from django.utils import timezone
from decimal import Decimal
from patients.models import Patient
from doctors.models import DoctorAvailability
from pharmacy.models import Medication
from invoice.models import Invoice
from p_invoice.models import PharmacyInvoice

# create your notifications models here

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
        ('bills','Bills'),
        ('discount_approval', 'Discount Approval'),  # add a type for discount approval notifications
    ]

    APPROVAL_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

    approval_status = models.CharField(
        max_length=10,
        choices=APPROVAL_STATUS_CHOICES,
        default='pending',
        blank=True,
        null=True,
        help_text="Approval status for discount approval notifications"
    )
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, blank=True)
    doctor = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE, null=True, blank=True)
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, null=True, blank=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True, related_name='billing_notifications')
    p_invoice = models.ForeignKey(PharmacyInvoice, on_delete=models.CASCADE, null=True, blank=True, related_name='pharmacy_notifications')
    patient_id_value = models.CharField(max_length=100, null=True, blank=True)
    patient_name = models.CharField(max_length=255, null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.title}"
