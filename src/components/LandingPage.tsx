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
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Brain,
  Clock,
  Target,
  Zap,
  Shield,
  Headphones,
  BarChart3,
  Building2,
  Smartphone,
  Monitor,
  MessageSquare,
  Download,
  ExternalLink,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Video,
  Layers,
  Database,
  Cloud,
  Lock,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState('individual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const enterpriseFeatures = [
    {
      icon: Brain,
      title: "AI-Powered Learning Engine",
      description: "Advanced neural networks provide personalized learning paths and real-time feedback",
      category: "AI Technology"
    },
    {
      icon: Cloud,
      title: "Enterprise Cloud Infrastructure",
      description: "Scalable, secure cloud platform with 99.9% uptime guarantee and global CDN",
      category: "Infrastructure"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "SOC 2 Type II compliant with end-to-end encryption and advanced threat protection",
      category: "Security"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Comprehensive learning analytics with custom dashboards and detailed progress reports",
      category: "Analytics"
    },
    {
      icon: Database,
      title: "Comprehensive Content Library",
      description: "Over 50,000 learning materials with continuous content updates and quality assurance",
      category: "Content"
    },
    {
      icon: Headphones,
      title: "24/7 Enterprise Support",
      description: "Dedicated support team with guaranteed response times and priority assistance",
      category: "Support"
    }
  ];

  const trustedBy = [
    "Toyota", "Sony", "Nintendo", "Rakuten", "SoftBank", "Panasonic", "Honda", "Mitsubishi"
  ];

  const stats = [
    { number: "500K+", label: "Global Users", description: "Active learners worldwide" },
    { number: "50M+", label: "Lessons Completed", description: "Total learning sessions" },
    { number: "99.9%", label: "Uptime", description: "Platform reliability" },
    { number: "150+", label: "Countries", description: "Global reach" }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      period: "Forever",
      description: "Perfect for individuals getting started",
      features: [
        "Access to basic lessons",
        "100 kanji characters",
        "Basic grammar lessons",
        "Community support",
        "Mobile app access"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro",
      price: "19",
      period: "per month",
      description: "For serious learners and professionals",
      features: [
        "Everything in Free",
        "5,000+ kanji characters",
        "Advanced grammar system",
        "AI tutor conversations",
        "Progress analytics",
        "Offline mode",
        "Priority support"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "Contact us",
      description: "For organizations and institutions",
      features: [
        "Everything in Pro",
        "Custom integrations",
        "SSO & LDAP support",
        "Advanced analytics",
        "Dedicated support",
        "Custom branding",
        "API access",
        "SLA guarantee"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Dr. Sarah Johnson",
      role: "Language Department Head",
      company: "Stanford University",
      content: "KotobaID has revolutionized how we teach Japanese. The AI-powered approach delivers measurable results that traditional methods simply can't match.",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      name: "Hiroshi Tanaka",
      role: "Global Training Director",
      company: "Sony Corporation",
      content: "We've deployed KotobaID across 50+ countries for our international staff. The enterprise features and support have been exceptional.",
      rating: 5,
      image: "/api/placeholder/60/60"
    },
    {
      name: "Maria Rodriguez",
      role: "CEO",
      company: "Language Learning Solutions",
      content: "The analytics and reporting capabilities give us unprecedented insights into learning patterns. Our success rates have improved by 300%.",
      rating: 5,
      image: "/api/placeholder/60/60"
    }
  ];

  const faqs = [
    {
      question: "How does KotobaID's AI technology work?",
      answer: "Our AI engine uses advanced natural language processing and machine learning to analyze your learning patterns, identify knowledge gaps, and create personalized study plans. It adapts in real-time to your progress and learning style."
    },
    {
      question: "Is my data secure and private?",
      answer: "Yes, we follow enterprise-grade security standards including SOC 2 Type II compliance, end-to-end encryption, and strict data privacy policies. Your learning data is never shared with third parties."
    },
    {
      question: "Can I integrate KotobaID with existing learning systems?",
      answer: "Absolutely. Our Enterprise plan includes API access, SSO integration, and custom integrations with popular LMS platforms like Moodle, Canvas, and Blackboard."
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer comprehensive support including 24/7 technical assistance for Enterprise customers, extensive documentation, video tutorials, and dedicated customer success managers."
    },
    {
      question: "How accurate is the JLPT preparation content?",
      answer: "Our content is developed by certified Japanese language experts and continuously updated based on official JLPT guidelines. We maintain a 95%+ accuracy rate in our practice tests."
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
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Enterprise</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-8">
              <a href="#solutions" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Solutions</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
              <a href="#customers" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Customers</a>
              <a href="#resources" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Resources</a>
              <a href="#company" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Company</a>
            </nav>
            
            <div className="hidden lg:flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </button>
              <button 
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Start Free Trial
              </button>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#solutions" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Solutions</a>
              <a href="#features" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Features</a>
              <a href="#pricing" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Pricing</a>
              <a href="#customers" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Customers</a>
              <a href="#resources" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Resources</a>
              <button 
                onClick={onGetStarted}
                className="w-full text-left px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mt-4"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 py-20 lg:py-28">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              Powered by Advanced AI Technology
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Enterprise Japanese Learning
              <span className="block text-blue-600">Platform for Global Teams</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Deploy AI-powered Japanese language learning across your organization. 
              Trusted by Fortune 500 companies to train international teams with measurable results.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <button 
                onClick={onGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center">
                <Calendar className="mr-2 h-5 w-5" />
                Book Meeting
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mb-12">
              <p className="text-sm text-gray-500 mb-6">Trusted by leading organizations worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                {trustedBy.map((company, index) => (
                  <div key={index} className="text-lg font-semibold text-gray-400">
                    {company}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product Demo */}
            <div className="relative max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 text-center">
                      <span className="text-sm text-gray-600">kotobaid.com - Enterprise Dashboard</span>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                      <p className="text-gray-600">Real-time learning insights and performance metrics</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Brain className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Learning</h3>
                      <p className="text-gray-600">Personalized study paths for every learner</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                      <p className="text-gray-600">SOC 2 compliant with enterprise-grade protection</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-600">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
              <Building2 className="h-4 w-4 mr-2" />
              Enterprise-Grade Platform
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Built for Global Organizations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Deploy scalable Japanese language learning across your entire organization with enterprise-grade security, 
              advanced analytics, and dedicated support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {enterpriseFeatures.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {feature.category}
                      </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Integration Section */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-200">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Seamless Integration</h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Connect with your existing tools and workflows. KotobaID integrates with leading enterprise platforms.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Monitor className="h-8 w-8 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-900">LMS Integration</h4>
                <p className="text-sm text-gray-600 mt-1">Moodle, Canvas, Blackboard</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-900">SSO & Identity</h4>
                <p className="text-sm text-gray-600 mt-1">LDAP, SAML, OAuth</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-600 mt-1">Tableau, Power BI, Looker</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Communication</h4>
                <p className="text-sm text-gray-600 mt-1">Slack, Teams, Discord</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="customers" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
              <Award className="h-4 w-4 mr-2" />
              Customer Success Stories
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of organizations worldwide that have transformed their Japanese language training with KotobaID.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600 font-medium">{testimonial.company}</div>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              Simple, Transparent Pricing
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and scale as you grow. No hidden fees, no complicated contracts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-md ${
                plan.popular ? 'border-blue-500 relative' : 'border-gray-200'
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price === "Custom" ? "Custom" : `$${plan.price}`}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-gray-600 ml-2">{plan.period}</span>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mr-3 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={plan.name === "Free" ? onGetStarted : undefined}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                      plan.popular 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white text-center">
            <h3 className="text-3xl font-bold mb-4">Need a Custom Solution?</h3>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Get a tailored package for your organization with custom integrations, dedicated support, and enterprise SLA.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Contact Sales
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="resources" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full text-orange-700 text-sm font-medium mb-6">
              <FileText className="h-4 w-4 mr-2" />
              Frequently Asked Questions
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Got Questions?
            </h2>
            <p className="text-xl text-gray-600">
              Find answers to common questions about KotobaID's enterprise platform.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                  {openFaq === index ? (
                    <Minus className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Organization?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of companies worldwide that trust KotobaID to deliver exceptional Japanese language learning experiences.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold">KotobaID</h3>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                The leading enterprise Japanese language learning platform powered by AI. 
                Trusted by Fortune 500 companies worldwide.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Education</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Government</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Healthcare</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              <p>&copy; 2024 KotobaID Enterprise. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;