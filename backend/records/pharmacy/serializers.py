from rest_framework import serializers
from .models import Medication,AddNewTransaction,AddSupplier
from django.utils import timezone
from datetime import timedelta
from datetime import date
from decimal import Decimal
from dateutil.relativedelta import relativedelta

# Create the seralizers over here

class MedicationSeralizer(serializers.ModelSerializer):
    status_alert = serializers.SerializerMethodField()
   
    class Meta:
        model = Medication
        fields = '__all__'  
 
    def get_status_alert(self, obj):
        today = timezone.now().date()
        four_months_ago = timezone.now() - timedelta(days=120)
        six_months_later = today + relativedelta(months=6)
 
        if (
            obj.stock_quantity is None and
            obj.unit_price is None and
            obj.mrp is None and
            obj.expiry_date is None and
            obj.description is None
        ):
            return "Prescription Pending"
 
        if (
            obj.initial_stock and
            obj.stock_quantity is not None and
            obj.initial_stock > 0 and
            obj.stock_quantity <= 0.4 * obj.initial_stock
        ):
            return "Low Stock"
 
        if obj.expiry_date and today <= obj.expiry_date <= six_months_later:
            return "Nearing Expiry"
 
        if obj.updated_at <= four_months_ago:
            return "Stagnant"
 
        return "In Stock"
 
 
 

class AddSupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddSupplier
        fields = ['id', 'name', 'email', 'phone', 'products']


class AddNewTransactionSerializer(serializers.ModelSerializer):
    balance = serializers.DecimalField(source='net_change', max_digits=12, decimal_places=2)
    debit = serializers.SerializerMethodField()  # This will call `get_debit` method
    credit = serializers.SerializerMethodField()  # This will call `get_credit` method
    due_on = serializers.DateField(source='due_date')
    overdue_by_days = serializers.SerializerMethodField()
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)

    class Meta:
        model = AddNewTransaction
        fields = [
            'id', 'date', 'description', 'balance_amount',
            'debit', 'credit', 'payment_mode',
            'due_on', 'due_date_amount', 'overdue_by_days',
            'balance', 'supplier_name'
        ]

    def get_debit(self, obj):
        if obj.transaction_type == 'debit':
            due = Decimal(obj.due_date_amount or 0)
            now = Decimal(obj.amount or 0)
            return {
                "received": float(now),
                "due": float(due),
                "total": float(now + due)
            }
        return "-"

    def get_credit(self, obj):
        if obj.transaction_type == 'credit':
            due = Decimal(obj.due_date_amount or 0)
            amt = Decimal(obj.amount or 0)
            received = amt - due
            return {
                "received": float(received),
                "due": float(due),
                "total": float(amt)
            }
        return "-"

    def get_overdue_by_days(self, obj):
        if obj.due_date:
            today = timezone.now().date()
            delta = (today - obj.due_date).days
            return delta if delta > 0 else 0
        return 0
    
    