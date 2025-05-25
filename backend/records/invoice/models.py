from django.db import models
from patients.models import Patient

# Create your models here.

class ServiceCharge(models.Model):
    service_name = models.CharField(max_length=50)
    days = models.IntegerField()
    amount = models.DecimalField(max_digits=8,decimal_places=2)


class InvestigationCharge(models.Model):
    from_date = models.DateField()
    to_date = models.DateField()
    amount = models.DecimalField(max_digits=7, decimal_places=2)


class PharmacyCharge(models.Model):
    from_date = models.DateField()
    to_date = models.DateField()
    amount = models.DecimalField(max_digits=7, decimal_places=2)


class ConsultationCharge(models.Model):
    no_of_visits = models.IntegerField()
    amount_per_visit = models.DecimalField(max_digits=7, decimal_places=2)


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('yes','Yes'),
        ('no','No')
    ]
    PAYMENT_CHOICES = [
        ('cash', 'Cash'),
        ('upi', 'UPI'),
        ('debit/credit', 'Debit/Credit'),
        ('multiple (cash+card), (cash+upi)', 'Multiple (Cash+Card), (Cash+UPI)')
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    service_charges = models.ManyToManyField(ServiceCharge, through='InvoiceServiceCharge')
    investigation_charges = models.ForeignKey(InvestigationCharge, on_delete=models.CASCADE, related_name='invoices')
    pharmacy_charges = models.ForeignKey(PharmacyCharge, on_delete=models.CASCADE, related_name='invoices')
    consultation_charges = models.ForeignKey(ConsultationCharge, on_delete=models.CASCADE, related_name='invoices')
    due_on_receipt = models.CharField(max_length=5, choices=STATUS_CHOICES)
    payment_method = models.CharField(max_length=40, choices=PAYMENT_CHOICES)
    notes = models.TextField(max_length=100)
    concession = models.DecimalField(max_digits=7, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)


class InvoiceServiceCharge(models.Model):
    invoice = models.ForeignKey('Invoice', on_delete=models.CASCADE, related_name='invoice_service_charges')
    service_charge = models.ForeignKey(ServiceCharge, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('invoice', 'service_charge')

