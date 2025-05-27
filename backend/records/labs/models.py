from django.db import models
from django.contrib.auth import get_user_model
from patients.models import Patient
from datetime import date

# Create the models here

User = get_user_model()

class LabTest(models.Model):
    # Choices for priority level of the test
    class PriorityChoices(models.TextChoices):
        URGENT = 'Urgent', 'Urgent'    # High-priority test (e.g., life-threatening)
        NORMAL = 'Normal', 'Normal'    # Standard priority test

    # Choices for current status of the lab test
    class StatusChoices(models.TextChoices):
        PENDING = 'Pending', 'Pending'           # Test has been requested but not started
        INPROGRESS = 'InProgress', 'In Progress' # Test is being performed
        COMPLETED = 'Completed', 'Completed'     # Test and report generation is completed

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='lab_tests'
    )  # Link test to patient, to access patient_name and assigned doctor easily

    requested_test = models.CharField(
        max_length=100
    )  # Name of the test manually entered (e.g., "Blood Test")

    request_date = models.DateField(
        help_text="Date when test was requested"
    )  # Date manually entered when the test was requested

    priority = models.CharField(
        max_length=10,
        choices=PriorityChoices.choices,
        default=PriorityChoices.NORMAL
    )  # Dropdown to select test priority: Urgent or Normal

    status = models.CharField(
        max_length=15,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING
    )  # Dropdown to select test status: Pending, In Progress, Completed

    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Optional notes for additional information"
    )  # Text field for extra information or remarks about the test

    test_date = models.DateField(
        help_text="Date when test is performed"
    )  # Date entered manually when the test is actually performed

    test_time = models.TimeField(
        help_text="Time when test is performed"
    )  # Time automatically set in views (current time when saving)

    summary = models.TextField(
        blank=True,
        null=True,
        help_text="Summary or interpretation of test result"
    )  # Optional field for test result summary or interpretation

    test_type = models.CharField(
        max_length=100,
        help_text="Category/type of test (e.g., Hematology, Radiology)"
    )  # CharField for categorizing the test type

    upload = models.FileField(
        upload_to='labtest_uploads/',
        blank=True,
        null=True,
        help_text="Single file upload for test report or images"
    )  # File upload field to attach one file (PDF/image etc.)

    flag = models.BooleanField(
        default=False,
        help_text="Boolean flag for internal logic (e.g., mark for review)"
    )  # Boolean flag used internally for marking the test (review/alert etc.)

    request_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requested_tests',
        help_text="User who requested the test (taken from login credentials)"
    ) # FK to User model to capture who requested this test automatically

    def __str__(self):
        return f"LabTest for {self.patient.patient_name} - {self.test_type}"


class LabInvoice(models.Model):

    class StatusChoices(models.TextChoices):
        PENDING = 'Pending', 'Pending'
        INPROGRESS = 'InProgress', 'In Progress'
        COMPLETED = 'Completed', 'Completed'

    patient = models.ForeignKey(
    Patient,
    on_delete=models.CASCADE,
    related_name='invoices',
    help_text="Select a patient that exists in the Patient database"
    )

    testname = models.CharField(
        max_length=100,
        help_text="Enter the test name (e.g., Blood Test)"
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Amount charged for the test"
    )

    status = models.CharField(
        max_length=15,
        choices=StatusChoices.choices,
        default=StatusChoices.PENDING,
        help_text="Current status of the invoice"
    )

    date = models.DateField(
        default=date.today,
        help_text="Date of invoice creation"
    )

    def __str__(self):
        return f"Invoice for {self.patient.patient_name} - {self.testname}"

    # def clean(self):
    #     # Ensures patient exists (though ForeignKey already enforces this at DB level)
    #     if not self.patient:
    #         raise ValidationError(_("Patient must be selected and must exist in the database."))

