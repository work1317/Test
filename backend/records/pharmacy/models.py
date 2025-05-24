from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from datetime import timedelta
from django.db.models import Max
from decimal import Decimal

# Create your models here.

class Medication(models.Model):
    medication_name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=100)
    strength = models.CharField(max_length=100)
    stock_quantity = models.PositiveIntegerField(null=True,blank=True)
    initial_stock = models.PositiveIntegerField(null=True,blank=True)
    unit_price = models.DecimalField(max_digits=10,decimal_places=2,null=True,blank=True)
    mrp = models.DecimalField(max_digits=10,decimal_places=2,null=True,blank=True)
    expiry_date = models.DateField(null=True,blank=True)
    description = models.TextField(null=True,blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Only set initial_stock on first creation
        if self._state.adding and self.stock_quantity is not None:
            self.initial_stock = self.stock_quantity
        super().save(*args, **kwargs)


    def __str__(self):
        return self.medication_name


class AddSupplier(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    products = models.TextField()

    def __str__(self):
        return self.name


class AddNewTransaction(models.Model):
    class TransactionType(models.TextChoices):
        DEBIT = 'debit', 'Debit'
        CREDIT = 'credit', 'Credit'

    class PaymentMode(models.TextChoices):
        CASH = 'cash', 'Cash'
        DEBIT_CREDIT_CARD = 'debit_credit_card', 'Debit/Credit Card'
        UPI = 'upi', 'UPI'
        MULTIPLE_CASH_CARD = 'multiple_cash_card', 'Multiple(Cash+Card)'
        MULTIPLE_CASH_UPI = 'multiple_cash_upi', 'Multiple(Cash+UPI)'

    supplier = models.ForeignKey(AddSupplier, related_name="transactions", on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    description = models.TextField()
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)  # ← Add this line
    balance_amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField(null=True, blank=True)
    due_date_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    transaction_type = models.CharField(max_length=10, choices=TransactionType.choices)
    payment_mode = models.CharField(max_length=20, choices=PaymentMode.choices)
    net_change = models.DecimalField(max_digits=12, decimal_places=2, editable=False)

    def save(self, *args, **kwargs):
        amt = self.amount or Decimal('0')
        due = self.due_date_amount or Decimal('0')

        if not isinstance(amt, Decimal):
            amt = Decimal(str(amt))
        if not isinstance(due, Decimal):
            due = Decimal(str(due))

        if self.transaction_type == self.TransactionType.DEBIT:
            self.net_change = amt + due
        else:
            self.net_change = amt - due

        self.balance_amount = self.net_change  # Set balance_amount to net_change

        super().save(*args, **kwargs)
