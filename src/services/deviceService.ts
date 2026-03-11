import type { DeviceStatus, AppPermission, NetworkStatus, PrivacyAccessLog, ScamMessage } from '../types';

export async function getDeviceStatus(): Promise<DeviceStatus> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    id: 'dev_001', deviceName: 'Samsung Galaxy S24', osVersion: 'Android 15', lastScan: new Date(Date.now() - 7200000).toISOString(),
    healthStatus: 'at_risk', healthScore: 74, malwareDetected: 0, suspiciousApps: 2,
    osUpToDate: true, screenLockEnabled: true, encryptionEnabled: true, rootDetected: false,
  };
}

export async function getAppPermissions(): Promise<AppPermission[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'ap_1', appName: 'TrueCaller', appIcon: 'call-outline', permissions: ['Contacts', 'Phone', 'SMS', 'Location'], riskLevel: 'dangerous', lastAccessed: new Date(Date.now() - 600000).toISOString(), recommendation: 'Revoke Location and SMS access', isRevoked: false },
    { id: 'ap_2', appName: 'CamScanner', appIcon: 'camera-outline', permissions: ['Camera', 'Storage', 'Contacts'], riskLevel: 'dangerous', lastAccessed: new Date(Date.now() - 3600000).toISOString(), recommendation: 'Revoke Contacts access - not needed for scanning', isRevoked: false },
    { id: 'ap_3', appName: 'WhatsApp', appIcon: 'logo-whatsapp', permissions: ['Camera', 'Microphone', 'Contacts', 'Storage', 'Location'], riskLevel: 'caution', lastAccessed: new Date(Date.now() - 1800000).toISOString(), recommendation: 'Consider revoking always-on Location', isRevoked: false },
    { id: 'ap_4', appName: 'Instagram', appIcon: 'logo-instagram', permissions: ['Camera', 'Microphone', 'Storage', 'Contacts'], riskLevel: 'caution', lastAccessed: new Date(Date.now() - 7200000).toISOString(), recommendation: 'Revoke Contacts access if not needed', isRevoked: false },
    { id: 'ap_5', appName: 'Google Maps', appIcon: 'map-outline', permissions: ['Location', 'Storage'], riskLevel: 'safe', lastAccessed: new Date(Date.now() - 900000).toISOString(), recommendation: 'Permissions are appropriate for this app', isRevoked: false },
    { id: 'ap_6', appName: 'PhonePe', appIcon: 'wallet-outline', permissions: ['SMS', 'Phone', 'Storage'], riskLevel: 'safe', lastAccessed: new Date(Date.now() - 5400000).toISOString(), recommendation: 'Permissions are standard for a payment app', isRevoked: false },
  ];
}

export async function getNetworkStatus(): Promise<NetworkStatus> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    id: 'net_001', networkName: 'Home WiFi 5G', type: 'wifi', riskLevel: 'secure',
    encryption: 'WPA3', issues: [], recommendation: 'Network is secure. Keep firmware updated.',
    connectedSince: new Date(Date.now() - 28800000).toISOString(),
  };
}

export async function getPrivacyLogs(): Promise<PrivacyAccessLog[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'pl_1', appName: 'Instagram', accessType: 'camera', timestamp: new Date(Date.now() - 1800000).toISOString(), duration: '2 min', suspicious: false },
    { id: 'pl_2', appName: 'TrueCaller', accessType: 'location', timestamp: new Date(Date.now() - 3600000).toISOString(), duration: 'Continuous', suspicious: true },
    { id: 'pl_3', appName: 'WhatsApp', accessType: 'microphone', timestamp: new Date(Date.now() - 5400000).toISOString(), duration: '5 min', suspicious: false },
    { id: 'pl_4', appName: 'CamScanner', accessType: 'camera', timestamp: new Date(Date.now() - 7200000).toISOString(), duration: '1 min', suspicious: false },
    { id: 'pl_5', appName: 'Unknown App', accessType: 'microphone', timestamp: new Date(Date.now() - 10800000).toISOString(), duration: '8 min', suspicious: true },
  ];
}

export async function getScamMessages(): Promise<ScamMessage[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'sm_1', source: 'sms', sender: '+91-SBIBNK', subject: undefined, preview: 'Dear customer, your account will be blocked. Update KYC now...', detectedAt: new Date(Date.now() - 1800000).toISOString(), severity: 'high', scamType: 'Bank KYC Phishing', confidence: 96, isRead: false },
    { id: 'sm_2', source: 'gmail', sender: 'no-reply@paytm-kyc.com', subject: 'Urgent: KYC Verification Required', preview: 'Your Paytm account KYC is pending. Complete verification to...', detectedAt: new Date(Date.now() - 3600000).toISOString(), severity: 'high', scamType: 'KYC Fraud', confidence: 94, isRead: false },
    { id: 'sm_3', source: 'whatsapp', sender: '+91 73XXX XXXXX', subject: undefined, preview: 'Congratulations! You have won a lucky draw prize of Rs 5 Lakhs...', detectedAt: new Date(Date.now() - 7200000).toISOString(), severity: 'medium', scamType: 'Lottery Scam', confidence: 89, isRead: true },
    { id: 'sm_4', source: 'sms', sender: 'FedEx-IN', subject: undefined, preview: 'Your parcel is held at customs. Pay Rs 2,500 clearance fee...', detectedAt: new Date(Date.now() - 14400000).toISOString(), severity: 'medium', scamType: 'Courier Scam', confidence: 87, isRead: true },
    { id: 'sm_5', source: 'telegram', sender: 'CryptoKing', subject: undefined, preview: 'Join our exclusive Bitcoin investment group. 500% returns guaranteed...', detectedAt: new Date(Date.now() - 28800000).toISOString(), severity: 'low', scamType: 'Crypto Scam', confidence: 82, isRead: true },
  ];
}
