from rest_framework import serializers
from .models import ProgressNote
from patients.models import Patient
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ValidationError as DjangoValidationError

class VitalsValidator(serializers.Serializer):
    patient = serializers.IntegerField(required=True, error_messages={
        "required": "Patient is a required field.",
        "invalid": "Invalid patient ID."
    })

    blood_pressure = serializers.CharField(required=True, allow_null=False, allow_blank=False, max_length=7, error_messages={
        "required": "Blood pressure is a required field.",
        "null": "Blood pressure cannot be null.",
        "blank": "Blood pressure cannot be empty.",
        "max_length": "Blood pressure cannot exceed 7 characters."
    })

    bmi = serializers.FloatField(required=True, error_messages={
        "required": "BMI is a required field.",
        "invalid": "Invalid BMI value."
    })

    grbs = serializers.CharField(required=True, allow_null=False, allow_blank=False, max_length=50, error_messages={
        "required": "GRBS is a required field.",
        "null": "GRBS cannot be null.",
        "blank": "GRBS cannot be empty.",
        "max_length": "GRBS cannot exceed 50 characters."
    })

    cvs = serializers.CharField(required=True, allow_null=False, allow_blank = False, max_length=50, error_messages={
        "required": "CVS is a required field.",
        "null": "CVS cannot be null.",
        "blank": "CVS cannot be empty.",
        "max_length": "CVS cannot exceed 50 characters."
    })

    cns = serializers.CharField(required=True, allow_null=False, allow_blank = False, max_length=50, error_messages={
        "required": "CNS is a required field.",
        "null": "CNS cannot be null.",
        "blank": "CNS cannot be empty.",
        "max_length": "CNS cannot exceed 50 characters."
    })

    respiratory_rate = serializers.IntegerField(required=True, error_messages={
        "required": "Respiratory rate is a required field.",
        "invalid": "Invalid respiratory rate value."
    })

    weight = serializers.FloatField(required=True, error_messages={
        "required": "Weight is a required field.",
        "invalid": "Invalid weight value."
    })

    height = serializers.FloatField(required=True, error_messages={
        "required": "Height is a required field.",
        "invalid": "Invalid height value."
    })


class PrescriptionValidator(serializers.Serializer):
    patient = serializers.IntegerField(required=True, error_messages={
        "required": "Patient is a required field.",
        "invalid": "Invalid patient ID."
    })

    medication_name = serializers.CharField(required=True, allow_null=False, allow_blank=False, max_length=100, error_messages={
        "required": "Medication name is a required field.",
        "null": "Medication name cannot be null.",
        "blank": "Medication name cannot be empty.",
        "max_length": "Medication name cannot exceed 100 characters."
    })

    dosage = serializers.CharField(required=True, max_length=50, error_messages={
        "required": "Dosage is a required field.",
        "max_length": "Dosage cannot exceed 50 characters."
    })

    frequency = serializers.CharField(required=True, max_length=50, error_messages={
        "required": "Frequency is a required field.",
        "max_length": "Frequency cannot exceed 50 characters."
    })

    duration = serializers.CharField(required=True, max_length=50, error_messages={
        "required": "Duration is a required field.",
        "max_length": "Duration cannot exceed 50 characters."
    })


class ServiceProcedureValidator(serializers.Serializer):
    patient = serializers.IntegerField(required=True, error_messages={
        "required": "Patient is a required field.",
        "invalid": "Invalid patient ID."
    })

    title = serializers.CharField(required=True, allow_null=False, allow_blank=False, max_length=100, error_messages={
        "required": "Procedure name is a required field.",
        "null": "Procedure name cannot be null.",
        "blank": "Procedure name cannot be empty.",
        "max_length": "Procedure name cannot exceed 100 characters."
    })



# Validators for Notes

