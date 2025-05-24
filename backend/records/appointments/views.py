from django.shortcuts import render,get_object_or_404
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from . import models, serializers, validators
from rest_framework.serializers import ValidationError
from django.db.models import Q
from datetime import timedelta
from core.messages import DATA_SAVED
from django.utils.timezone import now
from datetime import timedelta
from django.db.models import Q
from . import models, serializers as app_serializers, validators
from doctors.models import DoctorAvailability
from rest_framework.exceptions import NotFound
 
# Create your views here.
 
class AppointmentCreateAPIView(APIView):
    def get(self, request):
        return Response({"message": "Use POST to create an appointment"}, status=200)
 
    def post(self, request):
        context = {
            "success": 1,
            "message": "Data saved successfully",
            "data": {}
        }

        try:
            validator = validators.AppointmentValidator(data=request.data)
            if not validator.is_valid():
                raise ValidationError(validator.errors)
 
            req_params = validator.validated_data
 
            patient = models.Patient.objects.filter(
                (Q(phno=req_params["phno"]) & Q(patient_name__iexact=req_params["patient_name"])) |
                (Q(email=req_params["email"]) & Q(patient_name__iexact=req_params["patient_name"]))
            ).first()

            doctor = models.DoctorAvailability.objects.filter(d_name__iexact=req_params["doctor"]).first()

            if not doctor:
                raise Exception("Doctor not found")
 
            if not patient:
                patient = models.Patient.objects.create(
                    patient_name=req_params["patient_name"],
                    doctor_name=req_params["doctor"],
                    date=req_params["date"],
                    time=req_params["time"],
                    age=req_params["age"],
                    appointment_type=req_params["appointment_type"],
                    notes=req_params.get("notes", ""),
                    gender=req_params["gender"],
                    phno=req_params["phno"],
                    email=req_params["email"],
                    blood_group=req_params.get("blood_group"),
                    ward_no=req_params.get("ward_no"),
                    diagnosis=req_params.get("diagnosis"),
                )
 
            appointment = models.Appointment.objects.create(
                patient=patient,
                patient_name=req_params["patient_name"],
                doctor=doctor,
                date=req_params["date"],
                time=req_params["time"],
                age=req_params["age"],
                appointment_type=req_params["appointment_type"],
                notes=req_params.get("notes", ""),
                gender=req_params["gender"],
                phno=req_params["phno"],
                email=req_params["email"],
                blood_group=req_params.get("blood_group"),
            )
 
            serializer = serializers.AppointmentSerializer(appointment, context={"request": request})
 
            inpatients = models.Appointment.objects.filter(appointment_type='inpatient').count()
            outpatients = models.Appointment.objects.filter(appointment_type='outpatient').count()
            casualty = models.Appointment.objects.filter(appointment_type='casuality').count()
            total_active_cases = inpatients+outpatients+casualty
 
            context["data"] = {
                "appointment": serializer.data,
                "active_cases": {
                    "inpatients": inpatients,
                    "outpatients": outpatients,
                    "casualty": casualty,
                    "total":total_active_cases
                }
            }
 
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
 
        return Response(context)
 
 
 
class AppointmentRetrieveAPIView(APIView):
    def get(self, request, appointment_id):
        context = {
            "success": 1,
            "message": "Appointment fetched successfully",
            "data": {}
        }
 
        try:
            today = now().date()
 
            # Retrieve the appointment by appointment_id
            appointment = get_object_or_404(models.Appointment, appointment_id=appointment_id)
 
            # Serialize the appointment
            serializer = app_serializers.AppointmentSerializer(appointment, context={"request": request})
 
            # Statistics (consistent with POST view format)
            inpatients = models.Appointment.objects.filter(appointment_type='inpatient').count()
            outpatients = models.Appointment.objects.filter(appointment_type='outpatient').count()
            casualty = models.Appointment.objects.filter(appointment_type='casuality').count()
            total_active_cases = inpatients+outpatients+casualty
 
            total_doctors = DoctorAvailability.objects.count()
            todays_appointments = models.Appointment.objects.filter(date=today).count()
            urgent_appointments = models.Appointment.objects.filter(date=today, notes__icontains='urgent').count()
            total_appointments = models.Appointment.objects.count()
 
            context["data"] = {
                "appointment": serializer.data,
                "stats": {
                    "total_patients_today": todays_appointments,
                    "doctors_available": total_doctors,
                    "todays_appointments": todays_appointments,
                    "urgent": urgent_appointments,
                    "active_cases": {
                        "inpatients": inpatients,
                        "outpatients": outpatients,
                        "casualty": casualty,
                        "total":total_active_cases
                    },
                    "total_appointments": total_appointments
                }
            }
 
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
 
        return Response(context)
 
 
 
