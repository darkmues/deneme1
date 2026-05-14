import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { geminiService } from '../services/geminiService';
import LoadingDots from '../components/LoadingDots';
import { colors, typography, spacing, borderRadius } from '../theme';

const ANALYSIS_MODES = [
  { id: 'general', icon: '🔍', label: 'Genel Analiz', prompt: '' },
  { id: 'describe', icon: '📝', label: 'Betimle', prompt: 'Bu görüntüyü bir sanatçı gibi betimle. Renk paleti, kompozisyon ve atmosferi açıkla.' },
  { id: 'objects', icon: '📦', label: 'Nesneler', prompt: 'Görüntüdeki tüm nesneleri, kişileri ve unsurları listele. Her birini kısaca açıkla.' },
  { id: 'text', icon: '🔤', label: 'Metin Oku', prompt: 'Görüntüdeki tüm yazıları, metinleri ve karakterleri oku ve yaz.' },
  { id: 'mood', icon: '😊', label: 'Duygu Analizi', prompt: 'Bu görüntünün yarattığı duygu ve atmosferi analiz et. Neden bu duyguyu yaratıyor?' },
  { id: 'story', icon: '📖', label: 'Hikaye Yaz', prompt: 'Bu görüntüden ilham alarak kısa, yaratıcı bir hikaye yaz.' },
];

