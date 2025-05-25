from django.db.models.signals import post_save
from django.dispatch import receiver
from patients.models import Patient
from .models import Notification
from doctors.models import DoctorAvailability

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
            message=f"Doctor {instance.d_name} has been added.",
            doctor = instance
        )
 