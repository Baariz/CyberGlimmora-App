"""Pydantic schemas for Guardian (map) API — match frontend types."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class LatLng(BaseModel):
    lat: float
    lng: float


class ChildLocation(BaseModel):
    lat: float
    lng: float
    address: str = ""
    timestamp: str = ""  # ISO datetime


class ChildProfileResponse(BaseModel):
    id: str
    name: str
    age: int
    avatar: str = ""
    deviceName: str = ""
    batteryLevel: int = 0
    isOnline: bool = False
    lastSeen: str = ""  # ISO
    location: ChildLocation
    screenTimeToday: int = 0
    alertCount: int = 0

    model_config = {"from_attributes": False}


class ChildProfileLocationUpdate(BaseModel):
    """Body for POST /guardian/children/{id}/location — triggers geofence check."""
    lat: float
    lng: float
    address: str = ""


class SafeZoneResponse(BaseModel):
    id: str
    name: str
    type: Literal["safe", "danger"]
    center: LatLng
    radius: float  # metres
    address: str = ""
    isActive: bool = True
    childIds: list[str] = Field(default_factory=list)


class SafeZoneCreate(BaseModel):
    name: str
    type: Literal["safe", "danger"]
    center: LatLng
    radius: float = Field(gt=0, le=5000)
    address: str = ""
    childIds: list[str] = Field(default_factory=list)


class SafeZoneUpdate(BaseModel):
    name: str | None = None
    type: Literal["safe", "danger"] | None = None
    center: LatLng | None = None
    radius: float | None = None
    address: str | None = None
    isActive: bool | None = None
    childIds: list[str] | None = None


class ChildAlertResponse(BaseModel):
    id: str
    childId: str
    childName: str
    type: str
    title: str
    description: str = ""
    severity: Literal["high", "medium", "low"] = "medium"
    timestamp: str = ""
    isRead: bool = False
    action: str = ""

    model_config = {"from_attributes": False}
