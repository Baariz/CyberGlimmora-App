import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing, FontSize } from '../../theme/colors';
import { timeAgo, getSeverityColor } from '../../utils/helpers';
import {
  analyzeMessage,
  getScamAlerts,
  getIndiaScams,
  getScamQuiz,
  getCommunityScams,
} from '../../services';
import type {
  ScamAnalysisResult,
  ScamAlert,
  IndiaScam,
  ScamQuizQuestion,
  CommunityScam,
} from '../../types';

const TABS = ['Analyze', 'Alerts', 'India Scams', 'Quiz', 'Community'];

export default function ScamDetectionScreen() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={styles.container}>
      {/* Tab Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && styles.tabActive]}
            onPress={() => setActiveTab(idx)}
          >
            <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeTab === 0 && <AnalyzeTab />}
      {activeTab === 1 && <AlertsTab />}
      {activeTab === 2 && <IndiaScamsTab />}
      {activeTab === 3 && <QuizTab />}
      {activeTab === 4 && <CommunityTab />}
    </View>
  );
}

/* ───── Analyze Tab ───── */
function AnalyzeTab() {
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function handleAnalyze() {
    if (!message.trim()) return;
    setAnalyzing(true);
    setResult(null);
    const res = await analyzeMessage(message.trim());
    setResult(res);
    setAnalyzing(false);
  }

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Paste a suspicious message</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Paste SMS, email, or WhatsApp message here..."
        placeholderTextColor={Colors.textLight}
        value={message}
        onChangeText={setMessage}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />
      <TouchableOpacity
        style={[styles.analyzeButton, analyzing && { opacity: 0.7 }]}
        onPress={handleAnalyze}
        disabled={analyzing}
      >
        {analyzing ? (
          <ActivityIndicator color={Colors.white} size="small" />
        ) : (
          <>
            <Ionicons name="search-outline" size={18} color={Colors.white} />
            <Text style={styles.analyzeButtonText}>Analyze</Text>
          </>
        )}
      </TouchableOpacity>

      {result && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={[styles.riskBadge, { backgroundColor: getSeverityColor(result.riskLevel) + '20' }]}>
              <Text style={[styles.riskBadgeText, { color: getSeverityColor(result.riskLevel) }]}>
                {result.riskLevel.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.confidenceText}>{result.confidence}% Confidence</Text>
          </View>
          <Text style={styles.resultExplanation}>{result.explanation}</Text>

          {result.indicators.length > 0 && (
            <>
              <Text style={styles.resultSubTitle}>Red Flags</Text>
              {result.indicators.map((flag, i) => (
                <View key={i} style={styles.flagRow}>
                  <Ionicons name="alert-circle" size={16} color={Colors.danger} />
                  <Text style={styles.flagText}>{flag}</Text>
                </View>
              ))}
            </>
          )}

          <Text style={styles.resultSubTitle}>Recommendations</Text>
          {result.recommendations.map((rec, i) => (
            <View key={i} style={styles.flagRow}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={styles.flagText}>{rec}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Alerts Tab ───── */
function AlertsTab() {
  const [alerts, setAlerts] = useState<ScamAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getScamAlerts().then((data) => { setAlerts(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {alerts.map((alert) => (
        <View key={alert.id} style={styles.alertCard}>
          <View style={[styles.alertBorder, { backgroundColor: getSeverityColor(alert.severity) }]} />
          <View style={styles.alertBody}>
            <View style={styles.alertTopRow}>
              <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
              {!alert.isRead && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.alertDesc} numberOfLines={2}>{alert.description}</Text>
            <View style={styles.alertMeta}>
              <View style={[styles.severityPill, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
                <Text style={[styles.severityPillText, { color: getSeverityColor(alert.severity) }]}>
                  {alert.severity.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.alertSource}>{alert.source}</Text>
              <Text style={styles.alertTime}>{timeAgo(alert.time)}</Text>
            </View>
            <View style={styles.actionRow}>
              <Ionicons name="arrow-forward-circle-outline" size={14} color={Colors.primary} />
              <Text style={styles.actionText}>{alert.action}</Text>
            </View>
          </View>
        </View>
      ))}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── India Scams Tab ───── */
function IndiaScamsTab() {
  const [scams, setScams] = useState<IndiaScam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getIndiaScams().then((data) => { setScams(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {scams.map((scam) => (
        <View key={scam.id} style={styles.indiaCard}>
          <View style={styles.indiaHeader}>
            <View style={[styles.severityPill, { backgroundColor: getSeverityColor(scam.severity) + '20' }]}>
              <Text style={[styles.severityPillText, { color: getSeverityColor(scam.severity) }]}>
                {scam.severity.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.reportCount}>{(scam.reportCount / 1000).toFixed(0)}K reports</Text>
          </View>
          <Text style={styles.indiaTitle}>{scam.title}</Text>
          <Text style={styles.indiaDesc}>{scam.description}</Text>

          <View style={styles.exampleBox}>
            <Ionicons name="chatbubble-outline" size={14} color={Colors.textMid} />
            <Text style={styles.exampleText}>{scam.example}</Text>
          </View>

          <Text style={styles.listHeader}>How to Identify</Text>
          {scam.howToIdentify.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Ionicons name="eye-outline" size={14} color={Colors.warning} />
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}

          <Text style={styles.listHeader}>What to Do</Text>
          {scam.whatToDo.map((item, i) => (
            <View key={i} style={styles.listItem}>
              <Ionicons name="checkmark-circle-outline" size={14} color={Colors.primary} />
              <Text style={styles.listItemText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Quiz Tab ───── */
function QuizTab() {
  const [questions, setQuestions] = useState<ScamQuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    getScamQuiz().then((data) => { setQuestions(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;
  if (questions.length === 0) return null;

  const q = questions[current];
  const isFinished = current >= questions.length;
  const progress = current / questions.length;

  function handleAnswer(isScam: boolean) {
    const correct = isScam === q.isScam;
    if (correct) setScore((s) => s + 1);
    setLastCorrect(correct);
    setAnswered(true);
  }

  function handleNext() {
    setCurrent((c) => c + 1);
    setAnswered(false);
    setLastCorrect(null);
  }

  if (isFinished) {
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={{ alignItems: 'center', paddingTop: 60 }}>
        <Ionicons name="trophy-outline" size={64} color={Colors.primary} />
        <Text style={[styles.sectionTitle, { textAlign: 'center', marginTop: Spacing.lg }]}>Quiz Complete!</Text>
        <Text style={styles.scoreText}>
          {score} / {questions.length} correct
        </Text>
        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={() => { setCurrent(0); setScore(0); setAnswered(false); setLastCorrect(null); }}
        >
          <Text style={styles.analyzeButtonText}>Retry</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Progress */}
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Question {current + 1}/{questions.length}</Text>
        <Text style={styles.progressLabel}>Score: {score}</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Message */}
      <View style={styles.quizMessageCard}>
        <Text style={styles.quizSender}>{q.sender}</Text>
        <Text style={styles.quizMessage}>{q.message}</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: q.difficulty === 'hard' ? Colors.danger + '20' : q.difficulty === 'medium' ? Colors.warning + '20' : Colors.safe + '20' }]}>
          <Text style={[styles.difficultyText, { color: q.difficulty === 'hard' ? Colors.danger : q.difficulty === 'medium' ? Colors.warning : Colors.safe }]}>
            {q.difficulty.toUpperCase()}
          </Text>
        </View>
      </View>

      {!answered ? (
        <View style={styles.quizButtons}>
          <TouchableOpacity style={[styles.quizBtn, { backgroundColor: Colors.danger }]} onPress={() => handleAnswer(true)}>
            <Ionicons name="alert-circle" size={20} color={Colors.white} />
            <Text style={styles.quizBtnText}>Scam</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quizBtn, { backgroundColor: Colors.safe }]} onPress={() => handleAnswer(false)}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
            <Text style={styles.quizBtnText}>Safe</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.feedbackCard}>
          <Ionicons
            name={lastCorrect ? 'checkmark-circle' : 'close-circle'}
            size={32}
            color={lastCorrect ? Colors.safe : Colors.danger}
          />
          <Text style={[styles.feedbackTitle, { color: lastCorrect ? Colors.safe : Colors.danger }]}>
            {lastCorrect ? 'Correct!' : 'Incorrect'}
          </Text>
          <Text style={styles.feedbackExplanation}>{q.explanation}</Text>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next Question</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Community Tab ───── */
function CommunityTab() {
  const [scams, setScams] = useState<CommunityScam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('All');

  const regions = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune', 'Hyderabad'];

  useEffect(() => {
    getCommunityScams().then((data) => { setScams(data); setLoading(false); });
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} size="large" />;

  const filtered = selectedRegion === 'All' ? scams : scams.filter((s) => s.region === selectedRegion);

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Region Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
        {regions.map((region) => (
          <TouchableOpacity
            key={region}
            style={[styles.regionPill, selectedRegion === region && styles.regionPillActive]}
            onPress={() => setSelectedRegion(region)}
          >
            <Text style={[styles.regionPillText, selectedRegion === region && styles.regionPillTextActive]}>
              {region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map((scam) => (
        <View key={scam.id} style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <View style={[styles.severityPill, { backgroundColor: getSeverityColor(scam.severity) + '20' }]}>
              <Text style={[styles.severityPillText, { color: getSeverityColor(scam.severity) }]}>
                {scam.severity.toUpperCase()}
              </Text>
            </View>
            <View style={styles.regionBadge}>
              <Ionicons name="location-outline" size={12} color={Colors.textMid} />
              <Text style={styles.regionText}>{scam.region}</Text>
            </View>
          </View>
          <Text style={styles.communityTitle}>{scam.title}</Text>
          <Text style={styles.communityDesc}>{scam.description}</Text>
          <View style={styles.communityFooter}>
            <Text style={styles.communityReporter}>by {scam.reportedBy}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={12} color={Colors.primary} />
              <Text style={styles.verifiedText}>{scam.verifiedCount} verified</Text>
            </View>
            <Text style={styles.communityTime}>{timeAgo(scam.reportedAt)}</Text>
          </View>
        </View>
      ))}
      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

/* ───── Styles ───── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg, paddingTop: Spacing['4xl'] + 10 },
  tabBar: { maxHeight: 48 },
  tabBarContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  tab: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.sectionBg },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textMid },
  tabTextActive: { color: Colors.white },
  tabContent: { flex: 1, paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.md },
  textArea: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.border, padding: Spacing.lg, fontSize: FontSize.base, color: Colors.textPrimary, minHeight: 120, ...Shadows.sm },
  analyzeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, marginTop: Spacing.lg, ...Shadows.md },
  analyzeButtonText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.white },
  resultCard: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.xl, marginTop: Spacing.xl, ...Shadows.md },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  riskBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  riskBadgeText: { fontSize: FontSize.sm, fontWeight: '700' },
  confidenceText: { fontSize: FontSize.sm, color: Colors.textMid, fontWeight: '500' },
  resultExplanation: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 22, marginBottom: Spacing.md },
  resultSubTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.md, marginBottom: Spacing.sm },
  flagRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  flagText: { fontSize: FontSize.sm, color: Colors.textMid, flex: 1 },
  alertCard: { flexDirection: 'row', backgroundColor: Colors.cardBg, borderRadius: BorderRadius.lg, marginBottom: Spacing.md, overflow: 'hidden', ...Shadows.sm },
  alertBorder: { width: 4 },
  alertBody: { flex: 1, padding: Spacing.md },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xs },
  alertTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary, marginLeft: Spacing.sm },
  alertDesc: { fontSize: FontSize.sm, color: Colors.textMid, marginBottom: Spacing.sm, lineHeight: 18 },
  alertMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  severityPill: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  severityPillText: { fontSize: FontSize.xs, fontWeight: '600' },
  alertSource: { fontSize: FontSize.xs, color: Colors.textLight },
  alertTime: { fontSize: FontSize.xs, color: Colors.textLight },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  actionText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500' },
  indiaCard: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.lg, ...Shadows.md },
  indiaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  reportCount: { fontSize: FontSize.xs, color: Colors.textMid },
  indiaTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  indiaDesc: { fontSize: FontSize.sm, color: Colors.textMid, lineHeight: 20, marginBottom: Spacing.md },
  exampleBox: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, backgroundColor: Colors.sectionBg, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
  exampleText: { fontSize: FontSize.sm, color: Colors.textPrimary, fontStyle: 'italic', flex: 1 },
  listHeader: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textPrimary, marginTop: Spacing.sm, marginBottom: Spacing.xs },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.xs },
  listItemText: { fontSize: FontSize.sm, color: Colors.textMid, flex: 1 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  progressLabel: { fontSize: FontSize.sm, color: Colors.textMid, fontWeight: '500' },
  progressBarBg: { height: 6, backgroundColor: Colors.border, borderRadius: 3, marginBottom: Spacing.xl },
  progressBarFill: { height: 6, backgroundColor: Colors.primary, borderRadius: 3 },
  quizMessageCard: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.md, marginBottom: Spacing.xl },
  quizSender: { fontSize: FontSize.xs, fontWeight: '600', color: Colors.textMid, marginBottom: Spacing.sm },
  quizMessage: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 22, marginBottom: Spacing.md },
  difficultyBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm },
  difficultyText: { fontSize: FontSize.xs, fontWeight: '600' },
  quizButtons: { flexDirection: 'row', gap: Spacing.lg },
  quizBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.lg, ...Shadows.md },
  quizBtnText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.white },
  feedbackCard: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.xl, alignItems: 'center', ...Shadows.md },
  feedbackTitle: { fontSize: FontSize.xl, fontWeight: '700', marginTop: Spacing.sm },
  feedbackExplanation: { fontSize: FontSize.sm, color: Colors.textMid, textAlign: 'center', lineHeight: 20, marginTop: Spacing.md, marginBottom: Spacing.xl },
  nextButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, backgroundColor: Colors.primary, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md },
  nextButtonText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.white },
  scoreText: { fontSize: FontSize['2xl'], fontWeight: '700', color: Colors.primary, marginTop: Spacing.sm, marginBottom: Spacing.xl },
  regionPill: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.sectionBg, marginRight: Spacing.sm },
  regionPillActive: { backgroundColor: Colors.primary },
  regionPillText: { fontSize: FontSize.sm, color: Colors.textMid, fontWeight: '500' },
  regionPillTextActive: { color: Colors.white },
  communityCard: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, padding: Spacing.xl, marginBottom: Spacing.md, ...Shadows.sm },
  communityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  regionBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  regionText: { fontSize: FontSize.xs, color: Colors.textMid },
  communityTitle: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary, marginBottom: Spacing.xs },
  communityDesc: { fontSize: FontSize.sm, color: Colors.textMid, lineHeight: 20, marginBottom: Spacing.md },
  communityFooter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  communityReporter: { fontSize: FontSize.xs, color: Colors.textLight },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500' },
  communityTime: { fontSize: FontSize.xs, color: Colors.textLight, marginLeft: 'auto' },
});
