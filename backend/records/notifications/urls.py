from django.urls import path
from .views import MarkAsReadView,CombinedDashboardNotificationAPIView,NotificationApprovalAPIView

urlpatterns=[
    path('list/',CombinedDashboardNotificationAPIView.as_view(), name='notification-list'),
    path('mark-as-read/<int:pk>/',MarkAsReadView.as_view(), name='notification-mark-as-read'),
   path('update-status/<int:pk>/',NotificationApprovalAPIView.as_view(), name='update-status'),

]