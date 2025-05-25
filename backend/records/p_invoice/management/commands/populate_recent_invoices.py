from django.core.management.base import BaseCommand
from p_invoice.models import PharmacyInvoice, RecentInvoice

class Command(BaseCommand):
    help = 'Populate or update RecentInvoice from existing PharmacyInvoice records'

    def handle(self, *args, **kwargs):
        invoices = PharmacyInvoice.objects.all()
        created, updated = 0, 0

        for invoice in invoices:
            items = invoice.items.all()
            if not items.exists():
                continue

            total_amount = sum(item.amount for item in items)
            total_discount = sum(item.discount_amount for item in items)
            after_discount = total_amount - total_discount
            net_amount = sum(item.final_amount for item in items)

            obj, is_created = RecentInvoice.objects.update_or_create(
                Bill_No=invoice.Bill_No,
                defaults={
                    'Bill_Date': invoice.Bill_Date,
                    'appointment_type': invoice.appointment_type,
                    'typeof_transaction': invoice.typeof_transaction,
                    'Name': invoice.Patient_name,
                    'Amount': total_amount,
                    'AfterDiscount': after_discount,
                    'DiscountAmt': total_discount,
                    'Net_amount': net_amount,
                }
            )
            if is_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(self.style.SUCCESS(
            f"{created} RecentInvoices created, {updated} updated."
        ))

        
