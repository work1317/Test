# from django.db.models.signals import post_save, post_delete
# from django.dispatch import receiver
# from django.db.models import Sum
# from .models import PharmacyInvoiceItem, PharmacyInvoice, Notification
# from decimal import Decimal
# from notifications.models import Notification

 
 
# @receiver(post_delete, sender=PharmacyInvoiceItem)
# def update_invoice_paid_amount_on_delete(sender, instance, **kwargs):
#     invoice = instance.invoice
#     total = invoice.items.aggregate(total=Sum('final_amount'))['total'] or Decimal("0.00")
#     invoice.paid_amount = total
#     invoice.save(update_fields=['paid_amount'])

#     # Update or create sale notification with updated totals
#     _update_pharmacy_sale_notification(invoice)
 
 
# @receiver(post_save, sender=PharmacyInvoiceItem)
# def handle_invoice_item_save(sender, instance, created, **kwargs):
#     invoice = instance.invoice

#     total = invoice.items.aggregate(total=Sum('final_amount'))['total'] or Decimal("0.00")
#     invoice.paid_amount = total
#     invoice.save(update_fields=['paid_amount'])
#     if instance.discount_percentage >= 15:
#         Notification.objects.get_or_create(
#             pharmacy_invoice_item=instance,
#             defaults={
#                 "title": f"High Discount Alert for {instance.invoice.patient_name}",
#                 "message": (
#                     f"Discount of {instance.discount_percentage}% applied to "
#                     f"{instance.medication_name.medication_name} (Qty: {instance.quantity}) "
#                     f"in invoice {instance.invoice.Bill_No}. Please review and approve or reject."
#                 ),
#                 "status": "Pending"
#             }
#         )

#         _update_pharmacy_sale_notification(invoice)
 
 

# @receiver(post_save, sender=PharmacyInvoice)
# def _update_pharmacy_sale_notification(invoice):
#     """
#     Helper function to create or update the pharmacy sale notification
#     """
#     if invoice.items.exists() and invoice.paid_amount > 0:
#         title = f"Pharmacy Sale {invoice.Bill_No}"
#         message = (
#             f"Pharmacy sale {invoice.Bill_No} for Rs {invoice.paid_amount} has been completed "
#             f"for {invoice.patient_name}. Items: {invoice.items.count()}. Payment: {invoice.typeof_transaction}."
#         )

#         notification, created = Notification.objects.get_or_create(
#             title=title,
#             pharmacy_invoice_item__isnull=True,
#             defaults={
#                 "message": message,
#                 "status": "Pending"
#             }
#         )
#         if not created and notification.message != message:
#             notification.message = message
#             notification.save(update_fields=['message'])

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from .models import PharmacyInvoiceItem, PharmacyInvoice, Notification
from decimal import Decimal


@receiver(post_delete, sender=PharmacyInvoiceItem)
def update_invoice_paid_amount_on_delete(sender, instance, **kwargs):
    invoice = instance.invoice
    total = invoice.items.aggregate(total=Sum('final_amount'))['total'] or Decimal("0.00")
    invoice.paid_amount = total
    invoice.save(update_fields=['paid_amount'])

    # Update or create sale notification with updated totals
    _update_pharmacy_sale_notification(invoice)


@receiver(post_save, sender=PharmacyInvoiceItem)
def handle_invoice_item_save(sender, instance, created, **kwargs):
    invoice = instance.invoice

    total = invoice.items.aggregate(total=Sum('final_amount'))['total'] or Decimal("0.00")
    invoice.paid_amount = total
    invoice.save(update_fields=['paid_amount'])

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

    _update_pharmacy_sale_notification(invoice)  # moved outside the if block


@receiver(post_save, sender=PharmacyInvoice)
def handle_invoice_save(sender, instance, created, **kwargs):
    _update_pharmacy_sale_notification(instance)


def _update_pharmacy_sale_notification(invoice):
    """
    Helper function to create or update the pharmacy sale notification
    """
    if invoice.items.exists() and invoice.paid_amount > 0:
        title = f"Pharmacy Sale {invoice.Bill_No}"
        message = (
            f"Pharmacy sale {invoice.Bill_No} for Rs {invoice.paid_amount:.2f} has been completed "
            f"for {invoice.patient_name}. Items: {invoice.items.count()}. Payment: {invoice.typeof_transaction}."
        )

        notification, created = Notification.objects.get_or_create(
            title=title,
            pharmacy_invoice_item__isnull=True,
            defaults={
                "message": message,
                "status": "Pending"
            }
        )

        if not created and notification.message != message:
            notification.message = message
            notification.save(update_fields=['message'])
