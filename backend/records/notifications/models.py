# from django.db import models
# from django.utils import timezone
# from patients.models import Patient
# from doctors.models import DoctorAvailability

# class Notification(models.Model):
#     title = models.CharField(max_length=255)
#     message = models.TextField()
#     is_read = models.BooleanField(default=False)
#     created_at = models.DateTimeField(default=timezone.now)
#     patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, null=True, blank=True)
#     doctor = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE, null=True, blank=True)

#     def __str__(self):
#         return self.title
    

from django.db import models
from django.forms import ValidationError
from django.utils import timezone
from patients.models import Patient
from doctors.models import DoctorAvailability # type: ignore
 

class Notification(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
    ]
 
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
 
    # For general notifications (optional)
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, null=True, blank=True
    )
    doctor = models.ForeignKey(
        DoctorAvailability, on_delete=models.CASCADE, null=True, blank=True
    )
 
    # For discount alert on PharmacyInvoiceItem
    pharmacy_invoice_item = models.ForeignKey(
        'p_invoice.PharmacyInvoiceItem',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="notifications"
    )
 
    # Status only applicable for invoice item discount approvals
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending",
        blank=True
    )
 
    def clean(self):
        # Enforce: status must be set only if pharmacy_invoice_item is present
        if self.pharmacy_invoice_item and not self.status:
            raise ValidationError("Status is required for invoice item notifications.")
 
        if not self.pharmacy_invoice_item:
            self.status = ''  # Clear status for general notifications
 
    def __str__(self):
        return f"{self.title} ({self.status or 'General'})"
