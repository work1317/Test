from django.urls import path
from .views import DashboardAPIView

# create your dashboard requests here

urlpatterns = [
    path('dashboard/',DashboardAPIView.as_view(), name='dashboard'),
]