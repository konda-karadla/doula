from fastapi import APIRouter

from api.v1.endpoints import (
    auth, 
    labs, 
    lab_orders,  # NEW - Lab Orders Management
    action_plans, 
    insights, 
    profile, 
    consultations, 
    admin_consultations, 
    admin,
    soap_notes,  # NEW - Physician
    vitals,  # NEW - Nurse
    nutrition  # NEW - Nutritionist
)

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Patient features
api_router.include_router(labs.router, prefix="/labs", tags=["labs"])
api_router.include_router(lab_orders.router, prefix="/lab-orders", tags=["lab-orders"])
api_router.include_router(action_plans.router, prefix="/action-plans", tags=["action-plans"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["consultations"])

# Clinical documentation (Staff)
api_router.include_router(soap_notes.router, prefix="/soap-notes", tags=["soap-notes"])
api_router.include_router(vitals.router, prefix="/vitals", tags=["vitals"])
api_router.include_router(nutrition.router, prefix="/nutrition", tags=["nutrition"])

# Admin features
api_router.include_router(admin_consultations.router, prefix="/admin/consultations", tags=["admin-consultations"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
