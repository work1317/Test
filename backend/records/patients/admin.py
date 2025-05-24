from django.contrib import admin
from .models import Patient

# Register your models here

class VitalsAdmin(admin.ModelAdmin):
    search_fields = ['temp', 'blood', 'heartrate', 'oxygen']

class RecordsAdmin(admin.ModelAdmin):
    search_fields = ['status']

class PatientAdmin(admin.ModelAdmin):
    list_display = ['id','patient_id', 'patient_name', 'doctor_name', 'age', 'gender', 'blood_group', 'email', 'phno', 'appointment_type', 'ward_no','diagnosis','created_at']
    search_fields = ['patient_name', 'phno', 'doctor_name', 'email']
    list_filter = ['gender', 'appointment_type', 'blood_group']


admin.site.register(Patient, PatientAdmin)

