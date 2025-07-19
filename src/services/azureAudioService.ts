// Azure OpenAI Audio Service for TTS and STT
export interface TTSRequest {
  text: string;
  voice?: string;
  speed?: number;
  format?: 'mp3' | 'ogg' | 'wav';
}

export interface STTRequest {
  audioBlob: Blob;
  language?: string;
}

export interface AudioResponse {
  audioUrl?: string;
  transcription?: string;
  error?: string;
}

export interface PronunciationResult {
  isCorrect: boolean;
  feedback: string;
  score?: number;
  highlightedText?: string;
}

class AzureAudioService {
  private getDevPanelSettings() {
    try {
      const savedSettings = localStorage.getItem('kotobaid-api-settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error('Error loading dev panel settings:', error);
    }
    return null;
  }

  private getTTSConfig() {
    const settings = this.getDevPanelSettings();
    if (settings?.textToSpeech?.enabled && settings.textToSpeech.endpoint && settings.textToSpeech.apiKey) {
      return {
        endpoint: settings.textToSpeech.endpoint,
        apiKey: settings.textToSpeech.apiKey,
        model: settings.textToSpeech.model || 'gpt-4o-mini-tts',
        voice: settings.textToSpeech.voice || 'nova'
      };
    }
    throw new Error('TTS not configured in dev panel. Please configure Text-to-Speech settings in API Settings.');
  }

  private getSTTConfig() {
    const settings = this.getDevPanelSettings();
    if (settings?.speechToText?.enabled && settings.speechToText.endpoint && settings.speechToText.apiKey) {
      return {
        endpoint: settings.speechToText.endpoint,
        apiKey: settings.speechToText.apiKey,
        model: settings.speechToText.model || 'gpt-4o-transcribe',
        language: settings.speechToText.language || 'ja'
      };
    }
    throw new Error('STT not configured in dev panel. Please configure Speech-to-Text settings in API Settings.');
  }
  
  // Japanese voices available
  private japaneseVoices = [
    'ja-JP-NanamiNeural', // Female, natural
    'ja-JP-KeitaNeural',  // Male, natural
    'ja-JP-AoiNeural',    // Female, natural
    'ja-JP-DaichiNeural', // Male, natural
    'ja-JP-MayuNeural',   // Female, natural
    'ja-JP-NaokiNeural',  // Male, natural
    'ja-JP-ShioriNeural'  // Female, natural
  ];

  constructor() {}

  // Text-to-Speech: Convert Japanese text to audio using Azure OpenAI
  async textToSpeech(request: TTSRequest): Promise<AudioResponse> {
    try {
      const config = this.getTTSConfig();
      const voice = request.voice || config.voice;
      const speed = request.speed || 1.0;
      const format = request.format || 'mp3';

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'api-key': config.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model,
          input: request.text,
          voice: voice,
          response_format: format,
          speed: speed
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS Error:', errorText);
        return { error: `TTS failed: ${response.status} ${errorText}` };
      }

      // Get audio blob from response
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return { audioUrl };
    } catch (error) {
      console.error('TTS Error:', error);
      return { error: `TTS failed: ${error}` };
    }
  }

