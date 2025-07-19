import apiConfig from '../config/api';

// Vertex AI Service for Google Gemini Integration
// Note: This service calls a backend API that uses the service account credentials

export interface VertexAIRequest {
  prompt: string;
  type: 'kanji-explanation' | 'grammar-explanation' | 'translation' | 'conversation';
  context?: string;
}

export interface VertexAIResponse {
  text: string;
  confidence: number;
}

class VertexAIService {
  private getAPIEndpoint(): string {
    // Check if custom endpoint is set in admin settings
    const savedSettings = localStorage.getItem('kotobaid-api-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.vertexAI?.backendEndpoint) {
          const endpoint = settings.vertexAI.backendEndpoint;
          return endpoint.endsWith('/api/vertexai') ? endpoint : `${endpoint}/api/vertexai`;
        }
      } catch (error) {
        console.error('Error parsing saved API settings:', error);
      }
    }
    
    // Fallback to default configuration
    return apiConfig.getVertexAIEndpoints().translate.replace('/translate', '');
  }

  async generateExplanation(request: VertexAIRequest): Promise<VertexAIResponse> {
    try {
      const baseEndpoint = this.getAPIEndpoint();
      let endpoint = '';
      let requestBody: any = {};

      switch (request.type) {
        case 'translation':
          endpoint = `${baseEndpoint}/translate`;
          // Extract text from prompt
          const textMatch = request.prompt.match(/translate.*?["'](.+?)["']/i) || 
                           request.prompt.match(/following text.*?["'](.+?)["']/i) ||
                           request.prompt.match(/: "(.+?)"/);
          const textToTranslate = textMatch ? textMatch[1] : request.prompt;
          requestBody = {
            text: textToTranslate,
            targetLanguage: 'Indonesian'
          };
          break;
        case 'kanji-explanation':
          endpoint = `${baseEndpoint}/explain-kanji`;
          const kanjiMatch = request.prompt.match(/kanji ["'](.+?)["']/i) ||
                            request.prompt.match(/Explain the kanji ["'](.+?)["']/i);
          const kanji = kanjiMatch ? kanjiMatch[1] : request.prompt;
          requestBody = {
            kanji: kanji,
            context: request.context
          };
          break;
        case 'grammar-explanation':
          endpoint = `${baseEndpoint}/explain-grammar`;
          const grammarMatch = request.prompt.match(/grammar pattern ["'](.+?)["']/i) ||
                              request.prompt.match(/pattern ["'](.+?)["']/i);
          const grammar = grammarMatch ? grammarMatch[1] : request.prompt;
          requestBody = {
            grammar: grammar,
            examples: [],
            context: request.context
          };
          break;
        default:
          endpoint = `${baseEndpoint}/chat`;
          requestBody = {
            message: request.prompt,
            context: request.context
          };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      let responseText = '';
      switch (request.type) {
        case 'translation':
          responseText = data.translation;
          break;
        case 'kanji-explanation':
          responseText = data.explanation;
          break;
        case 'grammar-explanation':
          responseText = data.explanation;
          break;
        default:
          responseText = data.aiResponse || data.response;
      }

      return {
        text: responseText,
        confidence: data.confidence || 0.9
      };
    } catch (error) {
      console.error('Vertex AI Error:', error);
      
      throw new Error(`Gagal mendapatkan respons dari AI. Pastikan backend server berjalan di: ${this.getAPIEndpoint()}`);
    }
  }


  async translateToIndonesian(text: string): Promise<string> {
    const request: VertexAIRequest = {
      prompt: `Translate the following text to Indonesian: "${text}"`,
      type: 'translation',
    };

    const response = await this.generateExplanation(request);
    return response.text;
  }

  async explainKanji(kanji: string, context?: string): Promise<string> {
    const request: VertexAIRequest = {
      prompt: `Explain the kanji "${kanji}"`,
      type: 'kanji-explanation',
      context,
    };

    const response = await this.generateExplanation(request);
    return response.text;
  }

  async explainGrammar(grammar: string, examples: string[]): Promise<string> {
    const request: VertexAIRequest = {
      prompt: `Explain the Japanese grammar pattern "${grammar}"`,
      type: 'grammar-explanation',
      context: examples.length > 0 ? `Examples: ${examples.join(', ')}` : undefined,
    };

    const response = await this.generateExplanation(request);
    return response.text;
  }
}

export const vertexAI = new VertexAIService();