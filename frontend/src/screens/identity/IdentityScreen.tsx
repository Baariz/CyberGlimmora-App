import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing, FontSize } from '../../theme/colors';
import { formatDate, getSeverityColor } from '../../utils/helpers';
import {
  getIdentityTwin,
  getBreaches,
  getExposureHistory,
  getRecoverySteps,
  markBreachResolved,
} from '../../services';
import type {
  IdentityTwin,
  BreachRecord,
  ExposureDataPoint,
  RecoveryStep,
} from '../../types';

export default function IdentityScreen() {
  const [twin, setTwin] = useState<IdentityTwin | null>(null);
  const [breaches, setBreaches] = useState<BreachRecord[]>([]);
  const [exposure, setExposure] = useState<ExposureDataPoint[]>([]);
  const [recovery, setRecovery] = useState<RecoveryStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const radarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Promise.all([
      getIdentityTwin(),
      getBreaches(),
      getExposureHistory(),
      getRecoverySteps(),
    ]).then(([t, b, e, r]) => {
      setTwin(t);
      setBreaches(b);
      setExposure(e);
      setRecovery(r);
      setLoading(false);
    });
  }, []);

  function startScan() {
    setScanning(true);
    Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
    setTimeout(() => {
      radarAnim.stopAnimation();
      radarAnim.setValue(0);
      setScanning(false);
    }, 4000);
  }

  async function handleResolve(breachId: string) {
    try {
      const updated = await markBreachResolved(breachId);
      setBreaches((prev) => prev.map((b) => (b.id === breachId ? updated : b)));
    } catch {}
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const maxDataPoints = Math.max(...exposure.map((e) => e.dataPoints), 1);

  const priorityColors: Record<string, string> = {
    immediate: Colors.danger,
    high: Colors.warning,
    medium: Colors.info,
    low: Colors.safe,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      {/* Identity Twin Card */}
      <View style={styles.twinCard}>
        <View style={styles.twinHeader}>
          <View style={styles.fingerprintCircle}>
            <Ionicons name="finger-print" size={36} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.twinTitle}>Identity Twin</Text>
            <Text style={styles.twinSubtitle}>Your digital identity monitor</Text>
          </View>
        </View>

        <View style={styles.twinStats}>
          <View style={styles.twinStat}>
            <Text style={styles.twinStatValue}>{twin?.totalBreaches}</Text>
            <Text style={styles.twinStatLabel}>Breaches</Text>
          </View>
          <View style={styles.twinStatDivider} />
          <View style={styles.twinStat}>
            <Text style={styles.twinStatValue}>{twin?.dataPointsExposed}</Text>
            <Text style={styles.twinStatLabel}>Data Points</Text>
          </View>
          <View style={styles.twinStatDivider} />
          <View style={styles.twinStat}>
            <Text style={styles.twinStatValue}>{twin?.monitoredEmails.length}</Text>
            <Text style={styles.twinStatLabel}>Monitored</Text>
          </View>
          <View style={styles.twinStatDivider} />
          <View style={styles.twinStat}>
            <Text style={styles.twinStatValue}>{twin?.impersonationAlerts}</Text>
            <Text style={styles.twinStatLabel}>Impersonation</Text>
          </View>
        </View>

        <View style={styles.monitoredSection}>
          <Text style={styles.monitoredLabel}>Monitored Emails</Text>
          {twin?.monitoredEmails.map((email, i) => (
            <View key={i} style={styles.monitoredRow}>
              <Ionicons name="mail-outline" size={14} color={Colors.textMid} />
              <Text style={styles.monitoredText}>{email}</Text>
            </View>
          ))}
          <Text style={[styles.monitoredLabel, { marginTop: Spacing.md }]}>Monitored Phones</Text>
          {twin?.monitoredPhones.map((phone, i) => (
            <View key={i} style={styles.monitoredRow}>
              <Ionicons name="call-outline" size={14} color={Colors.textMid} />
              <Text style={styles.monitoredText}>{phone}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickCard}>
        <View style={styles.quickHeader}>
          <View>
            <Text style={styles.quickTitle}>Exposure Level</Text>
            <View style={[styles.exposureBadge, { backgroundColor: getSeverityColor(twin?.exposureLevel || 'medium') + '20' }]}>
              <Text style={[styles.exposureBadgeText, { color: getSeverityColor(twin?.exposureLevel || 'medium') }]}>
                {(twin?.exposureLevel || 'medium').toUpperCase()} - Score: {twin?.exposureScore}
              </Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.scanButton} onPress={startScan} disabled={scanning}>
          <Animated.View style={[styles.radarIcon, { transform: [{ rotate: radarAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
            <Ionicons name="radio-outline" size={20} color={Colors.white} />
          </Animated.View>
          <Text style={styles.scanButtonText}>
            {scanning ? 'Scanning Dark Web...' : 'Run Dark Web Scan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exposure Timeline */}
      <Text style={styles.sectionTitle}>Exposure Timeline</Text>
      <View style={styles.timelineCard}>
        {exposure.map((e, i) => (
          <View key={i} style={styles.timelineRow}>
            <Text style={styles.timelineMonth}>{e.month.split(' ')[0]}</Text>
            <View style={styles.timelineBarBg}>
              <View style={[styles.timelineBarFill, { width: `${(e.dataPoints / maxDataPoints) * 100}%` }]} />
            </View>
            <Text style={styles.timelineValue}>{e.dataPoints}</Text>
          </View>
        ))}
      </View>

      {/* Breach Cards */}
      <Text style={styles.sectionTitle}>Data Breaches</Text>
      {breaches.map((breach) => (
        <View key={breach.id} style={styles.breachCard}>
          <View style={styles.breachHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.breachName}>{breach.serviceName}</Text>
              <Text style={styles.breachDate}>Breached: {formatDate(breach.breachDate)}</Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(breach.severity) + '20' }]}>
              <Text style={[styles.severityBadgeText, { color: getSeverityColor(breach.severity) }]}>
                {breach.severity.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.dataPills}>
            {breach.dataExposed.map((data, i) => (
              <View key={i} style={styles.dataPill}>
                <Text style={styles.dataPillText}>{data}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.recoveryLabel}>Recovery Steps</Text>
          {breach.recoverySteps.map((step, i) => (
            <View key={i} style={styles.recoveryRow}>
              <Ionicons name="checkmark-circle-outline" size={14} color={Colors.primary} />
              <Text style={styles.recoveryText}>{step}</Text>
            </View>
          ))}

          {!breach.isResolved ? (
            <TouchableOpacity style={styles.resolveButton} onPress={() => handleResolve(breach.id)}>
              <Ionicons name="checkmark-done" size={16} color={Colors.white} />
              <Text style={styles.resolveButtonText}>Mark Resolved</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.resolvedBadge}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.safe} />
              <Text style={styles.resolvedText}>Resolved</Text>
            </View>
          )}
        </View>
      ))}

      {/* Recovery Guide */}
      <Text style={styles.sectionTitle}>Recovery Guide</Text>
      <View style={styles.recoveryGuide}>
        {recovery.map((step) => (
          <View key={step.id} style={styles.guideRow}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColors[step.priority] || Colors.textLight }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.guideTitle}>{step.title}</Text>
              <Text style={styles.guideDesc}>{step.description}</Text>
              <View style={styles.guideMeta}>
                <View style={[styles.priorityBadge, { backgroundColor: (priorityColors[step.priority] || Colors.textLight) + '20' }]}>
                  <Text style={[styles.priorityBadgeText, { color: priorityColors[step.priority] || Colors.textLight }]}>
                    {step.priority.toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.guideRelated}>{step.relatedBreach}</Text>
              </View>
            </View>
            {step.completed && <Ionicons name="checkmark-circle" size={20} color={Colors.safe} />}
          </View>
        ))}
      </View>

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg, paddingTop: Spacing['4xl'] + 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.pageBg },
  twinCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md },
  twinHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  fingerprintCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.lg },
  twinTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  twinSubtitle: { fontSize: FontSize.sm, color: Colors.textMid, marginTop: 2 },
  twinStats: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.pageBg, borderRadius: BorderRadius.lg, padding: Spacing.md },
  twinStat: { alignItems: 'center', flex: 1 },
  twinStatValue: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  twinStatLabel: { fontSize: FontSize.xs, color: Colors.textMid, marginTop: 2 },
  twinStatDivider: { width: 1, backgroundColor: Colors.border },
  monitoredSection: { marginTop: Spacing.lg },
  monitoredLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  monitoredRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xs },
  monitoredText: { fontSize: FontSize.sm, color: Colors.textMid },
  quickCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginTop: Spacing.lg, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md },
  quickHeader: { marginBottom: Spacing.lg },
  quickTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  exposureBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  exposureBadgeText: { fontSize: FontSize.sm, fontWeight: '600' },
  scanButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, ...Shadows.md },
  radarIcon: {},
  scanButtonText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.white },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md },
  timelineCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.sm },
  timelineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  timelineMonth: { width: 36, fontSize: FontSize.xs, color: Colors.textMid, fontWeight: '500' },
  timelineBarBg: { flex: 1, height: 12, backgroundColor: Colors.sectionBg, borderRadius: 6, marginHorizontal: Spacing.sm, overflow: 'hidden' },
  timelineBarFill: { height: 12, backgroundColor: Colors.primary, borderRadius: 6 },
  timelineValue: { width: 24, fontSize: FontSize.xs, color: Colors.textMid, textAlign: 'right' },
  breachCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.lg, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md },
  breachHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md },
  breachName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  breachDate: { fontSize: FontSize.xs, color: Colors.textMid, marginTop: 2 },
  severityBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  severityBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  dataPills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  dataPill: { backgroundColor: Colors.sectionBg, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  dataPillText: { fontSize: FontSize.xs, color: Colors.textMid },
  recoveryLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  recoveryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.xs },
  recoveryText: { fontSize: FontSize.sm, color: Colors.textMid, flex: 1 },
  resolveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.sm, marginTop: Spacing.md },
  resolveButtonText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.white },
  resolvedBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
  resolvedText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.safe },
  recoveryGuide: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.sm },
  guideRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  priorityDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4, marginRight: Spacing.md },
  guideTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  guideDesc: { fontSize: FontSize.xs, color: Colors.textMid, marginTop: 2 },
  guideMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  priorityBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 1, borderRadius: BorderRadius.sm },
  priorityBadgeText: { fontSize: FontSize.xs, fontWeight: '600' },
  guideRelated: { fontSize: FontSize.xs, color: Colors.textLight },
});
