"""Pydantic schemas for Journey (map) API — match frontend types."""
from typing import Literal

from pydantic import BaseModel, Field


class LatLng(BaseModel):
    lat: float
    lng: float


class OriginDestination(BaseModel):
    lat: float
    lng: float
    address: str = ""


class JourneyAlertResponse(BaseModel):
    id: str
    type: str  # route_deviation | long_stop | speed_anomaly | sos | arrival
    message: str = ""
    timestamp: str = ""
    location: LatLng | None = None
    acknowledged: bool = False


class JourneyDataResponse(BaseModel):
    id: str
    userId: str = ""
    status: Literal["active", "completed", "sos", "deviated"]
    origin: OriginDestination
    destination: OriginDestination
    currentPosition: LatLng
    routeCoordinates: list[LatLng] = Field(default_factory=list)
    startTime: str = ""
    estimatedArrival: str = ""
    endTime: str | None = None
    trustedContactIds: list[str] = Field(default_factory=list)
    alerts: list[JourneyAlertResponse] = Field(default_factory=list)


class JourneyStart(BaseModel):
    origin: OriginDestination
    destination: OriginDestination
    routeCoordinates: list[LatLng] = Field(default_factory=list, alias="routeCoordinates")
    trustedContactIds: list[str] = Field(default_factory=list)

    model_config = {"populate_by_name": True}


class JourneyPositionUpdate(BaseModel):
    """Update current position and optionally append route coordinates (triggers route deviation check)."""
    currentPosition: LatLng
    routeCoordinates: list[LatLng] | None = None  # if set, append these to journey route


class JourneyAlertCreate(BaseModel):
    type: Literal["route_deviation", "long_stop", "speed_anomaly", "sos", "arrival"]
    message: str = ""
    location: LatLng


class TrustedContactResponse(BaseModel):
    id: str
    name: str
    phone: str = ""
    email: str = ""
    relationship: str = ""
    avatar: str = ""
    isEmergency: bool = False
    notifyOnJourney: bool = True


class TrustedContactCreate(BaseModel):
    name: str
    phone: str = ""
    email: str = ""
    relationship: str = ""
    isEmergency: bool = False
    notifyOnJourney: bool = True


class JourneyHistoryItem(BaseModel):
    id: str
    origin: str = ""
    destination: str = ""
    date: str = ""
    duration: str = ""
    status: str = ""
    distance: str = ""
