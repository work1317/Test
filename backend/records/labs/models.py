from django.db import models
from doctors.models import DoctorAvailability

# Create your models here.

class LabInvoice(models.Model):
    STATUS_CHOICES=[
        ("Completed","Completed"),
        ("Pending","Pending"),
        ("In Progress","In Progress")
    ]
    patient_name = models.CharField(max_length=100)
    test_name = models.CharField(max_length=100)
    date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    amount = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.patient_name} - {self.test_name}"

class LabTest(models.Model):
    PRIORITY_CHOICES = [
        ('Urgent', 'Urgent'),
        ('Normal', 'Normal'),
        
    ]

    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('inprogress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    patient_id = models.CharField(max_length=100)
    patient_name = models.CharField(max_length=255)
    requested_test = models.CharField(max_length=255)
    requested_by = models.CharField(max_length=255)
    request_date = models.DateField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='pending')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True, null=True)

    user_id = models.CharField(max_length=10)  
    username = models.CharField(max_length=150)

    test_date = models.DateField(blank=True, null=True)
    test_time = models.TimeField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    test_type = models.CharField(max_length=100, blank=True, null=True)
    flag = models.BooleanField(default=False)

    upload = models.FileField(upload_to='lab_tests/', blank=True, null=True)

    def __str__(self):
        return f"LabTest for {self.patient_name} ({self.requested_test})"
    
    