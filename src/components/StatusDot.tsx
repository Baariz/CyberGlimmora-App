import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';

type DotStatus = 'active' | 'warning' | 'offline';

interface StatusDotProps {
  status: DotStatus;
  label?: string;
}

const statusColors: Record<DotStatus, string> = {
  active: Colors.safe,
  warning: Colors.warning,
  offline: Colors.textLight,
};

const StatusDot: React.FC<StatusDotProps> = ({ status, label }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'active') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const dotColor = statusColors[status];

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: dotColor },
          status === 'active' && { opacity: pulseAnim },
        ]}
      />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
  },
  label: {
    fontSize: FontSize.sm,
    color: Colors.textMid,
  },
});

export default StatusDot;
