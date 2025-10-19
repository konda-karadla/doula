from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4

from backend.core.database import Base


class SystemConfig(Base):
    __tablename__ = "system_configs"
    __table_args__ = (
        UniqueConstraint('system_id', 'config_key', name='uix_system_config'),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    system_id = Column(String, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    config_key = Column(String, nullable=False)
    config_value = Column(String, nullable=False)
    data_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    system = relationship("System", back_populates="system_configs")


class FeatureFlag(Base):
    __tablename__ = "feature_flags"
    __table_args__ = (
        UniqueConstraint('system_id', 'flag_name', name='uix_feature_flag'),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    system_id = Column(String, ForeignKey("systems.id", ondelete="CASCADE"), nullable=False, index=True)
    flag_name = Column(String, nullable=False)
    is_enabled = Column(Boolean, default=False, nullable=False)
    rollout_percentage = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    system = relationship("System", back_populates="feature_flags")
