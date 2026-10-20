import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Activity, Lock, Mail, User, Shield, Fingerprint,
  Sparkles, Eye, EyeOff, CheckCircle, XCircle,
  Zap, Heart, ShieldCheck, Key, Globe, Cpu,
  ArrowRight, AlertCircle, RefreshCw
} from 'lucide-react';
import '../App.css';

function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [emailValid, setEmailValid] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  // Mouse move parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Password strength checker
  useEffect(() => {
    let strength = 0;
    if (password.length > 0) {
      // Length check
      if (password.length >= 8) strength += 25;
      // Contains number
      if (/\d/.test(password)) strength += 25;
      // Contains lowercase
      if (/[a-z]/.test(password)) strength += 25;
      // Contains uppercase or special char
      if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) strength += 25;
    }
    setPasswordStrength(strength);
  }, [password]);

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 25) return '#e74c3c';
    if (passwordStrength < 50) return '#f39c12';
    if (passwordStrength < 75) return '#3498db';
    return '#2ecc71';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Very Weak';
    if (passwordStrength < 50) return 'Weak';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isRegistering ? '/register' : '/login';
    const payload = isRegistering ? { name, email, password } : { email, password };

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/auth${endpoint}`, payload);

      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('userName', response.data.name);
      localStorage.setItem('userEmail', email);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Skip success alert and directly redirect to Home
      navigate('/home');

    } catch (error) {
      alert(error.response?.data?.message || "Server error. Is Node.js running?");
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email
  useEffect(() => {
    const remembered = localStorage.getItem('rememberedEmail');
    if (remembered) {
      setEmail(remembered);
      setRememberMe(true);
    }
  }, []);

  return (
    <div style={styles.container}>
      {/* Floating Particles Background */}
      <div style={styles.particles}>
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              backgroundColor: i % 3 === 0 ? '#3498db' : i % 3 === 1 ? '#2ecc71' : '#e74c3c'
            }}
          />
        ))}
      </div>

      {/* Animated Gradient Background */}
      <div style={styles.gradientBg}>
        <div style={styles.gradient1}></div>
        <div style={styles.gradient2}></div>
        <div style={styles.gradient3}></div>
      </div>

      {/* Main Login Card */}
      <div
        style={styles.card}
        className="login-card-3d"
      >
        {/* Decorative Elements */}
        <div style={styles.cardGlow}></div>
        <div style={styles.cardPattern}></div>

        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <ShieldCheck size={48} color="#3498db" />
            <div style={styles.logoGlow}></div>
          </div>
          <h1 style={styles.logoText}>
            Smart<span style={{ color: '#3498db' }}>PHR</span>
          </h1>
          <p style={styles.logoSubtext}>
            {isRegistering ? "Create your secure health profile" : "Your AI-Powered Health Assistant"}
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Name Field - Only for Registration */}
          {isRegistering && (
            <div
              style={{
                ...styles.inputGroup,
                ...(focusedField === 'name' ? styles.inputGroupFocused : {})
              }}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
            >
              <User size={18} color={focusedField === 'name' ? '#3498db' : '#95a5a6'} style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required={isRegistering}
              />
              {name && (
                <CheckCircle size={16} color="#2ecc71" style={styles.inputValidation} />
              )}
            </div>
          )}

          {/* Email Field */}
          <div
            style={{
              ...styles.inputGroup,
              ...(focusedField === 'email' ? styles.inputGroupFocused : {})
            }}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
          >
            <Mail size={18} color={focusedField === 'email' ? '#3498db' : '#95a5a6'} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            {email && (
              emailValid ?
                <CheckCircle size={16} color="#2ecc71" style={styles.inputValidation} /> :
                <XCircle size={16} color="#e74c3c" style={styles.inputValidation} />
            )}
          </div>

          {/* Password Field */}
          <div
            style={{
              ...styles.inputGroup,
              ...(focusedField === 'password' ? styles.inputGroupFocused : {})
            }}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
          >
            <Lock size={18} color={focusedField === 'password' ? '#3498db' : '#95a5a6'} style={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? <EyeOff size={16} color="#95a5a6" /> : <Eye size={16} color="#95a5a6" />}
            </button>
          </div>

          {/* Password Strength Meter - Only for Registration */}
          {isRegistering && password && (
            <div style={styles.strengthMeter}>
              <div style={styles.strengthBarContainer}>
                <div style={{
                  ...styles.strengthBar,
                  width: `${passwordStrength}%`,
                  backgroundColor: getPasswordStrengthColor()
                }}></div>
              </div>
              <span style={{ ...styles.strengthText, color: getPasswordStrengthColor() }}>
                {getPasswordStrengthText()}
              </span>
            </div>
          )}

          {/* Password Requirements - Only for Registration */}
          {isRegistering && (
            <div style={styles.requirements}>
              <div style={styles.requirementItem}>
                {password.length >= 8 ?
                  <CheckCircle size={12} color="#2ecc71" /> :
                  <XCircle size={12} color="#e74c3c" />
                }
                <span>At least 8 characters</span>
              </div>
              <div style={styles.requirementItem}>
                {/\d/.test(password) ?
                  <CheckCircle size={12} color="#2ecc71" /> :
                  <XCircle size={12} color="#e74c3c" />
                }
                <span>Contains a number</span>
              </div>
              <div style={styles.requirementItem}>
                {/[a-z]/.test(password) && /[A-Z]/.test(password) ?
                  <CheckCircle size={12} color="#2ecc71" /> :
                  <XCircle size={12} color="#e74c3c" />
                }
                <span>Uppercase & lowercase</span>
              </div>
            </div>
          )}

          {/* Remember Me & Forgot Password */}
          {!isRegistering && (
            <div style={styles.optionsRow}>
              <label style={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={styles.checkboxLabel}>Remember me</span>
              </label>
              <button
                type="button"
                style={styles.forgotPassword}
                onClick={() => alert('Password reset feature coming soon!')}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
            className="btn-3d"
          >
            {loading ? (
              <>
                <RefreshCw size={18} style={{ animation: 'rotate 1s linear infinite' }} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isRegistering ? "Create Account" : "Secure Login"}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>

          {/* Toggle between Login/Register */}
          <div style={styles.toggleSection}>
            <p style={styles.toggleText}>
              {isRegistering ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              style={styles.toggleButton}
              className="toggle-btn"
            >
              {isRegistering ? "Sign In" : "Create Account"}
              <Sparkles size={14} style={styles.toggleIcon} />
            </button>
          </div>

          {/* Security Badge */}
          <div style={styles.securityBadge}>
            <Shield size={12} color="#7f8c8d" />
            <span>256-bit encryption • HIPAA compliant</span>
          </div>
        </form>

        {/* Bio-metric Login Option */}
        {!isRegistering && (
          <div style={styles.biometricSection}>
            <div style={styles.divider}>
              <span style={styles.dividerText}>or</span>
            </div>
            <button
              style={styles.biometricButton}
              className="btn-outline-3d"
              onClick={() => alert('Biometric login coming soon!')}
            >
              <Fingerprint size={20} color="#3498db" />
              <span>Use Biometric Login</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
  },
  particles: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    boxShadow: '0 0 20px currentColor',
    opacity: 0.2,
  },
  gradientBg: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gradient1: {
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(52,152,219,0.1) 0%, transparent 50%)',
    animation: 'rotate 20s linear infinite',
  },
  gradient2: {
    position: 'absolute',
    bottom: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(46,204,113,0.1) 0%, transparent 50%)',
    animation: 'rotate 25s linear infinite reverse',
  },
  gradient3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(231,76,60,0.1) 0%, transparent 50%)',
    animation: 'pulse 3s ease-in-out infinite',
  },
  card: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    maxWidth: '450px',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '30px',
    padding: '40px',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  cardGlow: {
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
  cardPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.03) 2px, transparent 0)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '30px',
    position: 'relative',
  },
  logoIcon: {
    position: 'relative',
    width: '80px',
    height: '80px',
    margin: '0 auto 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100px',
    height: '100px',
    background: 'radial-gradient(circle, rgba(52,152,219,0.3) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 5px',
    letterSpacing: '-0.5px',
  },
  logoSubtext: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    position: 'relative',
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  inputGroupFocused: {
    borderColor: '#3498db',
    boxShadow: '0 0 20px rgba(52,152,219,0.3)',
    background: 'rgba(52,152,219,0.05)',
  },
  inputIcon: {
    marginRight: '10px',
    transition: 'color 0.3s ease',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    '::placeholder': {
      color: 'rgba(255,255,255,0.5)',
    },
  },
  inputValidation: {
    marginLeft: '10px',
  },
  eyeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strengthMeter: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '5px',
  },
  strengthBarContainer: {
    flex: 1,
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  strengthText: {
    fontSize: '12px',
    fontWeight: '500',
  },
  requirements: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '5px',
  },
  requirementItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '6px',
  },
  optionsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '5px',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '16px',
    height: '16px',
    cursor: 'pointer',
    accentColor: '#3498db',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
  },
  forgotPassword: {
    background: 'transparent',
    border: 'none',
    color: '#3498db',
    fontSize: '13px',
    cursor: 'pointer',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '10px',
    position: 'relative',
    overflow: 'hidden',
  },
  toggleSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '15px',
  },
  toggleText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'transparent',
    border: 'none',
    color: '#3498db',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  toggleIcon: {
    transition: 'transform 0.3s ease',
  },
  securityBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '5px',
    marginTop: '20px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.4)',
  },
  biometricSection: {
    marginTop: '20px',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '15px 0',
  },
  dividerText: {
    background: 'rgba(255,255,255,0.05)',
    padding: '0 10px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    position: 'relative',
    zIndex: 1,
  },
  biometricButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '12px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(52,152,219,0.3)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

// Add custom animations to your App.css
const animations = `
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 0.8; transform: scale(1.2); }
  }
  
  @keyframes float-particle {
    0% {
      transform: translateY(0) translateX(0);
      opacity: 0;
    }
    10% {
      opacity: 0.3;
    }
    90% {
      opacity: 0.3;
    }
    100% {
      transform: translateY(-100vh) translateX(100px);
      opacity: 0;
    }
  }
  
  .login-card-3d {
    transition: transform 0.3s ease;
    transform-style: preserve-3d;
  }
  
  .login-card-3d:hover {
    transform: perspective(1000px) rotateX(2deg) rotateY(2deg) translateY(-5px);
    box-shadow: 0 30px 60px rgba(52,152,219,0.3);
  }
  
  .btn-3d {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  
  .btn-3d:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(52,152,219,0.4);
  }
  
  .btn-3d:active {
    transform: translateY(0);
  }
  
  .btn-outline-3d {
    transition: all 0.3s ease;
  }
  
  .btn-outline-3d:hover {
    background: rgba(52,152,219,0.1);
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(52,152,219,0.2);
  }
  
  .toggle-btn:hover .toggle-icon {
    transform: translateX(3px);
  }
  
  @media (max-width: 480px) {
    .login-card {
      padding: 30px 20px;
    }
    
    .logo-text {
      font-size: 28px;
    }
    
    .options-row {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }
  }
`;

export default Login;