"""Journey (Ride Safety) map APIs: active journey, route, position updates, route deviation, alerts."""
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.deps import DbSession, FamilyUser
from app.models.journey import Journey, JourneyAlert, TrustedContact
from app.schemas.journey import (
    JourneyDataResponse,
    JourneyStart,
    JourneyPositionUpdate,
    JourneyAlertCreate,
    JourneyAlertResponse,
    TrustedContactResponse,
    TrustedContactCreate,
    JourneyHistoryItem,
    OriginDestination,
    LatLng,
)
from app.services.geo import check_route_deviation

router = APIRouter()


def _journey_to_response(j: Journey) -> JourneyDataResponse:
    alerts = [
        JourneyAlertResponse(
            id=a.id,
            type=a.type,
            message=a.message or "",
            timestamp=a.created_at.isoformat() if a.created_at else "",
            location=LatLng(lat=a.location_lat, lng=a.location_lng) if a.location_lat is not None and a.location_lng is not None else None,
            acknowledged=a.acknowledged,
        )
        for a in (j.journey_alerts or [])
    ]
    return JourneyDataResponse(
        id=j.id,
        userId=j.user_id,
        status=j.status,
        origin=OriginDestination(
            lat=j.origin_lat,
            lng=j.origin_lng,
            address=j.origin_address or "",
        ),
        destination=OriginDestination(
            lat=j.destination_lat,
            lng=j.destination_lng,
            address=j.destination_address or "",
        ),
        currentPosition=LatLng(
            lat=j.current_lat if j.current_lat is not None else j.origin_lat,
            lng=j.current_lng if j.current_lng is not None else j.origin_lng,
        ),
        routeCoordinates=[LatLng(lat=p["lat"], lng=p["lng"]) for p in (j.route_coordinates or [])],
        startTime=j.start_time.isoformat() if j.start_time else "",
        estimatedArrival=j.estimated_arrival.isoformat() if j.estimated_arrival else "",
        endTime=j.end_time.isoformat() if j.end_time else None,
        trustedContactIds=j.trusted_contact_ids or [],
        alerts=alerts,
    )


def _contact_to_response(c: TrustedContact) -> TrustedContactResponse:
    return TrustedContactResponse(
        id=c.id,
        name=c.name,
        phone=c.phone or "",
        email=c.email or "",
        relationship=c.relationship or "",
        avatar=c.avatar or "",
        isEmergency=c.is_emergency,
        notifyOnJourney=c.notify_on_journey,
    )


@router.get("/active", response_model=JourneyDataResponse | None)
def get_active_journey(db: DbSession, user: FamilyUser):
    """Get active journey for map: route polyline, origin/destination/current markers, alerts with locations."""
    j = db.query(Journey).filter(Journey.user_id == user.id, Journey.status == "active").first()
    if not j:
        return None
    return _journey_to_response(j)


@router.post("/start", response_model=JourneyDataResponse)
def start_journey(body: JourneyStart, db: DbSession, user: FamilyUser):
    """Start a new journey (full route coordinate logging)."""
    existing = db.query(Journey).filter(Journey.user_id == user.id, Journey.status == "active").first()
    if existing:
        raise HTTPException(status_code=400, detail="An active journey already exists. End it first.")
    route = [{"lat": p.lat, "lng": p.lng} for p in body.routeCoordinates] if body.routeCoordinates else []
    if not route and body.origin and body.destination:
        route = [
            {"lat": body.origin.lat, "lng": body.origin.lng},
            {"lat": body.destination.lat, "lng": body.destination.lng},
        ]
    j = Journey(
        user_id=user.id,
        status="active",
        origin_lat=body.origin.lat,
        origin_lng=body.origin.lng,
        origin_address=body.origin.address or "",
        destination_lat=body.destination.lat,
        destination_lng=body.destination.lng,
        destination_address=body.destination.address or "",
        current_lat=body.origin.lat,
        current_lng=body.origin.lng,
        route_coordinates=route,
        trusted_contact_ids=body.trustedContactIds or [],
    )
    db.add(j)
    db.commit()
    db.refresh(j)
    return _journey_to_response(j)


