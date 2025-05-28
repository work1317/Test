
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from decimal import Decimal
from .models import PharmacyInvoiceItem, PharmacyInvoice


@receiver(post_delete, sender=PharmacyInvoiceItem)
def update_invoice_paid_amount_on_delete(sender, instance, **kwargs):
    invoice = instance.invoice
    total = invoice.items.aggregate(total=Sum('final_amount'))['total'] or Decimal("0.00")
    invoice.paid_amount = total
    invoice.save(update_fields=['paid_amount'])


@receiver(post_save, sender=PharmacyInvoiceItem)
def handle_invoice_item_save(sender, instance, created, **kwargs):
    invoice = instance.invoice
    total = invoice.items.aggregate(total=Sum('final_amount'))['total'] or Decimal("0.00")
    invoice.paid_amount = total
    invoice.save(update_fields=['paid_amount'])


@receiver(post_save, sender=PharmacyInvoice)
def handle_invoice_save(sender, instance, created, **kwargs):
    """
    Optional: Trigger additional logic when an invoice is saved.
    Currently left empty since there's no Notification logic required.
    """
    pass


