from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from sqlalchemy.sql import func
import uuid
from app.database import Base

class SmsScan(Base):
    __tablename__ = "sms_scans"

    id              = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    message         = Column(Text, nullable=False)
    sender          = Column(String, nullable=True)
    risk_level      = Column(String, nullable=False)
    confidence      = Column(Integer, nullable=False)
    scam_type       = Column(String, nullable=True)
    explanation     = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)
    indicators      = Column(JSON, nullable=True)
    scanned_at      = Column(DateTime(timezone=True), server_default=func.now())