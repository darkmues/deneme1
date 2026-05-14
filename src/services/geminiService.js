import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyAvmzTLxNbhiu5n0oZ6Ro8E02WJQrr18H0';
const genAI = new GoogleGenerativeAI(API_KEY);
const MODEL = 'gemini-2.0-flash';

const SYSTEM_CHAT =
  'Sen yardımcı, zeki ve samimi bir AI asistansın. Türkçe veya kullanıcının dilinde cevap ver. Cevapların kısa, net ve faydalı olsun.';

const SYSTEM_VOICE =
  'Sen bir sesli asistansın. Kullanıcı seninle sesli konuşuyor. Kısa, net ve konuşma diline uygun cevaplar ver.';

const WRITING_PROMPTS = {
  email: 'Profesyonel ve etkili bir e-posta yaz.',
  essay: 'Akıcı, bilgilendirici ve yapılandırılmış bir makale yaz.',
  story: 'Yaratıcı, ilgi çekici ve akıcı bir hikaye yaz.',
  summary: 'Verilen metni kısa ve öz şekilde özetle.',
  code: 'Temiz, yorumlu ve çalışır kod yaz.',
  general: 'Kullanıcının isteğine göre yardımcı ol.',
};

export const geminiService = {
  async sendMessage(message, history = []) {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_CHAT,
    });
    const chat = model.startChat({
      history: history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      generationConfig: { maxOutputTokens: 2048, temperature: 0.9 },
    });
    const result = await chat.sendMessage(message);
    return result.response.text();
  },

  async analyzeImage(base64Image, mimeType = 'image/jpeg', prompt = '') {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const userPrompt =
      prompt ||
      'Bu görüntüyü detaylı şekilde analiz et. Ne görüyorsun? Renkleri, nesneleri, aktiviteleri ve dikkat çekici unsurları açıkla.';
    const result = await model.generateContent([
      userPrompt,
      { inlineData: { data: base64Image, mimeType } },
    ]);
    return result.response.text();
  },

  async processVoiceText(transcribedText) {
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: SYSTEM_VOICE,
    });
    const result = await model.generateContent(transcribedText);
    return result.response.text();
  },

  async generateText(prompt, type = 'general') {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const system = WRITING_PROMPTS[type] ?? WRITING_PROMPTS.general;
    const result = await model.generateContent(`${system}\n\n${prompt}`);
    return result.response.text();
  },

  async streamText(prompt, onChunk) {
    const model = genAI.getGenerativeModel({ model: MODEL });
    const result = await model.generateContentStream(prompt);
    let fullText = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullText += text;
      onChunk(text, fullText);
    }
    return fullText;
  },
};
