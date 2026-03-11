import type { ChildProfile, SafeZone, ChildAlert, DeviceTheftStatus, DailyScreenTime } from '../types';

export async function getChildren(): Promise<ChildProfile[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    {
      id: 'child_001', name: 'Aarav', age: 12, avatar: '', deviceName: 'Aarav\'s iPad',
      batteryLevel: 78, isOnline: true, lastSeen: new Date(Date.now() - 300000).toISOString(),
      location: { lat: 19.076, lng: 72.8777, address: 'DPS School, Andheri East', timestamp: new Date(Date.now() - 300000).toISOString() },
      screenTimeToday: 145, alertCount: 2,
    },
    {
      id: 'child_002', name: 'Meera', age: 9, avatar: '', deviceName: 'Meera\'s Tablet',
      batteryLevel: 45, isOnline: false, lastSeen: new Date(Date.now() - 1800000).toISOString(),
      location: { lat: 19.082, lng: 72.871, address: 'Home - Powai', timestamp: new Date(Date.now() - 1800000).toISOString() },
      screenTimeToday: 90, alertCount: 0,
    },
  ];
}

export async function getSafeZones(): Promise<SafeZone[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'zone_1', name: 'Home', type: 'safe', center: { lat: 19.082, lng: 72.871 }, radius: 200, address: 'Lake Homes, Powai, Mumbai', isActive: true, childIds: ['child_001', 'child_002'] },
    { id: 'zone_2', name: 'School', type: 'safe', center: { lat: 19.076, lng: 72.8777 }, radius: 300, address: 'DPS School, Andheri East', isActive: true, childIds: ['child_001', 'child_002'] },
    { id: 'zone_3', name: 'Railway Station', type: 'danger', center: { lat: 19.066, lng: 72.868 }, radius: 500, address: 'Andheri Railway Station', isActive: true, childIds: ['child_001'] },
  ];
}

export async function getChildAlerts(): Promise<ChildAlert[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { id: 'ca_1', childId: 'child_001', childName: 'Aarav', type: 'cyberbullying', title: 'Cyberbullying Detected', description: 'Aggressive messages detected in a chat app.', severity: 'high', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false, action: 'Review messages and talk to your child' },
    { id: 'ca_2', childId: 'child_001', childName: 'Aarav', type: 'content', title: 'Inappropriate Content', description: 'Attempted access to age-restricted content blocked.', severity: 'medium', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: false, action: 'Review content filters' },
    { id: 'ca_3', childId: 'child_002', childName: 'Meera', type: 'location', title: 'Left Safe Zone', description: 'Meera left the "Home" safe zone at 3:45 PM.', severity: 'medium', timestamp: new Date(Date.now() - 14400000).toISOString(), isRead: true, action: 'Check current location' },
    { id: 'ca_4', childId: 'child_001', childName: 'Aarav', type: 'scam', title: 'Scam Message Blocked', description: 'A lottery scam message was blocked on Aarav\'s device.', severity: 'low', timestamp: new Date(Date.now() - 28800000).toISOString(), isRead: true, action: 'No action needed - message was blocked' },
  ];
}

export async function getDeviceTheftStatus(): Promise<DeviceTheftStatus> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    simLockEnabled: true,
    remoteLockEnabled: true,
    remoteWipeEnabled: false,
    thiefSelfieEnabled: true,
    lastThiefSelfie: null,
    encryptionActive: true,
  };
}

export async function getScreenTimeData(): Promise<DailyScreenTime[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    { day: 'Mon', totalMinutes: 120, apps: [{ app: 'YouTube', category: 'Entertainment', minutes: 45, icon: 'logo-youtube' }, { app: 'Instagram', category: 'Social', minutes: 30, icon: 'logo-instagram' }, { app: 'Khan Academy', category: 'Education', minutes: 45, icon: 'school-outline' }] },
    { day: 'Tue', totalMinutes: 95, apps: [{ app: 'YouTube', category: 'Entertainment', minutes: 30, icon: 'logo-youtube' }, { app: 'Minecraft', category: 'Games', minutes: 40, icon: 'game-controller-outline' }, { app: 'Chrome', category: 'Browser', minutes: 25, icon: 'globe-outline' }] },
    { day: 'Wed', totalMinutes: 145, apps: [{ app: 'YouTube', category: 'Entertainment', minutes: 60, icon: 'logo-youtube' }, { app: 'Instagram', category: 'Social', minutes: 45, icon: 'logo-instagram' }, { app: 'WhatsApp', category: 'Messaging', minutes: 40, icon: 'logo-whatsapp' }] },
    { day: 'Thu', totalMinutes: 110, apps: [{ app: 'YouTube', category: 'Entertainment', minutes: 35, icon: 'logo-youtube' }, { app: 'BYJU\'S', category: 'Education', minutes: 50, icon: 'school-outline' }, { app: 'Chrome', category: 'Browser', minutes: 25, icon: 'globe-outline' }] },
    { day: 'Fri', totalMinutes: 160, apps: [{ app: 'YouTube', category: 'Entertainment', minutes: 55, icon: 'logo-youtube' }, { app: 'Minecraft', category: 'Games', minutes: 60, icon: 'game-controller-outline' }, { app: 'Instagram', category: 'Social', minutes: 45, icon: 'logo-instagram' }] },
    { day: 'Sat', totalMinutes: 200, apps: [{ app: 'YouTube', category: 'Entertainment', minutes: 75, icon: 'logo-youtube' }, { app: 'Minecraft', category: 'Games', minutes: 65, icon: 'game-controller-outline' }, { app: 'Netflix', category: 'Entertainment', minutes: 60, icon: 'tv-outline' }] },
    { day: 'Sun', totalMinutes: 180, apps: [{ app: 'YouTube', category: 'Entertainment', minutes: 60, icon: 'logo-youtube' }, { app: 'Instagram', category: 'Social', minutes: 50, icon: 'logo-instagram' }, { app: 'BYJU\'S', category: 'Education', minutes: 40, icon: 'school-outline' }, { app: 'Chrome', category: 'Browser', minutes: 30, icon: 'globe-outline' }] },
  ];
}
