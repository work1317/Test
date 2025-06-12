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
from django.db.models import Q
from . import models, serializers as app_serializers, validators
from doctors.models import DoctorAvailability
from rest_framework.exceptions import NotFound
from patients.models import Patient
from rec_app.models import ProgressNote
from datetime import datetime, time
import calendar
from rest_framework.exceptions import ValidationError
from datetime import datetime, timedelta, date
from . import models, serializers, validators
from patients.models import Patient
from notifications.models import Notification

 
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

            doctor = models.DoctorAvailability.objects.filter(
                d_name__iexact=req_params["doctor"], is_guest=False
            ).first()

            if not doctor:
                raise Exception("Doctor not found")
            
            # Check if doctor has an approved notification
            doctor_notification = Notification.objects.filter(doctor=doctor).order_by('-created_at').first()

            if not doctor_notification or doctor_notification.approval_status != "approved":
                raise Exception(f"Doctor '{doctor.d_name}' is not yet approved by the superadmin.")

            # Convert date
            appointment_date = req_params["date"]
            if isinstance(appointment_date, str):
                appointment_date = datetime.strptime(appointment_date, "%Y-%m-%d").date()

            if appointment_date < date.today():
                raise Exception("Cannot book an appointment for a past date")
            

            # Convert time
            appointment_time = req_params["time"]
            if isinstance(appointment_time, str):
                appointment_time = datetime.strptime(appointment_time, "%H:%M").time()

            # Prevent booking for a past time today
            if appointment_date == date.today() and appointment_time < datetime.now().time():
                raise Exception("Cannot book an appointment for a past time today")

            # Validate appointment day
            day_name = calendar.day_name[appointment_date.weekday()]
            if day_name not in doctor.d_available_days:
                raise Exception(f"Doctor is not available on {day_name}. Available only on {doctor.d_available_days}")

            # Combine shift start and end datetime
            today = appointment_date
            start_time = datetime.combine(today, doctor.d_start_time)
            end_time = datetime.combine(today, doctor.d_end_time)

            # Handle overnight shift
            if doctor.d_end_time <= doctor.d_start_time:
                end_time += timedelta(days=1)

            # Combine appointment datetime
            appointment_datetime = datetime.combine(today, appointment_time)
            if doctor.d_end_time <= doctor.d_start_time and appointment_time < doctor.d_start_time:
                appointment_datetime += timedelta(days=1)

            if not (start_time <= appointment_datetime < end_time):
                raise Exception(
                    f"Doctor is only available between {doctor.d_start_time.strftime('%H:%M')} and "
                    f"{doctor.d_end_time.strftime('%H:%M')}"
                )

            # Calculate break time (1 hour break after every 4 hours)
            duty_duration = (end_time - start_time).total_seconds() / 3600

            if duty_duration >= 4:
                break_start_dt = start_time + timedelta(hours=4)
                break_end_dt = break_start_dt + timedelta(hours=1)

                if break_start_dt <= appointment_datetime < break_end_dt:
                    raise Exception(
                        f"Doctor is unavailable during break time from {break_start_dt.time().strftime('%H:%M')} "
                        f"to {break_end_dt.time().strftime('%H:%M')}"
                    )

            # Check if patient exists
            patient = models.Patient.objects.filter(
                (Q(phno=req_params["phno"]) & Q(patient_name__iexact=req_params["patient_name"])) |
                (Q(email=req_params["email"]) & Q(patient_name__iexact=req_params["patient_name"]))
            ).first()

            if not patient:
                patient = models.Patient.objects.create(
                    patient_name=req_params["patient_name"],
                    doctor=doctor,
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

            # Check if an appointment already exists for the same doctor at the same date and time
            existing_appointment = models.Appointment.objects.filter(
                doctor=doctor,
                date=appointment_date,
                time=appointment_time
            ).exists()

            if existing_appointment:
                raise Exception("An appointment is already scheduled for this doctor at the selected time. Please choose a different time slot.")

            # Create appointment
            appointment = models.Appointment.objects.create(
                patient=patient,
                patient_name=req_params["patient_name"],
                doctor=doctor,
                date=appointment_date,
                time=appointment_time,
                age=req_params["age"],
                appointment_type=req_params["appointment_type"],
                notes=req_params.get("notes", ""),
                gender=req_params["gender"],
                phno=req_params["phno"],
                email=req_params["email"],
                blood_group=req_params.get("blood_group"),
            )

            serializer = serializers.AppointmentSerializer(appointment, context={"request": request})

            # Count appointment types
            inpatients = models.Appointment.objects.filter(appointment_type='inpatient').count()
            outpatients = models.Appointment.objects.filter(appointment_type='outpatient').count()
            casualty = models.Appointment.objects.filter(appointment_type='casuality').count()
            total_active_cases = inpatients + outpatients + casualty

            context["data"] = {
                "appointment": serializer.data,
                "active_cases": {
                    "inpatients": inpatients,
                    "outpatients": outpatients,
                    "casualty": casualty,
                    "total": total_active_cases
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

            current = datetime.now()
            patients = Patient.objects.all().count()
            patients_this_month = Patient.objects.filter(created_at__year=current.year, created_at__month=current.month).count()
            if patients>0:
                increased_patients = round((patients_this_month * 100)/patients)
            else:
                increased_patients = 0
            print(increased_patients)
 
            context["data"] = {
                "appointment": serializer.data,
                "stats": {
                    "total_patients_today": todays_appointments,
                    "increased_patients":increased_patients,
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
            # print("Serializing appointments:", queryset)
 
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
            casualty = models.Patient.objects.filter(appointment_type='casuality').count()
            total_active_cases = inpatients+outpatients+casualty
 
            total_doctors = DoctorAvailability.objects.count()
            total_patients_today = Patient.objects.filter(created_at__date=today).count()
            todays_appointments = models.Appointment.objects.filter(date=today).count()
            urgent_appointments = models.Appointment.objects.filter(notes__isnull=False, notes__icontains='urgent').count()
            progress = ProgressNote.objects.filter(status="critical").count()
            critical_cases = casualty+progress
            total_appointments = models.Appointment.objects.count()


            current = datetime.now()
            patients = Patient.objects.all().count()
            patients_this_month = Patient.objects.filter(created_at__year=current.year, created_at__month=current.month).count()
            if patients>0:
                increased_patients = round((patients_this_month * 100)/patients)
            else:
                increased_patients = 0
            context["data"] = {
                "appointments": serializer.data,
                "total": queryset.count(),
                "stats": {
                    "total_patients_today": total_patients_today,
                    "increased_patients":increased_patients,
                    "doctors_available": total_doctors,
                    "todays_appointments": todays_appointments,
                    "urgent": urgent_appointments,
                    "critical_cases":critical_cases,
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
            "success": 1,
            "message": "Appointment rescheduled successfully",
            "data": {}
        }

        try:
            # Get and validate date
            date_str = request.data.get("date")
            time_str = request.data.get("time")

            if not date_str or not time_str:
                raise ValidationError("Both 'date' and 'time' are required for rescheduling.")

            try:
                appointment_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                raise ValidationError("Invalid date format. Expected YYYY-MM-DD.")

            try:
                appointment_time = datetime.strptime(time_str, "%H:%M").time()
            except ValueError:
                raise ValidationError("Invalid time format. Expected HH:MM.")
            
            appointment_datetime = datetime.combine(appointment_date, appointment_time)

            # ✅ BLOCK if rescheduling to a past datetime
            if appointment_date==date.today() and appointment_datetime < datetime.now():
                raise ValidationError("Cannot reschedule to a time earlier than the current time.")

            if appointment_date < date.today():
                raise ValidationError("Cannot reschedule to a past date.")

            appointment = models.Appointment.objects.filter(appointment_id=appointment_id).first()
            if not appointment:
                raise ValidationError("Appointment not found.")

            doctor = appointment.doctor

            # Validate doctor's available day
            day_name = calendar.day_name[appointment_date.weekday()]
            if day_name not in doctor.d_available_days:
                raise ValidationError(
                    f"Doctor is not available on {day_name}. Available only on {doctor.d_available_days}"
                )

            # Validate time within working hours
            today = appointment_date
            start_time = datetime.combine(today, doctor.d_start_time)
            end_time = datetime.combine(today, doctor.d_end_time)
            appointment_datetime = datetime.combine(today, appointment_time)

            # Overnight shift
            if doctor.d_end_time <= doctor.d_start_time:
                end_time += timedelta(days=1)
                if appointment_time < doctor.d_start_time:
                    appointment_datetime += timedelta(days=1)

            if not (start_time <= appointment_datetime <= end_time):
                raise ValidationError(
                    f"Doctor is only available between {doctor.d_start_time.strftime('%H:%M')} and "
                    f"{doctor.d_end_time.strftime('%H:%M')}"
                )

            # Break time validation
            duty_duration = (end_time - start_time).total_seconds() / 3600
            if duty_duration >= 4:
                break_start = start_time + timedelta(hours=4)
                break_end = break_start + timedelta(hours=1)

                if break_start <= appointment_datetime < break_end:
                    raise ValidationError(
                        f"Doctor is unavailable during break from {break_start.time().strftime('%H:%M')} "
                        f"to {break_end.time().strftime('%H:%M')}"
                    )

            # Update only date and time
            appointment.date = appointment_date
            appointment.time = appointment_time
            appointment.save()

            serializer = serializers.AppointmentSerializer(appointment, context={"request": request})
            context["data"] = serializer.data

        except ValidationError as ve:
            context["success"] = 0
            if isinstance(ve.detail, (list, dict)):
                context["message"] = ve.detail[0] if isinstance(ve.detail, list) else next(iter(ve.detail.values()))[0]
            else:
                context["message"] = str(ve.detail)
        except Exception as e:
            context["success"] = 0
            context["message"] = "Error while rescheduling appointment: " + str(e)

        return Response(context)




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
    
