from google import genai
import json
from app.config import settings
from app.schemas.sms import SmsScanResponse, RiskLevel, ScamType

client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Source-specific context injected into prompt
# So Gemini knows email scams differ from SMS scams
SOURCE_CONTEXT = {
    "sms": "an SMS text message received on a mobile phone in India",
    "email": "an email received in a Gmail inbox",
    "whatsapp": "a WhatsApp message received on a mobile phone",
    "telegram": "a Telegram message",
    "manual": "a message pasted manually by the user for analysis",
}

PROMPT = """
You are an expert in detecting scams and fraud targeting people in India.

You are analyzing {source_context}.

Message: "{message}"
Sender: "{sender}"

Return ONLY a valid JSON object — no markdown, no explanation, no extra text outside the JSON.

{{
  "riskLevel": "safe" | "low" | "medium" | "high",
  "confidence": <number 0-100>,
  "scamType": "upi" | "kyc" | "aadhaar" | "bank_sms" | "courier" | "job" | "crypto" | "phishing" | "lottery" | "investment" | "romance" | "other",
  "explanation": "<one clear sentence explaining why this is or is not a scam>",
  "indicators": ["<red flag 1>", "<red flag 2>"],
  "recommendations": ["<what the user should do 1>", "<what the user should do 2>"]
}}

Rules you must follow:
- indicators must be [] if riskLevel is "safe"
- For SMS: focus on OTP fraud, KYC expiry, UPI collect scams, fake bank alerts
- For email: focus on phishing links, fake invoice, account suspension threats, prize notifications
- For WhatsApp/Telegram: focus on job scams, crypto investment, forwards with malicious links
- Legitimate OTPs from known senders (banks, Amazon, Swiggy, IRCTC etc.) are always "safe"
- Be specific in explanation — mention the exact scam pattern you detected
- confidence should reflect how certain you are (90+ means very obvious scam)
"""


def analyze_message(
    message: str,
    sender: str = None,
    source: str = "sms"
) -> SmsScanResponse:
    """
    Central AI analysis function.
    Called by all services — sms_service, gmail_service, whatsapp_service etc.

    Args:
        message : the text content to analyze
        sender  : phone number, email address, or username of sender
        source  : where the message came from — "sms" | "email" | "whatsapp" | "telegram" | "manual"

    Returns:
        SmsScanResponse with riskLevel, confidence, scamType, explanation,
        indicators, and recommendations
    """
    try:
        prompt = PROMPT.format(
            source_context=SOURCE_CONTEXT.get(source, SOURCE_CONTEXT["sms"]),
            message=message,
            sender=sender or "Unknown"
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )
        raw = response.text.strip()

        # Strip markdown if Gemini wraps response in ```json ... ```
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        data = json.loads(raw)

        return SmsScanResponse(
            riskLevel=data["riskLevel"],
            confidence=int(data["confidence"]),
            scamType=data.get("scamType", "other"),
            explanation=data["explanation"],
            indicators=data.get("indicators", []),
            recommendations=data.get("recommendations", [])
        )

    except Exception as e:
        # Fallback — never crash the app if Gemini fails
        print(f"GEMINI ERROR: {e}")
        return SmsScanResponse(
            riskLevel=RiskLevel.low,
            confidence=50,
            scamType=ScamType.other,
            explanation="Could not analyze this message. Please review manually.",
            indicators=[],
            recommendations=["Review this message carefully before taking any action"]
        )