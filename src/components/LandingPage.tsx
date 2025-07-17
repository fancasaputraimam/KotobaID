import React, { useState } from 'react';
import { 
  BookOpen, 
  Globe, 
  GraduationCap, 
  Users, 
  TrendingUp, 
  Award, 
  PlayCircle, 
  CheckCircle, 
  Star,
  ArrowRight,
  Brain,
  Clock,
  Target,
  Zap,
  Heart,
  Sparkles,
  Coffee,
  Smile,
  Github,
  Twitter,
  Mail,
  Calendar
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Brain,
      title: "Pembelajaran dengan AI",
      description: "Belajar bahasa Jepang dengan bantuan AI yang cerdas dan interaktif"
    },
    {
      icon: Target,
      title: "Latihan Kanji & Kosakata",
      description: "Ribuan kanji dan kosakata dengan sistem pembelajaran yang menyenangkan"
    },
    {
      icon: Clock,
      title: "Belajar Kapan Saja",
      description: "Akses pembelajaran 24/7 dari perangkat apapun, dimana saja"
    },
    {
      icon: TrendingUp,
      title: "Tracking Progress",
      description: "Pantau kemajuan belajar Anda dengan statistik yang mudah dipahami"
    },
    {
      icon: Users,
      title: "Komunitas Pembelajar",
      description: "Bergabung dengan komunitas pembelajar bahasa Jepang dari Indonesia"
    },
    {
      icon: Heart,
      title: "100% Gratis",
      description: "Semua fitur dapat diakses gratis tanpa batasan atau biaya tersembunyi"
    }
  ];

  const happyUsers = [
    "Mahasiswa", "Pekerja", "Wibu", "Traveler", "Guru", "Freelancer"
  ];

  const stats = [
    { number: "10K+", label: "Pengguna Aktif", description: "Belajar setiap hari", icon: Users },
    { number: "1000+", label: "Kanji Tersedia", description: "Dari dasar hingga mahir", icon: BookOpen },
    { number: "100%", label: "Gratis", description: "Tanpa biaya apapun", icon: Heart },
    { number: "24/7", label: "Akses", description: "Belajar kapan saja", icon: Clock }
  ];

  const learningPaths = [
    {
      title: "Pemula",
      description: "Mulai dari dasar",
      features: [
        "Hiragana & Katakana",
        "100 Kanji dasar",
        "Kosakata sehari-hari",
        "Tata bahasa dasar",
        "Percakapan sederhana"
      ],
      icon: Smile,
      color: "from-green-400 to-green-600"
    },
    {
      title: "Menengah",
      description: "Tingkatkan kemampuan",
      features: [
        "500+ Kanji tambahan",
        "Tata bahasa kompleks",
        "Kosakata bisnis",
        "Persiapan JLPT N4-N3",
        "Latihan percakapan"
      ],
      icon: Target,
      color: "from-blue-400 to-blue-600"
    },
    {
      title: "Mahir",
      description: "Kuasai bahasa Jepang",
      features: [
        "1000+ Kanji lanjutan",
        "Keigo & formal speech",
        "Literatur Jepang",
        "Persiapan JLPT N2-N1",
        "Budaya Jepang"
      ],
      icon: Award,
      color: "from-purple-400 to-purple-600"
    }
  ];

  const testimonials = [
    {
      name: "Andi Wijaya",
      role: "Mahasiswa",
      company: "Universitas Indonesia",
      content: "KotobaID membantu saya belajar bahasa Jepang dengan mudah dan menyenangkan. AI-nya sangat membantu dalam memahami kanji yang sulit!",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      name: "Sari Indah",
      role: "Karyawan IT",
      company: "Jakarta",
      content: "Sebagai wibu, aplikasi ini sempurna untuk belajar bahasa Jepang sambil kerja. Gratis dan fiturnya lengkap banget!",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      name: "Budi Santoso",
      role: "Guru Bahasa",
      company: "SMA Negeri 1 Bandung",
      content: "Saya gunakan KotobaID untuk mengajar siswa-siswa saya. Mereka jadi lebih semangat belajar bahasa Jepang dengan AI yang interaktif.",
      rating: 5,
      image: "/api/placeholder/60/60"
    }
  ];

  const faqs = [
    {
      question: "Apakah KotobaID benar-benar gratis?",
      answer: "Ya! KotobaID 100% gratis untuk semua fitur. Tidak ada biaya tersembunyi, tidak ada langganan premium, dan tidak ada batasan akses. Kami percaya bahwa pendidikan bahasa harus dapat diakses oleh semua orang."
    },
    {
      question: "Apakah cocok untuk pemula yang belum tahu bahasa Jepang sama sekali?",
      answer: "Sangat cocok! KotobaID dirancang untuk semua level, mulai dari yang belum pernah belajar bahasa Jepang sama sekali hingga yang sudah mahir. Kami mulai dari Hiragana, Katakana, dan dasar-dasar bahasa Jepang."
    },
    {
      question: "Bagaimana cara AI membantu dalam pembelajaran?",
      answer: "AI kami akan menjadi tutor pribadi Anda! Anda bisa bertanya tentang kanji, tata bahasa, atau budaya Jepang kapan saja. AI akan memberikan penjelasan yang mudah dipahami dan contoh-contoh praktis."
    },
    {
      question: "Bisakah membantu persiapan JLPT?",
      answer: "Tentu saja! KotobaID memiliki materi khusus untuk persiapan JLPT dari level N5 hingga N1. Kami menyediakan latihan soal, kosakata, dan kanji sesuai dengan standar JLPT resmi."
    },
    {
      question: "Apakah bisa diakses dari HP?",
      answer: "Ya! KotobaID dapat diakses dari browser HP, tablet, atau komputer. Interface kami sudah dioptimalkan untuk semua perangkat sehingga Anda bisa belajar dimana saja dan kapan saja."
    },
    {
      question: "Ada komunitas untuk berdiskusi?",
      answer: "Belum ada fitur komunitas built-in, tapi Anda bisa bergabung dengan grup Telegram atau Discord KotobaID untuk berdiskusi dengan sesama pembelajar bahasa Jepang dari Indonesia!"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">KotobaID</h1>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">100% Gratis</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Mulai Belajar Gratis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 py-20 lg:py-28">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              100% Gratis • Tanpa Batasan • Untuk Semua
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Belajar Bahasa Jepang
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dengan AI, Gratis!</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Platform pembelajaran bahasa Jepang yang menyenangkan dan efektif. 
              Dari Hiragana hingga JLPT, semua gratis dan didukung AI cerdas. 
              Perfect untuk wibu, mahasiswa, pekerja, dan siapa saja yang ingin belajar! 🇯🇵
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <button 
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <Heart className="mr-2 h-5 w-5" />
                Mulai Belajar Gratis Sekarang!
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-blue-300 text-blue-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center"
              >
                <Brain className="mr-2 h-5 w-5" />
                Lihat Fitur AI
              </button>
            </div>
            
            {/* Happy Users */}
            <div className="mb-12">
              <p className="text-sm text-gray-500 mb-6">Digunakan dengan senang hati oleh</p>
              <div className="flex flex-wrap justify-center items-center gap-6">
                {happyUsers.map((user, index) => (
                  <div key={index} className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-sm font-medium text-gray-700">
                    {user}
                  </div>
                ))}
              </div>
            </div>
            
            {/* App Preview */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-300">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                    <div className="flex-1 text-center">
                      <span className="text-sm text-white/80">kotobaid.com - Belajar Bahasa Jepang</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-white to-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Brain className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">AI Tutor</h3>
                      <p className="text-gray-600 text-sm">Tanya AI kapan saja tentang kanji, grammar, atau budaya Jepang</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Latihan Interaktif</h3>
                      <p className="text-gray-600 text-sm">Kuis, flashcard, dan game seru untuk belajar kanji & kosakata</p>
                    </div>
                    <div className="text-center group">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">JLPT Ready</h3>
                      <p className="text-gray-600 text-sm">Persiapan lengkap JLPT N5-N1 dengan soal-soal terbaru</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kenapa Pilih KotobaID?</h2>
            <p className="text-gray-600">Platform pembelajaran bahasa Jepang terlengkap dan termudah di Indonesia!</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Fitur Lengkap & Canggih
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Belajar Bahasa Jepang Jadi Mudah!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Semua yang Anda butuhkan untuk menguasai bahasa Jepang, dari dasar hingga mahir. 
              Gratis, lengkap, dan didukung AI cerdas yang siap membantu 24/7!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="group bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Learning Paths Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Jalur Pembelajaran yang Terstruktur</h3>
              <p className="text-lg text-blue-100 max-w-2xl mx-auto">
                Mulai dari mana saja sesuai level Anda. Setiap jalur dirancang khusus untuk memastikan progress yang optimal!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {learningPaths.map((path, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all">
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${path.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                      <path.icon className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold mb-2">{path.title}</h4>
                    <p className="text-blue-100 mb-4">{path.description}</p>
                    <ul className="text-left space-y-2">
                      {path.features.map((feature, i) => (
                        <li key={i} className="flex items-center text-sm text-blue-100">
                          <CheckCircle className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
              <Heart className="h-4 w-4 mr-2" />
              Cerita dari Pengguna
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Mereka Senang Belajar di KotobaID!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ribuan orang Indonesia sudah merasakan serunya belajar bahasa Jepang dengan KotobaID. 
              Yuk, lihat cerita mereka! 😊
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 border-blue-500">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-white text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              Gratis Selamanya!
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Siap Jadi Master Bahasa Jepang?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Gabung dengan ribuan orang Indonesia yang sudah belajar bahasa Jepang dengan mudah dan menyenangkan. 
              100% gratis, tanpa ribet, langsung bisa mulai! 🚀
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <button 
                onClick={onGetStarted}
                className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                <Heart className="mr-2 h-5 w-5" />
                Mulai Belajar Sekarang!
              </button>
              <button 
                onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
                className="border-2 border-white text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Punya Pertanyaan?
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Coffee className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium">Belajar Santai</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Brain className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium">AI Cerdas</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Heart className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium">100% Gratis</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <Award className="h-8 w-8 text-white mx-auto mb-2" />
                <p className="text-white font-medium">JLPT Ready</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6">
              <Smile className="h-4 w-4 mr-2" />
              FAQ - Frequently Asked Questions
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Ada Pertanyaan? 🤔
            </h2>
            <p className="text-xl text-gray-600">
              Jawaban untuk pertanyaan yang paling sering ditanyakan tentang KotobaID. 
              Masih bingung? Langsung tanya AI aja di dalam aplikasi!
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl overflow-hidden border border-blue-100">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/50 transition-colors"
                >
                  <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    openFaq === index ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'
                  }`}>
                    {openFaq === index ? '-' : '+'}
                  </div>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-5 bg-white/50">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold">KotobaID</h3>
            </div>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto text-lg">
              Platform belajar bahasa Jepang yang 100% gratis dan menyenangkan! 
              Dibuat dengan ❤️ untuk semua orang Indonesia yang ingin menguasai bahasa Jepang.
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-6 w-6" />
              </a>
              <a href="mailto:hello@kotobaid.com" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <div className="text-gray-400 text-sm mb-4">
              <p>&copy; 2024 KotobaID. Dibuat dengan ❤️ di Indonesia. Semua hak dilindungi.</p>
            </div>
            <div className="flex flex-wrap justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Kebijakan Privasi</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Syarat Layanan</a>
              <a href="#faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</a>
              <a href="mailto:hello@kotobaid.com" className="text-gray-400 hover:text-white text-sm transition-colors">Kontak</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;