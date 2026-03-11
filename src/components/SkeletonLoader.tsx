import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../theme/colors';

type SkeletonVariant = 'card' | 'list' | 'chart';

interface SkeletonLoaderProps {
  variant: SkeletonVariant;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant }) => {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const shimmerStyle = { opacity: shimmerAnim };

  if (variant === 'card') {
    return (
      <View style={styles.cardContainer}>
        <Animated.View style={[styles.cardBlock, shimmerStyle]} />
      </View>
    );
  }

  if (variant === 'list') {
    return (
      <View style={styles.listContainer}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.listRow}>
            <Animated.View style={[styles.listCircle, shimmerStyle]} />
            <View style={styles.listLines}>
              <Animated.View style={[styles.listLineShort, shimmerStyle]} />
              <Animated.View style={[styles.listLineLong, shimmerStyle]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  // chart
  return (
    <View style={styles.chartContainer}>
      <Animated.View style={[styles.chartBlock, shimmerStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  // Card variant
  cardContainer: {
    padding: Spacing.lg,
  },
  cardBlock: {
    height: 120,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.lg,
  },

  // List variant
  listContainer: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  listCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.border,
  },
  listLines: {
    flex: 1,
    gap: Spacing.sm,
  },
  listLineShort: {
    height: 12,
    width: '50%',
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },
  listLineLong: {
    height: 12,
    width: '80%',
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
  },

  // Chart variant
  chartContainer: {
    padding: Spacing.lg,
  },
  chartBlock: {
    height: 200,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.lg,
  },
});

export default SkeletonLoader;
