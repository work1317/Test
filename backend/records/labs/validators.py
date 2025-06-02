from rest_framework import serializers
from patients.models import Patient
from datetime import date
 
# Create the Validator for the models heree
 
class LabTestValidator(serializers.Serializer):
    patient = serializers.CharField(required=True, max_length=10, error_messages={
        "required": "Patient ID is required.",
        "max_length": "Patient ID must not exceed 10 characters."
    })
   
    requested_test = serializers.CharField(required=True, max_length=100, error_messages={
        "required": "Requested test is required.",
        "max_length": "Requested test name must not exceed 100 characters."
    })
   
    request_date = serializers.DateField(required=True, error_messages={
        "required": "Request date is required.",
        "invalid": "Enter a valid date (YYYY-MM-DD)."
    })
   
    priority = serializers.ChoiceField(choices=['Urgent', 'Normal'], default='Normal', error_messages={
        "invalid_choice": "Priority must be either 'Urgent' or 'Normal'."
    })
   
    status = serializers.ChoiceField(choices=['Pending', 'InProgress', 'Completed'], default='Pending', error_messages={
        "invalid_choice": "Status must be 'Pending', 'InProgress', or 'Completed'."
    })
   
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
   
    test_date = serializers.DateField(required=True, error_messages={
        "required": "Test date is required.",
        "invalid": "Enter a valid date (YYYY-MM-DD)."
    })
   
    summary = serializers.CharField(required=False, allow_blank=True, allow_null=True)
   
    test_type = serializers.CharField(required=True, max_length=100, error_messages={
        "required": "Test type is required.",
        "max_length": "Test type must not exceed 100 characters."
    })
   
    flag = serializers.BooleanField(required=False, default=False)
   
    upload = serializers.FileField(required=False, allow_null=True)
    
    def validate(self, data):
        requested_test = data.get('requested_test', '').strip().lower()
        test_type = data.get('test_type', '').strip().lower()
 
        if requested_test != test_type:
            raise serializers.ValidationError("Requested test and test type must be the same.")
 
        return data
   
    def validate(self, data):
        if data['requested_test'].strip().lower() != data['test_type'].strip().lower():
            raise serializers.ValidationError("Requested test and test type must be the same.")
 
        if data['request_date'] < date.today():
            raise serializers.ValidationError({"request_date": "Request date cannot be in the past."})
 
        if data['test_date'] < date.today():
            raise serializers.ValidationError({"test_date": "Test date cannot be in the past."})
 
        return data
 
 
class LabInvoiceValidator(serializers.Serializer):
    patient = serializers.CharField(required=True, max_length=100, error_messages={
        "required": "Patient name is required.",
        "max_length": "Patient name must not exceed 100 characters."
    })
 
    testname = serializers.CharField(required=True, max_length=100, error_messages={
        "required": "Test name is required.",
        "max_length": "Test name must not exceed 100 characters."
    })
 
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True, error_messages={
        "required": "Amount is required.",
        "invalid": "Enter a valid decimal amount."
    })
 
    status = serializers.ChoiceField(choices=['Pending', 'InProgress', 'Completed'], default='Pending', error_messages={
        "invalid_choice": "Status must be 'Pending', 'InProgress', or 'Completed'."
    })
 
    date = serializers.DateField(required=False, default=date.today, error_messages={
        "invalid": "Enter a valid date (YYYY-MM-DD)."
    })
 
    def validate_patient(self, value):
        try:
            patient = Patient.objects.get(patient_name=value)
        except Patient.DoesNotExist:
            raise serializers.ValidationError("Patient with this name does not exist.")
        return patient  # You can return the patient object if your view uses it

    def validate(self, data):
        if 'date' in data and data['date'] < date.today():
            raise serializers.ValidationError({"date": "Invoice date cannot be in the past."})
        return data
        
    



