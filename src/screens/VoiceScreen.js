import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../context/AuthContext';
import LoadingDots from '../components/LoadingDots';
import { colors, typography, spacing, borderRadius } from '../theme';

const CONVERSATION_STARTERS = [
  'Bugün hava nasıl?',
  'Bana bir şaka anlat',
  'Motivasyon ver',
  'Kısa bir hikaye anlat',
];

export default function VoiceScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [conversation, setConversation] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const { token } = useAuth();
  const recording = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    requestPermission();
    return () => { Speech.stop(); };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const requestPermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setPermissionGranted(status === 'granted');
  };

  const startRecording = async () => {
    if (!permissionGranted) {
      Alert.alert('İzin Gerekli', 'Ses kaydı için mikrofon iznine ihtiyaç var.', [
        { text: 'İptal', style: 'cancel' },
        { text: 'İzin Ver', onPress: requestPermission },
      ]);
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = rec;
      setIsRecording(true);
      setTranscript('');
      setResponse('');
    } catch (err) {
      Alert.alert('Hata', 'Kayıt başlatılamadı: ' + err.message);
    }
  };

  const stopRecording = async () => {
    if (!recording.current) return;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      // Simüle edilmiş transkript (gerçek STT için Whisper API entegrasyonu gerekir)
      const simulatedText = await simulateTranscription(uri);
      setTranscript(simulatedText);

      if (simulatedText) {
        await getAIResponse(simulatedText);
      }
    } catch (err) {
      Alert.alert('Hata', 'Kayıt işlenirken hata oluştu: ' + err.message);
      setIsProcessing(false);
    }
  };

  // Gerçek uygulamada Whisper API veya Google Speech-to-Text kullanılır
  const simulateTranscription = async (uri) => {
    // Demo için statik metin — entegrasyon noktası
    return 'Merhaba, bugün bana faydalı bir bilgi verebilir misin?';
  };

  const getAIResponse = async (text) => {
    try {
      const aiResponse = await geminiService.processVoiceText(token, text);
      setResponse(aiResponse);

      setConversation((prev) => [
        ...prev,
        { user: text, ai: aiResponse, timestamp: new Date() },
      ]);

      speakResponse(aiResponse);
    } catch (err) {
      setResponse('Yanıt alınamadı. API anahtarınızı kontrol edin.');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*#`_~]/g, '').substring(0, 500);
    setIsSpeaking(true);

    Speech.speak(cleanText, {
      language: 'tr-TR',
      pitch: 1.0,
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const sendQuickPrompt = async (text) => {
    setTranscript(text);
    setIsProcessing(true);
    await getAIResponse(text);
  };

  const clearConversation = () => {
    setTranscript('');
    setResponse('');
    setConversation([]);
    Speech.stop();
    setIsSpeaking(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradientPink}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>🎤 Sesli Asistan</Text>
            <Text style={styles.headerSubtitle}>Konuş, dinle, keşfet</Text>
          </View>
          {conversation.length > 0 && (
            <TouchableOpacity onPress={clearConversation} style={styles.clearBtn}>
              <Ionicons name="refresh" size={20} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Ana kayıt butonu */}
        <View style={styles.recordSection}>
          <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={isRecording ? stopRecording : startRecording}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isRecording ? [colors.error, '#f87171'] : colors.gradientPink}
                style={styles.recordButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name={isRecording ? 'stop' : 'mic'}
                  size={48}
                  color="#fff"
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.recordStatus}>
            {isRecording
              ? '🔴 Dinleniyor... Durdurmak için dokunun'
              : isProcessing
              ? '⏳ İşleniyor...'
              : '🎤 Konuşmak için dokunun'}
          </Text>
        </View>

        {/* Hızlı başlatıcılar */}
        {!transcript && !isProcessing && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hızlı Başlat</Text>
            <View style={styles.starterGrid}>
              {CONVERSATION_STARTERS.map((starter, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.starterCard}
                  onPress={() => sendQuickPrompt(starter)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.starterText}>{starter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Transkript */}
        {transcript ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Siz söylediniz:</Text>
            <View style={styles.transcriptCard}>
              <Text style={styles.transcriptText}>"{transcript}"</Text>
            </View>
          </View>
        ) : null}

        {/* AI Yanıtı */}
        {isProcessing && !response ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Yanıtlıyor...</Text>
            <View style={styles.responseCard}>
              <LoadingDots color={colors.secondaryLight} />
            </View>
          </View>
        ) : response ? (
          <View style={styles.section}>
            <View style={styles.responseTitleRow}>
              <Text style={styles.sectionTitle}>AI Yanıtı:</Text>
              <TouchableOpacity
                onPress={() => speakResponse(response)}
                style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
              >
                <Ionicons
                  name={isSpeaking ? 'volume-high' : 'volume-medium-outline'}
                  size={18}
                  color={isSpeaking ? colors.secondaryLight : colors.textSecondary}
                />
                <Text style={[styles.speakButtonText, isSpeaking && styles.speakButtonTextActive]}>
                  {isSpeaking ? 'Duraksıt' : 'Seslendir'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.responseCard}>
              <Text style={styles.responseText}>{response}</Text>
            </View>
          </View>
        ) : null}

        {/* Geçmiş konuşmalar */}
        {conversation.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Geçmiş Konuşmalar</Text>
            {conversation.slice(0, -1).reverse().map((conv, i) => (
              <View key={i} style={styles.historyItem}>
                <Text style={styles.historyUser}>👤 {conv.user}</Text>
                <Text style={styles.historyAI} numberOfLines={3}>✦ {conv.ai}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: insets.bottom + spacing.xl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerTitle: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: '#fff' },
  headerSubtitle: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  clearBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg },
  recordSection: { alignItems: 'center', paddingVertical: spacing.xxxl },
  pulseRing: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  recordButton: { width: 120, height: 120, borderRadius: 60, overflow: 'hidden' },
  recordButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  recordStatus: { fontSize: typography.fontSizes.md, color: colors.textSecondary, textAlign: 'center' },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  starterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  starterCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    width: '48%',
  },
  starterText: { fontSize: typography.fontSizes.sm, color: colors.textPrimary },
  transcriptCard: {
    backgroundColor: colors.userBubble + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.userBubble + '40',
  },
  transcriptText: {
    fontSize: typography.fontSizes.md,
    color: colors.primaryLight,
    fontStyle: 'italic',
  },
  responseTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  speakButton: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.borderLight,
  },
  speakButtonActive: { borderColor: colors.secondaryLight, backgroundColor: colors.secondary + '20' },
  speakButtonText: { fontSize: typography.fontSizes.xs, color: colors.textSecondary },
  speakButtonTextActive: { color: colors.secondaryLight },
  responseCard: {
    backgroundColor: colors.aiBubble,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  responseText: { fontSize: typography.fontSizes.md, color: colors.textPrimary, lineHeight: 22 },
  historyItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyUser: { fontSize: typography.fontSizes.sm, color: colors.primaryLight, marginBottom: 4 },
  historyAI: { fontSize: typography.fontSizes.sm, color: colors.textSecondary },
});
