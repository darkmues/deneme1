import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const genAI = new GoogleGenerativeAI(API_KEY);

const MODEL_NAME = 'gemini-2.0-flash';

export const geminiService = {
  // Chat geçmişi ile mesaj gönder
  async sendMessage(message, history = []) {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction:
        'Sen yardımcı, zeki ve samimi bir AI asistansın. Türkçe veya kullanıcının dilinde cevap ver. Cevapların kısa, net ve faydalı olsun.',
    });

    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.9,
      },
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  },

  // Görüntü analizi
  async analyzeImage(base64Image, mimeType = 'image/jpeg', prompt = '') {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const userPrompt =
      prompt ||
      'Bu görüntüyü detaylı şekilde analiz et. Ne görüyorsun? Renkleri, nesneleri, aktiviteleri ve dikkat çekici unsurları açıkla.';

    const result = await model.generateContent([
      userPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    return result.response.text();
  },

  // Ses metnini AI ile işle
  async processVoiceText(transcribedText) {
    const model = genAI.getGenerativeModel({
      model: MODEL_NAME,
      systemInstruction:
        'Sen bir sesli asistansın. Kullanıcı seninle sesli konuşuyor. Kısa, net ve konuşma diline uygun cevaplar ver.',
    });

    const result = await model.generateContent(transcribedText);
    return result.response.text();
  },

  // Yazı üretici
  async generateText(prompt, type = 'general') {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const systemPrompts = {
      email: 'Profesyonel ve etkili bir e-posta yaz.',
      essay: 'Akıcı, bilgilendirici ve yapılandırılmış bir makale yaz.',
      story: 'Yaratıcı, ilgi çekici ve akıcı bir hikaye yaz.',
      summary: 'Verilen metni kısa ve öz şekilde özetle.',
      code: 'Temiz, yorumlu ve çalışır kod yaz.',
      general: 'Kullanıcının isteğine göre yardımcı ol.',
    };

    const fullPrompt = `${systemPrompts[type] || systemPrompts.general}\n\n${prompt}`;
    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  },

  // Akışlı metin üretimi (streaming)
  async streamText(prompt, onChunk) {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContentStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText, fullText);
    }
    return fullText;
  },
};