@router.patch("/active", response_model=JourneyDataResponse)
def update_journey_position(body: JourneyPositionUpdate, db: DbSession, user: FamilyUser):
    """
    Update current position (and optionally append route coordinates).
    Triggers route deviation check: if position is beyond threshold from route, creates a route_deviation alert.
    """
    j = db.query(Journey).filter(Journey.user_id == user.id, Journey.status == "active").first()
    if not j:
        raise HTTPException(status_code=404, detail="No active journey")
    j.current_lat = body.currentPosition.lat
    j.current_lng = body.currentPosition.lng
    if body.routeCoordinates:
        existing = j.route_coordinates or []
        j.route_coordinates = existing + [{"lat": p.lat, "lng": p.lng} for p in body.routeCoordinates]
    db.add(j)
    check_route_deviation(db, j, body.currentPosition.lat, body.currentPosition.lng)
    db.commit()
    db.refresh(j)
    return _journey_to_response(j)


@router.post("/active/alerts", response_model=JourneyAlertResponse)
def create_journey_alert(body: JourneyAlertCreate, db: DbSession, user: FamilyUser):
    """Record an alert (e.g. SOS, speed_anomaly) with location for map alert markers."""
    j = db.query(Journey).filter(Journey.user_id == user.id, Journey.status == "active").first()
    if not j:
        raise HTTPException(status_code=404, detail="No active journey")
    a = JourneyAlert(
        journey_id=j.id,
        type=body.type,
        message=body.message or "",
        location_lat=body.location.lat,
        location_lng=body.location.lng,
        acknowledged=False,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return JourneyAlertResponse(
        id=a.id,
        type=a.type,
        message=a.message or "",
        timestamp=a.created_at.isoformat() if a.created_at else "",
        location=LatLng(lat=a.location_lat, lng=a.location_lng),
        acknowledged=a.acknowledged,
    )


@router.post("/active/end", response_model=JourneyDataResponse)
def end_journey(db: DbSession, user: FamilyUser):
    """End the active journey."""
    j = db.query(Journey).filter(Journey.user_id == user.id, Journey.status == "active").first()
    if not j:
        raise HTTPException(status_code=404, detail="No active journey")
    j.status = "completed"
    j.end_time = datetime.now(timezone.utc)
    db.add(j)
    db.commit()
    db.refresh(j)
    return _journey_to_response(j)


@router.get("/history", response_model=list[JourneyHistoryItem])
def get_journey_history(db: DbSession, user: FamilyUser):
    """List past journeys (for route replay / history)."""
    journeys = (
        db.query(Journey)
        .filter(Journey.user_id == user.id, Journey.status != "active")
        .order_by(Journey.end_time.desc().nullslast(), Journey.created_at.desc())
        .limit(50)
        .all()
    )
    result = []
    for j in journeys:
        duration = ""
        if j.start_time and j.end_time:
            delta = j.end_time - j.start_time
            duration = f"{int(delta.total_seconds() // 60)} min"
        result.append(
            JourneyHistoryItem(
                id=j.id,
                origin=j.origin_address or "",
                destination=j.destination_address or "",
                date=j.start_time.isoformat() if j.start_time else "",
                duration=duration,
                status=j.status,
                distance="",
            )
        )
    return result


@router.get("/trusted-contacts", response_model=list[TrustedContactResponse])
def list_trusted_contacts(db: DbSession, user: FamilyUser):
    """List trusted contacts (for journey notifications)."""
    contacts = db.query(TrustedContact).filter(TrustedContact.user_id == user.id).all()
    return [_contact_to_response(c) for c in contacts]


@router.post("/trusted-contacts", response_model=TrustedContactResponse)
def add_trusted_contact(body: TrustedContactCreate, db: DbSession, user: FamilyUser):
    """Add a trusted contact (max 4 for deviation alerts per doc)."""
    count = db.query(TrustedContact).filter(TrustedContact.user_id == user.id).count()
    if count >= 4:
        raise HTTPException(status_code=400, detail="Maximum 4 trusted contacts allowed.")
    c = TrustedContact(
        user_id=user.id,
        name=body.name,
        phone=body.phone or "",
        email=body.email or "",
        relationship=body.relationship or "",
        is_emergency=body.isEmergency,
        notify_on_journey=body.notifyOnJourney,
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    return _contact_to_response(c)


@router.delete("/trusted-contacts/{contact_id}", status_code=204)
def remove_trusted_contact(contact_id: str, db: DbSession, user: FamilyUser):
    """Remove a trusted contact."""
    c = db.query(TrustedContact).filter(TrustedContact.id == contact_id, TrustedContact.user_id == user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contact not found")
    db.delete(c)
    db.commit()
    return None
