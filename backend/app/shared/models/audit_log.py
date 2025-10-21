from sqlalchemy import Column, String, DateTime, Text, Enum as SQLEnum
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base
from schemas.enums import AuditActionType


class AuditLog(Base):
    """Audit log for tracking all system actions"""
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, nullable=True, index=True)  # User or staff who performed the action
    
    action_type = Column(SQLEnum(AuditActionType), nullable=False, index=True)
    entity_type = Column(String, nullable=False, index=True)  # e.g., "PATIENT", "SOAP_NOTE", "VITALS"
    entity_id = Column(String, nullable=True, index=True)
    
    description = Column(Text, nullable=True)
    changes = Column(Text, nullable=True)  # JSON string of changes made
    
    ip_address = Column(String, nullable=True)
    user_agent = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    # No relationships to avoid circular dependencies and keep audit log independent

