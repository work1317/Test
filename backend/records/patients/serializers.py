from rest_framework import serializers
from patients.models import Patient

# Create the serailizers over here

class PatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'patient_name', 'doctor_name', 'date', 'time', 'age',
            'appointment_type', 'notes', 'gender', 'phno', 'ward_no','diagnosis'
        ]
        extra_kwargs = {'phno': {'required': False}}


        
class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = '__all__'

