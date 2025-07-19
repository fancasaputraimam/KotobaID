
// Azure OpenAI Service Integration
// Note: This service calls a backend API that uses Azure OpenAI credentials

export interface AzureOpenAIRequest {
  prompt: string;
  type: 'kanji-explanation' | 'grammar-explanation' | 'translation' | 'conversation';
  context?: string;
}

export interface AzureOpenAIResponse {
  text: string;
  confidence: number;
}

class AzureOpenAIService {
  private getAPIEndpointAndKeyAndModel(): { endpoint: string, apiKey: string, model: string } {
    const savedSettings = localStorage.getItem('kotobaid-api-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.azureOpenAI?.backendEndpoint && settings.azureOpenAI?.apiKey && settings.azureOpenAI?.model) {
          return {
            endpoint: settings.azureOpenAI.backendEndpoint,
            apiKey: settings.azureOpenAI.apiKey,
            model: settings.azureOpenAI.model
          };
        }
      } catch (error) {
        console.error('Error parsing saved API settings:', error);
      }
    }
    throw new Error('Azure OpenAI endpoint, API key, dan model belum diatur di pengaturan admin.');
  }

  async generateExplanation(request: AzureOpenAIRequest): Promise<AzureOpenAIResponse> {
    try {
      const { endpoint, apiKey, model } = this.getAPIEndpointAndKeyAndModel();
      let requestBody: any = {};
      let messages: any[] = [];
      let maxTokens = 128;
      let systemPrompt = '';
      // Deteksi kata kunci untuk permintaan daftar pada semua topik
      const userPromptLower = request.prompt.toLowerCase();
      const isListRequest =
        userPromptLower.includes('contoh') ||
        userPromptLower.includes('daftar') ||
        userPromptLower.includes('list') ||
        userPromptLower.includes('sebutkan');
      switch (request.type) {
        case 'translation':
          systemPrompt = 'You are a helpful AI that translates Japanese to Indonesian. Jawab sangat singkat, hanya hasil terjemahan saja, tanpa penjelasan.';
          maxTokens = 64;
          messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: request.prompt }
          ];
          break;
        case 'kanji-explanation':
        case 'grammar-explanation':
        case 'conversation':
          if (isListRequest) {
            systemPrompt = 'Jawab hanya dengan daftar sesuai permintaan user (misal: daftar kanji, kosakata, grammar, kalimat, dsb), tanpa penjelasan tambahan, tanpa tips belajar, tanpa instruksi tambahan.';
            maxTokens = 128;
          } else if (request.type === 'kanji-explanation') {
            systemPrompt = 'You are a helpful AI that explains Japanese kanji in Indonesian. Jawab langsung, relevan, dan detail sesuai permintaan user. Jangan pernah meminta user memperjelas pertanyaan, jangan balas dengan permintaan klarifikasi, dan jangan meminta user untuk memasukkan pertanyaan lain.';
            maxTokens = 512;
          } else if (request.type === 'grammar-explanation') {
            systemPrompt = 'You are a helpful AI that explains Japanese grammar in Indonesian. Jawab langsung, relevan, dan detail sesuai permintaan user. Jangan pernah meminta user memperjelas pertanyaan, jangan balas dengan permintaan klarifikasi, dan jangan meminta user untuk memasukkan pertanyaan lain.';
            maxTokens = 512;
          } else {
            systemPrompt = `You are an expert assistant for Japanese language learners. Jawab pertanyaan user secara langsung, relevan, dan spesifik sesuai permintaan. Jangan menambah penjelasan yang tidak diminta. Jika user meminta daftar, jawab dengan daftar. Jika user meminta penjelasan, jawab dengan penjelasan. Jangan pernah meminta user memperjelas pertanyaan, jangan balas dengan permintaan klarifikasi, dan jangan meminta user untuk memasukkan pertanyaan lain. Jika pertanyaan tidak relevan dengan bahasa Jepang, balas: 'Maaf, saya hanya dapat membantu pertanyaan seputar bahasa Jepang.'`;
            maxTokens = 512;
          }
          messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: request.prompt }
          ];
          break;
        default:
          systemPrompt = 'You are a helpful AI assistant.';
          maxTokens = 512;
          messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: request.prompt }
          ];
      }
      requestBody = {
        model,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7
      };
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      // Azure OpenAI response format
      const text = data.choices?.[0]?.message?.content || '';
      return {
        text,
        confidence: 0.95
      };
    } catch (error) {
      console.error('Azure OpenAI Error:', error);
      throw error;
    }
  }


  async translateToIndonesian(text: string): Promise<string> {
    const request: AzureOpenAIRequest = {
      prompt: text, // Kirim langsung kalimat aslinya
      type: 'translation',
    };
    const response = await this.generateExplanation(request);
    // Post-processing: hilangkan awalan "Terjemahan Indonesia:" jika ada
    let result = response.text.trim();
    if (result.toLowerCase().startsWith('terjemahan indonesia:')) {
      result = result.replace(/^terjemahan indonesia:/i, '').trim();
    }
    // Hilangkan tanda kutip di awal/akhir jika ada
    result = result.replace(/^['"]|['"]$/g, '').trim();
    // Filter jika AI membalas dengan prompt balik atau instruksi
    const lower = result.toLowerCase();
    if (
      lower.includes('silakan tuliskan teks jepang') ||
      lower.includes('masukkan teks jepang') ||
      lower.includes('please provide') ||
      lower.includes('harap masukkan') ||
      lower.includes('tolong berikan teks dalam bahasa jepang') ||
      lower.includes('anda meminta terjemahan dari bahasa jepang ke bahasa indonesia') ||
      lower.includes('mohon berikan teks dalam bahasa jepang') ||
      lower.includes('mohon masukkan teks dalam bahasa jepang') ||
      lower.includes('please enter the japanese text') ||
      lower.includes('please provide the japanese text') ||
      lower.includes('berikan teks jepang') ||
      lower.includes('please input japanese text') ||
      lower.includes('please enter japanese text') ||
      lower.includes('please provide japanese text') ||
      lower.includes('harap berikan teks dalam bahasa jepang')
    ) {
      result = '';
    }
    return result;
  }

  async explainKanji(kanji: string, context?: string): Promise<string> {
    const request: AzureOpenAIRequest = {
      prompt: `Jelaskan kanji berikut dalam bahasa Indonesia: ${kanji}`,
      type: 'kanji-explanation',
      context,
    };
    const response = await this.generateExplanation(request);
    let result = response.text.trim();
    // Terapkan filter yang sama untuk explainKanji dan explainGrammar
    if (result) {
      const lower = result.toLowerCase();
      if (
        lower.includes('silakan tuliskan teks jepang') ||
        lower.includes('masukkan teks jepang') ||
        lower.includes('please provide') ||
        lower.includes('harap masukkan') ||
        lower.includes('tolong berikan teks dalam bahasa jepang') ||
        lower.includes('anda meminta terjemahan dari bahasa jepang ke bahasa indonesia') ||
        lower.includes('mohon berikan teks dalam bahasa jepang') ||
        lower.includes('mohon masukkan teks dalam bahasa jepang') ||
        lower.includes('please enter the japanese text') ||
        lower.includes('please provide the japanese text') ||
        lower.includes('berikan teks jepang') ||
        lower.includes('please input japanese text') ||
        lower.includes('please enter japanese text') ||
        lower.includes('please provide japanese text') ||
        lower.includes('harap berikan teks dalam bahasa jepang')
      ) {
        result = '';
      }
    }
    return result;
  }

  async explainGrammar(grammar: string, examples: string[]): Promise<string> {
    const request: AzureOpenAIRequest = {
      prompt: `Jelaskan pola tata bahasa Jepang berikut dalam bahasa Indonesia: ${grammar}` + (examples.length > 0 ? `\nContoh: ${examples.join(', ')}` : ''),
      type: 'grammar-explanation',
      context: undefined,
    };
    const response = await this.generateExplanation(request);
    let result = response.text.trim();
    if (result) {
      const lower = result.toLowerCase();
      if (
        lower.includes('silakan tuliskan teks jepang') ||
        lower.includes('masukkan teks jepang') ||
        lower.includes('please provide') ||
        lower.includes('harap masukkan') ||
        lower.includes('tolong berikan teks dalam bahasa jepang') ||
        lower.includes('anda meminta terjemahan dari bahasa jepang ke bahasa indonesia') ||
        lower.includes('mohon berikan teks dalam bahasa jepang') ||
        lower.includes('mohon masukkan teks dalam bahasa jepang') ||
        lower.includes('please enter the japanese text') ||
        lower.includes('please provide the japanese text') ||
        lower.includes('berikan teks jepang') ||
        lower.includes('please input japanese text') ||
        lower.includes('please enter japanese text') ||
        lower.includes('please provide japanese text') ||
        lower.includes('harap berikan teks dalam bahasa jepang')
      ) {
        result = '';
      }
    }
    return result;
  }

  async getChatResponse(messages: Array<{role: 'user'|'ai', content: string}>): Promise<string> {
    try {
      // Convert messages to the format expected by Azure OpenAI
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      }));

      // Get the latest user message for context
      const latestUserMessage = messages.filter(msg => msg.role === 'user').pop();
      if (!latestUserMessage) {
        throw new Error('No user message found');
      }

      // Check if this is a kanji search request
      const isKanjiSearch = latestUserMessage.content.includes('WAJIB berikan respons dalam format JSON');
      
      if (isKanjiSearch) {
        // Use direct API call for kanji search with proper system message
        const { endpoint, apiKey, model } = this.getAPIEndpointAndKeyAndModel();
        
        const systemPrompt = `You are a Japanese kanji expert. You must respond ONLY with valid JSON format. Do not include any text before or after the JSON. Analyze the user's input and provide comprehensive information about the most relevant kanji. If the input is in Indonesian, find the kanji that matches that meaning. If it's hiragana/katakana, find the kanji with that reading. Always provide complete, accurate information.`;
        
        const requestBody = {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: latestUserMessage.content }
          ],
          max_tokens: 1000,
          temperature: 0.3
        };

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': apiKey,
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      } else {
        // Use the original method for non-kanji searches
        const request: AzureOpenAIRequest = {
          prompt: latestUserMessage.content,
          type: 'conversation',
          context: messages.slice(-5).map(msg => `${msg.role}: ${msg.content}`).join('\n')
        };

        const response = await this.generateExplanation(request);
        return response.text;
      }
    } catch (error) {
      console.error('getChatResponse Error:', error);
      return 'Maaf, terjadi kesalahan saat memproses permintaan Anda. Silakan coba lagi atau periksa pengaturan API.';
    }
  }
}

export const azureOpenAI = new AzureOpenAIService();