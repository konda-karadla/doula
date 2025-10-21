"""
Service layer for Nutrition Management (Nutritionist data capture)
"""
from typing import Optional, List, Tuple
from datetime import datetime, timedelta, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import joinedload
from decimal import Decimal

from models.nutrition import (
    NutritionAssessment,
    MealPlan,
    MealPlanDay,
    MealPlanMeal,
    NutritionFeedback
)
from models.user import User
from models.staff import Staff
from schemas.nutrition import (
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
from schemas.enums import MealPlanStatus
from core.exceptions import NotFoundError, AuthorizationError, ValidationError


class NutritionService:
    """Service for managing nutrition assessments, meal plans, and feedback"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    # ========================================================================
    # Nutrition Assessment Methods
    # ========================================================================
    
    async def create_assessment(
        self,
        assessment_data: NutritionAssessmentCreate,
        current_user_id: str
    ) -> NutritionAssessmentResponse:
        """Create a new nutrition assessment"""
        
        # Verify nutritionist exists
        nutritionist = await self._get_staff_by_user_id(current_user_id)
        if not nutritionist:
            raise ValidationError("Current user is not registered as staff")
        
        # Verify patient exists
        patient = await self._get_user(assessment_data.patient_id)
        if not patient:
            raise NotFoundError("Patient", assessment_data.patient_id)
        
        # Calculate BMI
        bmi = None
        if assessment_data.current_weight and assessment_data.height:
            height_m = float(assessment_data.height) / 100
            bmi = round(float(assessment_data.current_weight) / (height_m ** 2), 2)
        
        # Create assessment
        assessment = NutritionAssessment(
            patient_id=assessment_data.patient_id,
            nutritionist_id=assessment_data.nutritionist_id or nutritionist.id,
            assessment_date=assessment_data.assessment_date,
            current_weight=assessment_data.current_weight,
            height=assessment_data.height,
            bmi=Decimal(str(bmi)) if bmi else None,
            body_composition=assessment_data.body_composition,
            dietary_restrictions=assessment_data.dietary_restrictions,
            current_diet_analysis=assessment_data.current_diet_analysis,
            nutritional_goals=assessment_data.nutritional_goals,
            target_weight=assessment_data.target_weight,
            target_duration_weeks=assessment_data.target_duration_weeks,
            notes=assessment_data.notes,
            status="in_progress"
        )
        
        self.db.add(assessment)
        await self.db.commit()
        await self.db.refresh(assessment)
        
        return NutritionAssessmentResponse.model_validate(assessment)
    
    async def get_assessment(
        self,
        assessment_id: str
    ) -> Optional[NutritionAssessmentWithDetails]:
        """Get an assessment by ID"""
        
        result = await self.db.execute(
            select(NutritionAssessment).where(NutritionAssessment.id == assessment_id)
        )
        assessment = result.scalar_one_or_none()
        
        if not assessment:
            return None
        
        # Get related data
        patient = await self._get_user(assessment.patient_id)
        nutritionist = await self._get_staff(assessment.nutritionist_id)
        
        assessment_dict = {
            **assessment.__dict__,
            "patient_name": patient.username if patient else "Unknown",
            "nutritionist_name": nutritionist.user.username if nutritionist and nutritionist.user else "Unknown",
            "nutritionist_credentials": nutritionist.credentials if nutritionist else None
        }
        
        return NutritionAssessmentWithDetails(**assessment_dict)
    
    async def list_assessments(
        self,
        filters: NutritionAssessmentListFilter,
        current_user_id: str,
        is_staff: bool = True
    ) -> Tuple[List[NutritionAssessmentWithDetails], int]:
        """List assessments with filters"""
        
        query = select(NutritionAssessment)
        count_query = select(func.count(NutritionAssessment.id))
        
        conditions = []
        
        if filters.patient_id:
            conditions.append(NutritionAssessment.patient_id == filters.patient_id)
        
        if filters.nutritionist_id:
            conditions.append(NutritionAssessment.nutritionist_id == filters.nutritionist_id)
        
        if filters.status:
            conditions.append(NutritionAssessment.status == filters.status)
        
        if not is_staff:
            conditions.append(NutritionAssessment.patient_id == current_user_id)
        
        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        query = query.offset(filters.skip).limit(filters.limit)
        query = query.order_by(NutritionAssessment.assessment_date.desc())
        
        result = await self.db.execute(query)
        assessments = result.scalars().all()
        
        # Enrich with details
        enriched = []
        for assessment in assessments:
            patient = await self._get_user(assessment.patient_id)
            nutritionist = await self._get_staff(assessment.nutritionist_id)
            
            assessment_dict = {
                **assessment.__dict__,
                "patient_name": patient.username if patient else "Unknown",
                "nutritionist_name": nutritionist.user.username if nutritionist and nutritionist.user else "Unknown",
                "nutritionist_credentials": nutritionist.credentials if nutritionist else None
            }
            
            enriched.append(NutritionAssessmentWithDetails(**assessment_dict))
        
        return enriched, total
    
    async def update_assessment(
        self,
        assessment_id: str,
        assessment_data: NutritionAssessmentUpdate,
        current_user_id: str
    ) -> NutritionAssessmentResponse:
        """Update an assessment"""
        
        assessment = await self._get_assessment(assessment_id)
        if not assessment:
            raise NotFoundError("Nutrition Assessment", assessment_id)
        
        # Update fields
        update_data = assessment_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(assessment, field, value)
        
        # Recalculate BMI if needed
        if 'current_weight' in update_data or 'height' in update_data:
            if assessment.current_weight and assessment.height:
                height_m = float(assessment.height) / 100
                assessment.bmi = Decimal(str(round(float(assessment.current_weight) / (height_m ** 2), 2)))
        
        assessment.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(assessment)
        
        return NutritionAssessmentResponse.model_validate(assessment)
    
    # ========================================================================
    # Meal Plan Methods
    # ========================================================================
    
    async def create_meal_plan(
        self,
        plan_data: MealPlanCreate,
        current_user_id: str
    ) -> MealPlanResponse:
        """Create a new meal plan"""
        
        # Verify nutritionist
        nutritionist = await self._get_staff_by_user_id(current_user_id)
        if not nutritionist:
            raise ValidationError("Current user is not registered as staff")
        
        # Verify patient
        patient = await self._get_user(plan_data.patient_id)
        if not patient:
            raise NotFoundError("Patient", plan_data.patient_id)
        
        # Create meal plan
        meal_plan = MealPlan(
            patient_id=plan_data.patient_id,
            nutritionist_id=plan_data.nutritionist_id or nutritionist.id,
            assessment_id=plan_data.assessment_id,
            plan_name=plan_data.plan_name,
            start_date=plan_data.start_date,
            end_date=plan_data.end_date,
            daily_calorie_target=plan_data.daily_calorie_target,
            daily_protein_target=plan_data.daily_protein_target,
            daily_carbs_target=plan_data.daily_carbs_target,
            daily_fats_target=plan_data.daily_fats_target,
            special_instructions=plan_data.special_instructions,
            status=MealPlanStatus.ACTIVE
        )
        
        self.db.add(meal_plan)
        await self.db.commit()
        await self.db.refresh(meal_plan)
        
        return MealPlanResponse.model_validate(meal_plan)
    
    async def get_meal_plan(
        self,
        plan_id: str,
        include_days: bool = True
    ) -> Optional[MealPlanWithDays]:
        """Get a meal plan with optional days/meals"""
        
        query = select(MealPlan).where(MealPlan.id == plan_id)
        
        if include_days:
            query = query.options(
                joinedload(MealPlan.days).joinedload(MealPlanDay.meals)
            )
        
        result = await self.db.execute(query)
        plan = result.scalar_one_or_none()
        
        if not plan:
            return None
        
        # Build response with days
        days_list = []
        if include_days and plan.days:
            for day in sorted(plan.days, key=lambda d: d.day_number):
                meals_list = [MealPlanMealResponse.model_validate(m) for m in day.meals]
                
                # Calculate daily totals
                total_calories = sum(m.calories or 0 for m in day.meals)
                total_protein = sum(m.protein_grams or 0 for m in day.meals)
                total_carbs = sum(m.carbs_grams or 0 for m in day.meals)
                total_fats = sum(m.fats_grams or 0 for m in day.meals)
                
                day_dict = {
                    **day.__dict__,
                    "meals": meals_list,
                    "total_daily_calories": total_calories,
                    "total_daily_protein": Decimal(str(total_protein)),
                    "total_daily_carbs": Decimal(str(total_carbs)),
                    "total_daily_fats": Decimal(str(total_fats))
                }
                days_list.append(MealPlanDayWithMeals(**day_dict))
        
        plan_dict = {
            **plan.__dict__,
            "days": days_list
        }
        
        return MealPlanWithDays(**plan_dict)
    
    async def list_meal_plans(
        self,
        filters: MealPlanListFilter,
        current_user_id: str,
        is_staff: bool = True
    ) -> Tuple[List[MealPlanWithDetails], int]:
        """List meal plans with filters"""
        
        query = select(MealPlan)
        count_query = select(func.count(MealPlan.id))
        
        conditions = []
        
        if filters.patient_id:
            conditions.append(MealPlan.patient_id == filters.patient_id)
        
        if filters.nutritionist_id:
            conditions.append(MealPlan.nutritionist_id == filters.nutritionist_id)
        
        if filters.status:
            conditions.append(MealPlan.status == filters.status)
        
        if not is_staff:
            conditions.append(MealPlan.patient_id == current_user_id)
        
        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        query = query.offset(filters.skip).limit(filters.limit)
        query = query.order_by(MealPlan.start_date.desc())
        
        result = await self.db.execute(query)
        plans = result.scalars().all()
        
        # Enrich with details
        enriched = []
        for plan in plans:
            patient = await self._get_user(plan.patient_id)
            nutritionist = await self._get_staff(plan.nutritionist_id)
            
            # Get days count
            days_result = await self.db.execute(
                select(func.count(MealPlanDay.id)).where(MealPlanDay.meal_plan_id == plan.id)
            )
            total_days = days_result.scalar()
            
            plan_dict = {
                **plan.__dict__,
                "patient_name": patient.username if patient else "Unknown",
                "nutritionist_name": nutritionist.user.username if nutritionist and nutritionist.user else "Unknown",
                "nutritionist_credentials": nutritionist.credentials if nutritionist else None,
                "total_days": total_days,
                "days": []
            }
            
            enriched.append(MealPlanWithDetails(**plan_dict))
        
        return enriched, total
    
    async def update_meal_plan(
        self,
        plan_id: str,
        plan_data: MealPlanUpdate,
        current_user_id: str
    ) -> MealPlanResponse:
        """Update a meal plan"""
        
        plan = await self._get_meal_plan(plan_id)
        if not plan:
            raise NotFoundError("Meal Plan", plan_id)
        
        # Update fields
        update_data = plan_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(plan, field, value)
        
        plan.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(plan)
        
        return MealPlanResponse.model_validate(plan)
    
    async def add_day_to_plan(
        self,
        plan_id: str,
        day_data: MealPlanDayCreate
    ) -> MealPlanDayWithMeals:
        """Add a day to a meal plan"""
        
        plan = await self._get_meal_plan(plan_id)
        if not plan:
            raise NotFoundError("Meal Plan", plan_id)
        
        day = MealPlanDay(
            meal_plan_id=plan_id,
            day_number=day_data.day_number,
            day_of_week=day_data.day_of_week,
            notes=day_data.notes
        )
        
        self.db.add(day)
        await self.db.commit()
        await self.db.refresh(day)
        
        day_dict = {
            **day.__dict__,
            "meals": [],
            "total_daily_calories": 0,
            "total_daily_protein": Decimal("0.0"),
            "total_daily_carbs": Decimal("0.0"),
            "total_daily_fats": Decimal("0.0")
        }
        
        return MealPlanDayWithMeals(**day_dict)
    
    async def add_meal_to_day(
        self,
        day_id: str,
        meal_data: MealPlanMealCreate
    ) -> MealPlanMealResponse:
        """Add a meal to a day"""
        
        # Verify day exists
        day_result = await self.db.execute(
            select(MealPlanDay).where(MealPlanDay.id == day_id)
        )
        day = day_result.scalar_one_or_none()
        if not day:
            raise NotFoundError("Meal Plan Day", day_id)
        
        meal = MealPlanMeal(
            day_id=day_id,
            meal_type=meal_data.meal_type,
            time_suggestion=meal_data.time_suggestion,
            meal_description=meal_data.meal_description,
            ingredients=meal_data.ingredients,
            preparation_notes=meal_data.preparation_notes,
            calories=meal_data.calories,
            protein_grams=meal_data.protein_grams,
            carbs_grams=meal_data.carbs_grams,
            fats_grams=meal_data.fats_grams
        )
        
        self.db.add(meal)
        await self.db.commit()
        await self.db.refresh(meal)
        
        return MealPlanMealResponse.model_validate(meal)
    
    # ========================================================================
    # Nutrition Feedback Methods
    # ========================================================================
    
    async def create_feedback(
        self,
        feedback_data: NutritionFeedbackCreate,
        current_user_id: str
    ) -> NutritionFeedbackResponse:
        """Create nutrition feedback"""
        
        nutritionist = await self._get_staff_by_user_id(current_user_id)
        if not nutritionist:
            raise ValidationError("Current user is not registered as staff")
        
        patient = await self._get_user(feedback_data.patient_id)
        if not patient:
            raise NotFoundError("Patient", feedback_data.patient_id)
        
        feedback = NutritionFeedback(
            patient_id=feedback_data.patient_id,
            nutritionist_id=feedback_data.nutritionist_id or nutritionist.id,
            meal_plan_id=feedback_data.meal_plan_id,
            feedback_date=feedback_data.feedback_date,
            compliance_level=feedback_data.compliance_level,
            weight_progress=feedback_data.weight_progress,
            energy_levels=feedback_data.energy_levels,
            dietary_adherence_notes=feedback_data.dietary_adherence_notes,
            adjustments_recommended=feedback_data.adjustments_recommended,
            next_review_date=feedback_data.next_review_date,
            feedback_notes=feedback_data.feedback_notes
        )
        
        self.db.add(feedback)
        await self.db.commit()
        await self.db.refresh(feedback)
        
        return NutritionFeedbackResponse.model_validate(feedback)
    
    async def get_feedback(
        self,
        feedback_id: str
    ) -> Optional[NutritionFeedbackWithDetails]:
        """Get feedback by ID"""
        
        result = await self.db.execute(
            select(NutritionFeedback).where(NutritionFeedback.id == feedback_id)
        )
        feedback = result.scalar_one_or_none()
        
        if not feedback:
            return None
        
        patient = await self._get_user(feedback.patient_id)
        nutritionist = await self._get_staff(feedback.nutritionist_id)
        
        # Get meal plan name if linked
        meal_plan_name = None
        if feedback.meal_plan_id:
            plan = await self._get_meal_plan(feedback.meal_plan_id)
            meal_plan_name = plan.plan_name if plan else None
        
        feedback_dict = {
            **feedback.__dict__,
            "patient_name": patient.username if patient else "Unknown",
            "nutritionist_name": nutritionist.user.username if nutritionist and nutritionist.user else "Unknown",
            "meal_plan_name": meal_plan_name
        }
        
        return NutritionFeedbackWithDetails(**feedback_dict)
    
    async def list_feedback(
        self,
        filters: NutritionFeedbackListFilter,
        current_user_id: str,
        is_staff: bool = True
    ) -> Tuple[List[NutritionFeedbackWithDetails], int]:
        """List feedback with filters"""
        
        query = select(NutritionFeedback)
        count_query = select(func.count(NutritionFeedback.id))
        
        conditions = []
        
        if filters.patient_id:
            conditions.append(NutritionFeedback.patient_id == filters.patient_id)
        
        if filters.nutritionist_id:
            conditions.append(NutritionFeedback.nutritionist_id == filters.nutritionist_id)
        
        if filters.meal_plan_id:
            conditions.append(NutritionFeedback.meal_plan_id == filters.meal_plan_id)
        
        if filters.compliance_level:
            conditions.append(NutritionFeedback.compliance_level == filters.compliance_level)
        
        if not is_staff:
            conditions.append(NutritionFeedback.patient_id == current_user_id)
        
        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))
        
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        query = query.offset(filters.skip).limit(filters.limit)
        query = query.order_by(NutritionFeedback.feedback_date.desc())
        
        result = await self.db.execute(query)
        feedbacks = result.scalars().all()
        
        # Enrich
        enriched = []
        for feedback in feedbacks:
            patient = await self._get_user(feedback.patient_id)
            nutritionist = await self._get_staff(feedback.nutritionist_id)
            
            meal_plan_name = None
            if feedback.meal_plan_id:
                plan = await self._get_meal_plan(feedback.meal_plan_id)
                meal_plan_name = plan.plan_name if plan else None
            
            feedback_dict = {
                **feedback.__dict__,
                "patient_name": patient.username if patient else "Unknown",
                "nutritionist_name": nutritionist.user.username if nutritionist and nutritionist.user else "Unknown",
                "meal_plan_name": meal_plan_name
            }
            
            enriched.append(NutritionFeedbackWithDetails(**feedback_dict))
        
        return enriched, total
    
    async def update_feedback(
        self,
        feedback_id: str,
        feedback_data: NutritionFeedbackUpdate
    ) -> NutritionFeedbackResponse:
        """Update feedback"""
        
        feedback = await self._get_feedback(feedback_id)
        if not feedback:
            raise NotFoundError("Nutrition Feedback", feedback_id)
        
        update_data = feedback_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(feedback, field, value)
        
        feedback.updated_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(feedback)
        
        return NutritionFeedbackResponse.model_validate(feedback)
    
    # ========================================================================
    # Statistics & Analytics
    # ========================================================================
    
    async def get_stats(self, nutritionist_id: Optional[str] = None) -> NutritionStats:
        """Get nutrition module statistics"""
        
        conditions = []
        if nutritionist_id:
            conditions.append(NutritionAssessment.nutritionist_id == nutritionist_id)
        
        # Total assessments
        query = select(func.count(NutritionAssessment.id))
        if conditions:
            query = query.where(and_(*conditions))
        result = await self.db.execute(query)
        total_assessments = result.scalar()
        
        # Active meal plans
        plan_query = select(func.count(MealPlan.id)).where(MealPlan.status == MealPlanStatus.ACTIVE)
        if nutritionist_id:
            plan_query = plan_query.where(MealPlan.nutritionist_id == nutritionist_id)
        result = await self.db.execute(plan_query)
        active_meal_plans = result.scalar()
        
        # Completed meal plans
        completed_query = select(func.count(MealPlan.id)).where(MealPlan.status == MealPlanStatus.COMPLETED)
        if nutritionist_id:
            completed_query = completed_query.where(MealPlan.nutritionist_id == nutritionist_id)
        result = await self.db.execute(completed_query)
        completed_meal_plans = result.scalar()
        
        # Feedback entries
        feedback_query = select(func.count(NutritionFeedback.id))
        if nutritionist_id:
            feedback_query = feedback_query.where(NutritionFeedback.nutritionist_id == nutritionist_id)
        result = await self.db.execute(feedback_query)
        feedback_entries = result.scalar()
        
        # Patients with plans
        patients_query = select(func.count(func.distinct(MealPlan.patient_id)))
        if nutritionist_id:
            patients_query = patients_query.where(MealPlan.nutritionist_id == nutritionist_id)
        result = await self.db.execute(patients_query)
        patients_with_plans = result.scalar()
        
        return NutritionStats(
            total_assessments=total_assessments,
            active_meal_plans=active_meal_plans,
            completed_meal_plans=completed_meal_plans,
            feedback_entries=feedback_entries,
            patients_with_plans=patients_with_plans
        )
    
    async def get_patient_progress(
        self,
        patient_id: str
    ) -> PatientNutritionProgress:
        """Get patient's nutrition progress"""
        
        patient = await self._get_user(patient_id)
        if not patient:
            raise NotFoundError("Patient", patient_id)
        
        # Get latest assessment
        assessment_result = await self.db.execute(
            select(NutritionAssessment)
            .where(NutritionAssessment.patient_id == patient_id)
            .order_by(NutritionAssessment.assessment_date.desc())
            .limit(1)
        )
        latest_assessment = assessment_result.scalar_one_or_none()
        
        current_weight = latest_assessment.current_weight if latest_assessment else None
        target_weight = latest_assessment.target_weight if latest_assessment else None
        
        # Calculate weight change
        weight_change = None
        if current_weight and target_weight:
            weight_change = current_weight - target_weight
        
        # Get active meal plan
        plan_result = await self.db.execute(
            select(MealPlan)
            .where(
                and_(
                    MealPlan.patient_id == patient_id,
                    MealPlan.status == MealPlanStatus.ACTIVE
                )
            )
            .limit(1)
        )
        active_plan = plan_result.scalar_one_or_none()
        
        # Get latest feedback
        feedback_result = await self.db.execute(
            select(NutritionFeedback)
            .where(NutritionFeedback.patient_id == patient_id)
            .order_by(NutritionFeedback.feedback_date.desc())
            .limit(1)
        )
        latest_feedback = feedback_result.scalar_one_or_none()
        
        return PatientNutritionProgress(
            patient_id=patient_id,
            patient_name=patient.username,
            current_weight=current_weight,
            target_weight=target_weight,
            weight_change=weight_change,
            active_meal_plan=MealPlanResponse.model_validate(active_plan) if active_plan else None,
            latest_feedback=NutritionFeedbackResponse.model_validate(latest_feedback) if latest_feedback else None,
            compliance_trend="stable"  # TODO: Calculate trend
        )
    
    # Helper methods
    
    async def _get_assessment(self, assessment_id: str) -> Optional[NutritionAssessment]:
        result = await self.db.execute(
            select(NutritionAssessment).where(NutritionAssessment.id == assessment_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_meal_plan(self, plan_id: str) -> Optional[MealPlan]:
        result = await self.db.execute(
            select(MealPlan).where(MealPlan.id == plan_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_feedback(self, feedback_id: str) -> Optional[NutritionFeedback]:
        result = await self.db.execute(
            select(NutritionFeedback).where(NutritionFeedback.id == feedback_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_user(self, user_id: str) -> Optional[User]:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def _get_staff(self, staff_id: str) -> Optional[Staff]:
        result = await self.db.execute(
            select(Staff)
            .where(Staff.id == staff_id)
            .options(joinedload(Staff.user))
        )
        return result.scalar_one_or_none()
    
    async def _get_staff_by_user_id(self, user_id: str) -> Optional[Staff]:
        result = await self.db.execute(
            select(Staff)
            .where(Staff.user_id == user_id)
            .options(joinedload(Staff.user))
        )
        return result.scalar_one_or_none()

