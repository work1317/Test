from django.urls import path
from .views import *

# create your invoice serializers here

urlpatterns = [
    path('create-invoice/', InvoiceAPIView.as_view(), name='create-invoice'),
    path('get-invoice/<str:patient_id>/', InvoiceDetailAPIView.as_view(), name='invoice-detail'),
    path('get-invoice-by-id/<int:id>/', InvoicePrintAPIView.as_view(), name='invoice-print'),
    path('invoices/', AllInvoiceListAPIView.as_view(), name='invoices'),
]