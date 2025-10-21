"""
Seed script to populate default permissions for roles and applications.
Run this after setting up the database to establish access control rules.
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from sqlalchemy.ext.asyncio import AsyncSession
from core.database import async_session_maker
from models.permissions import ModulePermission, ApplicationAccess
from schemas.enums import UserRole, ModuleCategory


async def seed_application_access(db: AsyncSession):
    """Define which roles can access which applications"""
    
    applications = [
        {
            "application_name": "health_platform",
            "allowed_roles": '["patient", "user"]',
            "description": "Patient-facing health platform portal",
            "is_active": True
        },
        {
            "application_name": "admin_portal",
            "allowed_roles": '["admin", "physician", "nutritionist", "nurse"]',
            "description": "Staff-facing admin application",
            "is_active": True
        }
    ]
    
    for app_data in applications:
        app = ApplicationAccess(**app_data)
        db.add(app)
    
    await db.commit()
    print("✓ Application access rules seeded")


async def seed_module_permissions(db: AsyncSession):
    """Define module-level permissions for each role in admin application"""
    
    # Module definitions with their categories
    modules = {
        # Common modules - accessible by all staff
        "dashboard": ModuleCategory.COMMON,
        "patients": ModuleCategory.COMMON,
        "reports": ModuleCategory.COMMON,
        "settings": ModuleCategory.COMMON,
        
        # Physician modules
        "soap_notes": ModuleCategory.PHYSICIAN,
        "lab_orders": ModuleCategory.PHYSICIAN,
        "lab_reviews": ModuleCategory.PHYSICIAN,
        "prescriptions": ModuleCategory.PHYSICIAN,
        "medical_history": ModuleCategory.PHYSICIAN,
        
        # Nutritionist modules
        "nutrition_assessments": ModuleCategory.NUTRITIONIST,
        "meal_plans": ModuleCategory.NUTRITIONIST,
        "nutrition_feedback": ModuleCategory.NUTRITIONIST,
        
        # Nurse modules
        "vitals": ModuleCategory.NURSE,
        "vitals_alerts": ModuleCategory.NURSE,
        
        # Admin-only modules
        "user_management": ModuleCategory.ADMIN,
        "staff_management": ModuleCategory.ADMIN,
        "department_management": ModuleCategory.ADMIN,
        "system_configuration": ModuleCategory.ADMIN,
        "audit_logs": ModuleCategory.ADMIN,
    }
    
    # Role-specific permissions
    role_permissions = {
        UserRole.ADMIN: {
            "common": {"view": True, "create": True, "update": True, "delete": True},
            "physician": {"view": True, "create": True, "update": True, "delete": True},
            "nutritionist": {"view": True, "create": True, "update": True, "delete": True},
            "nurse": {"view": True, "create": True, "update": True, "delete": True},
            "admin": {"view": True, "create": True, "update": True, "delete": True},
        },
        UserRole.PHYSICIAN: {
            "common": {"view": True, "create": True, "update": True, "delete": False},
            "physician": {"view": True, "create": True, "update": True, "delete": False},
            "nutritionist": {"view": True, "create": False, "update": False, "delete": False},
            "nurse": {"view": True, "create": False, "update": False, "delete": False},
            "admin": {"view": False, "create": False, "update": False, "delete": False},
        },
        UserRole.NUTRITIONIST: {
            "common": {"view": True, "create": True, "update": True, "delete": False},
            "physician": {"view": True, "create": False, "update": False, "delete": False},
            "nutritionist": {"view": True, "create": True, "update": True, "delete": False},
            "nurse": {"view": True, "create": False, "update": False, "delete": False},
            "admin": {"view": False, "create": False, "update": False, "delete": False},
        },
        UserRole.NURSE: {
            "common": {"view": True, "create": True, "update": True, "delete": False},
            "physician": {"view": True, "create": False, "update": False, "delete": False},
            "nutritionist": {"view": False, "create": False, "update": False, "delete": False},
            "nurse": {"view": True, "create": True, "update": True, "delete": False},
            "admin": {"view": False, "create": False, "update": False, "delete": False},
        },
    }
    
    # Create permission entries
    for module_name, module_category in modules.items():
        for role, category_perms in role_permissions.items():
            category_name = module_category.value
            perms = category_perms.get(category_name, {"view": False, "create": False, "update": False, "delete": False})
            
            permission = ModulePermission(
                module_name=module_name,
                module_category=category_name,
                role=role,
                can_view=perms["view"],
                can_create=perms["create"],
                can_update=perms["update"],
                can_delete=perms["delete"]
            )
            db.add(permission)
    
    await db.commit()
    print("✓ Module permissions seeded")


async def main():
    """Main function to seed all permission data"""
    print("🌱 Seeding permission data...")
    
    async with async_session_maker() as db:
        try:
            # Check if data already exists
            from sqlalchemy import select
            result = await db.execute(select(ApplicationAccess))
            existing = result.scalar_one_or_none()
            
            if existing:
                print("⚠️  Permission data already exists. Skipping...")
                return
            
            # Seed data
            await seed_application_access(db)
            await seed_module_permissions(db)
            
            print("✅ Permission data seeded successfully!")
            
        except Exception as e:
            print(f"❌ Error seeding permissions: {e}")
            await db.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(main())

