from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import Max
from django.utils import timezone
from datetime import timedelta
from doctors.models import DoctorAvailability


# Create your models here.

class Patient(models.Model):
    class AppointmentStatus(models.TextChoices):
        INPATIENT = 'inpatient', _('inpatient')
        OUTPATIENT = 'outpatient', _('outpatient')
        CASUALITY = 'casuality' , _('casuality')

    class GenderStatus(models.TextChoices):
        MALE = 'male', _('Male')
        FEMALE = 'female', _('Female')
        OTHERS = 'others', _('Others')

    class BloodGroupChoices(models.TextChoices):
        A_POSITIVE = 'A+' , _('A+')
        A_NEGATIVE = 'A-' , _('A-')
        B_POSITIVE = 'B+' , _('B+')
        B_NEGATIVE = 'B-' , _('B-')
        AB_POSITIVE = 'AB+' , _('AB+')
        AB_NEGATIVE = 'AB-' , _('AB-')
        O_POSITIVE = 'O+' , _('O+')
        O_NEGATIVE = 'O-' , _('O-')

    patient_id = models.CharField(max_length=10,unique=True,editable=False)
    patient_name = models.CharField(max_length=100)
    doctor = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE)
    date = models.DateField()
    time = models.TimeField()
    age = models.IntegerField()
    appointment_type = models.CharField(
        max_length=20,
        choices=AppointmentStatus.choices
    )
    notes = models.TextField()
    gender = models.CharField(max_length=20,choices=GenderStatus.choices)
    phno = models.CharField(max_length=10)
    email = models.EmailField()
    blood_group = models.CharField(max_length=3,choices=BloodGroupChoices.choices,null=True,blank=True)
    ward_no = models.CharField(max_length=10,null=True,blank=True)
    diagnosis = models.TextField(blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def can_update(self):
        return timezone.now() <= self.created_at + timedelta(hours=30)
    
    def save(self,*args,**kwargs):
        if not self.patient_id:
            last_patient = Patient.objects.aggregate(max_id=Max('id')) 
            last_id = last_patient['max_id'] if last_patient['max_id'] else 0
            self.patient_id = f'P{last_id + 1:03}'
        super(Patient,self).save(*args,**kwargs)
    
    def __str__(self):
        return self.patient_name
    