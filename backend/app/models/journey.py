import uuid
from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.sqlite import JSON

from app.database import Base


def gen_id():
    return str(uuid.uuid4())


class TrustedContact(Base):
    __tablename__ = "trusted_contacts"

    id = Column(String(36), primary_key=True, default=gen_id)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(50), default="")
    email = Column(String(255), default="")
    relationship = Column(String(50), default="")
    avatar = Column(String(500), default="")
    is_emergency = Column(Boolean, default=False)
    notify_on_journey = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Journey(Base):
    __tablename__ = "journeys"

    id = Column(String(36), primary_key=True, default=gen_id)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String(20), nullable=False, default="active")  # active | completed | sos | deviated
    # Origin
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    origin_address = Column(String(255), default="")
    # Destination
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    destination_address = Column(String(255), default="")
    # Current position (live)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    # Full route coordinate logging
    route_coordinates = Column(JSON, default=list)  # [{"lat": float, "lng": float}, ...]
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    estimated_arrival = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    trusted_contact_ids = Column(JSON, default=list)  # list of trusted_contact ids
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    journey_alerts = relationship("JourneyAlert", back_populates="journey", lazy="selectin")


class JourneyAlert(Base):
    __tablename__ = "journey_alerts"

    id = Column(String(36), primary_key=True, default=gen_id)
    journey_id = Column(String(36), ForeignKey("journeys.id"), nullable=False, index=True)
    type = Column(String(30), nullable=False)  # route_deviation | long_stop | speed_anomaly | sos | arrival
    message = Column(Text, default="")
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    journey = relationship("Journey", back_populates="journey_alerts")
