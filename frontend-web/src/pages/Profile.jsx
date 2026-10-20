import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  User, Phone, Droplet, AlertTriangle, MapPin, Save, Edit2,
  Heart, Shield, Mail, Calendar, Clock, Fingerprint,
  BadgeCheck, Sparkles, Activity, Stethoscope, Pill,
  Award, Target, Zap, RefreshCw, Camera, Upload,
  X, CheckCircle, AlertCircle, FileText
} from 'lucide-react';
import '../App.css';

function Profile() {
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: '',
    emergencyContact: '',
    allergies: '',
    address: '',
    dateOfBirth: '',
    medicalConditions: '',
    insuranceProvider: '',
    insuranceId: '',
    primaryPhysician: '',
    lastCheckup: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const userId = localStorage.getItem('userId');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate profile completion percentage
  useEffect(() => {
    const fields = Object.values(profileData);
    const filledFields = fields.filter(value => value && value.trim() !== '').length;
    const percentage = Math.round((filledFields / fields.length) * 100);
    setCompletionPercentage(percentage);
  }, [profileData]);

  // Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/auth/profile/${userId}`);
        setProfileData(response.data);

        // Load avatar if exists
        const savedAvatar = localStorage.getItem(`avatar_${userId}`);
        if (savedAvatar) {
          setAvatarPreview(savedAvatar);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
        localStorage.setItem(`avatar_${userId}`, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/auth/profile/${userId}`, profileData);

      // Show success notification
      alert("✨ Profile updated successfully!");
      setIsEditing(false);

      // Update local storage
      if (profileData.name) {
        localStorage.setItem('userName', profileData.name);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reload original data
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/auth/profile/${userId}`);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <Activity size={windowWidth <= 480 ? 32 : 48} color="#3498db" style={styles.loadingIcon} />
          <div style={styles.loadingBar}>
            <div style={styles.loadingProgress}></div>
          </div>
          <p style={styles.loadingText}>Loading your health profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Floating Particles Background */}
      <div style={styles.particles}>
        {[...Array(windowWidth <= 768 ? 8 : 20)].map((_, i) => (
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

      <div style={{
        ...styles.mainContent,
        padding: windowWidth <= 480 ? '15px' : windowWidth <= 768 ? '20px' : '30px',
      }}>
        {/* Profile Header with Cover */}
        <div style={styles.profileHeader}>
          <div style={styles.coverImage}>
            <div style={styles.coverOverlay}></div>
            <div style={styles.coverPattern}></div>
          </div>

          {/* Avatar Section */}
          <div style={{
            ...styles.avatarSection,
            flexDirection: windowWidth <= 768 ? 'column' : 'row',
            alignItems: windowWidth <= 768 ? 'center' : 'flex-end',
            textAlign: windowWidth <= 768 ? 'center' : 'left',
            marginTop: windowWidth <= 480 ? '-40px' : '-60px',
          }}>
            <div style={{
              ...styles.avatarContainer,
              width: windowWidth <= 480 ? '80px' : '120px',
              height: windowWidth <= 480 ? '80px' : '120px',
            }}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile" style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <User size={windowWidth <= 480 ? 24 : 48} color="#3498db" />
                </div>
              )}
              {isEditing && (
                <label style={styles.avatarUpload}>
                  <Camera size={windowWidth <= 480 ? 14 : 20} color="#ffffff" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
              <div style={{
                ...styles.avatarGlow,
                width: windowWidth <= 480 ? '100px' : '140px',
                height: windowWidth <= 480 ? '100px' : '140px',
              }}></div>
            </div>

            <div style={styles.profileTitle}>
              <h1 style={{
                ...styles.userName,
                fontSize: windowWidth <= 480 ? '20px' : '32px',
              }}>{profileData.name || 'Your Name'}</h1>
              <p style={styles.userEmail}>{profileData.email}</p>

              {/* Completion Badge */}
              <div style={styles.completionBadge}>
                <Target size={14} color="#2ecc71" />
                <span>Profile {completionPercentage}% complete</span>
                <div style={styles.completionBar}>
                  <div style={{ ...styles.completionProgress, width: `${completionPercentage}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Fixed positioning */}
          <div style={{
            ...styles.actionButtons,
            top: windowWidth <= 480 ? '10px' : '20px',
            right: windowWidth <= 480 ? '15px' : '30px',
          }}>
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  style={{
                    ...styles.saveButton,
                    opacity: saving ? 0.7 : 1,
                    padding: windowWidth <= 480 ? '8px 12px' : '12px 24px',
                  }}
                  disabled={saving}
                  className="btn-3d"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={windowWidth <= 480 ? 14 : 18} style={{ animation: 'rotate 1s linear infinite' }} />
                      {windowWidth > 480 && <span>Saving...</span>}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={windowWidth <= 480 ? 14 : 18} />
                      {windowWidth > 480 && <span>Save Changes</span>}
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    ...styles.cancelButton,
                    padding: windowWidth <= 480 ? '8px 12px' : '12px 24px',
                  }}
                  className="btn-outline-3d"
                >
                  <X size={windowWidth <= 480 ? 14 : 18} />
                  {windowWidth > 480 && <span>Cancel</span>}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  ...styles.editButton,
                  padding: windowWidth <= 480 ? '8px 12px' : '12px 24px',
                }}
                className="btn-3d"
              >
                <Edit2 size={windowWidth <= 480 ? 14 : 18} />
                {windowWidth > 480 && <span>Edit Profile</span>}
                <Sparkles size={windowWidth <= 480 ? 12 : 16} style={styles.editSparkle} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs Navigation */}
        <div style={{
          ...styles.tabsContainer,
          flexDirection: windowWidth <= 480 ? 'column' : 'row',
        }}>
          <button
            onClick={() => setActiveTab('personal')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'personal' ? 'rgba(52,152,219,0.1)' : 'transparent',
              borderColor: activeTab === 'personal' ? '#3498db' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'personal' ? '#3498db' : '#ffffff',
              width: windowWidth <= 480 ? '100%' : 'auto',
              justifyContent: windowWidth <= 480 ? 'center' : 'flex-start',
            }}
          >
            <User size={16} />
            <span>Personal Info</span>
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'medical' ? 'rgba(46,204,113,0.1)' : 'transparent',
              borderColor: activeTab === 'medical' ? '#2ecc71' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'medical' ? '#2ecc71' : '#ffffff',
              width: windowWidth <= 480 ? '100%' : 'auto',
              justifyContent: windowWidth <= 480 ? 'center' : 'flex-start',
            }}
          >
            <Heart size={16} />
            <span>Medical Info</span>
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'emergency' ? 'rgba(231,76,60,0.1)' : 'transparent',
              borderColor: activeTab === 'emergency' ? '#e74c3c' : 'rgba(255,255,255,0.1)',
              color: activeTab === 'emergency' ? '#e74c3c' : '#ffffff',
              width: windowWidth <= 480 ? '100%' : 'auto',
              justifyContent: windowWidth <= 480 ? 'center' : 'flex-start',
            }}
          >
            <AlertTriangle size={16} />
            <span>Emergency</span>
          </button>
        </div>

        {/* Profile Form */}
        <div style={{
          ...styles.formContainer,
          padding: windowWidth <= 480 ? '20px' : '30px',
        }}>
          {/* Personal Information Tab */}
          {activeTab === 'personal' && (
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>
                <User size={18} color="#3498db" />
                Personal Information
              </h3>

              <div style={{
                ...styles.formGrid,
                gridTemplateColumns: windowWidth <= 480 ? '1fr' : 'repeat(2, 1fr)',
                gap: windowWidth <= 480 ? '15px' : '20px',
              }}>
                {/* Full Name */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <User size={14} color="#7f8c8d" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="John Doe"
                  />
                </div>

                {/* Email */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <Mail size={14} color="#7f8c8d" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <Phone size={14} color="#7f8c8d" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="+1 234 567 890"
                  />
                </div>

                {/* Date of Birth */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <Calendar size={14} color="#7f8c8d" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={profileData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                  />
                </div>

                {/* Address */}
                <div style={{ ...styles.formField, gridColumn: windowWidth <= 480 ? '1' : 'span 2' }}>
                  <label style={styles.label}>
                    <MapPin size={14} color="#7f8c8d" />
                    Home Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="123 Main St, City, State"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Medical Information Tab */}
          {activeTab === 'medical' && (
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>
                <Heart size={18} color="#2ecc71" />
                Medical Information
              </h3>

              <div style={{
                ...styles.formGrid,
                gridTemplateColumns: windowWidth <= 480 ? '1fr' : 'repeat(2, 1fr)',
                gap: windowWidth <= 480 ? '15px' : '20px',
              }}>
                {/* Blood Group */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <Droplet size={14} color="#e74c3c" />
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={profileData.bloodGroup}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.select}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                {/* Allergies */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <AlertTriangle size={14} color="#9b59b6" />
                    Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={profileData.allergies}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="e.g., Peanuts, Penicillin"
                  />
                </div>

                {/* Medical Conditions */}
                <div style={{ ...styles.formField, gridColumn: windowWidth <= 480 ? '1' : 'span 2' }}>
                  <label style={styles.label}>
                    <Activity size={14} color="#3498db" />
                    Medical Conditions
                  </label>
                  <input
                    type="text"
                    name="medicalConditions"
                    value={profileData.medicalConditions}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="e.g., Hypertension, Diabetes"
                  />
                </div>

                {/* Primary Physician */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <Stethoscope size={14} color="#2ecc71" />
                    Primary Physician
                  </label>
                  <input
                    type="text"
                    name="primaryPhysician"
                    value={profileData.primaryPhysician}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="Dr. Smith"
                  />
                </div>

                {/* Last Checkup */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <Clock size={14} color="#f39c12" />
                    Last Checkup
                  </label>
                  <input
                    type="date"
                    name="lastCheckup"
                    value={profileData.lastCheckup}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Information Tab */}
          {activeTab === 'emergency' && (
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>
                <AlertTriangle size={18} color="#e74c3c" />
                Emergency Information
              </h3>

              <div style={{
                ...styles.formGrid,
                gridTemplateColumns: windowWidth <= 480 ? '1fr' : 'repeat(2, 1fr)',
                gap: windowWidth <= 480 ? '15px' : '20px',
              }}>
                {/* Emergency Contact */}
                <div style={{ ...styles.formField, gridColumn: windowWidth <= 480 ? '1' : 'span 2' }}>
                  <label style={styles.label}>
                    <Phone size={14} color="#e74c3c" />
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={profileData.emergencyContact}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="Name & Phone Number"
                  />
                </div>

                {/* Insurance Provider */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <Shield size={14} color="#3498db" />
                    Insurance Provider
                  </label>
                  <input
                    type="text"
                    name="insuranceProvider"
                    value={profileData.insuranceProvider}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="Insurance Company"
                  />
                </div>

                {/* Insurance ID */}
                <div style={styles.formField}>
                  <label style={styles.label}>
                    <Fingerprint size={14} color="#9b59b6" />
                    Insurance ID
                  </label>
                  <input
                    type="text"
                    name="insuranceId"
                    value={profileData.insuranceId}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={styles.input}
                    placeholder="Policy Number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Profile Status Cards */}
          <div style={{
            ...styles.statusCards,
            gridTemplateColumns: windowWidth <= 480 ? '1fr' : windowWidth <= 768 ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
            gap: windowWidth <= 480 ? '10px' : '15px',
          }}>
            <div style={styles.statusCard}>
              <FileText size={20} color="#3498db" />
              <div>
                <span style={styles.statusLabel}>Health Records</span>
                <span style={styles.statusValue}>12 documents</span>
              </div>
            </div>
            <div style={styles.statusCard}>
              <Award size={20} color="#2ecc71" />
              <div>
                <span style={styles.statusLabel}>Health Score</span>
                <span style={styles.statusValue}>85%</span>
              </div>
            </div>
            <div style={styles.statusCard}>
              <Zap size={20} color="#f39c12" />
              <div>
                <span style={styles.statusLabel}>Last Updated</span>
                <span style={styles.statusValue}>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add keyframe animations */}
      <style jsx="true">{`
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        .btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(52,152,219,0.3);
        }
        
        .btn-outline-3d:hover {
          transform: translateY(-2px);
          background: rgba(231,76,60,0.2);
          border-color: #e74c3c;
        }
        
        input:focus, select:focus {
          border-color: #3498db;
          box-shadow: 0 0 20px rgba(52,152,219,0.3);
          outline: none;
        }
        
        input:disabled, select:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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
  mainContent: {
    maxWidth: '1000px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 10,
    width: '100%',
    boxSizing: 'border-box',
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
  },
  loadingContent: {
    textAlign: 'center',
  },
  loadingIcon: {
    animation: 'rotate 2s linear infinite',
    marginBottom: '20px',
  },
  loadingBar: {
    width: '200px',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
    margin: '0 auto 20px',
  },
  loadingProgress: {
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, #3498db, #2ecc71)',
    animation: 'loading 1.5s ease-in-out infinite',
  },
  loadingText: {
    fontSize: '16px',
    color: '#ffffff',
    opacity: 0.7,
  },
  profileHeader: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    marginBottom: '20px',
    position: 'relative',
  },
  coverImage: {
    height: '150px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    position: 'relative',
    overflow: 'hidden',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)',
  },
  coverPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle at 20px 20px, rgba(255,255,255,0.1) 2px, transparent 0)',
    backgroundSize: '40px 40px',
  },
  avatarSection: {
    display: 'flex',
    gap: '30px',
    padding: '0 30px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    position: 'relative',
    zIndex: 20,
  },
  avatarContainer: {
    position: 'relative',
    borderRadius: '50%',
    zIndex: 2,
    border: '4px solid #1a1f2e',
    boxShadow: '0 0 30px rgba(52, 152, 219, 0.3)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid rgba(52,152,219,0.5)',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    border: '4px solid rgba(52,152,219,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarUpload: {
    position: 'absolute',
    bottom: '5px',
    right: '5px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: '2px solid rgba(255,255,255,0.5)',
  },
  avatarGlow: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    background: 'radial-gradient(circle, rgba(52,152,219,0.3) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  profileTitle: {
    flex: 1,
    paddingBottom: '10px',
  },
  userName: {
    margin: 0,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
    fontSize: '32px',
  },
  userEmail: {
    margin: '5px 0 10px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '16px',
    textShadow: '0 1px 5px rgba(0,0,0,0.5)',
  },
  completionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '30px',
    fontSize: '12px',
    flexWrap: 'wrap',
  },
  completionBar: {
    width: '60px',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  completionProgress: {
    height: '100%',
    background: '#2ecc71',
    transition: 'width 0.3s ease',
  },
  actionButtons: {
    position: 'absolute',
    display: 'flex',
    gap: '10px',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  editSparkle: {
    opacity: 0.7,
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #2ecc71, #27ae60)',
    border: 'none',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(231,76,60,0.1)',
    border: '1px solid rgba(231,76,60,0.3)',
    borderRadius: '12px',
    color: '#e74c3c',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  tabsContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  formSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px',
  },
  formGrid: {
    display: 'grid',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
  },
  input: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
  },
  statusCards: {
    display: 'grid',
    marginTop: '30px',
  },
  statusCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  statusLabel: {
    display: 'block',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '4px',
  },
  statusValue: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
};

export default Profile;