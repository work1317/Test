from django.urls import path
from .views import *

urlpatterns = [
    # requests for records

    path('records/', MedicalRecordRetrieveAPIView.as_view(), name='record-list'),
    path('records/create/', MedicalRecordCreateAPIView.as_view(), name='record-create'),
    path('records/update/<str:patient_id>/', MedicalRecordUpdateAPIView.as_view(), name='record-update'),

    path('prescription/',PrescriptionListAPIView.as_view(),name='prescriptions'),
    path('prescription/<str:patient_id>/',PrescriptionDetailView.as_view(),name='prescription-detail'),
    path('vitals/<str:patient_id>/',VitalsDetailAPIView.as_view(),name='vitals-detail'),

    # requests for notes
    
    # Nursing Notes
    path('create-nursing-notes/', NursingNotesAPIView.as_view(), name='nursing-notes'),    
    path('get-nursing-notes/<str:patient_id>', NursingNotesListAPIView.as_view(), name='list'),    
    path('update-nursing-notes/<str:patient_id>', NursingNotesUpdateAPIView.as_view(), name='update'),  

    # Progress Notes
    path('create-progress-note/', CreateProgressNoteAPIView.as_view(), name='create-progress-note'),
    path('get-progress-note/<str:patient_id>/', GetProgressNoteAPIView.as_view(), name='get-progress-note'),
    path('update-progress-note/<str:patient_id>/', ProgressNoteDetailView.as_view(), name='progress_note_detail'),

    # Treatment Chart
    path('create-treatment-chart/', TreatmentChartAPIView.as_view(), name='treatment-notes'),
    path('get-treatment-chart/<str:patient_id>/', TreatmentChartListAPIView.as_view(), name='treatment-list'),    
    path('update-treatment-chart/<str:patient_id>/', TreatmentChartUpdateAPIView.as_view(), name='treatment-update'),

    # Pain Assessment
    path('create-pain-assessment/', CreatePainAssessmentAPIView.as_view(), name='create-pain-assessment'),
    path('get-pain-assessment/<str:patient_id>/', GetPainAssessmentAPIView.as_view(), name='get-pain-assessment'),
    path('update-pain-assessment/<str:patient_id>/', UpdatePainAssessmentAPIView.as_view(), name='update-pain-assessment'),

    # Initial Assessment
    path('create-initial-assessment/', CreateInitialAssessmentAPIView.as_view(), name='create-initial-assessment'),
    path('get-initial-assessment/<str:patient_id>/', GetInitialAssessmentAPIView.as_view(), name='get-initial-assessment'),
    path('update-initial-assessment/<str:patient_id>/', UpdateInitialAssessmentAPIView.as_view(), name='update-initial-assessment'),

    # CarePlan Feedback
    path('create-careplan/', CarePlanFeedbackAPIView.as_view(), name='careplan-feedback'),
    path('get-careplan/<str:patient_id>/', CarePlanFeedbackListAPIView.as_view(), name='careplan-feedback-list'),
    path('update-careplan/<str:patient_id>/', CarePlanFeedbackUpdateAPIView.as_view(), name='careplan-feedback-update'),

    # Risk Assessment
    path('create-multiple-risk-factors/', CreateMultipleRiskFactorsAPIView.as_view(), name='create-multiple-risk-factors'),
    path('get-multiple-risk-factors/<str:patient_id>/', RetrieveMultipleRiskFactorsAPIView.as_view(), name='get-multiple-risk-factors'),
    path('update-multiple-risk-factors/<str:patient_id>/', UpdateMultipleRiskFactorsAPIView.as_view(), name='get-multiple-risk-factors'),

]
