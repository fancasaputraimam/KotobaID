import React, { useState } from 'react';
import { Wand2, Play, RefreshCw, Volume2, Copy, BookOpen } from 'lucide-react';
import { azureAudioService } from '../../services/azureAudioService';

interface GeneratedSentence {
  japanese: string;
  romaji: string;
  translation: string;
  grammar: string;
  vocabulary: string[];
  level: string;
}

interface SentenceGeneratorProps {
  onSentenceGenerated?: (sentence: GeneratedSentence) => void;
}

const SentenceGenerator: React.FC<SentenceGeneratorProps> = ({ onSentenceGenerated }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('N5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSentence, setCurrentSentence] = useState<GeneratedSentence | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generationHistory, setGenerationHistory] = useState<GeneratedSentence[]>([]);

  const levels = [
    { value: 'N5', label: 'N5 - Pemula', description: 'Kalimat dasar dan sederhana' },
    { value: 'N4', label: 'N4 - Dasar', description: 'Kalimat dengan struktur lebih kompleks' },
    { value: 'N3', label: 'N3 - Menengah', description: 'Kalimat dengan keigo dan bentuk kasual' },
    { value: 'N2', label: 'N2 - Lanjutan', description: 'Kalimat kompleks dan idiom' },
    { value: 'N1', label: 'N1 - Mahir', description: 'Kalimat formal dan literatur' }
  ];

  const topics = [
    'kehidupan sehari-hari', 'keluarga', 'makanan', 'pekerjaan', 'hobby', 'cuaca', 
    'transportasi', 'belanja', 'sekolah', 'wisata', 'teknologi', 'olahraga',
    'kesehatan', 'budaya', 'festival', 'alam', 'hewan', 'musik', 'film', 'buku'
  ];

  const generateSentence = async () => {
    setIsGenerating(true);
    try {
      // Get Azure OpenAI configuration
      const settings = JSON.parse(localStorage.getItem('kotobaid-api-settings') || '{}');
      
      if (!settings.azureOpenAI?.enabled || !settings.azureOpenAI.backendEndpoint || !settings.azureOpenAI.apiKey) {
        throw new Error('Azure OpenAI tidak dikonfigurasi. Silakan setup di panel API Settings.');
      }

      // Random topic for variety
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      // Generate variety by including random elements
      const randomElements = [
        'dalam situasi formal',
        'dalam percakapan santai', 
        'dengan ekspresi emosi',
        'dalam konteks bisnis',
        'dalam kehidupan sehari-hari',
        'dengan nuansa sopan',
        'dengan gaya modern',
        'dalam suasana ramah'
      ];
      
      const randomContext = randomElements[Math.floor(Math.random() * randomElements.length)];
      
      const prompt = `Buat 1 kalimat bahasa Jepang level ${selectedLevel} tentang ${randomTopic} ${randomContext}.

Requirements:
- Level: ${selectedLevel} (sesuai JLPT)
- Topik: ${randomTopic}
- Konteks: ${randomContext}
- Buat kalimat yang UNIK dan BERVARIASI, jangan mengulang pola yang sama
- Gunakan grammar dan vocabulary yang sesuai level ${selectedLevel}

Response format (JSON):
{
  "japanese": "kalimat dalam hiragana/katakana/kanji",
  "romaji": "bacaan dalam romaji", 
  "translation": "terjemahan bahasa Indonesia",
  "grammar": "poin grammar utama yang digunakan",
  "vocabulary": ["kata1", "kata2", "kata3"],
  "level": "${selectedLevel}"
}

Pastikan kalimat berbeda dari yang sebelumnya dan menarik untuk dipelajari.`;

      const response = await fetch(settings.azureOpenAI.backendEndpoint, {
        method: 'POST',
        headers: {
          'api-key': settings.azureOpenAI.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Kamu adalah guru bahasa Jepang yang ahli dalam JLPT. Buat kalimat yang akurat, menarik, dan sesuai level.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.9, // Higher temperature for more creativity/randomness
          top_p: 0.95
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

      // Parse JSON response
      let sentence: GeneratedSentence;
      try {
        sentence = JSON.parse(content);
      } catch (parseError) {
        // If JSON parsing fails, try to extract information manually
        console.error('Failed to parse AI response as JSON:', content);
        
        // Fallback: create a basic sentence structure
        sentence = {
          japanese: content.split('\n')[0] || 'こんにちは。',
          romaji: 'konnichiwa.',
          translation: 'Halo.',
          grammar: 'Greeting pattern',
          vocabulary: ['こんにちは'],
          level: selectedLevel
        };
      }

      // Ensure all required fields exist
      sentence = {
        japanese: sentence.japanese || 'エラーが発生しました。',
        romaji: sentence.romaji || 'eraaga hasseishimashita.',
        translation: sentence.translation || 'Terjadi error.',
        grammar: sentence.grammar || 'Basic pattern',
        vocabulary: sentence.vocabulary || [],
        level: selectedLevel
      };

      setCurrentSentence(sentence);
      setGenerationHistory(prev => [sentence, ...prev.slice(0, 9)]); // Keep last 10
      
      if (onSentenceGenerated) {
        onSentenceGenerated(sentence);
      }

    } catch (error) {
      console.error('Error generating sentence:', error);
      alert(`Error: ${(error as Error).message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const playSentence = async () => {
    if (!currentSentence) return;
    
    setIsPlaying(true);
    try {
      const audioResponse = await azureAudioService.textToSpeech({
        text: currentSentence.japanese,
        voice: 'nova',
        speed: 0.9
      });

      if (audioResponse.audioUrl) {
        await azureAudioService.playAudio(audioResponse.audioUrl);
        azureAudioService.cleanupAudioUrl(audioResponse.audioUrl);
      } else if (audioResponse.error) {
        console.error('TTS Error:', audioResponse.error);
        alert('Error playing audio: ' + audioResponse.error);
      }
    } catch (error) {
      console.error('Error playing sentence:', error);
      alert('Error playing audio');
    } finally {
      setIsPlaying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Disalin ke clipboard!');
  };

  const regenerateSentence = () => {
    generateSentence();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Wand2 className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Sentence Generator</h3>
            <p className="text-sm text-gray-600">Generate kalimat Jepang random dengan AI</p>
          </div>
        </div>
      </div>

      {/* Level Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Pilih Level JLPT:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {levels.map((level) => (
            <button
              key={level.value}
              onClick={() => setSelectedLevel(level.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedLevel === level.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
              }`}
            >
              <div className="font-semibold">{level.label}</div>
              <div className="text-xs mt-1">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={generateSentence}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Wand2 className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Generate Kalimat Baru'}</span>
        </button>
      </div>

      {/* Generated Sentence Display */}
      {currentSentence && (
        <div className="border-2 border-purple-200 rounded-lg p-6 mb-6 bg-gradient-to-br from-purple-50 to-blue-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-700">Level {currentSentence.level}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={regenerateSentence}
                disabled={isGenerating}
                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-white rounded-lg transition-all"
                title="Generate ulang"
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={playSentence}
                disabled={isPlaying}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-white rounded-lg transition-all"
                title="Play audio"
              >
                <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Japanese */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Japanese:</label>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-japanese text-gray-900 bg-white p-3 rounded-lg flex-1">
                  {currentSentence.japanese}
                </p>
                <button
                  onClick={() => copyToClipboard(currentSentence.japanese)}
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-lg"
                  title="Copy Japanese"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Romaji */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Romaji:</label>
              <div className="flex items-center space-x-2">
                <p className="text-lg text-gray-700 bg-white p-3 rounded-lg flex-1 font-mono">
                  {currentSentence.romaji}
                </p>
                <button
                  onClick={() => copyToClipboard(currentSentence.romaji)}
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-lg"
                  title="Copy Romaji"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Translation */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Translation:</label>
              <p className="text-lg text-gray-700 bg-white p-3 rounded-lg">
                {currentSentence.translation}
              </p>
            </div>

            {/* Grammar Point */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Grammar Point:</label>
              <p className="text-sm text-purple-700 bg-white p-3 rounded-lg">
                {currentSentence.grammar}
              </p>
            </div>

            {/* Vocabulary */}
            {currentSentence.vocabulary && currentSentence.vocabulary.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Key Vocabulary:</label>
                <div className="flex flex-wrap gap-2">
                  {currentSentence.vocabulary.map((word, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-semibold text-gray-700 mb-3">Recent Generations:</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {generationHistory.map((sentence, index) => (
              <button
                key={index}
                onClick={() => setCurrentSentence(sentence)}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-japanese text-gray-900">{sentence.japanese}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {sentence.level}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{sentence.translation}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Cara Penggunaan:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Pilih level JLPT yang diinginkan (N5 = termudah, N1 = tersulit)</li>
          <li>• Klik "Generate Kalimat Baru" untuk membuat kalimat random</li>
          <li>• Klik tombol play untuk mendengar pronunciationnya</li>
          <li>• Klik tombol refresh untuk generate ulang di level yang sama</li>
          <li>• Gunakan riwayat untuk melihat kalimat yang sudah di-generate</li>
        </ul>
      </div>
    </div>
  );
};

export default SentenceGenerator;