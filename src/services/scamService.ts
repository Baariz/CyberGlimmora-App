import type { ScamAlert, ScamAnalysisResult, CommunityScam, IndiaScam, ScamQuizQuestion } from '../types';

export async function analyzeMessage(message: string): Promise<ScamAnalysisResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const lower = message.toLowerCase();
  const isScammy = lower.includes('otp') || lower.includes('kyc') || lower.includes('prize') || lower.includes('urgent') || lower.includes('bank') || lower.includes('upi');
  return {
    riskLevel: isScammy ? 'high' : 'safe',
    confidence: isScammy ? 92 : 15,
    explanation: isScammy
      ? 'This message contains multiple scam indicators including urgency language and requests for sensitive information.'
      : 'This message appears to be legitimate with no significant scam indicators detected.',
    scamType: isScammy ? 'phishing' : 'other',
    recommendations: isScammy
      ? ['Do not click any links in this message', 'Do not share OTP or personal details', 'Report this number to your bank', 'Block the sender immediately']
      : ['Message appears safe', 'Always verify sender identity for financial requests'],
    indicators: isScammy
      ? ['Urgency language detected', 'Requests sensitive information', 'Suspicious sender pattern', 'Contains phishing link patterns']
      : [],
  };
}

export async function getScamAlerts(): Promise<ScamAlert[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'sa_1', title: 'SBI OTP Fraud Detected', description: 'Message requesting OTP claiming to be from SBI. Known phishing pattern.', severity: 'high', type: 'bank_sms', time: new Date(Date.now() - 1800000).toISOString(), source: 'SMS Scanner', action: 'Block sender and report to SBI', isRead: false },
    { id: 'sa_2', title: 'Suspicious UPI Collect Request', description: 'Collect request from unknown merchant "REWARD_CASHBACK" detected.', severity: 'high', type: 'upi', time: new Date(Date.now() - 3600000).toISOString(), source: 'UPI Monitor', action: 'Decline the collect request', isRead: false },
    { id: 'sa_3', title: 'KYC Phishing Link', description: 'Fake Paytm KYC update link intercepted in email.', severity: 'medium', type: 'kyc', time: new Date(Date.now() - 7200000).toISOString(), source: 'Email Scanner', action: 'Delete email; update KYC via official app', isRead: false },
    { id: 'sa_4', title: 'Courier Delivery Scam', description: 'Fake India Post tracking SMS with malicious link blocked.', severity: 'medium', type: 'courier', time: new Date(Date.now() - 14400000).toISOString(), source: 'SMS Scanner', action: 'Track parcels only on official website', isRead: true },
    { id: 'sa_5', title: 'Crypto Investment Scam', description: 'WhatsApp message promising 10x returns on crypto flagged.', severity: 'low', type: 'crypto', time: new Date(Date.now() - 28800000).toISOString(), source: 'WhatsApp Scanner', action: 'Block the contact and report', isRead: true },
    { id: 'sa_6', title: 'Job Offer Scam', description: 'Telegram message offering work-from-home job with upfront payment.', severity: 'high', type: 'job', time: new Date(Date.now() - 43200000).toISOString(), source: 'Telegram Scanner', action: 'Report and block sender', isRead: true },
  ];
}

export async function getIndiaScams(): Promise<IndiaScam[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: 'is_1', title: 'UPI Collect Request Scam', description: 'Scammers send fake UPI collect requests claiming refunds or cashback.',
      type: 'upi', example: '"You have received Rs 5,000 cashback. Accept collect request to claim."',
      howToIdentify: ['Unexpected collect requests', 'You receive money, not pay to receive', 'Unknown merchant names like CASHBACK_REWARD'],
      whatToDo: ['Never accept unknown collect requests', 'Report to your bank', 'Block the sender on UPI app'],
      severity: 'high', reportCount: 45000,
    },
    {
      id: 'is_2', title: 'Fake KYC Update', description: 'Fraudsters send SMS/email claiming your KYC is expiring and link to fake website.',
      type: 'kyc', example: '"Dear Customer, your Paytm KYC has expired. Update now at paytm-kyc-update.com to avoid account suspension."',
      howToIdentify: ['Urgency about account suspension', 'Link to unofficial domains', 'Asks for Aadhaar/PAN details'],
      whatToDo: ['Update KYC only through official apps', 'Never click links in SMS', 'Call official customer care to verify'],
      severity: 'high', reportCount: 38000,
    },
    {
      id: 'is_3', title: 'Aadhaar Fraud', description: 'Scammers impersonate UIDAI officials requesting Aadhaar details for "verification".',
      type: 'aadhaar', example: '"UIDAI: Your Aadhaar is being used for fraud. Share OTP to verify identity: 4521"',
      howToIdentify: ['UIDAI never calls for verification', 'OTP requests via call/SMS', 'Threatening language'],
      whatToDo: ['Never share Aadhaar OTP', 'Lock your Aadhaar biometrics online', 'Report to UIDAI helpline 1947'],
      severity: 'high', reportCount: 28000,
    },
    {
      id: 'is_4', title: 'Courier/Customs Scam', description: 'Fake courier alerts claiming package held at customs, requesting payment.',
      type: 'courier', example: '"Your parcel from FedEx is held at customs. Pay Rs 2,500 clearance fee: fedex-customs-pay.in"',
      howToIdentify: ['Unexpected parcel notifications', 'Payment requests via links', 'Unofficial tracking websites'],
      whatToDo: ['Verify on official courier website', 'Never pay via unknown links', 'Contact courier customer support directly'],
      severity: 'medium', reportCount: 22000,
    },
  ];
}

