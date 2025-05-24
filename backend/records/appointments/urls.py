from django.urls import path
from .views import *

# create your appointments requests here

urlpatterns =[
    path('get-appointments/<str:appointment_id>/',AppointmentRetrieveAPIView.as_view(),name='get-appointments'),
    path('get-appointments-list/',AppointmentListAPIView.as_view(),name='get-appointments-list'),
    path('create-appointments/',AppointmentCreateAPIView.as_view(),name='create-appointments'),
    path('reschedule-appointment/<str:appointment_id>/',AppointmentRescheduleAPIView.as_view(),name='reschedule-appointment'),
    path('cancel-appointment/<str:appointment_id>/',AppointmentCancelAPIView.as_view(),name='cancel-appointment'),
]