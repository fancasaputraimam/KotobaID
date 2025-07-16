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
      
      // Fallback to mock responses if backend is not available
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Backend not available, using mock responses');
        console.warn(`Tried to connect to: ${endpoint || baseEndpoint}`);
        console.warn('Make sure backend server is running on the correct URL');
        console.warn('Check API settings in Admin Panel → Pengaturan API');
        return this.getMockResponse(request);
      }
      
      throw new Error(`Gagal mendapatkan respons dari AI. Pastikan backend server berjalan di: ${this.getAPIEndpoint()}`);
    }
  }

  private getMockResponse(request: VertexAIRequest): VertexAIResponse {
    let mockResponse = '';
    
    switch (request.type) {
      case 'translation':
        mockResponse = this.getMockTranslation(request.prompt);
        break;
      case 'kanji-explanation':
        mockResponse = this.getMockKanjiExplanation(request.prompt);
        break;
      case 'grammar-explanation':
        mockResponse = this.getMockGrammarExplanation(request.prompt);
        break;
      default:
        mockResponse = 'Penjelasan AI tidak tersedia untuk tipe ini.';
    }

    return {
      text: mockResponse,
      confidence: 0.85
    };
  }

  private getMockTranslation(prompt: string): string {
    // Extract text to translate from prompt
    const match = prompt.match(/translate.*?["'](.+?)["']/i);
    const textToTranslate = match ? match[1] : 'teks';
    
    return `Terjemahan Indonesia: "${textToTranslate}" berarti [terjemahan dalam bahasa Indonesia]. 

Catatan: Ini adalah respons simulasi. Untuk menggunakan AI Gemini yang sesungguhnya, Anda perlu mengimplementasikan backend API yang menggunakan service account credentials Anda.`;
  }

  private getMockKanjiExplanation(prompt: string): string {
    const kanjiMatch = prompt.match(/kanji ["'](.+?)["']/i);
    const kanji = kanjiMatch ? kanjiMatch[1] : '漢字';
    
    return `Penjelasan Kanji "${kanji}":

Kanji ini memiliki makna dan penggunaan yang kaya dalam bahasa Jepang. Secara historis, kanji ini berasal dari sistem tulisan Tiongkok dan telah diadaptasi ke dalam bahasa Jepang.

Penggunaan dalam kehidupan sehari-hari:
- Sering digunakan dalam konteks formal dan informal
- Memiliki beberapa cara baca (onyomi dan kunyomi)
- Dapat dikombinasikan dengan kanji lain untuk membentuk kata majemuk

Catatan: Ini adalah respons simulasi. Untuk penjelasan AI Gemini yang sesungguhnya, implementasikan backend API dengan service account Anda.`;
  }

  private getMockGrammarExplanation(prompt: string): string {
    const grammarMatch = prompt.match(/grammar pattern ["'](.+?)["']/i);
    const grammar = grammarMatch ? grammarMatch[1] : 'tata bahasa';
    
    return `Penjelasan Tata Bahasa "${grammar}":

Pola tata bahasa ini adalah salah satu struktur penting dalam bahasa Jepang yang perlu dipahami dengan baik.

Cara penggunaan:
1. Struktur dasar mengikuti pola tertentu
2. Digunakan dalam situasi formal dan informal
3. Memiliki nuansa makna yang spesifik

Contoh penggunaan dalam kalimat:
- Dalam konteks percakapan sehari-hari
- Dalam tulisan formal
- Dalam ekspresi perasaan atau pendapat

Catatan: Ini adalah respons simulasi. Untuk penjelasan AI Gemini yang sesungguhnya, implementasikan backend API dengan service account Anda.`;
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