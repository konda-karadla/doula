from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from core.config import settings
from core.database import engine
from core.exceptions import EXCEPTION_HANDLERS
from api.v1.router import api_router

# Import all models to ensure they're registered with SQLAlchemy metadata
from models import (
    User, System, 
    Doctor, AvailabilitySlot, Consultation,
    LabResult, Biomarker,
    ActionPlan, ActionItem,
    Staff, Department,
    SOAPNote, SOAPNoteAttachment,
    VitalsRecord, VitalsAlert,
    NutritionAssessment, MealPlan, MealPlanDay, MealPlanMeal, NutritionFeedback,
    LabTestOrder,
    MedicalHistory, Medication,
    AuditLog,
    ModulePermission, ApplicationAccess
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up application...")
    yield
    logger.info("Shutting down application...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Multi-tenant health platform supporting Doula Care, Functional Health, and Elderly Care",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api",
    openapi_tags=[
        {"name": "auth", "description": "Authentication endpoints"},
        {"name": "users", "description": "User management"},
        {"name": "labs", "description": "Lab results and biomarkers"},
        {"name": "action-plans", "description": "Health action plans"},
        {"name": "consultations", "description": "Doctor consultations"},
        {"name": "insights", "description": "Health insights"},
        {"name": "profile", "description": "User profile"},
    ]
)

# Add exception handlers
for exception_type, handler in EXCEPTION_HANDLERS.items():
    app.add_exception_handler(exception_type, handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
async def root():
    return {"message": "Health Platform API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
