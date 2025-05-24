from django.contrib import admin
from .models import Appointment

# Register your models here.

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['id','appointment_id','patient','patient_name','doctor','date','time','age','appointment_type','notes','gender','phno','email','blood_group','created_at']