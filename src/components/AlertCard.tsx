import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing, FontSize } from '../theme/colors';
import RiskBadge from './RiskBadge';

type Severity = 'high' | 'medium' | 'low' | 'safe';

interface AlertCardProps {
  title: string;
  description: string;
  severity: Severity;
  time: string;
  source?: string;
  action?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

const severityConfig: Record<Severity, { borderColor: string; icon: keyof typeof Ionicons.glyphMap; iconColor: string }> = {
  high: {
    borderColor: Colors.danger,
    icon: 'alert-circle',
    iconColor: Colors.danger,
  },
  medium: {
    borderColor: Colors.warning,
    icon: 'warning',
    iconColor: Colors.warning,
  },
  low: {
    borderColor: Colors.info,
    icon: 'information-circle',
    iconColor: Colors.info,
  },
  safe: {
    borderColor: Colors.safe,
    icon: 'checkmark-circle',
    iconColor: Colors.safe,
  },
};

const AlertCard: React.FC<AlertCardProps> = ({
  title,
  description,
  severity,
  time,
  source,
  action,
  onAction,
  onDismiss,
}) => {
  const config = severityConfig[severity];

  return (
    <View style={[styles.card, { borderLeftColor: config.borderColor }, Shadows.md]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name={config.icon} size={20} color={config.iconColor} />
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <RiskBadge level={severity} size="sm" />
          <Text style={styles.time}>{time}</Text>
        </View>
      </View>

      <Text style={styles.description}>{description}</Text>

      {source ? <Text style={styles.source}>Source: {source}</Text> : null}

      {(action || onDismiss) && (
        <View style={styles.actions}>
          {action && onAction && (
            <TouchableOpacity style={styles.actionButton} onPress={onAction} activeOpacity={0.7}>
              <Text style={styles.actionText}>{action}</Text>
            </TouchableOpacity>
          )}
          {onDismiss && (
            <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} activeOpacity={0.7}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textMid,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  source: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginBottom: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  actionButton: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.primary,
  },
  dismissButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  dismissText: {
    fontSize: FontSize.sm,
    color: Colors.textLight,
  },
});

export default AlertCard;