class AppointmentListAPIView(APIView):
    def get(self, request):
        context = {
            "success": 1,
            "message": "Appointments fetched successfully",
            "data": {}
        }
 
        try:
            today = now().date()
            queryset = models.Appointment.objects.all()
            print("Serializing appointments:", queryset)
 
            # Filters
            search_query = request.query_params.get('search', '')
            appointment_type = request.query_params.get('appointment_type')
            date_param = request.query_params.get('date')
            filter_type = request.query_params.get('filter')
 
            # Search by ID, patient name, or phone number
            if search_query:
                queryset = queryset.filter(
                    Q(appointment_id__icontains=search_query) |
                    Q(patient_name__icontains=search_query) |
                    Q(phno__icontains=search_query)
                )
 
            # Filter by appointment type
            if appointment_type:
                queryset = queryset.filter(appointment_type=appointment_type)
 
 
            # Filter by specific date
            if date_param:
                queryset = queryset.filter(date=date_param)
            else:
                # Predefined filters
                if not filter_type or filter_type == 'today':
                    queryset = queryset.filter(date=today)
                elif filter_type == 'upcoming_week':
                    next_week = today + timedelta(days=7)
                    queryset = queryset.filter(date__range=[today, next_week])
                elif filter_type == 'this_month':
                    queryset = queryset.filter(date__month=today.month)# Return the serialized data as response
   
 
            # Serialize appointments
            serializer = app_serializers.AppointmentSerializer(queryset, many=True, context={"request": request})
 
            # Stats
            inpatients = models.Appointment.objects.filter(appointment_type='inpatient').count()
            outpatients = models.Appointment.objects.filter(appointment_type='outpatient').count()
            casualty = models.Appointment.objects.filter(appointment_type='casuality').count()
            total_active_cases = inpatients+outpatients+casualty
 
            total_doctors = DoctorAvailability.objects.count()
            todays_appointments = models.Appointment.objects.filter(date=today).count()
            urgent_appointments = models.Appointment.objects.filter(notes__isnull=False, notes__icontains='urgent').count()
            total_appointments = models.Appointment.objects.count()
 
            context["data"] = {
                "appointments": serializer.data,
                "total": queryset.count(),
                "stats": {
                    "total_patients_today": todays_appointments,
                    "doctors_available": total_doctors,
                    "todays_appointments": todays_appointments,
                    "urgent": urgent_appointments,
                    "active_cases": {
                        "inpatients": inpatients,
                        "outpatients": outpatients,
                        "casualty": casualty,
                        "total":total_active_cases
                    },
                    "total_appointments": total_appointments
                }
            }
 
        except Exception as e:
            import traceback
            traceback.print_exc()
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 
        return Response(context, status=status.HTTP_200_OK)
    

class AppointmentRescheduleAPIView(APIView):
    def post(self, request, appointment_id):
        context = {
            "success":1,
            "message":"Appointment rescheduled successfully",
            "data":{}
        }

        try:
            appointment = get_object_or_404(models.Appointment, appointment_id=appointment_id)

            new_date = request.data.get("date")
            new_time = request.data.get("time")

            if not new_date or not new_time:
                context["success"] = 0
                context["message"] = "Both 'date' and 'time' are required to reschedule"
                return Response(context,status=status.HTTP_400_BAD_REQUEST)
            
            appointment.date = new_date
            appointment.time = new_time
            appointment.save()

            serializer = app_serializers.AppointmentSerializer(appointment,context={"request":request})
            context["data"]=serializer.data

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(context, status=status.HTTP_200_OK)


class AppointmentCancelAPIView(APIView):
    def post(self, request, appointment_id):
        context = {
            "success":1,
            "message":"Appointment cancelled successfully",
            "data":{}
        }

        try:
            appointment = get_object_or_404(models.Appointment, appointment_id=appointment_id)

            if not appointment:
                raise ValidationError("Appointment already cancelled.")
            else:
                appointment.delete()
            
            serializer = app_serializers.AppointmentSerializer(appointment, context={'request':request})
            context["data"] = {
                "appointment":serializer.data
            }
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)
        return Response(context, status=status.HTTP_200_OK)
    
