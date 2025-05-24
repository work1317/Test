from rest_framework import serializers
from .models import Appointment

# create your appointments serializers here

class AppointmentSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    patient_name = serializers.CharField(source='patient.patient_name', read_only=True)
 
    doctor_id = serializers.CharField(source='doctor.d_id', read_only=True)
    doctor_name = serializers.CharField(source='doctor.d_name', read_only=True)
    department = serializers.CharField(source='doctor.d_department.name', read_only=True)
 
    class Meta:
        model = Appointment
        fields = [
            'appointment_id', 'patient_id', 'patient_name',
            'doctor_id', 'doctor_name', 'department',
            'date', 'time', 'age', 'appointment_type',
            'notes', 'gender', 'phno', 'email',
            'blood_group', 'created_at'
        ]
 
 