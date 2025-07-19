import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Play, 
  Pause, 
  RotateCcw, 
  Timer, 
  Eye, 
  EyeOff, 
  Volume2,
  CheckCircle,
  RefreshCw,
  Target,
  Trophy,
  Clock,
  Lightbulb,
  BookMarked,
  Zap
} from 'lucide-react';
import { azureAudioService } from '../../services/azureAudioService';
import ReadingQuizNew from './ReadingQuizNew';

interface ReadingText {
  id: string;
  title: string;
  level: string;
  category: string;
  content: string;
  furigana: string;
  translation: string;
  wordCount: number;
  estimatedTime: number;
  vocabulary: Array<{
    word: string;
    reading: string;
    meaning: string;
    pos: string; // part of speech
  }>;
  culturalNotes?: string[];
}

interface ReadingStats {
  startTime: number;
  wordsRead: number;
  wpm: number;
  timeSpent: number;
}

interface HoverWord {
  word: string;
  reading: string;
  meaning: string;
  x: number;
  y: number;
}

const ReadingPractice: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string>('N5');
  const [selectedCategory, setSelectedCategory] = useState<string>('daily-life');
  const [currentText, setCurrentText] = useState<ReadingText | null>(null);
  const [showFurigana, setShowFurigana] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [readingStats, setReadingStats] = useState<ReadingStats | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoverWord, setHoverWord] = useState<HoverWord | null>(null);
  const [highlightedWords, setHighlightedWords] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  
  const readingRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const levels = [
    { value: 'N5', label: 'N5 - Pemula', color: 'bg-green-100 text-green-700' },
    { value: 'N4', label: 'N4 - Dasar', color: 'bg-blue-100 text-blue-700' },
    { value: 'N3', label: 'N3 - Menengah', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'N2', label: 'N2 - Lanjutan', color: 'bg-orange-100 text-orange-700' },
    { value: 'N1', label: 'N1 - Mahir', color: 'bg-red-100 text-red-700' }
  ];

  const categories = [
    { value: 'daily-life', label: 'Kehidupan Sehari-hari', icon: '🏠' },
    { value: 'culture', label: 'Budaya', icon: '🎌' },
    { value: 'news', label: 'Berita', icon: '📰' },
    { value: 'story', label: 'Cerita', icon: '📚' },
    { value: 'conversation', label: 'Percakapan', icon: '💬' },
    { value: 'business', label: 'Bisnis', icon: '💼' }
  ];

  const sampleTexts: Record<string, ReadingText[]> = {
    N5: [
      {
        id: 'n5-1',
        title: 'わたしの家族',
        level: 'N5',
        category: 'daily-life',
        content: 'わたしは田中です。家族は四人います。父、母、兄、そしてわたしです。父は会社員です。母は主婦です。兄は大学生です。わたしは高校生です。毎日、家族でご飯を食べます。とても楽しいです。',
        furigana: 'わたしは<ruby>田<rt>た</rt>中<rt>なか</rt></ruby>です。<ruby>家<rt>か</rt>族<rt>ぞく</rt></ruby>は<ruby>四<rt>よん</rt>人<rt>にん</rt></ruby>います。<ruby>父<rt>ちち</rt></ruby>、<ruby>母<rt>はは</rt></ruby>、<ruby>兄<rt>あに</rt></ruby>、そしてわたしです。<ruby>父<rt>ちち</rt></ruby>は<ruby>会<rt>かい</rt>社<rt>しゃ</rt>員<rt>いん</rt></ruby>です。<ruby>母<rt>はは</rt></ruby>は<ruby>主<rt>しゅ</rt>婦<rt>ふ</rt></ruby>です。<ruby>兄<rt>あに</rt></ruby>は<ruby>大<rt>だい</rt>学<rt>がく</rt>生<rt>せい</rt></ruby>です。わたしは<ruby>高<rt>こう</rt>校<rt>こう</rt>生<rt>せい</rt></ruby>です。<ruby>毎<rt>まい</rt>日<rt>にち</rt></ruby>、<ruby>家<rt>か</rt>族<rt>ぞく</rt></ruby>で<ruby>ご<rt></rt>飯<rt>はん</rt></ruby>を<ruby>食<rt>た</rt></ruby>べます。とても<ruby>楽<rt>たの</rt></ruby>しいです。',
        translation: 'Saya Tanaka. Keluarga saya ada empat orang. Ayah, ibu, kakak laki-laki, dan saya. Ayah adalah karyawan perusahaan. Ibu adalah ibu rumah tangga. Kakak adalah mahasiswa. Saya siswa SMA. Setiap hari, keluarga makan bersama. Sangat menyenangkan.',
        wordCount: 65,
        estimatedTime: 3,
        vocabulary: [
          { word: '家族', reading: 'かぞく', meaning: 'keluarga', pos: 'noun' },
          { word: '会社員', reading: 'かいしゃいん', meaning: 'karyawan perusahaan', pos: 'noun' },
          { word: '主婦', reading: 'しゅふ', meaning: 'ibu rumah tangga', pos: 'noun' },
          { word: '大学生', reading: 'だいがくせい', meaning: 'mahasiswa', pos: 'noun' },
          { word: '毎日', reading: 'まいにち', meaning: 'setiap hari', pos: 'adverb' }
        ]
      }
    ],
    N4: [
      {
        id: 'n4-1',
        title: '日本の季節',
        level: 'N4',
        category: 'culture',
        content: '日本には四つの季節があります。春、夏、秋、冬です。春には桜が咲きます。とても美しいです。多くの人が花見をします。夏は暑くて、海や山に行く人が多いです。秋は紅葉がきれいです。冬は雪が降ります。それぞれの季節に特別な食べ物や行事があります。',
        furigana: '<ruby>日<rt>に</rt>本<rt>ほん</rt></ruby>には<ruby>四<rt>よっ</rt></ruby>つの<ruby>季<rt>き</rt>節<rt>せつ</rt></ruby>があります。<ruby>春<rt>はる</rt></ruby>、<ruby>夏<rt>なつ</rt></ruby>、<ruby>秋<rt>あき</rt></ruby>、<ruby>冬<rt>ふゆ</rt></ruby>です。<ruby>春<rt>はる</rt></ruby>には<ruby>桜<rt>さくら</rt></ruby>が<ruby>咲<rt>さ</rt></ruby>きます。とても<ruby>美<rt>うつく</rt></ruby>しいです。<ruby>多<rt>おお</rt></ruby>くの<ruby>人<rt>ひと</rt></ruby>が<ruby>花<rt>はな</rt>見<rt>み</rt></ruby>をします。<ruby>夏<rt>なつ</rt></ruby>は<ruby>暑<rt>あつ</rt></ruby>くて、<ruby>海<rt>うみ</rt></ruby>や<ruby>山<rt>やま</rt></ruby>に<ruby>行<rt>い</rt></ruby>く<ruby>人<rt>ひと</rt></ruby>が<ruby>多<rt>おお</rt></ruby>いです。<ruby>秋<rt>あき</rt></ruby>は<ruby>紅<rt>こう</rt>葉<rt>よう</rt></ruby>がきれいです。<ruby>冬<rt>ふゆ</rt></ruby>は<ruby>雪<rt>ゆき</rt></ruby>が<ruby>降<rt>ふ</rt></ruby>ります。それぞれの<ruby>季<rt>き</rt>節<rt>せつ</rt></ruby>に<ruby>特<rt>とく</rt>別<rt>べつ</rt></ruby>な<ruby>食<rt>た</rt></ruby>べ<ruby>物<rt>もの</rt></ruby>や<ruby>行<rt>ぎょう</rt>事<rt>じ</rt></ruby>があります。',
        translation: 'Jepang memiliki empat musim. Musim semi, musim panas, musim gugur, dan musim dingin. Di musim semi, bunga sakura mekar. Sangat indah. Banyak orang melakukan hanami. Musim panas panas, banyak orang pergi ke laut atau gunung. Musim gugur daun-daunnya indah. Musim dingin turun salju. Setiap musim memiliki makanan dan acara khusus.',
        wordCount: 95,
        estimatedTime: 4,
        vocabulary: [
          { word: '季節', reading: 'きせつ', meaning: 'musim', pos: 'noun' },
          { word: '桜', reading: 'さくら', meaning: 'bunga sakura', pos: 'noun' },
          { word: '花見', reading: 'はなみ', meaning: 'hanami (melihat bunga)', pos: 'noun' },
          { word: '紅葉', reading: 'こうよう', meaning: 'daun musim gugur', pos: 'noun' },
          { word: '特別', reading: 'とくべつ', meaning: 'khusus', pos: 'na-adjective' }
        ]
      }
    ]
  };

  const generateText = async () => {
    setIsGenerating(true);
    try {
      const settings = JSON.parse(localStorage.getItem('kotobaid-api-settings') || '{}');
      
      if (!settings.azureOpenAI?.enabled || !settings.azureOpenAI.backendEndpoint || !settings.azureOpenAI.apiKey) {
        // Use sample text if AI not configured
        const sampleLevel = sampleTexts[selectedLevel];
        if (sampleLevel && sampleLevel.length > 0) {
          const randomText = sampleLevel[Math.floor(Math.random() * sampleLevel.length)];
          setCurrentText(randomText);
        }
        return;
      }

      const categoryNames = {
        'daily-life': 'kehidupan sehari-hari',
        'culture': 'budaya Jepang',
        'news': 'berita',
        'story': 'cerita pendek',
        'conversation': 'percakapan',
        'business': 'dunia bisnis'
      };

      const prompt = `Buat teks bacaan bahasa Jepang level ${selectedLevel} tentang ${categoryNames[selectedCategory as keyof typeof categoryNames]}.

Requirements:
- Level: ${selectedLevel} JLPT
- Kategori: ${categoryNames[selectedCategory as keyof typeof categoryNames]}
- Panjang: ${selectedLevel === 'N5' ? '80-120' : selectedLevel === 'N4' ? '120-180' : selectedLevel === 'N3' ? '180-250' : selectedLevel === 'N2' ? '250-350' : '350-500'} kata
- Grammar dan vocabulary sesuai level
- Konten yang menarik dan edukatif
- Gunakan mix hiragana, katakana, kanji sesuai level

Response format (JSON):
{
  "title": "judul dalam bahasa Jepang",
  "content": "teks bacaan lengkap dalam bahasa Jepang",
  "translation": "terjemahan lengkap dalam bahasa Indonesia",
  "vocabulary": [
    {"word": "kata", "reading": "bacaan", "meaning": "arti", "pos": "part of speech"}
  ],
  "culturalNotes": ["catatan budaya jika ada"]
}

Pastikan grammar dan vocabulary akurat sesuai level ${selectedLevel}.`;

      const response = await fetch(settings.azureOpenAI.backendEndpoint, {
        method: 'POST',
        headers: {
          'api-key': settings.azureOpenAI.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Kamu adalah guru bahasa Jepang yang ahli dalam JLPT. Buat teks bacaan yang akurat dan sesuai level.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Azure OpenAI Error: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Tidak ada response dari AI');
      }

      let aiText;
      try {
        aiText = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        // Fallback to sample text
        const sampleLevel = sampleTexts[selectedLevel];
        if (sampleLevel && sampleLevel.length > 0) {
          const randomText = sampleLevel[Math.floor(Math.random() * sampleLevel.length)];
          setCurrentText(randomText);
        }
        return;
      }

      // Process the AI generated text
      const generatedText: ReadingText = {
        id: `ai-${Date.now()}`,
        title: aiText.title || `${selectedLevel} Reading`,
        level: selectedLevel,
        category: selectedCategory,
        content: aiText.content || '',
        furigana: generateFurigana(aiText.content || ''),
        translation: aiText.translation || '',
        wordCount: (aiText.content || '').length,
        estimatedTime: Math.ceil((aiText.content || '').length / 30),
        vocabulary: aiText.vocabulary || [],
        culturalNotes: aiText.culturalNotes || []
      };

      setCurrentText(generatedText);

    } catch (error) {
      console.error('Error generating text:', error);
      // Fallback to sample text
      const sampleLevel = sampleTexts[selectedLevel];
      if (sampleLevel && sampleLevel.length > 0) {
        const randomText = sampleLevel[Math.floor(Math.random() * sampleLevel.length)];
        setCurrentText(randomText);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFurigana = (text: string): string => {
    // Simple furigana generation - in real app, use proper library
    return text.replace(/[\u4e00-\u9faf]+/g, (kanji) => {
      return `<ruby>${kanji}<rt>${kanji}</rt></ruby>`;
    });
  };

  const startReading = () => {
    setIsReading(true);
    setReadingStats({
      startTime: Date.now(),
      wordsRead: 0,
      wpm: 0,
      timeSpent: 0
    });

    timerRef.current = setInterval(() => {
      setReadingStats(prev => {
        if (!prev) return null;
        const timeSpent = (Date.now() - prev.startTime) / 1000 / 60; // minutes
        const wpm = currentText ? (currentText.wordCount / timeSpent) || 0 : 0;
        return {
          ...prev,
          timeSpent,
          wpm: Math.round(wpm)
        };
      });
    }, 1000);
  };

  const stopReading = () => {
    setIsReading(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetReading = () => {
    stopReading();
    setReadingStats(null);
    setShowQuiz(false);
  };

  const handleWordHover = (event: React.MouseEvent, word: string) => {
    if (currentText?.vocabulary) {
      const vocabItem = currentText.vocabulary.find(v => v.word === word);
      if (vocabItem) {
        setHoverWord({
          word: vocabItem.word,
          reading: vocabItem.reading,
          meaning: vocabItem.meaning,
          x: event.clientX,
          y: event.clientY
        });
      }
    }
  };

  const handleWordClick = (word: string) => {
    setHighlightedWords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  const playAudio = async () => {
    if (!currentText) return;
    
    setIsPlaying(true);
    try {
      const audioResponse = await azureAudioService.textToSpeech({
        text: currentText.content,
        voice: 'nova',
        speed: 0.8
      });

      if (audioResponse.audioUrl) {
        await azureAudioService.playAudio(audioResponse.audioUrl);
        azureAudioService.cleanupAudioUrl(audioResponse.audioUrl);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const finishReading = () => {
    stopReading();
    setShowQuiz(true);
  };

  const handleQuizComplete = (score: number, totalQuestions: number) => {
    console.log(`Quiz completed: ${score}/${totalQuestions}`);
    // Here you could save progress to local storage or backend
  };

  const handleQuizRetry = () => {
    setShowQuiz(false);
    resetReading();
  };

  useEffect(() => {
    generateText();
  }, [selectedLevel, selectedCategory]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Reading Practice</h2>
              <p className="text-gray-600">Latihan membaca dengan AI dan tools interaktif</p>
            </div>
          </div>
        </div>

        {/* Level and Category Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Level JLPT:</label>
            <div className="grid grid-cols-5 gap-2">
              {levels.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    selectedLevel === level.value 
                      ? level.color + ' shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level.value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Kategori:</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCategory === category.value 
                      ? 'bg-blue-100 text-blue-700 shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={generateText}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Generating...' : 'Text Baru'}</span>
            </button>

            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              {showFurigana ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>Furigana</span>
            </button>

            <button
              onClick={playAudio}
              disabled={isPlaying || !currentText}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              <span>Play Audio</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {!isReading ? (
              <button
                onClick={startReading}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Play className="h-4 w-4" />
                <span>Mulai Baca</span>
              </button>
            ) : (
              <>
                <button
                  onClick={stopReading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </button>
                <button
                  onClick={finishReading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Selesai</span>
                </button>
              </>
            )}
            
            <button
              onClick={resetReading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Reading Stats */}
        {readingStats && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <Clock className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                <div className="text-lg font-bold text-blue-700">{Math.round(readingStats.timeSpent * 60)}s</div>
                <div className="text-sm text-blue-600">Waktu</div>
              </div>
              <div>
                <Zap className="h-5 w-5 mx-auto text-green-600 mb-1" />
                <div className="text-lg font-bold text-green-700">{readingStats.wpm}</div>
                <div className="text-sm text-green-600">WPM</div>
              </div>
              <div>
                <BookMarked className="h-5 w-5 mx-auto text-purple-600 mb-1" />
                <div className="text-lg font-bold text-purple-700">{currentText?.wordCount || 0}</div>
                <div className="text-sm text-purple-600">Kata</div>
              </div>
              <div>
                <Target className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                <div className="text-lg font-bold text-orange-700">{currentText?.estimatedTime || 0}min</div>
                <div className="text-sm text-orange-600">Target</div>
              </div>
            </div>
          </div>
        )}

        {/* Reading Text */}
        {currentText && (
          <div className="mb-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{currentText.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className={`px-2 py-1 rounded ${levels.find(l => l.value === currentText.level)?.color}`}>
                  {currentText.level}
                </span>
                <span>{currentText.wordCount} kata</span>
                <span>{currentText.estimatedTime} menit</span>
              </div>
            </div>

            <div 
              ref={readingRef}
              className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200 leading-relaxed text-lg font-japanese"
              style={{ lineHeight: '2' }}
            >
              {showFurigana ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: currentText.furigana }}
                  className="select-text"
                />
              ) : (
                <div className="select-text">
                  {currentText.content.split('').map((char, index) => (
                    <span
                      key={index}
                      className={`cursor-pointer hover:bg-yellow-200 ${
                        highlightedWords.has(char) ? 'bg-yellow-300' : ''
                      }`}
                      onMouseEnter={(e) => handleWordHover(e, char)}
                      onMouseLeave={() => setHoverWord(null)}
                      onClick={() => handleWordClick(char)}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Translation */}
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Terjemahan:</h4>
              <p className="text-blue-700">{currentText.translation}</p>
            </div>

            {/* Vocabulary */}
            {currentText.vocabulary && currentText.vocabulary.length > 0 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Vocabulary Penting:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentText.vocabulary.map((vocab, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <span className="font-japanese text-lg font-semibold">{vocab.word}</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{vocab.pos}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{vocab.reading}</div>
                      <div className="text-sm text-green-700 mt-1">{vocab.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural Notes */}
            {currentText.culturalNotes && currentText.culturalNotes.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Catatan Budaya:</h4>
                <ul className="list-disc list-inside space-y-1 text-yellow-700">
                  {currentText.culturalNotes.map((note, index) => (
                    <li key={index}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Hover Dictionary */}
        {hoverWord && (
          <div 
            className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3 max-w-xs"
            style={{ 
              left: hoverWord.x + 10, 
              top: hoverWord.y - 10,
              pointerEvents: 'none'
            }}
          >
            <div className="font-japanese text-lg font-semibold">{hoverWord.word}</div>
            <div className="text-sm text-gray-600">{hoverWord.reading}</div>
            <div className="text-sm text-blue-700 mt-1">{hoverWord.meaning}</div>
          </div>
        )}

        {/* Instructions */}
        {!showQuiz && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">
              <Lightbulb className="h-4 w-4 inline mr-2" />
              Cara Penggunaan:
            </h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Pilih level JLPT dan kategori yang diinginkan</li>
              <li>• Klik "Text Baru" untuk generate bacaan baru dengan AI</li>
              <li>• Toggle furigana untuk menampilkan/menyembunyikan bantuan baca</li>
              <li>• Klik "Mulai Baca" untuk tracking kecepatan dan waktu</li>
              <li>• Hover di atas kata untuk melihat arti (hover dictionary)</li>
              <li>• Klik kata untuk highlight dan bookmark</li>
              <li>• Gunakan audio untuk mendengar pronunciation</li>
              <li>• Klik "Selesai" untuk mengerjakan quiz pemahaman</li>
            </ul>
          </div>
        )}
      </div>

      {/* Reading Quiz */}
      {showQuiz && currentText && readingStats && (
        <ReadingQuizNew
          text={currentText}
          readingStats={readingStats}
          onComplete={handleQuizComplete}
          onRetry={handleQuizRetry}
        />
      )}
    </div>
  );
};

export default ReadingPractice;