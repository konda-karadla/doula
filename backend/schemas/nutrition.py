"""
Pydantic schemas for Nutrition module (Nutritionist data capture)
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date, datetime
from decimal import Decimal

from schemas.enums import MealType, MealPlanStatus, ComplianceLevel


# ============================================================================
# Nutrition Assessment Schemas
# ============================================================================

class NutritionAssessmentBase(BaseModel):
    """Base schema for nutrition assessments"""
    assessment_date: datetime = Field(..., description="Date of assessment")
    
    # Body Measurements
    current_weight: Decimal = Field(..., ge=0.0, le=500.0, description="Current weight (kg)")
    height: Decimal = Field(..., ge=0.0, le=300.0, description="Height (cm)")
    body_composition: Optional[str] = Field(None, max_length=500, description="Body composition analysis")
    
    # Dietary Information
    dietary_restrictions: Optional[str] = Field(None, max_length=1000, description="Allergies, intolerances, preferences")
    current_diet_analysis: Optional[str] = Field(None, description="Analysis of current diet")
    
    # Goals
    nutritional_goals: str = Field(..., description="Nutritional goals and objectives")
    target_weight: Optional[Decimal] = Field(None, ge=0.0, le=500.0, description="Target weight (kg)")
    target_duration_weeks: Optional[int] = Field(None, ge=1, le=104, description="Duration to achieve goals (weeks)")
    
    # Assessment Notes
    notes: Optional[str] = Field(None, description="Additional assessment notes")


class NutritionAssessmentCreate(NutritionAssessmentBase):
    """Schema for creating a nutrition assessment"""
    patient_id: str = Field(..., description="Patient ID (User ID)")
    nutritionist_id: str = Field(..., description="Nutritionist ID (Staff ID)")


class NutritionAssessmentUpdate(BaseModel):
    """Schema for updating a nutrition assessment"""
    assessment_date: Optional[datetime] = None
    current_weight: Optional[Decimal] = Field(None, ge=0.0, le=500.0)
    height: Optional[Decimal] = Field(None, ge=0.0, le=300.0)
    body_composition: Optional[str] = Field(None, max_length=500)
    dietary_restrictions: Optional[str] = Field(None, max_length=1000)
    current_diet_analysis: Optional[str] = None
    nutritional_goals: Optional[str] = None
    target_weight: Optional[Decimal] = Field(None, ge=0.0, le=500.0)
    target_duration_weeks: Optional[int] = Field(None, ge=1, le=104)
    notes: Optional[str] = None


class NutritionAssessmentResponse(NutritionAssessmentBase):
    """Schema for nutrition assessment response"""
    id: str
    patient_id: str
    nutritionist_id: str
    bmi: Optional[Decimal]
    status: str  # "in_progress", "completed"
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NutritionAssessmentWithDetails(NutritionAssessmentResponse):
    """Schema with patient and nutritionist details"""
    patient_name: str
    nutritionist_name: str
    nutritionist_credentials: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class NutritionAssessmentListResponse(BaseModel):
    """Schema for paginated nutrition assessment list"""
    items: list[NutritionAssessmentWithDetails]
    total: int
    skip: int
    limit: int
    has_more: bool

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Meal Plan Meal Schemas
# ============================================================================

class MealPlanMealBase(BaseModel):
    """Base schema for individual meals"""
    meal_type: MealType = Field(..., description="Type of meal")
    time_suggestion: Optional[str] = Field(None, max_length=10, description="e.g., '08:00 AM'")
    meal_description: str = Field(..., min_length=1, description="Description of the meal")
    ingredients: Optional[str] = Field(None, description="Ingredients list (JSON or text)")
    preparation_notes: Optional[str] = Field(None, description="How to prepare the meal")
    
    # Nutritional Info
    calories: Optional[int] = Field(None, ge=0, le=5000, description="Calories")
    protein_grams: Optional[Decimal] = Field(None, ge=0.0, description="Protein (g)")
    carbs_grams: Optional[Decimal] = Field(None, ge=0.0, description="Carbohydrates (g)")
    fats_grams: Optional[Decimal] = Field(None, ge=0.0, description="Fats (g)")


class MealPlanMealCreate(MealPlanMealBase):
    """Schema for creating a meal"""
    day_id: str = Field(..., description="Meal plan day ID")


class MealPlanMealUpdate(BaseModel):
    """Schema for updating a meal"""
    meal_type: Optional[MealType] = None
    time_suggestion: Optional[str] = Field(None, max_length=10)
    meal_description: Optional[str] = None
    ingredients: Optional[str] = None
    preparation_notes: Optional[str] = None
    calories: Optional[int] = Field(None, ge=0, le=5000)
    protein_grams: Optional[Decimal] = Field(None, ge=0.0)
    carbs_grams: Optional[Decimal] = Field(None, ge=0.0)
    fats_grams: Optional[Decimal] = Field(None, ge=0.0)


class MealPlanMealResponse(MealPlanMealBase):
    """Schema for meal response"""
    id: str
    day_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Meal Plan Day Schemas
# ============================================================================

class MealPlanDayBase(BaseModel):
    """Base schema for meal plan days"""
    day_number: int = Field(..., ge=1, le=90, description="Day number in the plan")
    day_of_week: Optional[str] = Field(None, max_length=20, description="e.g., 'Monday'")
    notes: Optional[str] = Field(None, max_length=500, description="Notes for this day")


class MealPlanDayCreate(MealPlanDayBase):
    """Schema for creating a day"""
    meal_plan_id: str = Field(..., description="Meal plan ID")


class MealPlanDayResponse(MealPlanDayBase):
    """Schema for day response"""
    id: str
    meal_plan_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MealPlanDayWithMeals(MealPlanDayResponse):
    """Schema for day with all meals"""
    meals: list[MealPlanMealResponse] = []
    total_daily_calories: Optional[int] = 0
    total_daily_protein: Optional[Decimal] = Decimal("0.0")
    total_daily_carbs: Optional[Decimal] = Decimal("0.0")
    total_daily_fats: Optional[Decimal] = Decimal("0.0")

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Meal Plan Schemas
# ============================================================================

class MealPlanBase(BaseModel):
    """Base schema for meal plans"""
    plan_name: str = Field(..., min_length=1, max_length=200, description="Name of the meal plan")
    start_date: date = Field(..., description="Plan start date")
    end_date: date = Field(..., description="Plan end date")
    
    # Daily Targets
    daily_calorie_target: int = Field(..., ge=500, le=10000, description="Daily calorie goal")
    daily_protein_target: Decimal = Field(..., ge=0.0, description="Daily protein goal (g)")
    daily_carbs_target: Decimal = Field(..., ge=0.0, description="Daily carbs goal (g)")
    daily_fats_target: Decimal = Field(..., ge=0.0, description="Daily fats goal (g)")
    
    # Instructions
    special_instructions: Optional[str] = Field(None, description="Special dietary instructions")


class MealPlanCreate(MealPlanBase):
    """Schema for creating a meal plan"""
    patient_id: str = Field(..., description="Patient ID (User ID)")
    nutritionist_id: str = Field(..., description="Nutritionist ID (Staff ID)")
    assessment_id: Optional[str] = Field(None, description="Link to nutrition assessment")


class MealPlanUpdate(BaseModel):
    """Schema for updating a meal plan"""
    plan_name: Optional[str] = Field(None, min_length=1, max_length=200)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    daily_calorie_target: Optional[int] = Field(None, ge=500, le=10000)
    daily_protein_target: Optional[Decimal] = Field(None, ge=0.0)
    daily_carbs_target: Optional[Decimal] = Field(None, ge=0.0)
    daily_fats_target: Optional[Decimal] = Field(None, ge=0.0)
    special_instructions: Optional[str] = None
    status: Optional[MealPlanStatus] = None


class MealPlanResponse(MealPlanBase):
    """Schema for meal plan response"""
    id: str
    patient_id: str
    nutritionist_id: str
    assessment_id: Optional[str]
    status: MealPlanStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MealPlanWithDays(MealPlanResponse):
    """Schema for meal plan with all days and meals"""
    days: list[MealPlanDayWithMeals] = []

    model_config = ConfigDict(from_attributes=True)


class MealPlanWithDetails(MealPlanResponse):
    """Schema with patient and nutritionist details"""
    patient_name: str
    nutritionist_name: str
    nutritionist_credentials: Optional[str]
    total_days: int
    days: list[MealPlanDayWithMeals] = []

    model_config = ConfigDict(from_attributes=True)


class MealPlanListResponse(BaseModel):
    """Schema for paginated meal plan list"""
    items: list[MealPlanWithDetails]
    total: int
    skip: int
    limit: int
    has_more: bool

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Nutrition Feedback Schemas
# ============================================================================

class NutritionFeedbackBase(BaseModel):
    """Base schema for nutrition feedback"""
    feedback_date: datetime = Field(..., description="Date of feedback")
    
    # Compliance
    compliance_level: ComplianceLevel = Field(..., description="Patient compliance level")
    weight_progress: Optional[Decimal] = Field(None, description="Weight change since last check (kg, +/-)")
    
    # Assessments
    energy_levels: Optional[str] = Field(None, max_length=500, description="Patient's energy levels assessment")
    dietary_adherence_notes: Optional[str] = Field(None, description="Notes on dietary adherence")
    
    # Recommendations
    adjustments_recommended: Optional[str] = Field(None, description="Recommended adjustments to meal plan")
    next_review_date: Optional[date] = Field(None, description="Next review date")
    
    # General
    feedback_notes: Optional[str] = Field(None, description="General feedback notes")


class NutritionFeedbackCreate(NutritionFeedbackBase):
    """Schema for creating nutrition feedback"""
    patient_id: str = Field(..., description="Patient ID (User ID)")
    nutritionist_id: str = Field(..., description="Nutritionist ID (Staff ID)")
    meal_plan_id: Optional[str] = Field(None, description="Related meal plan (optional)")


class NutritionFeedbackUpdate(BaseModel):
    """Schema for updating nutrition feedback"""
    feedback_date: Optional[datetime] = None
    compliance_level: Optional[ComplianceLevel] = None
    weight_progress: Optional[Decimal] = None
    energy_levels: Optional[str] = Field(None, max_length=500)
    dietary_adherence_notes: Optional[str] = None
    adjustments_recommended: Optional[str] = None
    next_review_date: Optional[date] = None
    feedback_notes: Optional[str] = None


class NutritionFeedbackResponse(NutritionFeedbackBase):
    """Schema for nutrition feedback response"""
    id: str
    patient_id: str
    nutritionist_id: str
    meal_plan_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NutritionFeedbackWithDetails(NutritionFeedbackResponse):
    """Schema with patient and nutritionist details"""
    patient_name: str
    nutritionist_name: str
    meal_plan_name: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class NutritionFeedbackListResponse(BaseModel):
    """Schema for paginated nutrition feedback list"""
    items: list[NutritionFeedbackWithDetails]
    total: int
    skip: int
    limit: int
    has_more: bool

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# List/Filter Schemas
# ============================================================================

class NutritionAssessmentListFilter(BaseModel):
    """Filter for nutrition assessments"""
    patient_id: Optional[str] = None
    nutritionist_id: Optional[str] = None
    status: Optional[str] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)


class MealPlanListFilter(BaseModel):
    """Filter for meal plans"""
    patient_id: Optional[str] = None
    nutritionist_id: Optional[str] = None
    status: Optional[MealPlanStatus] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)


class NutritionFeedbackListFilter(BaseModel):
    """Filter for nutrition feedback"""
    patient_id: Optional[str] = None
    nutritionist_id: Optional[str] = None
    meal_plan_id: Optional[str] = None
    compliance_level: Optional[ComplianceLevel] = None
    skip: int = Field(0, ge=0)
    limit: int = Field(100, ge=1, le=1000)


# ============================================================================
# Statistics Schemas
# ============================================================================

class NutritionStats(BaseModel):
    """Nutrition module statistics"""
    total_assessments: int
    active_meal_plans: int
    completed_meal_plans: int
    feedback_entries: int
    patients_with_plans: int


class PatientNutritionProgress(BaseModel):
    """Patient's nutrition progress summary"""
    patient_id: str
    patient_name: str
    current_weight: Optional[Decimal]
    target_weight: Optional[Decimal]
    weight_change: Optional[Decimal]
    active_meal_plan: Optional[MealPlanResponse]
    latest_feedback: Optional[NutritionFeedbackResponse]
    compliance_trend: Optional[str]  # "improving", "stable", "declining"

