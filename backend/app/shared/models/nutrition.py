from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Integer, Text, Enum as SQLEnum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base
from schemas.enums import MealPlanStatus, MealType, ComplianceLevel


class NutritionAssessment(Base):
    """Nutritional assessments conducted by nutritionists"""
    __tablename__ = "nutrition_assessments"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    patient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    nutritionist_id = Column(String, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    
    assessment_date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Anthropometric data
    current_weight = Column(Numeric(5, 2), nullable=True)  # kg
    height = Column(Numeric(5, 2), nullable=True)          # cm
    bmi = Column(Numeric(4, 2), nullable=True)
    body_fat_percentage = Column(Numeric(4, 2), nullable=True)
    
    # Dietary information
    dietary_restrictions = Column(Text, nullable=True)  # Allergies, intolerances, preferences
    current_diet_analysis = Column(Text, nullable=True)
    nutritional_goals = Column(Text, nullable=True)
    
    # Clinical notes
    assessment_notes = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    
    status = Column(String, default="in_progress", nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("User", back_populates="nutrition_assessments", foreign_keys=[patient_id])
    nutritionist = relationship("Staff", back_populates="nutrition_assessments")
    meal_plans = relationship("MealPlan", back_populates="assessment", cascade="all, delete-orphan")


class MealPlan(Base):
    """Meal plans created by nutritionists"""
    __tablename__ = "meal_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    assessment_id = Column(String, ForeignKey("nutrition_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    nutritionist_id = Column(String, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    
    plan_name = Column(String, nullable=False)  # e.g., "Pregnancy Week 12 Plan"
    description = Column(Text, nullable=True)
    
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    
    # Nutritional targets
    daily_calorie_target = Column(Integer, nullable=True)
    protein_target_grams = Column(Integer, nullable=True)
    carbs_target_grams = Column(Integer, nullable=True)
    fats_target_grams = Column(Integer, nullable=True)
    
    special_instructions = Column(Text, nullable=True)
    status = Column(SQLEnum(MealPlanStatus), default=MealPlanStatus.ACTIVE, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    assessment = relationship("NutritionAssessment", back_populates="meal_plans")
    patient = relationship("User", back_populates="meal_plans", foreign_keys=[patient_id])
    nutritionist = relationship("Staff", foreign_keys=[nutritionist_id])
    days = relationship("MealPlanDay", back_populates="meal_plan", cascade="all, delete-orphan")
    feedback_entries = relationship("NutritionFeedback", back_populates="meal_plan", cascade="all, delete-orphan")


class MealPlanDay(Base):
    """Individual days within a meal plan"""
    __tablename__ = "meal_plan_days"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    meal_plan_id = Column(String, ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    
    day_number = Column(Integer, nullable=False)  # 1-7 for weekly plans
    day_of_week = Column(String, nullable=True)   # "Monday", "Tuesday", etc.
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    meal_plan = relationship("MealPlan", back_populates="days")
    meals = relationship("MealPlanMeal", back_populates="day", cascade="all, delete-orphan")


class MealPlanMeal(Base):
    """Individual meals within a meal plan day"""
    __tablename__ = "meal_plan_meals"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    day_id = Column(String, ForeignKey("meal_plan_days.id", ondelete="CASCADE"), nullable=False, index=True)
    
    meal_type = Column(SQLEnum(MealType), nullable=False)
    time_suggestion = Column(String, nullable=True)  # e.g., "8:00 AM"
    
    meal_name = Column(String, nullable=False)
    meal_description = Column(Text, nullable=True)
    ingredients = Column(Text, nullable=True)  # Can be JSON or formatted text
    
    # Nutritional information
    calories = Column(Integer, nullable=True)
    protein_grams = Column(Integer, nullable=True)
    carbs_grams = Column(Integer, nullable=True)
    fats_grams = Column(Integer, nullable=True)
    
    preparation_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    day = relationship("MealPlanDay", back_populates="meals")


class NutritionFeedback(Base):
    """Feedback from nutritionist on patient's progress"""
    __tablename__ = "nutrition_feedback"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    patient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    nutritionist_id = Column(String, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    meal_plan_id = Column(String, ForeignKey("meal_plans.id", ondelete="SET NULL"), nullable=True, index=True)
    
    feedback_date = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Compliance assessment
    compliance_level = Column(SQLEnum(ComplianceLevel), nullable=True)
    
    # Progress tracking
    current_weight = Column(Numeric(5, 2), nullable=True)
    weight_change = Column(Numeric(5, 2), nullable=True)  # +/- kg since last assessment
    energy_levels = Column(String, nullable=True)
    
    # Feedback notes
    dietary_adherence_notes = Column(Text, nullable=True)
    adjustments_recommended = Column(Text, nullable=True)
    positive_observations = Column(Text, nullable=True)
    challenges_identified = Column(Text, nullable=True)
    
    next_review_date = Column(Date, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("User", back_populates="nutrition_feedback", foreign_keys=[patient_id])
    nutritionist = relationship("Staff", foreign_keys=[nutritionist_id])
    meal_plan = relationship("MealPlan", back_populates="feedback_entries")

