from django.shortcuts import render,get_object_or_404
from rest_framework.response import Response
from . import models, serializers, validators
from rec_app.validators import *
from rest_framework.views import APIView
from core import messages
from core.exceptions import SerializerError
from django.db import transaction
from django.db.models import Q
from .serializers import get_serializer_class
from rest_framework.parsers import MultiPartParser, FormParser
from . import models, serializers, validators
from rest_framework.exceptions import ValidationError, NotFound
from django.utils import timezone
from rest_framework import status
from patients.models import Patient
from pharmacy.models import Medication
from .models import (MedicalRecord,Prescription,Vitals,ProgressNote,PainAssessment,TreatmentChart,InitialAssessment,RiskFactor1,RiskFactor2,RiskFactor3,RiskFactor4)
from .serializers import (VitalsSerializer,PrescriptionSerializer,ServiceProcedureSerializer,NursingNotesSerializer,ProgressNoteSerializer,TreatmentChartSerializer,PainAssessmentSerializer,
                          InitialAssessmentSerializer,CarePlanFeedbackSerializer,RiskFactor1Serializer,RiskFactor2Serializer,
                          RiskFactor3Serializer,RiskFactor4Serializer)
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from core.exceptions import SerializerError  
from core import messages  
from django.core.exceptions import ObjectDoesNotExist

# create your views here

def get_serializer_class(record_type):
    serializer_classes = {
        "vitals": VitalsSerializer,
        # "lab_results": LabResultSerializer,
        # "imaging": ImagingSerializer,
        "prescription": PrescriptionSerializer,
        "service_procedure": ServiceProcedureSerializer,
    }
    return serializer_classes.get(record_type)


class MedicalRecordRetrieveAPIView(APIView):
    def get(self, request):
        patient_id = request.query_params.get("patient_id")
        phone_number = request.query_params.get("phone_number")
        patient_name = request.query_params.get("patient_name")
        record_id = request.query_params.get("record_id")
        record_type = request.query_params.get("record_type")

        filters = {}
        if patient_id:
            filters["patient__patient_id"] = patient_id
        if phone_number:
            filters["patient__phone_number"] = phone_number
        if patient_name:
            filters["patient__name__icontains"] = patient_name
        if record_id:
            filters["id"] = record_id

        if not filters:
            return Response({"success": 0, "message": "At least one search parameter is required."})

        try:
            if record_type:
                serializer_class = get_serializer_class(record_type)
                if not serializer_class:
                    return Response({"success": 0, "message": "Invalid record type"})
                records = serializer_class.Meta.model.objects.filter(**filters)
            else:
                records = MedicalRecord.objects.filter(**filters)  # Default model

            if not records.exists():
                return Response({"success": 0, "message": "No records found"})

            serializer = serializer_class(records, many=True)
            return Response({"success": 1, "data": serializer.data})
        except Exception as e:
            return Response({"success": 0, "message": str(e)})

    
class MedicalRecordCreateAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser) 

    def post(self, request):
        context = {"success": 1, "message": "Data saved", "data": {}}

        try:
            patient_id = request.data.get("patient_id")
            print("Incoming patient:", request.data.get('patient'))
            record_type = request.data.get("record_type")
            report = request.FILES.get("report")
            print(request.data)
            if not patient_id:
                context["success"] = 0
                context["message"] = "Patient ID is required"
                return Response(context)

            try:
                patient = Patient.objects.get(patient_id=patient_id)
            except Patient.DoesNotExist:
                context["success"] = 0
                context["message"] = "Patient not found"
                return Response(context)

            serializer_class = get_serializer_class(record_type)

            if not serializer_class:
                context["success"] = 0
                context["message"] = "Invalid record type"
                return Response(context)


            # Add file to request data
            data = request.data.copy()
            if report:
                data["report"] = report  # Assign the file to serializer

            serializer = serializer_class(data=data)

            if not serializer.is_valid():
                context["success"] = 0
                context["message"] = serializer.errors
                return Response(context)

            record = serializer.save(patient=patient)  # Associate with patient
            context["data"] = serializer.data
            return Response(context)

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context)


class MedicalRecordUpdateAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    
    def get(self, request, patient_id):
        return Response(
            {"success": 0, "message": "Method Not Allowed. Use PUT instead."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def put(self, request, patient_id):
        context = {"success": 1, "message": "Data updated successfully", "data": {}}

        try:
            record_type = request.data.get("record_type")
            report = request.FILES.get("report")

            # Check if patient exists
            try:
                patient = Patient.objects.get(patient_id=patient_id)
            except Patient.DoesNotExist:
                context["success"] = 0
                context["message"] = "Patient not found"
                return Response(context, status=status.HTTP_404_NOT_FOUND)

            # Determine the correct model & serializer
            serializer_class = {
                "vitals": VitalsSerializer,
                # "lab_results": LabResultSerializer,
                # "imaging": ImagingSerializer,
                "prescription": PrescriptionSerializer,
                "services_procedures": ServiceProcedureSerializer,
            }.get(record_type)

            if not serializer_class:
                context["success"] = 0
                context["message"] = "Invalid record type"
                return Response(context, status=status.HTTP_400_BAD_REQUEST)

            # Get the record to update
            record = serializer_class.Meta.model.objects.filter(patient=patient).first()

            if not record:
                context["success"] = 0
                context["message"] = "Record not found"
                return Response(context, status=status.HTTP_404_NOT_FOUND)

            
            data = request.data.copy()
            if report:
                data["report"] = report  # Assign new file to serializer

            # Update record
            serializer = serializer_class(record, data=data, partial=True)
            if serializer.is_valid():
                serializer.save()
                context["data"] = serializer.data
                return Response(context, status=status.HTTP_200_OK)
            else:
                context["success"] = 0
                context["message"] = serializer.errors
                return Response(context, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class VitalsDetailAPIView(APIView):
    def get(self, request, patient_id):
        context = {
            "success":1,
            "message":"Vitals fetched successfully",
            "data":{}
        }

        try:
            patient = get_object_or_404(Patient, patient_id=patient_id)
            vitals = Vitals.objects.filter(patient=patient)

            serializer = VitalsSerializer(vitals, many=True)
            context["data"]=serializer.data

            return Response(context, status=status.HTTP_200_OK)
        except Exception as e:
            context["success"]=0
            context["message"]=str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PrescriptionListAPIView(APIView):
    def get(self, request):
        context = {
            "success": 1,
            "message": "Prescription data fetched successfully",
            "data": []
        }

        try:
            # Extract query parameters
            patient_id = request.query_params.get('patient_id')
            patient_name = request.query_params.get('patient_name')
            phno = request.query_params.get('phno')
            appointment_type = request.query_params.get('appointment_type')

            # Build filters using Q objects
            filters = Q()
            if patient_id:
                filters &= Q(patient__patient_id__icontains=patient_id)
            if patient_name:
                filters &= Q(patient__patient_name__icontains=patient_name)
            if phno:
                filters &= Q(patient__phno__icontains=phno)
            if appointment_type:
                filters &= Q(patient__appointment_type__iexact=appointment_type)

            prescriptions = Prescription.objects.filter(filters)

            prescription_data = []
            for pres in prescriptions:
                data = {
                    "patient_id": pres.patient.patient_id,
                    "patient_name": pres.patient.patient_name,
                    "doctor_name": pres.patient.doctor_name,
                    "medication_name": pres.medication_name,
                    "dosage": pres.dosage,
                    "summary": pres.summary,
                    "appointment_type": pres.patient.appointment_type,
                    "phone_number": pres.patient.phno,
                    "status":pres.status,
                    "quantity":pres.quantity
                }
                prescription_data.append(data)

            context["data"] = prescription_data

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(context, status=status.HTTP_200_OK)
    

class PrescriptionDetailView(APIView):
    def get(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Fetched successfully",
            "data": {}
        }

        try:
            patient = Patient.objects.get(patient_id=patient_id)
            prescriptions = Prescription.objects.filter(patient=patient)

            serialized = []
            for pres in prescriptions:
                # Try to find a matching medication
                try:
                    medication = Medication.objects.get(medication_name=pres.medication_name)
                    stock_quantity = medication.stock_quantity
                except Medication.DoesNotExist:
                    stock_quantity = None

                # Build a dictionary manually (you could also customize a serializer)
                serialized.append({
                    "id": pres.id,
                    "medication_name": pres.medication_name,
                    "dosage": pres.dosage,
                    "quantity": pres.quantity,
                    "duration": pres.duration,
                    "category": pres.category,
                    "summary": pres.summary,
                    "status":pres.status,
                    "report": pres.report.url if pres.report else None,
                    "created_at": pres.created_at,
                    "last_updated_at": pres.last_updated_at,
                    "stock_quantity": stock_quantity,
                    "doctor_name":pres.patient.doctor_name
                })

            context["data"] = serialized
            return Response(context, status=status.HTTP_200_OK)

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def put(self, request, patient_id):
        context = {
            "success": 1,
            "message": messages.DATA_UPDATED,
            "data": []
        }
 
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            data = request.data
 
            prescriptions_data = data if isinstance(data, list) else [data]
 
            with transaction.atomic():
                updated_prescriptions = []
 
                for item in prescriptions_data:
                    medication_name = item.get("medication_name")
 
                    if not medication_name:
                        raise ValidationError("Each prescription must include 'medication_name'.")
 
                    try:
                        prescription = Prescription.objects.get(
                            patient=patient,
                            medication_name__iexact=medication_name
                        )
                    except Prescription.DoesNotExist:
                        raise ValidationError(f"Prescription for '{medication_name}' not found.")
 
                    new_quantity = int(item.get("quantity", prescription.quantity or 0))
 
                    try:
                        medication = Medication.objects.get(medication_name__iexact=medication_name)
 
                        if medication.stock_quantity is None or medication.stock_quantity == 0:
                            item['status'] = 'pending'
 
                        elif new_quantity > medication.stock_quantity:
                            item['status'] = 'pending'
 
                        else:
                            # Sufficient stock, proceed and deduct
                            medication.stock_quantity -= new_quantity
                            item['status'] = 'completed'
                            medication.save()
 
                    except Medication.DoesNotExist:
                        item['status'] = 'pending'
 
                    # Update prescription regardless of status
                    serializer = PrescriptionSerializer(prescription, data=item, partial=True)
                    if not serializer.is_valid():
                        raise ValidationError(serializer.errors)
 
                    updated = serializer.save()
                    updated_prescriptions.append(PrescriptionSerializer(updated).data)
 
                context["data"] = updated_prescriptions[0] if isinstance(data, dict) else updated_prescriptions
                return Response(context, status=status.HTTP_200_OK)
 
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Add Notes

# Nursing Notes

class NursingNotesAPIView(APIView):
    def get(self, request):
        return Response({"message": "Use POST to create a nursing note"}, status=status.HTTP_200_OK)

    def post(self, request):
        context = {
            "success": 1,
            "message": "Data saved successfully",
            "data": {}
        }

        try:
            # Validate request data
            validator = validators.NursingNotesValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)

            req_params = validator.validated_data

            # Check if patient exists
            try:
                patient = Patient.objects.get(patient_id=req_params['patient'])
            except Patient.DoesNotExist:
                return Response(
                    {
                        "success": 0,
                        "message": f"No patient found with ID {req_params['patient']}. Please check and try again.",
                        "data": {}
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ensure only one NursingNotes entry per patient
            nursing_note, created = models.NursingNotes.objects.get_or_create(
                patient=patient,
                defaults={'description': req_params['description']}
            )

            if not created:
                nursing_note.description = req_params['description']
                nursing_note.save()

            serializer = NursingNotesSerializer(nursing_note, context={"request": request})
            context['data'] = {"nursing_note_details": serializer.data}

        except SerializerError as e:
            context['success'] = 0
            context['message'] = str(e)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context, status=status.HTTP_201_CREATED if context["success"] else status.HTTP_400_BAD_REQUEST)

class NursingNotesListAPIView(APIView):
    def get(self, request, patient_id):
        nursing_notes = models.NursingNotes.objects.filter(patient__patient_id=patient_id)

        if not nursing_notes.exists():
            return Response({
                "success": 0,
                "message": f"No nursing notes found for this patient ID {patient_id}.",
                "data": []
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = NursingNotesSerializer(nursing_notes, many=True, context={"request": request})

        return Response({
            "success": 1,
            "message": "Nursing notes retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
class NursingNotesUpdateAPIView(APIView):
    def get(self, request, patient_id):
        nursing_notes = models.NursingNotes.objects.filter(patient__patient_id=patient_id)

        if not nursing_notes.exists():
            return Response({
                "success": 0,
                "message": "No nursing notes found for this patient.",
                "data": []
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = NursingNotesSerializer(nursing_notes, many=True, context={"request": request})

        return Response({
            "success": 1,
            "message": "Nursing notes retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    def put(self, request, patient_id):
        context = {
            "success": 1,
            "message": messages.DATA_UPDATED,
            "data": {}
        }
        try:
            # Fetch patient using patient_id
            try:
                patient = models.Patient.objects.get(patient_id=patient_id)
            except models.Patient.DoesNotExist:
                return Response({
                    "success": 0,
                    "message": f"No patient found with ID {patient_id}.",
                    "data": {}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the latest NursingNotes entry for this patient
            nursing_note = models.NursingNotes.objects.filter(patient=patient).last()
            if not nursing_note:
                return Response({
                    "success": 0,
                    "message": f"No nursing note found for patient ID {patient_id}.",
                    "data": {}
                }, status=status.HTTP_404_NOT_FOUND)

            # Validate request data using update validator
            validator = validators.NursingNotesUpdateValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)

            req_params = validator.validated_data

            # Update NursingNotes object
            nursing_note.description = req_params.get("description", nursing_note.description)
            nursing_note.save()

            # Serialize and return data
            serializer = NursingNotesSerializer(nursing_note, context={"request": request})
            context["data"] = serializer.data

        except SerializerError as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)

        return Response(context, status=status.HTTP_200_OK)

# Progress Notes
class GetProgressNoteAPIView(APIView):
    def get(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Progress notes fetched successfully.",
            "data": {}
        }
        try:
            patient = models.Patient.objects.get(patient_id=patient_id)
            progress_notes = models.ProgressNote.objects.filter(patient=patient)

            if not progress_notes.exists():
                raise NotFound(f"No progress notes found for this patient ID {patient_id}.")

            serializer = ProgressNoteSerializer(progress_notes, many=True)
            context['data'] = serializer.data

        except models.Patient.DoesNotExist:
            context['success'] = 0
            context['message'] = "Patient not found."
            return Response(context, status=status.HTTP_404_NOT_FOUND)
        except NotFound as e:
            context['success'] = 0
            context['message'] = str(e)
            return Response(context, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(context, status=status.HTTP_200_OK)




class CreateProgressNoteAPIView(APIView):
    def get(self,request):
        return Response({"message":"Use POST to create a progress note"}, status = status.HTTP_200_OK)


    def post(self, request):
        context = {
            "success": 1,
            "message": "Progress note created successfully.",
            "data": {}
        }
        try:
            patient_id = request.data.get('patient_id')
            if not patient_id:
                raise ValidationError({'patient_id': 'This field is required.'})

            try:
                patient = Patient.objects.get(patient_id=patient_id)
            except Patient.DoesNotExist:
                raise ValidationError({'patient_id': 'Invalid patient ID.'})

            data = request.data.copy()
            data['patient'] = patient.id

            serializer = ProgressNoteSerializer(data=data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            serializer.save()
            context['data'] = serializer.data

        except ValidationError as e:
            context['success'] = 0
            context['message'] = str(e)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)



class ProgressNoteDetailView(APIView):

    def get(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Progress notes fetched successfully.",
            "data": {}
        }
        try:
            # Check if the patient exists
            patient = models.Patient.objects.get(patient_id=patient_id)
            
            # Retrieve progress notes for the patient
            progress_notes = models.ProgressNote.objects.filter(patient=patient)

            if not progress_notes.exists():
                raise NotFound(f"No progress notes found for this patient ID {patient_id}.")

            serializer = ProgressNoteSerializer(progress_notes, many=True)
            context['data'] = serializer.data

        except models.Patient.DoesNotExist:
            context['success'] = 0
            context['message'] = "Patient not found."
            return Response(context, status=status.HTTP_404_NOT_FOUND)
        except NotFound as e:
            context['success'] = 0
            context['message'] = str(e)
            return Response(context, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(context, status=status.HTTP_200_OK)

    def put(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Progress note updated successfully.",
            "data": {}
        }
        try:
            # Check if patient exists
            patient = models.Patient.objects.get(patient_id=patient_id)
            
            # Retrieve progress note associated with patient
            try:
                progress_note = models.ProgressNote.objects.get(patient=patient)
            except models.ProgressNote.DoesNotExist:
                raise NotFound("Progress note not found for this patient.")
            
            # Serialize and update data
            serializer = ProgressNoteSerializer(progress_note, data=request.data, partial=True)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            serializer.save()
            context['data'] = serializer.data

        except models.Patient.DoesNotExist:
            context['success'] = 0
            context['message'] = "Patient not found."
            return Response(context, status=status.HTTP_404_NOT_FOUND)
        except NotFound as e:
            context['success'] = 0
            context['message'] = str(e)
            return Response(context, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            context['success'] = 0
            context['message'] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(context, status=status.HTTP_200_OK)


# Treatment Chart

# class TreatmentChartAPIView(APIView):
#     def get(self, request):
#         return Response({"message": "Use POST to create a treatment chart"}, status=status.HTTP_200_OK)

#     def post(self, request):
#         context = {
#             "success": 1,
#             "message": messages.DATA_SAVED,
#             "data": {}
#         }
#         try:
#             validator = validators.TreatmentChartValidator(data=request.data)
#             if not validator.is_valid():
#                 raise SerializerError(validator.errors)

#             req_params = validator.validated_data

#             # Debugging: Print received patient ID
#             print("Received Patient ID:", req_params['patient'])

#             # Check if patient exists
#             try:
#                 patient = Patient.objects.get(patient_id=req_params['patient'])
#             except Patient.DoesNotExist:
#                 return Response(
#                     {
#                         "success": 0,
#                         "message": f"No patient found with ID {req_params['patient']}. Please check and try again.",
#                         "data": {}
#                     },
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             # Ensure only one TreatmentChart entry per patient
#             treatment_chart, created = models.TreatmentChart.objects.get_or_create(
#                 patient=patient,
#                 defaults={
#                     'medicine_name': req_params['medicine_name'],
#                     'hrs_drops_mins': req_params['hrs_drops_mins'],
#                     'dose': req_params['dose'],
#                     'time': req_params['time'],
#                     'medicine_details': req_params['medicine_details'],
#                 }
#             )

#             if not created:
#                 treatment_chart.medicine_name = req_params['medicine_name']
#                 treatment_chart.hrs_drops_mins = req_params['hrs_drops_mins']
#                 treatment_chart.dose = req_params['dose']
#                 treatment_chart.time = req_params['time']
#                 treatment_chart.medicine_details = req_params['medicine_details']
#                 treatment_chart.save()

#             serializer = TreatmentChartSerializer(treatment_chart, context={"request": request})
#             context['data'] = {"treatment_chart_details": serializer.data}

#         except SerializerError as e:
#             context['success'] = 0
#             context['message'] = str(e)
#         except Exception as e:
#             context['success'] = 0
#             context['message'] = str(e)

#         return Response(context, status=status.HTTP_201_CREATED if context["success"] else status.HTTP_400_BAD_REQUEST)



class TreatmentChartAPIView(APIView):
    def get(self, request):
        return Response(
            {"message": "Use POST to create a treatment chart"},
            status=status.HTTP_200_OK
        )
    def post(self, request):
        context = {
            "success": 1,
            "message": "Data saved successfully",
            "data": {}
        }
        try:
            validator = TreatmentChartValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)
            req_params = validator.validated_data
 
            # Debugging: Print received patient ID
            print("Received Patient ID:", req_params['patient'])
 
            # Check if patient exists
            try:
                patient = Patient.objects.get(patient_id=req_params['patient'])
            except Patient.DoesNotExist:
                return Response(
                    {
                        "success": 0,
                        "message": f"No patient found with ID {req_params['patient']}. Please check and try again.",
                        "data": {}
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # Ensure request contains multiple medicines
            medicines_data = req_params.get("medicines", [])  # Expecting a list of medicines

            if not medicines_data:
                return Response(
                    {
                        "success": 0,
                        "message": "Medicines list is required.",
                        "data": {}
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
 
            # Creating multiple TreatmentChart entries
            treatment_entries = [
                TreatmentChart(
                    patient=patient,
                    medicine_name=medicine["medicine_name"],
                    hrs_drops_mins=medicine["hrs_drops_mins"],
                    dose=medicine["dose"],
                    time=medicine["time"],
                    medicine_details=medicine["medicine_details"],
                )
                for medicine in medicines_data
            ]

            TreatmentChart.objects.bulk_create(treatment_entries)
 
            # Serialize created objects
            serializer = TreatmentChartSerializer(treatment_entries, many=True, context={"request": request})
            context['data'] = {"treatment_chart_details": serializer.data}
 
        except SerializerError as e:
            context['success'] = 0
            context['message'] = str(e)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context, status=status.HTTP_201_CREATED if context["success"] else status.HTTP_400_BAD_REQUEST)
 


class TreatmentChartListAPIView(APIView):
    def get(self, request, patient_id):
        if not patient_id:
            return Response(
                {"success": 0, "message": "patient_id is required in the URL", "data": {}},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            # Get the patient by the custom patient_id field
            patient = Patient.objects.get(patient_id=patient_id)

            # Get all treatment chart entries for the patient
            treatment_charts = TreatmentChart.objects.filter(patient=patient)

            if not treatment_charts.exists():
                return Response(
                    {
                        "success": 0,
                        "message": f"No treatment charts found for patient ID {patient_id}",
                        "data": {}
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # Serialize and return
            serializer = TreatmentChartSerializer(treatment_charts, many=True, context={"request": request})
            return Response(
                {
                    "success": 1,
                    "message": "Treatment chart data retrieved successfully",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )

        except Patient.DoesNotExist:
            return Response(
                {
                    "success": 0,
                    "message": f"No patient found with ID {patient_id}",
                    "data": {}
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"success": 0, "message": str(e), "data": {}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class TreatmentChartUpdateAPIView(APIView):
    def get(self, request, patient_id):
        if not patient_id:
            return Response(
                {"success": 0, "message": "patient_id is required in the URL", "data": {}},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get the patient by the custom patient_id field
            patient = Patient.objects.get(patient_id=patient_id)

            # Get all treatment chart entries for the patient
            treatment_charts = TreatmentChart.objects.filter(patient=patient)

            if not treatment_charts.exists():
                return Response(
                    {
                        "success": 0,
                        "message": f"No treatment charts found for patient ID {patient_id}",
                        "data": {}
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # Serialize and return
            serializer = TreatmentChartSerializer(treatment_charts, many=True, context={"request": request})
            return Response(
                {
                    "success": 1,
                    "message": "Treatment chart data retrieved successfully",
                    "data": {"treatment_chart_details": serializer.data}
                },
                status=status.HTTP_200_OK
            )

        except Patient.DoesNotExist:
            return Response(
                {
                    "success": 0,
                    "message": f"No patient found with ID {patient_id}",
                    "data": {}
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except Exception as e:
            return Response(
                {"success": 0, "message": str(e), "data": {}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def put(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Treatment chart updated successfully",
            "data": {}
        }

        try:
            # Check if patient exists
            try:
                patient = Patient.objects.get(patient_id=patient_id)
            except Patient.DoesNotExist:
                return Response(
                    {
                        "success": 0,
                        "message": f"No patient found with ID {patient_id}",
                        "data": {}
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # Get medicines data from request
            medicines_data = request.data.get("medicines", [])

            if not medicines_data:
                return Response(
                    {
                        "success": 0,
                        "message": "Medicines list is required for update.",
                        "data": {}
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Optional: delete existing treatment charts before replacing
            TreatmentChart.objects.filter(patient=patient).delete()

            # Create new treatment entries
            treatment_entries = [
                TreatmentChart(
                    patient=patient,
                    medicine_name=medicine["medicine_name"],
                    hrs_drops_mins=medicine["hrs_drops_mins"],
                    dose=medicine["dose"],
                    time=medicine["time"],
                    medicine_details=medicine["medicine_details"],
                )
                for medicine in medicines_data
            ]

            TreatmentChart.objects.bulk_create(treatment_entries)

            # Serialize and return new data
            serializer = TreatmentChartSerializer(treatment_entries, many=True, context={"request": request})
            context["data"] = {"treatment_chart_details": serializer.data}

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_200_OK if context["success"] else status.HTTP_400_BAD_REQUEST)


# Pain Assessment

class CreatePainAssessmentAPIView(APIView):
    def get(self, request):
        return Response({"message": "Use POST to create a pain assessment"}, status=status.HTTP_200_OK)

    def post(self, request):
        context = {
            "success": 1,
            "message": "Pain assessment created successfully.",
            "data": {}
        }
        try:
            patient_id = request.data.get('patient_id')
            if not patient_id:
                raise ValidationError({'patient_id': 'This field is required.'})

            try:
                patient = Patient.objects.get(patient_id=patient_id)
            except Patient.DoesNotExist:
                raise ValidationError({'patient_id': 'Invalid patient ID.'})

            # Check if the pain assessment already exists
            if PainAssessment.objects.filter(patient=patient).exists():
                raise ValidationError({'patient_id': 'Pain assessment already exists for this patient.'})

            data = request.data.copy()
            data['patient'] = patient.id

            serializer = PainAssessmentSerializer(data=data)
            if not serializer.is_valid():
                raise ValidationError({"errors": serializer.errors})

            serializer.save()
            context['data'] = serializer.data

        except ValidationError as e:
            context['success'] = 0
            context['message'] = e.detail
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)


# GET Pain Assessment
class GetPainAssessmentAPIView(APIView):
    def get(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Pain assessment retrieved successfully.",
            "data": {}
        }
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            pain_assessment = PainAssessment.objects.get(patient=patient)
            serializer = PainAssessmentSerializer(pain_assessment)
            context["data"] = serializer.data
        except Patient.DoesNotExist:
            context["success"] = 0
            context["message"] = "Patient not found."
        except PainAssessment.DoesNotExist:
            context["success"] = 0
            context["message"] = f"Pain assessment not found for this patient ID {patient_id}"
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_200_OK if context["success"] else status.HTTP_400_BAD_REQUEST)


# PUT Pain Assessment

class UpdatePainAssessmentAPIView(APIView):
    # GET Method - Retrieve Pain Assessment Data
    def get(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Pain assessment retrieved successfully.",
            "data": {}
        }
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            pain_assessment = PainAssessment.objects.get(patient=patient)
            serializer = PainAssessmentSerializer(pain_assessment)
            context["data"] = serializer.data
        except Patient.DoesNotExist:
            context["success"] = 0
            context["message"] = "Patient not found."
        except PainAssessment.DoesNotExist:
            context["success"] = 0
            context["message"] = f"Pain assessment not found for this patient ID {patient_id}."
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_200_OK if context["success"] else status.HTTP_400_BAD_REQUEST)

    # PUT Method - Update Pain Assessment Data
    def put(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Pain assessment updated successfully.",
            "data": {}
        }
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            pain_assessment = PainAssessment.objects.get(patient=patient)
            serializer = PainAssessmentSerializer(pain_assessment, data=request.data, partial=True)

            if serializer.is_valid():
                serializer.save()
                context["data"] = serializer.data
            else:
                raise ValueError(serializer.errors)

        except Patient.DoesNotExist:
            context["success"] = 0
            context["message"] = "Patient not found."
        except PainAssessment.DoesNotExist:
            context["success"] = 0
            context["message"] = f"Pain assessment not found for this patient ID {patient_id}."
        except ValueError as e:
            context["success"] = 0
            context["message"] = str(e)
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_200_OK if context["success"] else status.HTTP_400_BAD_REQUEST)



# Initial Assessment

# create Initial Assessment

class CreateInitialAssessmentAPIView(APIView):
    def get(self, request):
        return Response({"message": "Use POST to create an initial assessment"}, status=status.HTTP_200_OK)

    def post(self, request):
        context = {
            "success": 1,
            "message": "Initial assessment created successfully.",
            "data": {}
        }
        try:
            patient_id = request.data.get('patient_id')
            if not patient_id:
                raise ValidationError({'patient_id': 'This field is required.'})

            try:
                patient = Patient.objects.get(patient_id=patient_id)
            except Patient.DoesNotExist:
                raise ValidationError({'patient_id': 'Invalid patient ID.'})

            # Check if Initial Assessment already exists
            if InitialAssessment.objects.filter(patient=patient).exists():
                raise ValidationError({'patient_id': 'Initial assessment already exists for this patient.'})

            data = request.data.copy()
            data['patient'] = patient.id

            serializer = InitialAssessmentSerializer(data=data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            serializer.save()
            context['data'] = serializer.data

        except ValidationError as e:
            context['success'] = 0
            context['message'] = e.detail
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)

# Retrieve Initial Assessment

class GetInitialAssessmentAPIView(APIView):
    def get(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Initial assessment retrieved successfully.",
            "data": {}
        }
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            initial_assessment = InitialAssessment.objects.get(patient=patient)
            serializer = InitialAssessmentSerializer(initial_assessment)
            context["data"] = serializer.data
        except Patient.DoesNotExist:
            context["success"] = 0
            context["message"] = "Patient not found."
        except InitialAssessment.DoesNotExist:
            context["success"] = 0
            context["message"] = f"Initial assessment not found for this patient ID {patient_id}."
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_200_OK if context["success"] else status.HTTP_400_BAD_REQUEST)


# Update Initial Assessment

class UpdateInitialAssessmentAPIView(APIView):
    def get(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Initial assessment retrieved successfully.",
            "data": {}
        }
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            initial_assessment = InitialAssessment.objects.get(patient=patient)
            serializer = InitialAssessmentSerializer(initial_assessment)
            context["data"] = serializer.data
        except Patient.DoesNotExist:
            context["success"] = 0
            context["message"] = "Patient not found."
        except InitialAssessment.DoesNotExist:
            context["success"] = 0
            context["message"] = f"Initial assessment not found for this patient ID {patient_id}."
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_200_OK if context["success"] else status.HTTP_400_BAD_REQUEST)

    def put(self, request, patient_id):
        context = {
            "success": 1,
            "message": "Initial assessment updated successfully.",
            "data": {}
        }
        try:
            patient = Patient.objects.get(patient_id=patient_id)
            initial_assessment = InitialAssessment.objects.get(patient=patient)

            serializer = InitialAssessmentSerializer(initial_assessment, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                context["data"] = serializer.data
            else:
                raise Exception(serializer.errors)
        except Patient.DoesNotExist:
            context["success"] = 0
            context["message"] = "Patient not found."
        except InitialAssessment.DoesNotExist:
            context["success"] = 0
            context["message"] = f"Initial assessment not found for this patient ID {patient_id}."
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_200_OK if context["success"] else status.HTTP_400_BAD_REQUEST)


# CarePlan Feedback

class CarePlanFeedbackAPIView(APIView):
    def get(self, request):
        return Response({"message": "Use POST to create care plan feedback"}, status=status.HTTP_200_OK)

    def post(self, request):
        context = {
            "success": 1,
            "message": "Data saved successfully",
            "data": {}
        }

        try:
            # Validate request data
            validator = validators.CarePlanFeedbackValidator(data=request.data)
            if not validator.is_valid():
                raise ValueError(validator.errors)

            req_params = validator.validated_data

            # Check if patient exists
            try:
                patient = models.Patient.objects.get(patient_id=req_params['patient'])
            except ObjectDoesNotExist:
                return Response(
                    {
                        "success": 0,
                        "message": f"No patient found with ID {req_params['patient']}. Please check and try again.",
                        "data": {}
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Ensure only one CarePlanFeedback entry per patient
            feedback, created = models.CarePlanFeedback.objects.get_or_create(
                patient=patient,
                defaults={
                    "feedback_on_services": req_params["feedback_on_services"],
                    "provisional_feedback": req_params["provisional_feedback"],
                    "feedback_plan": req_params["feedback_plan"],
                    "expected_outcome": req_params["expected_outcome"],
                    "preventive_feedback_aspects": req_params["preventive_feedback_aspects"]
                }
            )

            if not created:
                feedback.feedback_on_services = req_params["feedback_on_services"]
                feedback.provisional_feedback = req_params["provisional_feedback"]
                feedback.feedback_plan = req_params["feedback_plan"]
                feedback.expected_outcome = req_params["expected_outcome"]
                feedback.preventive_feedback_aspects = req_params["preventive_feedback_aspects"]
                feedback.save()

            serializer = CarePlanFeedbackSerializer(feedback, context={"request": request})
            context["data"] = {"care_plan_feedback_details": serializer.data}

        except ValueError as e:
            context["success"] = 0
            context["message"] = str(e)
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_201_CREATED if context["success"] else status.HTTP_400_BAD_REQUEST)

class CarePlanFeedbackListAPIView(APIView):
    def get(self, request, patient_id):
        care_plan_feedbacks = models.CarePlanFeedback.objects.filter(patient__patient_id=patient_id)

        if not care_plan_feedbacks.exists():
            return Response({
                "success": 0,
                "message": f"No care plan feedback found for patient ID {patient_id}.",
                "data": []
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = CarePlanFeedbackSerializer(care_plan_feedbacks, many=True, context={"request": request})

        return Response({
            "success": 1,
            "message": "Care plan feedback retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

class CarePlanFeedbackUpdateAPIView(APIView):
    def get(self, request, patient_id):
        careplan_feedbacks = models.CarePlanFeedback.objects.filter(patient__patient_id=patient_id)

        if not careplan_feedbacks.exists():
            return Response({
                "success": 0,
                "message": f"No care plan feedback found for patient ID {patient_id}.",
                "data": []
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = CarePlanFeedbackSerializer(careplan_feedbacks, many=True, context={"request": request})

        return Response({
            "success": 1,
            "message": "Care plan feedback retrieved successfully.",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request, patient_id):
        context = {
            "success": 1,
            "message": messages.DATA_UPDATED,
            "data": {}
        }
        
        try:
            # Fetch patient using patient_id
            try:
                patient = models.Patient.objects.get(patient_id=patient_id)
            except ObjectDoesNotExist:
                return Response({
                    "success": 0,
                    "message": f"No patient found with ID {patient_id}.",
                    "data": {}
                }, status=status.HTTP_400_BAD_REQUEST)

            # Fetch the latest CarePlanFeedback entry for this patient
            careplan_feedback = models.CarePlanFeedback.objects.filter(patient=patient).last()
            if not careplan_feedback:
                return Response({
                    "success": 0,
                    "message": f"No care plan feedback found for patient ID {patient_id}.",
                    "data": {}
                }, status=status.HTTP_404_NOT_FOUND)

            # Validate request data using update validator
            validator = validators.CarePlanFeedbackUpdateValidator(data=request.data)
            if not validator.is_valid():
                raise SerializerError(validator.errors)

            req_params = validator.validated_data

            # Update CarePlanFeedback object with validated data
            careplan_feedback.feedback_on_services = req_params["feedback_on_services"]
            careplan_feedback.provisional_feedback = req_params["provisional_feedback"]
            careplan_feedback.feedback_plan = req_params["feedback_plan"]
            careplan_feedback.expected_outcome = req_params["expected_outcome"]
            careplan_feedback.preventive_feedback_aspects = req_params["preventive_feedback_aspects"]
            careplan_feedback.save()

            # Serialize the updated record
            serializer = CarePlanFeedbackSerializer(careplan_feedback, context={"request": request})
            context["data"] = serializer.data

        except SerializerError as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)

        return Response(context, status=status.HTTP_200_OK)



# Risk Assessment

def validate_patient_id(patient_id):
    if not (patient_id.startswith("P") and patient_id[1:].isdigit()):
        raise ValidationError({'patient_id': 'Invalid format. Expected format: P001'})
    

@method_decorator(csrf_exempt, name='dispatch')
class CreateMultipleRiskFactorsAPIView(APIView):
    RISK_FACTOR_SERIALIZERS = {
        1: RiskFactor1Serializer,
        2: RiskFactor2Serializer,
        3: RiskFactor3Serializer,
        4: RiskFactor4Serializer,
    }

    def get(self, request, *args, **kwargs):
        return Response({"message": "Use POST to create multiple risk factors"}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        context = {
            "success": 1,
            "message": "Risk factors created successfully.",
            "data": {}
        }

        try:
            patient_id = request.data.get('patient_id')
            if not patient_id:
                raise ValidationError({'patient_id': 'This field is required.'})
            validate_patient_id(patient_id)

            try:
                patient = Patient.objects.get(patient_id=patient_id)
            except Patient.DoesNotExist:
                raise ValidationError({'patient_id': 'Patient not found.'})

            # Loop through each risk factor data in the request
            risk_factors_data = request.data.get('risk_factors', [])
            if not risk_factors_data:
                raise ValidationError({'risk_factors': 'This field is required.'})

            results = []

            for risk_factor_data in risk_factors_data:
                risk_factor_id = risk_factor_data.get('risk_factor_id')
                if risk_factor_id not in self.RISK_FACTOR_SERIALIZERS:
                    results.append({"risk_factor_id": risk_factor_id, "success": 0, "message": "Invalid risk factor ID."})
                    continue

                # Add patient to each risk factor's data
                data = risk_factor_data.copy()
                data['patient'] = patient.id

                # Get dynamic fields for the serializer
                serializer_class = self.RISK_FACTOR_SERIALIZERS[risk_factor_id]
                boolean_fields = [
                    field for field, field_type in serializer_class().get_fields().items()
                    if isinstance(field_type, serializers.BooleanField)
                ]

                # Calculate total_score based on boolean fields
                data['total_score'] = sum(data.get(field, False) for field in boolean_fields)

                serializer = serializer_class(data=data)

                if not serializer.is_valid():
                    results.append({"risk_factor_id": risk_factor_id, "success": 0, "message": serializer.errors})
                    continue

                serializer.save()
                results.append({"risk_factor_id": risk_factor_id, "success": 1, "message": f"Risk factor {risk_factor_id} created successfully.", "data": serializer.data})

            context['data'] = results

        except ValidationError as e:
            context['success'] = 0
            context['message'] = str(e)
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)





class RetrieveMultipleRiskFactorsAPIView(APIView):
    RISK_FACTOR_SERIALIZERS = {
        1: RiskFactor1Serializer,
        2: RiskFactor2Serializer,
        3: RiskFactor3Serializer,
        4: RiskFactor4Serializer,
    }

    def get(self, request, patient_id, *args, **kwargs):
        context = {
            "success": 1,
            "message": "Risk factors retrieved successfully.",
            "data": {}
        }

        try:
            # Validate and check if the patient exists
            patient = Patient.objects.get(patient_id=patient_id)

            print(request.data)

            # Dictionary to store risk factor data
            risk_factors_data = {}

            # Define boolean fields for each risk factor
            risk_factor_boolean_fields = {
                1: ['minor_surgery', 'age_40_to_60_yrs', 'pregnancy_or_post_martum',
                    'varicose_veins', 'inflammatory_bowel_disease', 'obesity', 'combined_oral', 'contraceptives_or_HRT'],
                2: ['age_over_60_yrs', 'malignancy', 'major_surgery',
                    'immobilising_plaster_cast', 'medical_or_surgical', 'patients_confined_to', 'bed_72_hrs', 'central_venous_access'],
                3: ['history_of_DVT_or_PE', 'myocardial_infarction', 'congestive_heart_failure',
                    'severe_sepsis_or_infection', 'factor_V_leiden_or_activated',
                    'protein_C_resistance', 'antithrombin_III_deficiency', 'proteins_C_and_S_deficiency', 
                    'dysfibrinogenemia', 'homocysteinemia', 'prothrombin_mutation_20210A', 'lupus_anticoagulant', 
                    'antiphospholipid_antibodies', 'myeloproliferative_disorders'],
                4: ['elective_major_lower', 'extremity', 'arthroplasty',
                    'stroke_feedbackhip_pelvis_or_leg_fracture', 'stroke', 'multiple_trauma',
                    'acute_spinal_cord_injury'],
            }

            # Define scoring increments for each risk factor
            score_weights = {
                1: 1,
                2: 2,
                3: 3,
                4: 5
            }

            # Iterate through each risk factor
            for risk_factor_id in range(1, 5):
                risk_factor_model = globals()[f'RiskFactor{risk_factor_id}']
                serializer_class = self.RISK_FACTOR_SERIALIZERS[risk_factor_id]
                risk_factor_data = risk_factor_model.objects.filter(patient=patient)

                # Get the weight for current risk_factor_id
                weight = score_weights.get(risk_factor_id, 1)

                # Calculate total_score for each risk factor object
                serialized_data = []
                for obj in risk_factor_data:
                    data = serializer_class(obj).data
                    
                    # Adjusted total_score calculation based on risk_factor_id
                    data['total_score'] = sum(weight for field in risk_factor_boolean_fields[risk_factor_id] if data.get(field, False))

                    serialized_data.append(data)

                if serialized_data:
                    risk_factors_data[f'risk_factor_{risk_factor_id}'] = serialized_data

            if risk_factors_data:
                context['data'] = risk_factors_data
            else:
                context['success'] = 0
                context['message'] = f"No risk factor data found for this patient ID {patient_id}."

        except Patient.DoesNotExist:
            context['success'] = 0
            context['message'] = "Patient not found."
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)




@method_decorator(csrf_exempt, name='dispatch')
class UpdateMultipleRiskFactorsAPIView(APIView):
    RISK_FACTOR_SERIALIZERS = {
        1: RiskFactor1Serializer,
        2: RiskFactor2Serializer,
        3: RiskFactor3Serializer,
        4: RiskFactor4Serializer,
    }

    def get(self, request, patient_id, *args, **kwargs):
        context = {
            "success": 1,
            "message": "Risk factors retrieved successfully.",
            "data": {}
        }

        try:
            # Validate and check if the patient exists
            patient = Patient.objects.get(patient_id=patient_id)

            # Dictionary to store risk factor data
            risk_factors_data = {}

            # Define boolean fields for each risk factor
            risk_factor_boolean_fields = {
                1: ['minor_surgery', 'age_40_to_60_yrs', 'pregnancy_or_post_martum',
                    'varicose_veins', 'inflammatory_bowel_disease', 'obesity', 'combined_oral', 'contraceptives_or_HRT'],
                2: ['age_over_60_yrs', 'malignancy', 'major_surgery',
                    'immobilising_plaster_cast', 'medical_or_surgical', 'patients_confined_to', 'bed_72_hrs', 'central_venous_access'],
                3: ['history_of_DVT_or_PE', 'myocardial_infarction', 'congestive_heart_failure',
                    'severe_sepsis_or_infection', 'factor_V_leiden_or_activated',
                    'protein_C_resistance', 'antithrombin_III_deficiency', 'proteins_C_and_S_deficiency', 
                    'dysfibrinogenemia', 'homocysteinemia', 'prothrombin_mutation_20210A', 'lupus_anticoagulant', 
                    'antiphospholipid_antibodies', 'myeloproliferative_disorders'],
                4: ['elective_major_lower', 'extremity', 'arthroplasty',
                    'stroke_feedbackhip_pelvis_or_leg_fracture', 'stroke', 'multiple_trauma',
                    'acute_spinal_cord_injury'],
            }

            # Define scoring increments for each risk factor
            score_weights = {
                1: 1,
                2: 2,
                3: 3,
                4: 5
            }

            # Iterate through each risk factor
            for risk_factor_id in range(1, 5):
                risk_factor_model = globals()[f'RiskFactor{risk_factor_id}']
                serializer_class = self.RISK_FACTOR_SERIALIZERS[risk_factor_id]
                risk_factor_data = risk_factor_model.objects.filter(patient=patient)

                # Get the weight for current risk_factor_id
                weight = score_weights.get(risk_factor_id, 1)

                # Calculate total_score for each risk factor object
                serialized_data = []
                for obj in risk_factor_data:
                    data = serializer_class(obj).data
                    
                    # Adjusted total_score calculation based on risk_factor_id
                    data['total_score'] = sum(weight for field in risk_factor_boolean_fields[risk_factor_id] if data.get(field, False))

                    serialized_data.append(data)

                if serialized_data:
                    risk_factors_data[f'risk_factor_{risk_factor_id}'] = serialized_data

            if risk_factors_data:
                context['data'] = risk_factors_data
            else:
                context['success'] = 0
                context['message'] = f"No risk factor data found for this patient ID {patient_id}."

        except Patient.DoesNotExist:
            context['success'] = 0
            context['message'] = "Patient not found."
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)


    def put(self, request, patient_id, *args, **kwargs):
        context = {
            "success": 1,
            "message": "Risk factors updated successfully.",
            "data": {}
        }

        try:
            # Validate and check if the patient exists
            patient = Patient.objects.get(patient_id=patient_id)

            # Get the risk factors data from the request
            risk_factors_data = request.data.get('risk_factors', [])
            if not risk_factors_data:
                raise ValidationError({'risk_factors': 'This field is required.'})

            results = []

            # Iterate through each risk factor data to update
            for risk_factor_data in risk_factors_data:
                risk_factor_id = risk_factor_data.get('risk_factor_id')
                if risk_factor_id not in self.RISK_FACTOR_SERIALIZERS:
                    results.append({"risk_factor_id": risk_factor_id, "success": 0, "message": "Invalid risk factor ID."})
                    continue

                # Fetch the existing risk factor instance
                risk_factor_model = globals()[f'RiskFactor{risk_factor_id}']
                risk_factor_instance = risk_factor_model.objects.get(patient=patient)

                # Add patient to the risk factor data
                data = risk_factor_data.copy()
                data['patient'] = patient.id

                # Get serializer for the corresponding risk factor ID
                serializer_class = self.RISK_FACTOR_SERIALIZERS[risk_factor_id]
                serializer = serializer_class(risk_factor_instance, data=data, partial=True)

                if not serializer.is_valid():
                    results.append({"risk_factor_id": risk_factor_id, "success": 0, "message": serializer.errors})
                    continue

                # Save the updated data
                serializer.save()
                results.append({"risk_factor_id": risk_factor_id, "success": 1, "message": f"Risk factor {risk_factor_id} updated successfully.", "data": serializer.data})

            context['data'] = results

        except Patient.DoesNotExist:
            context['success'] = 0
            context['message'] = "Patient not found."
        except Exception as e:
            context['success'] = 0
            context['message'] = str(e)

        return Response(context)


