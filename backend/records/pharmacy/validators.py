from rest_framework import serializers
from .models import AddSupplier,AddNewTransaction
from django.core.validators import RegexValidator,MinLengthValidator,MaxLengthValidator,EmailValidator
import re
from .models import Medication
from datetime import date

# Create the validators here

class MedicationValidator(serializers.Serializer):
    medication_name = serializers.CharField(required=True, allow_blank=False, max_length=100, error_messages={
        "required": "Medication name is required.",
        "blank": "Medication name cannot be blank.",
    })
    category = serializers.CharField(required=True, allow_blank=False, max_length=100, error_messages={
        "required": "Category is required.",
        "blank": "Category cannot be blank.",
    })
    manufacturer = serializers.CharField(required=True, allow_blank=False, max_length=100, error_messages={
        "required": "Manufacturer is required.",
        "blank": "Manufacturer cannot be blank.",
    })
    strength = serializers.CharField(required=True, allow_blank=False, max_length=50, error_messages={
        "required": "Strength is required.",
        "blank": "Strength cannot be blank.",
    })

    stock_quantity = serializers.IntegerField(required=False, allow_null=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    mrp = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    expiry_date = serializers.DateField(required=False, allow_null=True,default=None)
    description = serializers.CharField(required=False, allow_blank=True)
    batch_no = serializers.CharField(required=False, allow_blank=True, max_length=50) 

    def validate(self, data):
        """
        Custom validation to check if a medication with the same medication_name and batch_no already exists.
        """
        medication_name = data.get("medication_name")
        batch_no = data.get("batch_no")
       
        # Check if both medication_name and batch_no are provided
        if medication_name and batch_no:
            # Query the database to see if there's an existing Medication with the same name and batch_no
            existing_medication = Medication.objects.filter(medication_name=medication_name, batch_no=batch_no).exists()
           
            if existing_medication:
                raise serializers.ValidationError(
                    f"A medication with the name '{medication_name}' and batch number '{batch_no}' already exists."
                )
       
        return data
     
    def validate(self, data):
        """
        Custom validation:
        1. Prevent duplicate medication_name + batch_no.
        2. expiry_date should be today or in the future.
        """
        medication_name = data.get("medication_name")
        batch_no = data.get("batch_no")
        expiry_date = data.get("expiry_date")
 
        #  1. Check for duplicate medication + batch_no
        if medication_name and batch_no:
            existing_medication = Medication.objects.filter(
                medication_name=medication_name,
                batch_no=batch_no
            ).exists()
            if existing_medication:
                raise serializers.ValidationError(
                    f"A medication with the name '{medication_name}' and batch number '{batch_no}' already exists."
                )
       
        #  2. Validate expiry_date is not in the past
        if expiry_date and expiry_date < date.today():
            raise serializers.ValidationError(
                {"expiry_date": "Expiry date cannot be in the past."}
            )
 
        return data

phone_no_validator=[
    MinLengthValidator(10, message = "Phone number must be 10 digits."),
    MaxLengthValidator(10,message="Phone number must be 10 digits."),
    RegexValidator(regex='^[0-9]*$', message="Phone number must contain only digits.")
]
 
def email_com_validator(value):
    """Custom validator to allow only .com emails"""
    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$", value):
        raise serializers.ValidationError("Only emails with .com domains are allowed.")
 
class AddSupplierValidator(serializers.Serializer):
    name = serializers.CharField(required=True, max_length=255, error_messages={
        "required": "Supplier name is required.",
        "max_length": "Name cannot exceed 255 characters."
    })
    email = serializers.EmailField(required=True, validators=[EmailValidator(message="Invalid email format"), email_com_validator],error_messages={
        "required": "Email is required.",
        "invalid": "Enter a valid email address."
    })
    phone = serializers.CharField(required=True, validators=phone_no_validator,max_length=15, error_messages={
        "required": "Phone number is required.",
        "max_length": "Phone number cannot exceed 15 characters."
    })
    products = serializers.CharField(required=True, max_length=250, error_messages={
        "required": "Products are required.",
        "max_length": "Products list cannot exceed 250 characters."
    })
 

class AddNewTransactionValidator(serializers.Serializer):
    date = serializers.DateField(required=True, error_messages={
        "required": "Transaction date is required.",
        "invalid": "Enter a valid date.",
    })
    description = serializers.CharField(required=True, allow_blank=False, error_messages={
        "required": "Description is required.",
        "blank": "Description cannot be blank.",
    })
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True, error_messages={
        "required": "Amount is required.",
        "invalid": "Enter a valid amount.",
    })
    transaction_type = serializers.ChoiceField(choices=AddNewTransaction.TransactionType.choices, required=True, error_messages={
        "required": "Transaction type is required.",
        "invalid_choice": "Select a valid transaction type (debit or credit).",
    })
    payment_mode = serializers.ChoiceField(choices=AddNewTransaction.PaymentMode.choices, required=True, error_messages={
        "required": "Payment mode is required.",
        "invalid_choice": "Select a valid payment mode.",
    })
    due_date = serializers.DateField(required=False, allow_null=True, error_messages={
        "invalid": "Enter a valid due date.",
    })
    due_date_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True, error_messages={
        "invalid": "Enter a valid due date amount.",
    })
    supplier = serializers.PrimaryKeyRelatedField(queryset=AddSupplier.objects.all(), required=True, error_messages={
        "required": "Supplier is required.",
        "does_not_exist": "Supplier does not exist.",
    })
     #  Custom validator for 'date'
    def validate_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Transaction date cannot be in the past.")
        return value
 
    #  Custom validator for 'due_date'
    def validate_due_date(self, value):
        if value is not None and value < date.today():
            raise serializers.ValidationError("Due date cannot be in the past.")
        return value




