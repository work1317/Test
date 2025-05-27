from django.contrib import admin
from .models import Notification
from patients.models import Patient
from doctors.models import DoctorAvailability
from pharmacy.models import Medication
from invoice.models import Invoice

# Register the models here

class PatientFilter(admin.SimpleListFilter):
    title = 'Patient'
    parameter_name = 'patient'

    def lookups(self, request, model_admin):
        patients = Patient.objects.all()
        return [(p.id, p.patient_name) for p in patients]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(patient__id=self.value())
        return queryset


class DoctorFilter(admin.SimpleListFilter):
    title = 'Doctor'
    parameter_name = 'doctor'

    def lookups(self, request, model_admin):
        doctors = DoctorAvailability.objects.all()
        return [(d.id, d.d_name) for d in doctors]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(doctor__id=self.value())
        return queryset


class MedicationFilter(admin.SimpleListFilter):
    title = 'Medication'
    parameter_name = 'medication'

    def lookups(self, request, model_admin):
        medications = Medication.objects.all()
        return [(m.id, m.medication_name) for m in medications]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(medication__id=self.value())
        return queryset


class InvoiceFilter(admin.SimpleListFilter):
    title = 'Invoice'
    parameter_name = 'invoice'

    def lookups(self, request, model_admin):
        invoices = Invoice.objects.all()
        return [(inv.id, f"Invoice #{inv.id}") for inv in invoices]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(invoice__id=self.value())
        return queryset


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id','title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', PatientFilter, DoctorFilter, MedicationFilter,InvoiceFilter)
    search_fields = ('title', 'message')

    

