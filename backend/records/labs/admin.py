from django.contrib import admin
from .models import LabInvoice,LabTest

# Register your models here.

@admin.register(LabInvoice)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ['patient_name', 'test_name', 'amount','date', 'status']
    search_fields = ['patient_name', 'test_name', 'status']
    list_filter = ['status', 'date']


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'patient_id', 'patient_name', 'requested_test', 'requested_by',
        'request_date', 'priority', 'status', 'test_date', 'test_time', 'flag'
    )
    list_filter = ('priority', 'status', 'test_date', 'request_date')
    search_fields = ('patient_name', 'patient_id', 'requested_test', 'requested_by', 'username')
    readonly_fields = ('upload',)
    ordering = ('-request_date',)
