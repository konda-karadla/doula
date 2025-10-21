#!/usr/bin/env python3
"""
Database seeding script to populate tables with mock data for testing
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta
from typing import List
import uuid

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.database import async_session_maker
from models import (
    System, User, Staff, Department, Doctor, AvailabilitySlot,
    LabResult, Biomarker, ActionPlan, ActionItem, Consultation,
    SOAPNote, VitalsRecord, VitalsAlert, NutritionAssessment,
    MealPlan, MealPlanDay, MealPlanMeal, NutritionFeedback,
    LabTestOrder, MedicalHistory, Medication, AuditLog,
    ModulePermission, ApplicationAccess, SystemConfig, FeatureFlag
)
from schemas.enums import (
    ProfileType, JourneyType, UserRole, StaffType, Priority,
    ActionPlanStatus, ProcessingStatus, SOAPNoteStatus,
    MealType, MealPlanStatus, ComplianceLevel, VitalsLocation,
    VitalsStatus, VitalsAlertType, AlertSeverity, LabTestCategory,
    LabOrderPriority, LabOrderStatus, MedicationStatus,
    AuditActionType, ApplicationType, ModuleCategory
)
from core.security import get_password_hash


async def create_systems(session):
    """Create test systems"""
    from sqlalchemy import select
    
    # Check if systems already exist
    result = await session.execute(select(System))
    existing_systems = result.scalars().all()
    
    if existing_systems:
        print("⏭️  Systems already exist, skipping creation")
        return existing_systems
    
    systems = [
        System(
            id=str(uuid.uuid4()),
            name="Health Platform",
            slug="health-platform"
        ),
        System(
            id=str(uuid.uuid4()),
            name="Doula Care System",
            slug="doula-care"
        ),
        System(
            id=str(uuid.uuid4()),
            name="Functional Health",
            slug="functional-health"
        )
    ]
    
    for system in systems:
        session.add(system)
    
    await session.commit()
    print("✅ Created systems")
    return systems


async def create_departments(session, systems):
    """Create test departments"""
    from sqlalchemy import select
    
    # Check if departments already exist
    result = await session.execute(select(Department))
    existing_departments = result.scalars().all()
    
    if existing_departments:
        print("⏭️  Departments already exist, skipping creation")
        return existing_departments
    
    departments = [
        Department(
            id=str(uuid.uuid4()),
            system_id=systems[0].id,
            name="Internal Medicine",
            description="General internal medicine department"
        ),
        Department(
            id=str(uuid.uuid4()),
            system_id=systems[0].id,
            name="Obstetrics & Gynecology",
            description="Women's health and pregnancy care"
        ),
        Department(
            id=str(uuid.uuid4()),
            system_id=systems[0].id,
            name="Nutrition",
            description="Nutritional counseling and meal planning"
        ),
        Department(
            id=str(uuid.uuid4()),
            system_id=systems[0].id,
            name="Nursing",
            description="Nursing care and vital signs monitoring"
        )
    ]
    
    for dept in departments:
        session.add(dept)
    
    await session.commit()
    print("✅ Created departments")
    return departments


async def create_users(session, systems):
    """Create test users"""
    from sqlalchemy import select
    
    # Check if users already exist
    result = await session.execute(select(User))
    existing_users = result.scalars().all()
    
    if existing_users:
        print("⏭️  Users already exist, skipping creation")
        return existing_users
    
    users = [
        User(
            id=str(uuid.uuid4()),
            email="patient1@example.com",
            username="patient1",
            password=get_password_hash("password123"),
            role=UserRole.PATIENT,
            profile_type=ProfileType.PATIENT,
            journey_type=JourneyType.GENERAL,
            system_id=systems[0].id,
            is_active=True
        ),
        User(
            id=str(uuid.uuid4()),
            email="patient2@example.com",
            username="patient2",
            password=get_password_hash("password123"),
            role=UserRole.PATIENT,
            profile_type=ProfileType.PATIENT,
            journey_type=JourneyType.PREGNANCY,
            system_id=systems[1].id,
            is_active=True
        ),
        User(
            id=str(uuid.uuid4()),
            email="admin@example.com",
            username="admin",
            password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            profile_type=ProfileType.ADMIN,
            journey_type=JourneyType.GENERAL,
            system_id=systems[0].id,
            is_active=True
        )
    ]
    
    for user in users:
        session.add(user)
    
    await session.commit()
    print("✅ Created users")
    return users


async def create_staff(session, departments, systems, users):
    """Create test staff members"""
    # First create staff users
    staff_users = [
        User(
            id=str(uuid.uuid4()),
            email="doctor1@example.com",
            username="doctor1",
            password=get_password_hash("doctor123"),
            role=UserRole.PHYSICIAN,
            system_id=systems[0].id,
            is_active=True
        ),
        User(
            id=str(uuid.uuid4()),
            email="nutritionist1@example.com",
            username="nutritionist1",
            password=get_password_hash("nutrition123"),
            role=UserRole.NUTRITIONIST,
            system_id=systems[0].id,
            is_active=True
        ),
        User(
            id=str(uuid.uuid4()),
            email="nurse1@example.com",
            username="nurse1",
            password=get_password_hash("nurse123"),
            role=UserRole.NURSE,
            system_id=systems[0].id,
            is_active=True
        )
    ]
    
    for user in staff_users:
        session.add(user)
    
    await session.commit()
    
    # Now create staff profiles
    staff_members = [
        Staff(
            id=str(uuid.uuid4()),
            user_id=staff_users[0].id,
            staff_type=StaffType.PHYSICIAN,
            department_id=departments[0].id,
            system_id=systems[0].id,
            is_active=True
        ),
        Staff(
            id=str(uuid.uuid4()),
            user_id=staff_users[1].id,
            staff_type=StaffType.NUTRITIONIST,
            department_id=departments[2].id,
            system_id=systems[0].id,
            is_active=True
        ),
        Staff(
            id=str(uuid.uuid4()),
            user_id=staff_users[2].id,
            staff_type=StaffType.NURSE,
            department_id=departments[3].id,
            system_id=systems[0].id,
            is_active=True
        )
    ]
    
    for staff in staff_members:
        session.add(staff)
    
    await session.commit()
    print("✅ Created staff members")
    return staff_members


async def create_doctors(session, systems):
    """Create test doctors"""
    doctors = [
        Doctor(
            id=str(uuid.uuid4()),
            system_id=systems[0].id,
            name="Dr. John Smith",
            specialization="Internal Medicine",
            bio="Experienced internal medicine physician with 10+ years of practice",
            qualifications="MD, FACP",
            experience=10,
            consultation_fee=150.00,
            is_active=True
        )
    ]
    
    for doctor in doctors:
        session.add(doctor)
    
    await session.commit()
    print("✅ Created doctors")
    return doctors


async def create_consultations(session, users, doctors):
    """Create test consultations"""
    consultations = [
        Consultation(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            doctor_id=doctors[0].id,
            scheduled_at=datetime.utcnow() + timedelta(days=1),
            duration_minutes=30,
            status="scheduled",
            notes="Regular checkup appointment",
            created_at=datetime.utcnow()
        ),
        Consultation(
            id=str(uuid.uuid4()),
            patient_id=users[1].id,
            doctor_id=doctors[0].id,
            scheduled_at=datetime.utcnow() + timedelta(days=2),
            duration_minutes=45,
            status="scheduled",
            notes="Prenatal consultation",
            created_at=datetime.utcnow()
        )
    ]
    
    for consultation in consultations:
        session.add(consultation)
    
    await session.commit()
    print("✅ Created consultations")
    return consultations


async def create_lab_results(session, users):
    """Create test lab results"""
    lab_results = [
        LabResult(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            test_name="Complete Blood Count",
            test_date=datetime.utcnow() - timedelta(days=7),
            status=ProcessingStatus.COMPLETED,
            raw_data={"hemoglobin": 14.2, "hematocrit": 42.1, "wbc": 7.5},
            processed_data={"hemoglobin": "normal", "hematocrit": "normal", "wbc": "normal"},
            created_at=datetime.utcnow()
        ),
        LabResult(
            id=str(uuid.uuid4()),
            patient_id=users[1].id,
            test_name="Pregnancy Panel",
            test_date=datetime.utcnow() - timedelta(days=3),
            status=ProcessingStatus.COMPLETED,
            raw_data={"hcg": 25000, "progesterone": 25.3},
            processed_data={"hcg": "elevated", "progesterone": "normal"},
            created_at=datetime.utcnow()
        )
    ]
    
    for result in lab_results:
        session.add(result)
    
    await session.commit()
    print("✅ Created lab results")
    return lab_results


async def create_biomarkers(session, lab_results):
    """Create test biomarkers"""
    biomarkers = [
        Biomarker(
            id=str(uuid.uuid4()),
            lab_result_id=lab_results[0].id,
            name="Hemoglobin",
            value=14.2,
            unit="g/dL",
            reference_range="12.0-15.5",
            status="normal",
            trend_direction="stable",
            created_at=datetime.utcnow()
        ),
        Biomarker(
            id=str(uuid.uuid4()),
            lab_result_id=lab_results[1].id,
            name="HCG",
            value=25000,
            unit="mIU/mL",
            reference_range="<5",
            status="elevated",
            trend_direction="up",
            created_at=datetime.utcnow()
        )
    ]
    
    for biomarker in biomarkers:
        session.add(biomarker)
    
    await session.commit()
    print("✅ Created biomarkers")
    return biomarkers


async def create_action_plans(session, users, staff_members):
    """Create test action plans"""
    action_plans = [
        ActionPlan(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            created_by_id=staff_members[0].id,
            title="Weight Management Plan",
            description="Comprehensive plan for healthy weight management",
            status=ActionPlanStatus.ACTIVE,
            priority=Priority.MEDIUM,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=90),
            created_at=datetime.utcnow()
        ),
        ActionPlan(
            id=str(uuid.uuid4()),
            patient_id=users[1].id,
            created_by_id=staff_members[0].id,
            title="Prenatal Care Plan",
            description="Comprehensive prenatal care and monitoring",
            status=ActionPlanStatus.ACTIVE,
            priority=Priority.HIGH,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=180),
            created_at=datetime.utcnow()
        )
    ]
    
    for plan in action_plans:
        session.add(plan)
    
    await session.commit()
    print("✅ Created action plans")
    return action_plans


async def create_action_items(session, action_plans):
    """Create test action items"""
    action_items = [
        ActionItem(
            id=str(uuid.uuid4()),
            action_plan_id=action_plans[0].id,
            title="Daily Exercise",
            description="30 minutes of moderate exercise daily",
            priority=Priority.MEDIUM,
            due_date=datetime.utcnow() + timedelta(days=7),
            is_completed=False,
            created_at=datetime.utcnow()
        ),
        ActionItem(
            id=str(uuid.uuid4()),
            action_plan_id=action_plans[1].id,
            title="Prenatal Vitamins",
            description="Take prenatal vitamins daily",
            priority=Priority.HIGH,
            due_date=datetime.utcnow() + timedelta(days=1),
            is_completed=True,
            completed_at=datetime.utcnow(),
            created_at=datetime.utcnow()
        )
    ]
    
    for item in action_items:
        session.add(item)
    
    await session.commit()
    print("✅ Created action items")
    return action_items


async def create_vitals_records(session, users, staff_members):
    """Create test vitals records"""
    vitals_records = [
        VitalsRecord(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            recorded_by_id=staff_members[2].id,
            systolic_bp=120,
            diastolic_bp=80,
            heart_rate=72,
            temperature=98.6,
            weight=150.5,
            height=65.0,
            oxygen_saturation=98,
            location=VitalsLocation.CLINIC,
            status=VitalsStatus.NORMAL,
            recorded_at=datetime.utcnow() - timedelta(days=1),
            created_at=datetime.utcnow()
        ),
        VitalsRecord(
            id=str(uuid.uuid4()),
            patient_id=users[1].id,
            recorded_by_id=staff_members[2].id,
            systolic_bp=110,
            diastolic_bp=70,
            heart_rate=85,
            temperature=98.4,
            weight=135.2,
            height=62.0,
            oxygen_saturation=99,
            location=VitalsLocation.CLINIC,
            status=VitalsStatus.NORMAL,
            recorded_at=datetime.utcnow() - timedelta(days=2),
            created_at=datetime.utcnow()
        )
    ]
    
    for record in vitals_records:
        session.add(record)
    
    await session.commit()
    print("✅ Created vitals records")
    return vitals_records


async def create_soap_notes(session, users, staff_members, consultations):
    """Create test SOAP notes"""
    soap_notes = [
        SOAPNote(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            created_by_id=staff_members[0].id,
            consultation_id=consultations[0].id,
            subjective="Patient reports feeling well, no current complaints",
            objective="Vital signs stable, physical exam unremarkable",
            assessment="Healthy adult, no acute issues",
            plan="Continue current medications, follow up in 3 months",
            status=SOAPNoteStatus.COMPLETED,
            created_at=datetime.utcnow()
        )
    ]
    
    for note in soap_notes:
        session.add(note)
    
    await session.commit()
    print("✅ Created SOAP notes")
    return soap_notes


async def create_nutrition_assessments(session, users, staff_members):
    """Create test nutrition assessments"""
    assessments = [
        NutritionAssessment(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            assessed_by_id=staff_members[1].id,
            assessment_date=datetime.utcnow() - timedelta(days=5),
            current_weight=150.5,
            target_weight=145.0,
            height=65.0,
            bmi=25.1,
            dietary_restrictions="None",
            allergies="None",
            goals="Weight management and improved nutrition",
            notes="Patient motivated to make dietary changes",
            created_at=datetime.utcnow()
        )
    ]
    
    for assessment in assessments:
        session.add(assessment)
    
    await session.commit()
    print("✅ Created nutrition assessments")
    return assessments


async def create_meal_plans(session, users, staff_members, assessments):
    """Create test meal plans"""
    meal_plans = [
        MealPlan(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            created_by_id=staff_members[1].id,
            nutrition_assessment_id=assessments[0].id,
            name="Weight Management Plan",
            description="Balanced meal plan for healthy weight loss",
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30),
            status=MealPlanStatus.ACTIVE,
            created_at=datetime.utcnow()
        )
    ]
    
    for plan in meal_plans:
        session.add(plan)
    
    await session.commit()
    print("✅ Created meal plans")
    return meal_plans


async def create_lab_orders(session, users, staff_members):
    """Create test lab orders"""
    lab_orders = [
        LabTestOrder(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            ordered_by_id=staff_members[0].id,
            test_name="Lipid Panel",
            test_category=LabTestCategory.BLOOD_WORK,
            priority=LabOrderPriority.ROUTINE,
            status=LabOrderStatus.ORDERED,
            notes="Routine screening",
            ordered_at=datetime.utcnow(),
            created_at=datetime.utcnow()
        )
    ]
    
    for order in lab_orders:
        session.add(order)
    
    await session.commit()
    print("✅ Created lab orders")
    return lab_orders


async def create_medical_history(session, users):
    """Create test medical history"""
    medical_histories = [
        MedicalHistory(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            condition="Hypertension",
            diagnosis_date=datetime.utcnow() - timedelta(days=365),
            status="controlled",
            notes="Well controlled with medication",
            created_at=datetime.utcnow()
        ),
        MedicalHistory(
            id=str(uuid.uuid4()),
            patient_id=users[1].id,
            condition="Pregnancy",
            diagnosis_date=datetime.utcnow() - timedelta(days=90),
            status="active",
            notes="First pregnancy, no complications",
            created_at=datetime.utcnow()
        )
    ]
    
    for history in medical_histories:
        session.add(history)
    
    await session.commit()
    print("✅ Created medical history")
    return medical_histories


async def create_medications(session, users, medical_histories):
    """Create test medications"""
    medications = [
        Medication(
            id=str(uuid.uuid4()),
            patient_id=users[0].id,
            medical_history_id=medical_histories[0].id,
            name="Lisinopril",
            dosage="10mg",
            frequency="Once daily",
            start_date=datetime.utcnow() - timedelta(days=300),
            status=MedicationStatus.ACTIVE,
            notes="For blood pressure control",
            created_at=datetime.utcnow()
        ),
        Medication(
            id=str(uuid.uuid4()),
            patient_id=users[1].id,
            medical_history_id=medical_histories[1].id,
            name="Prenatal Vitamins",
            dosage="1 tablet",
            frequency="Once daily",
            start_date=datetime.utcnow() - timedelta(days=90),
            status=MedicationStatus.ACTIVE,
            notes="Standard prenatal vitamin",
            created_at=datetime.utcnow()
        )
    ]
    
    for medication in medications:
        session.add(medication)
    
    await session.commit()
    print("✅ Created medications")
    return medications


async def create_audit_logs(session, users, staff_members):
    """Create test audit logs"""
    audit_logs = [
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=users[0].id,
            action_type=AuditActionType.LOGIN,
            resource_type="user",
            resource_id=users[0].id,
            details={"ip_address": "192.168.1.100", "user_agent": "Mozilla/5.0"},
            created_at=datetime.utcnow() - timedelta(hours=2)
        ),
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=staff_members[0].id,
            action_type=AuditActionType.CREATE,
            resource_type="consultation",
            resource_id=str(uuid.uuid4()),
            details={"patient_id": users[0].id, "scheduled_at": "2024-01-15T10:00:00Z"},
            created_at=datetime.utcnow() - timedelta(hours=1)
        )
    ]
    
    for log in audit_logs:
        session.add(log)
    
    await session.commit()
    print("✅ Created audit logs")
    return audit_logs


async def create_permissions(session, systems):
    """Create test permissions"""
    # Create application access
    app_access = ApplicationAccess(
        id=str(uuid.uuid4()),
        system_id=systems[0].id,
        application_type=ApplicationType.HEALTH_PLATFORM,
        is_active=True,
        created_at=datetime.utcnow()
    )
    session.add(app_access)
    
    # Create module permissions
    module_permissions = [
        ModulePermission(
            id=str(uuid.uuid4()),
            application_access_id=app_access.id,
            module_name="consultations",
            module_category=ModuleCategory.PHYSICIAN,
            can_view=True,
            can_create=True,
            can_update=True,
            can_delete=False,
            created_at=datetime.utcnow()
        ),
        ModulePermission(
            id=str(uuid.uuid4()),
            application_access_id=app_access.id,
            module_name="nutrition",
            module_category=ModuleCategory.NUTRITIONIST,
            can_view=True,
            can_create=True,
            can_update=True,
            can_delete=False,
            created_at=datetime.utcnow()
        ),
        ModulePermission(
            id=str(uuid.uuid4()),
            application_access_id=app_access.id,
            module_name="vitals",
            module_category=ModuleCategory.NURSE,
            can_view=True,
            can_create=True,
            can_update=True,
            can_delete=False,
            created_at=datetime.utcnow()
        )
    ]
    
    for permission in module_permissions:
        session.add(permission)
    
    await session.commit()
    print("✅ Created permissions")
    return module_permissions


async def create_system_configs(session, systems):
    """Create test system configurations"""
    configs = [
        SystemConfig(
            id=str(uuid.uuid4()),
            system_id=systems[0].id,
            key="max_consultation_duration",
            value="60",
            description="Maximum consultation duration in minutes",
            created_at=datetime.utcnow()
        ),
        SystemConfig(
            id=str(uuid.uuid4()),
            system_id=systems[0].id,
            key="default_appointment_buffer",
            value="15",
            description="Default buffer time between appointments in minutes",
            created_at=datetime.utcnow()
        )
    ]
    
    for config in configs:
        session.add(config)
    
    await session.commit()
    print("✅ Created system configurations")
    return configs


async def create_feature_flags(session, systems):
    """Create test feature flags"""
    feature_flags = [
        FeatureFlag(
            id=str(uuid.uuid4()),
            system_id=systems[0].id,
            name="enable_telemedicine",
            is_enabled=True,
            description="Enable telemedicine consultations",
            created_at=datetime.utcnow()
        ),
        FeatureFlag(
            id=str(uuid.uuid4()),
            system_id=systems[0].id,
            name="enable_ai_insights",
            is_enabled=False,
            description="Enable AI-powered health insights",
            created_at=datetime.utcnow()
        )
    ]
    
    for flag in feature_flags:
        session.add(flag)
    
    await session.commit()
    print("✅ Created feature flags")
    return feature_flags


async def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    
    async with async_session_maker() as session:
        try:
            # Create core entities
            systems = await create_systems(session)
            departments = await create_departments(session, systems)
            users = await create_users(session, systems)
            staff_members = await create_staff(session, departments, systems, users)
            doctors = await create_doctors(session, systems)
            
            # Create related entities
            consultations = await create_consultations(session, users, doctors)
            lab_results = await create_lab_results(session, users)
            biomarkers = await create_biomarkers(session, lab_results)
            action_plans = await create_action_plans(session, users, staff_members)
            action_items = await create_action_items(session, action_plans)
            vitals_records = await create_vitals_records(session, users, staff_members)
            soap_notes = await create_soap_notes(session, users, staff_members, consultations)
            assessments = await create_nutrition_assessments(session, users, staff_members)
            meal_plans = await create_meal_plans(session, users, staff_members, assessments)
            lab_orders = await create_lab_orders(session, users, staff_members)
            medical_histories = await create_medical_history(session, users)
            medications = await create_medications(session, users, medical_histories)
            audit_logs = await create_audit_logs(session, users, staff_members)
            permissions = await create_permissions(session, systems)
            configs = await create_system_configs(session, systems)
            feature_flags = await create_feature_flags(session, systems)
            
            print("\n🎉 Database seeding completed successfully!")
            print(f"Created:")
            print(f"  - {len(systems)} systems")
            print(f"  - {len(departments)} departments")
            print(f"  - {len(users)} users")
            print(f"  - {len(staff_members)} staff members")
            print(f"  - {len(doctors)} doctors")
            print(f"  - {len(consultations)} consultations")
            print(f"  - {len(lab_results)} lab results")
            print(f"  - {len(biomarkers)} biomarkers")
            print(f"  - {len(action_plans)} action plans")
            print(f"  - {len(action_items)} action items")
            print(f"  - {len(vitals_records)} vitals records")
            print(f"  - {len(soap_notes)} SOAP notes")
            print(f"  - {len(assessments)} nutrition assessments")
            print(f"  - {len(meal_plans)} meal plans")
            print(f"  - {len(lab_orders)} lab orders")
            print(f"  - {len(medical_histories)} medical history records")
            print(f"  - {len(medications)} medications")
            print(f"  - {len(audit_logs)} audit logs")
            print(f"  - {len(permissions)} permissions")
            print(f"  - {len(configs)} system configurations")
            print(f"  - {len(feature_flags)} feature flags")
            
        except Exception as e:
            print(f"❌ Error during seeding: {e}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())
