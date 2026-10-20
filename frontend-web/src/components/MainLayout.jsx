import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Activity, Home, FileText, AlertCircle, Building, User,
  Settings, LogOut, Bell, Shield, Menu, X, ChevronDown,
  Heart, Sparkles, Zap, Moon, Sun, Fingerprint, HelpCircle,
  Maximize2, Minimize2, Wifi, Battery, Cpu, ShieldCheck, Watch, Users
} from 'lucide-react';
import '../App.css';

function MainLayout() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [fullscreen, setFullscreen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New health report uploaded', time: '5 min ago', read: false },
    { id: 2, text: 'Appointment reminder: Dr. Smith', time: '1 hour ago', read: false },
    { id: 3, text: 'Emergency contact updated', time: '2 days ago', read: true },
  ]);

  const navigate = useNavigate();
  const location = useLocation();

  const userName = localStorage.getItem('userName') || "User";
  const userEmail = localStorage.getItem('userEmail') || "user@example.com";

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Close mobile menu on larger screens
      if (window.innerWidth > 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-container') && !e.target.closest('.notification-container')) {
        setProfileOpen(false);
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getTabStyle = (path) => {
    const isActive = location.pathname.includes(path);
    const colors = {
      '/home': { color: '#3498db', bg: 'rgba(52,152,219,0.1)' },
      '/dashboard': { color: '#2ecc71', bg: 'rgba(46,204,113,0.1)' },
      '/symptom-analyzer': { color: '#00bcd4', bg: 'rgba(0,188,212,0.1)' },
      '/emergency': { color: '#e74c3c', bg: 'rgba(231,76,60,0.1)' },
      '/hospitals': { color: '#9b59b6', bg: 'rgba(155,89,182,0.1)' },
      '/reminders': { color: '#f39c12', bg: 'rgba(243,156,18,0.1)' },
      '/lifestyle': { color: '#e84342', bg: 'rgba(232,67,66,0.1)' },
      '/device-health': { color: '#00d2d3', bg: 'rgba(0,210,211,0.1)' },
      '/community': { color: '#1abc9c', bg: 'rgba(26,188,156,0.1)' } // Added styling for community tab
    };

    const activeColor = colors[path]?.color || '#3498db';
    const activeBg = colors[path]?.bg || 'rgba(52,152,219,0.1)';

    return {
      display: 'flex',
      alignItems: 'center',
      gap: windowWidth <= 480 ? '6px' : '8px',
      padding: windowWidth <= 480 ? '10px 12px' : windowWidth <= 768 ? '10px 15px' : '12px 20px',
      borderRadius: '12px',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: windowWidth <= 480 ? '13px' : '15px',
      color: isActive ? activeColor : 'rgba(255,255,255,0.7)',
      backgroundColor: isActive ? activeBg : 'transparent',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    };
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={styles.container}>
      {/* Floating Particles Background */}
      <div style={styles.particles}>
        {[...Array(windowWidth <= 768 ? 8 : 15)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${15 + Math.random() * 20}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              backgroundColor: i % 3 === 0 ? '#3498db' : i % 3 === 1 ? '#2ecc71' : '#e74c3c',
              width: windowWidth <= 768 ? '2px' : '3px',
              height: windowWidth <= 768 ? '2px' : '3px',
            }}
          />
        ))}
      </div>

      {/* Animated Gradient Background */}
      <div style={styles.gradientBg}>
        <div style={styles.gradient1}></div>
        <div style={styles.gradient2}></div>
      </div>

      {/* Navbar */}
      <nav style={{
        ...styles.navbar,
        padding: windowWidth <= 480 ? '10px 15px' : windowWidth <= 768 ? '12px 20px' : '15px 30px',
      }}>
        <div style={styles.navContent}>
          {/* Logo Section */}
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>
              <ShieldCheck
                size={windowWidth <= 480 ? 24 : windowWidth <= 768 ? 28 : 32}
                color="#3498db"
              />
              <div style={{
                ...styles.logoGlow,
                width: windowWidth <= 480 ? '40px' : '60px',
                height: windowWidth <= 480 ? '40px' : '60px',
              }}></div>
            </div>
            <div style={styles.logoText}>
              <span style={{
                ...styles.logoMain,
                fontSize: windowWidth <= 480 ? '18px' : windowWidth <= 768 ? '20px' : '24px',
              }}>Smart</span>
              <span style={{
                ...styles.logoAccent,
                fontSize: windowWidth <= 480 ? '18px' : windowWidth <= 768 ? '20px' : '24px',
              }}>PHR</span>
              {windowWidth > 480 && (
                <span style={styles.logoBadge}>v2.0</span>
              )}
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          {windowWidth > 1024 && (
            <div style={styles.desktopNav}>
              <Link to="/home" style={getTabStyle('/home')} className="nav-link-3d">
                <Home size={18} />
                <span>Home</span>
              </Link>
              <Link to="/dashboard" style={getTabStyle('/dashboard')} className="nav-link-3d">
                <FileText size={18} />
                <span>Reports</span>
              </Link>
              <Link to="/reminders" style={getTabStyle('/reminders')} className="nav-link-3d">
                <Bell size={18} />
                <span>Reminders</span>
              </Link>
              <Link to="/symptom-analyzer" style={getTabStyle('/symptom-analyzer')} className="nav-link-3d">
                <Activity size={18} />
                <span>Symptoms</span>
              </Link>
              <Link to="/lifestyle" style={getTabStyle('/lifestyle')} className="nav-link-3d">
                <Heart size={18} />
                <span>Plan</span>
              </Link>

              <Link to="/device-health" style={getTabStyle('/device-health')} className="nav-link-3d">
                <Watch size={18} />
                <span>Devices</span>
              </Link>

              {/* Added Community Link */}
              <Link to="/community" style={getTabStyle("/community")} className="nav-link-3d">
                <Users size={18} />
                <span>Community</span>
              </Link>

              <Link to="/emergency" style={getTabStyle('/emergency')} className="nav-link-3d">
                <AlertCircle size={18} />
                <span>Emergency</span>
              </Link>
              <Link to="/hospitals" style={getTabStyle('/hospitals')} className="nav-link-3d">
                <Building size={18} />
                <span>Hospitals</span>
              </Link>
            </div>
          )}

          {/* Right Section */}
          <div style={styles.rightSection}>
            {/* System Status - Hidden on mobile */}
            {windowWidth > 768 && (
              <div style={styles.systemStatus}>
                <Wifi size={14} color="#2ecc71" />
                <Battery size={14} color="#2ecc71" />
                <Cpu size={14} color="#3498db" />
              </div>
            )}

            {/* Fullscreen Toggle - Hidden on mobile */}
            {windowWidth > 768 && (
              <button
                onClick={toggleFullscreen}
                style={styles.iconButton}
                className="icon-3d"
              >
                {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            )}

            {/* Notifications */}
            <div style={styles.notificationContainer} className="notification-container">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                style={{
                  ...styles.iconButton,
                  padding: windowWidth <= 480 ? '8px' : '10px',
                }}
                className="icon-3d"
              >
                <Bell size={windowWidth <= 480 ? 16 : 18} />
                {unreadCount > 0 && (
                  <span style={{
                    ...styles.notificationBadge,
                    fontSize: windowWidth <= 480 ? '8px' : '10px',
                    padding: windowWidth <= 480 ? '2px 4px' : '2px 6px',
                  }}>{unreadCount}</span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div style={{
                  ...styles.notificationsDropdown,
                  width: windowWidth <= 480 ? '280px' : '300px',
                  right: windowWidth <= 480 ? '-10px' : 0,
                }} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.notificationsHeader}>
                    <h3 style={styles.notificationsTitle}>Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} style={styles.markAllRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div style={styles.notificationsList}>
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} style={{
                          ...styles.notificationItem,
                          backgroundColor: notif.read ? 'transparent' : 'rgba(52,152,219,0.05)'
                        }}>
                          <div style={styles.notificationDot}></div>
                          <div style={styles.notificationContent}>
                            <p style={styles.notificationText}>{notif.text}</p>
                            <span style={styles.notificationTime}>{notif.time}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={styles.noNotifications}>No new notifications</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div style={styles.profileContainer} className="profile-container">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                style={{
                  ...styles.profileButton,
                  padding: windowWidth <= 480 ? '4px 8px 4px 4px' : '5px 12px 5px 5px',
                }}
                className="profile-btn-3d"
              >
                <div style={{
                  ...styles.avatar,
                  width: windowWidth <= 480 ? '30px' : '35px',
                  height: windowWidth <= 480 ? '30px' : '35px',
                }}>
                  <span style={{
                    ...styles.avatarText,
                    fontSize: windowWidth <= 480 ? '14px' : '16px',
                  }}>{userName.charAt(0).toUpperCase()}</span>
                  <div style={{
                    ...styles.avatarGlow,
                    width: windowWidth <= 480 ? '35px' : '45px',
                    height: windowWidth <= 480 ? '35px' : '45px',
                  }}></div>
                </div>
                {windowWidth > 768 && (
                  <span style={styles.userName}>{userName}</span>
                )}
                {windowWidth > 480 && (
                  <ChevronDown size={16} style={{
                    ...styles.chevron,
                    transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)'
                  }} />
                )}
              </div>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div style={{
                  ...styles.profileDropdown,
                  width: windowWidth <= 480 ? '260px' : '280px',
                  right: windowWidth <= 480 ? '-10px' : 0,
                }} onClick={(e) => e.stopPropagation()}>
                  <div style={styles.profileHeader}>
                    <div style={styles.profileAvatar}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.profileInfo}>
                      <span style={styles.profileName}>{userName}</span>
                      <span style={styles.profileEmail}>
                        {windowWidth <= 480 && userEmail.length > 15
                          ? `${userEmail.substring(0, 12)}...`
                          : userEmail}
                      </span>
                    </div>
                  </div>

                  <div style={styles.profileMenu}>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      style={styles.menuItem}
                    >
                      <User size={16} />
                      <span>My Profile</span>
                      <Sparkles size={12} style={styles.menuIcon} />
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      style={styles.menuItem}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>

                    <Link
                      to="/help"
                      onClick={() => setProfileOpen(false)}
                      style={styles.menuItem}
                    >
                      <HelpCircle size={16} />
                      <span>Help & Support</span>
                    </Link>

                    <div style={styles.menuDivider}></div>

                    <div
                      onClick={handleLogout}
                      style={{ ...styles.menuItem, color: '#e74c3c' }}
                    >
                      <LogOut size={16} />
                      <span>Secure Logout</span>
                    </div>
                  </div>

                  <div style={styles.profileFooter}>
                    <Fingerprint size={12} color="#7f8c8d" />
                    <span>Secured with 256-bit encryption</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Show on tablet and mobile */}
            {windowWidth <= 1024 && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  ...styles.mobileMenuButton,
                  display: 'flex',
                  padding: windowWidth <= 480 ? '8px' : '10px',
                }}
                className="icon-3d"
              >
                {mobileMenuOpen ? <X size={windowWidth <= 480 ? 20 : 24} /> : <Menu size={windowWidth <= 480 ? 20 : 24} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation - Slide down menu */}
        {mobileMenuOpen && windowWidth <= 1024 && (
          <div style={{
            ...styles.mobileNav,
            display: 'flex',
            animation: 'slideDown 0.3s ease-out',
          }}>
            <Link to="/home" style={getTabStyle('/home')} onClick={() => setMobileMenuOpen(false)}>
              <Home size={18} /> Home
            </Link>
            <Link to="/dashboard" style={getTabStyle('/dashboard')} onClick={() => setMobileMenuOpen(false)}>
              <FileText size={18} /> Reports
            </Link>
            <Link to="/reminders" style={getTabStyle('/reminders')} onClick={() => setMobileMenuOpen(false)}>
              <Bell size={18} /> Reminders
            </Link>
            <Link to="/symptom-analyzer" style={getTabStyle('/symptom-analyzer')} onClick={() => setMobileMenuOpen(false)}>
              <Activity size={18} /> Symptoms
            </Link>
            <Link to="/lifestyle" style={getTabStyle('/lifestyle')} onClick={() => setMobileMenuOpen(false)}>
              <Heart size={18} /> Plan
            </Link>

            <Link to="/device-health" style={getTabStyle('/device-health')} onClick={() => setMobileMenuOpen(false)}>
              <Watch size={18} /> Devices
            </Link>

            {/* Added Community Link Here for Mobile */}
            <Link to="/community" style={getTabStyle('/community')} onClick={() => setMobileMenuOpen(false)}>
              <Users size={18} /> Community
            </Link>

            <Link to="/emergency" style={getTabStyle('/emergency')} onClick={() => setMobileMenuOpen(false)}>
              <AlertCircle size={18} /> Emergency
            </Link>
            <Link to="/hospitals" style={getTabStyle('/hospitals')} onClick={() => setMobileMenuOpen(false)}>
              <Building size={18} /> Hospitals
            </Link>
            <Link to="/profile" style={getTabStyle('/profile')} onClick={() => setMobileMenuOpen(false)}>
              <User size={18} /> Profile
            </Link>
            <Link to="/settings" style={getTabStyle('/settings')} onClick={() => setMobileMenuOpen(false)}>
              <Settings size={18} /> Settings
            </Link>
            <div onClick={handleLogout} style={{ ...styles.mobileMenuItem, color: '#e74c3c' }}>
              <LogOut size={18} /> Logout
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main style={{
        ...styles.mainContent,
        padding: windowWidth <= 480 ? '15px' : windowWidth <= 768 ? '20px' : '30px',
      }}>
        <Outlet />
      </main>

      {/* Quick Actions Floating Button (Mobile Only) */}
      {windowWidth <= 768 && (
        <div style={{
          ...styles.quickActions,
          bottom: windowWidth <= 480 ? '20px' : '30px',
          right: windowWidth <= 480 ? '20px' : '30px',
        }}>
          <Link to="/emergency" style={{
            ...styles.quickActionEmergency,
            width: windowWidth <= 480 ? '45px' : '50px',
            height: windowWidth <= 480 ? '45px' : '50px',
          }}>
            <AlertCircle size={windowWidth <= 480 ? 18 : 20} />
          </Link>
          <Link to="/scan" style={{
            ...styles.quickActionScan,
            width: windowWidth <= 480 ? '45px' : '50px',
            height: windowWidth <= 480 ? '45px' : '50px',
          }}>
            <Zap size={windowWidth <= 480 ? 18 : 20} />
          </Link>
        </div>
      )}

      {/* Add keyframe animations */}
      <style jsx="true">{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.3; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .nav-link-3d:hover {
          transform: translateY(-2px);
          background: rgba(52,152,219,0.15);
        }
        
        .icon-3d:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.1);
          border-color: rgba(52,152,219,0.3);
        }
        
        .profile-btn-3d:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.1);
          border-color: rgba(52,152,219,0.3);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
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
    boxShadow: '0 0 10px currentColor',
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
    background: 'radial-gradient(circle, rgba(52,152,219,0.05) 0%, transparent 50%)',
    animation: 'rotate 30s linear infinite',
  },
  gradient2: {
    position: 'absolute',
    bottom: '-50%',
    right: '-50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(46,204,113,0.05) 0%, transparent 50%)',
    animation: 'rotate 40s linear infinite reverse',
  },
  navbar: {
    background: 'rgba(10, 15, 28, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(52,152,219,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
  },
  navContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: {
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    background: 'radial-gradient(circle, rgba(52,152,219,0.3) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  logoText: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px',
  },
  logoMain: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoAccent: {
    fontWeight: 'bold',
    color: '#3498db',
  },
  logoBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    background: 'rgba(52,152,219,0.2)',
    borderRadius: '10px',
    color: '#3498db',
    marginLeft: '5px',
  },
  desktopNav: {
    display: 'flex',
    gap: '5px',
    flexWrap: 'wrap',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginLeft: 'auto',
  },
  systemStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  iconButton: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    transition: 'all 0.3s ease',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    background: '#e74c3c',
    color: '#ffffff',
    fontWeight: 'bold',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center',
  },
  notificationsDropdown: {
    position: 'absolute',
    top: '120%',
    background: 'rgba(20,25,40,0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    zIndex: 1000,
  },
  notificationsHeader: {
    padding: '15px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    margin: 0,
  },
  markAllRead: {
    background: 'none',
    border: 'none',
    color: '#3498db',
    fontSize: '12px',
    cursor: 'pointer',
  },
  notificationsList: {
    maxHeight: '300px',
    overflowY: 'auto',
  },
  notificationItem: {
    padding: '12px 15px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
  },
  notificationDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#3498db',
    marginTop: '4px',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: '13px',
    color: '#ffffff',
    marginBottom: '4px',
  },
  notificationTime: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  noNotifications: {
    padding: '20px',
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: '13px',
  },
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  avatar: {
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  avatarGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    background: 'radial-gradient(circle, rgba(52,152,219,0.4) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
  chevron: {
    transition: 'transform 0.3s ease',
  },
  profileDropdown: {
    position: 'absolute',
    top: '120%',
    background: 'rgba(20,25,40,0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
    overflow: 'hidden',
    zIndex: 1000,
  },
  profileHeader: {
    padding: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  profileAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  profileName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
  },
  profileEmail: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  profileMenu: {
    padding: '10px',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px',
    borderRadius: '10px',
    textDecoration: 'none',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  },
  menuIcon: {
    marginLeft: 'auto',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  menuDivider: {
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    margin: '10px 0',
  },
  profileFooter: {
    padding: '15px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  mobileMenuButton: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  mobileNav: {
    flexDirection: 'column',
    gap: '5px',
    marginTop: '15px',
    padding: '15px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    display: 'none',
  },
  mobileMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px',
    borderRadius: '8px',
    color: '#ffffff',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 10,
  },
  quickActions: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    zIndex: 1000,
  },
  quickActionEmergency: {
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    textDecoration: 'none',
    boxShadow: '0 5px 20px rgba(231,76,60,0.4)',
    animation: 'pulse 2s ease-in-out infinite',
  },
  quickActionScan: {
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    textDecoration: 'none',
    boxShadow: '0 5px 20px rgba(52,152,219,0.4)',
  },
};

export default MainLayout;