# Nursing Notes
class NursingNotesValidator(serializers.Serializer):
    patient = serializers.CharField(max_length=50)
    description = serializers.CharField(
        required=True,
        error_messages={
            "required": "Description is a required field.",
            "blank": "Description cannot be empty.",
        }
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


# Progress Notes

class ProgressNoteValidator(serializers.Serializer):
    patient_id = serializers.CharField(max_length=20)
    status = serializers.ChoiceField(choices=ProgressNote.STATUS_CHOICES)

    def validate_patient_id(self, value):
        if not Patient.objects.filter(patient_id=value).exists():
            raise serializers.ValidationError("Invalid patient ID")
        return value


# Treatment Chart



class TreatmentChartValidator(serializers.Serializer):
    patient = serializers.CharField()
    medicines = serializers.ListField(
        child=serializers.DictField(), allow_empty=False
    )
    hrs_drops_mins = serializers.CharField(allow_null=True, allow_blank=True, required=False)

    def validate_medicines(self, medicines):
        for medicine in medicines:
            required_fields = ['medicine_name', 'dose', 'time', 'medicine_details']
            for field in required_fields:
                if field not in medicine or not medicine[field]:
                    raise serializers.ValidationError(f"{field} is required.")
        return medicines




# Pain Assessment

def validate_character_of_service(value):
    valid_choices = ['lacerating', 'burning', 'radiating']
    for item in value:
        if item not in valid_choices:
            raise serializers.ValidationError(f"Invalid choice: {item}. Valid choices: {valid_choices}")
    return value

def validate_factors_improving_experience(value):
    valid_choices = ['reset', 'medication']
    for item in value:
        if item not in valid_choices:
            raise serializers.ValidationError(f"Invalid choice: {item}. Valid choices: {valid_choices}")
    return value


# Initial Assessment
def validate_patient_id(self, value):
    if not Patient.objects.filter(patient_id=value).exists():
        raise serializers.ValidationError("Invalid patient ID")
    return value



# CarePlan Feedback

class CarePlanFeedbackValidator(serializers.Serializer):
    patient = serializers.CharField(max_length=50)

    feedback_on_services = serializers.CharField(
        required=True,
        error_messages={
            "required": "Feedback on Services is a required field.",
            "blank": "Feedback on Services cannot be empty.",
        }
    )

    provisional_feedback = serializers.CharField(
        required=True,
        error_messages={
            "required": "Provisional Feedback is a required field.",
            "blank": "Provisional Feedback cannot be empty.",
        }
    )

    feedback_plan = serializers.CharField(
        required=True,
        error_messages={
            "required": "Feedback Plan is a required field.",
            "blank": "Feedback Plan cannot be empty.",
        }
    )

    expected_outcome = serializers.CharField(
        required=True,
        error_messages={
            "required": "Expected Outcome of Feedback is a required field.",
            "blank": "Expected Outcome cannot be empty.",
        }
    )

    preventive_feedback_aspects = serializers.CharField(
        required=True,
        error_messages={
            "required": "Preventive Feedback Aspects is a required field.",
            "blank": "Preventive Feedback Aspects cannot be empty.",
        }
    )

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class CarePlanFeedbackUpdateValidator(serializers.Serializer):
    feedback_on_services = serializers.CharField(
        required=True,
        error_messages={
            "required": "Feedback on Services is a required field.",
            "blank": "Feedback on Services cannot be empty.",
        }
    )

    provisional_feedback = serializers.CharField(
        required=True,
        error_messages={
            "required": "Provisional Feedback is a required field.",
            "blank": "Provisional Feedback cannot be empty.",
        }
    )

    feedback_plan = serializers.CharField(
        required=True,
        error_messages={
            "required": "Feedback Plan is a required field.",
            "blank": "Feedback Plan cannot be empty.",
        }
    )

    expected_outcome = serializers.CharField(
        required=True,
        error_messages={
            "required": "Expected Outcome of Feedback is a required field.",
            "blank": "Expected Outcome cannot be empty.",
        }
    )

    preventive_feedback_aspects = serializers.CharField(
        required=True,
        error_messages={
            "required": "Preventive Feedback Aspects is a required field.",
            "blank": "Preventive Feedback Aspects cannot be empty.",
        }
    )

    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


# Risk Assessment

class RiskFactor1Validator:
    def validate_risk_data(self, data):
        if sum([data.get(field, False) for field in [
            'minor_surgery',
            'age_40_to_60_yrs',
            'pregnancy_or_post_martum',
            'varicose_veins',
            'inflammatory_bowel_disease',
            'obesity',
            'combined_oral_contraceptives_or_HRT',
        ]]) > 8:
            raise ValidationError("Invalid data. More than 6 selections are not allowed.")

class RiskFactor2Validator:
    def validate_risk_data(self, data):
        if sum([data.get(field, False) for field in [
            'age_over_60_yrs',
            'malignancy',
            'major_surgery',
            'immobilising_plaster_cast',
            'medical_or_surgical',
            'patients_confinedto_bed_72_hrs',
            'central_venous_access'
        ]]) > 8:
            raise ValidationError("Invalid data. More than 6 selections are not allowed.")


class RiskFactor3Validator:
    def validate_risk_data(self, data):
        if sum([data.get(field, False) for field in [
            'history_of_DVT_or_PE',
            'myocardial_infarction',
            'congestive_heart_failure',
            'severe_sepsis_or_infection',
            'factor_V_leiden_or_activated_protein_C_resistance',
            'antithrombin_III_deficiency',
            'proteins_C_and_S_deficiency',
            'dysfibrinogenemia',
            'homocysteinemia',
            'prothrombin_mutation_20210A',
            'lupus_anticoagulant',
            'antiphospholipid_antibodies',
            'myeloproliferative_disorders',
            'disordersof_plasminogen_and_plasminactivation',
            'heparin_included_thrombocytopenia',
            'hyperviscosity_syndromes',
        ]]) > 14:
            raise ValidationError("Invalid data. More than 13 selections are not allowed.")



class RiskFactor4Validator:
    def validate_risk_data(self, data):
        if sum([data.get(field, False) for field in [
            'elective_major_lower_extremity',
            'arthroplasty',
            'hip_pelvis_or_leg_fracture',
            'stroke',
            'multiple_trauma',
            'acute_spinal_cord_injury'
        ]]) > 7:
            raise ValidationError("Invalid data. More than 7 selections are not allowed.")



