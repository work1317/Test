from rest_framework import serializers
from .models import  LabTest,LabInvoice
from patients.models import Patient
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

# Create the Seralizers over here

class LabTestSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.patient_name', read_only=True)
    doctor_name = serializers.CharField(source='patient.doctor.d_name', read_only=True)
    user_id = serializers.IntegerField(source='request_by.id', read_only=True)
    user_name = serializers.CharField(source='request_by.username', read_only=True)

    class Meta:
        model = LabTest
        fields = [
            'id', 'patient', 'patient_name',
            'doctor_name',
            'user_id', 'user_name',
            'requested_test', 'request_date', 'priority', 'status',
            'notes', 'test_date', 'test_time', 'summary',
            'test_type', 'flag', 'upload'
        ]
        read_only_fields = [
            'patient_name', 'doctor_name', 'user_id',
            'user_name', 'test_time'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['request_by'] = user

        import datetime
        validated_data['test_time'] = datetime.datetime.now().time()

        return super().create(validated_data)
    
    def validate(self, attrs):
        instance = LabTest(**attrs)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise DRFValidationError(e.message_dict)
        return attrs

# class LabInvoiceSerializer(serializers.ModelSerializer):
#     # Override patient field to show patient_name instead of ID
#     patient = serializers.CharField(source='patient.patient_name', read_only=True)

#     class Meta:
#         model = LabInvoice
#         fields = '__all__'

#     def validate(self, attrs):
#         instance = LabInvoice(**attrs)
#         try:
#             instance.clean()
#         except DjangoValidationError as e:
#             raise DRFValidationError(e.message_dict)
#         return attrs
 
class LabInvoiceSerializer(serializers.ModelSerializer):
    # Accept `patient_id` in the request
    patient_id = serializers.CharField(write_only=True)
    # Return patient name in the response
    patient_name = serializers.CharField(source='patient.patient_name', read_only=True)

    class Meta:
        model = LabInvoice
        fields = [
            'id', 'patient_id', 'patient_name',
            'testname', 'amount', 'status', 'date'
        ]

    def validate_patient_id(self, value):
        try:
            Patient.objects.get(patient_id=value)
        except Patient.DoesNotExist:
            raise DRFValidationError("Patient with this ID does not exist.")
        return value

    def create(self, validated_data):
        patient_id = validated_data.pop('patient_id')
        patient = Patient.objects.get(patient_id=patient_id)
        return LabInvoice.objects.create(patient=patient, **validated_data)

    def validate(self, attrs):
        # Temporarily create an instance to run model's clean method
        temp_invoice = LabInvoice(**attrs)
        try:
            temp_invoice.clean()
        except DjangoValidationError as e:
            raise DRFValidationError(e.message_dict)
        return attrs
