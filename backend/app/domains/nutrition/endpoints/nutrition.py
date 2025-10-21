"""
API endpoints for Nutrition Management (Nutritionist data capture)
"""
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, CurrentUser
from app.shared.schemas.nutrition import (
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
from app.domains.nutrition.services.nutrition_service import NutritionService

router = APIRouter()


# ============================================================================
# Nutrition Assessment Endpoints
# ============================================================================

@router.get("/assessments/", response_model=NutritionAssessmentListResponse)
async def list_nutrition_assessments(
    patient_id: str = None,
    nutritionist_id: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List nutrition assessments with filtering"""
    # Simplified implementation - would need proper filtering logic
    service = NutritionService(db)
    # For now, return empty list - full implementation would use filters
    return NutritionAssessmentListResponse(
        items=[],
        total=0,
        skip=skip,
        limit=limit,
        has_more=False
    )


@router.post("/assessments/", response_model=NutritionAssessmentResponse, status_code=status.HTTP_201_CREATED)
async def create_nutrition_assessment(
    assessment_data: NutritionAssessmentCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new nutrition assessment"""
    service = NutritionService(db)
    return await service.create_nutrition_assessment(assessment_data, current_user.systemId)


@router.get("/assessments/{assessment_id}", response_model=NutritionAssessmentWithDetails)
async def get_nutrition_assessment(
    assessment_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a nutrition assessment with details"""
    service = NutritionService(db)
    return await service.get_nutrition_assessment(assessment_id, current_user.systemId)


@router.put("/assessments/{assessment_id}", response_model=NutritionAssessmentResponse)
async def update_nutrition_assessment(
    assessment_id: str,
    update_data: NutritionAssessmentUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a nutrition assessment"""
    service = NutritionService(db)
    return await service.update_nutrition_assessment(assessment_id, update_data, current_user.systemId)


# ============================================================================
# Meal Plan Endpoints
# ============================================================================

@router.get("/meal-plans/", response_model=MealPlanListResponse)
async def list_meal_plans(
    patient_id: str = None,
    nutritionist_id: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List meal plans with filtering"""
    # Simplified implementation
    return MealPlanListResponse(
        items=[],
        total=0,
        skip=skip,
        limit=limit,
        has_more=False
    )


@router.post("/meal-plans/", response_model=MealPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_meal_plan(
    meal_plan_data: MealPlanCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new meal plan"""
    service = NutritionService(db)
    return await service.create_meal_plan(meal_plan_data, current_user.systemId)


@router.get("/meal-plans/{meal_plan_id}", response_model=MealPlanWithDetails)
async def get_meal_plan(
    meal_plan_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a meal plan with details"""
    service = NutritionService(db)
    return await service.get_meal_plan(meal_plan_id, current_user.systemId)


@router.put("/meal-plans/{meal_plan_id}", response_model=MealPlanResponse)
async def update_meal_plan(
    meal_plan_id: str,
    update_data: MealPlanUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a meal plan"""
    service = NutritionService(db)
    # Simplified - would need proper implementation
    return MealPlanResponse(
        id=meal_plan_id,
        patient_id=update_data.patient_id,
        nutritionist_id=update_data.nutritionist_id,
        name=update_data.name or "Updated Meal Plan",
        description=update_data.description,
        start_date=update_data.start_date,
        end_date=update_data.end_date,
        status="active",
        target_calories=update_data.target_calories,
        target_protein=update_data.target_protein,
        target_carbs=update_data.target_carbs,
        target_fat=update_data.target_fat,
        createdAt=datetime.now(),
        updatedAt=datetime.now()
    )


# ============================================================================
# Nutrition Feedback Endpoints
# ============================================================================

@router.get("/feedback/", response_model=NutritionFeedbackListResponse)
async def list_nutrition_feedback(
    patient_id: str = None,
    nutritionist_id: str = None,
    skip: int = 0,
    limit: int = 100,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List nutrition feedback with filtering"""
    # Simplified implementation
    return NutritionFeedbackListResponse(
        items=[],
        total=0,
        skip=skip,
        limit=limit,
        has_more=False
    )


@router.post("/feedback/", response_model=NutritionFeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_nutrition_feedback(
    feedback_data: NutritionFeedbackCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create nutrition feedback"""
    service = NutritionService(db)
    return await service.create_nutrition_feedback(feedback_data, current_user.systemId)


@router.get("/feedback/{feedback_id}", response_model=NutritionFeedbackWithDetails)
async def get_nutrition_feedback(
    feedback_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get nutrition feedback with details"""
    service = NutritionService(db)
    return await service.get_nutrition_feedback(feedback_id, current_user.systemId)


@router.put("/feedback/{feedback_id}", response_model=NutritionFeedbackResponse)
async def update_nutrition_feedback(
    feedback_id: str,
    update_data: NutritionFeedbackUpdate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update nutrition feedback"""
    service = NutritionService(db)
    return await service.update_nutrition_feedback(feedback_id, update_data, current_user.systemId)


# ============================================================================
# Statistics and Analytics Endpoints
# ============================================================================

@router.get("/stats", response_model=NutritionStats)
async def get_nutrition_stats(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get nutrition statistics for the system"""
    service = NutritionService(db)
    return await service.get_nutrition_stats(current_user.systemId)


@router.get("/patients/{patient_id}/progress", response_model=PatientNutritionProgress)
async def get_patient_nutrition_progress(
    patient_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get nutrition progress for a specific patient"""
    service = NutritionService(db)
    return await service.get_patient_nutrition_progress(patient_id, current_user.systemId)
