"""
Service layer for Nutrition Management (Nutritionist data capture)
"""
from typing import Optional, List, Tuple
from datetime import datetime, timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import joinedload
from decimal import Decimal

from app.shared.models import (
    NutritionAssessment,
    MealPlan,
    MealPlanDay,
    MealPlanMeal,
    NutritionFeedback,
    User,
    Staff
)
from app.shared.schemas.nutrition import (
    NutritionAssessmentCreate,
    NutritionAssessmentUpdate,
    NutritionAssessmentResponse,
    NutritionAssessmentWithDetails,
    MealPlanCreate,
    MealPlanUpdate,
    MealPlanResponse,
    MealPlanWithDays,
    MealPlanWithDetails,
    MealPlanDayCreate,
    MealPlanDayWithMeals,
    MealPlanMealCreate,
    MealPlanMealResponse,
    NutritionFeedbackCreate,
    NutritionFeedbackUpdate,
    NutritionFeedbackResponse,
    NutritionFeedbackWithDetails,
    NutritionAssessmentListFilter,
    MealPlanListFilter,
    NutritionFeedbackListFilter,
    NutritionStats,
    PatientNutritionProgress
)
from app.shared.schemas.enums import MealPlanStatus


class NutritionService:
    """Service for managing nutrition assessments, meal plans, and feedback"""
    
    def __init__(self, db: AsyncSession):
        self.db = db

    # Nutrition Assessment Methods
    async def create_nutrition_assessment(self, assessment_data: NutritionAssessmentCreate, system_id: str) -> NutritionAssessmentResponse:
        """Create a new nutrition assessment"""
        assessment = NutritionAssessment(
            patient_id=assessment_data.patient_id,
            nutritionist_id=assessment_data.nutritionist_id,
            system_id=system_id,
            assessment_date=assessment_data.assessment_date,
            weight=assessment_data.weight,
            height=assessment_data.height,
            bmi=assessment_data.bmi,
            body_fat_percentage=assessment_data.body_fat_percentage,
            muscle_mass=assessment_data.muscle_mass,
            metabolic_rate=assessment_data.metabolic_rate,
            dietary_restrictions=assessment_data.dietary_restrictions,
            allergies=assessment_data.allergies,
            medical_conditions=assessment_data.medical_conditions,
            lifestyle_factors=assessment_data.lifestyle_factors,
            goals=assessment_data.goals,
            recommendations=assessment_data.recommendations
        )

        self.db.add(assessment)
        await self.db.commit()
        await self.db.refresh(assessment)

        return NutritionAssessmentResponse.model_validate(assessment)

    async def get_nutrition_assessment(self, assessment_id: str, system_id: str) -> NutritionAssessmentWithDetails:
        """Get a nutrition assessment with details"""
        result = await self.db.execute(
            select(NutritionAssessment)
            .options(
                joinedload(NutritionAssessment.patient),
                joinedload(NutritionAssessment.nutritionist)
            )
            .where(
                and_(
                    NutritionAssessment.id == assessment_id,
                    NutritionAssessment.system_id == system_id
                )
            )
        )
        assessment = result.scalar_one_or_none()

        if not assessment:
            raise NotFoundError("Nutrition assessment not found")

        return NutritionAssessmentWithDetails(
            **assessment.__dict__,
            patient_name=f"{assessment.patient.first_name} {assessment.patient.last_name}",
            nutritionist_name=f"{assessment.nutritionist.first_name} {assessment.nutritionist.last_name}"
        )

    async def update_nutrition_assessment(self, assessment_id: str, update_data: NutritionAssessmentUpdate, system_id: str) -> NutritionAssessmentResponse:
        """Update a nutrition assessment"""
        result = await self.db.execute(
            select(NutritionAssessment).where(
                and_(
                    NutritionAssessment.id == assessment_id,
                    NutritionAssessment.system_id == system_id
                )
            )
        )
        assessment = result.scalar_one_or_none()

        if not assessment:
            raise NotFoundError("Nutrition assessment not found")

        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(assessment, field, value)

        assessment.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(assessment)

        return NutritionAssessmentResponse.model_validate(assessment)

    # Meal Plan Methods
    async def create_meal_plan(self, meal_plan_data: MealPlanCreate, system_id: str) -> MealPlanResponse:
        """Create a new meal plan"""
        meal_plan = MealPlan(
            patient_id=meal_plan_data.patient_id,
            nutritionist_id=meal_plan_data.nutritionist_id,
            system_id=system_id,
            name=meal_plan_data.name,
            description=meal_plan_data.description,
            start_date=meal_plan_data.start_date,
            end_date=meal_plan_data.end_date,
            status=MealPlanStatus.ACTIVE,
            target_calories=meal_plan_data.target_calories,
            target_protein=meal_plan_data.target_protein,
            target_carbs=meal_plan_data.target_carbs,
            target_fat=meal_plan_data.target_fat
        )

        self.db.add(meal_plan)
        await self.db.commit()
        await self.db.refresh(meal_plan)

        return MealPlanResponse.model_validate(meal_plan)

    async def get_meal_plan(self, meal_plan_id: str, system_id: str) -> MealPlanWithDetails:
        """Get a meal plan with details"""
        result = await self.db.execute(
            select(MealPlan)
            .options(
                joinedload(MealPlan.patient),
                joinedload(MealPlan.nutritionist),
                joinedload(MealPlan.days)
            )
            .where(
                and_(
                    MealPlan.id == meal_plan_id,
                    MealPlan.system_id == system_id
                )
            )
        )
        meal_plan = result.scalar_one_or_none()

        if not meal_plan:
            raise NotFoundError("Meal plan not found")

        return MealPlanWithDetails(
            **meal_plan.__dict__,
            patient_name=f"{meal_plan.patient.first_name} {meal_plan.patient.last_name}",
            nutritionist_name=f"{meal_plan.nutritionist.first_name} {meal_plan.nutritionist.last_name}",
            days_count=len(meal_plan.days)
        )

    # Nutrition Feedback Methods
    async def create_nutrition_feedback(self, feedback_data: NutritionFeedbackCreate, system_id: str) -> NutritionFeedbackResponse:
        """Create nutrition feedback"""
        feedback = NutritionFeedback(
            patient_id=feedback_data.patient_id,
            nutritionist_id=feedback_data.nutritionist_id,
            system_id=system_id,
            feedback_date=feedback_data.feedback_date,
            meal_plan_id=feedback_data.meal_plan_id,
            compliance_rating=feedback_data.compliance_rating,
            weight_change=feedback_data.weight_change,
            energy_level=feedback_data.energy_level,
            symptoms=feedback_data.symptoms,
            challenges=feedback_data.challenges,
            positive_changes=feedback_data.positive_changes,
            recommendations=feedback_data.recommendations,
            next_review_date=feedback_data.next_review_date
        )

        self.db.add(feedback)
        await self.db.commit()
        await self.db.refresh(feedback)

        return NutritionFeedbackResponse.model_validate(feedback)

    async def get_nutrition_feedback(self, feedback_id: str, system_id: str) -> NutritionFeedbackWithDetails:
        """Get nutrition feedback with details"""
        result = await self.db.execute(
            select(NutritionFeedback)
            .options(
                joinedload(NutritionFeedback.patient),
                joinedload(NutritionFeedback.nutritionist),
                joinedload(NutritionFeedback.meal_plan)
            )
            .where(
                and_(
                    NutritionFeedback.id == feedback_id,
                    NutritionFeedback.system_id == system_id
                )
            )
        )
        feedback = result.scalar_one_or_none()

        if not feedback:
            raise NotFoundError("Nutrition feedback not found")

        return NutritionFeedbackWithDetails(
            **feedback.__dict__,
            patient_name=f"{feedback.patient.first_name} {feedback.patient.last_name}",
            nutritionist_name=f"{feedback.nutritionist.first_name} {feedback.nutritionist.last_name}",
            meal_plan_name=feedback.meal_plan.name if feedback.meal_plan else None
        )

    async def update_nutrition_feedback(self, feedback_id: str, update_data: NutritionFeedbackUpdate, system_id: str) -> NutritionFeedbackResponse:
        """Update nutrition feedback"""
        result = await self.db.execute(
            select(NutritionFeedback).where(
                and_(
                    NutritionFeedback.id == feedback_id,
                    NutritionFeedback.system_id == system_id
                )
            )
        )
        feedback = result.scalar_one_or_none()

        if not feedback:
            raise NotFoundError("Nutrition feedback not found")

        # Update fields
        for field, value in update_data.model_dump(exclude_unset=True).items():
            setattr(feedback, field, value)

        feedback.updated_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(feedback)

        return NutritionFeedbackResponse.model_validate(feedback)

    # Statistics and Analytics
    async def get_nutrition_stats(self, system_id: str) -> NutritionStats:
        """Get nutrition statistics for the system"""
        # Total assessments
        total_assessments = await self.db.execute(
            select(func.count()).select_from(NutritionAssessment).where(NutritionAssessment.system_id == system_id)
        )

        # Total meal plans
        total_meal_plans = await self.db.execute(
            select(func.count()).select_from(MealPlan).where(MealPlan.system_id == system_id)
        )

        # Total feedback entries
        total_feedback = await self.db.execute(
            select(func.count()).select_from(NutritionFeedback).where(NutritionFeedback.system_id == system_id)
        )

        return NutritionStats(
            total_assessments=total_assessments.scalar(),
            total_meal_plans=total_meal_plans.scalar(),
            total_feedback_entries=total_feedback.scalar(),
            active_meal_plans=0,  # Would need additional query
            avg_compliance_rating=0.0  # Would need additional calculation
        )

    async def get_patient_nutrition_progress(self, patient_id: str, system_id: str) -> PatientNutritionProgress:
        """Get nutrition progress for a specific patient"""
        # Get patient's assessments
        assessments_result = await self.db.execute(
            select(NutritionAssessment)
            .where(
                and_(
                    NutritionAssessment.patient_id == patient_id,
                    NutritionAssessment.system_id == system_id
                )
            )
            .order_by(NutritionAssessment.assessment_date.desc())
        )
        assessments = assessments_result.scalars().all()

        # Get patient's meal plans
        meal_plans_result = await self.db.execute(
            select(MealPlan)
            .where(
                and_(
                    MealPlan.patient_id == patient_id,
                    MealPlan.system_id == system_id
                )
            )
            .order_by(MealPlan.created_at.desc())
        )
        meal_plans = meal_plans_result.scalars().all()

        # Get patient's feedback
        feedback_result = await self.db.execute(
            select(NutritionFeedback)
            .where(
                and_(
                    NutritionFeedback.patient_id == patient_id,
                    NutritionFeedback.system_id == system_id
                )
            )
            .order_by(NutritionFeedback.feedback_date.desc())
        )
        feedback_entries = feedback_result.scalars().all()

        return PatientNutritionProgress(
            patient_id=patient_id,
            total_assessments=len(assessments),
            total_meal_plans=len(meal_plans),
            total_feedback_entries=len(feedback_entries),
            recent_assessments=[NutritionAssessmentResponse.model_validate(a) for a in assessments[:3]],
            recent_meal_plans=[MealPlanResponse.model_validate(mp) for mp in meal_plans[:3]],
            recent_feedback=[NutritionFeedbackResponse.model_validate(f) for f in feedback_entries[:3]]
        )
