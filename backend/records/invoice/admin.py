from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['id','patient','investigation_charges','pharmacy_charges','consultation_charges','due_on_receipt','payment_method','notes','concession']

@admin.register(ServiceCharge)
class ServiceChargeAdmin(admin.ModelAdmin):
    list_display = ['id','service_name','days','amount']