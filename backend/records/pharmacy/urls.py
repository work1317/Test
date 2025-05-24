from django.urls import path
from .views import (MedicationCreateAPIView,MedicationCombinedAPIView,MedicationUpdateAPIView,
                    AddSupplierCreateAPIView,AddSupplierListAPIView,AddSupplierDetailAPIView,
                    AddNewTransactionCreateAPIView,AddNewTransactionHistoryAPIView)

# Create the urls over here

urlpatterns=[
    path('add_medicine/',MedicationCreateAPIView.as_view(),name='add_medicine'),
    path('medicine_list/',MedicationCombinedAPIView.as_view(),name='get_medicine'),
    path('update_medicine/<int:pk>/', MedicationUpdateAPIView.as_view(), name='medication-update'),
    path('add_supplier/', AddSupplierCreateAPIView.as_view(), name='add-supplier-create'),
    path('suppliers/', AddSupplierListAPIView.as_view(), name='add-supplier-list'),
    path('suppliers/<int:supplier_id>/', AddSupplierDetailAPIView.as_view(), name='add-supplier-detail'),
    path('add_transaction/', AddNewTransactionCreateAPIView.as_view(), name='add-new-transaction-create'),
    path('transaction_history/<int:supplier_id>/', AddNewTransactionHistoryAPIView.as_view(), name='add-new-transaction-history'),
]
