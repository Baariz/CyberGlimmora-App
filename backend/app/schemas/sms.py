from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class RiskLevel(str, Enum):
    safe   = "safe"
    low    = "low"
    medium = "medium"
    high   = "high"

class ScamType(str, Enum):
    upi        = "upi"
    kyc        = "kyc"
    aadhaar    = "aadhaar"
    bank_sms   = "bank_sms"
    courier    = "courier"
    job        = "job"
    crypto     = "crypto"
    phishing   = "phishing"
    lottery    = "lottery"
    investment = "investment"
    romance    = "romance"
    other      = "other"

# ── Request ──────────────────────────────────────────
class SmsScanRequest(BaseModel):
    message: str
    sender: Optional[str] = None

class SmsBatchScanRequest(BaseModel):
    messages: List[SmsScanRequest]

# ── Response — matches ScamAnalysisResult in frontend types/index.ts exactly ──
class SmsScanResponse(BaseModel):
    riskLevel:       RiskLevel
    confidence:      int
    explanation:     str
    scamType:        ScamType
    recommendations: List[str]
    indicators:      List[str]

class SmsBatchScanResponse(BaseModel):
    total:   int
    flagged: int
    results: List[SmsScanResponse]