import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { geminiService } from '../services/geminiService';
import LoadingDots from '../components/LoadingDots';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'model',
  text: '👋 Merhaba! Ben Gemini destekli AI asistanınım.\n\nSize nasıl yardımcı olabilirim? Sorular sorabilir, bilgi alabilir veya herhangi bir konuda sohbet edebiliriz.',
  timestamp: new Date(),
};

const QUICK_PROMPTS = [
  { icon: '💡', text: 'Fikir üret' },
  { icon: '📝', text: 'Özet çıkar' },
  { icon: '🌍', text: 'Çeviri yap' },
  { icon: '🧠', text: 'Açıkla' },
];

export default function ChatScreen() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const insets = useSafeAreaInsets();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const sendMessage = useCallback(async (text) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text }));

      const response = await geminiService.sendMessage(messageText, history);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: '⚠️ Bir hata oluştu. Lütfen API anahtarınızı kontrol edin ve tekrar deneyin.',
        isError: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [inputText, isLoading, messages, scrollToBottom]);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
  }, []);

  const renderMessage = useCallback(({ item, index }) => {
    const isUser = item.role === 'user';
    const showTime = index === 0 ||
      (messages[index - 1]?.role !== item.role);

    return (
      <View style={[styles.messageWrapper, isUser ? styles.userWrapper : styles.aiWrapper]}>
        {!isUser && (
          <LinearGradient
            colors={colors.gradientPrimary}
            style={styles.aiAvatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.aiAvatarText}>✦</Text>
          </LinearGradient>
        )}
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble, item.isError && styles.errorBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
            {item.text}
          </Text>
          <Text style={[styles.timeText, isUser ? styles.userTimeText : styles.aiTimeText]}>
            {item.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  }, [messages]);

  const renderQuickPrompt = ({ item }) => (
    <TouchableOpacity
      style={styles.quickPrompt}
      onPress={() => sendMessage(item.text)}
      activeOpacity={0.7}
    >
      <Text style={styles.quickPromptIcon}>{item.icon}</Text>
      <Text style={styles.quickPromptText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradientPrimary}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']} style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>✦</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>AI Sohbet</Text>
              <View style={styles.onlineIndicator}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>Gemini 2.0 Flash</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <View style={styles.quickPromptsContainer}>
            <Text style={styles.quickPromptsTitle}>Hızlı Başlangıç</Text>
            <FlatList
              data={QUICK_PROMPTS}
              renderItem={renderQuickPrompt}
              keyExtractor={(item) => item.text}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickPromptsList}
            />
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.messagesList, { paddingBottom: spacing.md }]}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <LinearGradient
              colors={colors.gradientPrimary}
              style={styles.aiAvatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.aiAvatarText}>✦</Text>
            </LinearGradient>
            <View style={styles.aiBubble}>
              <LoadingDots />
            </View>
          </View>
        )}

        {/* Input bar */}
        <View style={[styles.inputBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Bir şey yazın..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={2000}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={inputText.trim() && !isLoading ? colors.gradientPrimary : [colors.border, colors.border]}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="send" size={18} color={inputText.trim() && !isLoading ? '#fff' : colors.textMuted} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { fontSize: 20, color: '#fff' },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: '#fff',
  },
  onlineIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#4ade80' },
  onlineText: { fontSize: typography.fontSizes.xs, color: 'rgba(255,255,255,0.8)' },
  clearButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPromptsContainer: { paddingTop: spacing.lg, paddingBottom: spacing.sm },
  quickPromptsTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  quickPromptsList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  quickPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickPromptIcon: { fontSize: 16 },
  quickPromptText: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.medium,
  },
  messagesList: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  messageWrapper: { flexDirection: 'row', marginBottom: spacing.md, alignItems: 'flex-end', gap: spacing.sm },
  userWrapper: { flexDirection: 'row-reverse' },
  aiWrapper: { flexDirection: 'row' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiAvatarText: { fontSize: 14, color: '#fff' },
  messageBubble: { maxWidth: '80%', borderRadius: borderRadius.lg, padding: spacing.md },
  userBubble: { backgroundColor: colors.userBubble, borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: colors.aiBubble, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.borderLight },
  errorBubble: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: colors.error },
  messageText: { fontSize: typography.fontSizes.md, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: colors.textPrimary },
  timeText: { fontSize: 10, marginTop: 4 },
  userTimeText: { color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  aiTimeText: { color: colors.textMuted },
  loadingContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  inputBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSizes.md,
    color: colors.textPrimary,
    maxHeight: 120,
    paddingVertical: spacing.sm,
  },
  sendButton: { marginBottom: 2 },
  sendButtonDisabled: {},
  sendButtonGradient: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