  // Speech-to-Text: Convert audio to Japanese text using Azure OpenAI
  async speechToText(request: STTRequest): Promise<AudioResponse> {
    try {
      const config = this.getSTTConfig();
      const formData = new FormData();
      formData.append('file', request.audioBlob, 'audio.wav');
      formData.append('model', config.model);
      formData.append('language', request.language || config.language);
      formData.append('response_format', 'json');

      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'api-key': config.apiKey
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('STT Error:', errorText);
        return { error: `STT failed: ${response.status} ${errorText}` };
      }

      const result = await response.json();
      return { transcription: result.text || '' };
    } catch (error) {
      console.error('STT Error:', error);
      return { error: `STT failed: ${error}` };
    }
  }

  // Check pronunciation using configured Azure OpenAI
  async checkPronunciation(userText: string, correctText: string): Promise<PronunciationResult> {
    try {
      const settings = this.getDevPanelSettings();
      if (!settings?.azureOpenAI?.enabled || !settings.azureOpenAI.backendEndpoint || !settings.azureOpenAI.apiKey) {
        throw new Error('Azure OpenAI not configured in dev panel for pronunciation checking.');
      }

      const prompt = `Kamu adalah guru bahasa Jepang.
Bandingkan dua teks berikut:
- Jawaban benar: ${correctText}
- Ucapan user: ${userText}

Jika benar → jawab hanya: "✅ Pelafalan Benar!"
Jika salah → jawab hanya:
"❌ Salah. Perbaiki di suku kata [SEBUT SUKU KATA YANG SALAH].
Contoh yang benar: ${correctText}"`;

      const response = await fetch(settings.azureOpenAI.backendEndpoint, {
        method: 'POST',
        headers: {
          'api-key': settings.azureOpenAI.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 150,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const feedback = result.choices[0]?.message?.content || 'Tidak dapat memproses';
      
      const isCorrect = feedback.includes('✅');
      
      return {
        isCorrect,
        feedback
      };
    } catch (error) {
      console.error('Pronunciation check error:', error);
      return {
        isCorrect: false,
        feedback: 'Error: Tidak dapat memeriksa pelafalan'
      };
    }
  }

  // Check pronunciation with scoring for shadowing mode
  async checkPronunciationWithScore(userText: string, correctText: string): Promise<PronunciationResult> {
    try {
      const prompt = `Kamu adalah guru bahasa Jepang.
Bandingkan dua teks berikut:
- Jawaban benar: ${correctText}
- Ucapan user: ${userText}

Beri skor 0-100 berdasarkan kemiripan pelafalan per suku kata.
Tunjukkan kata yang salah dengan highlight merah.

Format jawaban:
Skor: [0-100]
Kata salah: [kata1, kata2] (atau "Tidak ada" jika semua benar)
Feedback: [penjelasan singkat]`;

      const settings = this.getDevPanelSettings();
      if (!settings?.azureOpenAI?.enabled || !settings.azureOpenAI.backendEndpoint || !settings.azureOpenAI.apiKey) {
        throw new Error('Azure OpenAI not configured in dev panel.');
      }

      const response = await fetch(settings.azureOpenAI.backendEndpoint, {
        method: 'POST',
        headers: {
          'api-key': settings.azureOpenAI.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const feedback = result.choices[0]?.message?.content || 'Tidak dapat memproses';
      
      // Parse score from feedback
      const scoreMatch = feedback.match(/Skor:\s*(\d+)/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
      
      const isCorrect = score >= 80;
      
      return {
        isCorrect,
        feedback,
        score,
        highlightedText: userText // For now, we'll implement highlighting in the UI
      };
    } catch (error) {
      console.error('Pronunciation scoring error:', error);
      return {
        isCorrect: false,
        feedback: 'Error: Tidak dapat memeriksa pelafalan',
        score: 0
      };
    }
  }

  // Check translation for listening test
  async checkTranslation(userTranslation: string, correctTranslation: string): Promise<PronunciationResult> {
    try {
      const prompt = `Apakah terjemahan "${userTranslation}" sama dengan "${correctTranslation}"?
Jawab hanya:
✅ Benar
❌ Salah. Jawaban benar: ${correctTranslation}`;

      const settings = this.getDevPanelSettings();
      if (!settings?.azureOpenAI?.enabled || !settings.azureOpenAI.backendEndpoint || !settings.azureOpenAI.apiKey) {
        throw new Error('Azure OpenAI not configured in dev panel.');
      }

      const response = await fetch(settings.azureOpenAI.backendEndpoint, {
        method: 'POST',
        headers: {
          'api-key': settings.azureOpenAI.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 100,
          temperature: 0.2
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      const feedback = result.choices[0]?.message?.content || 'Tidak dapat memproses';
      
      const isCorrect = feedback.includes('✅');
      
      return {
        isCorrect,
        feedback
      };
    } catch (error) {
      console.error('Translation check error:', error);
      return {
        isCorrect: false,
        feedback: 'Error: Tidak dapat memeriksa terjemahan'
      };
    }
  }

  // Get available Japanese voices
  getJapaneseVoices(): string[] {
    return [...this.japaneseVoices];
  }

  // Clean up audio URLs to prevent memory leaks
  cleanupAudioUrl(url: string): void {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // Record audio from microphone
  async recordAudio(maxDurationMs: number = 5000): Promise<Blob | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks: BlobPart[] = [];

      return new Promise((resolve) => {
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          stream.getTracks().forEach(track => track.stop());
          resolve(audioBlob);
        };

        mediaRecorder.start();

        // Stop recording after maxDuration
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, maxDurationMs);
      });
    } catch (error) {
      console.error('Recording error:', error);
      return null;
    }
  }

  // Play audio from URL
  async playAudio(audioUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Audio playback failed'));
      
      audio.play().catch(reject);
    });
  }
}

export const azureAudioService = new AzureAudioService();