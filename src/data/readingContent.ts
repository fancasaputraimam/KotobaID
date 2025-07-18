import { ReadingText } from '../types/reading';

export const readingTexts: ReadingText[] = [
  {
    id: 'reading_01',
    title: 'Perkenalan Diri',
    content: '私は田中です。日本人です。東京に住んでいます。大学生です。専攻は日本語です。趣味は読書と映画を見ることです。よろしくお願いします。',
    furiganaContent: '私{わたし}は田中{たなか}です。日本人{にほんじん}です。東京{とうきょう}に住{す}んでいます。大学生{だいがくせい}です。専攻{せんこう}は日本語{にほんご}です。趣味{しゅみ}は読書{どくしょ}と映画{えいが}を見{み}ることです。よろしくお願{ねが}いします。',
    translation: 'Saya Tanaka. Saya orang Jepang. Saya tinggal di Tokyo. Saya mahasiswa. Jurusan saya bahasa Jepang. Hobi saya membaca dan menonton film. Mohon bantuannya.',
    difficulty: 'beginner',
    category: 'dialogue',
    estimatedReadingTime: 2,
    vocabulary: [
      { word: '私', reading: 'わたし', meaning: 'saya', type: 'noun' },
      { word: '日本人', reading: 'にほんじん', meaning: 'orang Jepang', type: 'noun' },
      { word: '住む', reading: 'すむ', meaning: 'tinggal', type: 'verb' },
      { word: '大学生', reading: 'だいがくせい', meaning: 'mahasiswa', type: 'noun' },
      { word: '専攻', reading: 'せんこう', meaning: 'jurusan', type: 'noun' },
      { word: '趣味', reading: 'しゅみ', meaning: 'hobi', type: 'noun' },
      { word: '読書', reading: 'どくしょ', meaning: 'membaca', type: 'noun' },
      { word: '映画', reading: 'えいが', meaning: 'film', type: 'noun' }
    ],
    grammarPoints: [
      {
        pattern: 'です',
        explanation: 'Bentuk sopan dari だ (copula)',
        example: '私は学生です',
        translation: 'Saya adalah mahasiswa'
      },
      {
        pattern: 'に住んでいます',
        explanation: 'Pola untuk menyatakan tempat tinggal',
        example: '東京に住んでいます',
        translation: 'Tinggal di Tokyo'
      }
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Tanaka-san adalah orang dari mana?',
        options: ['China', 'Korea', 'Jepang', 'Indonesia'],
        correctAnswer: 2,
        explanation: 'Dalam teks disebutkan "日本人です" yang berarti orang Jepang.',
        type: 'multiple-choice'
      },
      {
        id: 'q2',
        question: 'Di mana Tanaka-san tinggal?',
        options: ['Osaka', 'Tokyo', 'Kyoto', 'Nagoya'],
        correctAnswer: 1,
        explanation: 'Dalam teks disebutkan "東京に住んでいます".',
        type: 'multiple-choice'
      },
      {
        id: 'q3',
        question: 'Apa hobi Tanaka-san?',
        options: ['Memasak dan olahraga', 'Membaca dan menonton film', 'Menyanyi dan menari', 'Bermain game'],
        correctAnswer: 1,
        explanation: 'Dalam teks disebutkan "趣味は読書と映画を見ることです".',
        type: 'multiple-choice'
      }
    ],
    tags: ['introduction', 'basic', 'self'],
    createdAt: new Date()
  },
  {
    id: 'reading_02',
    title: 'Keluarga Saya',
    content: '私の家族は四人です。父、母、兄、そして私です。父は会社員です。母は主婦です。兄は高校生です。私たちはとても仲がいいです。週末はよく一緒に出かけます。',
    furiganaContent: '私{わたし}の家族{かぞく}は四人{よにん}です。父{ちち}、母{はは}、兄{あに}、そして私{わたし}です。父{ちち}は会社員{かいしゃいん}です。母{はは}は主婦{しゅふ}です。兄{あに}は高校生{こうこうせい}です。私{わたし}たちはとても仲{なか}がいいです。週末{しゅうまつ}はよく一緒{いっしょ}に出{で}かけます。',
    translation: 'Keluarga saya terdiri dari empat orang. Ayah, ibu, kakak laki-laki, dan saya. Ayah adalah karyawan perusahaan. Ibu adalah ibu rumah tangga. Kakak adalah siswa SMA. Kami semua sangat akrab. Di akhir pekan sering pergi bersama.',
    difficulty: 'beginner',
    category: 'story',
    estimatedReadingTime: 3,
    vocabulary: [
      { word: '家族', reading: 'かぞく', meaning: 'keluarga', type: 'noun' },
      { word: '四人', reading: 'よにん', meaning: 'empat orang', type: 'noun' },
      { word: '父', reading: 'ちち', meaning: 'ayah', type: 'noun' },
      { word: '母', reading: 'はは', meaning: 'ibu', type: 'noun' },
      { word: '兄', reading: 'あに', meaning: 'kakak laki-laki', type: 'noun' },
      { word: '会社員', reading: 'かいしゃいん', meaning: 'karyawan perusahaan', type: 'noun' },
      { word: '主婦', reading: 'しゅふ', meaning: 'ibu rumah tangga', type: 'noun' },
      { word: '高校生', reading: 'こうこうせい', meaning: 'siswa SMA', type: 'noun' },
      { word: '仲がいい', reading: 'なかがいい', meaning: 'akrab', type: 'adjective' },
      { word: '週末', reading: 'しゅうまつ', meaning: 'akhir pekan', type: 'noun' },
      { word: '一緒に', reading: 'いっしょに', meaning: 'bersama', type: 'adverb' },
      { word: '出かける', reading: 'でかける', meaning: 'pergi keluar', type: 'verb' }
    ],
    grammarPoints: [
      {
        pattern: 'は...です',
        explanation: 'Pola dasar untuk menyatakan identitas atau status',
        example: '父は会社員です',
        translation: 'Ayah adalah karyawan perusahaan'
      },
      {
        pattern: 'とても',
        explanation: 'Adverb yang berarti "sangat" atau "sekali"',
        example: 'とても仲がいいです',
        translation: 'Sangat akrab'
      }
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Berapa orang anggota keluarga penulis?',
        options: ['3 orang', '4 orang', '5 orang', '6 orang'],
        correctAnswer: 1,
        explanation: 'Dalam teks disebutkan "私の家族は四人です".',
        type: 'multiple-choice'
      },
      {
        id: 'q2',
        question: 'Apa pekerjaan ayah penulis?',
        options: ['Guru', 'Dokter', 'Karyawan perusahaan', 'Petani'],
        correctAnswer: 2,
        explanation: 'Dalam teks disebutkan "父は会社員です".',
        type: 'multiple-choice'
      }
    ],
    tags: ['family', 'basic', 'relationship'],
    createdAt: new Date()
  },
  {
    id: 'reading_03',
    title: 'Hari-hari di Sekolah',
    content: '私は毎日七時に起きます。朝ごはんを食べてから、学校に行きます。学校では友達と話したり、勉強したりします。昼休みは弁当を食べます。放課後は部活動をします。家に帰ってから、宿題をします。十時頃寝ます。',
    furiganaContent: '私{わたし}は毎日{まいにち}七時{しちじ}に起{お}きます。朝{あさ}ごはんを食{た}べてから、学校{がっこう}に行{い}きます。学校{がっこう}では友達{ともだち}と話{はな}したり、勉強{べんきょう}したりします。昼休{ひるやす}みは弁当{べんとう}を食{た}べます。放課後{ほうかご}は部活動{ぶかつどう}をします。家{いえ}に帰{かえ}ってから、宿題{しゅくだい}をします。十時{じゅうじ}頃{ごろ}寝{ね}ます。',
    translation: 'Saya bangun setiap hari jam 7. Setelah makan sarapan, pergi ke sekolah. Di sekolah berbicara dengan teman dan belajar. Saat istirahat siang makan bekal. Setelah pulang sekolah melakukan kegiatan klub. Setelah pulang ke rumah, mengerjakan PR. Tidur sekitar jam 10.',
    difficulty: 'intermediate',
    category: 'story',
    estimatedReadingTime: 4,
    vocabulary: [
      { word: '毎日', reading: 'まいにち', meaning: 'setiap hari', type: 'noun' },
      { word: '起きる', reading: 'おきる', meaning: 'bangun', type: 'verb' },
      { word: '朝ごはん', reading: 'あさごはん', meaning: 'sarapan', type: 'noun' },
      { word: '学校', reading: 'がっこう', meaning: 'sekolah', type: 'noun' },
      { word: '友達', reading: 'ともだち', meaning: 'teman', type: 'noun' },
      { word: '話す', reading: 'はなす', meaning: 'berbicara', type: 'verb' },
      { word: '勉強', reading: 'べんきょう', meaning: 'belajar', type: 'noun' },
      { word: '昼休み', reading: 'ひるやすみ', meaning: 'istirahat siang', type: 'noun' },
      { word: '弁当', reading: 'べんとう', meaning: 'bekal', type: 'noun' },
      { word: '放課後', reading: 'ほうかご', meaning: 'setelah pulang sekolah', type: 'noun' },
      { word: '部活動', reading: 'ぶかつどう', meaning: 'kegiatan klub', type: 'noun' },
      { word: '宿題', reading: 'しゅくだい', meaning: 'PR', type: 'noun' }
    ],
    grammarPoints: [
      {
        pattern: 'てから',
        explanation: 'Menunjukkan urutan waktu "setelah melakukan A, kemudian B"',
        example: '朝ごはんを食べてから、学校に行きます',
        translation: 'Setelah makan sarapan, pergi ke sekolah'
      },
      {
        pattern: 'たり...たりします',
        explanation: 'Menyebutkan beberapa kegiatan sebagai contoh',
        example: '友達と話したり、勉強したりします',
        translation: 'Berbicara dengan teman, belajar, dan sebagainya'
      }
    ],
    comprehensionQuestions: [
      {
        id: 'q1',
        question: 'Jam berapa penulis bangun setiap hari?',
        options: ['6:00', '7:00', '8:00', '9:00'],
        correctAnswer: 1,
        explanation: 'Dalam teks disebutkan "毎日七時に起きます".',
        type: 'multiple-choice'
      },
      {
        id: 'q2',
        question: 'Apa yang dilakukan penulis setelah pulang sekolah?',
        options: ['Langsung pulang', 'Bermain dengan teman', 'Kegiatan klub', 'Belanja'],
        correctAnswer: 2,
        explanation: 'Dalam teks disebutkan "放課後は部活動をします".',
        type: 'multiple-choice'
      }
    ],
    tags: ['daily-life', 'school', 'routine'],
    createdAt: new Date()
  }
];

export const getReadingTextById = (id: string): ReadingText | undefined => {
  return readingTexts.find(text => text.id === id);
};

export const getReadingTextsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): ReadingText[] => {
  return readingTexts.filter(text => text.difficulty === difficulty);
};

export const getReadingTextsByCategory = (category: 'story' | 'news' | 'dialogue' | 'essay' | 'culture'): ReadingText[] => {
  return readingTexts.filter(text => text.category === category);
};