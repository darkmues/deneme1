// Gemini REST API — API key yerine Google OAuth token kullanır
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
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

async function post(endpoint, body, token) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

function textPart(text) {
  return { parts: [{ text }] };
}

export const geminiService = {
  // Chat geçmişi ile mesaj gönder
  async sendMessage(token, message, history = []) {
    const contents = [
      ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const data = await post(`${MODEL}:generateContent`, {
      system_instruction: textPart(SYSTEM_CHAT),
      contents,
      generationConfig: { maxOutputTokens: 2048, temperature: 0.9 },
    }, token);

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  },

  // Görüntü analizi (Gemini Vision)
  async analyzeImage(token, base64Image, mimeType = 'image/jpeg', prompt = '') {
    const userPrompt =
      prompt ||
      'Bu görüntüyü detaylı şekilde analiz et. Ne görüyorsun? Renkleri, nesneleri, aktiviteleri ve dikkat çekici unsurları açıkla.';

    const data = await post(`${MODEL}:generateContent`, {
      contents: [{
        role: 'user',
        parts: [
          { text: userPrompt },
          { inlineData: { data: base64Image, mimeType } },
        ],
      }],
      generationConfig: { maxOutputTokens: 2048 },
    }, token);

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  },

  // Sesli asistan — transkript metnini işle
  async processVoiceText(token, transcribedText) {
    const data = await post(`${MODEL}:generateContent`, {
      system_instruction: textPart(SYSTEM_VOICE),
      contents: [{ role: 'user', parts: [{ text: transcribedText }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.8 },
    }, token);

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  },

  // Yazı üretici
  async generateText(token, prompt, type = 'general') {
    const system = WRITING_PROMPTS[type] ?? WRITING_PROMPTS.general;
    const fullPrompt = `${system}\n\n${prompt}`;

    const data = await post(`${MODEL}:generateContent`, {
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: 4096, temperature: 0.9 },
    }, token);

    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  },

  // Streaming metin üretimi (Server-Sent Events)
  async streamText(token, prompt, onChunk) {
    const res = await fetch(`${BASE_URL}/${MODEL}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4096, temperature: 0.9 },
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const json = JSON.parse(line.slice(6));
          const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (chunk) {
            fullText += chunk;
            onChunk(chunk, fullText);
          }
        } catch (_) { /* kısmi chunk, atla */ }
      }
    }

    return fullText;
  },
};
