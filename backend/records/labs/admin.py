from django.contrib import admin
from .models import LabTest,LabInvoice

# Register the models over here

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'patient', 'requested_test', 'request_date',
        'priority', 'status', 'test_date', 'test_type', 'flag','upload',
    )
    list_display_links = ('id', 'requested_test')
    list_filter = ('priority', 'status', 'test_type', 'flag', 'request_date', 'test_date',)
    search_fields = (
        'patient__id', 'patient__patient_name', 'patient__doctor__d_name', 'test_type',
    )
    list_editable = ('status', 'flag')
    ordering = ('-request_date',)
    readonly_fields = ('upload',)

    fieldsets = (
        ("Patient Info", {
            "fields": ("patient",)
        }),
        ("Test Request Details", {
            "fields": ("requested_test", "request_date", "priority", "status", "request_by")  # <-- corrected here
        }),
        ("Test Result Details", {
            "fields": ("test_date", "test_time", "summary", "test_type", "upload", "flag")
        }),
    )


@admin.register(LabInvoice)
class LabInvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'testname', 'amount', 'status', 'date')
    list_filter = ('status', 'date')
    search_fields = ('patient__patient_name', 'testname')
    ordering = ('-date',)

    # Optional: Customize how the fields appear in the form
    fieldsets = (
        (None, {
            'fields': ('patient', 'testname', 'amount', 'status', 'date')
        }),
    )

