from django.urls import path
from p_invoice.views import (
    CreatePharmacyInvoiceAPIView,
    PharmacyInvoiceDetailAPIView,
    PharmacyInvoiceListAPIView,
    MedicationSearchByNameAPIView,
    MedicationSearchByIdAPIView,
    RecentPharmacyInvoicesAPIView,
    InvoiceDownloadAPIView,
)
 
urlpatterns = [
    path('create-invoice-with-items/', CreatePharmacyInvoiceAPIView.as_view(), name='create-invoice-with-items'),
    path("list-all-invoices/", PharmacyInvoiceListAPIView.as_view(), name="list-all-invoices"),
    path('list-invoice-with-items/<int:invoice_id>/',PharmacyInvoiceDetailAPIView.as_view(), name='list-invoice-with-items'),
    path('pharmacy/search/', MedicationSearchByNameAPIView.as_view(), name='pharmacy-invoice-item-search-by-name'),
    path('medications/search-by-id/<int:medication_id>/', MedicationSearchByIdAPIView.as_view(), name='pharmacy-invoice-item-search-by-id'),
    path('pharmacy/recent-invoices/', RecentPharmacyInvoicesAPIView.as_view(), name='filter-recent-invoices'),
    path('pharmacy/invoice/download/<int:pk>/', InvoiceDownloadAPIView.as_view(), name='invoice-download'),
]