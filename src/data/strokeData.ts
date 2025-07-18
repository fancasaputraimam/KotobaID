import { CharacterData } from '../types/writing';

// Basic Hiragana stroke data
export const hiraganaData: CharacterData[] = [
  {
    character: 'あ',
    type: 'hiragana',
    reading: 'a',
    strokeCount: 3,
    difficulty: 'easy',
    strokes: [
      { path: 'M20,20 Q30,10 40,20 Q50,30 40,40', duration: 800, delay: 0 },
      { path: 'M45,15 Q55,25 45,35 Q35,45 45,55', duration: 700, delay: 100 },
      { path: 'M15,50 Q40,45 60,50 Q70,55 65,65', duration: 600, delay: 200 }
    ]
  },
  {
    character: 'か',
    type: 'hiragana',
    reading: 'ka',
    strokeCount: 3,
    difficulty: 'easy',
    strokes: [
      { path: 'M20,15 L20,60', duration: 500, delay: 0 },
      { path: 'M15,30 L65,30', duration: 400, delay: 100 },
      { path: 'M45,30 Q55,40 45,50 Q35,60 45,70', duration: 700, delay: 200 }
    ]
  },
  {
    character: 'さ',
    type: 'hiragana',
    reading: 'sa',
    strokeCount: 3,
    difficulty: 'easy',
    strokes: [
      { path: 'M15,20 Q35,15 55,20', duration: 500, delay: 0 },
      { path: 'M25,35 Q45,30 65,35', duration: 500, delay: 100 },
      { path: 'M35,35 Q40,50 35,65', duration: 400, delay: 200 }
    ]
  },
  {
    character: 'た',
    type: 'hiragana',
    reading: 'ta',
    strokeCount: 4,
    difficulty: 'medium',
    strokes: [
      { path: 'M15,20 L65,20', duration: 400, delay: 0 },
      { path: 'M40,20 L40,45', duration: 300, delay: 100 },
      { path: 'M20,45 Q40,40 60,45', duration: 500, delay: 200 },
      { path: 'M40,45 Q45,55 40,65', duration: 300, delay: 300 }
    ]
  },
  {
    character: 'な',
    type: 'hiragana',
    reading: 'na',
    strokeCount: 4,
    difficulty: 'medium',
    strokes: [
      { path: 'M15,25 Q35,20 55,25', duration: 500, delay: 0 },
      { path: 'M35,25 L35,45', duration: 300, delay: 100 },
      { path: 'M15,45 L55,45', duration: 400, delay: 200 },
      { path: 'M45,45 Q50,55 45,65', duration: 300, delay: 300 }
    ]
  }
];

// Basic Katakana stroke data
export const katakanaData: CharacterData[] = [
  {
    character: 'ア',
    type: 'katakana',
    reading: 'a',
    strokeCount: 2,
    difficulty: 'easy',
    strokes: [
      { path: 'M30,15 L15,65', duration: 600, delay: 0 },
      { path: 'M45,15 L60,65', duration: 600, delay: 100 },
      { path: 'M20,40 L55,40', duration: 400, delay: 200 }
    ]
  },
  {
    character: 'カ',
    type: 'katakana',
    reading: 'ka',
    strokeCount: 2,
    difficulty: 'easy',
    strokes: [
      { path: 'M20,15 L20,65', duration: 500, delay: 0 },
      { path: 'M20,30 L60,15', duration: 500, delay: 100 },
      { path: 'M35,35 L60,65', duration: 500, delay: 200 }
    ]
  },
  {
    character: 'サ',
    type: 'katakana',
    reading: 'sa',
    strokeCount: 3,
    difficulty: 'easy',
    strokes: [
      { path: 'M15,20 L65,20', duration: 400, delay: 0 },
      { path: 'M15,40 L55,40', duration: 400, delay: 100 },
      { path: 'M40,40 L40,65', duration: 300, delay: 200 }
    ]
  }
];

