from django.urls import path
from django.http import HttpResponse
from .views import *



urlpatterns = [ 
    path('doctors/', DoctorAvailabilityListView.as_view(), name='doctor-list'),
    path('doctors/create/', DoctorAvailabilityCreateView.as_view(), name='doctor-create'),
    path('doctors/<int:pk>/', DoctorAvailabilityDetailView.as_view(), name='doctor-detail'),
    path('doctors/<int:pk>/update/', DoctorAvailabilityUpdateView.as_view(), name='doctor-update'),
    path('doctor/',DoctorSearchView.as_view(),name='doctor'),
]
