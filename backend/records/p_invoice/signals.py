from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PharmacyInvoiceItem, Notification
from django.db.models.signals import post_delete
from django.db.models import Sum
from .models import PharmacyInvoiceItem, PharmacyInvoice
from decimal import Decimal

 
 
@receiver(post_delete, sender=PharmacyInvoiceItem)
def update_invoice_paid_amount_on_delete(sender, instance, **kwargs):
    invoice = instance.invoice
    total = invoice.items.aggregate(total=Sum('final_amount'))['total'] or Decimal("0.00")
    invoice.paid_amount = total
    invoice.save(update_fields=['paid_amount'])
 
 
@receiver(post_save, sender=PharmacyInvoiceItem)
def create_high_discount_notification(sender, instance, created, **kwargs):
    if instance.discount_percentage >= 15:
        Notification.objects.get_or_create(
            pharmacy_invoice_item=instance,
            defaults={
                "title": f"High Discount Alert for {instance.invoice.patient_name}",
                "message": (
                    f"Discount of {instance.discount_percentage}% applied to "
                    f"{instance.medication_name.medication_name} (Qty: {instance.quantity}) "
                    f"in invoice {instance.invoice.Bill_No}. Please review and approve or reject."
                ),
                "status": "Pending"
            }
        )
 
 

@receiver(post_save, sender=PharmacyInvoice)
def create_invoice_notification(sender, instance, created, **kwargs):
    if created:
        medication_count = instance.items.count()
        Notification.objects.create(
            title=f"Pharmacy Sale {instance.Bill_No}",
            message=(
                f"Pharmacy sale {instance.Bill_No} for Rs {instance.paid_amount} has been completed "
                f"for {instance.patient_name}. Items: {medication_count}. Payment: {instance.typeof_transaction}."
            )
            # No pharmacy_invoice_item, no status — this is a general notification
        )