export default function ImageScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedMode, setSelectedMode] = useState('general');
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const insets = useSafeAreaInsets();

  const pickImage = async (source) => {
    let result;

    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Kamera erişimi için izin vermeniz gerekiyor.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });
    }

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0]);
      setAnalysis('');
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('Görüntü Seçin', 'Önce analiz edilecek bir görüntü seçin.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysis('');

    try {
      let base64Data = selectedImage.base64;

      if (!base64Data) {
        const base64 = await FileSystem.readAsStringAsync(selectedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        base64Data = base64;
      }

      const modePrompt = ANALYSIS_MODES.find((m) => m.id === selectedMode)?.prompt || '';
      const finalPrompt = customPrompt.trim() || modePrompt;

      const result = await geminiService.analyzeImage(
        base64Data,
        'image/jpeg',
        finalPrompt
      );

      setAnalysis(result);
      setAnalysisHistory((prev) => [
        { uri: selectedImage.uri, analysis: result, mode: selectedMode, timestamp: new Date() },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      Alert.alert('Hata', 'Görüntü analiz edilemedi: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradientSecondary}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>🖼️ Görüntü Analizi</Text>
        <Text style={styles.headerSubtitle}>Gemini Vision ile gör, anla, keşfet</Text>
      </LinearGradient>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Görüntü seçici */}
        <View style={styles.imagePickerSection}>
          {selectedImage ? (
            <View style={styles.selectedImageContainer}>
              <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => { setSelectedImage(null); setAnalysis(''); }}
              >
                <Ionicons name="close-circle" size={28} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={56} color={colors.textMuted} />
              <Text style={styles.placeholderText}>Görüntü seçin veya çekin</Text>
            </View>
          )}

          <View style={styles.imageButtonRow}>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => pickImage('gallery')}
              activeOpacity={0.7}
            >
              <LinearGradient colors={colors.gradientSecondary} style={styles.imageButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="images" size={22} color="#fff" />
                <Text style={styles.imageButtonText}>Galeriden Seç</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={() => pickImage('camera')}
              activeOpacity={0.7}
            >
              <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.imageButtonGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Ionicons name="camera" size={22} color="#fff" />
                <Text style={styles.imageButtonText}>Kamera</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analiz modu seçici */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analiz Modu</Text>
          <View style={styles.modeGrid}>
            {ANALYSIS_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeCard, selectedMode === mode.id && styles.modeCardActive]}
                onPress={() => setSelectedMode(mode.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.modeIcon}>{mode.icon}</Text>
                <Text style={[styles.modeLabel, selectedMode === mode.id && styles.modeLabelActive]}>
                  {mode.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Özel soru */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Özel Soru (İsteğe Bağlı)</Text>
          <View style={styles.customPromptContainer}>
            <TextInput
              style={styles.customPromptInput}
              value={customPrompt}
              onChangeText={setCustomPrompt}
              placeholder="Bu görüntü hakkında ne öğrenmek istiyorsunuz?"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={500}
            />
          </View>
        </View>

        {/* Analiz butonu */}
        <TouchableOpacity
          style={[styles.analyzeButton, (!selectedImage || isAnalyzing) && styles.analyzeButtonDisabled]}
          onPress={analyzeImage}
          disabled={!selectedImage || isAnalyzing}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={selectedImage && !isAnalyzing ? colors.gradientSecondary : [colors.border, colors.border]}
            style={styles.analyzeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isAnalyzing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="scan" size={22} color={selectedImage ? '#fff' : colors.textMuted} />
            )}
            <Text style={[styles.analyzeButtonText, !selectedImage && styles.analyzeButtonTextDisabled]}>
              {isAnalyzing ? 'Analiz Ediliyor...' : 'Görüntüyü Analiz Et'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Sonuç */}
        {isAnalyzing && !analysis && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Gemini Vision çalışıyor...</Text>
            <LoadingDots color={colors.info} />
          </View>
        )}

        {analysis ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analiz Sonucu</Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultText}>{analysis}</Text>
            </View>
          </View>
        ) : null}

        {/* Geçmiş analizler */}
        {analysisHistory.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Önceki Analizler</Text>
            {analysisHistory.slice(1).map((item, i) => (
              <View key={i} style={styles.historyItem}>
                <Image source={{ uri: item.uri }} style={styles.historyImage} />
                <View style={styles.historyContent}>
                  <Text style={styles.historyMode}>
                    {ANALYSIS_MODES.find((m) => m.id === item.mode)?.icon} {ANALYSIS_MODES.find((m) => m.id === item.mode)?.label}
                  </Text>
                  <Text style={styles.historyText} numberOfLines={2}>{item.analysis}</Text>
                </View>
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
  headerTitle: { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.bold, color: '#fff' },
  headerSubtitle: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  imagePickerSection: { marginBottom: spacing.xl },
  selectedImageContainer: { position: 'relative', marginBottom: spacing.md },
  selectedImage: {
    width: '100%', height: 240, borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceElevated,
  },
  removeImageButton: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  imagePlaceholder: {
    height: 180,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  placeholderText: { fontSize: typography.fontSizes.md, color: colors.textMuted },
  imageButtonRow: { flexDirection: 'row', gap: spacing.sm },
  imageButton: { flex: 1, borderRadius: borderRadius.md, overflow: 'hidden' },
  imageButtonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.md,
  },
  imageButtonText: { color: '#fff', fontWeight: typography.fontWeights.semibold, fontSize: typography.fontSizes.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeights.semibold,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  modeCard: {
    width: '31%', backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md, padding: spacing.md,
    alignItems: 'center', gap: spacing.xs,
    borderWidth: 1, borderColor: colors.border,
  },
  modeCardActive: { borderColor: colors.info, backgroundColor: colors.info + '15' },
  modeIcon: { fontSize: 22 },
  modeLabel: { fontSize: 11, color: colors.textSecondary, textAlign: 'center' },
  modeLabelActive: { color: colors.info, fontWeight: typography.fontWeights.semibold },
  customPromptContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
  },
  customPromptInput: {
    fontSize: typography.fontSizes.md,
    color: colors.textPrimary,
    minHeight: 60,
  },
  analyzeButton: { marginBottom: spacing.xl, borderRadius: borderRadius.md, overflow: 'hidden' },
  analyzeButtonDisabled: {},
  analyzeButtonGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, paddingVertical: spacing.lg,
  },
  analyzeButtonText: { fontSize: typography.fontSizes.lg, fontWeight: typography.fontWeights.bold, color: '#fff' },
  analyzeButtonTextDisabled: { color: colors.textMuted },
  resultCard: {
    backgroundColor: colors.aiBubble,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  resultLabel: { fontSize: typography.fontSizes.sm, color: colors.textMuted, marginBottom: spacing.sm },
  resultText: { fontSize: typography.fontSizes.md, color: colors.textPrimary, lineHeight: 24 },
  historyItem: {
    flexDirection: 'row', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  historyImage: { width: 56, height: 56, borderRadius: borderRadius.sm },
  historyContent: { flex: 1, gap: spacing.xs },
  historyMode: { fontSize: typography.fontSizes.sm, color: colors.info, fontWeight: typography.fontWeights.medium },
  historyText: { fontSize: typography.fontSizes.sm, color: colors.textSecondary, lineHeight: 18 },
});
