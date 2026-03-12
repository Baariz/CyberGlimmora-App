import type { RiskScore, ImprovementAction } from '../types';

export async function getRiskScore(): Promise<RiskScore> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return {
    overall: 61,
    maxScore: 100,
    level: 'medium',
    lastUpdated: new Date(Date.now() - 1800000).toISOString(),
    factors: [
      { id: 'f1', name: 'Password Strength', score: 14, maxScore: 20, impact: 'high', description: 'Some passwords are weak or reused across services.', action: 'Update weak passwords and enable 2FA', category: 'authentication' },
      { id: 'f2', name: 'Data Exposure', score: 8, maxScore: 20, impact: 'high', description: '14 data points exposed across 3 known breaches.', action: 'Resolve breaches and change exposed credentials', category: 'identity' },
      { id: 'f3', name: 'Device Security', score: 15, maxScore: 20, impact: 'medium', description: 'Device is mostly secure but some apps have excessive permissions.', action: 'Review and revoke unnecessary app permissions', category: 'device' },
      { id: 'f4', name: 'Network Safety', score: 12, maxScore: 20, impact: 'medium', description: 'Occasionally connects to unsecured Wi-Fi networks.', action: 'Use VPN on public networks', category: 'network' },
      { id: 'f5', name: 'Behavior Score', score: 12, maxScore: 20, impact: 'low', description: 'Good browsing habits but some risky link clicks detected.', action: 'Avoid clicking links in unsolicited messages', category: 'behavior' },
    ],
    history: [
      { date: '2025-10-01', score: 45 },
      { date: '2025-11-01', score: 48 },
      { date: '2025-12-01', score: 52 },
      { date: '2026-01-01', score: 55 },
      { date: '2026-02-01', score: 58 },
      { date: '2026-03-01', score: 61 },
    ],
  };
}

export async function getImprovementActions(): Promise<ImprovementAction[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'ia_1', title: 'Enable 2FA on all accounts', description: 'Add two-factor authentication to email, banking, and social media accounts.', impact: 8, difficulty: 'easy', completed: false, category: 'authentication' },
    { id: 'ia_2', title: 'Resolve LinkedIn breach', description: 'Change your LinkedIn password and review connected apps.', impact: 6, difficulty: 'easy', completed: false, category: 'identity' },
    { id: 'ia_3', title: 'Install VPN', description: 'Use a trusted VPN when connecting to public Wi-Fi networks.', impact: 5, difficulty: 'medium', completed: false, category: 'network' },
    { id: 'ia_4', title: 'Revoke excessive permissions', description: 'Review and remove unnecessary permissions from 3 flagged apps.', impact: 4, difficulty: 'easy', completed: false, category: 'device' },
    { id: 'ia_5', title: 'Update device OS', description: 'Install the latest security patches for your device operating system.', impact: 5, difficulty: 'hard', completed: true, category: 'device' },
  ];
}
