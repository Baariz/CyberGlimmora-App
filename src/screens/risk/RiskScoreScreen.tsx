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
import Svg, { Circle, Polyline } from 'react-native-svg';
import { Colors, Shadows, BorderRadius, Spacing, FontSize } from '../../theme/colors';
import { getScoreColor, getScoreLabel, getSeverityColor } from '../../utils/helpers';
import { getRiskScore, getImprovementActions } from '../../services';
import type { RiskScore, ImprovementAction } from '../../types';

export default function RiskScoreScreen() {
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [actions, setActions] = useState<ImprovementAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRiskScore(), getImprovementActions()]).then(([rs, acts]) => {
      setRiskScore(rs);
      setActions(acts);
      setLoading(false);
    });
  }, []);

  if (loading || !riskScore) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const scoreColor = getScoreColor(riskScore.overall);
  const scoreLabel = getScoreLabel(riskScore.overall);
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (riskScore.overall / 100) * circumference;

  function toggleAction(id: string) {
    setActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  }

  const difficultyColors: Record<string, string> = {
    easy: Colors.safe,
    medium: Colors.warning,
    hard: Colors.danger,
  };

  // Simple line chart coordinates
  const chartWidth = 280;
  const chartHeight = 100;
  const history = riskScore.history;
  const minScore = Math.min(...history.map((h) => h.score));
  const maxScore = Math.max(...history.map((h) => h.score));
  const range = maxScore - minScore || 1;
  const points = history
    .map((h, i) => {
      const x = (i / (history.length - 1)) * chartWidth;
      const y = chartHeight - ((h.score - minScore) / range) * (chartHeight - 20) - 10;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Card */}
      <View style={styles.heroCard}>
        <Svg width={160} height={160} viewBox="0 0 160 160">
          <Circle
            cx="80"
            cy="80"
            r="60"
            stroke={Colors.sectionBg}
            strokeWidth="10"
            fill="none"
          />
          <Circle
            cx="80"
            cy="80"
            r="60"
            stroke={scoreColor}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="80, 80"
          />
        </Svg>
        <View style={styles.scoreOverlay}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>{riskScore.overall}</Text>
          <Text style={styles.scoreMax}>/ {riskScore.maxScore}</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: scoreColor }]}>{scoreLabel}</Text>
        <Text style={styles.scoreSubtext}>Your overall cyber risk score</Text>
      </View>

      {/* Factor Breakdown */}
      <Text style={styles.sectionTitle}>Risk Factors</Text>
      {riskScore.factors.map((factor) => (
        <View key={factor.id} style={styles.factorCard}>
          <View style={styles.factorHeader}>
            <Text style={styles.factorName}>{factor.name}</Text>
            <View style={[styles.impactBadge, { backgroundColor: getSeverityColor(factor.impact) + '20' }]}>
              <Text style={[styles.impactText, { color: getSeverityColor(factor.impact) }]}>
                {factor.impact.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.factorDesc}>{factor.description}</Text>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${(factor.score / factor.maxScore) * 100}%`,
                    backgroundColor: getScoreColor((factor.score / factor.maxScore) * 100),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {factor.score}/{factor.maxScore}
            </Text>
          </View>
        </View>
      ))}

      {/* Improvement Actions */}
      <Text style={styles.sectionTitle}>Improvement Actions</Text>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[styles.actionCard, action.completed && styles.actionCardCompleted]}
          onPress={() => toggleAction(action.id)}
          activeOpacity={0.7}
        >
          <View style={styles.actionCheckbox}>
            <Ionicons
              name={action.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={24}
              color={action.completed ? Colors.safe : Colors.textLight}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionTitle, action.completed && styles.actionTitleCompleted]}>
              {action.title}
            </Text>
            <Text style={styles.actionDesc}>{action.description}</Text>
            <View style={styles.actionMeta}>
              <View style={[styles.difficultyBadge, { backgroundColor: (difficultyColors[action.difficulty] || Colors.textLight) + '20' }]}>
                <Text style={[styles.difficultyText, { color: difficultyColors[action.difficulty] || Colors.textLight }]}>
                  {action.difficulty.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.pointsText}>+{action.impact} pts</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Score History */}
      <Text style={styles.sectionTitle}>Score History</Text>
      <View style={styles.chartCard}>
        <Svg width={chartWidth} height={chartHeight} style={{ alignSelf: 'center' }}>
          <Polyline
            points={points}
            fill="none"
            stroke={Colors.primary}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {history.map((h, i) => {
            const x = (i / (history.length - 1)) * chartWidth;
            const y = chartHeight - ((h.score - minScore) / range) * (chartHeight - 20) - 10;
            return (
              <Circle key={i} cx={x} cy={y} r="4" fill={Colors.primary} />
            );
          })}
        </Svg>
        <View style={styles.chartLabels}>
          {history.map((h, i) => (
            <View key={i} style={styles.chartLabelItem}>
              <Text style={styles.chartLabelScore}>{h.score}</Text>
              <Text style={styles.chartLabelDate}>{h.date.slice(5, 7)}/{h.date.slice(2, 4)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg, paddingTop: Spacing['4xl'] + 10 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.pageBg },
  heroCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', ...Shadows.lg },
  scoreOverlay: { position: 'absolute', top: 75, alignItems: 'center' },
  scoreValue: { fontSize: FontSize['4xl'], fontWeight: '700' },
  scoreMax: { fontSize: FontSize.sm, color: Colors.textMid },
  scoreLabel: { fontSize: FontSize.lg, fontWeight: '600', marginTop: Spacing.sm },
  scoreSubtext: { fontSize: FontSize.sm, color: Colors.textMid, marginTop: Spacing.xs },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginHorizontal: Spacing.xl, marginTop: Spacing.xl, marginBottom: Spacing.md },
  factorCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadows.sm },
  factorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  factorName: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  impactBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  impactText: { fontSize: FontSize.xs, fontWeight: '600' },
  factorDesc: { fontSize: FontSize.sm, color: Colors.textMid, lineHeight: 18, marginBottom: Spacing.md },
  progressBarContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  progressBarBg: { flex: 1, height: 8, backgroundColor: Colors.sectionBg, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4 },
  progressLabel: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textMid, width: 40, textAlign: 'right' },
  actionCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, marginBottom: Spacing.md, borderRadius: BorderRadius.lg, padding: Spacing.lg, ...Shadows.sm },
  actionCardCompleted: { opacity: 0.7 },
  actionCheckbox: { marginRight: Spacing.md, marginTop: 2 },
  actionTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  actionTitleCompleted: { textDecorationLine: 'line-through', color: Colors.textLight },
  actionDesc: { fontSize: FontSize.sm, color: Colors.textMid, marginTop: 2, lineHeight: 18 },
  actionMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  difficultyBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  difficultyText: { fontSize: FontSize.xs, fontWeight: '600' },
  pointsText: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.primary },
  chartCard: { backgroundColor: Colors.cardBg, marginHorizontal: Spacing.xl, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.sm },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  chartLabelItem: { alignItems: 'center' },
  chartLabelScore: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.primary },
  chartLabelDate: { fontSize: FontSize.xs, color: Colors.textLight, marginTop: 2 },
});
