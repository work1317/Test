from django.db import models
from django.utils import timezone
from patients.models import Patient
from doctors.models import DoctorAvailability

class Notification(models.Model):
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, null=True, blank=True)
    doctor = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.title
