from django.db.models.signals import post_save
from django.dispatch import receiver
from patients.models import Patient
from .models import Notification
from doctors.models import DoctorAvailability
from labs.models import LabInvoice
from pharmacy.models import Medication
from datetime import timedelta,datetime
from django.utils import timezone
from django.db import transaction
from invoice.models import Invoice,InvoiceServiceCharge
from django.apps import apps
from p_invoice.models import PharmacyInvoice

# Write the signals over here



@receiver(post_save, sender=Patient)
def create_notification_on_patient_save(sender, instance, created, **kwargs):
    print("Signal Triggered ")
    if created:
        Notification.objects.create(
            title="New Patient Registered",
            message=f"Patient with ID {instance.patient_id} and name {instance.patient_name} has been registered.",
            notification_type='patient',
            patient=instance
        )
    else:
        Notification.objects.create(
            title="Patient Updated",
            message=f"Patient with ID {instance.patient_id} and name {instance.patient_name} has been updated.",
            notification_type='patient',
            patient=instance
        )


@receiver(post_save, sender=LabInvoice)
def create_labinvoice_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            title="New Lab Invoice Created",
            message=(
                f"New invoice created for patient: {instance.patient.patient_name}, "
                f"Test: {instance.testname}, "
                f"Amount: ₹{instance.amount}"
            ),
            notification_type="lab_invoice",
            patient=instance.patient
        )

        
@receiver(post_save, sender=Medication)
def medication_notification(sender, instance, created, **kwargs):
    def notify_logic():
        today = timezone.now().date()
        expiry_threshold = today + timedelta(days=180)
 
        def create_if_not_exists(title, message, notif_type):
            if not Notification.objects.filter(notification_type=notif_type, medication=instance).exists():
                Notification.objects.create(
                    title=title,
                    message=message,
                    notification_type=notif_type,
                    medication=instance
                )
                return True
            return False
 
        sent = False
 
        expiry_date = instance.expiry_date
        if isinstance(expiry_date, str):
            expiry_date = datetime.strptime(expiry_date, "%Y-%m-%d").date()
 
        # 1. Expiry Alert
        if expiry_date and today <= expiry_date <= expiry_threshold:
            sent = create_if_not_exists(
                "Nearing Expiry Alert",
                f"{instance.medication_name} is nearing expiry on {expiry_date}.",
                "expiry"
            )
 
        # 2. Low Stock Alert
        threshold = 0.4 * instance.initial_stock if instance.initial_stock else None
        if not sent and threshold is not None and instance.stock_quantity is not None and instance.stock_quantity < threshold:
            sent = create_if_not_exists(
                "Low Stock Alert",
                f"{instance.medication_name} stock is below 40% of initial quantity.",
                "low_stock"
            )
 
        # 3. Stagnant Drug
        if not sent and instance.updated_at and instance.updated_at <= timezone.now() - timedelta(days=120):
            sent = create_if_not_exists(
                "Stagnant Drug Alert",
                f"{instance.medication_name} has not been updated for over 4 months.",
                "stagnant"
            )
 
        # 4. New Medication Added
        if not sent and created:
            create_if_not_exists(
                "New Medication Added",
                f"{instance.medication_name} has been added to inventory.",
                "medication_add"
            )
 
        # 5. Medication Updated
        if not created:
            Notification.objects.create(
                title="Medication Updated",
                message=f"{instance.medication_name} has been updated. Current stock: {instance.stock_quantity}",
                notification_type="medication_add",  # or define a new type if needed
                medication=instance
            )
 
    transaction.on_commit(notify_logic)


@receiver(post_save, sender=Invoice)
def create_invoice_notifications(sender, instance, created, **kwargs):
    if created:
        def notify():
            patient = instance.patient
            patient_name = patient.patient_name
            patient_id = patient.patient_id  # Use custom ID like 'P001'

            # Get attending doctor if any
            doctor = None
            if hasattr(patient, 'doctor_availabilities'):
                availability = patient.doctor_availabilities.first()
                if availability:
                    doctor = availability.doctor

            # 1. General Invoice Notification
            Notification.objects.create(
                title="New Invoice Generated",
                message=f"Invoice {instance.invoice_id} created for patient {patient_name} (ID: {patient_id})."
                        f"{' Attending doctor: ' + doctor.d_name if doctor else ''}",
                notification_type="invoice",
                patient=patient,
                doctor=doctor,
                invoice=instance
            )

            # 2. Service Charges
            for isc in instance.invoice_service_charges.all():
                Notification.objects.create(
                    title="Service Billed",
                    message=f"{isc.service_charge.service_name} billed for {isc.service_charge.days} days "
                            f"for patient {patient_name} (ID: {patient_id}). "
                            f"Amount: ₹{isc.service_charge.amount}",
                    notification_type="sales",
                    patient=patient,
                    invoice=instance
                )

            # 3. Consultation Charges
            cc = instance.consultation_charges
            Notification.objects.create(
                title="Consultation Billed",
                message=f"{cc.no_of_visits} visits at ₹{cc.amount_per_visit} per visit "
                        f"for patient {patient_name} (ID: {patient_id}).",
                notification_type="sales",
                patient=patient,
                invoice=instance
            )

            # 4. Lab Charges
            ic = instance.investigation_charges
            Notification.objects.create(
                title="Investigation Charges",
                message=f"Tests from {ic.from_date} to {ic.to_date} for patient {patient_name} (ID: {patient_id}). "
                        f"Amount: ₹{ic.amount}",
                notification_type="sales",
                patient=patient,
                invoice=instance
            )

            # 5. Pharmacy Charges
            pc = instance.pharmacy_charges
            Notification.objects.create(
                title="Pharmacy Charges",
                message=f"Medications from {pc.from_date} to {pc.to_date} for patient {patient_name} (ID: {patient_id}). "
                        f"Amount: ₹{pc.amount}",
                notification_type="sales",
                patient=patient,
                invoice=instance
            )


        transaction.on_commit(notify)

 
 
