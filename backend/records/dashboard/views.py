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
            # Get filter for appointments
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

            # Total stats (not filtered)
            current = datetime.now()
            this = timezone.now()
            # Get the start of the current week (Monday)
            start_of_week = this - timedelta(days=this.weekday())

            # Filter and count doctors added since the start of the week
            increased_doctors = DoctorAvailability.objects.filter(created_at__gte=start_of_week).count()

            patients = Patient.objects.count()
            patients_this_month = Patient.objects.filter(created_at__year=current.year, created_at__month=current.month).count()
            if patients>0:
                increased_patients = round((patients_this_month * 100)/patients)
            else:
                increased_patients = 0 
            doctors = DoctorAvailability.objects.count()
            todays_appointments = Appointment.objects.filter(date=now().date()).count()
            critical_cases = ProgressNote.objects.filter(status="critical").count()
            urgent_appointments = Appointment.objects.filter(date=end_date, notes__icontains='urgent').count()
            cardiology_id = Department.objects.get(name='Cardiology').id
            ent_id = Department.objects.get(name='ENT').id
            dermatology_id = Department.objects.get(name='Dermatology').id
            neurology_id = Department.objects.get(name='Neurology').id
            dentistry_id = Department.objects.get(name='Dentistry').id
            ophthalmology_id = Department.objects.get(name='Ophthalmology').id
            cardiology = DoctorAvailability.objects.filter(d_department=cardiology_id).count()
            ent = DoctorAvailability.objects.filter(d_department=ent_id).count()
            dermatology = DoctorAvailability.objects.filter(d_department=dermatology_id).count()
            neurology = DoctorAvailability.objects.filter(d_department=neurology_id).count()
            dentistry = DoctorAvailability.objects.filter(d_department=dentistry_id).count()
            ophthalmology = DoctorAvailability.objects.filter(d_department=ophthalmology_id).count()


            # Filter appointments only if filter_param exists
            if start_date:
                appointments = Appointment.objects.filter(date__range=[start_date, end_date])
            else:
                appointments = Appointment.objects.all()
            print("Filtered Appointments:", Appointment.objects.filter(date__range=[start_date, end_date]).values_list('date', flat=True))

            serializer = AppointmentSerializer(appointments, many=True, context={"request": request})

            context["data"] = {
                "appointments": serializer.data,
                "stats": {
                    "patients": patients,
                    "increased_patients":increased_patients,
                    "doctors": doctors,
                    "increased_doctors":increased_doctors,
                    "todays_appointments": todays_appointments,
                    "critical_cases": critical_cases,
                    "urgent_appointments":urgent_appointments,
                    "cardiology":cardiology,
                    "ent":ent,
                    "dermatology":dermatology,
                    "neurology":neurology,
                    "dentistry":dentistry,
                    "ophthalmology":ophthalmology
                }
            }

        except Exception as e:
            context["success"] = 0
            context["message"] = str(e)
            return Response(context, status=status.HTTP_400_BAD_REQUEST)

        return Response(context, status=status.HTTP_200_OK)



