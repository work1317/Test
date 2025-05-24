from django.db import models
from django.core.exceptions import ValidationError

# Create your models here.



class Department(models.Model):
    name = models.CharField(max_length=40)

    def __str__(self):
        return self.name 
    
# Define choices for days of the week

DAYS_OF_WEEK = [
    
    ('Monday', 'Monday'),
    ('Tuesday', 'Tuesday'),
    ('Wednesday', 'Wednesday'),
    ('Thursday', 'Thursday'),
    ('Friday', 'Friday'),
    ('Saturday', 'Saturday'),
    ('Sunday', 'Sunday'),
]

class DoctorAvailability(models.Model):
    d_id = models.CharField(max_length=10, unique=True, blank=True, null=True)
    d_name = models.CharField(max_length=255)
    d_department = models.ForeignKey(Department,on_delete=models.CASCADE)
    d_phn_no = models.CharField(max_length=10,unique=True)
    d_email = models.EmailField(max_length=255)
    d_ward_no = models.CharField(max_length=200)
    
    # Store multiple selections as JSON (better for filtering)
    d_available_days = models.JSONField(default=list)  

    d_start_time = models.TimeField()
    d_end_time = models.TimeField()
    d_education_info = models.TextField(max_length=200 ,blank=True,null=True)
    d_certifications = models.TextField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def save(self, *args, **kwargs):
        if not self.d_id:
            last_entry = DoctorAvailability.objects.order_by('-id').first()
            if last_entry and last_entry.d_id:
                last_number = int(last_entry.d_id[1:]) + 1
            else:
                last_number = 1
            self.d_id = f"D{last_number:03d}"
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.d_name
    
    

class Appointment(models.Model):
    doctor = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE, related_name="appointments")
    patient_name = models.CharField(max_length=255)
    appointment_time = models.TimeField(help_text="Time of the appointment")

    def clean(self):
        """Validate that the appointment time is within the doctor's availability."""
        if not (self.doctor.d_start_time <= self.appointment_time <= self.doctor.d_end_time):
            raise ValidationError(f"Appointment time must be between {self.doctor.d_start_time} and {self.doctor.d_end_time}")

    def save(self, *args, **kwargs):
        """Run validation before saving."""
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Appointment with {self.doctor.name} at {self.appointment_time}"

    

