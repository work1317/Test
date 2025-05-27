# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from patients.models import Patient
# from .models import Notification
# from doctors.models import DoctorAvailability

# @receiver(post_save, sender=Patient)
# def create_notification_on_patient_save(sender, instance, created, **kwargs):
#     print("Signal Triggered ")
#     if created:
#         Notification.objects.create(
#             title="New Patient Registered",
#             message=f"Patient with ID {instance.patient_id} and name {instance.patient_name} has been registered."
#         )
#     else:
#         Notification.objects.create(
#             title="Patient Updated",
#             message=f"Patient with ID {instance.patient_id} and name {instance.patient_name} has been updated."
#         )

# @receiver(post_save, sender = DoctorAvailability)
# def create_notification_on_doctor_save(sender, instance, created, **kwargs):
#     print("Doctor Signal Triggered ")
#     if created:
#         Notification.objects.create(
#             title="New Doctor Added",
#             message=f"Doctor {instance.d_name} has been added.",
#             doctor = instance
#         )
 
from django.db.models.signals import post_save
from django.dispatch import receiver
from patients.models import Patient
from .models import Notification
from doctors.models import DoctorAvailability
from django.apps import apps
from p_invoice.models import PharmacyInvoice


@receiver(post_save, sender=Patient)
def create_notification_on_patient_save(sender, instance, created, **kwargs):
    print("Signal Triggered ")
    if created:
        Notification.objects.create(
            title="New Patient Registered",
            message=f"Patient with ID {instance.patient_id} and name {instance.patient_name} has been registered."
        )
    else:
        Notification.objects.create(
            title="Patient Updated",
            message=f"Patient with ID {instance.patient_id} and name {instance.patient_name} has been updated."
        )
 
@receiver(post_save, sender = DoctorAvailability)
def create_notification_on_doctor_save(sender, instance, created, **kwargs):
    print("Doctor Signal Triggered ")
    if created:
        Notification.objects.create(
            title="New Doctor Added",
            message=f"Doctor {instance.doctor_name} has been added.",
            doctor = instance
        )
 
 
@receiver(post_save, sender=apps.get_model('p_invoice','PharmacyInvoiceItem'))
def create_discount_notification(sender, instance, created, **kwargs):
    if instance.discount_percentage > 15:
        # Avoid duplicate notification for the same item while still pending
        if not Notification.objects.filter(pharmacy_invoice_item=instance, status='Pending').exists():
            Notification.objects.create(
                title="High Discount Alert",
                message=(
                    f"Invoice Item '{instance.medication_name.medication_name}' has a discount of "
                    f"{instance.discount_percentage}%. Please review and approve/reject."
                ),
                pharmacy_invoice_item=instance,
                status="Pending"
            )
 

 
 
