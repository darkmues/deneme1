import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import LoadingDots from '../components/LoadingDots';
import { colors, typography, spacing, borderRadius } from '../theme';

const WRITING_TEMPLATES = [
  {
    id: 'email',
    icon: '📧',
    label: 'E-posta',
    gradient: ['#F59E0B', '#EF4444'],
    placeholder: 'E-posta konusu ve içerik isteğinizi yazın...',
    description: 'Profesyonel, etkileyici e-postalar',
  },
  {
    id: 'essay',
    icon: '📄',
    label: 'Makale',
    gradient: ['#10B981', '#059669'],
    placeholder: 'Makale konusu ve odak noktalarını belirtin...',
    description: 'Yapılandırılmış, bilgilendirici makaleler',
  },
  {
    id: 'story',
    icon: '📚',
    label: 'Hikaye',
    gradient: ['#8B5CF6', '#7C3AED'],
    placeholder: 'Hikaye fikrinizi, karakterlerinizi ve ortamı anlatın...',
    description: 'Yaratıcı ve akıcı hikayeler',
  },
  {
    id: 'summary',
    icon: '📋',
    label: 'Özet',
    gradient: ['#06B6D4', '#0284C7'],
    placeholder: 'Özetlenmesini istediğiniz metni yapıştırın...',
    description: 'Kısa, öz özetler',
  },
  {
    id: 'code',
    icon: '💻',
    label: 'Kod',
    gradient: ['#4F8EF7', '#7C3AED'],
    placeholder: 'Hangi dilde, ne yapmak istediğinizi açıklayın...',
    description: 'Temiz, yorumlu kod örnekleri',
  },
  {
    id: 'general',
    icon: '✨',
    label: 'Serbest',
    gradient: colors.gradientOrange,
    placeholder: 'Ne yazmamı istediğinizi serbest biçimde anlatın...',
    description: 'Her türlü yazma isteği',
  },
];

const TONE_OPTIONS = [
  { id: 'professional', label: 'Profesyonel', icon: '👔' },
  { id: 'casual', label: 'Samimi', icon: '😊' },
  { id: 'formal', label: 'Resmi', icon: '🎩' },
  { id: 'creative', label: 'Yaratıcı', icon: '🎨' },
];

