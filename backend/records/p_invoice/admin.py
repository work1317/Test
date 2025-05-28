from django.contrib import admin
from .models import PharmacyInvoice, PharmacyInvoiceItem
 
class PharmacyInvoiceItemInline(admin.TabularInline):
    model = PharmacyInvoiceItem
    extra = 0
 
@admin.register(PharmacyInvoice)
class PharmacyInvoiceAdmin(admin.ModelAdmin):
    list_display = ("Bill_No", "patient_name", "patient_id", "appointment_type", "Bill_Date", "get_final_amount")
    inlines = [PharmacyInvoiceItemInline]
 
    def get_final_amount(self, obj):
        return sum(item.final_amount for item in obj.items.all())
    get_final_amount.short_description = "Total Amount"
    get_final_amount.admin_order_field = "items__final_amount"
 
@admin.register(PharmacyInvoiceItem)
class PharmacyInvoiceItemAdmin(admin.ModelAdmin):
    list_display = (
        "invoice", "medication_name", "quantity", "mrp", "amount",
        "discount_percentage", "tax_percentage", "final_amount"
    )
