import type { TwinStatus, DeviceTwin, TwinPrediction } from '../types';

export async function getTwinStatus(): Promise<TwinStatus> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    syncedAt: new Date(Date.now() - 600000).toISOString(),
    healthScore: 68,
    activePredictions: 7,
    simulationVersion: 'v2.4.1',
    devicesMonitored: 4,
  };
}

export async function getDeviceTwins(): Promise<DeviceTwin[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    {
      id: 'dt_001', type: 'mobile', name: 'Samsung Galaxy S24', os: 'Android 15',
      overallRisk: 'medium', lastScan: new Date(Date.now() - 7200000).toISOString(),
      threats: {
        device: { probability: 0.35, prediction: 'Malware infection via sideloaded app', timeToImpact: '7 days', impact: { dataAtRisk: ['Photos', 'Contacts', 'Messages'], accountsExposed: 3, financialLoss: { min: 0, max: 5000 } }, prevention: ['Remove unknown apps', 'Enable Play Protect', 'Update OS'], trend: [{ day: 1, probability: 0.30 }, { day: 7, probability: 0.35 }, { day: 14, probability: 0.42 }, { day: 30, probability: 0.55 }] },
        identity: { probability: 0.62, prediction: 'Credential stuffing attack using leaked data', timeToImpact: '14 days', impact: { dataAtRisk: ['Email access', 'Social media', 'Banking apps'], accountsExposed: 5, financialLoss: { min: 5000, max: 50000 } }, prevention: ['Change reused passwords', 'Enable 2FA on all accounts', 'Use a password manager'], trend: [{ day: 1, probability: 0.55 }, { day: 7, probability: 0.62 }, { day: 14, probability: 0.70 }, { day: 30, probability: 0.78 }] },
        financial: { probability: 0.28, prediction: 'UPI fraud via SIM swap', timeToImpact: '30 days', impact: { dataAtRisk: ['Bank accounts', 'UPI apps', 'Credit cards'], accountsExposed: 4, financialLoss: { min: 10000, max: 200000 } }, prevention: ['Enable SIM lock', 'Set UPI transaction limits', 'Register for SMS alerts'], trend: [{ day: 1, probability: 0.22 }, { day: 7, probability: 0.28 }, { day: 14, probability: 0.33 }, { day: 30, probability: 0.40 }] },
        behavior: { probability: 0.45, prediction: 'Phishing link click from social engineering', timeToImpact: '3 days', impact: { dataAtRisk: ['Credentials', 'Personal info'], accountsExposed: 2, financialLoss: { min: 0, max: 10000 } }, prevention: ['Be cautious of links in messages', 'Verify sender identity', 'Use scam detector before clicking'], trend: [{ day: 1, probability: 0.40 }, { day: 7, probability: 0.45 }, { day: 14, probability: 0.50 }, { day: 30, probability: 0.58 }] },
      },
      hotspots: [
        { id: 'hs_1', label: 'Camera', x: 50, y: 15, risk: 'low' },
        { id: 'hs_2', label: 'NFC', x: 80, y: 40, risk: 'medium' },
        { id: 'hs_3', label: 'USB', x: 50, y: 90, risk: 'high' },
        { id: 'hs_4', label: 'WiFi', x: 20, y: 30, risk: 'medium' },
      ],
    },
  ];
}

export async function getPredictions(): Promise<TwinPrediction[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'tp_1', deviceId: 'dt_001', category: 'identity', title: 'Credential Stuffing Attack', probability: 0.62, timeToImpact: '14 days', confidence: 85, riskLevel: 'high', explanation: 'Your leaked credentials from the LinkedIn breach may be used in automated attacks.', moduleLink: 'Identity' },
    { id: 'tp_2', deviceId: 'dt_001', category: 'behavior', title: 'Social Engineering Attack', probability: 0.45, timeToImpact: '3 days', confidence: 78, riskLevel: 'medium', explanation: 'Recent patterns suggest increased susceptibility to phishing attempts.', moduleLink: 'ScamDetection' },
    { id: 'tp_3', deviceId: 'dt_001', category: 'device', title: 'Malware Risk', probability: 0.35, timeToImpact: '7 days', confidence: 72, riskLevel: 'medium', explanation: 'Sideloaded apps and outdated security patches increase malware risk.', moduleLink: 'Device' },
    { id: 'tp_4', deviceId: 'dt_001', category: 'financial', title: 'UPI Fraud Attempt', probability: 0.28, timeToImpact: '30 days', confidence: 68, riskLevel: 'low', explanation: 'SIM swap vulnerability detected; UPI accounts may be at risk.', moduleLink: 'Device' },
    { id: 'tp_5', deviceId: 'dt_001', category: 'identity', title: 'Dark Web Data Sale', probability: 0.22, timeToImpact: '21 days', confidence: 65, riskLevel: 'low', explanation: 'Exposed data from breaches may appear on dark web marketplaces.', moduleLink: 'Identity' },
  ];
}
