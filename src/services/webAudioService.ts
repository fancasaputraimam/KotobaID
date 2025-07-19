// Web Audio Service using browser APIs that actually work
export interface AudioSettings {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface RecordingResult {
  text: string;
  confidence: number;
}

export interface PronunciationFeedback {
  isCorrect: boolean;
  score: number;
  feedback: string;
  suggestions: string[];
}

class WebAudioService {
  private synthesis: SpeechSynthesis;
  private recognition: any; // SpeechRecognition
  private voices: SpeechSynthesisVoice[] = [];
  private isListening = false;
  
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeVoices();
    this.initializeSpeechRecognition();
  }

  // Initialize voices
  private async initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoices = () => {
        this.voices = this.synthesis.getVoices();
        if (this.voices.length > 0) {
          resolve();
        }
      };

      loadVoices();
      if (this.voices.length === 0) {
        this.synthesis.onvoiceschanged = loadVoices;
      }
    });
  }

  // Initialize speech recognition
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'ja-JP';
    } else if ('SpeechRecognition' in window) {
      this.recognition = new (window as any).SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'ja-JP';
    }
  }

  // Get Japanese voices
  getJapaneseVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter(voice => 
      voice.lang.startsWith('ja') || 
      voice.name.includes('Japanese') ||
      voice.name.includes('Japan')
    );
  }

  // Text-to-Speech
  async speak(text: string, settings: AudioSettings = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text.trim()) {
        reject(new Error('No text provided'));
        return;
      }

      // Stop any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Find Japanese voice or use default
      const japaneseVoices = this.getJapaneseVoices();
      if (japaneseVoices.length > 0) {
        utterance.voice = japaneseVoices.find(v => v.name.includes(settings.voice || '')) || japaneseVoices[0];
      }

      // Set speech settings
      utterance.rate = settings.rate || 0.8;
      utterance.pitch = settings.pitch || 1;
      utterance.volume = settings.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);

      this.synthesis.speak(utterance);
    });
  }

  // Speech-to-Text
  async listen(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.isListening = true;

      this.recognition.onresult = (event: any) => {
        const result = event.results[0];
        const text = result[0].transcript;
        const confidence = result[0].confidence || 0.5;
        
        this.isListening = false;
        resolve({ text, confidence });
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  // Stop listening
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Stop speaking
  stopSpeaking(): void {
    this.synthesis.cancel();
  }

  // Simple pronunciation check (basic similarity)
  checkPronunciation(userText: string, correctText: string): PronunciationFeedback {
    const normalizeText = (text: string) => {
      return text.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[。、！？]/g, '');
    };

    const userNorm = normalizeText(userText);
    const correctNorm = normalizeText(correctText);

    // Calculate similarity
    const similarity = this.calculateSimilarity(userNorm, correctNorm);
    const score = Math.round(similarity * 100);

    let feedback = '';
    let suggestions: string[] = [];
    let isCorrect = false;

    if (score >= 90) {
      isCorrect = true;
      feedback = '✅ 素晴らしい! Perfect pronunciation!';
    } else if (score >= 70) {
      feedback = '🟡 とても良い! Very good, with minor improvements needed.';
      suggestions = ['Try to speak more clearly', 'Pay attention to long vowels'];
    } else if (score >= 50) {
      feedback = '🟠 良い努力! Good effort, but needs more practice.';
      suggestions = ['Practice slowly first', 'Listen to the model again', 'Focus on each syllable'];
    } else {
      feedback = '🔴 もう一度! Let\'s try again.';
      suggestions = ['Listen carefully to the model', 'Speak slowly and clearly', 'Break down into smaller parts'];
    }

    return {
      isCorrect,
      score,
      feedback,
      suggestions
    };
  }

  // Calculate text similarity (Levenshtein distance)
  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const maxLen = Math.max(len1, len2);
    return 1 - matrix[len1][len2] / maxLen;
  }

  // Check if speech synthesis is available
  isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // Check if speech recognition is available
  isSpeechRecognitionSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  // Get current listening state
  getIsListening(): boolean {
    return this.isListening;
  }

  // Record audio using MediaRecorder (for more advanced features)
  async recordAudio(duration: number = 5000): Promise<Blob | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream);
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

        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, duration);
      });
    } catch (error) {
      console.error('Recording error:', error);
      return null;
    }
  }

  // Play audio from blob
  async playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(blob);
      
      audio.src = url;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Audio playback failed'));
      };
      
      audio.play().catch(reject);
    });
  }

  // Clean up resources
  cleanup(): void {
    this.stopSpeaking();
    this.stopListening();
  }
}

export const webAudioService = new WebAudioService();