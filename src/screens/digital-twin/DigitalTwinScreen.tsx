import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing, FontSize } from '../../theme/colors';
import { timeAgo, getSeverityColor } from '../../utils/helpers';
import { getTwinStatus, getDeviceTwins, getPredictions } from '../../services';
import type { TwinStatus, DeviceTwin, TwinPrediction, ThreatCategory } from '../../types';

const CATEGORY_LABELS: Record<ThreatCategory, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  device: { label: 'Device', icon: 'phone-portrait-outline', color: Colors.info },
  identity: { label: 'Identity', icon: 'finger-print-outline', color: Colors.danger },
  financial: { label: 'Financial', icon: 'wallet-outline', color: Colors.warning },
  behavior: { label: 'Behavior', icon: 'analytics-outline', color: Colors.primaryMid },
};

export default function DigitalTwinScreen() {
  const [status, setStatus] = useState<TwinStatus | null>(null);
  const [twins, setTwins] = useState<DeviceTwin[]>([]);
  const [predictions, setPredictions] = useState<TwinPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<ThreatCategory | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    Promise.all([getTwinStatus(), getDeviceTwins(), getPredictions()]).then(([s, t, p]) => {
      setStatus(s);
      setTwins(t);
      setPredictions(p);
      setLoading(false);
    });
  }, []);

  function handleSimulation() {
    setSimulating(true);
    setTimeout(() => setSimulating(false), 3000);
  }

  if (loading || !status) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const twin = twins[0];
  const sortedPredictions = [...predictions].sort((a, b) => b.probability - a.probability);
  const categories: ThreatCategory[] = ['device', 'identity', 'financial', 'behavior'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Digital Twin</Text>
            <View style={styles.syncRow}>
              <Ionicons name="sync-outline" size={14} color={Colors.safe} />
              <Text style={styles.syncText}>Synced {timeAgo(status.syncedAt)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.simButton, simulating && styles.simButtonActive]}
            onPress={handleSimulation}
            disabled={simulating}
          >
            {simulating ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="flash-outline" size={16} color={Colors.white} />
                <Text style={styles.simButtonText}>Run Simulation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{status.healthScore}</Text>
            <Text style={styles.statLabel}>Health</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{status.activePredictions}</Text>
            <Text style={styles.statLabel}>Predictions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{status.devicesMonitored}</Text>
            <Text style={styles.statLabel}>Devices</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{status.simulationVersion}</Text>
            <Text style={styles.statLabel}>Version</Text>
          </View>
        </View>
      </View>

      {/* Device Stage */}
      {twin && (
        <>
          <View style={styles.deviceStage}>
            <View style={styles.deviceIcon}>
              <Ionicons name="phone-portrait" size={64} color={Colors.primary} />
            </View>
            <View style={styles.deviceInfo}>
              <Text style={styles.deviceName}>{twin.name}</Text>
              <Text style={styles.deviceOs}>{twin.os}</Text>
              <View style={[styles.riskBadge, { backgroundColor: getSeverityColor(twin.overallRisk) + '20' }]}>
                <Text style={[styles.riskBadgeText, { color: getSeverityColor(twin.overallRisk) }]}>
                  {twin.overallRisk.toUpperCase()} RISK
                </Text>
              </View>
            </View>
          </View>

          {/* Threat Categories */}
          <Text style={styles.sectionTitle}>Threat Categories</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => {
              const info = CATEGORY_LABELS[cat];
              const threat = twin.threats[cat];
              const prob = Math.round(threat.probability * 100);
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryCard, expandedCategory === cat && styles.categoryCardActive]}
                  onPress={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.categoryIconBg, { backgroundColor: info.color + '15' }]}>
                    <Ionicons name={info.icon as any} size={24} color={info.color} />
                  </View>
                  <Text style={styles.categoryLabel}>{info.label}</Text>
                  <View style={styles.probBarBg}>
                    <View style={[styles.probBarFill, { width: `${prob}%`, backgroundColor: prob >= 60 ? Colors.danger : prob >= 35 ? Colors.warning : Colors.safe }]} />
                  </View>
                  <Text style={[styles.probText, { color: prob >= 60 ? Colors.danger : prob >= 35 ? Colors.warning : Colors.safe }]}>
                    {prob}%
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Expanded Threat Details */}
          {expandedCategory && twin.threats[expandedCategory] && (
            <View style={styles.expandedCard}>
              <View style={styles.expandedHeader}>
                <Ionicons name={CATEGORY_LABELS[expandedCategory].icon as any} size={20} color={CATEGORY_LABELS[expandedCategory].color} />
                <Text style={styles.expandedTitle}>{CATEGORY_LABELS[expandedCategory].label} Threat Details</Text>
              </View>
              <Text style={styles.expandedPrediction}>{twin.threats[expandedCategory].prediction}</Text>
              <View style={styles.expandedMeta}>
                <Text style={styles.expandedMetaText}>Time to Impact: {twin.threats[expandedCategory].timeToImpact}</Text>
              </View>

              <Text style={styles.expandedSubTitle}>Impact Assessment</Text>
              <View style={styles.impactRow}>
                <Text style={styles.impactLabel}>Accounts at risk:</Text>
                <Text style={styles.impactValue}>{twin.threats[expandedCategory].impact.accountsExposed}</Text>
              </View>
              <View style={styles.impactRow}>
                <Text style={styles.impactLabel}>Financial loss:</Text>
                <Text style={styles.impactValue}>
                  Rs {twin.threats[expandedCategory].impact.financialLoss.min.toLocaleString()} - Rs {twin.threats[expandedCategory].impact.financialLoss.max.toLocaleString()}
                </Text>
              </View>
              <View style={styles.dataPills}>
                {twin.threats[expandedCategory].impact.dataAtRisk.map((d, i) => (
                  <View key={i} style={styles.dataPill}>
                    <Text style={styles.dataPillText}>{d}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.expandedSubTitle}>Prevention Steps</Text>
              {twin.threats[expandedCategory].prevention.map((step, i) => (
                <View key={i} style={styles.preventionRow}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={Colors.primary} />
                  <Text style={styles.preventionText}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}

      {/* Prediction Feed */}
      <Text style={styles.sectionTitle}>Prediction Feed</Text>
      {sortedPredictions.map((pred) => {
        const catInfo = CATEGORY_LABELS[pred.category];
        const prob = Math.round(pred.probability * 100);
        return (
          <View key={pred.id} style={styles.predictionCard}>
            <View style={styles.predictionHeader}>
              <View style={[styles.predCatBadge, { backgroundColor: catInfo.color + '15' }]}>
                <Ionicons name={catInfo.icon as any} size={14} color={catInfo.color} />
                <Text style={[styles.predCatText, { color: catInfo.color }]}>{catInfo.label}</Text>
              </View>
              <View style={[styles.riskBadge, { backgroundColor: getSeverityColor(pred.riskLevel) + '20' }]}>
                <Text style={[styles.riskBadgeText, { color: getSeverityColor(pred.riskLevel) }]}>
                  {pred.riskLevel.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.predTitle}>{pred.title}</Text>
            <Text style={styles.predExplanation}>{pred.explanation}</Text>
            <View style={styles.predMeta}>
              <Text style={styles.predMetaText}>Probability: {prob}%</Text>
              <Text style={styles.predMetaText}>Confidence: {pred.confidence}%</Text>
              <Text style={styles.predMetaText}>Impact: {pred.timeToImpact}</Text>
            </View>
            <View style={styles.predBarBg}>
              <View style={[styles.predBarFill, { width: `${prob}%`, backgroundColor: prob >= 60 ? Colors.danger : prob >= 35 ? Colors.warning : Colors.safe }]} />
            </View>
          </View>
        );
      })}

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg, paddingTop: Spacing['4xl'] + 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.pageBg },
  headerCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.textPrimary },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.xs },
  syncText: { fontSize: FontSize.xs, color: Colors.safe },
  simButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  simButtonActive: { opacity: 0.7 },
  simButtonText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.white },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: Colors.pageBg, borderRadius: BorderRadius.lg, padding: Spacing.md },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMid, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border },
  deviceStage: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.navbarBg, marginHorizontal: Spacing.xl, marginTop: Spacing.lg, borderRadius: BorderRadius.xl, padding: Spacing.xl },
  deviceIcon: { width: 80, height: 120, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.xl },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.white },
  deviceOs: { fontSize: FontSize.sm, color: Colors.textLight, marginTop: 2 },
  riskBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm, marginTop: Spacing.sm },
  riskBadgeText: { fontSize: FontSize.xs, fontWeight: '700' },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: Spacing.xl, gap: Spacing.md },
  categoryCard: { width: '47%', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.lg, alignItems: 'center', ...Shadows.sm, borderWidth: 2, borderColor: Colors.transparent },
  categoryCardActive: { borderColor: Colors.primary },
  categoryIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
  categoryLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.sm },
  probBarBg: { width: '100%', height: 6, backgroundColor: Colors.sectionBg, borderRadius: 3, overflow: 'hidden' },
  probBarFill: { height: 6, borderRadius: 3 },
  probText: { fontSize: FontSize.sm, fontWeight: '700', marginTop: Spacing.xs },
  expandedCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginTop: Spacing.md, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md },
  expandedHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  expandedTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  expandedPrediction: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 22, marginBottom: Spacing.md },
  expandedMeta: { marginBottom: Spacing.md },
  expandedMetaText: { fontSize: FontSize.sm, color: Colors.textMid },
  expandedSubTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  impactRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
  impactLabel: { fontSize: FontSize.sm, color: Colors.textMid },
  impactValue: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary },
  dataPills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  dataPill: { backgroundColor: Colors.sectionBg, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  dataPillText: { fontSize: FontSize.xs, color: Colors.textMid },
  preventionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  preventionText: { fontSize: FontSize.sm, color: Colors.textMid, flex: 1 },
  predictionCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.md, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.sm },
  predictionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  predCatBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  predCatText: { fontSize: FontSize.xs, fontWeight: '600' },
  predTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  predExplanation: { fontSize: FontSize.sm, color: Colors.textMid, lineHeight: 18, marginBottom: Spacing.md },
  predMeta: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.sm },
  predMetaText: { fontSize: FontSize.xs, color: Colors.textLight },
  predBarBg: { height: 4, backgroundColor: Colors.sectionBg, borderRadius: 2, overflow: 'hidden' },
  predBarFill: { height: 4, borderRadius: 2 },
});
