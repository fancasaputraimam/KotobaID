import * as tf from '@tensorflow/tfjs';
import { azureOpenAI } from './azureOpenAI';

export interface PredictionResult {
  character: string;
  confidence: number;
  predictions: Array<{
    character: string;
    probability: number;
  }>;
}

export interface KanjiPracticeData {
  character: string;
  meaning: string;
  reading: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  strokes: number;
  jlptLevel?: string;
}

export type CharacterMode = 'hiragana' | 'katakana' | 'kanji';

class TensorFlowService {
  private hiraganaModel: tf.LayersModel | null = null;
  private katakanaModel: tf.LayersModel | null = null;
  private kanjiModel: tf.LayersModel | null = null;
  private isLoading = false;
  private modelCache = new Map<string, tf.LayersModel>();

  // Hiragana characters (46 basic characters)
  private hiraganaChars = [
    'あ', 'い', 'う', 'え', 'お',
    'か', 'き', 'く', 'け', 'こ',
    'さ', 'し', 'す', 'せ', 'そ',
    'た', 'ち', 'つ', 'て', 'と',
    'な', 'に', 'ぬ', 'ね', 'の',
    'は', 'ひ', 'ふ', 'へ', 'ほ',
    'ま', 'み', 'む', 'め', 'も',
    'や', 'ゆ', 'よ',
    'ら', 'り', 'る', 'れ', 'ろ',
    'わ', 'を', 'ん'
  ];

  // Katakana characters (46 basic characters)
  private katakanaChars = [
    'ア', 'イ', 'ウ', 'エ', 'オ',
    'カ', 'キ', 'ク', 'ケ', 'コ',
    'サ', 'シ', 'ス', 'セ', 'ソ',
    'タ', 'チ', 'ツ', 'テ', 'ト',
    'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
    'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
    'マ', 'ミ', 'ム', 'メ', 'モ',
    'ヤ', 'ユ', 'ヨ',
    'ラ', 'リ', 'ル', 'レ', 'ロ',
    'ワ', 'ヲ', 'ン'
  ];

  // Basic Kanji characters for practice
  private basicKanjiChars = [
    '一', '二', '三', '四', '五', '六', '七', '八', '九', '十',
    '人', '日', '月', '火', '水', '木', '金', '土', '年', '時',
    '大', '小', '中', '上', '下', '左', '右', '前', '後', '内',
    '外', '今', '来', '行', '見', '聞', '食', '飲', '読', '書',
    '話', '言', '思', '知', '学', '教', '生', '先', '友', '家'
  ];

  constructor() {
    this.initializeTensorFlow();
  }

  private async initializeTensorFlow() {
    try {
      // Set TensorFlow.js backend
      await tf.ready();
      console.log('TensorFlow.js initialized');
      console.log('Backend:', tf.getBackend());
    } catch (error) {
      console.error('Failed to initialize TensorFlow.js:', error);
    }
  }

  // Create a simple CNN model for character recognition
  private createCNNModel(numClasses: number): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        // Input layer - 64x64 grayscale images
        tf.layers.reshape({ 
          inputShape: [64, 64, 1], 
          targetShape: [64, 64, 1] 
        }),
        
        // First convolutional block
        tf.layers.conv2d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Second convolutional block
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Third convolutional block
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Flatten and dense layers
        tf.layers.flatten(),
        tf.layers.dense({
          units: 512,
          activation: 'relu'
        }),
        tf.layers.dropout({ rate: 0.5 }),
        
