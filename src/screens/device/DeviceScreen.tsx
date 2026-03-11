import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing, FontSize } from '../../theme/colors';
import { timeAgo, getSeverityColor, formatTime } from '../../utils/helpers';
import {
  getDeviceStatus,
  getAppPermissions,
  getNetworkStatus,
  getPrivacyLogs,
  getScamMessages,
} from '../../services';
import type {
  DeviceStatus,
  AppPermission,
  NetworkStatus,
  PrivacyAccessLog,
  ScamMessage,
  MessageSource,
} from '../../types';

export default function DeviceScreen() {
  const [device, setDevice] = useState<DeviceStatus | null>(null);
  const [permissions, setPermissions] = useState<AppPermission[]>([]);
  const [network, setNetwork] = useState<NetworkStatus | null>(null);
  const [privacyLogs, setPrivacyLogs] = useState<PrivacyAccessLog[]>([]);
  const [scamMessages, setScamMessages] = useState<ScamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<'all' | MessageSource>('all');
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getDeviceStatus(),
      getAppPermissions(),
      getNetworkStatus(),
      getPrivacyLogs(),
      getScamMessages(),
    ]).then(([dev, perms, net, logs, msgs]) => {
      setDevice(dev);
      setPermissions(perms);
      setNetwork(net);
      setPrivacyLogs(logs);
      setScamMessages(msgs);
      setLoading(false);
    });
  }, []);

  function handleRevoke(appId: string) {
    setPermissions((prev) =>
      prev.map((p) => (p.id === appId ? { ...p, isRevoked: true } : p))
    );
  }

  function handleEmergencyLock() {
    Alert.alert(
      'Emergency Lock',
      'This will immediately lock your device and notify all trusted contacts. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Lock Device', style: 'destructive', onPress: () => Alert.alert('Device Locked', 'Your device has been locked and contacts notified.') },
      ]
    );
  }

  if (loading || !device) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const healthColor = device.healthScore >= 80 ? Colors.safe : device.healthScore >= 60 ? Colors.warning : Colors.danger;
  const checks = [
    { label: 'OS Up to Date', ok: device.osUpToDate },
    { label: 'Screen Lock', ok: device.screenLockEnabled },
    { label: 'Encryption', ok: device.encryptionEnabled },
    { label: 'No Root', ok: !device.rootDetected },
  ];

  const filteredMessages = sourceFilter === 'all' ? scamMessages : scamMessages.filter((m) => m.source === sourceFilter);
  const sourceFilters: ('all' | MessageSource)[] = ['all', 'sms', 'gmail', 'whatsapp', 'telegram'];

  const riskColors: Record<string, string> = {
    dangerous: Colors.danger,
    caution: Colors.warning,
    safe: Colors.safe,
  };

  const accessIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
    camera: 'camera-outline',
    microphone: 'mic-outline',
    location: 'location-outline',
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Device Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          <Ionicons name="phone-portrait-outline" size={40} color={Colors.primary} />
          <View style={{ flex: 1, marginLeft: Spacing.lg }}>
            <Text style={styles.deviceName}>{device.deviceName}</Text>
            <Text style={styles.deviceOs}>{device.osVersion}</Text>
          </View>
          <View style={styles.healthCircle}>
            <Text style={[styles.healthScore, { color: healthColor }]}>{device.healthScore}</Text>
            <Text style={styles.healthLabel}>Health</Text>
          </View>
        </View>

        <View style={styles.checksRow}>
          {checks.map((check, i) => (
            <View key={i} style={styles.checkItem}>
              <Ionicons
                name={check.ok ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={check.ok ? Colors.safe : Colors.danger}
              />
              <Text style={styles.checkLabel}>{check.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* App Permissions */}
      <Text style={styles.sectionTitle}>App Permissions</Text>
      {permissions.map((app) => (
        <View key={app.id} style={styles.permCard}>
          <View style={styles.permHeader}>
            <Ionicons name={app.appIcon as any} size={24} color={Colors.textPrimary} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.permAppName}>{app.appName}</Text>
              <Text style={styles.permAccess}>Last: {timeAgo(app.lastAccessed)}</Text>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: (riskColors[app.riskLevel] || Colors.textLight) + '20' }]}>
              <Text style={[styles.riskBadgeText, { color: riskColors[app.riskLevel] || Colors.textLight }]}>
                {app.riskLevel.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.permPills}>
            {app.permissions.map((perm, i) => (
              <View key={i} style={styles.permPill}>
                <Text style={styles.permPillText}>{perm}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.permRecommendation}>{app.recommendation}</Text>
          {!app.isRevoked && app.riskLevel !== 'safe' && (
            <TouchableOpacity style={styles.revokeButton} onPress={() => handleRevoke(app.id)}>
              <Text style={styles.revokeButtonText}>Revoke Risky Permissions</Text>
            </TouchableOpacity>
          )}
          {app.isRevoked && (
            <View style={styles.revokedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.safe} />
              <Text style={styles.revokedText}>Permissions Revoked</Text>
            </View>
          )}
        </View>
      ))}

      {/* Auto Scam Shield */}
      <View style={styles.shieldHeader}>
        <Text style={styles.sectionTitle}>Auto Scam Shield</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Source Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {sourceFilters.map((source) => (
          <TouchableOpacity
            key={source}
            style={[styles.filterPill, sourceFilter === source && styles.filterPillActive]}
            onPress={() => setSourceFilter(source)}
          >
            <Text style={[styles.filterPillText, sourceFilter === source && styles.filterPillTextActive]}>
              {source === 'all' ? 'All' : source.charAt(0).toUpperCase() + source.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filteredMessages.map((msg) => (
        <TouchableOpacity
          key={msg.id}
          style={styles.scamMsgCard}
          onPress={() => setExpandedMessage(expandedMessage === msg.id ? null : msg.id)}
          activeOpacity={0.7}
        >
          <View style={styles.scamMsgHeader}>
            <View style={[styles.sourceBadge, { backgroundColor: Colors.sectionBg }]}>
              <Text style={styles.sourceText}>{msg.source.toUpperCase()}</Text>
            </View>
            <Text style={styles.scamMsgSender} numberOfLines={1}>{msg.sender}</Text>
            <View style={[styles.severityDot, { backgroundColor: getSeverityColor(msg.severity) }]} />
          </View>
          {msg.subject && <Text style={styles.scamMsgSubject}>{msg.subject}</Text>}
          <Text style={styles.scamMsgPreview} numberOfLines={expandedMessage === msg.id ? undefined : 2}>
            {msg.preview}
          </Text>
          {expandedMessage === msg.id && (
            <View style={styles.scamMsgDetails}>
              <Text style={styles.scamDetailLabel}>Type: <Text style={styles.scamDetailValue}>{msg.scamType}</Text></Text>
              <Text style={styles.scamDetailLabel}>Confidence: <Text style={styles.scamDetailValue}>{msg.confidence}%</Text></Text>
              <Text style={styles.scamDetailLabel}>Detected: <Text style={styles.scamDetailValue}>{timeAgo(msg.detectedAt)}</Text></Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      {/* Privacy Access Logs */}
      <Text style={styles.sectionTitle}>Privacy Access Logs</Text>
      {privacyLogs.map((log) => (
        <View key={log.id} style={[styles.logRow, log.suspicious && styles.logRowSuspicious]}>
          <Ionicons name={accessIcons[log.accessType] || 'ellipse-outline'} size={20} color={log.suspicious ? Colors.danger : Colors.textMid} />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <Text style={styles.logApp}>{log.appName}</Text>
            <Text style={styles.logMeta}>
              {log.accessType} - {log.duration} - {formatTime(log.timestamp)}
            </Text>
          </View>
          {log.suspicious && (
            <View style={styles.suspiciousBadge}>
              <Ionicons name="warning" size={12} color={Colors.danger} />
              <Text style={styles.suspiciousText}>Suspicious</Text>
            </View>
          )}
        </View>
      ))}

      {/* Network Safety */}
      {network && (
        <>
          <Text style={styles.sectionTitle}>Network Safety</Text>
          <View style={styles.networkCard}>
            <View style={styles.networkHeader}>
              <Ionicons name="wifi-outline" size={24} color={getSeverityColor(network.riskLevel === 'secure' ? 'safe' : network.riskLevel === 'moderate' ? 'medium' : 'high')} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={styles.networkName}>{network.networkName}</Text>
                <Text style={styles.networkType}>{network.type.toUpperCase()} - {network.encryption}</Text>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: getSeverityColor(network.riskLevel === 'secure' ? 'safe' : 'medium') + '20' }]}>
                <Text style={[styles.riskBadgeText, { color: getSeverityColor(network.riskLevel === 'secure' ? 'safe' : 'medium') }]}>
                  {network.riskLevel.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.networkRecommendation}>{network.recommendation}</Text>
          </View>
        </>
      )}

      {/* Emergency Lock */}
      <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyLock}>
        <Ionicons name="lock-closed" size={20} color={Colors.white} />
        <Text style={styles.emergencyButtonText}>Emergency Lock Device</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg, paddingTop: Spacing['4xl'] + 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.pageBg },
  heroCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md },
  heroTop: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  deviceName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  deviceOs: { fontSize: FontSize.sm, color: Colors.textMid, marginTop: 2 },
  healthCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  healthScore: { fontSize: FontSize.lg, fontWeight: '700' },
  healthLabel: { fontSize: FontSize.xs, color: Colors.textMid },
  checksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  checkItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, width: '45%' },
  checkLabel: { fontSize: FontSize.sm, color: Colors.textMid },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md },
  permCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadows.sm },
  permHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  permAppName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  permAccess: { fontSize: FontSize.xs, color: Colors.textLight },
  riskBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  riskBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  permPills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  permPill: { backgroundColor: Colors.sectionBg, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  permPillText: { fontSize: FontSize.xs, color: Colors.textMid },
  permRecommendation: { fontSize: FontSize.sm, color: Colors.textMid, fontStyle: 'italic', marginBottom: Spacing.sm },
  revokeButton: { backgroundColor: Colors.danger + '15', borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, alignItems: 'center' },
  revokeButtonText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.danger },
  revokedBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  revokedText: { fontSize: FontSize.sm, color: Colors.safe, fontWeight: '500' },
  shieldHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginLeft: Spacing.sm, backgroundColor: Colors.safe + '20', borderRadius: BorderRadius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.safe },
  liveText: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.safe },
  filterScroll: { marginBottom: Spacing.md, paddingHorizontal: Spacing.xl },
  filterPill: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.sectionBg, marginRight: Spacing.sm },
  filterPillActive: { backgroundColor: Colors.primary },
  filterPillText: { fontSize: FontSize.sm, color: Colors.textMid, fontWeight: '500' },
  filterPillTextActive: { color: Colors.white },
  scamMsgCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.sm, borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadows.sm },
  scamMsgHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  sourceBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  sourceText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMid },
  scamMsgSender: { flex: 1, fontSize: FontSize.sm, fontWeight: '500', color: Colors.textPrimary },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  scamMsgSubject: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  scamMsgPreview: { fontSize: FontSize.sm, color: Colors.textMid, lineHeight: 18 },
  scamMsgDetails: { marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  scamDetailLabel: { fontSize: FontSize.xs, color: Colors.textLight, marginBottom: 2 },
  scamDetailValue: { color: Colors.textPrimary, fontWeight: '500' },
  logRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.sm, borderRadius: BorderRadius.lg, padding: Spacing.md, ...Shadows.sm },
  logRowSuspicious: { borderWidth: 1, borderColor: Colors.danger + '40' },
  logApp: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textPrimary },
  logMeta: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 2 },
  suspiciousBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.dangerLight, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  suspiciousText: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.danger },
  networkCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md },
  networkHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  networkName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  networkType: { fontSize: FontSize.xs, color: Colors.textMid },
  networkRecommendation: { fontSize: FontSize.sm, color: Colors.textMid },
  emergencyButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.danger, marginHorizontal: Spacing.xl, marginTop: Spacing.xl, borderRadius: BorderRadius.lg, paddingVertical: Spacing.lg, ...Shadows.md },
  emergencyButtonText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.white },
});
