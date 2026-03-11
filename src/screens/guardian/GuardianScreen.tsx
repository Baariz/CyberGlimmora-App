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
import { timeAgo, getSeverityColor } from '../../utils/helpers';
import {
  getChildren,
  getSafeZones,
  getChildAlerts,
  getDeviceTheftStatus,
  getScreenTimeData,
} from '../../services';
import type {
  ChildProfile,
  SafeZone,
  ChildAlert,
  DeviceTheftStatus,
  DailyScreenTime,
} from '../../types';

const TABS = ['Overview', 'Safe Zones', 'Threats', 'Device Theft', 'Screen Time'];

export default function GuardianScreen() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
          >
            <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === 0 && <OverviewTab />}
      {activeTab === 1 && <SafeZonesTab />}
      {activeTab === 2 && <ThreatsTab />}
      {activeTab === 3 && <DeviceTheftTab />}
      {activeTab === 4 && <ScreenTimeTab />}
    </View>
  );
}

/* ───── Overview Tab ───── */
function OverviewTab() {
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChildren().then((data) => { setChildren(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={48} color={Colors.white} />
        <Text style={styles.mapText}>Live Location Map</Text>
        <Text style={styles.mapSubtext}>Tracking {children.length} devices</Text>
      </View>

      <Text style={styles.sectionTitle}>Children</Text>
      {children.map((child) => (
        <View key={child.id} style={styles.childCard}>
          <View style={styles.childHeader}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={24} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.nameRow}>
                <Text style={styles.childName}>{child.name}</Text>
                <View style={[styles.statusDot, { backgroundColor: child.isOnline ? Colors.safe : Colors.textLight }]} />
                <Text style={[styles.statusLabel, { color: child.isOnline ? Colors.safe : Colors.textLight }]}>
                  {child.isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
              <Text style={styles.childAge}>Age {child.age} - {child.deviceName}</Text>
            </View>
            {child.alertCount > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{child.alertCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.childDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color={Colors.textMid} />
              <Text style={styles.detailText}>{child.location.address}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="battery-half-outline" size={14} color={child.batteryLevel < 30 ? Colors.danger : Colors.textMid} />
              <Text style={styles.detailText}>{child.batteryLevel}% Battery</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={14} color={Colors.textMid} />
              <Text style={styles.detailText}>{Math.floor(child.screenTimeToday / 60)}h {child.screenTimeToday % 60}m screen time today</Text>
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Safe Zones Tab ───── */
function SafeZonesTab() {
  const [zones, setZones] = useState<SafeZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSafeZones().then((data) => { setZones(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  function handleDelete(id: string) {
    Alert.alert('Delete Zone', 'Are you sure you want to delete this safe zone?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setZones((prev) => prev.filter((z) => z.id !== id)) },
    ]);
  }

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="add-circle-outline" size={20} color={Colors.white} />
        <Text style={styles.addButtonText}>Add Safe Zone</Text>
      </TouchableOpacity>

      {zones.map((zone) => (
        <View key={zone.id} style={[styles.zoneCard, { borderLeftColor: zone.type === 'safe' ? Colors.safe : Colors.danger, borderLeftWidth: 4 }]}>
          <View style={styles.zoneHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.zoneName}>{zone.name}</Text>
              <View style={[styles.zoneTypeBadge, { backgroundColor: (zone.type === 'safe' ? Colors.safe : Colors.danger) + '20' }]}>
                <Text style={[styles.zoneTypeText, { color: zone.type === 'safe' ? Colors.safe : Colors.danger }]}>
                  {zone.type === 'safe' ? 'SAFE ZONE' : 'DANGER ZONE'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(zone.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </TouchableOpacity>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textMid} />
            <Text style={styles.detailText}>{zone.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="radio-outline" size={14} color={Colors.textMid} />
            <Text style={styles.detailText}>{zone.radius}m radius</Text>
          </View>
        </View>
      ))}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Threats Tab ───── */
function ThreatsTab() {
  const [alerts, setAlerts] = useState<ChildAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChildAlerts().then((data) => { setAlerts(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {alerts.map((alert) => (
        <View key={alert.id} style={styles.threatCard}>
          <View style={[styles.threatSeverityBar, { backgroundColor: getSeverityColor(alert.severity) }]} />
          <View style={styles.threatBody}>
            <View style={styles.threatTopRow}>
              <Text style={styles.threatTitle} numberOfLines={1}>{alert.title}</Text>
              <View style={styles.childNameBadge}>
                <Text style={styles.childNameBadgeText}>{alert.childName}</Text>
              </View>
            </View>
            <Text style={styles.threatDesc}>{alert.description}</Text>
            <View style={styles.threatMeta}>
              <View style={[styles.severityPill, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
                <Text style={[styles.severityPillText, { color: getSeverityColor(alert.severity) }]}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.threatTime}>{timeAgo(alert.timestamp)}</Text>
            </View>
            <View style={styles.actionRow}>
              <Ionicons name="arrow-forward-circle-outline" size={14} color={Colors.primary} />
              <Text style={styles.actionText}>{alert.action}</Text>
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Device Theft Tab ───── */
function DeviceTheftTab() {
  const [status, setStatus] = useState<DeviceTheftStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDeviceTheftStatus().then((data) => { setStatus(data); setLoading(false); });
  }, []);

  if (loading || !status) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  const features: { key: keyof DeviceTheftStatus; label: string; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
    { key: 'simLockEnabled', label: 'SIM Lock', icon: 'card-outline', description: 'Lock SIM card to prevent unauthorized use' },
    { key: 'remoteLockEnabled', label: 'Remote Lock', icon: 'lock-closed-outline', description: 'Remotely lock device if stolen' },
    { key: 'remoteWipeEnabled', label: 'Remote Wipe', icon: 'trash-outline', description: 'Erase all data remotely' },
    { key: 'thiefSelfieEnabled', label: 'Thief Selfie', icon: 'camera-outline', description: 'Take photo on failed unlock attempts' },
    { key: 'encryptionActive', label: 'Encryption', icon: 'shield-checkmark-outline', description: 'Full device encryption' },
  ];

  function handleToggle(key: keyof DeviceTheftStatus) {
    setStatus((prev) => prev ? { ...prev, [key]: !prev[key] } : prev);
  }

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Anti-Theft Protection</Text>
      <View style={styles.theftGrid}>
        {features.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.theftCard, status[f.key] && styles.theftCardActive]}
            onPress={() => handleToggle(f.key)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={f.icon as any}
              size={28}
              color={status[f.key] ? Colors.primary : Colors.textLight}
            />
            <Text style={[styles.theftLabel, status[f.key] && styles.theftLabelActive]}>{f.label}</Text>
            <Text style={styles.theftDesc} numberOfLines={2}>{f.description}</Text>
            <View style={[styles.toggleIndicator, status[f.key] && styles.toggleIndicatorActive]}>
              <Text style={[styles.toggleText, status[f.key] && styles.toggleTextActive]}>
                {status[f.key] ? 'ON' : 'OFF'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Screen Time Tab ───── */
function ScreenTimeTab() {
  const [data, setData] = useState<DailyScreenTime[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScreenTimeData().then((d) => { setData(d); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  const maxMinutes = Math.max(...data.map((d) => d.totalMinutes));
  const totalWeek = data.reduce((sum, d) => sum + d.totalMinutes, 0);
  const avgDaily = Math.round(totalWeek / 7);

  // Aggregate top apps across the week
  const appMap: Record<string, { minutes: number; category: string; icon: string }> = {};
  data.forEach((d) =>
    d.apps.forEach((app) => {
      if (!appMap[app.app]) appMap[app.app] = { minutes: 0, category: app.category, icon: app.icon };
      appMap[app.app].minutes += app.minutes;
    })
  );
  const topApps = Object.entries(appMap)
    .sort(([, a], [, b]) => b.minutes - a.minutes)
    .slice(0, 6);

  const categoryColors: Record<string, string> = {
    Entertainment: Colors.danger,
    Social: Colors.info,
    Education: Colors.safe,
    Games: Colors.warning,
    Messaging: Colors.primaryMid,
    Browser: Colors.textMid,
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.screenTimeHeader}>
        <View>
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <Text style={styles.avgText}>Avg {Math.floor(avgDaily / 60)}h {avgDaily % 60}m / day</Text>
        </View>
        <View style={styles.totalBadge}>
          <Text style={styles.totalValue}>{Math.floor(totalWeek / 60)}h {totalWeek % 60}m</Text>
          <Text style={styles.totalLabel}>This Week</Text>
        </View>
      </View>

      {/* Bar Chart */}
      <View style={styles.barChart}>
        {data.map((d) => (
          <View key={d.day} style={styles.barCol}>
            <Text style={styles.barValue}>{Math.floor(d.totalMinutes / 60)}h</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height: `${(d.totalMinutes / maxMinutes) * 100}%` }]} />
            </View>
            <Text style={styles.barLabel}>{d.day}</Text>
          </View>
        ))}
      </View>

      {/* App Usage */}
      <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Top Apps</Text>
      {topApps.map(([name, info]) => (
        <View key={name} style={styles.appRow}>
          <Ionicons name={info.icon as any} size={22} color={Colors.textMid} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <View style={styles.appNameRow}>
              <Text style={styles.appName}>{name}</Text>
              <View style={[styles.categoryBadge, { backgroundColor: (categoryColors[info.category] || Colors.textLight) + '20' }]}>
                <Text style={[styles.categoryText, { color: categoryColors[info.category] || Colors.textLight }]}>
                  {info.category}
                </Text>
              </View>
            </View>
            <View style={styles.appBarBg}>
              <View style={[styles.appBarFill, { width: `${(info.minutes / topApps[0][1].minutes) * 100}%`, backgroundColor: categoryColors[info.category] || Colors.textLight }]} />
            </View>
          </View>
          <Text style={styles.appMinutes}>{Math.floor(info.minutes / 60)}h {info.minutes % 60}m</Text>
        </View>
      ))}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Styles ───── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg, paddingTop: Spacing['4xl'] + 10 },
  tabBar: { maxHeight: 48 },
  tabBarContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  tab: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.sectionBg },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textMid },
  tabTextActive: { color: Colors.white },
  tabContent: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.md },
  mapPlaceholder: { backgroundColor: Colors.primaryDark, borderRadius: BorderRadius.xl, height: 180, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  mapText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.white, marginTop: Spacing.sm },
  mapSubtext: { fontSize: FontSize.sm, color: Colors.primaryLighter, marginTop: Spacing.xs },
  childCard: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.lg, ...Shadows.md },
  childHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  avatarCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  childName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusLabel: { fontSize: FontSize.xs, fontWeight: '500' },
  childAge: { fontSize: FontSize.sm, color: Colors.textMid, marginTop: 2 },
  alertBadge: { backgroundColor: Colors.danger, borderRadius: BorderRadius.full, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  alertBadgeText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.white },
  childDetails: { gap: Spacing.sm },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  detailText: { fontSize: FontSize.sm, color: Colors.textMid },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, marginBottom: Spacing.xl, ...Shadows.md },
  addButtonText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.white },
  zoneCard: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, ...Shadows.sm },
  zoneHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  zoneName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  zoneTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  zoneTypeText: { fontSize: FontSize.xs, fontWeight: '600' },
  deleteBtn: { padding: Spacing.sm },
  threatCard: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden', ...Shadows.sm },
  threatSeverityBar: { width: 4 },
  threatBody: { flex: 1, padding: Spacing.md },
  threatTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
  threatTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  childNameBadge: { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2, marginLeft: Spacing.sm },
  childNameBadgeText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500' },
  threatDesc: { fontSize: FontSize.sm, color: Colors.textMid, lineHeight: 18, marginBottom: Spacing.sm },
  threatMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  severityPill: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  severityPillText: { fontSize: FontSize.xs, fontWeight: '600' },
  threatTime: { fontSize: FontSize.xs, color: Colors.textLight },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  actionText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500' },
  theftGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  theftCard: { width: '47%', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: Colors.border, ...Shadows.sm },
  theftCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  theftLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMid, marginTop: Spacing.sm, textAlign: 'center' },
  theftLabelActive: { color: Colors.primary },
  theftDesc: { fontSize: FontSize.xs, color: Colors.textLight, textAlign: 'center', marginTop: Spacing.xs, lineHeight: 16 },
  toggleIndicator: { marginTop: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, backgroundColor: Colors.sectionBg },
  toggleIndicatorActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.textLight },
  toggleTextActive: { color: Colors.white },
  screenTimeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  avgText: { fontSize: FontSize.sm, color: Colors.textMid },
  totalBadge: { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center' },
  totalValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.primary },
  totalLabel: { fontSize: FontSize.xs, color: Colors.textMid },
  barChart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 180, backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadows.sm },
  barCol: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: FontSize.xs, color: Colors.textMid, marginBottom: Spacing.xs },
  barTrack: { width: 20, height: 120, backgroundColor: Colors.sectionBg, borderRadius: BorderRadius.sm, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', backgroundColor: Colors.primary, borderRadius: BorderRadius.sm },
  barLabel: { fontSize: FontSize.xs, color: Colors.textMid, marginTop: Spacing.xs },
  appRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadows.sm },
  appNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  appName: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textPrimary },
  categoryBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 1, borderRadius: BorderRadius.sm },
  categoryText: { fontSize: FontSize.xs, fontWeight: '500' },
  appBarBg: { height: 4, backgroundColor: Colors.sectionBg, borderRadius: 2 },
  appBarFill: { height: 4, borderRadius: 2 },
  appMinutes: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginLeft: Spacing.md },
});
