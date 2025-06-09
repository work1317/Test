from rest_framework import serializers
from patients.models import Patient
from rec_app.models import ProgressNote

# Create the serailizers over here

class PatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'patient_name', 'doctor', 'age',
            'appointment_type', 'notes', 'gender', 'phno', 'ward_no','diagnosis'
        ]
        extra_kwargs = {'phno': {'required': False}}


        
class PatientSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.d_name', read_only=True)
    status = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = '__all__'

    def get_status(self, obj):
        try:
            return obj.progress_notes.status
        except ProgressNote.DoesNotExist:
            return "Stable"

