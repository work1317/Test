from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
from django.db.models import Max
from patients.models import Patient
from doctors.models import DoctorAvailability

# create your appointments models here

class Appointment(models.Model):
    class AppointmentStatus(models.TextChoices):
        INPATIENT = 'inpatient', _('Inpatient')
        OUTPATIENT = 'outpatient', _('Outpatient')
        CASUALITY = 'casuality', _('Casuality')

    class GenderStatus(models.TextChoices):
        MALE = 'male', _('Male')
        FEMALE = 'female', _('Female')
        OTHERS = 'others', _('Others')

    class BloodGroupChoices(models.TextChoices):
        A_POSITIVE = 'A+', _('A+')
        A_NEGATIVE = 'A-', _('A-')
        B_POSITIVE = 'B+', _('B+')
        B_NEGATIVE = 'B-', _('B-')
        AB_POSITIVE = 'AB+', _('AB+')
        AB_NEGATIVE = 'AB-', _('AB-')
        O_POSITIVE = 'O+', _('O+')
        O_NEGATIVE = 'O-', _('O-')

    appointment_id = models.CharField(max_length=10, unique=True, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True, blank=True)
    patient_name = models.CharField(max_length=100)
    doctor = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    age = models.IntegerField()
    appointment_type = models.CharField(max_length=20, choices=AppointmentStatus.choices)
    notes = models.TextField(blank=True)
    gender = models.CharField(max_length=20, choices=GenderStatus.choices)
    phno = models.CharField(max_length=10)
    email = models.EmailField()
    blood_group = models.CharField(max_length=3, choices=BloodGroupChoices.choices, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def save(self, *args, **kwargs):
        if not self.appointment_id:
            last_appointment = Appointment.objects.aggregate(max_id=Max('id')) 
            last_id = last_appointment['max_id'] if last_appointment['max_id'] else 0
            self.appointment_id = f'A{last_id + 1:03}'
        super().save(*args, **kwargs)

    def __str__(self):
        return self.patient_name