from rest_framework import serializers
from .models import *
from .validators import validate_email

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    d_department = serializers.CharField()
    d_department_name = serializers.CharField(source="d_department.name", read_only=True)
    d_email = serializers.EmailField(
        max_length=255,
        validators=[validate_email], 
        error_messages={
            "invalid": ("Enter a valid email address ending with '.com'."),
            "max_length": ("Email cannot exceed 255 characters."),
            "blank": ("Email cannot be empty."),
        }
    )

    class Meta:
        model = DoctorAvailability
        fields = "__all__"

    def validate_d_department(self, value):
        """Convert department name to ID"""
        try:
            department = Department.objects.get(name=value)
        except Department.DoesNotExist:
            raise serializers.ValidationError("Department not found")
        return department  # Return department instance instead of name

    def create(self, validated_data):
        """Handle department instance conversion during creation"""
        validated_data["d_department"] = self.validate_d_department(validated_data["d_department"])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Handle department instance conversion during update"""
        if "d_department" in validated_data:
            validated_data["d_department"] = self.validate_d_department(validated_data["d_department"])
        return super().update(instance,validated_data)
    

class AvailableSlotsSerializer(serializers.Serializer):
    
    available_slots = serializers.ListField(child=serializers.TimeField(format='%H:%M'))
    doctor_name = serializers.CharField(source='doctor.d_name', read_only=True)
    class Meta:
        model = Appointment
        fields = ['id', 'patient_name', 'appointment_time','doctor_name']

   

   
    
   