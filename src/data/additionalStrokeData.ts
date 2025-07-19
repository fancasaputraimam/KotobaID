import { CharacterStrokeData } from '../services/vectorStrokeService';

// Additional stroke order data for more characters
export const additionalStrokeData: Record<string, CharacterStrokeData> = {
  // More Hiragana characters
  'か': {
    character: 'か',
    strokes: [
      {
        path: 'M 20 20 L 60 20',
        points: [
          { x: 20, y: 20 }, { x: 60, y: 20 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 20 },
        endPoint: { x: 60, y: 20 },
        tolerance: 25
      },
      {
        path: 'M 30 15 L 30 50',
        points: [
          { x: 30, y: 15 }, { x: 30, y: 50 }
        ],
        direction: 'vertical',
        startPoint: { x: 30, y: 15 },
        endPoint: { x: 30, y: 50 },
        tolerance: 25
      },
      {
        path: 'M 45 25 Q 50 30 48 40 Q 46 50 40 55 Q 34 60 28 58',
        points: [
          { x: 45, y: 25 }, { x: 50, y: 30 }, { x: 48, y: 40 }, 
          { x: 46, y: 50 }, { x: 40, y: 55 }, { x: 34, y: 60 }, { x: 28, y: 58 }
        ],
        direction: 'curve',
        startPoint: { x: 45, y: 25 },
        endPoint: { x: 28, y: 58 },
        tolerance: 25
      }
    ],
    meaning: 'ka',
    reading: 'か'
  },

  'き': {
    character: 'き',
    strokes: [
      {
        path: 'M 25 15 L 25 60',
        points: [
          { x: 25, y: 15 }, { x: 25, y: 60 }
        ],
        direction: 'vertical',
        startPoint: { x: 25, y: 15 },
        endPoint: { x: 25, y: 60 },
        tolerance: 25
      },
      {
        path: 'M 20 30 L 50 30',
        points: [
          { x: 20, y: 30 }, { x: 50, y: 30 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 30 },
        endPoint: { x: 50, y: 30 },
        tolerance: 25
      },
      {
        path: 'M 45 25 Q 50 35 48 45 Q 46 55 40 60',
        points: [
          { x: 45, y: 25 }, { x: 50, y: 35 }, { x: 48, y: 45 }, 
          { x: 46, y: 55 }, { x: 40, y: 60 }
        ],
        direction: 'curve',
        startPoint: { x: 45, y: 25 },
        endPoint: { x: 40, y: 60 },
        tolerance: 25
      },
      {
        path: 'M 35 45 Q 40 50 45 52',
        points: [
          { x: 35, y: 45 }, { x: 40, y: 50 }, { x: 45, y: 52 }
        ],
        direction: 'curve',
        startPoint: { x: 35, y: 45 },
        endPoint: { x: 45, y: 52 },
        tolerance: 25
      }
    ],
    meaning: 'ki',
    reading: 'き'
  },

  'く': {
    character: 'く',
    strokes: [
      {
        path: 'M 30 20 Q 35 30 40 40 Q 45 50 40 60 Q 35 65 25 62',
        points: [
          { x: 30, y: 20 }, { x: 35, y: 30 }, { x: 40, y: 40 }, 
          { x: 45, y: 50 }, { x: 40, y: 60 }, { x: 35, y: 65 }, { x: 25, y: 62 }
        ],
        direction: 'curve',
        startPoint: { x: 30, y: 20 },
        endPoint: { x: 25, y: 62 },
        tolerance: 25
      }
    ],
    meaning: 'ku',
    reading: 'く'
  },

  // More Katakana characters
  'カ': {
    character: 'カ',
    strokes: [
      {
        path: 'M 20 20 L 60 20',
        points: [
          { x: 20, y: 20 }, { x: 60, y: 20 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 20 },
        endPoint: { x: 60, y: 20 },
        tolerance: 25
      },
      {
        path: 'M 30 15 L 30 50',
        points: [
          { x: 30, y: 15 }, { x: 30, y: 50 }
        ],
        direction: 'vertical',
        startPoint: { x: 30, y: 15 },
        endPoint: { x: 30, y: 50 },
        tolerance: 25
      },
      {
        path: 'M 45 25 L 35 55',
        points: [
          { x: 45, y: 25 }, { x: 35, y: 55 }
        ],
        direction: 'diagonal',
        startPoint: { x: 45, y: 25 },
        endPoint: { x: 35, y: 55 },
        tolerance: 25
      }
    ],
    meaning: 'ka',
    reading: 'カ'
  },

  'キ': {
    character: 'キ',
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
        path: 'M 45 15 L 45 65',
        points: [
          { x: 45, y: 15 }, { x: 45, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 45, y: 15 },
        endPoint: { x: 45, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 20 30 L 50 30',
        points: [
          { x: 20, y: 30 }, { x: 50, y: 30 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 30 },
        endPoint: { x: 50, y: 30 },
        tolerance: 25
      },
      {
        path: 'M 20 50 L 50 50',
        points: [
          { x: 20, y: 50 }, { x: 50, y: 50 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 50 },
        endPoint: { x: 50, y: 50 },
        tolerance: 25
      }
    ],
    meaning: 'ki',
    reading: 'キ'
  },

  // More Kanji characters
  '四': {
    character: '四',
    strokes: [
      {
        path: 'M 20 15 L 20 60',
        points: [
          { x: 20, y: 15 }, { x: 20, y: 60 }
        ],
        direction: 'vertical',
        startPoint: { x: 20, y: 15 },
        endPoint: { x: 20, y: 60 },
        tolerance: 25
      },
      {
        path: 'M 20 15 L 60 15',
        points: [
          { x: 20, y: 15 }, { x: 60, y: 15 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 15 },
        endPoint: { x: 60, y: 15 },
        tolerance: 25
      },
      {
        path: 'M 60 15 L 60 60',
        points: [
          { x: 60, y: 15 }, { x: 60, y: 60 }
        ],
        direction: 'vertical',
        startPoint: { x: 60, y: 15 },
        endPoint: { x: 60, y: 60 },
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
        path: 'M 20 60 L 60 60',
        points: [
          { x: 20, y: 60 }, { x: 60, y: 60 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 60 },
        endPoint: { x: 60, y: 60 },
        tolerance: 25
      }
    ],
    meaning: 'four',
    reading: 'し・よん',
    examples: ['四人 (よにん) - four people', '四つ (よっつ) - four things']
  },

  '五': {
    character: '五',
    strokes: [
      {
        path: 'M 20 20 L 60 20',
        points: [
          { x: 20, y: 20 }, { x: 60, y: 20 }
        ],
        direction: 'horizontal',
        startPoint: { x: 20, y: 20 },
        endPoint: { x: 60, y: 20 },
        tolerance: 25
      },
      {
        path: 'M 20 20 L 20 40',
        points: [
          { x: 20, y: 20 }, { x: 20, y: 40 }
        ],
        direction: 'vertical',
        startPoint: { x: 20, y: 20 },
        endPoint: { x: 20, y: 40 },
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
        path: 'M 15 65 L 65 65',
        points: [
          { x: 15, y: 65 }, { x: 65, y: 65 }
        ],
        direction: 'horizontal',
        startPoint: { x: 15, y: 65 },
        endPoint: { x: 65, y: 65 },
        tolerance: 25
      }
    ],
    meaning: 'five',
    reading: 'ご・いつ',
    examples: ['五人 (ごにん) - five people', '五つ (いつつ) - five things']
  },

  '六': {
    character: '六',
    strokes: [
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
        path: 'M 40 10 L 40 35',
        points: [
          { x: 40, y: 10 }, { x: 40, y: 35 }
        ],
        direction: 'vertical',
        startPoint: { x: 40, y: 10 },
        endPoint: { x: 40, y: 35 },
        tolerance: 25
      },
      {
        path: 'M 25 35 L 25 65',
        points: [
          { x: 25, y: 35 }, { x: 25, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 25, y: 35 },
        endPoint: { x: 25, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 15 65 L 65 65',
        points: [
          { x: 15, y: 65 }, { x: 65, y: 65 }
        ],
        direction: 'horizontal',
        startPoint: { x: 15, y: 65 },
        endPoint: { x: 65, y: 65 },
        tolerance: 25
      }
    ],
    meaning: 'six',
    reading: 'ろく・むっ',
    examples: ['六人 (ろくにん) - six people', '六つ (むっつ) - six things']
  },

  '七': {
    character: '七',
    strokes: [
      {
        path: 'M 15 20 L 65 20',
        points: [
          { x: 15, y: 20 }, { x: 65, y: 20 }
        ],
        direction: 'horizontal',
        startPoint: { x: 15, y: 20 },
        endPoint: { x: 65, y: 20 },
        tolerance: 25
      },
      {
        path: 'M 50 20 Q 45 40 35 65',
        points: [
          { x: 50, y: 20 }, { x: 45, y: 40 }, { x: 35, y: 65 }
        ],
        direction: 'curve',
        startPoint: { x: 50, y: 20 },
        endPoint: { x: 35, y: 65 },
        tolerance: 25
      }
    ],
    meaning: 'seven',
    reading: 'しち・なな',
    examples: ['七人 (しちにん) - seven people', '七つ (ななつ) - seven things']
  },

  '八': {
    character: '八',
    strokes: [
      {
        path: 'M 30 25 L 25 65',
        points: [
          { x: 30, y: 25 }, { x: 25, y: 65 }
        ],
        direction: 'diagonal',
        startPoint: { x: 30, y: 25 },
        endPoint: { x: 25, y: 65 },
        tolerance: 25
      },
      {
        path: 'M 50 25 L 55 65',
        points: [
          { x: 50, y: 25 }, { x: 55, y: 65 }
        ],
        direction: 'diagonal',
        startPoint: { x: 50, y: 25 },
        endPoint: { x: 55, y: 65 },
        tolerance: 25
      }
    ],
    meaning: 'eight',
    reading: 'はち・やっ',
    examples: ['八人 (はちにん) - eight people', '八つ (やっつ) - eight things']
  },

  '九': {
    character: '九',
    strokes: [
      {
        path: 'M 25 15 Q 40 20 50 30 Q 55 40 50 50 Q 45 60 35 62',
        points: [
          { x: 25, y: 15 }, { x: 40, y: 20 }, { x: 50, y: 30 }, 
          { x: 55, y: 40 }, { x: 50, y: 50 }, { x: 45, y: 60 }, { x: 35, y: 62 }
        ],
        direction: 'curve',
        startPoint: { x: 25, y: 15 },
        endPoint: { x: 35, y: 62 },
        tolerance: 25
      },
      {
        path: 'M 40 45 L 25 65',
        points: [
          { x: 40, y: 45 }, { x: 25, y: 65 }
        ],
        direction: 'diagonal',
        startPoint: { x: 40, y: 45 },
        endPoint: { x: 25, y: 65 },
        tolerance: 25
      }
    ],
    meaning: 'nine',
    reading: 'きゅう・く',
    examples: ['九人 (きゅうにん) - nine people', '九つ (ここのつ) - nine things']
  },

  '十': {
    character: '十',
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
      },
      {
        path: 'M 40 15 L 40 65',
        points: [
          { x: 40, y: 15 }, { x: 40, y: 65 }
        ],
        direction: 'vertical',
        startPoint: { x: 40, y: 15 },
        endPoint: { x: 40, y: 65 },
        tolerance: 25
      }
    ],
    meaning: 'ten',
    reading: 'じゅう・とお',
    examples: ['十人 (じゅうにん) - ten people', '十 (とお) - ten']
  }
};