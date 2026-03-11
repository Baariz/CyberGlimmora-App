import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing, FontSize } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/helpers';
import {
  getUserProfile,
  getNotificationPreferences,
  updateNotificationPreference,
  getConnectedAccounts,
  getSecuritySettings,
  updateSecuritySetting,
} from '../../services';
import type {
  UserProfile,
  NotificationPreference,
  ConnectedAccount,
  SecuritySetting,
} from '../../types';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationPreference[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [security, setSecurity] = useState<SecuritySetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getUserProfile(),
      getNotificationPreferences(),
      getConnectedAccounts(),
      getSecuritySettings(),
    ]).then(([prof, notif, accs, sec]) => {
      setProfile(prof);
      setNotifications(notif);
      setAccounts(accs);
      setSecurity(sec);
      setLoading(false);
    });
  }, []);

  async function handleNotifToggle(id: string, enabled: boolean) {
    try {
      const updated = await updateNotificationPreference(id, enabled);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    } catch {}
  }

  async function handleSecurityToggle(id: string, enabled: boolean) {
    try {
      const updated = await updateSecuritySetting(id, enabled);
      setSecurity((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch {}
  }

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  }

  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const planLabel = profile.plan === 'family' ? 'Family Plan' : 'Basic Plan';
  const planColor = profile.plan === 'family' ? Colors.primary : Colors.info;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Section */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={36} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
            <Text style={styles.profilePhone}>{profile.phone}</Text>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscription */}
      <View style={styles.subscriptionCard}>
        <View style={styles.subHeader}>
          <View style={[styles.planBadge, { backgroundColor: planColor + '20' }]}>
            <Ionicons name="diamond-outline" size={14} color={planColor} />
            <Text style={[styles.planBadgeText, { color: planColor }]}>{planLabel}</Text>
          </View>
          <Text style={styles.joinedText}>Since {formatDate(profile.joinedDate)}</Text>
        </View>
        <View style={styles.subStats}>
          <View style={styles.subStatItem}>
            <Text style={styles.subStatValue}>{profile.devicesCount}</Text>
            <Text style={styles.subStatLabel}>Devices</Text>
          </View>
          <View style={styles.subStatDivider} />
          <View style={styles.subStatItem}>
            <Text style={styles.subStatValue}>{profile.familyMembers}</Text>
            <Text style={styles.subStatLabel}>Family</Text>
          </View>
          <View style={styles.subStatDivider} />
          <View style={styles.subStatItem}>
            <Ionicons
              name={profile.twoFactorEnabled ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={profile.twoFactorEnabled ? Colors.safe : Colors.danger}
            />
            <Text style={styles.subStatLabel}>2FA</Text>
          </View>
        </View>
      </View>

      {/* Notifications */}
      <Text style={styles.sectionTitle}>Notifications</Text>
      {notifications.map((notif) => (
        <View key={notif.id} style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{notif.label}</Text>
            <Text style={styles.settingDesc}>{notif.description}</Text>
          </View>
          <Switch
            value={notif.enabled}
            onValueChange={(val) => handleNotifToggle(notif.id, val)}
            trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
            thumbColor={notif.enabled ? Colors.primary : Colors.textLight}
          />
        </View>
      ))}

      {/* Connected Accounts */}
      <Text style={styles.sectionTitle}>Connected Accounts</Text>
      {accounts.map((account) => (
        <View key={account.id} style={styles.accountCard}>
          <Ionicons name={account.icon as any} size={24} color={account.connected ? Colors.textPrimary : Colors.textLight} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.accountProvider}>{account.provider}</Text>
            {account.connected ? (
              <Text style={styles.accountEmail}>{account.email}</Text>
            ) : (
              <Text style={styles.accountNotConnected}>Not connected</Text>
            )}
          </View>
          {account.connected ? (
            <View style={styles.connectedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.safe} />
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {/* Security */}
      <Text style={styles.sectionTitle}>Security</Text>
      {security.map((setting) => (
        <View key={setting.id} style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{setting.label}</Text>
            <Text style={styles.settingDesc}>{setting.description}</Text>
          </View>
          <Switch
            value={setting.enabled}
            onValueChange={(val) => handleSecurityToggle(setting.id, val)}
            trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
            thumbColor={setting.enabled ? Colors.primary : Colors.textLight}
          />
        </View>
      ))}

      {/* Sign Out */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color={Colors.danger} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg, paddingTop: Spacing['4xl'] + 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.pageBg },
  profileCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarLarge: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg },
  profileName: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  profileEmail: { fontSize: FontSize.sm, color: Colors.textMid, marginTop: 2 },
  profilePhone: { fontSize: FontSize.sm, color: Colors.textMid, marginTop: 2 },
  editButton: { padding: Spacing.sm, backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.md },
  subscriptionCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginTop: Spacing.lg, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.sm },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  planBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  planBadgeText: { fontSize: FontSize.sm, fontWeight: '600' },
  joinedText: { fontSize: FontSize.xs, color: Colors.textMid },
  subStats: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: Colors.pageBg, borderRadius: BorderRadius.lg, padding: Spacing.md },
  subStatItem: { alignItems: 'center' },
  subStatValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  subStatLabel: { fontSize: FontSize.xs, color: Colors.textMid, marginTop: 2 },
  subStatDivider: { width: 1, backgroundColor: Colors.border },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.sm, borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadows.sm },
  settingLabel: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  settingDesc: { fontSize: FontSize.xs, color: Colors.textMid, marginTop: 2 },
  accountCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.sm, borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadows.sm },
  accountProvider: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  accountEmail: { fontSize: FontSize.sm, color: Colors.textMid, marginTop: 2 },
  accountNotConnected: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 2, fontStyle: 'italic' },
  connectedBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  connectedText: { fontSize: FontSize.xs, color: Colors.safe, fontWeight: '500' },
  connectButton: { borderWidth: 1, borderColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  connectButtonText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500' },
  signOutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, marginHorizontal: Spacing.xl, marginTop: Spacing.xl, borderWidth: 2, borderColor: Colors.danger, borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg },
  signOutText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.danger },
});
