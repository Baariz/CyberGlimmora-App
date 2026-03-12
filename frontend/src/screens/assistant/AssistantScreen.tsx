import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing, FontSize } from '../../theme/colors';
import { sendMessage, getSuggestedQueries } from '../../services';
import type { AIResponse } from '../../types';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  isEmergency?: boolean;
  suggestedActions?: string[];
  timestamp: Date;
}

export default function AssistantScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Hello! I am your CyberGlimmora AI assistant. I can help you with scam identification, privacy settings, security tips, and more. How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const suggestedQueries = getSuggestedQueries();

  useEffect(() => {
    if (!isTyping) return;
    const anims = [dot1, dot2, dot3].map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [isTyping]);

  async function handleSend(text?: string) {
    const msg = (text || input).trim();
    if (!msg) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      text: msg,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response: AIResponse = await sendMessage(msg);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        text: response.message,
        isUser: false,
        isEmergency: response.isEmergency,
        suggestedActions: response.suggestedActions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err_${Date.now()}`, text: 'Sorry, something went wrong. Please try again.', isUser: false, timestamp: new Date() },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  function renderMessage({ item }: { item: ChatMessage }) {
    if (item.isUser) {
      return (
        <View style={styles.userBubbleRow}>
          <View style={styles.userBubble}>
            <Text style={styles.userBubbleText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.aiBubbleRow}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={16} color={Colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={[styles.aiBubble, item.isEmergency && styles.emergencyBubble]}>
            {item.isEmergency && (
              <View style={styles.emergencyHeader}>
                <Ionicons name="warning" size={16} color={Colors.danger} />
                <Text style={styles.emergencyHeaderText}>Emergency Detected</Text>
              </View>
            )}
            <Text style={styles.aiBubbleText}>{item.text}</Text>
            {item.suggestedActions && item.suggestedActions.length > 0 && (
              <View style={styles.suggestedActionsRow}>
                {item.suggestedActions.map((action, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.actionChip, item.isEmergency && styles.emergencyChip]}
                    onPress={() => handleSend(action)}
                  >
                    <Text style={[styles.actionChipText, item.isEmergency && styles.emergencyChipText]}>
                      {action}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Ionicons name="sparkles" size={20} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <View style={styles.statusRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.statusText}>Online</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListFooterComponent={
          <>
            {isTyping && (
              <View style={styles.aiBubbleRow}>
                <View style={styles.aiAvatar}>
                  <Ionicons name="sparkles" size={16} color={Colors.primary} />
                </View>
                <View style={styles.typingBubble}>
                  {[dot1, dot2, dot3].map((dot, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        styles.typingDot,
                        { transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) }] },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}
            {messages.length < 3 && (
              <View style={styles.suggestedSection}>
                <Text style={styles.suggestedLabel}>Suggested questions</Text>
                <View style={styles.suggestedPills}>
                  {suggestedQueries.map((q, i) => (
                    <TouchableOpacity key={i} style={styles.suggestedPill} onPress={() => handleSend(q)}>
                      <Text style={styles.suggestedPillText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </>
        }
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask about cybersecurity..."
          placeholderTextColor={Colors.textLight}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => handleSend()}
          returnKeyType="send"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
          onPress={() => handleSend()}
          disabled={!input.trim() || isTyping}
        >
          <Ionicons name="send" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.pageBg },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Spacing['4xl'] + 10,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryDark, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.white },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.safe },
  statusText: { fontSize: FontSize.xs, color: Colors.primaryLighter },
  messageList: { padding: Spacing.lg, paddingBottom: 140 },
  userBubbleRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: Spacing.md },
  userBubble: { backgroundColor: Colors.primary, borderRadius: BorderRadius.xl, borderBottomRightRadius: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, maxWidth: '78%' },
  userBubbleText: { fontSize: FontSize.base, color: Colors.white, lineHeight: 21 },
  aiBubbleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md, gap: Spacing.sm },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  aiBubble: { backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, borderBottomLeftRadius: Spacing.xs, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, maxWidth: '90%', borderWidth: 1, borderColor: Colors.border },
  emergencyBubble: { borderColor: Colors.danger, backgroundColor: Colors.dangerLight },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  emergencyHeaderText: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.danger },
  aiBubbleText: { fontSize: FontSize.base, color: Colors.textPrimary, lineHeight: 21 },
  suggestedActionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md },
  actionChip: { borderWidth: 1, borderColor: Colors.primary, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  actionChipText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: '500' },
  emergencyChip: { borderColor: Colors.danger },
  emergencyChipText: { color: Colors.danger },
  typingBubble: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.cardBg, borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg, borderWidth: 1, borderColor: Colors.border },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.textLight },
  suggestedSection: { paddingTop: Spacing.lg },
  suggestedLabel: { fontSize: FontSize.sm, color: Colors.textMid, marginBottom: Spacing.sm },
  suggestedPills: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  suggestedPill: { backgroundColor: Colors.primaryLight, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  suggestedPillText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.cardBg, borderTopWidth: 1, borderTopColor: Colors.border },
  input: { flex: 1, backgroundColor: Colors.pageBg, borderRadius: BorderRadius.xl, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: FontSize.base, color: Colors.textPrimary, maxHeight: 100, marginRight: Spacing.sm },
  sendButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  sendButtonDisabled: { opacity: 0.5 },
});
