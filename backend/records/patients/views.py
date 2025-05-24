from django.shortcuts import render
from rest_framework.response import Response
from . import models, serializers, validators
# from rec_app.models import Prescription
from rest_framework.views import APIView
from core import messages
from core.exceptions import SerializerError
from django.db.models import Q
from django.core.cache import cache
from django.db import transaction
from rec_app.models import ProgressNote

# Create your views here.

class PatientAPIView(APIView):
    def get(self, request):
        return Response({"message": "Use POST to create a patient"}, status=200)

    def post(self, request):
        context = {
            "success": 1,
            "message": messages.DATA_SAVED,
            "data": {}
        }
        try:
            validator = validators.PatientValidator(data=request.data)

            if not validator.is_valid():
                raise SerializerError(validator.errors)
            req_params = validator.validated_data

            patient = models.Patient(
                patient_name = req_params['patient_name'],
                doctor_name = req_params['doctor_name'],  
                date = req_params['date'],
                time = req_params['time'],
                age = req_params['age'],
                appointment_type = req_params['appointment_type'],
                notes = req_params.get('notes', ''),
                gender = req_params['gender'],
                phno = req_params['phno'],
                email = req_params['email'],
                blood_group = req_params['blood_group'],
                ward_no=req_params.get('ward_no', ''),         
                diagnosis=req_params.get('diagnosis', '')      
            )

            patient.clean()
            patient.save()

            
            patient_serializer = serializers.PatientSerializer(patient, context={"request": request})

            total_inpatients = models.Patient.objects.filter(appointment_type='inpatient').count()
            total_outpatients = models.Patient.objects.filter(appointment_type='outpatient').count()
            total_casualty = models.Patient.objects.filter(appointment_type='casualty').count()

            context['data'] = {
                "patient_details": patient_serializer.data,
                "total_counts": {
                    "inpatients": total_inpatients,
                    "outpatients": total_outpatients,
                    "casualty": total_casualty
                }
            }

        except SerializerError as e:
            context['success'] = 0
            context['message'] = str(e)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)
        return Response(context)

class GetPatientAPIView(APIView):
    def get(self, request):
        context = {
            "success": 1,
            "message": messages.DATA_FOUND,
            "data": {}
        }
        try:
            search = request.query_params.get('q', None)
            email = request.query_params.get('email',None)
            blood_group = request.query_params.get('blood_group',None)
            patient_id = request.query_params.get('id', None)
            appointment_type = request.query_params.get('appointment_type', None)
            gender = request.query_params.get('gender', None)
            date = request.query_params.get('date', None)
            doctor_name = request.query_params.get('doctor_name', None)

            patients = models.Patient.objects.all()

            if email:
                patients = patients.filter(email__iexact=email)

            if blood_group:
                patients = patients.filter(blood_group__iexact = blood_group)

            if patient_id:
                patients = patients.filter(id=patient_id)

            if search:
                patients = patients.filter(
                    Q(patient_name__icontains=search) | Q(phno__icontains=search) | Q(email__icontains = search)
                )

            if appointment_type:
                patients = patients.filter(appointment_type__iexact=appointment_type)

            if gender:
                patients = patients.filter(gender__iexact=gender)

            if date:
                patients = patients.filter(date=date)

            if doctor_name:
                patients = patients.filter(doctor_name__icontains=doctor_name)  

            total_inpatients = models.Patient.objects.filter(appointment_type='inpatient').count()
            total_outpatients = models.Patient.objects.filter(appointment_type='outpatient').count()
            total_casualty = models.Patient.objects.filter(appointment_type='casualty').count()
            total_patients = models.Patient.objects.all().count()
            critical_cases = ProgressNote.objects.filter(status="critical").count()


            if appointment_type and not any([search, gender, date, doctor_name, patient_id]):
                count = patients.count()
                context["data"] = {
                    "appointment_type": appointment_type,
                    "count": count
                }
            else:
                patient_serializer = serializers.PatientSerializer(patients, many=True)
                context["data"] = {
                    "patients": patient_serializer.data,
                    "total_counts": {
                        "inpatients": total_inpatients,
                        "outpatients": total_outpatients,
                        "casualty": total_casualty,
                        "total_patients":total_patients,
                        "critical_cases":critical_cases
                    }
                }
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)
        return Response(context)

class PatientUpdateAPIView(APIView):
    def get(self, request, patient_id):
        """Fetch existing patient details before updating."""
        context = {
            "success": 1,
            "message": messages.DATA_FOUND,
            "data": {}
        }
        try:
            patient = models.Patient.objects.get(patient_id=patient_id)
            patient_serializer = serializers.PatientSerializer(patient)
            context['data'] = patient_serializer.data

        except models.Patient.DoesNotExist:
            context['success'] = 0
            context['message'] = "Patient Not Found"

        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)

    def put(self, request, patient_id):
        """Update patient details and refresh patient count"""
        context = {
            "success": 1,
            "message": messages.DATA_UPDATED,
            "data": {}
        }
        try:
            patient = models.Patient.objects.get(patient_id=patient_id)

            if not patient.can_update():
                context['success'] = 0
                context['message'] = "You cannot update details after 30 hours"
                return Response(context)

            patient_serializer = serializers.PatientSerializer(patient)
            current_data = patient_serializer.data

            serializer = serializers.PatientUpdateSerializer(
                patient, data=request.data, partial=True
            )

            if not serializer.is_valid():
                raise SerializerError(serializer.errors)

            with transaction.atomic():  
                serializer.save()
                patient.refresh_from_db()  

                
            total_inpatients = models.Patient.objects.filter(appointment_type='inpatient').count()
            total_outpatients = models.Patient.objects.filter(appointment_type='outpatient').count()
            total_casualty = models.Patient.objects.filter(appointment_type='casualty').count()

            context['message'] = "Patient details updated successfully"
            context['previous_data'] = current_data  
            context['updated_data'] = serializer.data  
            context['total_counts'] = {
                "inpatients": total_inpatients,
                "outpatients": total_outpatients,
                "casualty": total_casualty
            }

            cache.clear()
        except models.Patient.DoesNotExist:
            context['success'] = 0
            context['message'] = "Patient Not Found"

        except SerializerError as e:
            context['success'] = 0
            context['message'] = str(e)

        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)
