import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';
import { colors, typography, spacing, borderRadius, shadows } from '../theme';

WebBrowser.maybeCompleteAuthSession();

// Google Cloud Console'dan alınan client ID'ler
// Kurulum talimatları: README.md
const ANDROID_CLIENT_ID = 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com';
const IOS_CLIENT_ID = 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com';
const WEB_CLIENT_ID = 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com';

const FEATURES = [
  { icon: '💬', title: 'AI Sohbet', desc: 'Gemini ile akıllı konuşmalar' },
  { icon: '🎤', title: 'Sesli Asistan', desc: 'Konuş, dinle, yanıt al' },
  { icon: '🖼️', title: 'Görüntü Analizi', desc: 'Fotoğrafları AI ile çöz' },
  { icon: '✍️', title: 'Yazı Asistanı', desc: 'Her türlü metin üret' },
];

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    webClientId: WEB_CLIENT_ID,
    scopes: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/generative-language',
    ],
  });

  useEffect(() => {
    handleAuthResponse();
  }, [response]);

  const handleAuthResponse = async () => {
    if (response?.type !== 'success') return;

    const { authentication } = response;
    setIsLoading(true);

    try {
      // Kullanıcı profilini Google API'den al
      const userRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${authentication.accessToken}` },
      });
      const userInfo = await userRes.json();

      await signIn(authentication.accessToken, {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
      });
    } catch (err) {
      Alert.alert('Giriş Hatası', 'Kullanıcı bilgisi alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    if (!request) {
      Alert.alert(
        'Yapılandırma Gerekli',
        'Lütfen Google Cloud Console\'dan Client ID\'lerinizi alıp LoginScreen.js dosyasına ekleyin.',
      );
      return;
    }
    promptAsync();
  };

  return (
    <LinearGradient
      colors={['#0A0F1E', '#0D1B35', '#0A0F1E']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Logo & Başlık */}
      <View style={styles.heroSection}>
        <LinearGradient
          colors={colors.gradientPrimary}
          style={styles.logoContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.logoIcon}>✦</Text>
        </LinearGradient>
        <Text style={styles.appName}>AI Asistan</Text>
        <Text style={styles.tagline}>Gemini 2.0 ile güçlendirilmiş{'\n'}kişisel yapay zeka asistanınız</Text>
      </View>

      {/* Özellik kartları */}
      <View style={styles.featuresGrid}>
        {FEATURES.map((f) => (
          <View key={f.title} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{f.icon}</Text>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureDesc}>{f.desc}</Text>
          </View>
        ))}
      </View>

      {/* Giriş butonu */}
      <View style={styles.loginSection}>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.textInverse} size="small" />
          ) : (
            <>
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Giriş yaparak Google hesabınız üzerinden{'\n'}Gemini API'ye güvenli erişim sağlanır.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xxxl,
  },
  heroSection: { alignItems: 'center', gap: spacing.md },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  logoIcon: { fontSize: 40, color: '#fff' },
  appName: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: typography.fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  featureCard: {
    width: '47%',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureIcon: { fontSize: 24 },
  featureTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.textPrimary,
  },
  featureDesc: { fontSize: typography.fontSizes.xs, color: colors.textMuted, lineHeight: 16 },
  loginSection: { alignItems: 'center', gap: spacing.md },
  googleButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: '#fff',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    ...shadows.md,
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: typography.fontWeights.bold,
    color: '#fff',
  },
  googleButtonText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: '#1F2937',
  },
  privacyNote: {
    fontSize: typography.fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
