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
import { timeAgo, formatDate, getSeverityColor } from '../../utils/helpers';
import {
  getTrustedContacts,
  getActiveJourney,
  getJourneyHistory,
  getSOSConfig,
} from '../../services';
import type {
  TrustedContact,
  JourneyData,
  JourneyHistory,
  SOSConfig,
} from '../../types';

const TABS = ['Active Journey', 'Trusted Contacts', 'History', 'SOS Settings'];

export default function JourneyScreen() {
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

      {activeTab === 0 && <ActiveJourneyTab />}
      {activeTab === 1 && <TrustedContactsTab />}
      {activeTab === 2 && <HistoryTab />}
      {activeTab === 3 && <SOSSettingsTab />}
    </View>
  );
}

/* ───── Active Journey Tab ───── */
function ActiveJourneyTab() {
  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveJourney().then((data) => { setJourney(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  function handleSOS() {
    Alert.alert(
      'SOS Activated',
      'Your location will be shared with all trusted contacts and emergency services will be notified.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Activate SOS', style: 'destructive', onPress: () => Alert.alert('SOS Sent', 'Emergency contacts have been notified.') },
      ]
    );
  }

  if (!journey) {
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={{ alignItems: 'center', paddingTop: 60 }}>
        <Ionicons name="navigate-outline" size={64} color={Colors.textLight} />
        <Text style={styles.emptyTitle}>No Active Journey</Text>
        <Text style={styles.emptySubtitle}>Start a journey to share your live location with trusted contacts.</Text>
        <TouchableOpacity style={styles.startButton}>
          <Ionicons name="play-circle" size={20} color={Colors.white} />
          <Text style={styles.startButtonText}>Start New Journey</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const statusColors: Record<string, string> = {
    active: Colors.safe,
    completed: Colors.primary,
    sos: Colors.danger,
    deviated: Colors.warning,
  };

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      {/* Map Placeholder */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="navigate" size={48} color={Colors.white} />
        <Text style={styles.mapText}>Live Journey Map</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[journey.status] + '30' }]}>
          <View style={[styles.statusDotSmall, { backgroundColor: statusColors[journey.status] }]} />
          <Text style={[styles.statusBadgeText, { color: statusColors[journey.status] }]}>
            {journey.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Journey Details */}
      <View style={styles.journeyCard}>
        <View style={styles.routeRow}>
          <View style={styles.routeDots}>
            <View style={[styles.routeDot, { backgroundColor: Colors.safe }]} />
            <View style={styles.routeLine} />
            <View style={[styles.routeDot, { backgroundColor: Colors.danger }]} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.locationItem}>
              <Text style={styles.locationLabel}>FROM</Text>
              <Text style={styles.locationAddress}>{journey.origin.address}</Text>
            </View>
            <View style={[styles.locationItem, { marginTop: Spacing.xl }]}>
              <Text style={styles.locationLabel}>TO</Text>
              <Text style={styles.locationAddress}>{journey.destination.address}</Text>
            </View>
          </View>
        </View>

        <View style={styles.journeyMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={Colors.textMid} />
            <Text style={styles.metaText}>Started {timeAgo(journey.startTime)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="flag-outline" size={14} color={Colors.textMid} />
            <Text style={styles.metaText}>ETA {timeAgo(journey.estimatedArrival)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={Colors.textMid} />
            <Text style={styles.metaText}>{journey.trustedContactIds.length} watching</Text>
          </View>
        </View>
      </View>

      {/* SOS Button */}
      <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
        <Ionicons name="warning" size={24} color={Colors.white} />
        <Text style={styles.sosButtonText}>SOS - Emergency Alert</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Trusted Contacts Tab ───── */
function TrustedContactsTab() {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrustedContacts().then((data) => { setContacts(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  function handleDelete(id: string) {
    Alert.alert('Remove Contact', 'Remove this trusted contact?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => setContacts((prev) => prev.filter((c) => c.id !== id)) },
    ]);
  }

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.addButton}>
        <Ionicons name="person-add-outline" size={18} color={Colors.white} />
        <Text style={styles.addButtonText}>Add Trusted Contact</Text>
      </TouchableOpacity>

      {contacts.map((contact) => (
        <View key={contact.id} style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <View style={styles.contactAvatar}>
              <Ionicons name="person" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.contactNameRow}>
                <Text style={styles.contactName}>{contact.name}</Text>
                {contact.isEmergency && (
                  <View style={styles.emergencyBadge}>
                    <Ionicons name="alert-circle" size={10} color={Colors.danger} />
                    <Text style={styles.emergencyBadgeText}>Emergency</Text>
                  </View>
                )}
              </View>
              <Text style={styles.contactRelation}>{contact.relationship}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(contact.id)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={18} color={Colors.danger} />
            </TouchableOpacity>
          </View>
          <View style={styles.contactDetails}>
            <View style={styles.contactDetailRow}>
              <Ionicons name="call-outline" size={14} color={Colors.textMid} />
              <Text style={styles.contactDetailText}>{contact.phone}</Text>
            </View>
            <View style={styles.contactDetailRow}>
              <Ionicons name="mail-outline" size={14} color={Colors.textMid} />
              <Text style={styles.contactDetailText}>{contact.email}</Text>
            </View>
          </View>
          <View style={styles.contactToggles}>
            <Text style={styles.toggleLabel}>Notify on journey</Text>
            <View style={[styles.togglePill, contact.notifyOnJourney ? styles.togglePillOn : styles.togglePillOff]}>
              <Text style={[styles.togglePillText, contact.notifyOnJourney ? styles.togglePillTextOn : styles.togglePillTextOff]}>
                {contact.notifyOnJourney ? 'YES' : 'NO'}
              </Text>
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── History Tab ───── */
function HistoryTab() {
  const [history, setHistory] = useState<JourneyHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getJourneyHistory().then((data) => { setHistory(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  const statusColors: Record<string, string> = {
    active: Colors.safe,
    completed: Colors.primary,
    sos: Colors.danger,
    deviated: Colors.warning,
  };

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      {history.map((entry, i) => (
        <View key={entry.id} style={styles.historyEntry}>
          {/* Timeline */}
          <View style={styles.timelineLine}>
            <View style={[styles.timelineDot, { backgroundColor: statusColors[entry.status] || Colors.textLight }]} />
            {i < history.length - 1 && <View style={styles.timelineConnector} />}
          </View>

          <View style={styles.historyContent}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyRoute}>
                {entry.origin} → {entry.destination}
              </Text>
              <View style={[styles.statusBadgeSmall, { backgroundColor: (statusColors[entry.status] || Colors.textLight) + '20' }]}>
                <Text style={[styles.statusBadgeSmallText, { color: statusColors[entry.status] || Colors.textLight }]}>
                  {entry.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.historyMeta}>
              <Text style={styles.historyMetaText}>{formatDate(entry.date)}</Text>
              <Text style={styles.historyMetaText}>{entry.duration}</Text>
              <Text style={styles.historyMetaText}>{entry.distance}</Text>
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── SOS Settings Tab ───── */
function SOSSettingsTab() {
  const [config, setConfig] = useState<SOSConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSOSConfig().then((data) => { setConfig(data); setLoading(false); });
  }, []);

  if (loading || !config) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  function toggle(key: keyof SOSConfig) {
    setConfig((prev) => prev ? { ...prev, [key]: !prev[key] } : prev);
  }

  const settings: { key: keyof SOSConfig; label: string; description: string }[] = [
    { key: 'enabled', label: 'Enable SOS', description: 'Allow emergency SOS activation during journeys' },
    { key: 'silentMode', label: 'Silent Mode', description: 'Activate SOS without sound or visual indication' },
    { key: 'autoEscalate', label: 'Auto Escalation', description: 'Automatically alert emergency services after timeout' },
    { key: 'includeLocation', label: 'Share Location', description: 'Include live GPS location in emergency alerts' },
    { key: 'includeDeviceInfo', label: 'Share Device Info', description: 'Include battery level and device details in alerts' },
  ];

  function handleTestSOS() {
    Alert.alert(
      'Test SOS',
      'This will send a test alert to your trusted contacts. No emergency services will be contacted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send Test', onPress: () => Alert.alert('Test Sent', 'Test SOS alert sent to trusted contacts.') },
      ]
    );
  }

  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      {settings.map((setting) => (
        <View key={setting.key} style={styles.settingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{setting.label}</Text>
            <Text style={styles.settingDesc}>{setting.description}</Text>
          </View>
          <Switch
            value={config[setting.key] as boolean}
            onValueChange={() => toggle(setting.key)}
            trackColor={{ false: Colors.border, true: Colors.primary + '60' }}
            thumbColor={config[setting.key] ? Colors.primary : Colors.textLight}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.testSOSButton} onPress={handleTestSOS}>
        <Ionicons name="radio-outline" size={18} color={Colors.warning} />
        <Text style={styles.testSOSText}>Test SOS Alert</Text>
      </TouchableOpacity>

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
  mapPlaceholder: { backgroundColor: Colors.primaryDark, borderRadius: BorderRadius.xl, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  mapText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.white, marginTop: Spacing.sm },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, marginTop: Spacing.sm },
  statusDotSmall: { width: 8, height: 8, borderRadius: 4 },
  statusBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  journeyCard: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md, marginBottom: Spacing.lg },
  routeRow: { flexDirection: 'row', gap: Spacing.lg },
  routeDots: { alignItems: 'center', paddingTop: 4 },
  routeDot: { width: 12, height: 12, borderRadius: 6 },
  routeLine: { width: 2, flex: 1, backgroundColor: Colors.border, marginVertical: 4 },
  locationItem: {},
  locationLabel: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textLight, marginBottom: 2 },
  locationAddress: { fontSize: FontSize.base, fontWeight: '500', color: Colors.textPrimary },
  journeyMeta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xl, paddingTop: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  metaText: { fontSize: FontSize.xs, color: Colors.textMid },
  sosButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.danger, borderRadius: BorderRadius.xl, paddingVertical: Spacing.lg, ...Shadows.lg },
  sosButtonText: { fontSize: FontSize.md, fontWeight: '700', color: Colors.white },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.lg },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.textMid, textAlign: 'center', marginTop: Spacing.sm, marginHorizontal: Spacing.xl },
  startButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, marginTop: Spacing.xl, ...Shadows.md },
  startButtonText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.white },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, marginBottom: Spacing.xl, ...Shadows.md },
  addButtonText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.white },
  contactCard: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.md, ...Shadows.sm },
  contactHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  contactName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  emergencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.dangerLight, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  emergencyBadgeText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.danger },
  contactRelation: { fontSize: FontSize.sm, color: Colors.textMid, marginTop: 2 },
  deleteBtn: { padding: Spacing.sm },
  contactDetails: { gap: Spacing.sm, marginBottom: Spacing.md },
  contactDetailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  contactDetailText: { fontSize: FontSize.sm, color: Colors.textMid },
  contactToggles: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  toggleLabel: { fontSize: FontSize.sm, color: Colors.textMid },
  togglePill: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  togglePillOn: { backgroundColor: Colors.safe + '20' },
  togglePillOff: { backgroundColor: Colors.sectionBg },
  togglePillText: { fontSize: FontSize.xs, fontWeight: '600' },
  togglePillTextOn: { color: Colors.safe },
  togglePillTextOff: { color: Colors.textLight },
  historyEntry: { flexDirection: 'row', marginBottom: 0 },
  timelineLine: { alignItems: 'center', width: 30, paddingTop: 4 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineConnector: { width: 2, flex: 1, backgroundColor: Colors.border, marginTop: 4 },
  historyContent: { flex: 1, backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.md, marginLeft: Spacing.sm, ...Shadows.sm },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  historyRoute: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  statusBadgeSmall: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  statusBadgeSmallText: { fontSize: FontSize.xs, fontWeight: '600' },
  historyMeta: { flexDirection: 'row', gap: Spacing.lg },
  historyMetaText: { fontSize: FontSize.xs, color: Colors.textMid },
  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, padding: Spacing.lg, marginBottom: Spacing.sm, ...Shadows.sm },
  settingLabel: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  settingDesc: { fontSize: FontSize.xs, color: Colors.textMid, marginTop: 2 },
  testSOSButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, borderWidth: 2, borderColor: Colors.warning, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, marginTop: Spacing.xl },
  testSOSText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.warning },
});
