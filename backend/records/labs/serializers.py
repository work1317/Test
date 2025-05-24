from rest_framework import serializers
from .models import LabInvoice,LabTest

class LabInvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabInvoice
        fields = ['id','patient_name','test_name','date','status','amount']

class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = '__all__'