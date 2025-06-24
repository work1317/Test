from rest_framework import serializers
from .models import *
from .models import InvestigationCharge  # replace with your model path
# create your invoice serializers here

class ServiceChargeSerializer(serializers.ModelSerializer):
    def validate_days(self, value):
        if value <= 0:
            raise serializers.ValidationError("Number of service days must be greater than 0.")
        return value

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Service amount must be a positive number.")
        return value

    class Meta:
        model = ServiceCharge
        fields = '__all__'


class InvestigationChargeSerializer(serializers.ModelSerializer):
    from_date = serializers.DateField(required=False, allow_null=True)
    to_date = serializers.DateField(required=False, allow_null=True)
 
    def to_internal_value(self, data):
        for field in ['from_date', 'to_date']:
            if data.get(field) == '':
                data[field] = None
        return super().to_internal_value(data)
 
    def validate(self, data):
        from_date = data.get('from_date')
        to_date = data.get('to_date')
 
        if from_date and to_date and to_date < from_date:
            raise serializers.ValidationError("To date cannot be earlier than from date in Investigation charges.")
 
        if data.get('amount', 0) < 0:
            raise serializers.ValidationError("Investigation amount must be positive.")
 
        return data
 
    class Meta:
        model = InvestigationCharge
        fields = '__all__'
 
 
 
class PharmacyChargeSerializer(serializers.ModelSerializer):
    from_date = serializers.DateField(required=False, allow_null=True)
    to_date = serializers.DateField(required=False, allow_null=True)
 
    def to_internal_value(self, data):
        for field in ['from_date', 'to_date']:
            if data.get(field) == '':
                data[field] = None
        return super().to_internal_value(data)
 
    def validate(self, data):
        from_date = data.get('from_date')
        to_date = data.get('to_date')
 
        if from_date and to_date and to_date < from_date:
            raise serializers.ValidationError("To date cannot be earlier than from date in Pharmacy charges.")
 
        if data.get('amount', 0) < 0:
            raise serializers.ValidationError("Pharmacy amount must be positive.")
 
        return data
 
    class Meta:
        model = PharmacyCharge
        fields = '__all__'
 
 
 


class ConsultationChargeSerializer(serializers.ModelSerializer):
    def validate_no_of_visits(self, value):
        if value <= 0:
            raise serializers.ValidationError("Number of visits must be greater than 0.")
        return value

    def validate_amount_per_visit(self, value):
        if value < 0:
            raise serializers.ValidationError("Consultation amount per visit must be positive.")
        return value

    class Meta:
        model = ConsultationCharge
        fields = '__all__'



class InvoiceSerializer(serializers.ModelSerializer):
    patient = serializers.SlugRelatedField(queryset=Patient.objects.all(), slug_field='patient_id')
    service_charges = ServiceChargeSerializer(many=True)
    investigation_charges = InvestigationChargeSerializer()
    pharmacy_charges = PharmacyChargeSerializer()
    consultation_charges = ConsultationChargeSerializer()
    due_on_receipt = serializers.CharField(required=True, allow_null=False, allow_blank=False,
                                           error_messages={
                                               "required": "Due on Receipt is a required field.",
                                                "blank": "Due on receipt cannot be empty.",
                                                "null":"Due on receipt cannot be null"
                                           }
                                           )
    payment_method = serializers.CharField(required=True, allow_null=False, allow_blank=False,
                                           error_messages={
                                               "required": "Payment Method is a required field.",
                                                "blank": "Payment Method cannot be empty.",
                                                "null":"Payment Method cannot be null"
                                           }
                                           )
    notes = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    consultant = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    room_type = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    attendant_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    attendant_phno = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    admitted_date = serializers.DateField(required=False, allow_null=True)
    discharged_date = serializers.DateField(required=False, allow_null=True)
    care_type = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def to_internal_value(self, data):
        for field in ['admitted_date', 'discharged_date']:
            if data.get(field) == '':
                data[field] = None
        return super().to_internal_value(data)

    class Meta:
        model = Invoice
        fields = '__all__'

    def validate(self, data):
        if 'service_charges' in data:
            for service in data['service_charges']:
                if service.get('days', 1) <= 0:
                    raise serializers.ValidationError("Each service must have days > 0.")
                if service.get('amount', 1) <= 0:
                    raise serializers.ValidationError("Each service must have a positive amount.")
        if 'concession' in data and data['concession'] < 0:
            raise serializers.ValidationError("Concession cannot be negative.")
        return data

    def create(self, validated_data):
        service_data_list = validated_data.pop('service_charges')
        investigation_data = validated_data.pop('investigation_charges')
        pharmacy_data = validated_data.pop('pharmacy_charges')
        consultation_data = validated_data.pop('consultation_charges')

        investigation_obj = InvestigationCharge.objects.create(**investigation_data)
        pharmacy_obj = PharmacyCharge.objects.create(**pharmacy_data)
        consultation_obj = ConsultationCharge.objects.create(**consultation_data)

        invoice = Invoice.objects.create(
            investigation_charges=investigation_obj,
            pharmacy_charges=pharmacy_obj,
            consultation_charges=consultation_obj,
            **validated_data
        )

        for service_data in service_data_list:
            service_obj = ServiceCharge.objects.create(**service_data)
            InvoiceServiceCharge.objects.create(invoice=invoice, service_charge=service_obj)

        return invoice

    def update(self, instance, validated_data):
        service_data_list = validated_data.pop('service_charges', None)
        investigation_data = validated_data.pop('investigation_charges', None)
        pharmacy_data = validated_data.pop('pharmacy_charges', None)
        consultation_data = validated_data.pop('consultation_charges', None)

        if service_data_list is not None:
            instance.invoice_servicecharge_set.all().delete()
            for service_data in service_data_list:
                service_obj = ServiceCharge.objects.create(**service_data)
                InvoiceServiceCharge.objects.create(invoice=instance, service_charge=service_obj)

        if investigation_data:
            for attr, value in investigation_data.items():
                setattr(instance.investigation_charges, attr, value)
            instance.investigation_charges.save()

        if pharmacy_data:
            for attr, value in pharmacy_data.items():
                setattr(instance.pharmacy_charges, attr, value)
            instance.pharmacy_charges.save()

        if consultation_data:
            for attr, value in consultation_data.items():
                setattr(instance.consultation_charges, attr, value)
            instance.consultation_charges.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance

