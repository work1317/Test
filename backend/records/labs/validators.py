from rest_framework import serializers

# Create the validators for the models over here 

class LabInvoiceValidator(serializers.Serializer):
    patient_name = serializers.CharField(required=True, allow_blank=False, max_length=100, error_messages={
        "required": "Patient name is required.",
        "blank": "Patient name cannot be blank.",
        "max_length": "Patient name can't exceed 100 characters."
    })
    test_name = serializers.CharField(required=True, allow_blank=False, max_length=100, error_messages={
        "required": "Test name is required.",
        "blank": "Test name cannot be blank.",
        "max_length": "Test name can't exceed 100 characters."
    })
    date = serializers.DateField(required=True, error_messages={
        "required": "Date is required.",
        "invalid": "Enter a valid date."
    })
    status = serializers.ChoiceField(choices=["Completed", "Pending", "In Progress"], required=True, error_messages={
        "required": "Status is required.",
        "invalid_choice": "Choose a valid status."
    })
    amount = serializers.CharField(required=True, allow_blank=False, max_length=50, error_messages={
        "required": "Test name is required.",
        "blank": "Test name cannot be blank.",
        "max_length": "Test name can't exceed 50 characters."
    })
    


class LabTestValidator(serializers.Serializer):
    patient_id = serializers.CharField(required=True, allow_blank=False, max_length=100, error_messages={
        "required": "Patient ID is required.",
        "blank": "Patient ID cannot be blank.",
        "max_length": "Patient ID can't exceed 100 characters."
    })

    patient_name = serializers.CharField(required=True, allow_blank=False, max_length=255, error_messages={
        "required": "Patient name is required.",
        "blank": "Patient name cannot be blank.",
        "max_length": "Patient name can't exceed 255 characters."
    })

    requested_test = serializers.CharField(required=True, allow_blank=False, max_length=255, error_messages={
        "required": "Requested test is required.",
        "blank": "Requested test cannot be blank.",
        "max_length": "Requested test can't exceed 255 characters."
    })

    requested_by = serializers.CharField(required=True, allow_blank=False, max_length=255, error_messages={
        "required": "Requested by is required.",
        "blank": "Requested by cannot be blank.",
        "max_length": "Requested by can't exceed 255 characters."
    })

    request_date = serializers.DateField(required=True, error_messages={
        "required": "Request date is required.",
        "invalid": "Enter a valid date."
    })

    priority = serializers.ChoiceField(choices=['Urgent', 'Normal',], required=True, error_messages={
        "required": "Priority is required.",
        "invalid_choice": "Choose a valid priority: pending, normal, or high."
    })

    status = serializers.ChoiceField(choices=['Pending', 'inprogress', 'Completed'], required=True, error_messages={
        "required": "Status is required.",
        "invalid_choice": "Choose a valid status: pending, inprogress, or completed."
    })

    notes = serializers.CharField(required=False, allow_blank=True)

    user_id = serializers.CharField(required=True, allow_blank=False, max_length=10, error_messages={
        "required": "User ID is required.",
        "blank": "User ID cannot be blank.",
        "max_length": "User ID can't exceed 10 characters."
    })

    username = serializers.CharField(required=True, allow_blank=False, max_length=150, error_messages={
        "required": "Username is required.",
        "blank": "Username cannot be blank.",
        "max_length": "Username can't exceed 150 characters."
    })

    test_date = serializers.DateField(required=False, allow_null=True)
    test_time = serializers.TimeField(required=False, allow_null=True)
    summary = serializers.CharField(required=False, allow_blank=True)
    test_type = serializers.CharField(required=False, allow_blank=True, max_length=100)
    flag = serializers.BooleanField(required=False)
    upload = serializers.FileField(required=False, allow_null=True)

    def validate(self, data):
        if data.get('test_date') and data.get('request_date'):
            if data['test_date'] < data['request_date']:
                raise serializers.ValidationError("Test date cannot be before request date.")
        return data
    
    