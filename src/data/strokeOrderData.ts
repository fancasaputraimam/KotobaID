import { CharacterStrokeData } from '../services/vectorStrokeService';
import { additionalStrokeData } from './additionalStrokeData';

// Official stroke order data for Japanese characters
// Based on KanjiVG data and standard Japanese writing practices
export const baseStrokeOrderData: Record<string, CharacterStrokeData> = {
  // Hiragana characters
  'あ': {
    character: 'あ',
    strokes: [
      {
        path: 'M 32 25 Q 38 20 45 25 Q 52 30 48 40 Q 44 50 35 55',
        points: [
          { x: 32, y: 25 }, { x: 38, y: 20 }, { x: 45, y: 25 }, 
          { x: 52, y: 30 }, { x: 48, y: 40 }, { x: 44, y: 50 }, { x: 35, y: 55 }
        ],
        direction: 'curve',
        startPoint: { x: 32, y: 25 },
        endPoint: { x: 35, y: 55 },
        tolerance: 25
      },
      {
        path: 'M 55 30 Q 60 35 58 45 Q 56 55 50 60 Q 44 65 38 62',
        points: [
          { x: 55, y: 30 }, { x: 60, y: 35 }, { x: 58, y: 45 }, 
          { x: 56, y: 55 }, { x: 50, y: 60 }, { x: 44, y: 65 }, { x: 38, y: 62 }
        ],
        direction: 'curve',
        startPoint: { x: 55, y: 30 },
        endPoint: { x: 38, y: 62 },
        tolerance: 25
      },
      {
        path: 'M 20 45 Q 25 50 35 52 Q 45 54 55 50',
        points: [
          { x: 20, y: 45 }, { x: 25, y: 50 }, { x: 35, y: 52 }, 
          { x: 45, y: 54 }, { x: 55, y: 50 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 45 },
        endPoint: { x: 55, y: 50 },
        tolerance: 25
      }
    ],
    meaning: 'a',
    reading: 'あ'
  },

  'い': {
    character: 'い',
    strokes: [
      {
        path: 'M 35 20 L 35 65',
        points: [
          { x: 35, y: 20 }, { x: 35, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 35, y: 20 },
        endPoint: { x: 35, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 50 25 Q 55 30 52 40 Q 50 50 45 55 Q 40 60 35 58',
        points: [
          { x: 50, y: 25 }, { x: 55, y: 30 }, { x: 52, y: 40 }, 
          { x: 50, y: 50 }, { x: 45, y: 55 }, { x: 40, y: 60 }, { x: 35, y: 58 }
        ],
        direction: 'curve',
        startPoint: { x: 50, y: 25 },
        endPoint: { x: 35, y: 58 },
        tolerance: 25
      }
    ],
    meaning: 'i',
    reading: 'い'
  },

  'う': {
    character: 'う',
    strokes: [
      {
        path: 'M 25 30 Q 30 25 40 30 Q 50 35 55 40',
        points: [
          { x: 25, y: 30 }, { x: 30, y: 25 }, { x: 40, y: 30 }, 
          { x: 50, y: 35 }, { x: 55, y: 40 }
        ],
        direction: 'horizontal',
        startPoint: { x: 25, y: 30 },
        endPoint: { x: 55, y: 40 },
        tolerance: 25
      },
      {
        path: 'M 40 35 Q 45 40 42 50 Q 38 60 30 62 Q 22 64 18 58',
        points: [
          { x: 40, y: 35 }, { x: 45, y: 40 }, { x: 42, y: 50 }, 
          { x: 38, y: 60 }, { x: 30, y: 62 }, { x: 22, y: 64 }, { x: 18, y: 58 }
        ],
        direction: 'curve',
        startPoint: { x: 40, y: 35 },
        endPoint: { x: 18, y: 58 },
        tolerance: 25
      }
    ],
    meaning: 'u',
    reading: 'う'
  },

  'え': {
    character: 'え',
    strokes: [
      {
        path: 'M 20 35 L 60 35',
        points: [
          { x: 20, y: 35 }, { x: 60, y: 35 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 35 },
        endPoint: { x: 60, y: 35 },
        tolerance: 25
      },
      {
        path: 'M 25 20 Q 30 25 35 30 Q 40 35 45 40 Q 50 45 55 50',
        points: [
          { x: 25, y: 20 }, { x: 30, y: 25 }, { x: 35, y: 30 }, 
          { x: 40, y: 35 }, { x: 45, y: 40 }, { x: 50, y: 45 }, { x: 55, y: 50 }
        ],
        direction: 'diagonal',
        startPoint: { x: 25, y: 20 },
        endPoint: { x: 55, y: 50 },
        tolerance: 25
      }
    ],
    meaning: 'e',
    reading: 'え'
  },

  'お': {
    character: 'お',
    strokes: [
      {
        path: 'M 20 25 L 55 25',
        points: [
          { x: 20, y: 25 }, { x: 55, y: 25 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 25 },
        endPoint: { x: 55, y: 25 },
        tolerance: 25
      },
      {
        path: 'M 30 20 L 30 45',
        points: [
          { x: 30, y: 20 }, { x: 30, y: 45 }
        ],
        direction: 'vertical',
        startPoint: { x: 30, y: 20 },
        endPoint: { x: 30, y: 45 },
        tolerance: 25
      },
      {
        path: 'M 45 20 L 45 60',
        points: [
          { x: 45, y: 20 }, { x: 45, y: 60 }
        ],
        direction: 'vertical',
        startPoint: { x: 45, y: 20 },
        endPoint: { x: 45, y: 60 },
        tolerance: 25
      },
      {
        path: 'M 20 45 Q 25 50 35 52 Q 45 54 55 50',
        points: [
          { x: 20, y: 45 }, { x: 25, y: 50 }, { x: 35, y: 52 }, 
          { x: 45, y: 54 }, { x: 55, y: 50 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 45 },
        endPoint: { x: 55, y: 50 },
        tolerance: 25
      }
    ],
    meaning: 'o',
    reading: 'お'
  },

  // Katakana characters
  'ア': {
    character: 'ア',
    strokes: [
      {
        path: 'M 25 20 L 50 60',
        points: [
          { x: 25, y: 20 }, { x: 50, y: 60 }
        ],
        direction: 'diagonal',
        startPoint: { x: 25, y: 20 },
        endPoint: { x: 50, y: 60 },
        tolerance: 25
      },
      {
        path: 'M 55 20 L 30 55',
        points: [
          { x: 55, y: 20 }, { x: 30, y: 55 }
        ],
        direction: 'diagonal',
        startPoint: { x: 55, y: 20 },
        endPoint: { x: 30, y: 55 },
        tolerance: 25
      },
      {
        path: 'M 30 40 L 50 40',
        points: [
          { x: 30, y: 40 }, { x: 50, y: 40 }
        ],
        direction: 'horizontal',
        startPoint: { x: 30, y: 40 },
        endPoint: { x: 50, y: 40 },
        tolerance: 25
      }
    ],
    meaning: 'a',
    reading: 'ア'
  },

  'イ': {
    character: 'イ',
    strokes: [
      {
        path: 'M 30 20 L 30 65',
        points: [
          { x: 30, y: 20 }, { x: 30, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 30, y: 20 },
        endPoint: { x: 30, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 50 25 L 35 55',
        points: [
          { x: 50, y: 25 }, { x: 35, y: 55 }
        ],
        direction: 'diagonal',
        startPoint: { x: 50, y: 25 },
        endPoint: { x: 35, y: 55 },
        tolerance: 25
      }
    ],
    meaning: 'i',
    reading: 'イ'
  },

  'ウ': {
    character: 'ウ',
    strokes: [
      {
        path: 'M 25 25 L 50 25',
        points: [
          { x: 25, y: 25 }, { x: 50, y: 25 }
        ],
        direction: 'horizontal',
        startPoint: { x: 25, y: 25 },
        endPoint: { x: 50, y: 25 },
        tolerance: 25
      },
      {
        path: 'M 35 20 L 35 45',
        points: [
          { x: 35, y: 20 }, { x: 35, y: 45 }
        ],
        direction: 'vertical',
        startPoint: { x: 35, y: 20 },
        endPoint: { x: 35, y: 45 },
        tolerance: 25
      },
      {
        path: 'M 20 50 Q 25 55 35 57 Q 45 59 55 55',
        points: [
          { x: 20, y: 50 }, { x: 25, y: 55 }, { x: 35, y: 57 }, 
          { x: 45, y: 59 }, { x: 55, y: 55 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 50 },
        endPoint: { x: 55, y: 55 },
        tolerance: 25
      }
    ],
    meaning: 'u',
    reading: 'ウ'
  },

  // Basic Kanji characters
  '一': {
    character: '一',
    strokes: [
      {
        path: 'M 15 40 L 65 40',
        points: [
          { x: 15, y: 40 }, { x: 65, y: 40 }
        ],
        direction: 'horizontal',
        startPoint: { x: 15, y: 40 },
        endPoint: { x: 65, y: 40 },
        tolerance: 25
      }
    ],
    meaning: 'one',
    reading: 'いち',
    examples: ['一人 (ひとり) - one person', '一つ (ひとつ) - one thing']
  },

  '二': {
    character: '二',
    strokes: [
      {
        path: 'M 20 30 L 60 30',
        points: [
          { x: 20, y: 30 }, { x: 60, y: 30 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 30 },
        endPoint: { x: 60, y: 30 },
        tolerance: 25
      },
      {
        path: 'M 15 50 L 65 50',
        points: [
          { x: 15, y: 50 }, { x: 65, y: 50 }
        ],
        direction: 'horizontal',
        startPoint: { x: 15, y: 50 },
        endPoint: { x: 65, y: 50 },
        tolerance: 25
      }
    ],
    meaning: 'two',
    reading: 'に',
    examples: ['二人 (ふたり) - two people', '二つ (ふたつ) - two things']
  },

  '三': {
    character: '三',
    strokes: [
      {
        path: 'M 20 25 L 60 25',
        points: [
          { x: 20, y: 25 }, { x: 60, y: 25 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 25 },
        endPoint: { x: 60, y: 25 },
        tolerance: 25
      },
      {
        path: 'M 20 40 L 60 40',
        points: [
          { x: 20, y: 40 }, { x: 60, y: 40 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 40 },
        endPoint: { x: 60, y: 40 },
        tolerance: 25
      },
      {
        path: 'M 15 55 L 65 55',
        points: [
          { x: 15, y: 55 }, { x: 65, y: 55 }
        ],
        direction: 'horizontal',
        startPoint: { x: 15, y: 55 },
        endPoint: { x: 65, y: 55 },
        tolerance: 25
      }
    ],
    meaning: 'three',
    reading: 'さん',
    examples: ['三人 (さんにん) - three people', '三つ (みっつ) - three things']
  },

  '人': {
    character: '人',
    strokes: [
      {
        path: 'M 25 20 L 40 60',
        points: [
          { x: 25, y: 20 }, { x: 40, y: 60 }
        ],
        direction: 'diagonal',
        startPoint: { x: 25, y: 20 },
        endPoint: { x: 40, y: 60 },
        tolerance: 25
      },
      {
        path: 'M 55 20 L 40 60',
        points: [
          { x: 55, y: 20 }, { x: 40, y: 60 }
        ],
        direction: 'diagonal',
        startPoint: { x: 55, y: 20 },
        endPoint: { x: 40, y: 60 },
        tolerance: 25
      }
    ],
    meaning: 'person',
    reading: 'じん・にん・ひと',
    examples: ['人間 (にんげん) - human', '日本人 (にほんじん) - Japanese person']
  },

  '大': {
    character: '大',
    strokes: [
      {
        path: 'M 40 15 L 40 65',
        points: [
          { x: 40, y: 15 }, { x: 40, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 40, y: 15 },
        endPoint: { x: 40, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 20 35 L 60 35',
        points: [
          { x: 20, y: 35 }, { x: 60, y: 35 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 35 },
        endPoint: { x: 60, y: 35 },
        tolerance: 25
      },
      {
        path: 'M 25 45 L 55 60',
        points: [
          { x: 25, y: 45 }, { x: 55, y: 60 }
        ],
        direction: 'diagonal',
        startPoint: { x: 25, y: 45 },
        endPoint: { x: 55, y: 60 },
        tolerance: 25
      }
    ],
    meaning: 'big, large',
    reading: 'だい・おお',
    examples: ['大きい (おおきい) - big', '大学 (だいがく) - university']
  },

  '小': {
    character: '小',
    strokes: [
      {
        path: 'M 40 20 L 40 45',
        points: [
          { x: 40, y: 20 }, { x: 40, y: 45 }
        ],
        direction: 'vertical',
        startPoint: { x: 40, y: 20 },
        endPoint: { x: 40, y: 45 },
        tolerance: 25
      },
      {
        path: 'M 25 35 L 35 50',
        points: [
          { x: 25, y: 35 }, { x: 35, y: 50 }
        ],
        direction: 'diagonal',
        startPoint: { x: 25, y: 35 },
        endPoint: { x: 35, y: 50 },
        tolerance: 25
      },
      {
        path: 'M 55 35 L 45 50',
        points: [
          { x: 55, y: 35 }, { x: 45, y: 50 }
        ],
        direction: 'diagonal',
        startPoint: { x: 55, y: 35 },
        endPoint: { x: 45, y: 50 },
        tolerance: 25
      }
    ],
    meaning: 'small, little',
    reading: 'しょう・ちい・こ',
    examples: ['小さい (ちいさい) - small', '小学校 (しょうがっこう) - elementary school']
  },

  '日': {
    character: '日',
    strokes: [
      {
        path: 'M 25 15 L 25 65',
        points: [
          { x: 25, y: 15 }, { x: 25, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 25, y: 15 },
        endPoint: { x: 25, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 25 15 L 55 15',
        points: [
          { x: 25, y: 15 }, { x: 55, y: 15 }
        ],
        direction: 'horizontal',
        startPoint: { x: 25, y: 15 },
        endPoint: { x: 55, y: 15 },
        tolerance: 25
      },
      {
        path: 'M 55 15 L 55 65',
        points: [
          { x: 55, y: 15 }, { x: 55, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 55, y: 15 },
        endPoint: { x: 55, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 25 65 L 55 65',
        points: [
          { x: 25, y: 65 }, { x: 55, y: 65 }
        ],
        direction: 'horizontal',
        startPoint: { x: 25, y: 65 },
        endPoint: { x: 55, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 25 40 L 55 40',
        points: [
          { x: 25, y: 40 }, { x: 55, y: 40 }
        ],
        direction: 'horizontal',
        startPoint: { x: 25, y: 40 },
        endPoint: { x: 55, y: 40 },
        tolerance: 25
      }
    ],
    meaning: 'day, sun',
    reading: 'にち・ひ・び',
    examples: ['今日 (きょう) - today', '日本 (にほん) - Japan']
  },

  '月': {
    character: '月',
    strokes: [
      {
        path: 'M 25 15 L 25 65',
        points: [
          { x: 25, y: 15 }, { x: 25, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 25, y: 15 },
        endPoint: { x: 25, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 25 15 L 55 15',
        points: [
          { x: 25, y: 15 }, { x: 55, y: 15 }
        ],
        direction: 'horizontal',
        startPoint: { x: 25, y: 15 },
        endPoint: { x: 55, y: 15 },
        tolerance: 25
      },
      {
        path: 'M 55 15 L 55 65',
        points: [
          { x: 55, y: 15 }, { x: 55, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 55, y: 15 },
        endPoint: { x: 55, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 25 65 L 55 65',
        points: [
          { x: 25, y: 65 }, { x: 55, y: 65 }
        ],
        direction: 'horizontal',
        startPoint: { x: 25, y: 65 },
        endPoint: { x: 55, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 25 30 L 55 30',
        points: [
          { x: 25, y: 30 }, { x: 55, y: 30 }
        ],
        direction: 'horizontal',
        startPoint: { x: 25, y: 30 },
        endPoint: { x: 55, y: 30 },
        tolerance: 25
      },
      {
        path: 'M 25 50 L 55 50',
        points: [
          { x: 25, y: 50 }, { x: 55, y: 50 }
        ],
        direction: 'horizontal',
        startPoint: { x: 25, y: 50 },
        endPoint: { x: 55, y: 50 },
        tolerance: 25
      }
    ],
    meaning: 'month, moon',
    reading: 'げつ・つき',
    examples: ['今月 (こんげつ) - this month', '月曜日 (げつようび) - Monday']
  },

  '水': {
    character: '水',
    strokes: [
      {
        path: 'M 40 15 L 40 35',
        points: [
          { x: 40, y: 15 }, { x: 40, y: 35 }
        ],
        direction: 'vertical',
        startPoint: { x: 40, y: 15 },
        endPoint: { x: 40, y: 35 },
        tolerance: 25
      },
      {
        path: 'M 25 25 L 40 40 L 55 25',
        points: [
          { x: 25, y: 25 }, { x: 40, y: 40 }, { x: 55, y: 25 }
        ],
        direction: 'diagonal',
        startPoint: { x: 25, y: 25 },
        endPoint: { x: 55, y: 25 },
        tolerance: 25
      },
      {
        path: 'M 20 45 L 30 55',
        points: [
          { x: 20, y: 45 }, { x: 30, y: 55 }
        ],
        direction: 'diagonal',
        startPoint: { x: 20, y: 45 },
        endPoint: { x: 30, y: 55 },
        tolerance: 25
      },
      {
        path: 'M 50 45 L 60 55',
        points: [
          { x: 50, y: 45 }, { x: 60, y: 55 }
        ],
        direction: 'diagonal',
        startPoint: { x: 50, y: 45 },
        endPoint: { x: 60, y: 55 },
        tolerance: 25
      }
    ],
    meaning: 'water',
    reading: 'すい・みず',
    examples: ['水曜日 (すいようび) - Wednesday', '水道 (すいどう) - water supply']
  }
};

// Combine base data with additional data
export const strokeOrderData: Record<string, CharacterStrokeData> = {
  ...baseStrokeOrderData,
  ...additionalStrokeData
};