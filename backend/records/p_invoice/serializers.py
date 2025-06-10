from rest_framework import serializers
from p_invoice.models import PharmacyInvoice, PharmacyInvoiceItem
from pharmacy.models import Medication
from patients.models import Patient
from pharmacy.serializers import MedicationSeralizer
from decimal import Decimal
from django.core.exceptions import ValidationError
 
 
# create your serializers here
 
class PharmacyInvoiceItemSerializer(serializers.ModelSerializer):
    medication_name = serializers.CharField()  # Accept medication name as string
    batch_no = serializers.CharField(write_only=True)
 
    class Meta:
        model = PharmacyInvoiceItem
        exclude = ('invoice',)
 
    def validate(self, data):
        # Optionally validate that batch_no matches medication_name if needed
        return data
 
 
class PharmacyInvoiceSerializer(serializers.ModelSerializer):
    items = PharmacyInvoiceItemSerializer(many=True)
    patient_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    patient_name = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False)
    gender = serializers.CharField(required=False, allow_blank=True)
    doctor = serializers.CharField(required=False, allow_blank=True)
    Bill_No = serializers.ReadOnlyField()
    Bill_Date = serializers.ReadOnlyField()
 
    class Meta:
        model = PharmacyInvoice
        fields = '__all__'
 
    def validate(self, attrs):
        guest = attrs.get('guest', False)
 
        if guest:
            # For guest patients, ensure manual patient_name and doctor are provided
            required_fields = ['patient_name', 'doctor']
            for field in required_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError({field: f"{field} is required for guests."})
            # Also record the entered patient_id (optional for traceability)
            if 'patient_id' in self.initial_data:
                attrs['patient_id_value'] = self.initial_data.get('patient_id')
        else:
            patient_id = attrs.get('patient_id')
            if not patient_id:
                raise serializers.ValidationError({'patient_id': 'patient_id is required for registered patients.'})
            try:
                patient = Patient.objects.get(patient_id=patient_id)
            except Patient.DoesNotExist:
                raise serializers.ValidationError({'patient_id': 'No patient found with this ID.'})
 
            # Assign patient instance to FK field
            attrs['patient'] = patient
            attrs.pop('patient_id', None)
 
            # Denormalize data
            attrs['patient_name'] = patient.patient_name
            attrs['age'] = patient.age
            attrs['gender'] = patient.gender
            attrs['doctor'] = patient.doctor
            attrs['appointment_type'] = patient.appointment_type
            attrs['patient_id_value'] = patient.patient_id  # for fallback in notifications
 
        # Check if any item has discount > 15% (approval workflow)
        items_data = self.initial_data.get('items', [])
        discount_exceeds_limit = any(
            Decimal(str(item.get('discount_percentage', 0))) > 15 for item in items_data
        )
        attrs['discount_requires_approval'] = discount_exceeds_limit
 
        return attrs
 
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        discount_requires_approval = validated_data.pop('discount_requires_approval', False)
 
        validated_data['discount_requires_approval'] = discount_requires_approval
        validated_data['discount_approved'] = validated_data.get('discount_approved', False)
 
        # Pop patient if provided (can be None for guest)
        patient = validated_data.pop('patient', None)
 
        invoice = PharmacyInvoice.objects.create(patient=patient, **validated_data)
 
        for item_data in items_data:
            batch_no = item_data.pop('batch_no', None)
            medication_name_str = item_data.get('medication_name')
 
            try:
                medication = Medication.objects.get(
                    medication_name__iexact=medication_name_str,
                    batch_no=batch_no
                )
            except Medication.DoesNotExist:
                raise ValidationError(
                    f"Medication '{medication_name_str}' with batch number '{batch_no}' does not exist."
                )
 
            item_data['medication_name'] = medication
            PharmacyInvoiceItem.objects.create(invoice=invoice, **item_data)
 
        return invoice
 
 
 
 
 
class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'
 
 
 
 
class RecentPharmacyInvoicesSerializer(serializers.ModelSerializer):
    items = PharmacyInvoiceItemSerializer(many=True, read_only=True)
 
    Amount = serializers.SerializerMethodField()
    DiscountAmt = serializers.SerializerMethodField()
    AfterDiscount = serializers.SerializerMethodField()
    NetAmount = serializers.SerializerMethodField()
 
    class Meta:
        model = PharmacyInvoice
        fields = [
            "Bill_No", "Bill_Date", "typeof_transaction", "patient_name","age","gender","doctor",
            "appointment_type", "Amount", "DiscountAmt", "AfterDiscount",
            "NetAmount", "items"  # Include items here
        ]
 
    def get_Amount(self, obj):
        return obj.paid_amount or 0
 
    def get_DiscountAmt(self, obj):
        return sum(item.discount_amount for item in obj.items.all())
 
    def get_AfterDiscount(self, obj):
        return sum(item.net_amount for item in obj.items.all())
 
    def get_NetAmount(self, obj):
        return self.get_AfterDiscount(obj)
 