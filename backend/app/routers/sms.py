from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.sms import (
    SmsScanRequest, SmsScanResponse,
    SmsBatchScanRequest, SmsBatchScanResponse
)
from app.services import sms_service

router = APIRouter()

@router.post("/scan", response_model=SmsScanResponse)
def scan_single(body: SmsScanRequest, db: Session = Depends(get_db)):
    return sms_service.scan_single(body, db)

@router.post("/scan/batch", response_model=SmsBatchScanResponse)
def scan_batch(body: SmsBatchScanRequest, db: Session = Depends(get_db)):
    return sms_service.scan_batch(body.messages, db)