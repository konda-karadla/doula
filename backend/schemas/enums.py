from enum import Enum


class Priority(str, Enum):
    """Priority levels for action items"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ActionPlanStatus(str, Enum):
    """Status values for action plans"""
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"


class ProcessingStatus(str, Enum):
    """Lab result processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class InsightPriority(str, Enum):
    """Priority levels for health insights"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class InsightStatus(str, Enum):
    """Status values for health insights"""
    NORMAL = "normal"
    ABNORMAL = "abnormal"
    BORDERLINE = "borderline"
    CRITICAL = "critical"


class UserRole(str, Enum):
    """User roles in the system"""
    USER = "user"
    PATIENT = "patient"
    ADMIN = "admin"  # Full system access
    PHYSICIAN = "physician"
    NUTRITIONIST = "nutritionist"
    NURSE = "nurse"


class StaffType(str, Enum):
    """Staff types for healthcare providers"""
    PHYSICIAN = "physician"
    NUTRITIONIST = "nutritionist"
    NURSE = "nurse"
    ADMIN = "admin"


class ProfileType(str, Enum):
    """User profile types"""
    PATIENT = "patient"
    DOCTOR = "doctor"
    ADMIN = "admin"


class JourneyType(str, Enum):
    """User journey types"""
    PREGNANCY = "pregnancy"
    POSTPARTUM = "postpartum"
    GENERAL = "general"


class SOAPNoteStatus(str, Enum):
    """SOAP note status"""
    DRAFT = "draft"
    COMPLETED = "completed"
    SIGNED = "signed"


class AttachmentType(str, Enum):
    """Attachment file types"""
    IMAGE = "image"
    DOCUMENT = "document"
    AUDIO = "audio"


class MealType(str, Enum):
    """Types of meals"""
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"
    MORNING_SNACK = "morning_snack"
    EVENING_SNACK = "evening_snack"


class MealPlanStatus(str, Enum):
    """Meal plan status"""
    ACTIVE = "active"
    COMPLETED = "completed"
    REVISED = "revised"
    CANCELLED = "cancelled"


class ComplianceLevel(str, Enum):
    """Patient compliance levels"""
    POOR = "poor"
    FAIR = "fair"
    GOOD = "good"
    EXCELLENT = "excellent"


class VitalsLocation(str, Enum):
    """Location where vitals were recorded"""
    CLINIC = "clinic"
    HOME = "home"
    HOSPITAL = "hospital"
    EMERGENCY = "emergency"


class VitalsStatus(str, Enum):
    """Status of vital signs"""
    NORMAL = "normal"
    ABNORMAL = "abnormal"
    CRITICAL = "critical"


class VitalsAlertType(str, Enum):
    """Types of vitals alerts"""
    HIGH_BP = "high_bp"
    LOW_BP = "low_bp"
    HIGH_TEMP = "high_temp"
    LOW_TEMP = "low_temp"
    HIGH_HEART_RATE = "high_heart_rate"
    LOW_HEART_RATE = "low_heart_rate"
    LOW_OXYGEN = "low_oxygen"
    HIGH_GLUCOSE = "high_glucose"
    LOW_GLUCOSE = "low_glucose"


class AlertSeverity(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class LabTestCategory(str, Enum):
    """Categories of lab tests"""
    BLOOD_WORK = "blood_work"
    URINALYSIS = "urinalysis"
    IMAGING = "imaging"
    PATHOLOGY = "pathology"
    MICROBIOLOGY = "microbiology"
    GENETIC = "genetic"
    OTHER = "other"


class LabOrderPriority(str, Enum):
    """Priority levels for lab orders"""
    ROUTINE = "routine"
    URGENT = "urgent"
    STAT = "stat"


class LabOrderStatus(str, Enum):
    """Status of lab test orders"""
    ORDERED = "ordered"
    COLLECTED = "collected"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class MedicationStatus(str, Enum):
    """Status of medications"""
    ACTIVE = "active"
    COMPLETED = "completed"
    DISCONTINUED = "discontinued"
    ON_HOLD = "on_hold"


class AuditActionType(str, Enum):
    """Types of audit actions"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    VIEW = "view"
    LOGIN = "login"
    LOGOUT = "logout"


class TrendDirection(str, Enum):
    """Trend direction for biomarkers"""
    UP = "up"
    DOWN = "down"
    STABLE = "stable"


class ResultStatus(str, Enum):
    """Status of biomarker results"""
    NORMAL = "normal"
    ABNORMAL = "abnormal"
    CRITICAL = "critical"


class ApplicationType(str, Enum):
    """Types of applications in the system"""
    HEALTH_PLATFORM = "health_platform"  # Patient-facing portal
    ADMIN_PORTAL = "admin_portal"  # Staff-facing admin application


class ModuleCategory(str, Enum):
    """Categories of modules in the admin application"""
    COMMON = "common"  # Accessible by all staff
    PHYSICIAN = "physician"  # Physician-specific modules
    NUTRITIONIST = "nutritionist"  # Nutritionist-specific modules
    NURSE = "nurse"  # Nurse-specific modules
    ADMIN = "admin"  # Admin-only modules
    PATIENT = "patient"  # Patient portal modules
