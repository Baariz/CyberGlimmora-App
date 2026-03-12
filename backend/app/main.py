from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.models import (
    User,
    ChildProfile,
    SafeZone,
    ChildAlert,
    TrustedContact,
    Journey,
    JourneyAlert,
)
from app.api.v1 import router as v1_router

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CyberGlimmora API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(v1_router)


@app.get("/")
def health():
    return {"status": "ok", "message": "CyberGlimmora API running"}


@app.on_event("startup")
def seed_dev_data():
    """Seed a family user and sample guardian/journey data for development."""
    from app.database import SessionLocal
    from datetime import datetime, timezone

    db = SessionLocal()
    try:
        if db.query(User).filter(User.role == "family").first():
            return
        user = User(id="usr_family_001", email="family@demo.com", role="family")
        db.add(user)
        db.commit()

        # Two children with locations (for map)
        for cid, name, age, lat, lng, addr in [
            ("child_001", "Aarav", 12, 19.076, 72.8777, "DPS School, Andheri East"),
            ("child_002", "Meera", 9, 19.082, 72.871, "Home - Powai"),
        ]:
            if db.query(ChildProfile).filter(ChildProfile.id == cid).first():
                continue
            db.add(
                ChildProfile(
                    id=cid,
                    user_id=user.id,
                    name=name,
                    age=age,
                    device_name=f"{name}'s Device",
                    battery_level=78 if name == "Aarav" else 45,
                    is_online=(name == "Aarav"),
                    location_lat=lat,
                    location_lng=lng,
                    location_address=addr,
                    location_timestamp=datetime.now(timezone.utc),
                    screen_time_today=145 if name == "Aarav" else 90,
                )
            )
        # Safe zones (for map circles)
        for zid, zname, ztype, lat, lng, radius, addr in [
            ("zone_1", "Home", "safe", 19.082, 72.871, 200, "Lake Homes, Powai, Mumbai"),
            ("zone_2", "School", "safe", 19.076, 72.8777, 300, "DPS School, Andheri East"),
            ("zone_3", "Railway Station", "danger", 19.066, 72.868, 500, "Andheri Railway Station"),
        ]:
            if db.query(SafeZone).filter(SafeZone.id == zid).first():
                continue
            db.add(
                SafeZone(
                    id=zid,
                    user_id=user.id,
                    name=zname,
                    type=ztype,
                    center_lat=lat,
                    center_lng=lng,
                    radius=radius,
                    address=addr,
                    is_active=True,
                    child_ids=["child_001", "child_002"],
                )
            )
        # Trusted contacts
        for tc_id, tname, phone, rel in [
            ("tc_1", "Priya Mehta", "+91 98765 43211", "Spouse"),
            ("tc_2", "Raj Mehta", "+91 98765 43212", "Brother"),
        ]:
            if db.query(TrustedContact).filter(TrustedContact.id == tc_id).first():
                continue
            db.add(
                TrustedContact(
                    id=tc_id,
                    user_id=user.id,
                    name=tname,
                    phone=phone,
                    relationship=rel,
                    is_emergency=True,
                    notify_on_journey=True,
                )
            )
        db.commit()
    finally:
        db.close()