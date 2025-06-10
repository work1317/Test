from django.db import models
from patients.models import Patient
from doctors.models import DoctorAvailability
from django.contrib.auth.models import User

# create your models here

# Models for adding rceords

class MedicalRecord(models.Model):
    RECORD_TYPES = [
        ("vitals", "Vitals"),
        ("lab_results", "Lab Results"),
        ("imaging", "Imaging"),
        ("prescription", "Prescription"),
        ("services_procedures", "Services & Procedures"),
    ]
    
    record_type = models.CharField(max_length=50, choices=RECORD_TYPES)
    last_updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True  # Abstract Model

class Vitals(MedicalRecord):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='vitals_records')
    recorded_by = models.CharField(max_length=255)
    blood_pressure = models.CharField(max_length=50)
    bmi = models.FloatField()
    grbs = models.CharField(max_length=50)
    cvs = models.CharField(max_length=50)
    cns = models.CharField(max_length=50)
    respiratory_rate = models.IntegerField()                                        
    weight = models.FloatField()
    height = models.FloatField()
    category = models.CharField(max_length=255,blank=True)
    summary = models.TextField(blank=True)
    report = models.FileField(upload_to='reports/',null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    

class Prescription(MedicalRecord):
    STATUS_CHOICES = [
        ('processing','Processing'),
        ('completed','Completed'),
        ('pending','Pending')
    ]
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    medication_name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    quantity = models.IntegerField(null=True, blank=True)
    duration = models.CharField(max_length=50)
    category = models.CharField(max_length=255,blank=True)
    summary = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    report = models.FileField(upload_to='reports/',null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    

class ServiceProcedure(MedicalRecord):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='service_procedures')
    # doctor = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE, related_name="procedures")
    title = models.CharField(max_length=100)
    category = models.CharField(max_length=255,blank=True)
    summary = models.TextField(blank=True)
    report = models.FileField(upload_to='reports/',null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    


# Models for adding note

# Nursing Notes

class NursingNotes(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    nurse = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


# Progress Notes

class ProgressNote(models.Model):
    STATUS_CHOICES = [
        ('critical', 'Critical'),
        ('serious', 'Serious'),
        ('moderate', 'Moderate'),
        ('mild', 'Mild'),
        ('recovered', 'Recovered'),
        ('stable', 'Stable'),
        ('deteriorating', 'Deteriorating'),
        ('improving', 'Improving'),
    ]

    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='progress_notes')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.patient.patient_name} - {self.status}'
    


# Treatment Chart

class TreatmentChart(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name="treatment_charts")
    medicine_name = models.CharField(max_length=255)
    hrs_drops_mins = models.CharField(max_length=50, blank=True, null=True)  # Stores Hrs/Drops/Mins as a string
    dose = models.CharField(max_length=50)
    time = models.TimeField()
    medicine_details = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

# Pain Assessment

class PainAssessment(models.Model):
    PAIN_INTENSITY_CHOICES = [(i, str(i)) for i in range(11)]  # 0 to 10

    QUALITY_OF_SERVICE_CHOICES = [
        ('constant', 'Constant Feedback'),
        ('intermittent', 'Intermittent Feedback'),
    ]

    CHARACTER_OF_SERVICE_CHOICES = [
        ('lacerating', 'Lacerating Feedback'),
        ('burning', 'Burning Feedback'),
        ('radiating', 'Radiating Feedback'),
    ]

    FACTORS_IMPROVING_EXPERIENCE_CHOICES = [
        ('reset', 'Reset Feedback'),
        ('medication', 'Medication Feedback'),
    ]

    patient = models.OneToOneField(Patient, on_delete=models.CASCADE, related_name='pain_assessment')
    pain_intensity = models.IntegerField(choices=PAIN_INTENSITY_CHOICES, default=0)
    location_of_service = models.CharField(max_length=255, blank=True, null=True)
    quality_of_service = models.CharField(max_length=20, choices=QUALITY_OF_SERVICE_CHOICES, blank=True, null=True)
    character_of_service = models.JSONField(blank=True, null=True)  # Store multiple choices
    factors_affecting_rating = models.TextField(blank=True, null=True)
    factors_improving_experience = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.patient.patient_name} - Pain Assessment'
    

# Initial Assessment
class InitialAssessment(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    rating_title = models.CharField(max_length=255, blank=True, null=True)
    relationship_to_feedback = models.CharField(max_length=255, blank=True, null=True)
    # feedback_date = models.DateField(blank=True, null=True)
    duration_of_experience = models.TextField(blank=True, null=True)
    present_illness = models.TextField(blank=True, null=True)
    past_illness = models.TextField(blank=True, null=True)
    experience_feedback = models.TextField(blank=True, null=True)
    health_feedback = models.TextField(blank=True, null=True)
    heart_feedback = models.TextField(blank=True, null=True)
    stroke_feedback = models.TextField(blank=True, null=True)
    other_feedback = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True) 



# Careplan Feedback

class CarePlanFeedback(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE) 
    feedback_on_services = models.TextField()  
    provisional_feedback = models.TextField()  
    feedback_plan = models.TextField()  
    expected_outcome = models.TextField()  
    preventive_feedback_aspects = models.TextField()  
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True) 


# Risk Assessment

class RiskFactor1(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    minor_surgery = models.BooleanField(default=False)
    age_40_to_60_yrs = models.BooleanField(default=False)
    pregnancy_or_post_martum = models.BooleanField(default=False)
    varicose_veins = models.BooleanField(default=False)
    inflammatory_bowel_disease = models.BooleanField(default=False)
    obesity = models.BooleanField(default=False)
    combined_oral_contraceptives_or_HRT = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)


class RiskFactor2(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    age_over_60_yrs = models.BooleanField(default=False)
    malignancy = models.BooleanField(default=False)
    major_surgery = models.BooleanField(default=False)
    immobilising_plaster_cast = models.BooleanField(default=False)
    medical_or_surgical = models.BooleanField(default=False)
    patients_confinedto_bed_72_hrs = models.BooleanField(default=False)
    central_venous_access = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)

class RiskFactor3(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    history_of_DVT_or_PE = models.BooleanField(default=False)
    myocardial_infarction = models.BooleanField(default=False)
    congestive_heart_failure = models.BooleanField(default=False)
    severe_sepsis_or_infection  = models.BooleanField(default=False)
    factor_V_leiden_or_activated_protein_C_resistance = models.BooleanField(default=False)
    antithrombin_III_deficiency = models.BooleanField(default=False)
    proteins_C_and_S_deficiency = models.BooleanField(default=False)
    dysfibrinogenemia = models.BooleanField(default=False)
    homocysteinemia = models.BooleanField(default=False)
    prothrombin_mutation_20210A = models.BooleanField(default=False)
    lupus_anticoagulant = models.BooleanField(default=False)
    antiphospholipid_antibodies = models.BooleanField(default=False)
    myeloproliferative_disorders = models.BooleanField(default=False)
    disordersof_plasminogen_and_plasminactivation = models.BooleanField(default=False)
    heparin_included_thrombocytopenia= models.BooleanField(default=False)
    hyperviscosity_syndromes = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True) 
    

class RiskFactor4(models.Model):
    patient = models.OneToOneField(Patient, on_delete=models.CASCADE)
    elective_major_lower_extremity = models.BooleanField(default=False)
    arthroplasty = models.BooleanField(default=False)
    hip_pelvis_or_leg_fracture = models.BooleanField(default=False)
    stroke = models.BooleanField(default=False)
    multiple_trauma = models.BooleanField(default=False)
    acute_spinal_cord_injury = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True) 

