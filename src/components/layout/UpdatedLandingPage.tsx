import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  Target, 
  Zap, 
  Users, 
  Award, 
  ArrowRight, 
  Play, 
  Check,
  Star,
  Globe,
  Clock,
  BarChart3,
  Search,
  Volume2,
  Edit3,
  FileText,
  Lightbulb,
  Layers,
  Settings,
  ChevronRight,
  ChevronLeft,
  Quote
} from 'lucide-react';

interface UpdatedLandingPageProps {
  onGetStarted: () => void;
}

const UpdatedLandingPage: React.FC<UpdatedLandingPageProps> = ({ onGetStarted }) => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description: "Dapatkan rekomendasi personal dan analisis mendalam dengan teknologi AI terdepan",
      color: "from-purple-500 to-pink-500",
      details: ["Analisis kalimat otomatis", "Rekomendasi pembelajaran", "Chatbot AI untuk Q&A"]
    },
    {
      icon: Search,
      title: "Advanced Study Tools",
      description: "Kamus lengkap dan sentence analyzer untuk pemahaman yang lebih baik",
      color: "from-blue-500 to-cyan-500",
      details: ["Kamus 5000+ kata", "Breakdown grammar", "Contoh kalimat"]
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Lacak kemajuan belajar dengan dashboard analytics yang detail",
      color: "from-green-500 to-teal-500",
      details: ["Statistik pembelajaran", "Grafik progress", "Insight AI"]
    },
    {
      icon: Target,
      title: "SRS Flashcards",
      description: "Sistem spaced repetition untuk mengoptimalkan hafalan vocabulary",
      color: "from-orange-500 to-red-500",
      details: ["Algoritma SRS", "Review otomatis", "Tracking retensi"]
    },
    {
      icon: Edit3,
      title: "Writing Practice",
      description: "Latihan menulis kanji dan kana dengan stroke order yang benar",
      color: "from-indigo-500 to-purple-500",
      details: ["Stroke order guide", "Real-time feedback", "Progress tracking"]
    },
    {
      icon: Volume2,
      title: "Audio Learning",
      description: "Latihan listening dan pronunciation dengan native speaker",
      color: "from-pink-500 to-rose-500",
      details: ["Audio berkualitas tinggi", "Speech recognition", "Pronunciation scoring"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "JLPT N3 Passer",
      content: "KotobaID membantu saya lulus JLPT N3 dalam 6 bulan. Fitur AI-nya sangat membantu!",
      avatar: "👩‍💼"
    },
    {
      name: "Michael Chen",
      role: "Japanese Student",
      content: "Study tools dan analytics dashboard-nya luar biasa. Saya bisa track progress dengan detail.",
      avatar: "👨‍🎓"
    },
    {
      name: "Lisa Wong",
      role: "Language Enthusiast",
      content: "Writing practice dengan stroke order benar-benar membantu saya menulis kanji dengan benar.",
      avatar: "👩‍🏫"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Users", icon: Users },
    { value: "5,000+", label: "Words in Dictionary", icon: BookOpen },
    { value: "95%", label: "AI Accuracy", icon: Brain },
    { value: "4.9/5", label: "User Rating", icon: Star },
  ];

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length);
  };

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KotobaID</h1>
                <p className="text-xs text-gray-500">AI-Powered Japanese Learning</p>
              </div>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Japanese with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI Power</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Platform pembelajaran bahasa Jepang paling komprehensif dengan teknologi AI terdepan. 
              Dari basic hiragana hingga advanced conversation, semua ada di sini.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Start Learning Now</span>
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors font-semibold text-lg">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    {React.createElement(stat.icon, { className: "h-8 w-8 text-white" })}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fitur-fitur canggih yang dirancang khusus untuk mengoptimalkan pembelajaran bahasa Jepang
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature Display */}
            <div className="relative">
              <div className={`bg-gradient-to-r ${features[currentFeature].color} rounded-2xl p-8 text-white`}>
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-white/20 rounded-lg mr-4">
                    {React.createElement(features[currentFeature].icon, { className: "h-8 w-8" })}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold">{features[currentFeature].title}</h4>
                    <p className="text-white/80">{features[currentFeature].description}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {features[currentFeature].details.map((detail, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="h-5 w-5 mr-3 text-white/80" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation */}
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={prevFeature}
                  className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-600" />
                </button>
                <div className="flex space-x-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentFeature ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextFeature}
                  className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                >
                  <ChevronRight className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-200 ${
                    index === currentFeature
                      ? 'bg-white shadow-lg scale-105 border-2 border-blue-200'
                      : 'bg-white/60 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-3 rounded-lg mb-4 bg-gradient-to-r ${feature.color} inline-block`}>
                    {React.createElement(feature.icon, { className: "h-6 w-6 text-white" })}
                  </div>
                  <h5 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h5>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h3>
            <p className="text-xl text-gray-600">Join thousands of successful Japanese learners</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 relative">
                <Quote className="h-8 w-8 text-blue-600 mb-4" />
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Japanese Journey?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Join ribuan pembelajar yang sudah merasakan kemudahan belajar dengan KotobaID
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg inline-flex items-center space-x-2"
          >
            <span>Start Free Today</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold">KotobaID</h4>
                  <p className="text-gray-400 text-sm">AI-Powered Learning</p>
                </div>
              </div>
              <p className="text-gray-400">
                Platform pembelajaran bahasa Jepang dengan teknologi AI terdepan
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Features</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Study Tools</li>
                <li>AI Analytics</li>
                <li>Writing Practice</li>
                <li>Audio Learning</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Community</li>
                <li>Tutorials</li>
                <li>Contact Us</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Company</h5>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 KotobaID. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UpdatedLandingPage;