

from rest_framework import serializers
from p_invoice.models import PharmacyInvoice, PharmacyInvoiceItem
from pharmacy.models import Medication
from patients.models import Patient


class PharmacyInvoiceItemSerializer(serializers.ModelSerializer):
    medication_name = serializers.CharField()

    class Meta:
        model = PharmacyInvoiceItem
        exclude = ('invoice',)

    def validate_medication_name(self, value):
        try:
            medication = Medication.objects.get(medication_name__iexact=value)
            return medication
        except Medication.DoesNotExist:
            raise serializers.ValidationError(f"Medication '{value}' does not exist.")

    def create(self, validated_data):
        validated_data['medication_name'] = validated_data['medication_name']
        return PharmacyInvoiceItem.objects.create(**validated_data)


class PharmacyInvoiceSerializer(serializers.ModelSerializer):
    items = PharmacyInvoiceItemSerializer(many=True)
    patient_name = serializers.CharField(required=False, allow_blank=True)
    age = serializers.IntegerField(required=False)
    gender = serializers.CharField(required=False, allow_blank=True)
    doctor = serializers.CharField(required=False, allow_blank=True)
    patient_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = PharmacyInvoice
        fields = '__all__'

    def validate(self, attrs):
        guest = attrs.get('guest', False)

        if guest:
            required_fields = ['patient_name', 'age', 'gender', 'doctor']
            for field in required_fields:
                if not attrs.get(field):
                    raise serializers.ValidationError({field: f"{field} is required for guests."})
        else:
            patient_id = attrs.get('patient_id')
            if not patient_id:
                raise serializers.ValidationError({'patient_id': 'patient_id is required for registered patients.'})

            try:
                patient = Patient.objects.get(patient_id=patient_id)
                attrs['patient_name'] = patient.patient_name
                attrs['age'] = patient.age
                attrs['gender'] = patient.gender
                attrs['doctor'] = patient.doctor
                attrs['appointment_type'] = patient.appointment_type
            except Patient.DoesNotExist:
                raise serializers.ValidationError({'patient_id': 'No patient found with this ID.'})

        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = PharmacyInvoice.objects.create(**validated_data)
        for item_data in items_data:
            PharmacyInvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'


# class RecentPharmacyInvoicesSerializer(serializers.ModelSerializer):
#     Amount = serializers.SerializerMethodField()
#     DiscountAmt = serializers.SerializerMethodField()
#     AfterDiscount = serializers.SerializerMethodField()
#     NetAmount = serializers.SerializerMethodField()

#     class Meta:
#         model = PharmacyInvoice
#         fields = [
#             "Bill_No", "Bill_Date", "typeof_transaction", "patient_name",
#             "appointment_type", "Amount", "DiscountAmt", "AfterDiscount",
#         ]

#     def get_Amount(self, obj):
#         return obj.paid_amount or 0

#     def get_DiscountAmt(self, obj):
#         return sum([item.discount_amount for item in obj.items.all()])

#     def get_AfterDiscount(self, obj):
#         return sum(item.net_amount for item in obj.items.all())

#     def get_NetAmount(self, obj):
#         return self.get_AfterDiscount(obj)



class RecentPharmacyInvoicesSerializer(serializers.ModelSerializer):
    items = PharmacyInvoiceItemSerializer(many=True, read_only=True)

    Amount = serializers.SerializerMethodField()
    DiscountAmt = serializers.SerializerMethodField()
    AfterDiscount = serializers.SerializerMethodField()
    NetAmount = serializers.SerializerMethodField()

    class Meta:
        model = PharmacyInvoice
        fields = [
            "Bill_No", "Bill_Date", "typeof_transaction", "patient_name",
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


