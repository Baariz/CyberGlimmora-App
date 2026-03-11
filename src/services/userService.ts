import type { UserProfile, NotificationPreference, ConnectedAccount, SecuritySetting } from '../types';

import { userProfile as profileData } from '../mock-data/user-profile';

const data = profileData as unknown as UserProfile & {
  notificationPreferences: NotificationPreference[];
  connectedAccounts: ConnectedAccount[];
  securitySettings: SecuritySetting[];
};

export async function getUserProfile(): Promise<UserProfile> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  const { notificationPreferences, connectedAccounts, securitySettings, ...profile } = data;
  return profile;
}

export async function getNotificationPreferences(): Promise<NotificationPreference[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return data.notificationPreferences;
}

export async function updateNotificationPreference(id: string, enabled: boolean): Promise<NotificationPreference> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const pref = data.notificationPreferences.find(p => p.id === id);
  if (!pref) throw new Error('Preference not found');
  return { ...pref, enabled };
}

export async function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return data.connectedAccounts;
}

export async function getSecuritySettings(): Promise<SecuritySetting[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return data.securitySettings;
}

export async function updateSecuritySetting(id: string, enabled: boolean): Promise<SecuritySetting> {
  await new Promise(resolve => setTimeout(resolve, 200));
  const setting = data.securitySettings.find(s => s.id === id);
  if (!setting) throw new Error('Setting not found');
  return { ...setting, enabled };
}
