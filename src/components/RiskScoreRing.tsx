import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors, FontSize } from '../theme/colors';

interface RiskScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

const getScoreColor = (score: number, maxScore: number): string => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 70) return Colors.safe;
  if (percentage >= 50) return Colors.warning;
  return Colors.danger;
};

const RiskScoreRing: React.FC<RiskScoreRingProps> = ({
  score,
  maxScore = 100,
  size = 120,
  strokeWidth = 10,
  label,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(score, maxScore));
  const progress = (clampedScore / maxScore) * circumference;
  const strokeDashoffset = circumference - progress;
  const color = getScoreColor(score, maxScore);
  const center = size / 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.scoreText, { color }]}>{clampedScore}</Text>
        {label ? <Text style={styles.labelText}>{label}</Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: FontSize['2xl'],
    fontWeight: '700',
  },
  labelText: {
    fontSize: FontSize.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
});

export default RiskScoreRing;
