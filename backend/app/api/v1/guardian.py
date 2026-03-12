"""Guardian (Child Guardian) map APIs: children with locations, safe zones, geofence updates."""
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.deps import DbSession, FamilyUser
from app.models.guardian import ChildProfile, SafeZone, ChildAlert
from app.schemas.guardian import (
    ChildProfileResponse,
    ChildProfileLocationUpdate,
    ChildLocation,
    SafeZoneResponse,
    SafeZoneCreate,
    SafeZoneUpdate,
    ChildAlertResponse,
    LatLng,
)
from app.services.geo import check_geofence_on_location_update

router = APIRouter()


def _child_to_response(c: ChildProfile, alert_count: int) -> ChildProfileResponse:
    loc = ChildLocation(
        lat=c.location_lat or 0.0,
        lng=c.location_lng or 0.0,
        address=c.location_address or "",
        timestamp=c.location_timestamp.isoformat() if c.location_timestamp else "",
    )
    return ChildProfileResponse(
        id=c.id,
        name=c.name,
        age=c.age,
        avatar=c.avatar or "",
        deviceName=c.device_name or "",
        batteryLevel=c.battery_level or 0,
        isOnline=c.is_online,
        lastSeen=c.last_seen.isoformat() if c.last_seen else "",
        location=loc,
        screenTimeToday=c.screen_time_today or 0,
        alertCount=alert_count,
    )


def _zone_to_response(z: SafeZone) -> SafeZoneResponse:
    return SafeZoneResponse(
        id=z.id,
        name=z.name,
        type=z.type,
        center=LatLng(lat=z.center_lat, lng=z.center_lng),
        radius=z.radius,
        address=z.address or "",
        isActive=z.is_active,
        childIds=z.child_ids or [],
    )


def _alert_to_response(a: ChildAlert) -> ChildAlertResponse:
    return ChildAlertResponse(
        id=a.id,
        childId=a.child_id,
        childName=a.child_name,
        type=a.type,
        title=a.title,
        description=a.description or "",
        severity=a.severity,
        timestamp=a.created_at.isoformat() if a.created_at else "",
        isRead=a.is_read,
        action=a.action or "",
    )


@router.get("/children", response_model=list[ChildProfileResponse])
def list_children(db: DbSession, user: FamilyUser):
    """List child profiles with current location (for map markers)."""
    children = db.query(ChildProfile).filter(ChildProfile.user_id == user.id).all()
    result = []
    for c in children:
        count = db.query(ChildAlert).filter(ChildAlert.child_id == c.id, ChildAlert.is_read == False).count()
        result.append(_child_to_response(c, count))
    return result


@router.post("/children/{child_id}/location")
def update_child_location(
    child_id: str,
    body: ChildProfileLocationUpdate,
    db: DbSession,
    user: FamilyUser,
):
    """
    Update a child's location. Triggers geofence logic:
    - If child enters a danger zone -> create alert.
    - If child leaves a safe zone -> create alert.
    """
    child = db.query(ChildProfile).filter(
        ChildProfile.id == child_id,
        ChildProfile.user_id == user.id,
    ).first()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    child.location_lat = body.lat
    child.location_lng = body.lng
    child.location_address = body.address or ""
    child.location_timestamp = datetime.now(timezone.utc)
    db.add(child)
    created = check_geofence_on_location_update(db, child, body.lat, body.lng)
    db.commit()
    return {
        "updated": True,
        "alertsCreated": len(created),
        "alerts": [_alert_to_response(a) for a in created],
    }


@router.get("/safe-zones", response_model=list[SafeZoneResponse])
def list_safe_zones(db: DbSession, user: FamilyUser):
    """List safe/danger zones (for map circles: center + radius, colour by type)."""
    zones = db.query(SafeZone).filter(SafeZone.user_id == user.id).all()
    return [_zone_to_response(z) for z in zones]


@router.post("/safe-zones", response_model=SafeZoneResponse)
def create_safe_zone(body: SafeZoneCreate, db: DbSession, user: FamilyUser):
    """Create a safe or danger zone (configurable radius)."""
    zone = SafeZone(
        user_id=user.id,
        name=body.name,
        type=body.type,
        center_lat=body.center.lat,
        center_lng=body.center.lng,
        radius=body.radius,
        address=body.address or "",
        is_active=True,
        child_ids=body.childIds,
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return _zone_to_response(zone)


@router.patch("/safe-zones/{zone_id}", response_model=SafeZoneResponse)
def update_safe_zone(zone_id: str, body: SafeZoneUpdate, db: DbSession, user: FamilyUser):
    """Update zone (name, type, center, radius, etc.)."""
    zone = db.query(SafeZone).filter(SafeZone.id == zone_id, SafeZone.user_id == user.id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Safe zone not found")
    if body.name is not None:
        zone.name = body.name
    if body.type is not None:
        zone.type = body.type
    if body.center is not None:
        zone.center_lat = body.center.lat
        zone.center_lng = body.center.lng
    if body.radius is not None:
        zone.radius = body.radius
    if body.address is not None:
        zone.address = body.address
    if body.isActive is not None:
        zone.is_active = body.isActive
    if body.childIds is not None:
        zone.child_ids = body.childIds
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return _zone_to_response(zone)


@router.delete("/safe-zones/{zone_id}", status_code=204)
def delete_safe_zone(zone_id: str, db: DbSession, user: FamilyUser):
    """Delete a safe zone."""
    zone = db.query(SafeZone).filter(SafeZone.id == zone_id, SafeZone.user_id == user.id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Safe zone not found")
    db.delete(zone)
    db.commit()
    return None


@router.get("/alerts", response_model=list[ChildAlertResponse])
def list_child_alerts(db: DbSession, user: FamilyUser):
    """List child alerts (e.g. geofence 'left safe zone', 'entered danger zone')."""
    children_ids = [c.id for c in db.query(ChildProfile).filter(ChildProfile.user_id == user.id).all()]
    alerts = db.query(ChildAlert).filter(ChildAlert.child_id.in_(children_ids)).order_by(ChildAlert.created_at.desc()).all()
    return [_alert_to_response(a) for a in alerts]
