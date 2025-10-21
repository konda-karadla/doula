from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from core.database import Base
from schemas.enums import LabOrderPriority, LabOrderStatus


class LabTestOrder(Base):
    """Lab test orders placed by physicians"""
    __tablename__ = "lab_test_orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    patient_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ordering_physician_id = Column(String, ForeignKey("staff.id", ondelete="CASCADE"), nullable=False, index=True)
    system_id = Column(String, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    
    order_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    priority = Column(SQLEnum(LabOrderPriority), default=LabOrderPriority.ROUTINE, nullable=False, index=True)
    
    # Test details
    test_types = Column(Text, nullable=False)  # JSON array or comma-separated list
    clinical_indication = Column(Text, nullable=True)  # Reason for ordering tests
    special_instructions = Column(Text, nullable=True)
    
    # External lab information
    external_lab_name = Column(String, nullable=True)
    external_lab_reference = Column(String, nullable=True)
    
    # Collection details
    collection_date = Column(DateTime(timezone=True), nullable=True)
    collected_by = Column(String, ForeignKey("staff.id", ondelete="SET NULL"), nullable=True)
    
    status = Column(SQLEnum(LabOrderStatus), default=LabOrderStatus.ORDERED, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    patient = relationship("User", back_populates="lab_orders", foreign_keys=[patient_id])
    ordering_physician = relationship("Staff", back_populates="lab_orders", foreign_keys=[ordering_physician_id])
    collector = relationship("Staff", foreign_keys=[collected_by])
    system = relationship("System", back_populates="lab_orders")

