from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.utils.timezone import now
from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError
from .models import DoctorAvailability
from .serializers import DoctorAvailabilitySerializer
from .serializers import AvailableSlotsSerializer
from django.db.models import Q
from django.core.cache import cache
from patients.models import Patient
from doctors.models import Department
from appointments.models import Appointment

# create your views here

class DoctorAvailabilityListView(APIView):
    def get(self, request):
        context = {
            "success": 1,
            "message": "Data fetched successfully.",
            "data": {},
            "total_doctors": 0
        }

        try:
            doctors = DoctorAvailability.objects.filter(is_guest=False)
            patients = Patient.objects.all()
            specialities = Department.objects.all()
            
            context["total_doctors"] = doctors.count()
            context["total_patients"] = patients.count()
            context["expertise"] = specialities.count()

            if not doctors.exists():
                return Response({"error": "No doctors found"}, status=status.HTTP_404_NOT_FOUND)

            doctor_data = []
            for doctor in doctors:
                slots = self.get_available_slots(doctor)
                patient_count = Patient.objects.filter(doctor=doctor).values('patient_name').distinct().count()
                doctor_data.append({
                    "d_id": doctor.d_id,
                    "d_name": doctor.d_name,
                    "d_department": str(doctor.d_department),
                    "d_phn_no": doctor.d_phn_no,
                    "d_email": doctor.d_email,
                    "d_ward_no": doctor.d_ward_no,
                    "d_start_time": doctor.d_start_time.strftime('%I:%M %p'),
                    "d_end_time": doctor.d_end_time.strftime('%I:%M %p'),
                    "d_education_info": doctor.d_education_info,
                    "d_certifications": doctor.d_certifications,
                    "d_available_days": doctor.d_available_days,
                    "d_available_slots": slots,
                    "patient_count":patient_count
                })
            context["data"] = doctor_data
           
        except Exception as e:
            return Response({"error": "An error occurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(context, status=status.HTTP_200_OK)

    def get_available_slots(self, doctor):
        today = now().date()
        current_day = today.strftime('%A')

        # Check if doctor is available today
        if current_day not in doctor.d_available_days:
            return []

        start_time = datetime.combine(today, doctor.d_start_time)
        end_time = datetime.combine(today, doctor.d_end_time)
       

        if doctor.d_start_time > doctor.d_end_time:
            end_time += timedelta(days=1)

        # Fetch today's appointments for the doctor
        appointments = Appointment.objects.filter(
            doctor=doctor,
            date=today
        ).values_list('time', flat=True)

        # Convert appointment times to a set of formatted time strings
        appointment_times = set([t.strftime('%I:%M %p') for t in appointments])

        slots = []
        hours_worked = 0
        current = start_time

        while current < end_time:
            time_str = current.strftime('%I:%M %p')
            if hours_worked > 0 and hours_worked % 4 == 0:
                slots.append({"time": time_str, "status": "Break"})
                current += timedelta(hours=1)
                hours_worked = 0
                continue

            status_str = "Scheduled" if time_str in appointment_times else "Available"
            slots.append({"time": time_str, "status": status_str})
            current += timedelta(hours=1)
            hours_worked += 1
      
        return slots


class DoctorAvailabilityDetailView(APIView):
    def get(self, request, pk=None, doctor_id=None):
        context = {
            "success": 1,
            "message": "Data fetched successfully.",
            "data": {}
        }

        try:
            if pk:
                doctor = get_object_or_404(DoctorAvailability, pk=pk)
                serializer = DoctorAvailabilitySerializer(doctor)
                slots = self.get_available_slots(doctor)
                context["data"] = serializer.data
                context["availability_slots"] = slots
            elif doctor_id:
                doctor = get_object_or_404(DoctorAvailability, id=doctor_id)
                slots = self.get_available_slots(doctor)
                context["data"] = {"doctor": doctor.d_name, "available_slots": slots}
            else:
                return Response({"error": "Doctor identifier not provided"}, status=status.HTTP_400_BAD_REQUEST)
        except DoctorAvailability.DoesNotExist:
            return Response({"error": "Doctor not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": "An error occurred", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(context, status=status.HTTP_200_OK)

    def get_available_slots(self, doctor):
        # Same as in DoctorAvailabilityListView
        today = now().date()
        start_time = datetime.combine(today, doctor.d_start_time)
        end_time = datetime.combine(today, doctor.d_end_time)
        slots = []
        hours_worked = 0

        if doctor.d_start_time > doctor.d_end_time:
            end_time += timedelta(days=1)

        while start_time < end_time:
            time_str = start_time.strftime('%I:%M %p')
            if hours_worked > 0 and hours_worked % 4 == 0:
                slots.append({"time": time_str, "status": "Break"})
                start_time += timedelta(hours=1)
                hours_worked = 0
                continue
            slots.append({"time": time_str, "status": "Available"})
            start_time += timedelta(hours=1)
            hours_worked += 1

        return slots


class DoctorAvailabilityCreateView(APIView):
    def post(self, request):
        context = {
            "success": 1,
            "message": "Data saved successfully.",
            "data": {}
        }

        try:
            serializer = DoctorAvailabilitySerializer(data=request.data)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            doctor = serializer.save()
            context["data"] = DoctorAvailabilitySerializer(doctor).data
        except ValidationError as e:
            context["success"] = 0
            context["message"] = e.args[0]
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_201_CREATED if context["success"] else status.HTTP_400_BAD_REQUEST)


class DoctorAvailabilityUpdateView(APIView):
    def put(self, request, pk):
        context = {
            "success": 1,
            "message": "Data updated successfully.",
            "data": {}
        }

        try:
            doctor = get_object_or_404(DoctorAvailability, pk=pk)
            serializer = DoctorAvailabilitySerializer(doctor, data=request.data, partial=True)
            if not serializer.is_valid():
                raise ValidationError(serializer.errors)

            doctor = serializer.save()
            context["data"] = DoctorAvailabilitySerializer(doctor).data
        except ValidationError as e:
            context["success"] = 0
            context["message"] = e.args[0]
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)

        return Response(context, status=status.HTTP_200_OK if context["success"] else status.HTTP_400_BAD_REQUEST)


class DoctorSearchView(APIView):
    def get(self, request, *args, **kwargs):
        try:
            doctors = DoctorAvailability.objects.all()
            
            d_id = request.query_params.get('d_id', None)
            d_name = request.query_params.get('d_name', None)
            d_department_name = request.query_params.get('d_department_name', None)
            
            if d_id:
                doctors = doctors.filter(d_id=d_id)
            if d_name:
                doctors = doctors.filter(d_name__icontains=d_name)
            if d_department_name:
                doctors = doctors.filter(d_department__name__icontains=d_department_name)
            
            serializer = DoctorAvailabilitySerializer(doctors, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

