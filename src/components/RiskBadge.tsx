import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize } from '../theme/colors';

type RiskLevel = 'high' | 'medium' | 'low' | 'safe';
type BadgeSize = 'sm' | 'md';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: BadgeSize;
}

const levelConfig: Record<RiskLevel, { bg: string; text: string; dot: string; label: string }> = {
  high: {
    bg: Colors.dangerLight,
    text: Colors.dangerDark,
    dot: Colors.danger,
    label: 'High',
  },
  medium: {
    bg: Colors.warningLight,
    text: Colors.warningDark,
    dot: Colors.warning,
    label: 'Medium',
  },
  low: {
    bg: Colors.infoLight,
    text: Colors.infoDark,
    dot: Colors.info,
    label: 'Low',
  },
  safe: {
    bg: Colors.safeLight,
    text: Colors.safeDark,
    dot: Colors.safe,
    label: 'Safe',
  },
};

const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const config = levelConfig[level];
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.bg },
        isSm ? styles.containerSm : styles.containerMd,
      ]}
    >
      <View
        style={[
          styles.dot,
          { backgroundColor: config.dot },
          isSm ? styles.dotSm : styles.dotMd,
        ]}
      />
      <Text
        style={[
          styles.text,
          { color: config.text },
          isSm ? styles.textSm : styles.textMd,
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  containerSm: {
    paddingVertical: 2,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  containerMd: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    gap: 6,
  },
  dot: {
    borderRadius: BorderRadius.full,
  },
  dotSm: {
    width: 6,
    height: 6,
  },
  dotMd: {
    width: 8,
    height: 8,
  },
  text: {
    fontWeight: '600',
  },
  textSm: {
    fontSize: FontSize.xs,
  },
  textMd: {
    fontSize: FontSize.sm,
  },
});

export default RiskBadge;
