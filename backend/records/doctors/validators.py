from django.core.validators import EmailValidator,RegexValidator
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
import re
from .models import DoctorAvailability

class SpecialityValidator(serializers.Serializer):
    name=serializers.CharField(max_length=100,error_messages={
            "unique": _("Doctor ID must be unique."),
            "max_length": _("Doctor ID cannot exceed 10 characters."),
            "null": _("Doctor ID cannot be null."),
            "blank": _("Doctor ID cannot be empty."),
        }
    )

def validate_email(value):
        """Ensure email follows the standard format and ends with .com."""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$'
        
        if not re.match(email_pattern, value):
            raise ValidationError(_("Enter a valid email address ending with '.com'"))
        if DoctorAvailability.objects.filter(d_email=value).exists():
            raise ValidationError(_("A doctor with this email is already registered."))    


class DoctorValidators(serializers.Serializer):
    d_id = serializers.CharField(
        max_length=10, error_messages={
            "unique": _("Doctor ID must be unique."),
            "max_length": _("Doctor ID cannot exceed 10 characters."),
            "null": _("Doctor ID cannot be null."),
            "blank": _("Doctor ID cannot be empty."),
        }
    )

    d_name = serializers.CharField(
        max_length=255, error_messages={
            "max_length": _("Doctor name cannot exceed 255 characters."),
            "blank": _("Doctor name cannot be empty."),
        }
    )

    d_department = serializers.IntegerField(required=True,error_messages={
        "required":_("d_department is required.")
    })

    d_phn_no = serializers.CharField(
        max_length=10, validators=[RegexValidator(r'^\d{10}$', message=_("Phone number must be exactly 10 digits."))], 
        error_messages={
            "unique": _("Phone number must be unique."),
            "max_length": _("Phone number cannot exceed 10 characters."),
            "blank": _("Phone number cannot be empty."),
        }
    )

    
    d_email = serializers.EmailField(
        max_length=255,validators= [validate_email],
        error_messages={
            "invalid": _("Enter a valid email address."),  
            "max_length": _("Email cannot exceed 255 characters."),
            "blank": _("Email cannot be empty."),
        })

    d_ward_no = serializers.CharField(
        max_length=200, error_messages={
            "max_length": _("Ward number cannot exceed 200 characters."),
            "blank": _("Ward number cannot be empty."),
        }
    )

    d_available_days = serializers.JSONField(
        default=list, error_messages={
            "invalid": _("Available days must be in JSON format."),
        }
    )

    d_start_time = serializers.TimeField(
        error_messages={
            "invalid": _("Invalid start time format."),
            "blank": _("Start time cannot be empty."),
        }
    )

    d_end_time = serializers.TimeField(
        error_messages={
            "invalid": _("Invalid end time format."),
            "blank": _("End time cannot be empty."),
        }
    )

    d_education_info = serializers.CharField(
        max_length=200, error_messages={
            "max_length": _("Education information cannot exceed 200 characters."),
        }
    )

    d_certifications = serializers.CharField(
        max_length=200, error_messages={
            "max_length": _("Certifications cannot exceed 200 characters."),
        }
    )