export async function getScamQuiz(): Promise<ScamQuizQuestion[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'q1', message: 'Dear Customer, your SBI account will be blocked in 24 hours. Click here to update KYC: sbi-update.com/kyc', sender: '+91-SBIBNK', isScam: true, explanation: 'SBI never sends KYC links via SMS. Official domain is onlinesbi.sbi, not sbi-update.com.', scamType: 'bank_sms', difficulty: 'easy' },
    { id: 'q2', message: 'Your Amazon order #402-7891234 has been shipped. Track at amazon.in/track', sender: 'Amazon', isScam: false, explanation: 'This is a legitimate Amazon notification with the correct official domain.', difficulty: 'easy' },
    { id: 'q3', message: 'Congratulations! You won Rs 50 Lakhs in Jio Lucky Draw. Send Rs 5,000 processing fee to claim.', sender: '+91 73XXX XXXXX', isScam: true, explanation: 'Lottery scams always ask for upfront fees. Legitimate lotteries never ask winners to pay first.', scamType: 'lottery', difficulty: 'easy' },
    { id: 'q4', message: 'Hi, I am from Zerodha support. We noticed unusual activity. Please share your login OTP for verification.', sender: '+91 88XXX XXXXX', isScam: true, explanation: 'No legitimate company will ever ask for your OTP over phone or message.', scamType: 'phishing', difficulty: 'medium' },
    { id: 'q5', message: 'Your electricity bill of Rs 3,450 is due. Pay at https://pay.mahadiscom.in before 15th to avoid disconnection.', sender: 'MSEDCL', isScam: false, explanation: 'This appears to be a legitimate MSEDCL bill reminder with the correct official domain.', difficulty: 'medium' },
    { id: 'q6', message: 'Earn Rs 5,000-10,000 daily working from home! No investment needed. WhatsApp us at +91 9XXXXXXXXX', sender: '+91 62XXX XXXXX', isScam: true, explanation: 'Unrealistic income promises are classic job scam indicators.', scamType: 'job', difficulty: 'easy' },
    { id: 'q7', message: 'IRCTC: Your PNR 4521678901 train is rescheduled. Check updated timing at enquiry.indianrail.gov.in', sender: 'IRCTC', isScam: false, explanation: 'Legitimate IRCTC notification with the official Indian Railways domain.', difficulty: 'hard' },
    { id: 'q8', message: 'Invest in Bitcoin and earn guaranteed 500% returns in 30 days. Join our exclusive Telegram group now!', sender: 'CryptoKing', isScam: true, explanation: 'No legitimate investment offers guaranteed high returns. This is a classic crypto scam.', scamType: 'crypto', difficulty: 'easy' },
  ];
}

export async function getCommunityScams(): Promise<CommunityScam[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'cs_1', title: 'Fake Swiggy Refund', description: 'Scammers calling as Swiggy support offering refund, asking for UPI PIN.', type: 'upi', region: 'Mumbai', reportedBy: 'Rahul K.', reportedAt: new Date(Date.now() - 86400000).toISOString(), verifiedCount: 47, severity: 'high' },
    { id: 'cs_2', title: 'TRAI Warning Scam Call', description: 'Automated call claiming your number will be disconnected by TRAI. Press 1 to speak to officer.', type: 'phishing', region: 'Delhi', reportedBy: 'Sneha P.', reportedAt: new Date(Date.now() - 172800000).toISOString(), verifiedCount: 89, severity: 'high' },
    { id: 'cs_3', title: 'Fake Flipkart Lucky Draw', description: 'SMS about winning Flipkart lucky draw with link to claim prize.', type: 'lottery', region: 'Bangalore', reportedBy: 'Amit S.', reportedAt: new Date(Date.now() - 259200000).toISOString(), verifiedCount: 34, severity: 'medium' },
    { id: 'cs_4', title: 'Electricity Bill Scam', description: 'SMS threatening power disconnection with fake payment link.', type: 'phishing', region: 'Chennai', reportedBy: 'Priya M.', reportedAt: new Date(Date.now() - 345600000).toISOString(), verifiedCount: 56, severity: 'medium' },
    { id: 'cs_5', title: 'Instagram Influencer Scam', description: 'Fake brand deals asking influencers to pay registration fees upfront.', type: 'job', region: 'Pune', reportedBy: 'Kavya R.', reportedAt: new Date(Date.now() - 432000000).toISOString(), verifiedCount: 23, severity: 'low' },
    { id: 'cs_6', title: 'FASTag Recharge Scam', description: 'Fake FASTag recharge links sent via SMS claiming low balance.', type: 'phishing', region: 'Hyderabad', reportedBy: 'Vikram D.', reportedAt: new Date(Date.now() - 518400000).toISOString(), verifiedCount: 41, severity: 'high' },
  ];
}
