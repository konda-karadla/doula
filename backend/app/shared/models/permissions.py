from sqlalchemy import Column, String, Boolean, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from uuid import uuid4

from app.core.database import Base
from schemas.enums import UserRole


class ModulePermission(Base):
    """Defines which roles have access to which modules in the admin application"""
    __tablename__ = "module_permissions"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    module_name = Column(String, nullable=False)  # e.g., "patients", "soap_notes", "vitals", "nutrition"
    module_category = Column(String, nullable=False)  # e.g., "physician", "nurse", "nutritionist", "common", "admin"
    role = Column(SQLEnum(UserRole), nullable=False, index=True)
    
    # Permissions
    can_view = Column(Boolean, default=False, nullable=False)
    can_create = Column(Boolean, default=False, nullable=False)
    can_update = Column(Boolean, default=False, nullable=False)
    can_delete = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Unique constraint: one permission entry per module per role
    __table_args__ = (
        UniqueConstraint('module_name', 'role', name='uq_module_role'),
    )


class ApplicationAccess(Base):
    """Defines which roles can access which applications"""
    __tablename__ = "application_access"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    application_name = Column(String, nullable=False, unique=True)  # "health_platform", "admin_portal"
    allowed_roles = Column(String, nullable=False)  # JSON array of allowed roles
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

