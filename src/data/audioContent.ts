import { AudioContent } from '../types/audio';

// Vocabulary audio content
export const vocabularyAudioData: AudioContent[] = [
  {
    id: 'vocab_01',
    text: 'こんにちは',
    reading: 'konnichiwa',
    type: 'word',
    difficulty: 'beginner',
    category: 'vocabulary',
    translation: 'Halo (siang)',
    tags: ['greeting', 'daily'],
    createdAt: new Date()
  },
  {
    id: 'vocab_02',
    text: 'ありがとうございます',
    reading: 'arigatou gozaimasu',
    type: 'word',
    difficulty: 'beginner',
    category: 'vocabulary',
    translation: 'Terima kasih',
    tags: ['gratitude', 'daily'],
    createdAt: new Date()
  },
  {
    id: 'vocab_03',
    text: 'すみません',
    reading: 'sumimasen',
    type: 'word',
    difficulty: 'beginner',
    category: 'vocabulary',
    translation: 'Maaf / Permisi',
    tags: ['apology', 'daily'],
    createdAt: new Date()
  },
  {
    id: 'vocab_04',
    text: 'おはようございます',
    reading: 'ohayou gozaimasu',
    type: 'word',
    difficulty: 'beginner',
    category: 'vocabulary',
    translation: 'Selamat pagi',
    tags: ['greeting', 'morning'],
    createdAt: new Date()
  },
  {
    id: 'vocab_05',
    text: 'さようなら',
    reading: 'sayounara',
    type: 'word',
    difficulty: 'beginner',
    category: 'vocabulary',
    translation: 'Selamat tinggal',
    tags: ['farewell', 'daily'],
    createdAt: new Date()
  }
];

// Sentence audio content
export const sentenceAudioData: AudioContent[] = [
  {
    id: 'sent_01',
    text: 'わたしの なまえは たなかです。',
    reading: 'watashi no namae wa tanaka desu',
    type: 'sentence',
    difficulty: 'beginner',
    category: 'conversation',
    translation: 'Nama saya Tanaka.',
    tags: ['introduction', 'self'],
    createdAt: new Date()
  },
  {
    id: 'sent_02',
    text: 'どこから きましたか。',
    reading: 'doko kara kimashita ka',
    type: 'sentence',
    difficulty: 'beginner',
    category: 'conversation',
    translation: 'Dari mana Anda datang?',
    tags: ['question', 'origin'],
    createdAt: new Date()
  },
  {
    id: 'sent_03',
    text: 'にほんごが すこし わかります。',
    reading: 'nihongo ga sukoshi wakarimasu',
    type: 'sentence',
    difficulty: 'intermediate',
    category: 'conversation',
    translation: 'Saya sedikit mengerti bahasa Jepang.',
    tags: ['language', 'ability'],
    createdAt: new Date()
  },
  {
    id: 'sent_04',
    text: 'えきは どこですか。',
    reading: 'eki wa doko desu ka',
    type: 'sentence',
    difficulty: 'beginner',
    category: 'conversation',
    translation: 'Di mana stasiun?',
    tags: ['direction', 'location'],
    createdAt: new Date()
  },
  {
    id: 'sent_05',
    text: 'いくらですか。',
    reading: 'ikura desu ka',
    type: 'sentence',
    difficulty: 'beginner',
    category: 'conversation',
    translation: 'Berapa harganya?',
    tags: ['price', 'shopping'],
    createdAt: new Date()
  }
];

// Pronunciation practice content
export const pronunciationData: AudioContent[] = [
  {
    id: 'pron_01',
    text: 'つ',
    reading: 'tsu',
    type: 'pronunciation',
    difficulty: 'beginner',
    category: 'pronunciation',
    translation: 'Suara "tsu"',
    tags: ['hiragana', 'difficult'],
    createdAt: new Date()
  },
  {
    id: 'pron_02',
    text: 'ふ',
    reading: 'fu',
    type: 'pronunciation',
    difficulty: 'beginner',
    category: 'pronunciation',
    translation: 'Suara "fu"',
    tags: ['hiragana', 'difficult'],
    createdAt: new Date()
  },
  {
    id: 'pron_03',
    text: 'りゃ',
    reading: 'rya',
    type: 'pronunciation',
    difficulty: 'intermediate',
    category: 'pronunciation',
    translation: 'Suara "rya"',
    tags: ['combination', 'r-sound'],
    createdAt: new Date()
  },
  {
    id: 'pron_04',
    text: 'きょう',
    reading: 'kyou',
    type: 'pronunciation',
    difficulty: 'intermediate',
    category: 'pronunciation',
    translation: 'Hari ini',
    tags: ['combination', 'daily'],
    createdAt: new Date()
  },
  {
    id: 'pron_05',
    text: 'しゅくだい',
    reading: 'shukudai',
    type: 'pronunciation',
    difficulty: 'intermediate',
    category: 'pronunciation',
    translation: 'Pekerjaan rumah',
    tags: ['combination', 'school'],
    createdAt: new Date()
  }
];

// Combined data
export const allAudioContent: AudioContent[] = [
  ...vocabularyAudioData,
  ...sentenceAudioData,
  ...pronunciationData
];

// Helper functions
export const getAudioContentById = (id: string): AudioContent | undefined => {
  return allAudioContent.find(content => content.id === id);
};

export const getAudioContentByCategory = (category: 'vocabulary' | 'grammar' | 'conversation' | 'pronunciation'): AudioContent[] => {
  return allAudioContent.filter(content => content.category === category);
};

export const getAudioContentByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): AudioContent[] => {
  return allAudioContent.filter(content => content.difficulty === difficulty);
};

export const getAudioContentByType = (type: 'word' | 'sentence' | 'dialogue' | 'pronunciation'): AudioContent[] => {
  return allAudioContent.filter(content => content.type === type);
};