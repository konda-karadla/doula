from fastapi import APIRouter

# Import domain endpoints
from app.domains.auth.endpoints.auth import router as auth_router
from app.domains.labs.endpoints.labs import router as labs_router
from app.domains.lab_orders.endpoints.lab_orders import router as lab_orders_router
from app.domains.action_plans.endpoints.action_plans import router as action_plans_router
from app.domains.consultations.endpoints.consultations import router as consultations_router
from app.domains.nutrition.endpoints.nutrition import router as nutrition_router
from app.domains.vitals.endpoints.vitals import router as vitals_router

# Newly migrated domains
from app.domains.soap_notes.endpoints.soap_notes import router as soap_notes_router
from app.domains.insights.endpoints.insights import router as insights_router
from app.domains.profile.endpoints.profile import router as profile_router
from app.domains.admin.endpoints.admin import router as admin_router

api_router = APIRouter()

# Authentication
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])

# Labs
api_router.include_router(labs_router, prefix="/labs", tags=["labs"])

# Lab Orders
api_router.include_router(lab_orders_router, prefix="/lab-orders", tags=["lab-orders"])

# Specialized Medical Modules
api_router.include_router(action_plans_router, prefix="/action-plans", tags=["action-plans"])
api_router.include_router(consultations_router, prefix="/consultations", tags=["consultations"])
api_router.include_router(nutrition_router, prefix="/nutrition", tags=["nutrition"])
api_router.include_router(vitals_router, prefix="/vitals", tags=["vitals"])

# Newly migrated domains
api_router.include_router(soap_notes_router, prefix="/soap-notes", tags=["soap-notes"])
api_router.include_router(insights_router, prefix="/insights", tags=["insights"])
api_router.include_router(profile_router, prefix="/profile", tags=["profile"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])
