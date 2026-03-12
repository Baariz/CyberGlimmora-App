"""
Geo logic for maps: geofencing (point in circle, left safe zone / entered danger zone)
and route deviation (distance from point to polyline).
"""
import math
from typing import Any

from sqlalchemy.orm import Session

from app.config import settings
from app.models.guardian import ChildProfile, SafeZone, ChildAlert
from app.models.journey import Journey, JourneyAlert


# Earth radius in metres (WGS84)
EARTH_RADIUS_M = 6_371_000


def haversine_metres(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Distance between two points in metres (Haversine formula)."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_M * c


def point_in_circle(center_lat: float, center_lng: float, radius_m: float, point_lat: float, point_lng: float) -> bool:
    """True if (point_lat, point_lng) is inside the circle (center + radius in metres)."""
    return haversine_metres(center_lat, center_lng, point_lat, point_lng) <= radius_m


def distance_to_segment_metres(
    seg_start_lat: float, seg_start_lng: float,
    seg_end_lat: float, seg_end_lng: float,
    point_lat: float, point_lng: float,
) -> float:
    """Distance from point to the line segment (seg_start -> seg_end) in metres.
    Uses approximate projection onto segment for short segments (good for route deviation).
    """
    # Vector from seg_start to seg_end
    dx = seg_end_lng - seg_start_lng
    dy = seg_end_lat - seg_start_lat
    # Vector from seg_start to point
    px = point_lng - seg_start_lng
    py = point_lat - seg_start_lat
    # Length squared of segment (in degree units; we'll scale by metres per degree approx)
    seg_len_sq = dx * dx + dy * dy
    if seg_len_sq < 1e-20:
        return haversine_metres(seg_start_lat, seg_start_lng, point_lat, point_lng)
    # Project point onto segment: t in [0,1]
    t = (px * dx + py * dy) / seg_len_sq
    t = max(0.0, min(1.0, t))
    # Closest point on segment
    closest_lat = seg_start_lat + t * dy
    closest_lng = seg_start_lng + t * dx
    return haversine_metres(closest_lat, closest_lng, point_lat, point_lng)


def distance_to_route_metres(
    route: list[dict[str, float]],
    point_lat: float,
    point_lng: float,
) -> float:
    """Minimum distance from (point_lat, point_lng) to the route polyline (list of {lat, lng})."""
    if not route or len(route) < 2:
        if route:
            return haversine_metres(route[0]["lat"], route[0]["lng"], point_lat, point_lng)
        return float("inf")
    min_d = float("inf")
    for i in range(len(route) - 1):
        a, b = route[i], route[i + 1]
        d = distance_to_segment_metres(
            a["lat"], a["lng"],
            b["lat"], b["lng"],
            point_lat, point_lng,
        )
        min_d = min(min_d, d)
    return min_d


def check_geofence_on_location_update(
    db: Session,
    child: ChildProfile,
    new_lat: float,
    new_lng: float,
) -> list[ChildAlert]:
    """
    After updating child location to (new_lat, new_lng):
    - If child is inside a danger zone -> create "Entered danger zone" alert.
    - If child was in a safe zone and is now outside -> create "Left safe zone" alert.
    Updates child.last_safe_zone_id.
    Returns list of newly created alerts.
    """
    user_id = child.user_id
    zones = db.query(SafeZone).filter(SafeZone.user_id == user_id, SafeZone.is_active).all()
    created: list[ChildAlert] = []

    now_inside_safe_id: str | None = None
    for zone in zones:
        inside = point_in_circle(zone.center_lat, zone.center_lng, zone.radius, new_lat, new_lng)
        if zone.type == "danger" and inside:
            alert = ChildAlert(
                child_id=child.id,
                child_name=child.name,
                type="geofence",
                title="Entered danger zone",
                description=f"{child.name} entered the danger zone '{zone.name}'.",
                severity="high",
                is_read=False,
                action="Check your child's location and ensure they are safe.",
            )
            db.add(alert)
            created.append(alert)
        elif zone.type == "safe" and inside:
            now_inside_safe_id = zone.id

    if now_inside_safe_id is None and child.last_safe_zone_id:
        # Left the safe zone they were in
        left_zone = db.query(SafeZone).filter(SafeZone.id == child.last_safe_zone_id).first()
        zone_name = left_zone.name if left_zone else "Safe zone"
        alert = ChildAlert(
            child_id=child.id,
            child_name=child.name,
            type="geofence",
            title="Left safe zone",
            description=f"{child.name} left the safe zone '{zone_name}'.",
            severity="medium",
            is_read=False,
            action="Check current location and confirm your child is safe.",
        )
        db.add(alert)
        created.append(alert)

    child.last_safe_zone_id = now_inside_safe_id
    db.add(child)
    return created


def check_route_deviation(
    db: Session,
    journey: Journey,
    new_lat: float,
    new_lng: float,
) -> JourneyAlert | None:
    """
    If (new_lat, new_lng) is farther than ROUTE_DEVIATION_THRESHOLD_METRES from the journey route,
    create a route_deviation alert and return it; else return None.
    """
    route = journey.route_coordinates or []
    if len(route) < 2:
        return None
    dist = distance_to_route_metres(route, new_lat, new_lng)
    if dist <= settings.ROUTE_DEVIATION_THRESHOLD_METRES:
        return None
    alert = JourneyAlert(
        journey_id=journey.id,
        type="route_deviation",
        message=f"Route deviation detected: {dist:.0f}m from planned route.",
        location_lat=new_lat,
        location_lng=new_lng,
        acknowledged=False,
    )
    db.add(alert)
    return alert