// Basic Kanji stroke data
export const kanjiData: CharacterData[] = [
  {
    character: '一',
    type: 'kanji',
    meaning: 'satu',
    reading: 'いち',
    strokeCount: 1,
    difficulty: 'easy',
    strokes: [
      { path: 'M15,40 L65,40', duration: 500, delay: 0 }
    ]
  },
  {
    character: '二',
    type: 'kanji',
    meaning: 'dua',
    reading: 'に',
    strokeCount: 2,
    difficulty: 'easy',
    strokes: [
      { path: 'M15,30 L65,30', duration: 500, delay: 0 },
      { path: 'M15,50 L65,50', duration: 500, delay: 100 }
    ]
  },
  {
    character: '三',
    type: 'kanji',
    meaning: 'tiga',
    reading: 'さん',
    strokeCount: 3,
    difficulty: 'easy',
    strokes: [
      { path: 'M15,25 L65,25', duration: 500, delay: 0 },
      { path: 'M15,40 L65,40', duration: 500, delay: 100 },
      { path: 'M15,55 L65,55', duration: 500, delay: 200 }
    ]
  },
  {
    character: '人',
    type: 'kanji',
    meaning: 'orang',
    reading: 'ひと',
    strokeCount: 2,
    difficulty: 'easy',
    strokes: [
      { path: 'M30,15 L15,65', duration: 600, delay: 0 },
      { path: 'M30,15 L45,65', duration: 600, delay: 100 }
    ]
  },
  {
    character: '大',
    type: 'kanji',
    meaning: 'besar',
    reading: 'だい',
    strokeCount: 3,
    difficulty: 'easy',
    strokes: [
      { path: 'M40,15 L40,65', duration: 600, delay: 0 },
      { path: 'M40,35 L15,50', duration: 500, delay: 100 },
      { path: 'M40,35 L65,50', duration: 500, delay: 200 }
    ]
  },
  {
    character: '小',
    type: 'kanji',
    meaning: 'kecil',
    reading: 'しょう',
    strokeCount: 3,
    difficulty: 'medium',
    strokes: [
      { path: 'M40,15 L40,45', duration: 400, delay: 0 },
      { path: 'M25,30 L55,30', duration: 400, delay: 100 },
      { path: 'M40,45 Q30,55 40,65 Q50,55 40,45', duration: 600, delay: 200 }
    ]
  },
  {
    character: '水',
    type: 'kanji',
    meaning: 'air',
    reading: 'みず',
    strokeCount: 4,
    difficulty: 'medium',
    strokes: [
      { path: 'M40,15 L40,65', duration: 500, delay: 0 },
      { path: 'M15,30 Q40,25 65,30', duration: 600, delay: 100 },
      { path: 'M25,45 Q35,40 45,45', duration: 400, delay: 200 },
      { path: 'M55,45 Q45,50 35,55', duration: 400, delay: 300 }
    ]
  },
  {
    character: '火',
    type: 'kanji',
    meaning: 'api',
    reading: 'ひ',
    strokeCount: 4,
    difficulty: 'medium',
    strokes: [
      { path: 'M40,15 L30,35', duration: 400, delay: 0 },
      { path: 'M40,15 L50,35', duration: 400, delay: 100 },
      { path: 'M30,35 L15,60', duration: 400, delay: 200 },
      { path: 'M50,35 L65,60', duration: 400, delay: 300 }
    ]
  }
];

// Combined data
export const allCharacterData: CharacterData[] = [
  ...hiraganaData,
  ...katakanaData,
  ...kanjiData
];

// Helper functions
export const getCharacterData = (character: string): CharacterData | undefined => {
  return allCharacterData.find(data => data.character === character);
};

export const getCharactersByType = (type: 'kanji' | 'hiragana' | 'katakana'): CharacterData[] => {
  return allCharacterData.filter(data => data.type === type);
};

export const getCharactersByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): CharacterData[] => {
  return allCharacterData.filter(data => data.difficulty === difficulty);
};