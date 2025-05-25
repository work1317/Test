from django.urls import path
from .views import MarkAsReadView,NotificationAPIView

urlpatterns=[
    path('list/',NotificationAPIView.as_view(), name='notification-list'),
    path('mark-as-read/<int:pk>/', MarkAsReadView.as_view(), name='notification-mark-as-read'),

]