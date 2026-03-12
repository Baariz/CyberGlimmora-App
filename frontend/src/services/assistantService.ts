import type { AIResponse } from '../types';

const RESPONSES: Record<string, AIResponse> = {
  default: {
    message: 'I can help you with cybersecurity questions, scam identification, privacy settings, and digital safety tips. What would you like to know?',
    isEmergency: false,
    suggestedActions: ['Check your risk score', 'Review recent alerts', 'Run a device scan'],
  },
  scam: {
    message: 'I have analyzed the message you described. It shows several red flags typical of phishing attempts:\n\n1. Urgency language to create panic\n2. Request for sensitive data (OTP/PIN)\n3. Unofficial sender ID\n\nI recommend blocking the sender and reporting it to your bank immediately. Never share OTP with anyone.',
    isEmergency: false,
    suggestedActions: ['Report to bank', 'Block sender', 'Check Scam Alerts'],
  },
  emergency: {
    message: 'I detect this may be an emergency situation. I am activating emergency protocols.\n\nYour location has been shared with trusted contacts. If you are in immediate danger, please call 112 (Emergency) or 1930 (Cyber Crime Helpline).',
    isEmergency: true,
    suggestedActions: ['Call 112', 'Call Cyber Crime 1930', 'Share live location'],
  },
  password: {
    message: 'Here are my recommendations for strong password security:\n\n1. Use at least 12 characters with upper/lowercase, numbers, and symbols\n2. Never reuse passwords across sites\n3. Enable two-factor authentication everywhere\n4. Use a password manager\n5. Change passwords every 90 days\n\nWould you like me to check if any of your passwords have been compromised?',
    isEmergency: false,
    suggestedActions: ['Check breach status', 'Enable 2FA', 'Password audit'],
  },
  privacy: {
    message: 'Your current privacy posture shows some areas for improvement:\n\n- 3 apps have excessive permissions\n- Location sharing is enabled for 6 apps\n- 2 connected accounts need review\n\nI recommend starting with the Device Security module to review app permissions.',
    isEmergency: false,
    suggestedActions: ['Review permissions', 'Privacy audit', 'Check connected accounts'],
  },
};

export async function sendMessage(message: string): Promise<AIResponse> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  const lower = message.toLowerCase();
  if (lower.includes('help') || lower.includes('emergency') || lower.includes('sos') || lower.includes('danger')) return RESPONSES.emergency;
  if (lower.includes('scam') || lower.includes('fraud') || lower.includes('phishing') || lower.includes('otp')) return RESPONSES.scam;
  if (lower.includes('password') || lower.includes('2fa') || lower.includes('authentication')) return RESPONSES.password;
  if (lower.includes('privacy') || lower.includes('permission') || lower.includes('data')) return RESPONSES.privacy;
  return RESPONSES.default;
}

export function getSuggestedQueries(): string[] {
  return [
    'Is this message a scam?',
    'How to improve my risk score?',
    'Check my privacy settings',
    'What to do if phone is stolen?',
    'How to create strong passwords?',
    'Report a cyber crime',
  ];
}
