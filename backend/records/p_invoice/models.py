from django.db import models
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from decimal import Decimal
from patients.models import Patient
from pharmacy.models import Medication
from django.contrib.auth.models import User

class PharmacyInvoice(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True)
    patient_id_value = models.CharField(max_length=100, null=True, blank=True)
    Bill_Date = models.DateField(default=now)
    Bill_No = models.CharField(max_length=100, blank=True, unique=True)
    guest = models.BooleanField(default=False)
    patient_name = models.CharField(max_length=100)
    appointment_type = models.CharField(max_length=100, blank=True, null=True)
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], null=True, blank=True)
    doctor = models.CharField(max_length=100)

    TYPE_CHOICES = [
        ("Cash", "Cash"),
        ("Debit/Credit", "Debit/Credit"),
        ("UPI", "UPI"),
        ("Multiple (Cash+Card), (Cash+UPI)", "Multiple (Cash+Card), (Cash+UPI)"),
    ]
    Date = models.DateField(auto_now_add=True)
    typeof_transaction = models.CharField(max_length=50, choices=TYPE_CHOICES)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(max_length=100, blank=True, null=True)
    notification_created = models.BooleanField(default=False)
    is_finalized = models.BooleanField(default=False)

    # Approval workflow fields
    discount_requires_approval = models.BooleanField(default=False)
    discount_approved = models.BooleanField(default=False)
    discount_approved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_pharmacy_invoices')
    discount_approval_date = models.DateTimeField(null=True, blank=True)

    def generate_next_number(self, field_name, prefix):
        last_entry = PharmacyInvoice.objects.filter(**{f"{field_name}__startswith": prefix}).order_by('-id').first()
        if last_entry:
            last_number = last_entry.__dict__[field_name].replace(prefix, "")
            try:
                next_number = int(last_number) + 1
            except ValueError:
                next_number = 1
        else:
            next_number = 1
        generated_bill_no = f"{prefix}{next_number:02d}"
        while PharmacyInvoice.objects.filter(Bill_No=generated_bill_no).exists():
            next_number += 1
            generated_bill_no = f"{prefix}{next_number:02d}"
        return generated_bill_no

    def save(self, *args, **kwargs):
        if self.guest:
            self.appointment_type = "outpatient"
            if not self.patient_name:
                raise ValidationError("patient_name is required for guest.")
            if not self.doctor:
                raise ValidationError("doctor is required for guest.")
            self.patient = None  # ensure patient FK is null for guest
            
            # 🛠️ Only nullify if not provided
            if self.age in [None, ""]:
                self.age = None
            if self.gender in [None, ""]:
                self.gender = None

        else:
            if not self.patient:
                raise ValidationError("patient is required for registered patients.")
            # populate patient details from Patient model
            self.patient_name = self.patient.patient_name
            self.age = self.patient.age
            self.gender = self.patient.gender
            self.doctor = self.patient.doctor
            self.appointment_type = self.patient.appointment_type

        if not self.Bill_No:
            self.Bill_No = self.generate_next_number('Bill_No', 'INBILL')

        if not self.Bill_Date:
            self.Bill_Date = now().date()

        super().save(*args, **kwargs)

    def finalize_invoice(self):
        if self.is_finalized or not self.items.exists():
            return

        total_paid = self.items.aggregate(total=models.Sum('final_amount'))['total'] or Decimal("0.00")
        self.paid_amount = total_paid
        self.is_finalized = True
        self.save(update_fields=['paid_amount', 'is_finalized'])

    def __str__(self):
        return f"{self.Bill_No} | {self.patient_name}"


class PharmacyInvoiceItem(models.Model):
    invoice = models.ForeignKey(PharmacyInvoice, on_delete=models.CASCADE, related_name='items')
    medication_name = models.ForeignKey(Medication, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    mrp = models.DecimalField(max_digits=10, decimal_places=2, editable=False, null=True, blank=True)
    expiry_date = models.DateField(editable=False, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    tax_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    net_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def calculate_amounts(self):
        self.amount = self.quantity * self.mrp
        self.discount_amount = (self.amount * self.discount_percentage) / 100
        self.net_amount = self.amount - self.discount_amount
        self.tax_amount = (self.net_amount * self.tax_percentage) / 100
        self.final_amount = self.net_amount + self.tax_amount
 
    def save(self, *args, **kwargs):
        if not PharmacyInvoice.objects.filter(id=self.invoice_id).exists():
            raise ValidationError(f"Invalid invoice reference: {self.invoice_id} does not exist.")
       
        is_new = self.pk is None
        old_quantity = 0
 
        if not is_new:
            old_item = PharmacyInvoiceItem.objects.get(pk=self.pk)
            old_quantity = old_item.quantity
        quantity_diff = self.quantity - old_quantity
 
        if self.medication_name:
            self.mrp = self.medication_name.mrp or Decimal("0.00")
            self.expiry_date = self.medication_name.expiry_date
 
        self.calculate_amounts()
 
        if quantity_diff> 0:
            if(self.medication_name.stock_quantity or 0) < quantity_diff:
                raise ValidationError(f"Insufficient stock for {self.medication_name.medication_name}."
                                      f" Available: {self.medication_name.stock_quantity},"
                                       f" Requested: {quantity_diff}"
                                       )
        super().save(*args, **kwargs)
 
        self.medication_name.stock_quantity = (self.medication_name.stock_quantity or 0) - quantity_diff
        self.medication_name.save(update_fields=['stock_quantity'])
 
        # Update parent invoice paid_amount sum after item save
        parent_invoice = self.invoice
        parent_invoice.paid_amount = parent_invoice.items.aggregate(total=models.Sum('final_amount'))['total'] or Decimal("0.00")
        parent_invoice.save(update_fields=['paid_amount'])
 
    def delete(self, *args, **kwargs):
        self.medication_name.stock_quantity = (self.medication_name.stock_quantity or 0) + self.quantity
        self.medication_name.save(update_fields=['stock_quantity'])
        invoice = self.invoice
        super().delete(*args, **kwargs)
        invoice.paid_amount = invoice.items.aggregate(total=models.Sum('final_amount'))['total'] or Decimal("0.00")
        invoice.save(update_fields=['paid_amount'])
 
    def __str__(self):
        return f"{self.medication_name.medication_name} - Qty: {self.quantity}"