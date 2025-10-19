from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from app.core.database import Base


class System(Base):
    __tablename__ = "systems"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    name = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    users = relationship("User", back_populates="system", cascade="all, delete-orphan")
    system_configs = relationship("SystemConfig", back_populates="system", cascade="all, delete-orphan")
    feature_flags = relationship("FeatureFlag", back_populates="system", cascade="all, delete-orphan")
    lab_results = relationship("LabResult", back_populates="system", cascade="all, delete-orphan")
    action_plans = relationship("ActionPlan", back_populates="system", cascade="all, delete-orphan")
    doctors = relationship("Doctor", back_populates="system", cascade="all, delete-orphan")
