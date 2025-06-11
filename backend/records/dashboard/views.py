from django.shortcuts import render,get_object_or_404
from appointments.models import Appointment
from appointments.serializers import AppointmentSerializer
from patients.models import Patient
from doctors.models import DoctorAvailability
from rec_app.models import ProgressNote
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.timezone import now
from dateutil.relativedelta import relativedelta
from datetime import timedelta
from django.utils import timezone
from datetime import datetime
from rest_framework import status
from doctors.models import Department

# Create your views here.

class DashboardAPIView(APIView):
    def get(self, request):
        context = {
            "success": 1,
            "message": "Fetched successfully",
            "data": {}
        }
 
        try:
            # Filter setup
            filter_param = request.query_params.get('filter', None)
            end_date = now().date()
            start_date = None
 
            if filter_param == 'today':
                start_date = end_date
            elif filter_param == 'past_week':
                start_date = end_date - timedelta(days=7)
            elif filter_param == 'past_month':
                start_date = end_date - relativedelta(months=1)
            elif filter_param == 'past_quarter':
                start_date = end_date - relativedelta(months=3)
            elif filter_param == 'past_year':
                start_date = end_date - relativedelta(years=1)
 
            current = datetime.now()
            this = now()
 
            # Week start for increased_doctors
            start_of_week = (this - timedelta(days=this.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
            increased_doctors = DoctorAvailability.objects.filter(created_at__gte=start_of_week).count()
 
            # Total patients and filtered patients
            patients_total = Patient.objects.count()
            if start_date:
                patients_filtered = Patient.objects.filter(created_at__date__range=[start_date, end_date]).count()
                doctors_filtered = DoctorAvailability.objects.filter(created_at__date__range=[start_date, end_date]).count()
            else:
                patients_filtered = patients_total
                doctors_filtered = DoctorAvailability.objects.count()
 
            # Percentage increase logic
            patients_this_month = Patient.objects.filter(created_at__year=current.year, created_at__month=current.month).count()
            increased_patients = round((patients_this_month * 100) / patients_total) if patients_total else 0
 
            todays_appointments = Appointment.objects.filter(date=end_date).count()
            casualty = Patient.objects.filter(appointment_type='casuality').count()
            progress = ProgressNote.objects.filter(status="critical").count()
            critical_cases = casualty + progress
            urgent_appointments = Appointment.objects.filter(date=end_date, notes__icontains='urgent').count()
 
            # Department-wise doctor count
            def get_department_count(name):
                dept = Department.objects.filter(name=name).first()
                return DoctorAvailability.objects.filter(d_department=dept).count() if dept else 0
 
            cardiology = get_department_count('Cardiology')
            ent = get_department_count('ENT')
            dermatology = get_department_count('Dermatology')
            neurology = get_department_count('Neurology')
            dentistry = get_department_count('Dentistry')
            ophthalmology = get_department_count('Ophthalmology')
 
            # Appointments filter
            appointments = Appointment.objects.filter(date__range=[start_date, end_date]) if start_date else Appointment.objects.all()
            serializer = AppointmentSerializer(appointments, many=True, context={"request": request})
 
            context["data"] = {
                "appointments": serializer.data,
                "stats": {
                    "patients_total": patients_total,
                    "patients_filtered": patients_filtered,
                    "doctors_total": DoctorAvailability.objects.count(),
                    "doctors_filtered": doctors_filtered,
                    "increased_patients": increased_patients,
                    "increased_doctors": increased_doctors,
                    "todays_appointments": todays_appointments,
                    "critical_cases": critical_cases,
                    "urgent_appointments": urgent_appointments,
                    "cardiology": cardiology,
                    "ent": ent,
                    "dermatology": dermatology,
                    "neurology": neurology,
                    "dentistry": dentistry,
                    "ophthalmology": ophthalmology
                }
            }
 
        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)
 
        return Response(context, status=status.HTTP_200_OK)


