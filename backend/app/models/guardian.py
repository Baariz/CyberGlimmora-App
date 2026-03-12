import uuid
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.sqlite import JSON

from app.database import Base


def gen_id():
    return str(uuid.uuid4())


class ChildProfile(Base):
    __tablename__ = "child_profiles"

    id = Column(String(36), primary_key=True, default=gen_id)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    avatar = Column(String(500), default="")
    device_name = Column(String(100), default="")
    battery_level = Column(Integer, default=0)
    is_online = Column(Boolean, default=False)
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    # Location (for map markers and geofencing)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    location_address = Column(String(255), default="")
    location_timestamp = Column(DateTime(timezone=True), nullable=True)
    screen_time_today = Column(Integer, default=0)  # minutes
    # Geofence state: which safe zone the child was last inside (for "left safe zone" alert)
    last_safe_zone_id = Column(String(36), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SafeZone(Base):
    __tablename__ = "safe_zones"

    id = Column(String(36), primary_key=True, default=gen_id)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # safe | danger
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    radius = Column(Float, nullable=False)  # metres
    address = Column(String(255), default="")
    is_active = Column(Boolean, default=True)
    child_ids = Column(JSON, default=list)  # list of child profile ids
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ChildAlert(Base):
    __tablename__ = "child_alerts"

    id = Column(String(36), primary_key=True, default=gen_id)
    child_id = Column(String(36), ForeignKey("child_profiles.id"), nullable=False, index=True)
    child_name = Column(String(100), nullable=False)
    type = Column(String(30), nullable=False)  # geofence | location | cyberbullying | ...
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    severity = Column(String(20), nullable=False, default="medium")  # high | medium | low
    is_read = Column(Boolean, default=False)
    action = Column(String(255), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
