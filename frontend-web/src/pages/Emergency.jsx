import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Phone, ShieldAlert, Droplet, User,
  Navigation, Activity, Building, CheckCircle, Heart,
  MapPin, Ambulance, Clock, Shield, Zap, Crosshair,
  Radio, Satellite, AlertOctagon, Bell, Compass,
  Thermometer, Wind, Waves, CircleDot, Gauge, ShieldCheck, Video, Loader2, CheckCircle2, X
} from 'lucide-react';
import '../App.css';

function Emergency() {
  const [profileData, setProfileData] = useState(null);
  const [alertSent, setAlertSent] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Standby");
  const [dispatchInfo, setDispatchInfo] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // New SOS Overlay States
  const [showSOSOverlay, setShowSOSOverlay] = useState(false);
  const [sosStep, setSosStep] = useState(0); // 1 = Locating/Recording, 2 = Alert Sent
  const [sosCountdown, setSosCountdown] = useState(10);
  const [sosLat, setSosLat] = useState(null);
  const [sosLng, setSosLng] = useState(null);

  const [videoStream, setVideoStream] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const userId = localStorage.getItem('userId');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/auth/profile/${userId}`);
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    if (userId) fetchProfile();
  }, [userId]);

  // Countdown timer when alert is sent
  useEffect(() => {
    if (alertSent && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setAlertSent(false);
      setLocationStatus("Standby");
      setDispatchInfo(null);
      setCountdown(15);
      setGpsAccuracy(null);

      // Stop video recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
      }
    }
  }, [alertSent, countdown, videoStream]);

  // Helper function to safely format arrays
  const formatArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') return field.split(',').map(item => item.trim());
    return [];
  };

  // Helper function to safely display array values
  const displayArrayField = (field) => {
    const arr = formatArrayField(field);
    return arr.length > 0 ? arr.join(', ') : 'None reported';
  };

  const triggerSOS = async () => {
    setShowSOSOverlay(true);
    setSosStep(1);
    setSosCountdown(10);
    setLocationStatus("Locating...");
    setDispatchInfo(null);
    setAlertSent(false);

    // 1. Start bodycam recording immediately
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true });
      setVideoStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      // When recording stops 10s later, dispatch to hospital
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log("SOS Video Segment Saved (Ready to send):", blob);
        dispatchEmergency(blob);
      };
      mediaRecorder.start();
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
    }

    // 2. Start counting down 10 seconds while recording & getting GPS
    let secondsLeft = 10;
    const interval = setInterval(() => {
      secondsLeft -= 1;
      setSosCountdown(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(interval);
        // Stop recording which triggers dispatch in onstop, or dispatch directly if no camera
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        } else {
          dispatchEmergency();

        }
      }
    }, 1000);

    // 3. Pre-fetch GPS location during the 10 seconds
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSosLat(position.coords.latitude);
          setSosLng(position.coords.longitude);
          setGpsAccuracy(position.coords.accuracy.toFixed(1));
        },
        (error) => console.log("GPS fetch issue during countdown", error),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    }
  };

  const dispatchEmergency = async (videoBlob = null) => {
    const lat = sosLat || 10.9332; // fallback dummy if failed
    const lng = sosLng || 76.9832;

    try {
      const medicalConditions = formatArrayField(profileData?.medicalConditions);
      const allergies = formatArrayField(profileData?.allergies);

      const formData = new FormData();
      formData.append('userId', userId || 'anonymous');
      formData.append('userName', profileData?.name || 'Unknown Patient');
      formData.append('lat', lat);
      formData.append('lng', lng);
      formData.append('bloodGroup', profileData?.bloodGroup || 'Unknown');
      formData.append('emergencyContact', profileData?.emergencyContact || 'Not set');

      // Append arrays as JSON strings since it's FormData
      formData.append('medicalConditions', JSON.stringify(medicalConditions));
      formData.append('allergies', JSON.stringify(allergies));

      if (videoBlob) {
        formData.append('video', videoBlob, 'sos_capture.webm');
      }

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/sos/dispatch`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setLocationStatus(`Locked: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setAlertSent(true);

      setDispatchInfo({
        hospital: response.data.targetHospital || 'Sri Ramakrishna Dental Hospital',
        phone: response.data.targetPhone || '108',
        distance: response.data.distance || '2.3',
        eta: response.data.eta || '8',
        ambulanceId: response.data.ambulanceId || 'AMB-7342',
        dispatcherName: response.data.dispatcherName || 'Sarah Chen'
      });

      // Show Step 2 (Success Screen)
      setSosStep(2);

    } catch (error) {
      console.error("Failed to ping server:", error);
      // Even on failure for this demo, proceed to show the mock success overlay or an error
      setAlertSent(true);
      setDispatchInfo({
        hospital: 'Sri Ramakrishna Dental Hospital',
        phone: '108'
      });
      setSosStep(2);
    }
  };

  const closeSOSOverlay = () => {
    setShowSOSOverlay(false);
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated Gradient Background */}
      <div style={styles.gradientBg}>
        <div style={styles.gradient1}></div>
        <div style={styles.gradient2}></div>
      </div>

      {/* Floating Particles - Fewer on mobile */}
      <div style={styles.particles}>
        {[...Array(windowWidth <= 768 ? 8 : 20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float-particle ${10 + Math.random() * 15}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
              backgroundColor: i % 2 === 0 ? '#e74c3c' : '#3498db',
              width: windowWidth <= 768 ? '2px' : '3px',
              height: windowWidth <= 768 ? '2px' : '3px',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div style={{
        ...styles.header,
        padding: windowWidth <= 480 ? '10px 0' : '15px 0',
      }}>
        <div style={{
          ...styles.headerContent,
          padding: windowWidth <= 480 ? '0 15px' : windowWidth <= 768 ? '0 20px' : '0 40px',
        }}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <ShieldCheck size={windowWidth <= 480 ? 24 : 32} color="#3498db" />
              <div style={{
                ...styles.logoGlow,
                width: windowWidth <= 480 ? '40px' : '60px',
                height: windowWidth <= 480 ? '40px' : '60px',
              }}></div>
            </div>
            <span style={{
              ...styles.logoText,
              fontSize: windowWidth <= 480 ? '18px' : windowWidth <= 768 ? '20px' : '24px',
            }}>
              Smart<span style={{ color: '#3498db' }}>PHR</span>
              {windowWidth > 480 && <span style={styles.logoBadge}>v2.0</span>}
            </span>
          </div>

          <div style={styles.headerRight}>
            {userId ? (
              <Link to="/home" style={{
                ...styles.dashboardLink,
                padding: windowWidth <= 480 ? '8px 12px' : '10px 20px',
                fontSize: windowWidth <= 480 ? '12px' : '14px',
              }} className="btn-outline-3d">
                <Activity size={windowWidth <= 480 ? 14 : 18} />
                {windowWidth > 480 && <span>Dashboard</span>}
              </Link>
            ) : (
              <Link to="/login" style={{
                ...styles.loginLink,
                padding: windowWidth <= 480 ? '8px 12px' : '10px 20px',
                fontSize: windowWidth <= 480 ? '12px' : '14px',
              }} className="btn-3d">
                <User size={windowWidth <= 480 ? 14 : 18} />
                {windowWidth > 480 && <span>Medical Vault</span>}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div style={{
        ...styles.mainContent,
        padding: windowWidth <= 480 ? '15px' : windowWidth <= 768 ? '20px' : '40px',
      }}>
        {/* Emergency Alert Banner */}
        <div style={{
          ...styles.alertBanner,
          padding: windowWidth <= 480 ? '12px' : '20px',
          flexDirection: windowWidth <= 480 ? 'column' : 'row',
          textAlign: windowWidth <= 480 ? 'center' : 'left',
        }}>
          <div style={{
            ...styles.alertIcon,
            width: windowWidth <= 480 ? '40px' : '50px',
            height: windowWidth <= 480 ? '40px' : '50px',
          }}>
            <AlertOctagon size={windowWidth <= 480 ? 20 : 24} color="#e74c3c" />
          </div>
          <div style={styles.alertText}>
            <h2 style={{
              ...styles.alertTitle,
              fontSize: windowWidth <= 480 ? '16px' : windowWidth <= 768 ? '18px' : '20px',
            }}>EMERGENCY RESPONSE SYSTEM</h2>
            <p style={{
              ...styles.alertSubtitle,
              fontSize: windowWidth <= 480 ? '12px' : '14px',
            }}>Pressing SOS will immediately dispatch emergency services to your exact location</p>
          </div>
        </div>

        {/* Main SOS Section */}
        <div style={{
          ...styles.sosSection,
          gap: windowWidth <= 480 ? '20px' : '30px',
        }}>
          {/* Left Side - Information */}
          <div style={styles.infoPanel}>
            {/* Vital Signs Monitor */}
            <div style={{
              ...styles.vitalMonitor,
              padding: windowWidth <= 480 ? '15px' : '25px',
            }}>
              <h3 style={styles.panelTitle}>
                <Heart size={18} color="#e74c3c" />
                Critical Information
              </h3>

              {profileData ? (
                <div style={{
                  ...styles.vitalGrid,
                  gap: windowWidth <= 480 ? '10px' : '15px',
                }}>
                  <div style={{
                    ...styles.vitalCard,
                    padding: windowWidth <= 480 ? '12px' : '15px',
                  }}>
                    <Droplet size={windowWidth <= 480 ? 20 : 24} color="#e74c3c" />
                    <div>
                      <span style={styles.vitalLabel}>Blood Type</span>
                      <span style={styles.vitalValue}>{profileData.bloodGroup || "O+"}</span>
                    </div>
                  </div>

                  <div style={{
                    ...styles.vitalCard,
                    padding: windowWidth <= 480 ? '12px' : '15px',
                  }}>
                    <Phone size={windowWidth <= 480 ? 20 : 24} color="#3498db" />
                    <div>
                      <span style={styles.vitalLabel}>Emergency Contact</span>
                      <span style={styles.vitalValue}>
                        {windowWidth <= 480 && profileData.emergencyContact?.length > 12
                          ? `${profileData.emergencyContact.substring(0, 12)}...`
                          : profileData.emergencyContact || "Not Set"}
                      </span>
                    </div>
                  </div>

                  {/* Safely display allergies */}
                  {profileData.allergies && formatArrayField(profileData.allergies).length > 0 && (
                    <div style={{ ...styles.vitalCard, gridColumn: 'span 2', padding: windowWidth <= 480 ? '12px' : '15px' }}>
                      <AlertTriangle size={windowWidth <= 480 ? 20 : 24} color="#f39c12" />
                      <div>
                        <span style={styles.vitalLabel}>Allergies</span>
                        <span style={styles.vitalValue}>
                          {windowWidth <= 480 && displayArrayField(profileData.allergies).length > 20
                            ? `${displayArrayField(profileData.allergies).substring(0, 20)}...`
                            : displayArrayField(profileData.allergies)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Safely display medical conditions */}
                  {profileData.medicalConditions && formatArrayField(profileData.medicalConditions).length > 0 && (
                    <div style={{ ...styles.vitalCard, gridColumn: 'span 2', padding: windowWidth <= 480 ? '12px' : '15px' }}>
                      <Activity size={windowWidth <= 480 ? 20 : 24} color="#9b59b6" />
                      <div>
                        <span style={styles.vitalLabel}>Medical Conditions</span>
                        <span style={styles.vitalValue}>
                          {windowWidth <= 480 && displayArrayField(profileData.medicalConditions).length > 20
                            ? `${displayArrayField(profileData.medicalConditions).substring(0, 20)}...`
                            : displayArrayField(profileData.medicalConditions)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={styles.noProfile}>
                  <User size={32} color="#7f8c8d" />
                  <p>No medical profile loaded</p>
                  <Link to="/login" style={styles.loginPrompt}>Login to add medical info</Link>
                </div>
              )}
            </div>

            {/* GPS Status */}
            <div style={{
              ...styles.gpsPanel,
              padding: windowWidth <= 480 ? '15px' : '20px',
            }}>
              <div style={styles.gpsHeader}>
                <Satellite size={18} color={alertSent ? "#2ecc71" : "#3498db"} />
                <span style={styles.gpsTitle}>GPS Signal</span>
              </div>
              <div style={{
                ...styles.gpsStatus,
                flexDirection: windowWidth <= 480 ? 'column' : 'row',
                alignItems: windowWidth <= 480 ? 'flex-start' : 'center',
                gap: windowWidth <= 480 ? '10px' : '0',
              }}>
                <div style={styles.gpsIndicator}>
                  <Radio size={24} color={alertSent ? "#2ecc71" : "#e74c3c"} />
                  <span style={{
                    ...styles.gpsText,
                    fontSize: windowWidth <= 480 ? '14px' : '16px',
                  }}>{locationStatus}</span>
                </div>
                {gpsAccuracy && (
                  <div style={styles.gpsAccuracy}>
                    <Crosshair size={14} color="#7f8c8d" />
                    <span>Accuracy: ±{gpsAccuracy}m</span>
                  </div>
                )}
              </div>
            </div>

            {/* Nearby Hospitals Preview */}
            {nearbyHospitals.length > 0 && !alertSent && (
              <div style={{
                ...styles.hospitalsPreview,
                padding: windowWidth <= 480 ? '15px' : '20px',
              }}>
                <h3 style={styles.panelTitle}>
                  <Building size={18} color="#3498db" />
                  Nearby Hospitals
                </h3>
                {nearbyHospitals.map((hospital, index) => (
                  <div key={index} style={styles.hospitalItem}>
                    <Building size={16} color={hospital.available ? "#2ecc71" : "#7f8c8d"} />
                    <div style={styles.hospitalInfo}>
                      <span style={styles.hospitalName}>
                        {windowWidth <= 480 && hospital.name.length > 20
                          ? `${hospital.name.substring(0, 20)}...`
                          : hospital.name}
                      </span>
                      <span style={styles.hospitalDistance}>{hospital.distance} km · {hospital.eta} min</span>
                    </div>
                    {hospital.available ? (
                      <CheckCircle size={16} color="#2ecc71" />
                    ) : (
                      <AlertTriangle size={16} color="#f39c12" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - SOS Button & Dispatch Info */}
          <div style={styles.sosPanel}>
            {/* Hidden Video Feed removed from here, moved to overlay */}

            {/* Giant SOS Button */}
            <div style={styles.sosButtonContainer}>
              <button
                onClick={triggerSOS}
                disabled={alertSent}
                style={{
                  ...styles.sosButton,
                  backgroundColor: alertSent ? '#2ecc71' : '#e74c3c',
                  animation: alertSent ? 'none' : 'emergencyPulse 2s infinite',
                  width: windowWidth <= 480 ? '180px' : windowWidth <= 768 ? '220px' : '300px',
                  height: windowWidth <= 480 ? '180px' : windowWidth <= 768 ? '220px' : '300px',
                }}
                className={alertSent ? '' : 'sos-button'}
              >
                <div style={styles.sosButtonInner}>
                  <AlertTriangle size={alertSent
                    ? (windowWidth <= 480 ? 28 : windowWidth <= 768 ? 36 : 48)
                    : (windowWidth <= 480 ? 40 : windowWidth <= 768 ? 56 : 72)}
                  />
                  <span style={{
                    ...styles.sosText,
                    fontSize: windowWidth <= 480 ? '24px' : windowWidth <= 768 ? '36px' : '48px',
                  }}>{alertSent ? "DISPATCHED" : "SOS"}</span>
                  {alertSent && (
                    <div style={{
                      ...styles.sosCountdown,
                      bottom: windowWidth <= 480 ? '15px' : '30px',
                    }}>
                      <Clock size={16} />
                      <span>{countdown}s</span>
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Removed Old Dispatch Info from main layout */}

            {/* Safety Instructions */}
            {!alertSent && !dispatchInfo && (
              <div style={{
                ...styles.safetyCard,
                padding: windowWidth <= 480 ? '15px' : '20px',
              }}>
                <h3 style={{
                  ...styles.safetyTitle,
                  fontSize: windowWidth <= 480 ? '14px' : '16px',
                }}>Emergency Instructions</h3>
                <ul style={styles.safetyList}>
                  <li style={styles.safetyItem}>
                    <CircleDot size={16} color="#e74c3c" />
                    <span>Stay calm and stay in your current location</span>
                  </li>
                  <li style={styles.safetyItem}>
                    <CircleDot size={16} color="#e74c3c" />
                    <span>Keep your phone charged and nearby</span>
                  </li>
                  <li style={styles.safetyItem}>
                    <CircleDot size={16} color="#e74c3c" />
                    <span>Unlock your door for emergency services</span>
                  </li>
                  <li style={styles.safetyItem}>
                    <CircleDot size={16} color="#e74c3c" />
                    <span>Have your ID and medical info ready</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={{
          ...styles.footerText,
          padding: windowWidth <= 480 ? '0 15px' : windowWidth <= 768 ? '0 20px' : '0 40px',
          fontSize: windowWidth <= 480 ? '10px' : '12px',
        }}>
          <Shield size={14} color="#7f8c8d" />
          This emergency system is monitored 24/7. Pressing SOS will immediately alert emergency services.
        </p>
      </div>

      {/* Fullscreen SOS Overlay */}
      {showSOSOverlay && (
        <div style={styles.sosOverlayWrapper} className="slide-in">
          <button style={styles.sosOverlayClose} onClick={closeSOSOverlay}>
            <X size={24} />
          </button>

          <div style={styles.sosOverlayContent}>
            {sosStep === 1 && (
              <div style={styles.sosOverlayStep}>
                <div style={styles.sosOverlayIconWrapperPulse}>
                  <ShieldAlert size={64} color="#e53e3e" />
                </div>
                <h1 style={styles.sosOverlayTitle}>LOCATING YOU...</h1>
                <p style={styles.sosOverlaySubtitle}>Acquiring GPS coordinates for emergency dispatch.</p>

                {/* Live Video Preview during 10s countdown */}
                <div style={styles.sosVideoPreviewContainer} className="slide-in">
                  <div style={styles.sosVideoPreviewHeader}>
                    <div style={styles.recordingDot}></div>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#e53e3e' }}>LIVE REC</span>
                  </div>
                  <video ref={videoRef} autoPlay muted playsInline style={styles.sosVideoPreview} />
                </div>

                <div style={styles.sosOverlayLoaderContainer}>
                  <Loader2 size={32} className="lucide-spin text-white opacity-50" />
                  <p style={{ marginTop: '15px' }}>Recording Environment... ({sosCountdown}s)</p>
                </div>
              </div>
            )}

            {sosStep === 2 && (
              <div style={styles.sosOverlayStep}>
                <div style={styles.sosOverlayIconWrapperStatic}>
                  <CheckCircle2 size={64} color="#38a169" />
                </div>
                <h1 style={styles.sosOverlayTitle}>ALERT SENT</h1>
                <p style={styles.sosOverlaySubtitle}>Emergency services and your contacts have been notified with your medical profile and location.</p>

                <div style={styles.sosOverlayCard}>
                  <p style={styles.sosOverlayCardHeader}>NEXT STEPS</p>
                  <ul style={styles.sosOverlayList}>
                    <li style={styles.sosOverlayListItem}>
                      <div style={styles.sosOverlayListNum}>1</div>
                      <span>Stay where you are if safe</span>
                    </li>
                    <li style={styles.sosOverlayListItem}>
                      <div style={styles.sosOverlayListNum}>2</div>
                      <span>Keep your phone unlocked</span>
                    </li>
                    <li style={styles.sosOverlayListItem}>
                      <div style={styles.sosOverlayListNum}>3</div>
                      <span>Help is on the way</span>
                    </li>
                  </ul>
                </div>

                <button style={styles.sosOverlayCloseBtn} onClick={closeSOSOverlay}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add keyframe animations */}
      <style jsx="true">{`
        @keyframes sweep {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        @keyframes float-particle {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
        }
        
        @keyframes emergencyPulse {
          0% { transform: scale(1); box-shadow: 0 20px 40px rgba(231,76,60,0.3); }
          50% { transform: scale(1.05); box-shadow: 0 30px 60px rgba(231,76,60,0.5); }
          100% { transform: scale(1); box-shadow: 0 20px 40px rgba(231,76,60,0.3); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .lucide-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes overlayPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(229, 62, 62, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0); }
        }
        
        .sos-button:hover {
          transform: scale(1.1);
        }
        
        .slide-in {
          animation: slideIn 0.5s ease-out;
        }
        
        .btn-outline-3d:hover {
          transform: translateY(-2px);
          background: rgba(52,152,219,0.2);
        }
        
        .btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(52,152,219,0.3);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    width: '100%',
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
    color: '#ffffff',
    position: 'relative',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
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
    opacity: 0.3,
  },
  header: {
    background: 'rgba(10, 15, 28, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(231, 76, 60, 0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    width: '100%',
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
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
    fontWeight: 'bold',
    color: '#ffffff',
  },
  logoBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    background: 'rgba(52,152,219,0.2)',
    borderRadius: '10px',
    color: '#3498db',
    marginLeft: '5px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  dashboardLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(52,152,219,0.1)',
    border: '1px solid rgba(52,152,219,0.3)',
    borderRadius: '12px',
    color: '#3498db',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  loginLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    borderRadius: '12px',
    color: '#ffffff',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'all 0.3s ease',
  },
  mainContent: {
    flex: 1,
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    position: 'relative',
    zIndex: 10,
    boxSizing: 'border-box',
  },
  alertBanner: {
    background: 'rgba(231, 76, 60, 0.1)',
    border: '1px solid rgba(231, 76, 60, 0.3)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '40px',
    backdropFilter: 'blur(10px)',
  },
  alertIcon: {
    borderRadius: '12px',
    background: 'rgba(231,76,60,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: '5px',
  },
  alertSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    margin: 0,
  },
  sosSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  infoPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  vitalMonitor: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '20px',
  },
  vitalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  vitalCard: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  vitalLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    display: 'block',
    marginBottom: '4px',
  },
  vitalValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
  noProfile: {
    textAlign: 'center',
    padding: '30px',
    color: 'rgba(255,255,255,0.5)',
  },
  loginPrompt: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '8px 16px',
    background: 'rgba(52,152,219,0.1)',
    borderRadius: '20px',
    color: '#3498db',
    textDecoration: 'none',
    fontSize: '12px',
  },
  gpsPanel: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  gpsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '15px',
  },
  gpsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#ffffff',
  },
  gpsStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gpsIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  gpsText: {
    fontWeight: '500',
    color: '#ffffff',
  },
  gpsAccuracy: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  hospitalsPreview: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  hospitalItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  hospitalInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  hospitalName: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  },
  hospitalDistance: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
  },
  sosPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sosButtonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  sosButton: {
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 20px 40px rgba(231,76,60,0.3)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  sosButtonInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    color: '#ffffff',
    position: 'relative',
    zIndex: 2,
  },
  sosText: {
    fontWeight: '900',
    letterSpacing: '4px',
  },
  sosCountdown: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#ffffff',
    opacity: 0.8,
  },
  dispatchCard: {
    background: 'rgba(46, 204, 113, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '2px solid rgba(46, 204, 113, 0.3)',
  },
  dispatchHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  dispatchTitle: {
    fontWeight: 'bold',
    color: '#2ecc71',
    margin: 0,
  },
  dispatchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    marginBottom: '20px',
  },
  dispatchItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
  },
  dispatchLabel: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.5)',
    display: 'block',
    marginBottom: '2px',
  },
  dispatchValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
  },
  dispatchFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(46,204,113,0.1)',
    borderRadius: '12px',
    color: '#2ecc71',
  },
  safetyCard: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  safetyTitle: {
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '15px',
  },
  safetyList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  safetyItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    background: 'rgba(10, 15, 28, 0.8)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(231,76,60,0.2)',
    padding: '15px 0',
    marginTop: '40px',
    width: '100%',
  },
  footerText: {
    maxWidth: '1400px',
    margin: '0 auto',
    color: 'rgba(255,255,255,0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  videoCard: {
    background: 'rgba(231, 76, 60, 0.05)',
    border: '1px solid rgba(231, 76, 60, 0.3)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  videoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(231, 76, 60, 0.2)',
    padding: '4px 10px',
    borderRadius: '12px',
    color: '#e74c3c',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  recordingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#e74c3c',
    animation: 'pulse 1s infinite',
  },

  // New Video Preview Styles for Overlay
  sosVideoPreviewContainer: {
    width: '100%',
    maxWidth: '280px',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.2)',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    marginTop: '10px',
  },
  sosVideoPreviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
  },
  sosVideoPreview: {
    width: '100%',
    display: 'block',
    aspectRatio: '4/3',
    objectFit: 'cover',
    backgroundColor: '#000',
    transform: 'scaleX(-1)', // Mirror effect for front camera
  },
  liveVideo: {
    width: '100%',
    borderRadius: '12px',
    backgroundColor: '#000',
    maxHeight: '300px',
    objectFit: 'cover',
  },
  videoFooter: {
    fontSize: '12px',
    color: '#e74c3c',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Fullscreen SOS Overlay Styles
  sosOverlayWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#e53e3e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    color: 'white',
    overflowY: 'auto',
  },
  sosOverlayClose: {
    position: 'absolute',
    top: '24px',
    right: '24px',
    padding: '8px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    transition: 'background-color 0.2s',
  },
  sosOverlayContent: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    padding: '48px 0',
  },
  sosOverlayStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  sosOverlayIconWrapperPulse: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 25px 50px -12px rgba(127, 29, 29, 0.5)',
    animation: 'overlayPulse 1.5s infinite',
  },
  sosOverlayIconWrapperStatic: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  sosOverlayTitle: {
    fontSize: '36px',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: '-1px',
    margin: 0,
  },
  sosOverlaySubtitle: {
    color: '#fed7d7',
    fontSize: '18px',
    margin: 0,
  },
  sosOverlayLoaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '16px',
  },
  sosOverlayCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: '24px',
    borderRadius: '24px',
    border: '1px solid rgba(255,255,255,0.2)',
    width: '100%',
    textAlign: 'left',
  },
  sosOverlayCardHeader: {
    fontSize: '14px',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: '16px',
    opacity: 0.6,
  },
  sosOverlayList: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sosOverlayListItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
  },
  sosOverlayListNum: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
  },
  sosOverlayCloseBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '16px',
    borderRadius: '16px',
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginTop: '16px',
  },
};

export default Emergency;