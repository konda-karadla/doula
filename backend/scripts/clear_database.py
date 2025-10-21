#!/usr/bin/env python3
"""
Script to clear all data from the database
"""
import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import async_session_maker, engine
from sqlalchemy import text
from models import (
    System, User, Staff, Department, Doctor, AvailabilitySlot,
    LabResult, Biomarker, ActionPlan, ActionItem, Consultation,
    SOAPNote, VitalsRecord, VitalsAlert, NutritionAssessment,
    MealPlan, MealPlanDay, MealPlanMeal, NutritionFeedback,
    LabTestOrder, MedicalHistory, Medication, AuditLog,
    ModulePermission, ApplicationAccess, SystemConfig, FeatureFlag,
    RefreshToken
)

async def clear_database():
    """Clear all data from the database"""
    print("🗑️  Clearing database...")
    
    async with async_session_maker() as session:
        try:
            # Delete in reverse order of dependencies
            await session.execute(text("DELETE FROM nutrition_feedback"))
            await session.execute(text("DELETE FROM meal_plan_meals"))
            await session.execute(text("DELETE FROM meal_plan_days"))
            await session.execute(text("DELETE FROM meal_plans"))
            await session.execute(text("DELETE FROM nutrition_assessments"))
            await session.execute(text("DELETE FROM vitals_alerts"))
            await session.execute(text("DELETE FROM vitals_records"))
            await session.execute(text("DELETE FROM soap_note_attachments"))
            await session.execute(text("DELETE FROM soap_notes"))
            await session.execute(text("DELETE FROM medications"))
            await session.execute(text("DELETE FROM medical_history"))
            await session.execute(text("DELETE FROM lab_test_orders"))
            await session.execute(text("DELETE FROM biomarkers"))
            await session.execute(text("DELETE FROM lab_results"))
            await session.execute(text("DELETE FROM action_items"))
            await session.execute(text("DELETE FROM action_plans"))
            await session.execute(text("DELETE FROM consultations"))
            await session.execute(text("DELETE FROM availability_slots"))
            await session.execute(text("DELETE FROM doctors"))
            await session.execute(text("DELETE FROM staff"))
            await session.execute(text("DELETE FROM departments"))
            await session.execute(text("DELETE FROM refresh_tokens"))
            await session.execute(text("DELETE FROM users"))
            await session.execute(text("DELETE FROM module_permissions"))
            await session.execute(text("DELETE FROM application_access"))
            await session.execute(text("DELETE FROM feature_flags"))
            await session.execute(text("DELETE FROM system_configs"))
            await session.execute(text("DELETE FROM audit_logs"))
            await session.execute(text("DELETE FROM systems"))
            
            await session.commit()
            print("✅ Database cleared successfully!")
            
        except Exception as e:
            print(f"❌ Error clearing database: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(clear_database())
