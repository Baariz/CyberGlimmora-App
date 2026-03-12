import uuid
from sqlalchemy.orm import Session
from app.models.sms_scan import SmsScan
from app.schemas.sms import SmsScanRequest, SmsScanResponse, SmsBatchScanResponse, RiskLevel
from app.services.ai_service import analyze_message


def scan_single(body: SmsScanRequest, db: Session) -> SmsScanResponse:
    result = analyze_message(
        message=body.message,
        sender=body.sender,
        source="sms"
    )

    db.add(SmsScan(
        id=str(uuid.uuid4()),
        message=body.message,
        sender=body.sender,
        risk_level=result.riskLevel.value,
        confidence=result.confidence,
        scam_type=result.scamType.value,
        explanation=result.explanation,
        recommendations=result.recommendations,
        indicators=result.indicators,
    ))
    db.commit()

    return result


def scan_batch(messages: list[SmsScanRequest], db: Session) -> SmsBatchScanResponse:
    results = [scan_single(msg, db) for msg in messages]
    flagged = [r for r in results if r.riskLevel != RiskLevel.safe]

    return SmsBatchScanResponse(
        total=len(results),
        flagged=len(flagged),
        results=results
    )