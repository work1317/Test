from datetime import date
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.timezone import now
from notifications.models import Notification
from patients.models import Patient
from pharmacy.models import Medication

class PharmacyInvoice(models.Model):
    Bill_Date = models.DateField(default=date.today)
    Bill_No = models.CharField(max_length=100, blank=True, unique=True)
    guest = models.BooleanField(default=False)
    patient_name = models.CharField(max_length=100)
    patient_id = models.CharField(max_length=100, null=True, blank=True)
    appointment_type = models.CharField(max_length=100, blank=True, null=True)
    age = models.IntegerField()
    gender = models.CharField(
        max_length=10,
        choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')]
    )
    doctor = models.CharField(max_length=100)

    TYPE_CHOICES = [
        ("Cash", "Cash"),
        ("Debit/Credit", "Debit/Credit"),
        ("UPI", "UPI"),
        ("Multiple (Cash+Card), (Cash+UPI)", "Multiple (Cash+Card), (Cash+UPI)"),
    ]
    Date = models.DateField(auto_now_add=True)
    typeof_transaction = models.CharField(max_length=50, choices=TYPE_CHOICES, null=True, blank=True)
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(max_length=100)
    notification_created = models.BooleanField(default=False)
    is_finalized = models.BooleanField(default=False)

    def generate_next_number(self, field_name, prefix):
        last_entry = PharmacyInvoice.objects.filter(
            **{f"{field_name}__startswith": prefix}
        ).order_by('-id').first()

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
        else:
            if not self.patient_id:
                raise ValidationError("patient_id is required for registered patients.")
            try:
                patient = Patient.objects.get(patient_id=self.patient_id)
                self.patient_name = patient.patient_name
                self.age = patient.age
                self.gender = patient.gender
                self.doctor = patient.doctor
                self.appointment_type = patient.appointment_type
            except Patient.DoesNotExist:
                raise ValidationError(f"No patient found with ID: {self.patient_id}")

        if not self.Bill_No:
            self.Bill_No = self.generate_next_number('Bill_No', 'INBILL')

        if not self.Bill_Date:
            self.Bill_Date = now().date()

        super().save(*args, **kwargs)

    def finalize_invoice(self):
        if self.is_finalized or not self.items.exists():
            return

        self.paid_amount = self.items.aggregate(
            total=models.Sum('final_amount')
        )['total'] or Decimal("0.00")

        self.is_finalized = True
        self.save(update_fields=['paid_amount', 'is_finalized'])

        # Check for existing sale notification
        if not Notification.objects.filter(
            title=f"Pharmacy Sale {self.Bill_No}",
            message__icontains=self.patient_name
        ).exists():
            Notification.objects.create(
                title=f"Pharmacy Sale {self.Bill_No}",
                message=(
                    f"Pharmacy sale {self.Bill_No} for Rs {self.paid_amount} has been completed "
                    f"for {self.patient_name}. Items: {self.items.count()}. "
                    f"Payment: {self.typeof_transaction}."
                )
            )

    def __str__(self):
        return f"{self.Bill_No} | {self.patient_name}"


class PharmacyInvoiceItem(models.Model):
    invoice = models.ForeignKey(
        PharmacyInvoice,
        on_delete=models.CASCADE,
        related_name='items'
    )
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

        if self.medication_name:
            self.mrp = self.medication_name.mrp or Decimal("0.00")
            self.expiry_date = self.medication_name.expiry_date

        self.calculate_amounts()
        super().save(*args, **kwargs)

        # Update parent invoice total
        parent_invoice = self.invoice
        parent_invoice.paid_amount = parent_invoice.items.aggregate(
            total=models.Sum('final_amount')
        )['total'] or Decimal("0.00")
        parent_invoice.save(update_fields=['paid_amount'])

        # Prevent duplicate high discount notifications
        if self.discount_percentage >= 15:
            existing = Notification.objects.filter(
                pharmacy_invoice_item=self,
                title__icontains="High Discount Alert"
            ).first()

            if not existing:
                Notification.objects.create(
                    title=f"High Discount Alert for {parent_invoice.patient_name}",
                    message=(
                        f"Discount of {self.discount_percentage}% applied to {self.medication_name.medication_name} "
                        f"(Qty: {self.quantity}) in invoice {parent_invoice.Bill_No}. "
                        f"Please review and approve or reject."
                    ),
                    pharmacy_invoice_item=self,
                    status="Pending"
                )

    def delete(self, *args, **kwargs):
        invoice = self.invoice
        super().delete(*args, **kwargs)
        invoice.paid_amount = invoice.items.aggregate(
            total=models.Sum('final_amount')
        )['total'] or Decimal("0.00")
        invoice.save(update_fields=['paid_amount'])

    def __str__(self):
        return f"{self.medication_name.medication_name} - Qty: {self.quantity}"
