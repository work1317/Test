import re
from rest_framework import serializers
from django.core.validators import RegexValidator,MinLengthValidator,MaxLengthValidator,EmailValidator

# create your patients serializers here

phone_no_validator=[
    MinLengthValidator(10, message = "Phone number must be 10 digits."),
    MaxLengthValidator(10,message="Phone number must be 10 digits."),
    RegexValidator(regex='^[0-9]*$', message="Phone number must contain only digits.")
]

def email_com_validator(value):
    """Custom validator to allow only .com emails"""
    if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$", value):
        raise serializers.ValidationError("Only emails with .com domains are allowed.")


class PatientValidator(serializers.Serializer):
    patient_name = serializers.CharField(max_length=100)
    # doctor = serializers.CharField(
    #     max_length=100, 
    #     required=True, 
    #     allow_blank=False, 
    #     error_messages={
    #         "required": "Doctor name is a required field.",
    #         "blank": "Doctor name cannot be empty.",
    #         "max_length": "Doctor name cannot exceed 100 characters."
    #     }
    # )
    date = serializers.DateField()
    time = serializers.TimeField()
    age = serializers.IntegerField()
    appointment_type = serializers.CharField(max_length=20)
    gender = serializers.CharField(max_length=20)
    phno = serializers.CharField(
        max_length=10,
        validators=phone_no_validator,
        error_messages={
            "required": "Phone number is a required field.",
            "max_length": "Phone number cannot exceed 10 digits.",
            "blank": "Phone number cannot be empty."
        }
    )
    email = serializers.EmailField(
        required=True,
        validators=[EmailValidator(message="Invalid email format"), email_com_validator],
        error_messages={
            "required": "Email is a required field.",
            "blank": "Email cannot be empty.",
            "invalid": "Enter a valid email address."
        }
    )

    BLOOD_GROUP_CHOICES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    blood_group = serializers.ChoiceField(
        choices=BLOOD_GROUP_CHOICES,
        required=True,
        error_messages={
            "required": "Blood group is required.",
            "invalid_choice": "Invalid blood group. Choose from A+, A-, B+, B-, AB+, AB-, O+, O-."
        }
    )

    notes = serializers.CharField(required=False, allow_blank=True)
    ward_no = serializers.CharField(max_length=10,required=False,allow_blank=True,error_messages=
        {
            "max_length": "Ward number cannot exceed 5 characters."
        }
    )

    diagnosis = serializers.CharField(max_length=255,required=False,allow_blank=True,error_messages=
        {
            "max_length": "Diagnosis cannot exceed 255 characters."
        }
    )


class NotificationValidator(serializers.Serializer):
    patient_id = serializers.IntegerField()
    message = serializers.CharField(max_length = 255)