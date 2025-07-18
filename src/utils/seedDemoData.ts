import { firestoreService } from '../services/firestoreService';
import { DictionaryEntry } from '../types/studyTools';

export const seedDemoData = async () => {
  console.log('Starting demo data seeding...');
  
  const demoEntries: Omit<DictionaryEntry, 'id'>[] = [
    {
      word: 'こんにちは',
      reading: 'konnichiwa',
      meanings: [
        {
          id: 'meaning_01',
          definition: 'Good afternoon greeting',
          indonesian: 'Selamat siang',
          context: 'Used from late morning until late afternoon'
        }
      ],
      partOfSpeech: ['interjection'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_01',
          japanese: 'こんにちは、田中さん。',
          reading: 'konnichiwa, tanaka-san',
          indonesian: 'Selamat siang, Tanaka-san.',
          difficulty: 'beginner',
          source: 'common_greetings',
          tags: ['greeting', 'polite']
        }
      ],
      tags: ['greeting', 'daily', 'polite'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      word: 'ありがとう',
      reading: 'arigatou',
      meanings: [
        {
          id: 'meaning_02',
          definition: 'Thank you (casual)',
          indonesian: 'Terima kasih',
          context: 'Casual expression of gratitude'
        }
      ],
      partOfSpeech: ['interjection'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_02',
          japanese: 'ありがとう、お母さん。',
          reading: 'arigatou, okaasan',
          indonesian: 'Terima kasih, Ibu.',
          difficulty: 'beginner',
          source: 'family_conversations',
          tags: ['gratitude', 'family']
        }
      ],
      tags: ['gratitude', 'daily', 'casual'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      word: '食べる',
      reading: 'taberu',
      meanings: [
        {
          id: 'meaning_03',
          definition: 'To eat',
          indonesian: 'Makan',
          context: 'Basic verb for eating'
        }
      ],
      partOfSpeech: ['verb', 'ichidan'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_03',
          japanese: 'りんごを食べます。',
          reading: 'ringo wo tabemasu',
          indonesian: 'Saya makan apel.',
          difficulty: 'beginner',
          source: 'basic_verbs',
          tags: ['food', 'action']
        }
      ],
      tags: ['verb', 'food', 'daily'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      word: '学校',
      reading: 'gakkou',
      meanings: [
        {
          id: 'meaning_04',
          definition: 'School',
          indonesian: 'Sekolah',
          context: 'Educational institution'
        }
      ],
      kanji: [
        {
          character: '学',
          meaning: 'study, learn',
          onyomi: ['がく', 'がっ'],
          kunyomi: ['まな.ぶ'],
          strokeCount: 8,
          jlptLevel: 'N5',
          frequency: 5
        },
        {
          character: '校',
          meaning: 'school',
          onyomi: ['こう', 'きょう'],
          kunyomi: [],
          strokeCount: 10,
          jlptLevel: 'N5',
          frequency: 4
        }
      ],
      partOfSpeech: ['noun'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_04',
          japanese: '学校に行きます。',
          reading: 'gakkou ni ikimasu',
          indonesian: 'Saya pergi ke sekolah.',
          difficulty: 'beginner',
          source: 'daily_activities',
          tags: ['education', 'location']
        }
      ],
      tags: ['education', 'place', 'daily'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      word: '美しい',
      reading: 'utsukushii',
      meanings: [
        {
          id: 'meaning_05',
          definition: 'Beautiful',
          indonesian: 'Indah, cantik',
          context: 'Describing aesthetic beauty'
        }
      ],
      partOfSpeech: ['i-adjective'],
      jlptLevel: 'N4',
      frequency: 4,
      examples: [
        {
          id: 'ex_05',
          japanese: '美しい花ですね。',
          reading: 'utsukushii hana desu ne',
          indonesian: 'Bunga yang indah ya.',
          difficulty: 'intermediate',
          source: 'descriptions',
          tags: ['beauty', 'nature']
        }
      ],
      tags: ['adjective', 'beauty', 'description'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      word: '本',
      reading: 'hon',
      meanings: [
        {
          id: 'meaning_06',
          definition: 'Book',
          indonesian: 'Buku',
          context: 'Reading material'
        }
      ],
      kanji: [
        {
          character: '本',
          meaning: 'book, origin',
          onyomi: ['ほん'],
          kunyomi: ['もと'],
          strokeCount: 5,
          jlptLevel: 'N5',
          frequency: 5
        }
      ],
      partOfSpeech: ['noun'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_06',
          japanese: '本を読みます。',
          reading: 'hon wo yomimasu',
          indonesian: 'Saya membaca buku.',
          difficulty: 'beginner',
          source: 'daily_activities',
          tags: ['reading', 'education']
        }
      ],
      tags: ['education', 'reading', 'daily'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      word: '水',
      reading: 'mizu',
      meanings: [
        {
          id: 'meaning_07',
          definition: 'Water',
          indonesian: 'Air',
          context: 'Essential liquid'
        }
      ],
      kanji: [
        {
          character: '水',
          meaning: 'water',
          onyomi: ['すい'],
          kunyomi: ['みず'],
          strokeCount: 4,
          jlptLevel: 'N5',
          frequency: 5
        }
      ],
      partOfSpeech: ['noun'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_07',
          japanese: '水を飲みます。',
          reading: 'mizu wo nomimasu',
          indonesian: 'Saya minum air.',
          difficulty: 'beginner',
          source: 'daily_activities',
          tags: ['drinking', 'basic']
        }
      ],
      tags: ['drink', 'basic', 'daily'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      word: '日本',
      reading: 'nihon',
      meanings: [
        {
          id: 'meaning_08',
          definition: 'Japan',
          indonesian: 'Jepang',
          context: 'Country name'
        }
      ],
      kanji: [
        {
          character: '日',
          meaning: 'sun, day',
          onyomi: ['にち', 'じつ'],
          kunyomi: ['ひ'],
          strokeCount: 4,
          jlptLevel: 'N5',
          frequency: 5
        },
        {
          character: '本',
          meaning: 'book, origin',
          onyomi: ['ほん'],
          kunyomi: ['もと'],
          strokeCount: 5,
          jlptLevel: 'N5',
          frequency: 5
        }
      ],
      partOfSpeech: ['noun'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_08',
          japanese: '日本は美しい国です。',
          reading: 'nihon wa utsukushii kuni desu',
          indonesian: 'Jepang adalah negara yang indah.',
          difficulty: 'intermediate',
          source: 'country_descriptions',
          tags: ['country', 'geography']
        }
      ],
      tags: ['country', 'geography', 'culture'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      word: '友達',
      reading: 'tomodachi',
      meanings: [
        {
          id: 'meaning_09',
          definition: 'Friend',
          indonesian: 'Teman',
          context: 'Close relationship'
        }
      ],
      kanji: [
        {
          character: '友',
          meaning: 'friend',
          onyomi: ['ゆう'],
          kunyomi: ['とも'],
          strokeCount: 4,
          jlptLevel: 'N5',
          frequency: 4
        },
        {
          character: '達',
          meaning: 'plural suffix',
          onyomi: ['たつ'],
          kunyomi: ['たち'],
          strokeCount: 12,
          jlptLevel: 'N4',
          frequency: 3
        }
      ],
      partOfSpeech: ['noun'],
      jlptLevel: 'N5',
      frequency: 4,
      examples: [
        {
          id: 'ex_09',
          japanese: '友達と映画を見ました。',
          reading: 'tomodachi to eiga wo mimashita',
          indonesian: 'Saya menonton film dengan teman.',
          difficulty: 'intermediate',
          source: 'social_activities',
          tags: ['friendship', 'social']
        }
      ],
      tags: ['friendship', 'social', 'relationship'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      word: '時間',
      reading: 'jikan',
      meanings: [
        {
          id: 'meaning_10',
          definition: 'Time',
          indonesian: 'Waktu',
          context: 'Duration or specific time'
        }
      ],
      kanji: [
        {
          character: '時',
          meaning: 'time, hour',
          onyomi: ['じ'],
          kunyomi: ['とき'],
          strokeCount: 10,
          jlptLevel: 'N5',
          frequency: 5
        },
        {
          character: '間',
          meaning: 'interval, between',
          onyomi: ['かん'],
          kunyomi: ['あいだ', 'ま'],
          strokeCount: 12,
          jlptLevel: 'N5',
          frequency: 5
        }
      ],
      partOfSpeech: ['noun'],
      jlptLevel: 'N5',
      frequency: 5,
      examples: [
        {
          id: 'ex_10',
          japanese: '時間がありません。',
          reading: 'jikan ga arimasen',
          indonesian: 'Tidak ada waktu.',
          difficulty: 'beginner',
          source: 'time_expressions',
          tags: ['time', 'schedule']
        }
      ],
      tags: ['time', 'schedule', 'daily'],
      source: 'internal',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  try {
    let addedCount = 0;
    for (const entry of demoEntries) {
      await firestoreService.addDictionaryEntry(entry);
      addedCount++;
      console.log(`Added dictionary entry: ${entry.word} (${addedCount}/${demoEntries.length})`);
    }
    
    console.log(`✅ Successfully seeded ${addedCount} dictionary entries!`);
    return true;
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    return false;
  }
};

// Function to check if demo data already exists
export const checkDemoDataExists = async (): Promise<boolean> => {
  try {
    const result = await firestoreService.getDictionaryEntries('こんにちは');
    return result.entries.length > 0;
  } catch (error) {
    console.error('Error checking demo data:', error);
    return false;
  }
};

// Function to seed data only if it doesn't exist
export const seedDemoDataIfNeeded = async (): Promise<void> => {
  try {
    const exists = await checkDemoDataExists();
    if (!exists) {
      console.log('Demo data not found, seeding...');
      await seedDemoData();
    } else {
      console.log('Demo data already exists, skipping seeding.');
    }
  } catch (error) {
    console.error('Error in seedDemoDataIfNeeded:', error);
  }
};