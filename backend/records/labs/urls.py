from django.urls import path
from .views import (LabTestCreateAPIView,
                    LabTestListAPIView,
                    LabTestDetailAPIView,
                    LabTestDownloadAPIView,
                    LabInvoiceCreateAPIView,
                    LabInvoiceListAPIView,
                    LabInvoiceDetailAPIView)

urlpatterns = [
    path("create_lab_invoice/", LabInvoiceCreateAPIView.as_view(), name="lab-invoice-create"),
    path("invoice_lists/", LabInvoiceListAPIView.as_view(), name="lab-invoice-list"),
    path('invoice_lists/<int:pk>/', LabInvoiceDetailAPIView.as_view(), name='labinvoice-detail'),
    path('create_lab_test/',LabTestCreateAPIView.as_view(),name='create_lab_test'),
    path('lab_tests/', LabTestListAPIView.as_view(), name='labtest-list'),
    path('lab_tests/<int:pk>/', LabTestDetailAPIView.as_view(), name='labtest-detail'),  
    path('labtests_download/<int:pk>/', LabTestDownloadAPIView.as_view(), name='labtest-download'),
]
