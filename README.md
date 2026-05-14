# AI Asistan - React Native Mobil Uygulama

Gemini 2.0 Flash tabanlı, 4 güçlü AI özelliğine sahip modern mobil uygulama.

## Özellikler

| Ekran | Özellik |
|-------|---------|
| 💬 **Sohbet** | Gemini ile gerçek zamanlı AI sohbeti, geçmiş hafızası |
| 🎤 **Ses** | Sesli komutlar, AI yanıt, metin-konuşma (TTS) |
| 🖼️ **Görüntü** | Fotoğraf analizi, Gemini Vision, 6 analiz modu |
| ✍️ **Yazı** | E-posta, makale, hikaye, kod üretimi, streaming |

## Kurulum

### 1. Gereksinimleri Yükle
```bash
npm install
```

### 2. Gemini API Anahtarı Al
[Google AI Studio](https://aistudio.google.com/app/apikey) adresinden ücretsiz API anahtarı alın.

### 3. API Anahtarını Ayarla
`src/services/geminiService.js` dosyasında `YOUR_GEMINI_API_KEY` yerine kendi anahtarınızı yazın.

### 4. Uygulamayı Başlat
```bash
npx expo start
```
Expo Go uygulamasıyla QR kodu taratın.

## Proje Yapısı

```
src/
├── screens/
│   ├── ChatScreen.js      # AI sohbet ekranı
│   ├── VoiceScreen.js     # Sesli asistan ekranı
│   ├── ImageScreen.js     # Görüntü analizi ekranı
│   └── WritingScreen.js   # Yazı asistanı ekranı
├── services/
│   └── geminiService.js   # Gemini API entegrasyonu
├── navigation/
│   └── AppNavigator.js    # Alt sekme navigasyonu
├── components/
│   ├── GradientHeader.js  # Ortak başlık bileşeni
│   └── LoadingDots.js     # Yükleme animasyonu
└── theme/
    ├── colors.js          # Renk paleti
    ├── typography.js      # Yazı stilleri
    └── index.js           # Tema sabitleri
```

## Teknoloji Yığını

- **React Native** + **Expo SDK 52**
- **Google Gemini 2.0 Flash** API
- **React Navigation** (Bottom Tabs)
- **expo-av** - Ses kaydı
- **expo-speech** - Metin-Konuşma
- **expo-image-picker** - Görüntü seçimi
- **expo-linear-gradient** - Gradyan UI
