from django.contrib import admin
from .models import *

# Register your models here.

admin.site.register(DoctorAvailability)
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['id','name']

admin.site.register(Appointment)