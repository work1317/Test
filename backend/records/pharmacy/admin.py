from django.contrib import admin
from .models import Medication,AddNewTransaction,AddSupplier
from datetime import date
from rangefilter.filters import DateRangeFilter

# Register your models here.

@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ('medication_name','category','batch_no','manufacturer','strength','stock_quantity','unit_price','mrp','expiry_date',)
    
    search_fields = ('medication_name','manufacturer','category',)

    list_filter = ('category','expiry_date',)

    ordering = ('medication_name',)

    readonly_fields = ('created_at', 'updated_at')  

    fieldsets = (
        ('Basic Info', {
            'fields': ('medication_name', 'category', 'manufacturer', 'strength')
        }),
        ('Stock & Pricing', {
            'fields': ('stock_quantity', 'unit_price', 'mrp', 'expiry_date')
        }),
        ('Additional Info', {
            'fields': ('description',)
        }),
    )

@admin.register(AddSupplier)
class AddSupplierAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'email', 'phone', 'products')
    search_fields = ('name', 'email', 'phone')
    list_filter = ('name',)

    def __str__(self):
        return self.name
    
@admin.register(AddNewTransaction)
class AddNewTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id','date','description','balance_amount','get_debit','get_credit',
        'get_payment_mode','net_change','due_date','get_overdue_by_days','supplier_name'
    )
    list_filter = (('date', DateRangeFilter), 'transaction_type', 'payment_mode', 'supplier')
    search_fields = ('description', 'supplier__name')

    def get_debit(self, obj):
        if obj.transaction_type == obj.TransactionType.DEBIT:
            return obj.amount
        return '-'
    get_debit.short_description = 'Debit'

    def get_credit(self, obj):
        if obj.transaction_type == obj.TransactionType.CREDIT:
            return obj.amount
        return '-'
    get_credit.short_description = 'Credit'

    def get_payment_mode(self, obj):
        return obj.get_payment_mode_display()
    get_payment_mode.short_description = 'Payment Mode'

    def get_overdue_by_days(self, obj):
        if obj.due_date:
            today = date.today()
            delta = (today - obj.due_date).days
            return delta if delta > 0 else 0
        return '-'
    get_overdue_by_days.short_description = 'Overdue by Days'

    def supplier_name(self, obj):
        return obj.supplier.name
    supplier_name.short_description = 'Supplier'

    