from django.contrib import admin
from .models import *

# Register your models here.

@admin.register(Vitals)
class VitalsAdmin(admin.ModelAdmin):
    list_display = ['category','patient','recorded_by','blood_pressure','bmi','grbs','cvs','cns','respiratory_rate','weight','height','summary','report','created_at','last_updated_at']

@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['patient','medication','dosage','duration','summary','report','created_at','last_updated_at']

@admin.register(ServiceProcedure)
class ServiceProcedureAdmin(admin.ModelAdmin):
    list_display = ['patient','title','summary','report','created_at','last_updated_at']


# add notes

@admin.register(NursingNotes)
class NursingNotesAdmin(admin.ModelAdmin):
    list_display = ['patient','description','created_at','updated_at']

@admin.register(ProgressNote)
class ProgressNoteAdmin(admin.ModelAdmin):
    list_display = ['patient','status','notes','created_at','updated_at']

@admin.register(TreatmentChart)
class TreatmentChartAdmin(admin.ModelAdmin):
    list_display = ['patient','medicine_name','hrs_drops_mins','dose','time','medicine_details','created_at','updated_at','patient_id']

@admin.register(PainAssessment)
class PainAssessmentAdmin(admin.ModelAdmin):
    list_display = ['patient','pain_intensity','location_of_service','quality_of_service','character_of_service','factors_affecting_rating','factors_improving_experience','created_at','updated_at']

@admin.register(InitialAssessment)
class InitialAssessmentAdmin(admin.ModelAdmin):
    list_display = ['patient','rating_title','relationship_to_feedback','duration_of_experience','present_illness','past_illness','experience_feedback','health_feedback','heart_feedback','stroke_feedback','other_feedback','created_at','updated_at']

@admin.register(CarePlanFeedback)
class CarePlanFeedbackAdmin(admin.ModelAdmin):
    list_display = ['patient','feedback_on_services','provisional_feedback','feedback_plan','expected_outcome','preventive_feedback_aspects','created_at','updated_at']    


@admin.register(RiskFactor1)
class RiskFactor1Admin(admin.ModelAdmin):
    list_display = ['patient','minor_surgery','age_40_to_60_yrs','pregnancy_or_post_martum','varicose_veins','inflammatory_bowel_disease','obesity','combined_oral_contraceptives_or_HRT','created_at','updated_at']

@admin.register(RiskFactor2)
class RiskFactor2Admin(admin.ModelAdmin):
    list_display = ['patient','age_over_60_yrs','malignancy','major_surgery','immobilising_plaster_cast','medical_or_surgical','patients_confinedto_bed_72_hrs','central_venous_access','created_at','updated_at']

@admin.register(RiskFactor3)
class RiskFactor3Admin(admin.ModelAdmin):
    list_display = ['patient','history_of_DVT_or_PE','myocardial_infarction','congestive_heart_failure','severe_sepsis_or_infection','factor_V_leiden_or_activated_protein_C_resistance','antithrombin_III_deficiency','proteins_C_and_S_deficiency','dysfibrinogenemia','homocysteinemia','prothrombin_mutation_20210A','lupus_anticoagulant','antiphospholipid_antibodies','myeloproliferative_disorders','disordersof_plasminogen_and_plasminactivation',
            'heparin_included_thrombocytopenia','hyperviscosity_syndromes','created_at','updated_at']

@admin.register(RiskFactor4)
class RiskFactor4Admin(admin.ModelAdmin):
    list_display = ['patient','elective_major_lower_extremity','arthroplasty','hip_pelvis_or_leg_fracture','stroke','multiple_trauma','acute_spinal_cord_injury','created_at','updated_at']    