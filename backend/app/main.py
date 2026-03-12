from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import sms

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CyberGlimmora API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sms.router, prefix="/api/v1/sms", tags=["SMS"])

@app.get("/")
def health():
    return {"status": "ok", "message": "CyberGlimmora API running"}