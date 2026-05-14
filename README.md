# AI Asistan - React Native Mobil Uygulama

Gemini 2.0 Flash + Google OAuth tabanlı, 4 güçlü AI özelliğine sahip modern mobil uygulama.
API anahtarı gerekmez — kullanıcılar Google hesaplarıyla giriş yapar.

## Özellikler

| Ekran | Özellik |
|-------|---------|
| 🔐 **Giriş** | Google OAuth 2.0 ile güvenli kimlik doğrulama |
| 💬 **Sohbet** | Gemini ile gerçek zamanlı AI sohbeti, geçmiş hafızası |
| 🎤 **Ses** | Sesli komutlar, AI yanıt, metin-konuşma (TTS) |
| 🖼️ **Görüntü** | Fotoğraf analizi, Gemini Vision, 6 analiz modu |
| ✍️ **Yazı** | E-posta, makale, hikaye, kod üretimi, streaming |

---

## Kurulum

### 1. Google Cloud Console Ayarları

1. [Google Cloud Console](https://console.cloud.google.com) açın
2. Yeni proje oluşturun veya mevcut projeyi seçin
3. **APIs & Services → Library** → `Generative Language API` etkinleştirin
4. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
   - **Web application** tipi oluşturun → `WEB_CLIENT_ID` alın
   - **Android** tipi oluşturun:
     - Package name: `com.aiassistant.app`
     - SHA-1: EAS Build keystore SHA-1 (aşağıya bakın)
     - `ANDROID_CLIENT_ID` alın
5. **OAuth Consent Screen** → Test kullanıcılarınızı ekleyin

### 2. SHA-1 Parmak İzi (EAS Build için)

```bash
# EAS yönetilen keystore SHA-1 almak için:
npx eas credentials
# Android → Production → Keystore → Download → SHA-1 kopyalayın
```

### 3. Client ID'leri Uygulamaya Ekle

`src/screens/LoginScreen.js` dosyasında:
```js
const ANDROID_CLIENT_ID = 'xxxxx.apps.googleusercontent.com';
const WEB_CLIENT_ID    = 'xxxxx.apps.googleusercontent.com';
```

### 4. Bağımlılıkları Yükle

```bash
npm install
```

### 5. Geliştirme Ortamında Test

```bash
npx expo start
# Expo Go ile QR taratın
```

---

## APK Build (EAS Build)

### Ön Koşul
```bash
npm install -g eas-cli
eas login   # expo.dev hesabıyla giriş yapın
```

### Preview APK (dahili test)
```bash
eas build --platform android --profile preview
```

### Production APK
```bash
eas build --platform android --profile production
```

Build tamamlandığında Expo panelinden `.apk` dosyasını indirin.

---

## Proje Yapısı

```
src/
├── context/
│   └── AuthContext.js      # Google OAuth token yönetimi
├── screens/
│   ├── LoginScreen.js      # Google OAuth giriş ekranı
│   ├── ChatScreen.js       # AI sohbet ekranı
│   ├── VoiceScreen.js      # Sesli asistan ekranı
│   ├── ImageScreen.js      # Görüntü analizi ekranı
│   └── WritingScreen.js    # Yazı asistanı ekranı
├── services/
│   └── geminiService.js    # Gemini REST API (OAuth token ile)
├── navigation/
│   └── AppNavigator.js     # Auth akışı + alt sekme navigasyonu
├── components/
│   ├── GradientHeader.js
│   └── LoadingDots.js
└── theme/
    ├── colors.js
    ├── typography.js
    └── index.js
```

## Teknoloji Yığını

- **React Native** + **Expo SDK 52**
- **Google OAuth 2.0** (`expo-auth-session`)
- **Gemini 2.0 Flash** REST API (API key yok, OAuth token ile)
- **React Navigation** (Bottom Tabs)
- **expo-av** - Ses kaydı | **expo-speech** - TTS
- **expo-image-picker** - Görüntü seçimi
- **EAS Build** - APK üretimi
