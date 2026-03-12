import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing, FontSize } from '../../theme/colors';
import { useAuth } from '../../contexts/AuthContext';
import { useAlerts } from '../../contexts/AlertContext';
import { getGreeting, timeAgo, getSeverityColor } from '../../utils/helpers';

const QUICK_ACTIONS = [
  { id: 'scan', icon: 'scan-outline' as const, label: 'Scan Message', screen: 'ScamDetection' },
  { id: 'identity', icon: 'finger-print-outline' as const, label: 'Check Identity', screen: 'Identity' },
  { id: 'privacy', icon: 'eye-off-outline' as const, label: 'Privacy Audit', screen: 'Device' },
  { id: 'sos', icon: 'warning-outline' as const, label: 'SOS', screen: 'Journey' },
];

const MODULES = [
  { id: 'scam', icon: 'shield-checkmark-outline' as const, label: 'Scam Detection', color: Colors.danger, screen: 'ScamDetection' },
  { id: 'identity', icon: 'finger-print-outline' as const, label: 'Identity', color: Colors.info, screen: 'Identity' },
  { id: 'assistant', icon: 'chatbubble-ellipses-outline' as const, label: 'AI Assistant', color: Colors.primary, screen: 'Assistant' },
  { id: 'risk', icon: 'speedometer-outline' as const, label: 'Risk Score', color: Colors.warning, screen: 'RiskScore' },
  { id: 'device', icon: 'phone-portrait-outline' as const, label: 'Device', color: Colors.primaryMid, screen: 'Device' },
  { id: 'guardian', icon: 'people-outline' as const, label: 'Guardian', color: Colors.infoDark, screen: 'Guardian' },
  { id: 'journey', icon: 'navigate-outline' as const, label: 'Journey', color: Colors.safeDark, screen: 'Journey' },
  { id: 'twin', icon: 'git-network-outline' as const, label: 'Digital Twin', color: Colors.primaryDark, screen: 'DigitalTwin' },
];

const STATS = [
  { label: 'Threats Blocked', value: '23', icon: 'shield-outline' as const, color: Colors.primary },
  { label: 'Breaches', value: '3', icon: 'alert-circle-outline' as const, color: Colors.danger },
  { label: 'Devices', value: '4', icon: 'phone-portrait-outline' as const, color: Colors.info },
  { label: 'Family', value: '3', icon: 'people-outline' as const, color: Colors.warning },
];

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const { alerts, threatLevel, activeCount } = useAlerts();

  const recentAlerts = alerts.slice(0, 4);

  const threatColors: Record<string, string> = {
    critical: Colors.danger,
    elevated: Colors.warning,
    normal: Colors.safe,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <View style={styles.greetingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={[styles.threatBadge, { backgroundColor: threatColors[threatLevel] + '20' }]}>
            <View style={[styles.threatDot, { backgroundColor: threatColors[threatLevel] }]} />
            <Text style={[styles.threatText, { color: threatColors[threatLevel] }]}>
              {threatLevel.charAt(0).toUpperCase() + threatLevel.slice(1)}
            </Text>
          </View>
        </View>
      </View>

      {/* Risk Score */}
      <View style={styles.riskCard}>
        <View style={styles.riskCircle}>
          <Text style={styles.riskScore}>61</Text>
          <Text style={styles.riskLabel}>/ 100</Text>
        </View>
        <View style={styles.riskInfo}>
          <Text style={styles.riskTitle}>Risk Score</Text>
          <Text style={styles.riskSubtitle}>Moderate - Room for improvement</Text>
          <TouchableOpacity
            style={styles.riskButton}
            onPress={() => navigation.navigate('RiskScore')}
          >
            <Text style={styles.riskButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {STATS.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon} size={20} color={stat.color} />
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickActionsScroll}
        contentContainerStyle={styles.quickActionsContent}
      >
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.quickAction}
            onPress={() => navigation.navigate(action.screen)}
            activeOpacity={0.7}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name={action.icon} size={24} color={Colors.primary} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Protection Modules */}
      <Text style={styles.sectionTitle}>Protection Modules</Text>
      <View style={styles.modulesGrid}>
        {MODULES.map((mod) => (
          <TouchableOpacity
            key={mod.id}
            style={styles.moduleCard}
            onPress={() => navigation.navigate(mod.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.moduleIcon, { backgroundColor: mod.color + '15' }]}>
              <Ionicons name={mod.icon} size={24} color={mod.color} />
            </View>
            <Text style={styles.moduleLabel}>{mod.label}</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.textLight} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Alerts */}
      <View style={styles.alertsHeader}>
        <Text style={styles.sectionTitle}>Recent Alerts</Text>
        {activeCount > 0 && (
          <View style={styles.alertCountBadge}>
            <Text style={styles.alertCountText}>{activeCount}</Text>
          </View>
        )}
      </View>
      {recentAlerts.map((alert) => (
        <View key={alert.id} style={styles.alertCard}>
          <View style={[styles.alertSeverityBar, { backgroundColor: getSeverityColor(alert.severity) }]} />
          <View style={styles.alertContent}>
            <View style={styles.alertTopRow}>
              <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
              <Text style={styles.alertTime}>{timeAgo(alert.time)}</Text>
            </View>
            <Text style={styles.alertDescription} numberOfLines={2}>{alert.description}</Text>
            <View style={styles.alertMeta}>
              <View style={[styles.severityPill, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
                <Text style={[styles.severityPillText, { color: getSeverityColor(alert.severity) }]}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.alertSource}>{alert.source}</Text>
            </View>
          </View>
        </View>
      ))}

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pageBg,
  },
  greetingSection: {
    backgroundColor: Colors.primaryDark,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['4xl'] + 20,
    paddingBottom: Spacing['2xl'],
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greetingText: {
    fontSize: FontSize.md,
    color: Colors.primaryLighter,
  },
  userName: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.white,
    marginTop: Spacing.xs,
  },
  threatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  threatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  threatText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  riskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.xl,
    marginTop: -Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.md,
  },
  riskCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  riskScore: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
    color: Colors.primary,
  },
  riskLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMid,
    marginTop: -2,
  },
  riskInfo: {
    flex: 1,
  },
  riskTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  riskSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMid,
    marginTop: Spacing.xs,
  },
  riskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  riskButtonText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMid,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },
  quickActionsScroll: {
    marginBottom: Spacing.sm,
  },
  quickActionsContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  quickAction: {
    alignItems: 'center',
    width: 80,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMid,
    textAlign: 'center',
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  moduleCard: {
    width: '47%',
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  moduleIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  alertCountBadge: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.full,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  alertCountText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.white,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: Colors.cardBg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  alertSeverityBar: {
    width: 4,
  },
  alertContent: {
    flex: 1,
    padding: Spacing.md,
  },
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  alertTitle: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  alertTime: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  alertDescription: {
    fontSize: FontSize.sm,
    color: Colors.textMid,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  severityPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  severityPillText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  alertSource: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
});
