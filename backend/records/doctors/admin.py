from django.contrib import admin
from .models import *
from notifications.signals import set_current_user
# Register your models here.

@admin.register(DoctorAvailability)
class DoctorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ['id','d_name','is_guest']
    
    def save_model(self, request, obj, form, change):
        set_current_user(request.user)  # ✅ Set current user before saving
        super().save_model(request, obj, form, change)

    
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['id','name']

admin.site.register(Appointment)