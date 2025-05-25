from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(DoctorAvailability)
class DoctorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['id','d_name','is_guest']
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['id','name']

admin.site.register(Appointment)