export default function WritingScreen() {
  const [selectedTemplate, setSelectedTemplate] = useState('general');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [userInput, setUserInput] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [copyAnimation] = useState(new Animated.Value(0));
  const { token } = useAuth();
  const scrollViewRef = useRef(null);
  const insets = useSafeAreaInsets();

  const currentTemplate = WRITING_TEMPLATES.find((t) => t.id === selectedTemplate);

  const generateText = async () => {
    if (!userInput.trim()) {
      Alert.alert('Giriş Gerekli', 'Lütfen ne yazmamı istediğinizi belirtin.');
      return;
    }

    setIsGenerating(true);
    setGeneratedText('');
    setStreamedText('');

    const toneLabel = TONE_OPTIONS.find((t) => t.id === selectedTone)?.label || 'profesyonel';
    const fullPrompt = `Ton: ${toneLabel}\n\n${userInput}`;

    try {
      await geminiService.streamText(token, fullPrompt + `\n\nYazım türü: ${currentTemplate.label}`, (chunk, full) => {
        setStreamedText(full);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 50);
      });

      setGeneratedText(streamedText);
    } catch (err) {
      // Streaming başarısız olursa normal istek dene
      try {
        const result = await geminiService.generateText(token, fullPrompt, selectedTemplate);
        setGeneratedText(result);
        setStreamedText(result);
      } catch (err2) {
        Alert.alert('Hata', 'Metin oluşturulamadı. API anahtarınızı kontrol edin.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    const textToCopy = streamedText || generatedText;
    if (!textToCopy) return;

    await Clipboard.setStringAsync(textToCopy);

    Animated.sequence([
      Animated.timing(copyAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(copyAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const clearAll = () => {
    setUserInput('');
    setGeneratedText('');
    setStreamedText('');
  };

  const copyOpacity = copyAnimation.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradientOrange}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>✍️ Yazı Asistanı</Text>
        <Text style={styles.headerSubtitle}>AI ile mükemmel içerik üretin</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Şablon seçici */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yazı Türü</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.templateList}>
              {WRITING_TEMPLATES.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.templateCard, selectedTemplate === template.id && styles.templateCardActive]}
                  onPress={() => setSelectedTemplate(template.id)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={selectedTemplate === template.id ? template.gradient : [colors.surfaceElevated, colors.surfaceElevated]}
                    style={styles.templateCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.templateIcon}>{template.icon}</Text>
                    <Text style={[styles.templateLabel, selectedTemplate === template.id && styles.templateLabelActive]}>
                      {template.label}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.templateDescription}>{currentTemplate?.description}</Text>
          </View>

          {/* Ton seçici */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yazım Tonu</Text>
            <View style={styles.toneRow}>
              {TONE_OPTIONS.map((tone) => (
                <TouchableOpacity
                  key={tone.id}
                  style={[styles.toneChip, selectedTone === tone.id && styles.toneChipActive]}
                  onPress={() => setSelectedTone(tone.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.toneIcon}>{tone.icon}</Text>
                  <Text style={[styles.toneLabel, selectedTone === tone.id && styles.toneLabelActive]}>
                    {tone.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Kullanıcı girişi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İsteğiniz</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={userInput}
                onChangeText={setUserInput}
                placeholder={currentTemplate?.placeholder}
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={1000}
              />
              <Text style={styles.charCount}>{userInput.length}/1000</Text>
            </View>
          </View>

          {/* Üret butonu */}
          <TouchableOpacity
            style={[styles.generateButton, (!userInput.trim() || isGenerating) && styles.generateButtonDisabled]}
            onPress={generateText}
            disabled={!userInput.trim() || isGenerating}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={userInput.trim() && !isGenerating ? currentTemplate?.gradient || colors.gradientPrimary : [colors.border, colors.border]}
              style={styles.generateButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isGenerating ? (
                <>
                  <LoadingDots color="#fff" />
                  <Text style={styles.generateButtonText}>Yazılıyor...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color={userInput.trim() ? '#fff' : colors.textMuted} />
                  <Text style={[styles.generateButtonText, !userInput.trim() && styles.generateButtonTextDisabled]}>
                    Yaz
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Üretilen metin */}
          {(streamedText || generatedText) ? (
            <View style={styles.section}>
              <View style={styles.resultHeader}>
                <Text style={styles.sectionTitle}>Üretilen Metin</Text>
                <View style={styles.resultActions}>
                  <TouchableOpacity onPress={copyToClipboard} style={styles.actionButton}>
                    <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
                    <Text style={styles.actionButtonText}>Kopyala</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={clearAll} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                    <Text style={[styles.actionButtonText, { color: colors.error }]}>Sil</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.resultCard}>
                <Text style={styles.resultText}>{streamedText || generatedText}</Text>
                {isGenerating && <LoadingDots />}
              </View>

              {/* Kopyalandı bildirimi */}
              <Animated.View style={[styles.copiedToast, { opacity: copyOpacity }]}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.copiedText}>Panoya kopyalandı!</Text>
              </Animated.View>
            </View>
          ) : null}

          <View style={{ height: insets.bottom + spacing.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerTitle: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: '#fff' },
  headerSubtitle: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  templateList: { gap: spacing.sm, paddingRight: spacing.md },
  templateCard: { borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  templateCardActive: { borderColor: 'rgba(255,255,255,0.3)' },
  templateCardGradient: { padding: spacing.md, alignItems: 'center', gap: spacing.xs, minWidth: 80 },
  templateIcon: { fontSize: 24 },
  templateLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, fontWeight: typography.fontWeights.medium },
  templateLabelActive: { color: '#fff', fontWeight: typography.fontWeights.bold },
  templateDescription: { fontSize: typography.fontSizes.xs, color: colors.textMuted, marginTop: spacing.sm },
  toneRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  toneChip: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  toneChipActive: { borderColor: colors.warning, backgroundColor: colors.warning + '15' },
  toneIcon: { fontSize: 16 },
  toneLabel: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
  toneLabelActive: { color: colors.warning, fontWeight: typography.fontWeights.semibold },
  inputContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1, borderColor: colors.borderLight,
    padding: spacing.md,
  },
  textInput: {
    fontSize: typography.fontSizes.md, color: colors.textPrimary,
    minHeight: 100,
  },
  charCount: { fontSize: typography.fontSizes.xs, color: colors.textMuted, textAlign: 'right', marginTop: spacing.xs },
  generateButton: { borderRadius: borderRadius.md, overflow: 'hidden', marginBottom: spacing.xl },
  generateButtonDisabled: {},
  generateButtonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.lg,
  },
  generateButtonText: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: '#fff' },
  generateButtonTextDisabled: { color: colors.textMuted },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  resultActions: { flexDirection: 'row', gap: spacing.sm },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.borderLight,
  },
  actionButtonText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  resultCard: {
    backgroundColor: colors.aiBubble,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1, borderColor: colors.borderLight,
  },
  resultText: { fontSize: typography.fontSizes.md, color: colors.textPrimary, lineHeight: 24 },
  copiedToast: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.full, alignSelf: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderWidth: 1, borderColor: colors.success + '40',
    marginTop: spacing.sm,
  },
  copiedText: { fontSize: typography.fontSizes.sm, color: colors.success },
});
