"""
API endpoints for Nutrition Management (Nutritionist data capture)
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from core.database import get_db
from core.dependencies import get_current_user, CurrentUser
from core.permissions import require_permission
from services.nutrition_service import NutritionService
from schemas.nutrition import (
    NutritionAssessmentCreate,
    NutritionAssessmentUpdate,
    NutritionAssessmentResponse,
    NutritionAssessmentWithDetails,
    NutritionAssessmentListFilter,
    NutritionAssessmentListResponse,
    MealPlanCreate,
    MealPlanUpdate,
    MealPlanResponse,
    MealPlanWithDays,
    MealPlanWithDetails,
    MealPlanListFilter,
    MealPlanListResponse,
    MealPlanDayCreate,
    MealPlanDayWithMeals,
    MealPlanMealCreate,
    MealPlanMealResponse,
    NutritionFeedbackCreate,
    NutritionFeedbackUpdate,
    NutritionFeedbackResponse,
    NutritionFeedbackWithDetails,
    NutritionFeedbackListFilter,
    NutritionFeedbackListResponse,
    NutritionStats,
    PatientNutritionProgress
)
from schemas.enums import ModuleCategory
from core.exceptions import NotFoundError, AuthorizationError, ValidationError

router = APIRouter()


# ============================================================================
# Nutrition Assessment Endpoints
# ============================================================================

@router.get("/assessments/", response_model=NutritionAssessmentListResponse)
@require_permission(ModuleCategory.NUTRITIONIST, "view")
async def list_assessments(
    filters: NutritionAssessmentListFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    List nutrition assessments with filters
    
    **Permissions:** Nutritionists and Admins can view all. Patients see only their own.
    """
    service = NutritionService(db)
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    
    try:
        assessments, total = await service.list_assessments(filters, current_user.userId, is_staff)
        
        return NutritionAssessmentListResponse(
            items=assessments,
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            has_more=(filters.skip + filters.limit) < total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assessments/{assessment_id}", response_model=NutritionAssessmentWithDetails)
@require_permission(ModuleCategory.NUTRITIONIST, "view")
async def get_assessment(
    assessment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get a specific nutrition assessment
    
    **Permissions:** Staff can view any. Patients can view their own.
    """
    service = NutritionService(db)
    
    try:
        assessment = await service.get_assessment(assessment_id)
        
        if not assessment:
            raise NotFoundError("Nutrition Assessment", assessment_id)
        
        # Check ownership
        is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
        if not is_staff and assessment.patient_id != current_user.userId:
            raise AuthorizationError("You don't have permission to view this assessment")
        
        return assessment
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assessments/", response_model=NutritionAssessmentResponse, status_code=status.HTTP_201_CREATED)
@require_permission(ModuleCategory.NUTRITIONIST, "create")
async def create_assessment(
    assessment_data: NutritionAssessmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Create a new nutrition assessment
    
    **Permissions:** Only Nutritionists and Admins can create assessments.
    **Note:** Automatically calculates BMI from weight and height.
    """
    service = NutritionService(db)
    
    try:
        assessment = await service.create_assessment(assessment_data, current_user.userId)
        return assessment
    
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/assessments/{assessment_id}", response_model=NutritionAssessmentResponse)
@require_permission(ModuleCategory.NUTRITIONIST, "update")
async def update_assessment(
    assessment_id: str,
    assessment_data: NutritionAssessmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update a nutrition assessment
    
    **Permissions:** Only the creating Nutritionist or Admin can update.
    """
    service = NutritionService(db)
    
    try:
        assessment = await service.update_assessment(assessment_id, assessment_data, current_user.userId)
        return assessment
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Meal Plan Endpoints
# ============================================================================

@router.get("/meal-plans/", response_model=MealPlanListResponse)
@require_permission(ModuleCategory.NUTRITIONIST, "view")
async def list_meal_plans(
    filters: MealPlanListFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    List meal plans with filters
    
    **Permissions:** Staff can view all. Patients see only their own.
    """
    service = NutritionService(db)
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    
    try:
        plans, total = await service.list_meal_plans(filters, current_user.userId, is_staff)
        
        return MealPlanListResponse(
            items=plans,
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            has_more=(filters.skip + filters.limit) < total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/meal-plans/{plan_id}", response_model=MealPlanWithDays)
@require_permission(ModuleCategory.NUTRITIONIST, "view")
async def get_meal_plan(
    plan_id: str,
    include_days: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get a specific meal plan with all days and meals
    
    **Permissions:** Staff can view any. Patients can view their own.
    **Note:** Returns complete meal plan with all days, meals, and calculated totals.
    """
    service = NutritionService(db)
    
    try:
        plan = await service.get_meal_plan(plan_id, include_days)
        
        if not plan:
            raise NotFoundError("Meal Plan", plan_id)
        
        # Check ownership
        is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
        if not is_staff and plan.patient_id != current_user.userId:
            raise AuthorizationError("You don't have permission to view this meal plan")
        
        return plan
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/meal-plans/", response_model=MealPlanResponse, status_code=status.HTTP_201_CREATED)
@require_permission(ModuleCategory.NUTRITIONIST, "create")
async def create_meal_plan(
    plan_data: MealPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Create a new meal plan
    
    **Permissions:** Only Nutritionists and Admins can create meal plans.
    **Note:** Create the plan first, then add days and meals using separate endpoints.
    """
    service = NutritionService(db)
    
    try:
        plan = await service.create_meal_plan(plan_data, current_user.userId)
        return plan
    
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/meal-plans/{plan_id}", response_model=MealPlanResponse)
@require_permission(ModuleCategory.NUTRITIONIST, "update")
async def update_meal_plan(
    plan_id: str,
    plan_data: MealPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update a meal plan
    
    **Permissions:** Only the creating Nutritionist or Admin can update.
    """
    service = NutritionService(db)
    
    try:
        plan = await service.update_meal_plan(plan_id, plan_data, current_user.userId)
        return plan
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/meal-plans/{plan_id}/days", response_model=MealPlanDayWithMeals, status_code=status.HTTP_201_CREATED)
@require_permission(ModuleCategory.NUTRITIONIST, "create")
async def add_day_to_plan(
    plan_id: str,
    day_data: MealPlanDayCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Add a day to a meal plan
    
    **Permissions:** Only Nutritionists and Admins can add days.
    **Note:** After creating a day, add meals to it using the add meal endpoint.
    """
    service = NutritionService(db)
    
    try:
        day = await service.add_day_to_plan(plan_id, day_data)
        return day
    
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/meal-plan-days/{day_id}/meals", response_model=MealPlanMealResponse, status_code=status.HTTP_201_CREATED)
@require_permission(ModuleCategory.NUTRITIONIST, "create")
async def add_meal_to_day(
    day_id: str,
    meal_data: MealPlanMealCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Add a meal to a day
    
    **Permissions:** Only Nutritionists and Admins can add meals.
    **Note:** Provide macros (calories, protein, carbs, fats) for daily total calculations.
    """
    service = NutritionService(db)
    
    try:
        meal = await service.add_meal_to_day(day_id, meal_data)
        return meal
    
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Nutrition Feedback Endpoints
# ============================================================================

@router.get("/feedback/", response_model=NutritionFeedbackListResponse)
@require_permission(ModuleCategory.NUTRITIONIST, "view")
async def list_feedback(
    filters: NutritionFeedbackListFilter = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    List nutrition feedback entries with filters
    
    **Permissions:** Staff can view all. Patients see only their own.
    """
    service = NutritionService(db)
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    
    try:
        feedbacks, total = await service.list_feedback(filters, current_user.userId, is_staff)
        
        return NutritionFeedbackListResponse(
            items=feedbacks,
            total=total,
            skip=filters.skip,
            limit=filters.limit,
            has_more=(filters.skip + filters.limit) < total
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/feedback/{feedback_id}", response_model=NutritionFeedbackWithDetails)
@require_permission(ModuleCategory.NUTRITIONIST, "view")
async def get_feedback(
    feedback_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get a specific feedback entry
    
    **Permissions:** Staff can view any. Patients can view their own.
    """
    service = NutritionService(db)
    
    try:
        feedback = await service.get_feedback(feedback_id)
        
        if not feedback:
            raise NotFoundError("Nutrition Feedback", feedback_id)
        
        # Check ownership
        is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
        if not is_staff and feedback.patient_id != current_user.userId:
            raise AuthorizationError("You don't have permission to view this feedback")
        
        return feedback
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/feedback/", response_model=NutritionFeedbackResponse, status_code=status.HTTP_201_CREATED)
@require_permission(ModuleCategory.NUTRITIONIST, "create")
async def create_feedback(
    feedback_data: NutritionFeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Create nutrition feedback for a patient
    
    **Permissions:** Only Nutritionists and Admins can create feedback.
    **Note:** Used for tracking patient compliance and progress on meal plans.
    """
    service = NutritionService(db)
    
    try:
        feedback = await service.create_feedback(feedback_data, current_user.userId)
        return feedback
    
    except (NotFoundError, ValidationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/feedback/{feedback_id}", response_model=NutritionFeedbackResponse)
@require_permission(ModuleCategory.NUTRITIONIST, "update")
async def update_feedback(
    feedback_id: str,
    feedback_data: NutritionFeedbackUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update feedback entry
    
    **Permissions:** Only the creating Nutritionist or Admin can update.
    """
    service = NutritionService(db)
    
    try:
        feedback = await service.update_feedback(feedback_id, feedback_data)
        return feedback
    
    except (NotFoundError, AuthorizationError) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Statistics & Progress Endpoints
# ============================================================================

@router.get("/stats", response_model=NutritionStats)
@require_permission(ModuleCategory.NUTRITIONIST, "view")
async def get_nutrition_stats(
    nutritionist_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get nutrition module statistics
    
    **Permissions:** Nutritionists can view their own stats. Admins can view any.
    """
    service = NutritionService(db)
    
    # If not specified, get current user's stats
    if not nutritionist_id:
        from models.staff import Staff
        from sqlalchemy import select
        result = await db.execute(
            select(Staff).where(Staff.user_id == current_user.userId)
        )
        staff = result.scalar_one_or_none()
        if staff:
            nutritionist_id = staff.id
    
    try:
        stats = await service.get_stats(nutritionist_id)
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/patients/{patient_id}/progress", response_model=PatientNutritionProgress)
@require_permission(ModuleCategory.NUTRITIONIST, "view")
async def get_patient_progress(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get patient's nutrition progress and trends
    
    **Permissions:** Staff can view any patient. Patients can view their own.
    """
    service = NutritionService(db)
    
    # Check ownership
    is_staff = current_user.role in ["admin", "physician", "nutritionist", "nurse"]
    if not is_staff and patient_id != current_user.userId:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own nutrition progress"
        )
    
    try:
        progress = await service.get_patient_progress(patient_id)
        return progress
    
    except NotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

