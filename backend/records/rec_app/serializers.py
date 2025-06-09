from rest_framework import serializers
from .models import Vitals,Prescription,ServiceProcedure
from patients.models import Patient
from doctors.models import DoctorAvailability
from .models import NursingNotes,ProgressNote,TreatmentChart, PainAssessment,InitialAssessment,CarePlanFeedback,RiskFactor1,RiskFactor2,RiskFactor3,RiskFactor4
from .validators import validate_character_of_service,validate_factors_improving_experience,RiskFactor1Validator,RiskFactor2Validator,RiskFactor3Validator,RiskFactor4Validator


# serializers for Adding Records

class VitalsSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False) 
    doctor_name = serializers.CharField(source='patient.doctor.d_name', read_only=True)

    class Meta:
        model = Vitals
        fields = ['patient', 'doctor_name','blood_pressure', 'bmi', 'grbs','cns','cvs', 'respiratory_rate', 'weight', 'height','category','summary','report','created_at','last_updated_at']


class PrescriptionSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False) 
    doctor_name = serializers.CharField(source='patient.doctor.d_name', read_only=True)
    class Meta:
        model = Prescription
        fields = ['patient','doctor_name','medication_name','dosage','quantity','status','duration','category','summary','report','created_at','last_updated_at']

class ServiceProcedureSerializer(serializers.ModelSerializer):
    patient = serializers.PrimaryKeyRelatedField(queryset=Patient.objects.all(), required=False) 
    doctor_name = serializers.CharField(source='patient.doctor.d_name', read_only=True)
    class Meta:
        model = ServiceProcedure
        fields = ['patient','doctor_name','title','category','summary','report','created_at','last_updated_at']

def get_serializer_class(record_type):
    serializer_mapping = {
        "vitals": VitalsSerializer,
        "prescription":PrescriptionSerializer,
        "serviceprocedure":ServiceProcedureSerializer
    }
    return serializer_mapping.get(record_type)


# serializers for adding note


# Nursing Notes
class NursingNotesSerializer(serializers.ModelSerializer):
    patient = serializers.CharField(source='patient.patient_id')
    nurse = serializers.CharField(source = 'nurse.username')

    class Meta:
        model = NursingNotes
        fields = '__all__'


# Progress Notes

class ProgressNoteSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', write_only=True)

    class Meta:
        model = ProgressNote
        fields = ['patient_id', 'status', 'created_at', 'updated_at', 'patient']
        extra_kwargs = {
            'patient': {'write_only': True}
        }

# Treatment Chart

class TreatmentChartSerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentChart
        fields = '__all__'
 
    def validate(self, data):
        """Custom validation for required fields"""
        required_fields = ['medicine_name', 'dose', 'time', 'medicine_details']
        for field in required_fields:
            if field not in data or not data[field]:
                raise serializers.ValidationError(f"{field} is required.")
        return data
 
class BulkTreatmentChartSerializer(serializers.Serializer):
    medicines = TreatmentChartSerializer(many=True)
 
    def create(self, validated_data):
        medicines_data = validated_data['medicines']
        treatment_records = [TreatmentChart(**medicine) for medicine in medicines_data]
        return TreatmentChart.objects.bulk_create(treatment_records)


# Pain Assessment

class PainAssessmentSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', write_only=True)
    character_of_service = serializers.ListField(
        child=serializers.CharField(), validators=[validate_character_of_service]
    )
    factors_improving_experience = serializers.ListField(
        child=serializers.CharField(), validators=[validate_factors_improving_experience]
    )

    class Meta:
        model = PainAssessment
        fields = [
            'patient_id', 'pain_intensity', 'location_of_service', 
            'quality_of_service', 'character_of_service', 
            'factors_affecting_rating', 'factors_improving_experience',
            'created_at', 'updated_at', 'patient'
        ]
        extra_kwargs = {
            'patient': {'write_only': True},
        }

    def create(self, validated_data):
        patient = validated_data.pop('patient')
        return PainAssessment.objects.create(patient=patient, **validated_data)

    def update(self, instance, validated_data):
        if 'patient' in validated_data:
            patient_id = validated_data.pop('patient')
            instance.patient = Patient.objects.get(patient_id=patient_id)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

# Initial Assessment
class InitialAssessmentSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', write_only=True)

    class Meta:
        model = InitialAssessment
        fields = ['patient_id', 'rating_title', 'relationship_to_feedback', 'duration_of_experience','present_illness','past_illness','experience_feedback','health_feedback','heart_feedback','stroke_feedback','other_feedback', 'patient','created_at']
        extra_kwargs = {
            'patient': {'write_only': True}
        }

# Careplan Feedback

class CarePlanFeedbackSerializer(serializers.ModelSerializer):
    patient = serializers.CharField(source='patient.patient_id')
    class Meta:
        model = CarePlanFeedback
        fields = '__all__'


# Risk Assessment

# Common function to calculate total_score
def calculate_total_score(data, boolean_fields):
    return sum(data.get(field, False) for field in boolean_fields)

