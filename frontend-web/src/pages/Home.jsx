import { Link } from 'react-router-dom';
import { 
  Activity, FileText, AlertCircle, Building, ShieldCheck, 
  ChevronRight, Stethoscope, Heart, Clock, MapPin, 
  Phone, Mail, Facebook, Twitter, Instagram, Linkedin,
  Award, Users, Ambulance, Calendar, Bell, Menu,
  X, Download, Upload, Share2, Settings, User,
  Moon, Sun, Globe, ChevronDown, Zap, Shield,
  Thermometer, Droplets, HeartPulse, Microscope,
  Brain, Cpu, Sparkles, Fingerprint, Scan,
  BadgeCheck, Target, Compass, Navigation, Play,
  Rocket, Stars, Infinity, Gem, CircleDot, Gauge,
  MessageCircle, Send, Bot, Maximize2, Minimize2
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import '../App.css';

// Floating Chat Component - Define before the main component
function FloatingChat({ isOpen, onClose, onOpen }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your AI health assistant. How can I help you today? 😊" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && isOpen && !isMinimized) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMinimized, onClose]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const responses = [
        "Based on your symptoms, I'd recommend consulting with a healthcare provider.",
        "Remember to stay hydrated and get plenty of rest! 💧",
        "I can help you understand your medical reports. Would you like to upload one?",
        "Your health metrics are looking good! Keep up the healthy habits! 🌟",
        "I'm here 24/7 to answer your health questions. What else would you like to know?"
      ];
      const aiReply = { 
        role: 'ai', 
        text: responses[Math.floor(Math.random() * responses.length)]
      };
      setMessages(prev => [...prev, aiReply]);
      setIsLoading(false);
    }, 1000);
  };

  const suggestedQuestions = [
    "What do my blood test results mean?",
    "Symptoms of diabetes?",
    "Healthy diet tips",
    "Medication reminders"
  ];

  if (!isOpen) {
    return (
      <button 
        onClick={onOpen}
        style={floatingChatStyles.floatingChatButton}
        className="floating-chat-btn"
      >
        <div style={floatingChatStyles.floatingChatGlow}></div>
        <Bot size={28} color="#ffffff" />
        <span style={floatingChatStyles.floatingChatBadge}>1</span>
      </button>
    );
  }

  return (
    <div 
      ref={chatRef}
      style={{
        ...floatingChatStyles.floatingChatWindow,
        height: isMinimized ? '60px' : '500px',
        width: isMinimized ? '300px' : '350px',
      }}
      className="floating-chat-window"
    >
      {/* Chat Header */}
      <div style={floatingChatStyles.floatingChatHeader}>
        <div style={floatingChatStyles.floatingChatHeaderLeft}>
          <div style={floatingChatStyles.floatingChatAvatar}>
            <Bot size={18} color="#9b59b6" />
          </div>
          <div>
            <h4 style={floatingChatStyles.floatingChatTitle}>AI Health Assistant</h4>
            <div style={floatingChatStyles.floatingChatStatus}>
              <span style={floatingChatStyles.floatingStatusDot}></span>
              <span>Online</span>
            </div>
          </div>
        </div>
        <div style={floatingChatStyles.floatingChatHeaderRight}>
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            style={floatingChatStyles.floatingChatButtonSmall}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button 
            onClick={onClose}
            style={floatingChatStyles.floatingChatButtonSmall}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Messages */}
          <div style={floatingChatStyles.floatingChatMessages}>
            {messages.map((msg, index) => (
              <div 
                key={index} 
                style={{
                  ...floatingChatStyles.floatingMessageWrapper,
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {msg.role === 'ai' && (
                  <div style={floatingChatStyles.floatingMessageAvatar}>
                    <Bot size={12} color="#9b59b6" />
                  </div>
                )}
                <div style={{
                  ...floatingChatStyles.floatingMessageBubble,
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, #9b59b6, #8e44ad)'
                    : '#f1f2f6',
                  color: msg.role === 'user' ? '#ffffff' : '#2c3e50',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                  borderBottomLeftRadius: msg.role === 'user' ? '12px' : '4px',
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={floatingChatStyles.floatingLoadingWrapper}>
                <div style={floatingChatStyles.floatingLoadingAvatar}>
                  <Bot size={12} color="#9b59b6" />
                </div>
                <div style={floatingChatStyles.floatingLoadingBubble}>
                  <div style={floatingChatStyles.typingIndicator}>
                    <span style={floatingChatStyles.typingDot}></span>
                    <span style={{...floatingChatStyles.typingDot, animationDelay: '0.2s'}}></span>
                    <span style={{...floatingChatStyles.typingDot, animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Suggested Questions */}
            {messages.length === 1 && !isLoading && (
              <div style={floatingChatStyles.floatingSuggested}>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    style={floatingChatStyles.floatingSuggestedButton}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={floatingChatStyles.floatingInputArea}>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              style={floatingChatStyles.floatingInput}
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              style={{
                ...floatingChatStyles.floatingSendButton,
                background: !input.trim() ? '#bdc3c7' : '#9b59b6',
              }}
            >
              <Send size={16} color="white" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

// Floating chat styles - Define before the main styles
const floatingChatStyles = {
  floatingChatButton: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    width: '65px',
    height: '65px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(155,89,182,0.4)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
  },
  floatingChatGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '75px',
    height: '75px',
    background: 'radial-gradient(circle, rgba(155,89,182,0.4) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  floatingChatBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#e74c3c',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff',
  },
  floatingChatWindow: {
    position: 'fixed',
    bottom: '100px',
    right: '30px',
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    zIndex: 1000,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    border: '2px solid rgba(155,89,182,0.3)',
  },
  floatingChatHeader: {
    padding: '15px',
    background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
    borderBottom: '2px solid #dee2e6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  floatingChatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  floatingChatAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '10px',
    background: 'rgba(155,89,182,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(155,89,182,0.3)',
  },
  floatingChatTitle: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#2c3e50',
  },
  floatingChatStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '11px',
    color: '#27ae60',
  },
  floatingStatusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#2ecc71',
    animation: 'pulse 2s ease-in-out infinite',
  },
  floatingChatHeaderRight: {
    display: 'flex',
    gap: '5px',
  },
  floatingChatButtonSmall: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.5)',
    border: '1px solid #dee2e6',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#7f8c8d',
  },
  floatingChatMessages: {
    flex: 1,
    padding: '15px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    background: '#f8f9fa',
  },
  floatingMessageWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  floatingMessageAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '8px',
    background: 'rgba(155,89,182,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(155,89,182,0.3)',
  },
  floatingMessageBubble: {
    padding: '10px 12px',
    borderRadius: '12px',
    fontSize: '13px',
    lineHeight: '1.5',
    maxWidth: '85%',
    wordWrap: 'break-word',
  },
  floatingLoadingWrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  floatingLoadingAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '8px',
    background: 'rgba(155,89,182,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(155,89,182,0.3)',
  },
  floatingLoadingBubble: {
    background: '#ffffff',
    padding: '10px 15px',
    borderRadius: '12px 12px 12px 4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  typingIndicator: {
    display: 'flex',
    gap: '4px',
  },
  typingDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#9b59b6',
    animation: 'typing 1.4s infinite ease-in-out',
  },
  floatingSuggested: {
    padding: '10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  floatingSuggestedButton: {
    padding: '8px 12px',
    background: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '20px',
    fontSize: '11px',
    color: '#2c3e50',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s ease',
  },
  floatingInputArea: {
    padding: '12px',
    background: '#ffffff',
    borderTop: '2px solid #f0f0f0',
    display: 'flex',
    gap: '8px',
  },
  floatingInput: {
    flex: 1,
    padding: '10px 12px',
    borderRadius: '20px',
    border: '2px solid #e0e0e0',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  floatingSendButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState(null);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);

  const userName = localStorage.getItem('userName') || "User";

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate loading
  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  // Mouse move parallax effect (disabled on mobile)
  useEffect(() => {
    if (windowWidth <= 768) return;
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [windowWidth]);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowScrollTop(window.scrollY > 300);

      // Parallax effects (disabled on mobile)
      if (heroRef.current && windowWidth > 768) {
        const scrolled = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [windowWidth]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (featuresRef.current) observer.observe(featuresRef.current);
    if (statsRef.current) observer.observe(statsRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick stats with animations - responsive values
  const quickStats = [
    { icon: FileText, label: 'Health Records', value: '12', color: '#3498db', bgColor: 'rgba(52, 152, 219, 0.1)', trend: '+2 this month' },
    { icon: Calendar, label: 'Appointments', value: '3', color: '#2ecc71', bgColor: 'rgba(46, 204, 113, 0.1)', trend: 'Next: Tomorrow' },
    { icon: AlertCircle, label: 'Emergency Contacts', value: '5', color: '#e74c3c', bgColor: 'rgba(231, 76, 60, 0.1)', trend: 'All active' },
    { icon: Activity, label: 'Health Score', value: '85', unit: '%', color: '#9b59b6', bgColor: 'rgba(155, 89, 182, 0.1)', trend: '+5% vs last month' }
  ];

  // Features array with AI Health Chat added
  const features = [
    {
      icon: Brain,
      title: 'AI Health Assistant',
      description: 'Advanced neural network analyzing your health patterns 24/7 with predictive insights.',
      color: '#3498db',
      gradient: 'linear-gradient(135deg, #3498db20, #2980b920)',
      borderColor: '#3498db40',
      link: '/dashboard',
      status: 'active',
      metrics: ['98% accuracy', 'Real-time analysis', 'Pattern recognition'],
      iconBg: 'linear-gradient(135deg, #3498db, #2980b9)'
    },
    {
      icon: Shield,
      title: 'Emergency SOS',
      description: 'Instant alert system with GPS tracking and automatic hospital coordination.',
      color: '#e74c3c',
      gradient: 'linear-gradient(135deg, #e74c3c20, #c0392b20)',
      borderColor: '#e74c3c40',
      link: '/emergency',
      status: 'active',
      metrics: ['< 30 sec response', 'Location sharing', 'Auto-notify'],
      iconBg: 'linear-gradient(135deg, #e74c3c, #c0392b)'
    },
    {
      icon: Navigation,
      title: 'Smart Hospital Locator',
      description: 'AI-powered hospital matching based on your symptoms and medical history.',
      color: '#2ecc71',
      gradient: 'linear-gradient(135deg, #2ecc7120, #27ae6020)',
      borderColor: '#2ecc7140',
      link: '/hospitals',
      status: 'active',
      metrics: ['500+ hospitals', 'Real-time availability', 'Specialist match'],
      iconBg: 'linear-gradient(135deg, #2ecc71, #27ae60)'
    },
    {
      icon: Scan,
      title: 'Document Scanner AI',
      description: 'Advanced OCR technology that extracts and organizes medical data instantly.',
      color: '#f39c12',
      gradient: 'linear-gradient(135deg, #f39c1220, #e67e2220)',
      borderColor: '#f39c1240',
      link: '/scan',
      status: 'active',
      metrics: ['99% accuracy', 'Multi-format', 'Auto-tagging'],
      iconBg: 'linear-gradient(135deg, #f39c12, #e67e22)'
    },
    {
      icon: HeartPulse,
      title: 'Vital Signs Monitor',
      description: 'Continuous health tracking with smart alerts and trend analysis.',
      color: '#e84342',
      gradient: 'linear-gradient(135deg, #e8434220, #c0392b20)',
      borderColor: '#e8434240',
      link: '/vitals',
      status: 'active',
      metrics: ['Real-time ECG', 'Blood pressure', 'Heart rate'],
      iconBg: 'linear-gradient(135deg, #e84342, #c0392b)'
    },
    {
      icon: MessageCircle,
      title: 'AI Health Chat',
      description: '24/7 AI-powered health assistant ready to answer your medical questions instantly.',
      color: '#9b59b6',
      gradient: 'linear-gradient(135deg, #9b59b620, #8e44ad20)',
      borderColor: '#9b59b640',
      link: '/chat',
      status: 'active',
      metrics: ['Instant responses', 'Medical knowledge', 'Symptom checker'],
      iconBg: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
    },
    {
      icon: Cpu,
      title: 'Predictive Analytics',
      description: 'Machine learning algorithms predicting health risks before they occur.',
      color: '#8e44ad',
      gradient: 'linear-gradient(135deg, #8e44ad20, #9b59b620)',
      borderColor: '#8e44ad40',
      link: '/analytics',
      status: 'coming-soon',
      metrics: ['Risk prediction', 'Prevention tips', 'Health trends'],
      iconBg: 'linear-gradient(135deg, #8e44ad, #9b59b6)'
    },
    {
      icon: Rocket,
      title: 'Health Insights',
      description: 'Personalized health recommendations based on your medical history.',
      color: '#16a085',
      gradient: 'linear-gradient(135deg, #16a08520, #1abc9c20)',
      borderColor: '#16a08540',
      link: '/insights',
      status: 'active',
      metrics: ['Daily tips', 'Personalized', 'Evidence-based'],
      iconBg: 'linear-gradient(135deg, #16a085, #1abc9c)'
    },
    {
      icon: Infinity,
      title: 'Lifetime Records',
      description: 'Secure, encrypted storage of your complete medical history.',
      color: '#d35400',
      gradient: 'linear-gradient(135deg, #d3540020, #e67e2220)',
      borderColor: '#d3540040',
      link: '/records',
      status: 'active',
      metrics: ['Unlimited storage', 'Encrypted', 'Easy access'],
      iconBg: 'linear-gradient(135deg, #d35400, #e67e22)'
    }
  ];

  // Achievement badges
  const achievements = [
    { icon: Award, label: 'Health Champion', progress: 80, color: '#f1c40f' },
    { icon: Target, label: 'Regular Checkups', progress: 60, color: '#3498db' },
    { icon: Zap, label: 'Emergency Ready', progress: 100, color: '#2ecc71' }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "This platform saved my life. The emergency SOS feature is incredible.",
      author: "Sarah Johnson",
      role: "Patient",
      avatar: "SJ"
    },
    {
      quote: "As a doctor, I recommend this to all my patients. It's revolutionary.",
      author: "Dr. Michael Chen",
      role: "Cardiologist",
      avatar: "MC"
    },
    {
      quote: "The AI health assistant is like having a doctor in your pocket.",
      author: "Priya Patel",
      role: "Healthcare Admin",
      avatar: "PP"
    }
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <ShieldCheck size={windowWidth <= 480 ? 48 : 64} color="#3498db" style={styles.loadingIcon} />
          <div style={styles.loadingBar}>
            <div style={styles.loadingProgress}></div>
          </div>
          <p style={styles.loadingText}>Initializing Health Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container" style={styles.container}>
      
      {/* Floating Particles Background - Fewer on mobile */}
      <div style={styles.particles}>
        {[...Array(windowWidth <= 768 ? 10 : 30)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: windowWidth <= 768 ? 0.05 : 0.1 + Math.random() * 0.2,
              backgroundColor: i % 3 === 0 ? '#3498db' : i % 3 === 1 ? '#2ecc71' : '#e74c3c',
              width: windowWidth <= 768 ? '2px' : '4px',
              height: windowWidth <= 768 ? '2px' : '4px',
            }}
          />
        ))}
      </div>

      {/* Hero Section with 3D Parallax - Responsive padding */}
      <section style={{
        ...styles.hero,
        padding: windowWidth <= 480 ? '60px 15px 40px' : windowWidth <= 768 ? '80px 20px 50px' : '100px 40px 60px',
      }}>
        <div style={styles.heroBackground} ref={heroRef}>
          <div style={styles.heroGradient}></div>
          <div style={styles.heroPattern}></div>
          <div style={styles.heroShapes}>
            <div style={styles.shape1}></div>
            <div style={styles.shape2}></div>
            <div style={styles.shape3}></div>
          </div>
        </div>
        
        <div style={{
          ...styles.heroContent,
          gridTemplateColumns: windowWidth <= 1024 ? '1fr' : '1fr 1fr',
          gap: windowWidth <= 480 ? '30px' : windowWidth <= 768 ? '40px' : '60px',
        }}>
          <div style={styles.heroLeft}>
            <div style={styles.welcomeBadge} className="slide-in">
              <Sparkles size={16} color="#3498db" />
              <span>Welcome back to your health command center</span>
            </div>
            
            <h1 style={{
              ...styles.heroTitle,
              fontSize: windowWidth <= 480 ? '32px' : windowWidth <= 768 ? '40px' : 'clamp(40px, 6vw, 64px)',
            }}>
              Hello, <span style={{ color: '#3498db', position: 'relative' }}>
                {userName}
                <span style={styles.titleGlow}></span>
              </span>
            </h1>
            
            <p style={{
              ...styles.heroSubtitle,
              fontSize: windowWidth <= 480 ? '14px' : windowWidth <= 768 ? '15px' : 'clamp(14px, 2vw, 18px)',
            }}>
              Your AI-powered health companion is actively monitoring and analyzing your wellness data to provide personalized insights.
            </p>

            {/* Animated Stats Grid */}
            <div style={{
              ...styles.heroStats,
              gridTemplateColumns: windowWidth <= 480 ? '1fr' : 'repeat(2, 1fr)',
              gap: windowWidth <= 480 ? '12px' : '20px',
            }} ref={statsRef}>
              {quickStats.map((stat, index) => (
                <div 
                  key={index} 
                  style={{
                    ...styles.statCard,
                    padding: windowWidth <= 480 ? '15px' : '20px',
                  }}
                  className="stat-card"
                  onMouseEnter={() => setActiveFeature(index)}
                  onMouseLeave={() => setActiveFeature(null)}
                >
                  <div style={styles.statIconContainer}>
                    <div style={{ ...styles.statIconBg, backgroundColor: stat.bgColor }}>
                      <stat.icon size={windowWidth <= 480 ? 20 : 24} color={stat.color} />
                    </div>
                    {activeFeature === index && windowWidth > 768 && (
                      <div style={styles.statPulse}></div>
                    )}
                  </div>
                  <div style={styles.statInfo}>
                    <div style={{
                      ...styles.statValue,
                      fontSize: windowWidth <= 480 ? '18px' : 'clamp(18px, 3vw, 24px)',
                      flexDirection: windowWidth <= 480 ? 'column' : 'row',
                      alignItems: windowWidth <= 480 ? 'flex-start' : 'center',
                      gap: windowWidth <= 480 ? '4px' : '10px',
                    }}>
                      {stat.value}{stat.unit}
                      {windowWidth > 480 && (
                        <span style={styles.statTrend}>{stat.trend}</span>
                      )}
                    </div>
                    <div style={styles.statLabel}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              ...styles.heroButtons,
              flexDirection: windowWidth <= 480 ? 'column' : 'row',
              gap: windowWidth <= 480 ? '12px' : '16px',
            }} className="fade-up-delay-2">
              <Link to="/dashboard" style={{
                ...styles.primaryButton,
                padding: windowWidth <= 480 ? '14px 24px' : '16px 32px',
                justifyContent: windowWidth <= 480 ? 'center' : 'flex-start',
              }} className="btn-3d">
                <span>Launch Dashboard</span>
                <ChevronRight size={18} style={styles.btnIcon} />
                <div style={styles.btnGlow}></div>
              </Link>
              
              <Link to="/scan" style={{
                ...styles.secondaryButton,
                padding: windowWidth <= 480 ? '14px 24px' : '16px 32px',
                justifyContent: windowWidth <= 480 ? 'center' : 'flex-start',
              }} className="btn-outline-3d">
                <Scan size={18} />
                <span>Quick Scan</span>
              </Link>
            </div>

            {/* Achievement Badges - Hide on very small mobile */}
            {windowWidth > 480 && (
              <div style={styles.achievements}>
                {achievements.map((ach, i) => (
                  <div key={i} style={styles.achievementBadge}>
                    <div style={styles.achievementIcon}>
                      <ach.icon size={14} color={ach.color} />
                    </div>
                    <div style={styles.achievementInfo}>
                      <span style={styles.achievementLabel}>{ach.label}</span>
                      <div style={styles.achievementProgress}>
                        <div style={{ ...styles.achievementBar, width: `${ach.progress}%`, backgroundColor: ach.color }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Hide on mobile */}
          {windowWidth > 1024 && (
            <div style={styles.heroRight}>
              <div style={styles.hero3DContainer}>
                <div style={{
                  ...styles.hero3DBox,
                  transform: `perspective(1000px) rotateY(${mousePosition.x}deg) rotateX(${-mousePosition.y}deg)`
                }}>
                  <div style={styles.healthCube}>
                    <div style={styles.cubeFaceFront}>
                      <HeartPulse size={48} color="#3498db" />
                      <span>Health Score</span>
                      <span style={styles.cubeValue}>85%</span>
                    </div>
                    <div style={styles.cubeFaceBack}>
                      <Activity size={48} color="#2ecc71" />
                      <span>Active Minutes</span>
                      <span style={styles.cubeValue}>2,340</span>
                    </div>
                    <div style={styles.cubeFaceRight}>
                      <Calendar size={48} color="#e74c3c" />
                      <span>Checkups</span>
                      <span style={styles.cubeValue}>12</span>
                    </div>
                    <div style={styles.cubeFaceLeft}>
                      <Award size={48} color="#f39c12" />
                      <span>Achievements</span>
                      <span style={styles.cubeValue}>8</span>
                    </div>
                    <div style={styles.cubeFaceTop}>
                      <Zap size={48} color="#9b59b6" />
                      <span>Energy</span>
                      <span style={styles.cubeValue}>High</span>
                    </div>
                    <div style={styles.cubeFaceBottom}>
                      <Shield size={48} color="#3498db" />
                      <span>Protected</span>
                      <span style={styles.cubeValue}>100%</span>
                    </div>
                  </div>
                </div>

                {/* Floating Health Metrics */}
                <div style={styles.floatingMetrics}>
                  <div style={{ ...styles.metric, animation: 'float 3s ease-in-out infinite', top: '20%', left: '10%' }}>
                    <Heart size={16} color="#e74c3c" />
                    <span>72 bpm</span>
                  </div>
                  <div style={{ ...styles.metric, animation: 'float 3.5s ease-in-out infinite', animationDelay: '0.5s', top: '60%', left: '80%' }}>
                    <Thermometer size={16} color="#3498db" />
                    <span>36.6°C</span>
                  </div>
                  <div style={{ ...styles.metric, animation: 'float 4s ease-in-out infinite', animationDelay: '1s', top: '70%', left: '20%' }}>
                    <Droplets size={16} color="#2ecc71" />
                    <span>98% SpO2</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section with Responsive Grid */}
      <section style={{
        ...styles.features,
        padding: windowWidth <= 480 ? '50px 15px' : windowWidth <= 768 ? '70px 20px' : '100px 40px',
      }} ref={featuresRef}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionBadge}>
            <Cpu size={20} color="#3498db" />
            <span>AI-Powered Features</span>
          </div>
          <h2 style={{
            ...styles.sectionTitle,
            fontSize: windowWidth <= 480 ? '24px' : windowWidth <= 768 ? '32px' : 'clamp(32px, 5vw, 48px)',
          }}>Intelligent Health Management</h2>
          <p style={{
            ...styles.sectionSubtitle,
            fontSize: windowWidth <= 480 ? '14px' : windowWidth <= 768 ? '15px' : 'clamp(14px, 2vw, 18px)',
          }}>Advanced algorithms working 24/7 to keep you healthy and informed</p>
        </div>

        <div style={{
          ...styles.featuresGrid,
          gridTemplateColumns: windowWidth <= 480 
            ? '1fr' 
            : windowWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: windowWidth <= 480 ? '15px' : '30px',
        }}>
          {features.map((feature, index) => (
            <Link 
              to={feature.link} 
              key={index} 
              style={{
                ...styles.featureCard,
                background: feature.gradient,
                borderColor: feature.borderColor
              }}
              className="feature-card-3d"
              onMouseEnter={() => setActiveFeature(index)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div style={styles.featureCardInner}>
                <div style={{ ...styles.featureIcon, background: feature.iconBg }}>
                  <feature.icon size={windowWidth <= 480 ? 24 : 32} color="#ffffff" />
                  {activeFeature === index && windowWidth > 768 && (
                    <div style={styles.iconRipple}></div>
                  )}
                </div>
                
                <div style={styles.featureContent}>
                  <h3 style={{ ...styles.featureTitle, color: feature.color, fontSize: windowWidth <= 480 ? '18px' : '22px' }}>{feature.title}</h3>
                  <p style={styles.featureDescription}>{feature.description}</p>
                  
                  {/* Hide metrics on very small mobile */}
                  {windowWidth > 480 && (
                    <div style={styles.featureMetrics}>
                      {feature.metrics.map((metric, i) => (
                        <span key={i} style={styles.featureMetric}>
                          <BadgeCheck size={12} color={feature.color} />
                          {metric}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={styles.featureFooter}>
                  {feature.status === 'coming-soon' ? (
                    <span style={styles.comingSoonBadge}>
                      <Sparkles size={12} />
                      Coming Soon
                    </span>
                  ) : (
                    <div style={{ ...styles.featureLink, color: feature.color }}>
                      <span>{feature.title === 'AI Health Chat' ? 'Chat Now' : 'Learn more'}</span>
                      <ChevronRight size={16} style={styles.featureLinkIcon} />
                    </div>
                  )}
                </div>

                <div style={styles.featureGlow}></div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials Section - Responsive */}
      <section style={{
        ...styles.testimonials,
        padding: windowWidth <= 480 ? '50px 15px' : windowWidth <= 768 ? '70px 20px' : '100px 40px',
      }}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionBadge}>
            <Users size={20} color="#9b59b6" />
            <span>Trusted by Thousands</span>
          </div>
          <h2 style={{
            ...styles.sectionTitle,
            fontSize: windowWidth <= 480 ? '24px' : windowWidth <= 768 ? '32px' : 'clamp(32px, 5vw, 48px)',
          }}>What Our Users Say</h2>
          <p style={{
            ...styles.sectionSubtitle,
            fontSize: windowWidth <= 480 ? '14px' : windowWidth <= 768 ? '15px' : 'clamp(14px, 2vw, 18px)',
          }}>Real stories from real people who trust us with their health</p>
        </div>

        <div style={{
          ...styles.testimonialsGrid,
          gridTemplateColumns: windowWidth <= 480 
            ? '1fr' 
            : windowWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: windowWidth <= 480 ? '15px' : '30px',
        }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} style={styles.testimonialCard}>
              <div style={styles.testimonialQuote}>"</div>
              <p style={styles.testimonialText}>{testimonial.quote}</p>
              <div style={styles.testimonialAuthor}>
                <div style={styles.testimonialAvatar}>
                  {testimonial.avatar}
                </div>
                <div>
                  <div style={styles.testimonialName}>{testimonial.author}</div>
                  <div style={styles.testimonialRole}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section - Responsive */}
      <section style={{
        ...styles.statsSection,
        padding: windowWidth <= 480 ? '50px 15px' : windowWidth <= 768 ? '70px 20px' : '80px 40px',
      }}>
        <div style={{
          ...styles.statsContainer,
          gridTemplateColumns: windowWidth <= 480 
            ? '1fr' 
            : windowWidth <= 768 
              ? 'repeat(2, 1fr)' 
              : 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: windowWidth <= 480 ? '15px' : '30px',
        }}>
          <div style={styles.statItem}>
            <div style={styles.statItemIcon}>
              <Users size={24} color="#3498db" />
            </div>
            <div style={{
              ...styles.statItemNumber,
              fontSize: windowWidth <= 480 ? '28px' : '36px',
            }}>10,000+</div>
            <div style={styles.statItemLabel}>Active Users</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statItemIcon}>
              <FileText size={24} color="#2ecc71" />
            </div>
            <div style={{
              ...styles.statItemNumber,
              fontSize: windowWidth <= 480 ? '28px' : '36px',
            }}>50,000+</div>
            <div style={styles.statItemLabel}>Reports Analyzed</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statItemIcon}>
              <Ambulance size={24} color="#e74c3c" />
            </div>
            <div style={{
              ...styles.statItemNumber,
              fontSize: windowWidth <= 480 ? '28px' : '36px',
            }}>500+</div>
            <div style={styles.statItemLabel}>Emergency Responses</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statItemIcon}>
              <Building size={24} color="#9b59b6" />
            </div>
            <div style={{
              ...styles.statItemNumber,
              fontSize: windowWidth <= 480 ? '28px' : '36px',
            }}>1,200+</div>
            <div style={styles.statItemLabel}>Partner Hospitals</div>
          </div>
        </div>
      </section>

      {/* CTA Section - Responsive */}
      <section style={{
        ...styles.cta,
        padding: windowWidth <= 480 ? '60px 15px' : windowWidth <= 768 ? '80px 20px' : '100px 40px',
      }}>
        <div style={{
          ...styles.ctaContent,
          gridTemplateColumns: windowWidth <= 768 ? '1fr' : '1fr 1fr',
          gap: windowWidth <= 480 ? '30px' : '60px',
          textAlign: windowWidth <= 768 ? 'center' : 'left',
        }}>
          <div style={styles.ctaLeft}>
            <h2 style={{
              ...styles.ctaTitle,
              fontSize: windowWidth <= 480 ? '24px' : windowWidth <= 768 ? '32px' : 'clamp(32px, 5vw, 42px)',
            }}>Ready for the future of healthcare?</h2>
            <p style={{
              ...styles.ctaText,
              fontSize: windowWidth <= 480 ? '14px' : windowWidth <= 768 ? '15px' : 'clamp(14px, 2vw, 18px)',
            }}>Join thousands of patients who trust our AI-powered health platform</p>
            <div style={{
              ...styles.ctaButtons,
              justifyContent: windowWidth <= 768 ? 'center' : 'flex-start',
              flexDirection: windowWidth <= 480 ? 'column' : 'row',
            }}>
              <Link to="/signup" style={{
                ...styles.ctaPrimary,
                justifyContent: windowWidth <= 480 ? 'center' : 'flex-start',
              }}>
                Get Started Free
                <ChevronRight size={18} />
              </Link>
              <Link to="/demo" style={{
                ...styles.ctaSecondary,
                justifyContent: windowWidth <= 480 ? 'center' : 'flex-start',
              }}>
                <Play size={18} />
                Watch Demo
              </Link>
            </div>
          </div>
          {windowWidth > 768 && (
            <div style={styles.ctaRight}>
              <div style={styles.ctaStatsCircle}>
                <div style={styles.ctaStatNumber}>10k+</div>
                <div style={styles.ctaStatLabel}>Active Users</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer with 3D Elements - Responsive */}
      <footer style={{
        ...styles.footer,
        padding: windowWidth <= 480 ? '40px 15px 20px' : windowWidth <= 768 ? '50px 20px 20px' : '60px 40px 20px',
      }}>
        <div style={{
          ...styles.footerContent,
          gridTemplateColumns: windowWidth <= 768 ? '1fr' : '1.5fr 2.5fr',
          gap: windowWidth <= 480 ? '30px' : '60px',
        }}>
          <div style={styles.footerSection}>
            <div style={styles.footerLogo}>
              <ShieldCheck size={windowWidth <= 480 ? 24 : 32} color="#3498db" />
              <span style={{
                ...styles.footerLogoText,
                fontSize: windowWidth <= 480 ? '20px' : '24px',
              }}>SmartPatient<span style={{ color: '#3498db' }}>.Health</span></span>
            </div>
            <p style={styles.footerDescription}>
              Revolutionizing healthcare through artificial intelligence and real-time health monitoring.
            </p>
            <div style={styles.socialLinks}>
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" style={styles.socialLink} className="social-3d">
                  <Icon size={windowWidth <= 480 ? 16 : 20} />
                </a>
              ))}
            </div>
          </div>

          <div style={{
            ...styles.footerLinks,
            gridTemplateColumns: windowWidth <= 480 ? '1fr' : windowWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: windowWidth <= 480 ? '20px' : '30px',
          }}>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Updates'] },
              { title: 'Company', links: ['About', 'Careers', 'Press', 'Blog'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Privacy', 'Terms'] }
            ].map((column, i) => (
              <div key={i} style={styles.footerLinkColumn}>
                <h4 style={styles.footerLinkTitle}>{column.title}</h4>
                {column.links.map((link, j) => (
                  <Link key={j} to="#" style={styles.footerLink}>
                    {link}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          ...styles.footerBottom,
          flexDirection: windowWidth <= 480 ? 'column' : 'row',
          textAlign: windowWidth <= 480 ? 'center' : 'left',
        }}>
          <p style={styles.copyright}>
            © 2024 SmartPatient.Health. Crafted with precision and care.
          </p>
          <div style={styles.footerBadges}>
            <span style={styles.badge}>HIPAA Compliant</span>
            <span style={styles.badge}>GDPR Ready</span>
            <span style={styles.badge}>SSL Secure</span>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button with Animation */}
      {showScrollTop && (
        <button onClick={scrollToTop} style={{
          ...styles.scrollTop,
          width: windowWidth <= 480 ? '40px' : '50px',
          height: windowWidth <= 480 ? '40px' : '50px',
          bottom: windowWidth <= 480 ? '15px' : '30px',
          right: windowWidth <= 480 ? '15px' : '30px',
        }} className="scroll-top-3d">
          <ChevronRight size={windowWidth <= 480 ? 20 : 24} style={{ transform: 'rotate(-90deg)' }} />
        </button>
      )}

      {/* Floating Chat Component */}
      <FloatingChat 
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onOpen={() => setIsChatOpen(true)}
      />

      {/* Add keyframe animations */}
      <style jsx="true">{`
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
        }
        
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        @keyframes rotateCube {
          0% { transform: rotateX(0) rotateY(0); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes ripple {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        
        @keyframes chatPulse {
          0% { box-shadow: 0 0 0 0 rgba(155,89,182,0.7); }
          70% { box-shadow: 0 0 0 15px rgba(155,89,182,0); }
          100% { box-shadow: 0 0 0 0 rgba(155,89,182,0); }
        }
        
        .btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(52,152,219,0.3);
        }
        
        .btn-outline-3d:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.15);
        }
        
        .feature-card-3d:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }
        
        .social-3d:hover {
          transform: translateY(-2px);
          background: rgba(52,152,219,0.2);
          border-color: #3498db;
        }
        
        .scroll-top-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(52,152,219,0.4);
        }
        
        .floating-chat-btn {
          animation: chatPulse 2s infinite;
        }
        
        .floating-chat-btn:hover {
          transform: scale(1.1);
        }
        
        .floating-chat-window {
          animation: slideIn 0.3s ease-out;
        }
        
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-up {
          animation: fadeUp 0.6s ease-out;
        }
        
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .fade-up-delay {
          animation: fadeUp 0.6s ease-out 0.2s both;
        }
        
        .fade-up-delay-2 {
          animation: fadeUp 0.6s ease-out 0.4s both;
        }
        
        .animate-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#0a0f1c',
    color: '#ffffff',
    position: 'relative',
    overflowX: 'hidden',
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
  },
  loadingContent: {
    textAlign: 'center',
  },
  loadingIcon: {
    animation: 'pulse 2s ease-in-out infinite',
    marginBottom: '30px',
  },
  loadingBar: {
    width: '200px',
    height: '4px',
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '20px',
  },
  loadingProgress: {
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, #3498db, #2ecc71)',
    animation: 'loading 1.5s ease-in-out infinite',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: '14px',
    opacity: 0.7,
  },
  particles: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    boxShadow: '0 0 20px currentColor',
  },
  hero: {
    position: 'relative',
    minHeight: '100vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  heroBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(52,152,219,0.1) 0%, transparent 50%)',
  },
  heroPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
    backgroundSize: '40px 40px',
  },
  heroShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shape1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: '300px',
    height: '300px',
    background: 'radial-gradient(circle, rgba(52,152,219,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(50px)',
    animation: 'float 20s ease-in-out infinite',
  },
  shape2: {
    position: 'absolute',
    bottom: '10%',
    right: '5%',
    width: '400px',
    height: '400px',
    background: 'radial-gradient(circle, rgba(46,204,113,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(60px)',
    animation: 'float 25s ease-in-out infinite reverse',
  },
  shape3: {
    position: 'absolute',
    top: '50%',
    right: '20%',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(155,89,182,0.2) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(40px)',
    animation: 'float 15s ease-in-out infinite',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    alignItems: 'center',
    width: '100%',
  },
  heroLeft: {
    color: '#ffffff',
  },
  welcomeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(52, 152, 219, 0.1)',
    borderRadius: '30px',
    marginBottom: '30px',
    border: '1px solid rgba(52, 152, 219, 0.3)',
    fontSize: '14px',
    backdropFilter: 'blur(10px)',
  },
  heroTitle: {
    fontWeight: 'bold',
    marginBottom: '20px',
    lineHeight: '1.1',
    position: 'relative',
  },
  titleGlow: {
    position: 'absolute',
    bottom: '5px',
    left: 0,
    width: '100%',
    height: '10px',
    background: 'linear-gradient(90deg, transparent, #3498db, transparent)',
    filter: 'blur(10px)',
    opacity: 0.5,
  },
  heroSubtitle: {
    opacity: 0.8,
    marginBottom: '40px',
    lineHeight: '1.6',
    maxWidth: '500px',
  },
  heroStats: {
    display: 'grid',
    marginBottom: '40px',
  },
  statCard: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  statIconContainer: {
    position: 'relative',
  },
  statIconBg: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statPulse: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '60px',
    height: '60px',
    background: 'radial-gradient(circle, rgba(52,152,219,0.4) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontWeight: 'bold',
    color: '#ffffff',
    display: 'flex',
  },
  statTrend: {
    fontSize: '12px',
    fontWeight: 'normal',
    opacity: 0.6,
  },
  statLabel: {
    fontSize: '14px',
    opacity: 0.7,
  },
  heroButtons: {
    display: 'flex',
    marginBottom: '40px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '30px',
    textDecoration: 'none',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    color: 'white',
    fontWeight: '600',
    position: 'relative',
    overflow: 'hidden',
    border: 'none',
    cursor: 'pointer',
    gap: '10px',
  },
  btnIcon: {
    transition: 'transform 0.3s ease',
  },
  btnGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%) scale(0)',
    transition: 'transform 0.5s ease',
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    borderRadius: '30px',
    textDecoration: 'none',
    background: 'rgba(255,255,255,0.1)',
    color: 'white',
    fontWeight: '600',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  achievements: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 15px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  achievementIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  achievementLabel: {
    fontSize: '12px',
    opacity: 0.7,
  },
  achievementProgress: {
    width: '80px',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  achievementBar: {
    height: '100%',
    borderRadius: '2px',
  },
  heroRight: {
    position: 'relative',
    height: '600px',
  },
  hero3DContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero3DBox: {
    width: '400px',
    height: '400px',
    transition: 'transform 0.1s ease',
    transformStyle: 'preserve-3d',
  },
  healthCube: {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    animation: 'rotateCube 20s infinite linear',
  },
  cubeFaceFront: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'rgba(52,152,219,0.1)',
    border: '2px solid rgba(52,152,219,0.3)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#ffffff',
    transform: 'translateZ(100px)',
  },
  cubeFaceBack: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'rgba(52,152,219,0.1)',
    border: '2px solid rgba(52,152,219,0.3)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#ffffff',
    transform: 'rotateY(180deg) translateZ(100px)',
  },
  cubeFaceRight: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'rgba(52,152,219,0.1)',
    border: '2px solid rgba(52,152,219,0.3)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#ffffff',
    transform: 'rotateY(90deg) translateZ(100px)',
  },
  cubeFaceLeft: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'rgba(52,152,219,0.1)',
    border: '2px solid rgba(52,152,219,0.3)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#ffffff',
    transform: 'rotateY(-90deg) translateZ(100px)',
  },
  cubeFaceTop: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'rgba(52,152,219,0.1)',
    border: '2px solid rgba(52,152,219,0.3)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#ffffff',
    transform: 'rotateX(90deg) translateZ(100px)',
  },
  cubeFaceBottom: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'rgba(52,152,219,0.1)',
    border: '2px solid rgba(52,152,219,0.3)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    color: '#ffffff',
    transform: 'rotateX(-90deg) translateZ(100px)',
  },
  cubeValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#3498db',
  },
  floatingMetrics: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  metric: {
    position: 'absolute',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.2)',
  },
  features: {
    background: 'linear-gradient(180deg, #0a0f1c 0%, #1a1f2e 100%)',
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px',
  },
  sectionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(52,152,219,0.1)',
    borderRadius: '30px',
    marginBottom: '20px',
    border: '1px solid rgba(52,152,219,0.3)',
    fontSize: '14px',
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '20px',
  },
  sectionSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  featuresGrid: {
    display: 'grid',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  featureCard: {
    textDecoration: 'none',
    height: '100%',
    perspective: '1000px',
    borderRadius: '30px',
    border: '1px solid',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  featureCardInner: {
    padding: '30px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  featureIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    position: 'relative',
  },
  iconRipple: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '90px',
    height: '90px',
    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'ripple 1.5s ease-out infinite',
  },
  featureContent: {
    flex: 1,
    marginBottom: '20px',
  },
  featureTitle: {
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  featureDescription: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  featureMetrics: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  featureMetric: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
  },
  featureFooter: {
    marginTop: 'auto',
  },
  featureLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '15px',
    fontWeight: '600',
  },
  featureLinkIcon: {
    transition: 'transform 0.3s ease',
  },
  comingSoonBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.8)',
  },
  featureGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(52,152,219,0.2) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    filter: 'blur(50px)',
    pointerEvents: 'none',
  },
  testimonials: {
    background: '#0a0f1c',
  },
  testimonialsGrid: {
    display: 'grid',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  testimonialCard: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    padding: '30px',
    border: '1px solid rgba(255,255,255,0.05)',
    position: 'relative',
  },
  testimonialQuote: {
    fontSize: '60px',
    color: '#3498db',
    opacity: 0.3,
    position: 'absolute',
    top: '20px',
    right: '30px',
    fontFamily: 'serif',
  },
  testimonialText: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: '1.6',
    marginBottom: '20px',
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  testimonialAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  testimonialName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
  },
  testimonialRole: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
  },
  statsSection: {
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
  },
  statsContainer: {
    display: 'grid',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  statItem: {
    textAlign: 'center',
    padding: '30px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  statItemIcon: {
    width: '60px',
    height: '60px',
    margin: '0 auto 20px',
    background: 'rgba(52,152,219,0.1)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItemNumber: {
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '10px',
  },
  statItemLabel: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
  },
  cta: {
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    position: 'relative',
    overflow: 'hidden',
  },
  ctaContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  ctaLeft: {
    color: '#ffffff',
  },
  ctaTitle: {
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  ctaText: {
    opacity: 0.9,
    marginBottom: '30px',
  },
  ctaButtons: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  ctaPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: '#ffffff',
    color: '#3498db',
    textDecoration: 'none',
    borderRadius: '30px',
    fontWeight: '600',
  },
  ctaSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '16px 32px',
    background: 'rgba(255,255,255,0.2)',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '30px',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
  },
  ctaRight: {
    display: 'flex',
    justifyContent: 'center',
  },
  ctaStatsCircle: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(255,255,255,0.3)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  ctaStatNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  ctaStatLabel: {
    fontSize: '16px',
    opacity: 0.8,
  },
  footer: {
    background: '#0a0f1c',
    borderTop: '1px solid rgba(52,152,219,0.2)',
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    marginBottom: '40px',
  },
  footerSection: {},
  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  footerLogoText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  footerDescription: {
    fontSize: '14px',
    opacity: 0.7,
    lineHeight: '1.6',
    marginBottom: '20px',
    color: '#ffffff',
  },
  socialLinks: {
    display: 'flex',
    gap: '12px',
  },
  socialLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    color: '#ffffff',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  footerLinks: {
    display: 'grid',
  },
  footerLinkColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  footerLinkTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#ffffff',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.3s ease',
  },
  footerBottom: {
    maxWidth: '1400px',
    margin: '0 auto',
    paddingTop: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  copyright: {
    fontSize: '14px',
    opacity: 0.6,
    color: '#ffffff',
  },
  footerBadges: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  badge: {
    padding: '4px 12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '20px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  scrollTop: {
    position: 'fixed',
    borderRadius: '15px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 10px 30px rgba(52,152,219,0.3)',
    zIndex: 999,
    animation: 'bounce 2s ease-in-out infinite',
  },
};

export default Home;