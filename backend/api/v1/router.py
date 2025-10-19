from fastapi import APIRouter

from backend.api.v1.endpoints import auth, labs, action_plans, insights, profile, consultations, admin_consultations, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(labs.router, prefix="/labs", tags=["labs"])
api_router.include_router(action_plans.router, prefix="/action-plans", tags=["action-plans"])
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(consultations.router, prefix="/consultations", tags=["consultations"])
api_router.include_router(admin_consultations.router, prefix="/admin/consultations", tags=["admin-consultations"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