# RiskFactor1 Serializer
class RiskFactor1Serializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    minor_surgery = serializers.BooleanField(required=False)
    age_40_to_60_yrs = serializers.BooleanField(required=False)
    pregnancy_or_post_martum = serializers.BooleanField(required=False)
    varicose_veins = serializers.BooleanField(required=False)
    inflammatory_bowel_disease = serializers.BooleanField(required=False)
    obesity = serializers.BooleanField(required=False)
    combined_oral_contraceptives_or_HRT = serializers.BooleanField(required=False)
    total_score = serializers.SerializerMethodField()


    class Meta:
        model = RiskFactor1
        fields = '__all__'

        extra_kwargs = {
            'patient': {'write_only': True}
        }

    def get_total_score(self, obj):
        boolean_fields = ['minor_surgery', 'age_40_to_60_yrs', 'pregnancy_or_post_martum', 'varicose_veins', 'inflammatory_bowel_disease', 'obesity','combined_oral_contraceptives_or_HRT']
        data = {field: getattr(obj, field) for field in boolean_fields}
        return calculate_total_score(data, boolean_fields)


# RiskFactor2 Serializer
class RiskFactor2Serializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    age_over_60_yrs = serializers.BooleanField(required=False)
    malignancy = serializers.BooleanField(required=False)
    major_surgery = serializers.BooleanField(required=False)
    immobilising_plaster_cast = serializers.BooleanField(required=False)
    medical_or_surgical = serializers.BooleanField(required=False)
    patients_confinedto_bed_72_hrs = serializers.BooleanField(required=False)
    central_venous_access = serializers.BooleanField(required=False)
    total_score = serializers.SerializerMethodField()

    class Meta:
        model = RiskFactor2
        fields = '__all__'

        extra_kwargs = {
            'patient': {'write_only': True}
        }

    def get_total_score(self, obj):
        boolean_fields = ['age_over_60_yrs', 'malignancy', 'major_surgery', 'immobilising_plaster_cast', 'medical_or_surgical', 'patients_confinedto_bed_72_hrs','central_venous_access']
        data = {field: getattr(obj, field) for field in boolean_fields}
        total_score = sum(2 for field in boolean_fields if data.get(field, False))
        return total_score


# RiskFactor3 Serializer
class RiskFactor3Serializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    history_of_DVT_or_PE = serializers.BooleanField(required=False)
    myocardial_infarction = serializers.BooleanField(required=False)
    congestive_heart_failure = serializers.BooleanField(required=False)
    severe_sepsis_or_infection = serializers.BooleanField(required=False)
    factor_V_leiden_or_activated_protein_C_resistance = serializers.BooleanField(required=False)
    antithrombin_III_deficiency = serializers.BooleanField(required=False)
    proteins_C_and_S_deficiency = serializers.BooleanField(required=False)
    dysfibrinogenemia = serializers.BooleanField(required=False)
    homocysteinemia = serializers.BooleanField(required=False)
    prothrombin_mutation_20210A = serializers.BooleanField(required=False)
    lupus_anticoagulant = serializers.BooleanField(required=False)
    antiphospholipid_antibodies = serializers.BooleanField(required=False)
    myeloproliferative_disorders = serializers.BooleanField(required=False)
    disordersof_plasminogen_and_plasminactivation = serializers.BooleanField(required=False)
    heparin_included_thrombocytopenia = serializers.BooleanField(required=False)
    hyperviscosity_syndromes= serializers.BooleanField(required=False)
    total_score = serializers.SerializerMethodField()

    class Meta:
        model = RiskFactor3
        fields = '__all__'

        extra_kwargs = {
            'patient': {'write_only': True}
        }

    def get_total_score(self, obj):
        boolean_fields = ['history_of_DVT_or_PE', 'myocardial_infarction', 'congestive_heart_failure',
                           'severe_sepsis_or_infection', 'factor_V_leiden_or_activated_protein_C_resistance',
                           'antithrombin_III_deficiency', 'proteins_C_and_S_deficiency', 'dysfibrinogenemia',
                           'homocysteinemia', 'prothrombin_mutation_20210A', 'lupus_anticoagulant', 'antiphospholipid_antibodies','myeloproliferative_disorders','disordersof_plasminogen_and_plasminactivation','heparin_included_thrombocytopenia','hyperviscosity_syndromes']
        data = {field: getattr(obj, field) for field in boolean_fields}
        total_score = sum(3 for field in boolean_fields if data.get(field, False))
        return total_score


# RiskFactor4 Serializer
class RiskFactor4Serializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    elective_major_lower = serializers.BooleanField(required=False)
    extremity = serializers.BooleanField(required=False)
    arthroplasty = serializers.BooleanField(required=False)
    hip_pelvis_or_leg_fracture = serializers.BooleanField(required=False)
    stroke = serializers.BooleanField(required=False)
    multiple_trauma = serializers.BooleanField(required=False)
    acute_spinal_cord_injury = serializers.BooleanField(required=False)
    total_score = serializers.SerializerMethodField()

    class Meta:
        model = RiskFactor4
        fields = '__all__'

        extra_kwargs = {
            'patient': {'write_only': True}
        }

    def get_total_score(self, obj):
        boolean_fields = ['elective_major_lower_extremity', 'arthroplasty', 'hip_pelvis_or_leg_fracture',
                           'stroke', 'multiple_trauma', 'acute_spinal_cord_injury']
        data = {field: getattr(obj, field) for field in boolean_fields}
        total_score = sum(5 for field in boolean_fields if data.get(field, False))
        return total_score