        // Output layer
        tf.layers.dense({
          units: numClasses,
          activation: 'softmax'
        })
      ]
    });

    // Compile the model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Load or create models for each character set
  async loadModel(mode: CharacterMode): Promise<tf.LayersModel> {
    if (this.modelCache.has(mode)) {
      return this.modelCache.get(mode)!;
    }

    try {
      // Try to load pre-trained model from URL or local storage
      const modelUrl = `/models/${mode}/model.json`;
      const model = await tf.loadLayersModel(modelUrl);
      this.modelCache.set(mode, model);
      console.log(`Loaded ${mode} model from URL`);
      return model;
    } catch (error) {
      console.log(`No pre-trained ${mode} model found, creating new one`);
      
      // Create new model based on character set
      let numClasses: number;
      switch (mode) {
        case 'hiragana':
          numClasses = this.hiraganaChars.length;
          break;
        case 'katakana':
          numClasses = this.katakanaChars.length;
          break;
        case 'kanji':
          numClasses = this.basicKanjiChars.length;
          break;
      }

      const model = this.createCNNModel(numClasses);
      this.modelCache.set(mode, model);
      return model;
    }
  }

  // Convert canvas to tensor for model input
  private canvasToTensor(canvas: HTMLCanvasElement): tf.Tensor4D {
    // Create a temporary canvas for preprocessing
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 64;
    tempCanvas.height = 64;
    const tempCtx = tempCanvas.getContext('2d')!;
    
    // Draw original canvas to temp canvas (resize to 64x64)
    tempCtx.fillStyle = 'white';
    tempCtx.fillRect(0, 0, 64, 64);
    tempCtx.drawImage(canvas, 0, 0, 64, 64);
    
    // Get image data
    const imageData = tempCtx.getImageData(0, 0, 64, 64);
    const data = imageData.data;
    
    // Convert to grayscale and normalize
    const grayscale = new Float32Array(64 * 64);
    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      grayscale[i / 4] = (255 - gray) / 255; // Invert colors (black on white)
    }
    
    // Create tensor
    return tf.tensor4d(grayscale, [1, 64, 64, 1]);
  }

  // Predict character from canvas
  async predictCharacter(canvas: HTMLCanvasElement, mode: CharacterMode): Promise<PredictionResult> {
    try {
      const model = await this.loadModel(mode);
      const tensor = this.canvasToTensor(canvas);
      
      // Make prediction
      const prediction = model.predict(tensor) as tf.Tensor;
      const probabilities = await prediction.data();
      
      // Get character set for this mode
      let characters: string[];
      switch (mode) {
        case 'hiragana':
          characters = this.hiraganaChars;
          break;
        case 'katakana':
          characters = this.katakanaChars;
          break;
        case 'kanji':
          characters = this.basicKanjiChars;
          break;
      }

      // Find top predictions
      const predictions = Array.from(probabilities)
        .map((prob, index) => ({
          character: characters[index],
          probability: prob
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);

      const topPrediction = predictions[0];
      
      // Clean up tensors
      tensor.dispose();
      prediction.dispose();

      return {
        character: topPrediction.character,
        confidence: topPrediction.probability * 100,
        predictions: predictions
      };
    } catch (error) {
      console.error('Error in character prediction:', error);
      
      // Return fallback prediction
      return {
        character: '?',
        confidence: 0,
        predictions: []
      };
    }
  }

  // Generate synthetic training data (for development/testing)
  private async generateSyntheticData(mode: CharacterMode, samplesPerClass: number = 100) {
    const characters = mode === 'hiragana' ? this.hiraganaChars : 
                     mode === 'katakana' ? this.katakanaChars : 
                     this.basicKanjiChars;
    
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    const images: Float32Array[] = [];
    const labels: number[] = [];
    
    for (let charIndex = 0; charIndex < characters.length; charIndex++) {
      const char = characters[charIndex];
      
      for (let sample = 0; sample < samplesPerClass; sample++) {
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 64, 64);
        
        // Draw character with slight variations
        ctx.fillStyle = 'black';
        ctx.font = `${32 + Math.random() * 8}px 'Noto Sans CJK JP', serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add slight position variation
        const x = 32 + (Math.random() - 0.5) * 4;
        const y = 32 + (Math.random() - 0.5) * 4;
        
        ctx.fillText(char, x, y);
        
        // Convert to tensor data
        const imageData = ctx.getImageData(0, 0, 64, 64);
        const data = imageData.data;
        const grayscale = new Float32Array(64 * 64);
        
        for (let i = 0; i < data.length; i += 4) {
          const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
          grayscale[i / 4] = (255 - gray) / 255;
        }
        
        images.push(grayscale);
        labels.push(charIndex);
      }
    }
    
    return { images, labels };
  }

  // Train model with synthetic data (for development)
  async trainModel(mode: CharacterMode, epochs: number = 10) {
    console.log(`Training ${mode} model...`);
    
    const model = await this.loadModel(mode);
    const { images, labels } = await this.generateSyntheticData(mode, 50);
    
    // Convert to tensors
    const xs = tf.tensor4d(
      images.reduce((acc, img) => acc.concat(Array.from(img)), []),
      [images.length, 64, 64, 1]
    );
    
    const ys = tf.oneHot(labels, mode === 'hiragana' ? this.hiraganaChars.length : 
                                mode === 'katakana' ? this.katakanaChars.length : 
                                this.basicKanjiChars.length);
    
    // Train the model
    await model.fit(xs, ys, {
      epochs,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
        }
      }
    });
    
    // Clean up
    xs.dispose();
    ys.dispose();
    
    console.log(`${mode} model training completed`);
  }

  // Get random Kanji for practice using AI
  async getRandomKanjiForPractice(): Promise<KanjiPracticeData> {
    try {
      const prompt = `
        Select a random Japanese Kanji character suitable for practice. 
        Provide information in JSON format:
        {
          "character": "the kanji character",
          "meaning": "English meaning",
          "reading": "hiragana reading",
          "difficulty": "beginner/intermediate/advanced",
          "strokes": number of strokes,
          "jlptLevel": "N5/N4/N3/N2/N1 or null"
        }
        
        Choose from commonly used Kanji that are good for handwriting practice.
      `;

      const response = await azureOpenAI.getChatResponse([
        { role: 'user', content: prompt }
      ]);

      try {
        const kanjiData = JSON.parse(response);
        return {
          character: kanjiData.character,
          meaning: kanjiData.meaning,
          reading: kanjiData.reading,
          difficulty: kanjiData.difficulty || 'intermediate',
          strokes: kanjiData.strokes || 5,
          jlptLevel: kanjiData.jlptLevel
        };
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Return fallback Kanji
        return this.getFallbackKanji();
      }
    } catch (error) {
      console.error('Error getting random Kanji:', error);
      return this.getFallbackKanji();
    }
  }

  private getFallbackKanji(): KanjiPracticeData {
    const fallbackKanjis = [
      { character: '人', meaning: 'person', reading: 'ひと', strokes: 2, jlptLevel: 'N5' },
      { character: '日', meaning: 'day, sun', reading: 'ひ', strokes: 4, jlptLevel: 'N5' },
      { character: '月', meaning: 'month, moon', reading: 'つき', strokes: 4, jlptLevel: 'N5' },
      { character: '火', meaning: 'fire', reading: 'ひ', strokes: 4, jlptLevel: 'N5' },
      { character: '水', meaning: 'water', reading: 'みず', strokes: 4, jlptLevel: 'N5' },
      { character: '木', meaning: 'tree, wood', reading: 'き', strokes: 4, jlptLevel: 'N5' },
      { character: '金', meaning: 'money, gold', reading: 'きん', strokes: 8, jlptLevel: 'N5' },
      { character: '土', meaning: 'earth, soil', reading: 'つち', strokes: 3, jlptLevel: 'N5' },
      { character: '大', meaning: 'big, large', reading: 'おおきい', strokes: 3, jlptLevel: 'N5' },
      { character: '小', meaning: 'small, little', reading: 'ちいさい', strokes: 3, jlptLevel: 'N5' }
    ];

    const randomKanji = fallbackKanjis[Math.floor(Math.random() * fallbackKanjis.length)];
    return {
      ...randomKanji,
      difficulty: 'beginner' as const
    };
  }

  // Calculate accuracy score by comparing predicted character with target
  calculateAccuracy(predictedChar: string, targetChar: string, confidence: number): number {
    if (predictedChar === targetChar) {
      return Math.min(confidence, 95); // Cap at 95% even for perfect matches
    }
    
    // If characters are different, return lower score based on confidence
    return Math.max(confidence * 0.3, 5); // Minimum 5% for effort
  }

  // Get character set for mode
  getCharacterSet(mode: CharacterMode): string[] {
    switch (mode) {
      case 'hiragana':
        return [...this.hiraganaChars];
      case 'katakana':
        return [...this.katakanaChars];
      case 'kanji':
        return [...this.basicKanjiChars];
    }
  }

  // Initialize models for all modes
  async initializeAllModels(): Promise<void> {
    try {
      await Promise.all([
        this.loadModel('hiragana'),
        this.loadModel('katakana'),
        this.loadModel('kanji')
      ]);
      console.log('All models initialized successfully');
    } catch (error) {
      console.error('Error initializing models:', error);
    }
  }

  // Train all models (for development)
  async trainAllModels(): Promise<void> {
    try {
      await this.trainModel('hiragana', 5);
      await this.trainModel('katakana', 5);
      await this.trainModel('kanji', 5);
      console.log('All models trained successfully');
    } catch (error) {
      console.error('Error training models:', error);
    }
  }

  // Save model to browser storage
  async saveModel(mode: CharacterMode): Promise<void> {
    try {
      const model = await this.loadModel(mode);
      await model.save(`localstorage://${mode}-model`);
      console.log(`${mode} model saved to local storage`);
    } catch (error) {
      console.error(`Error saving ${mode} model:`, error);
    }
  }

  // Load model from browser storage
  async loadModelFromStorage(mode: CharacterMode): Promise<tf.LayersModel | null> {
    try {
      const model = await tf.loadLayersModel(`localstorage://${mode}-model`);
      this.modelCache.set(mode, model);
      console.log(`${mode} model loaded from local storage`);
      return model;
    } catch (error) {
      console.log(`No ${mode} model found in local storage`);
      return null;
    }
  }

  // Clean up resources
  dispose(): void {
    this.modelCache.forEach((model) => {
      model.dispose();
    });
    this.modelCache.clear();
  }
}

export const tensorflowService = new TensorFlowService();