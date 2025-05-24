from rest_framework import serializers
from .models import Appointment
from patients import models

# create your appointments validators here

class AppointmentValidator(serializers.Serializer):
    patient_name = serializers.CharField()
    doctor = serializers.CharField()
    date = serializers.DateField()
    time = serializers.TimeField()
    age = serializers.IntegerField()
    appointment_type = serializers.ChoiceField(choices=Appointment.AppointmentStatus.choices)
    notes = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.ChoiceField(choices=Appointment.GenderStatus.choices)
    phno = serializers.CharField()
    email = serializers.EmailField()
    blood_group = serializers.ChoiceField(choices=Appointment.BloodGroupChoices.choices, required=False)
