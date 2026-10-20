import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Building, MapPin, Phone, AlertTriangle, Navigation, Activity,
  Heart, Clock, Star, Shield, Ambulance, Users, Stethoscope,
  Scissors, Syringe, Microscope, Pill, Truck, Wifi,
  Battery, Signal, Search, Filter, ChevronRight,
  CircleDot, Compass, Target, Sparkles, BadgeCheck,
  RefreshCw, WifiOff, ServerOff, X, Menu, Maximize2, Minimize2
} from 'lucide-react';
import '../App.css';

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLoc, setUserLoc] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [filterType, setFilterType] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hospitalStats, setHospitalStats] = useState({
    total: 0,
    emergency: 0,
    ambulance: 0,
    avgWait: 0
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        setUserLoc({ lat, lng });
        setGpsAccuracy(accuracy.toFixed(1));

        await fetchHospitals(lat, lng, searchRadius);
      },
      async (err) => {
        console.warn("GPS Warning (Timeout/Denied). Falling back to IP-based location.");
        try {
          // IP-Based Geolocation Fallback
          let lat, lng;
          try {
            const ipResponse = await axios.get('https://ipapi.co/json/');
            lat = ipResponse.data.latitude;
            lng = ipResponse.data.longitude;
          } catch (e1) {
            // Backup IP fetcher if ipapi is rate-limited
            const ipResponse2 = await axios.get('https://ipinfo.io/json');
            const [locLat, locLng] = ipResponse2.data.loc.split(',');
            lat = parseFloat(locLat);
            lng = parseFloat(locLng);
          }

          if (lat && lng) {
            setUserLoc({ lat, lng });
            setGpsAccuracy("IP Approximated");
            await fetchHospitals(lat, lng, searchRadius);
          } else {
            throw new Error("IP Geolocation failed");
          }
        } catch (ipError) {
          console.error("IP Fallback failed:", ipError);
          // Ultimate fallback so the app does not break
          const lat = 40.7128;
          const lng = -74.0060;
          setUserLoc({ lat, lng });
          setGpsAccuracy("Demo/Fallback");
          await fetchHospitals(lat, lng, searchRadius);
        }
      },
      {
        enableHighAccuracy: false, // Must be false so laptops don't hang trying to lock satellites
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, []);

  const fetchHospitals = async (lat, lng, radius) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/hospitals/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);

      // Get hospitals data
      let hospitalsData = response.data.data || response.data || [];

      // Calculate distance for each hospital and add to the data
      hospitalsData = hospitalsData.map(hospital => {
        if (hospital.lat && hospital.lng) {
          const distance = calculateDistance(lat, lng, hospital.lat, hospital.lng);
          return { ...hospital, distance: parseFloat(distance.toFixed(1)) };
        }
        return { ...hospital, distance: null };
      });

      // Filter by radius and sort by distance
      hospitalsData = hospitalsData
        .filter(h => h.distance !== null && h.distance <= radius)
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

      setHospitals(hospitalsData);

      // Calculate stats
      const emergency = hospitalsData.filter(h => h.emergency).length;
      const ambulance = hospitalsData.filter(h => h.ambulance).length;
      const avgWait = hospitalsData.length > 0
        ? Math.round(hospitalsData.reduce((acc, h) => acc + (h.waitTime || 15), 0) / hospitalsData.length)
        : 0;

      setHospitalStats({
        total: hospitalsData.length,
        emergency,
        ambulance,
        avgWait
      });
    } catch (err) {
      console.error("Error fetching hospitals:", err);

      if (err.code === 'ERR_NETWORK') {
        setError("Cannot connect to server. Please check if the backend is running.");
      } else if (err.response?.status === 500) {
        setError("Server error. The hospital database might be temporarily unavailable.");
      } else if (err.response?.status === 404) {
        setError("Hospital service not found. Please check the API endpoint.");
      } else {
        setError("Failed to locate hospitals. Please try again.");
      }

      setHospitals([]);
      setHospitalStats({
        total: 0,
        emergency: 0,
        ambulance: 0,
        avgWait: 0
      });
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  const handleRadiusChange = async (newRadius) => {
    setSearchRadius(newRadius);

    if (userLoc) {
      // Fetch new data with updated radius
      await fetchHospitals(userLoc.lat, userLoc.lng, newRadius);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    if (userLoc) {
      await fetchHospitals(userLoc.lat, userLoc.lng, searchRadius);
    } else {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLoc({ lat, lng });
          await fetchHospitals(lat, lng, searchRadius);
        },
        async (err) => {
          console.warn("GPS Warning. Falling back to IP-based location on retry.");
          try {
            let lat, lng;
            try {
              const ipResponse = await axios.get('https://ipapi.co/json/');
              lat = ipResponse.data.latitude;
              lng = ipResponse.data.longitude;
            } catch (e1) {
              const ipResponse2 = await axios.get('https://ipinfo.io/json');
              const [locLat, locLng] = ipResponse2.data.loc.split(',');
              lat = parseFloat(locLat);
              lng = parseFloat(locLng);
            }
            if (lat && lng) {
              setUserLoc({ lat, lng });
              setGpsAccuracy("IP Approximated");
              await fetchHospitals(lat, lng, searchRadius);
            }
          } catch (ipError) {
            console.error("IP Fallback failed on retry:", ipError);
            const lat = 40.7128;
            const lng = -74.0060;
            setUserLoc({ lat, lng });
            setGpsAccuracy("Demo/Fallback");
            await fetchHospitals(lat, lng, searchRadius);
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    if (filterType === 'emergency') return hospital.emergency;
    if (filterType === 'ambulance') return hospital.ambulance;
    if (filterType === '24hours') return hospital.hours24;
    return true;
  });

  const closestHospital = filteredHospitals[0];

  // Generate Google Maps URL for directions
  const getDirectionsUrl = (hospital) => {
    if (userLoc && hospital.lat && hospital.lng) {
      return `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${hospital.lat},${hospital.lng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${hospital.lat},${hospital.lng}`;
  };

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
              backgroundColor: i % 2 === 0 ? '#2ecc71' : '#3498db',
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
          padding: windowWidth <= 480 ? '0 15px' : '0 40px',
        }}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>
              <Building size={windowWidth <= 480 ? 24 : 32} color="#2ecc71" />
              <div style={{
                ...styles.logoGlow,
                width: windowWidth <= 480 ? '40px' : '60px',
                height: windowWidth <= 480 ? '40px' : '60px',
              }}></div>
            </div>
            <span style={{
              ...styles.logoText,
              fontSize: windowWidth <= 480 ? '18px' : 'clamp(18px, 4vw, 24px)',
            }}>Medical<span style={{ color: '#2ecc71' }}>.Locator</span></span>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.gpsSignal}>
              <Signal size={16} color={userLoc ? "#2ecc71" : "#e74c3c"} />
              {windowWidth > 480 && (
                <span style={styles.gpsText}>
                  {userLoc ? 'GPS Locked' : 'Searching...'}
                </span>
              )}
              {gpsAccuracy && (
                <span style={styles.accuracyText}>±{gpsAccuracy}m</span>
              )}
            </div>
            <button
              onClick={() => setShowMap(!showMap)}
              style={styles.mapToggle}
              className="icon-3d"
            >
              {showMap ? <X size={20} /> : <MapPin size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div style={{
        ...styles.mainContent,
        padding: windowWidth <= 480 ? '15px' : windowWidth <= 768 ? '20px' : '30px 40px',
      }}>
        {/* Hero Section */}
        <div style={{
          ...styles.heroSection,
          gridTemplateColumns: windowWidth <= 1024 ? '1fr' : '1fr 1fr',
          gap: windowWidth <= 480 ? '20px' : '30px',
        }}>
          <div style={styles.heroLeft}>
            <div style={styles.welcomeBadge}>
              <Target size={16} color="#2ecc71" />
              <span>Real-time hospital locator</span>
            </div>
            <h1 style={{
              ...styles.heroTitle,
              fontSize: windowWidth <= 480 ? '28px' : windowWidth <= 768 ? '36px' : 'clamp(32px, 6vw, 48px)',
            }}>Find Medical Care</h1>
            <p style={{
              ...styles.heroSubtitle,
              fontSize: windowWidth <= 480 ? '14px' : 'clamp(14px, 3vw, 16px)',
            }}>Instantly locate nearby hospitals, clinics, and emergency services based on your current location</p>

            {/* Quick Stats */}
            {hospitalStats.total > 0 && (
              <div style={{
                ...styles.quickStats,
                flexDirection: windowWidth <= 480 ? 'column' : 'row',
              }}>
                <div style={styles.quickStat}>
                  <Building size={20} color="#2ecc71" />
                  <div>
                    <span style={styles.quickStatValue}>{hospitalStats.total}</span>
                    <span style={styles.quickStatLabel}>Hospitals</span>
                  </div>
                </div>
                <div style={styles.quickStat}>
                  <Ambulance size={20} color="#e74c3c" />
                  <div>
                    <span style={styles.quickStatValue}>{hospitalStats.ambulance}</span>
                    <span style={styles.quickStatLabel}>Ambulances</span>
                  </div>
                </div>
                <div style={styles.quickStat}>
                  <Clock size={20} color="#f39c12" />
                  <div>
                    <span style={styles.quickStatValue}>{hospitalStats.avgWait}min</span>
                    <span style={styles.quickStatLabel}>Avg. Wait</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Map Preview - Only show on larger screens */}
          {userLoc && windowWidth > 1024 && (
            <div style={styles.heroRight}>
              <div style={{
                ...styles.mapPreview,
                ...(mapExpanded ? styles.mapPreviewExpanded : {})
              }}>
                <div style={styles.mapHeader}>
                  <div style={styles.mapTitle}>
                    <MapPin size={16} color="#3498db" />
                    <span>Live Location</span>
                  </div>
                  <button
                    onClick={() => setMapExpanded(!mapExpanded)}
                    style={styles.expandButton}
                  >
                    {mapExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                </div>

                <div style={styles.mapContainer}>
                  <iframe
                    title="Live Location Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0, borderRadius: '12px' }}
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLoc.lng - 0.1}%2C${userLoc.lat - 0.1}%2C${userLoc.lng + 0.1}%2C${userLoc.lat + 0.1}&layer=mapnik&marker=${userLoc.lat}%2C${userLoc.lng}`}
                    allowFullScreen
                  ></iframe>

                  <div style={styles.mapLegend}>
                    <div style={styles.legendItem}>
                      <CircleDot size={12} color="#3498db" />
                      <span>Your Location</span>
                    </div>
                    <div style={styles.legendItem}>
                      <Building size={12} color="#e74c3c" />
                      <span>Hospitals ({filteredHospitals.length})</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div style={{
          ...styles.searchBar,
          flexDirection: windowWidth <= 768 ? 'column' : 'row',
          alignItems: windowWidth <= 768 ? 'stretch' : 'center',
          padding: windowWidth <= 480 ? '15px' : '20px',
        }}>
          <div style={styles.radiusControl}>
            <label style={styles.radiusLabel}>Search Radius: {searchRadius}km</label>
            <input
              type="range"
              min="1"
              max="50"
              value={searchRadius}
              onChange={(e) => handleRadiusChange(parseInt(e.target.value))}
              style={styles.radiusSlider}
              disabled={loading || !userLoc}
            />
          </div>

          <div style={styles.filterControls}>
            <button
              onClick={() => setFilterType('all')}
              style={{
                ...styles.filterButton,
                backgroundColor: filterType === 'all' ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: filterType === 'all' ? '#2ecc71' : 'rgba(255,255,255,0.1)',
                padding: windowWidth <= 480 ? '10px' : '10px 20px',
              }}
              disabled={loading || hospitals.length === 0}
            >
              <Building size={16} />
              {windowWidth > 480 && <span className="filter-text">All</span>}
            </button>
            <button
              onClick={() => setFilterType('emergency')}
              style={{
                ...styles.filterButton,
                backgroundColor: filterType === 'emergency' ? 'rgba(231,76,60,0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: filterType === 'emergency' ? '#e74c3c' : 'rgba(255,255,255,0.1)',
                padding: windowWidth <= 480 ? '10px' : '10px 20px',
              }}
              disabled={loading || hospitals.length === 0}
            >
              <AlertTriangle size={16} />
              {windowWidth > 480 && <span className="filter-text">Emergency</span>}
            </button>
            <button
              onClick={() => setFilterType('ambulance')}
              style={{
                ...styles.filterButton,
                backgroundColor: filterType === 'ambulance' ? 'rgba(52,152,219,0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: filterType === 'ambulance' ? '#3498db' : 'rgba(255,255,255,0.1)',
                padding: windowWidth <= 480 ? '10px' : '10px 20px',
              }}
              disabled={loading || hospitals.length === 0}
            >
              <Ambulance size={16} />
              {windowWidth > 480 && <span className="filter-text">Ambulance</span>}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>
              <Activity size={windowWidth <= 480 ? 32 : 48} color="#2ecc71" style={styles.spinnerIcon} />
            </div>
            <p style={styles.loadingText}>Scanning for nearby medical facilities...</p>
            <div style={styles.loadingProgress}>
              <div style={styles.loadingBar}></div>
            </div>
          </div>
        ) : error ? (
          <div style={styles.errorContainer}>
            {error.includes('server') || error.includes('backend') ? (
              <ServerOff size={windowWidth <= 480 ? 32 : 48} color="#e74c3c" />
            ) : (
              <WifiOff size={windowWidth <= 480 ? 32 : 48} color="#e74c3c" />
            )}
            <h3 style={styles.errorTitle}>Connection Error</h3>
            <p style={styles.errorText}>{error}</p>
            <button
              onClick={handleRetry}
              style={{
                ...styles.retryButton,
                opacity: isRetrying ? 0.7 : 1,
                cursor: isRetrying ? 'not-allowed' : 'pointer',
                padding: windowWidth <= 480 ? '10px 20px' : '12px 24px',
              }}
              disabled={isRetrying}
              className="btn-3d"
            >
              <RefreshCw size={16} style={isRetrying ? { animation: 'rotate 1s linear infinite' } : {}} />
              {isRetrying ? 'Retrying...' : 'Try Again'}
            </button>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>
              <Building size={windowWidth <= 480 ? 48 : 64} color="#7f8c8d" />
            </div>
            <h3 style={styles.emptyStateTitle}>No Hospitals Found</h3>
            <p style={styles.emptyStateText}>
              {hospitals.length === 0
                ? "Unable to fetch hospital data. Please try again later."
                : `No medical facilities found within ${searchRadius}km of your location. Try increasing the search radius.`
              }
            </p>
            {hospitals.length === 0 && (
              <button
                onClick={handleRetry}
                style={styles.retryButton}
                className="btn-3d"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            )}
          </div>
        ) : (
          <div style={{
            ...styles.hospitalsGrid,
            gridTemplateColumns: windowWidth <= 480
              ? '1fr'
              : windowWidth <= 768
                ? 'repeat(2, 1fr)'
                : 'repeat(auto-fill, minmax(350px, 1fr))',
          }}>
            {filteredHospitals.map((hospital, index) => (
              <div
                key={hospital.id || index}
                style={styles.hospitalCard}
                className="feature-card-3d"
                onMouseEnter={() => setSelectedHospital(hospital)}
                onMouseLeave={() => setSelectedHospital(null)}
              >
                {/* Hospital Status Bar */}
                <div style={{
                  ...styles.hospitalStatus,
                  backgroundColor: hospital.emergency ? '#e74c3c' : '#2ecc71'
                }}></div>

                <div style={styles.hospitalHeader}>
                  <div style={styles.hospitalIcon}>
                    <Building size={24} color={hospital.emergency ? "#e74c3c" : "#2ecc71"} />
                  </div>
                  <div style={styles.hospitalTitle}>
                    <h3 style={styles.hospitalName}>{hospital.name}</h3>
                    <div style={styles.hospitalBadges}>
                      {hospital.emergency && (
                        <span style={styles.emergencyBadge}>
                          <AlertTriangle size={12} />
                          {windowWidth > 480 && 'ER'}
                        </span>
                      )}
                      {hospital.ambulance && (
                        <span style={styles.ambulanceBadge}>
                          <Ambulance size={12} />
                          {windowWidth > 480 && 'Ambulance'}
                        </span>
                      )}
                      {hospital.hours24 && (
                        <span style={styles.hoursBadge}>
                          <Clock size={12} />
                          {windowWidth > 480 && '24/7'}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Distance Badge */}
                  <div style={styles.distanceBadge}>
                    <Navigation size={14} color="#3498db" />
                    <span>{hospital.distance ? hospital.distance.toFixed(1) : '?'} km</span>
                  </div>
                </div>

                <div style={styles.hospitalDetails}>
                  <div style={styles.detailItem}>
                    <MapPin size={14} color="#7f8c8d" />
                    <span style={styles.detailText}>
                      {windowWidth <= 480 && hospital.address && hospital.address.length > 30
                        ? `${hospital.address.substring(0, 30)}...`
                        : hospital.address || 'Address not available'}
                    </span>
                  </div>

                  {hospital.phone && hospital.phone !== "No phone listed" && (
                    <div style={styles.detailItem}>
                      <Phone size={14} color="#7f8c8d" />
                      <span style={styles.detailText}>{hospital.phone}</span>
                    </div>
                  )}

                  {/* Wait Time */}
                  {hospital.waitTime && (
                    <div style={styles.waitTimeContainer}>
                      <Clock size={14} color="#f39c12" />
                      <span>Estimated wait: {hospital.waitTime} minutes</span>
                    </div>
                  )}

                  {/* Services List */}
                  {hospital.services && hospital.services.length > 0 && windowWidth > 480 && (
                    <div style={styles.servicesList}>
                      {hospital.services.slice(0, 3).map((service, i) => (
                        <span key={i} style={styles.serviceTag}>
                          {service === 'emergency' && <AlertTriangle size={12} />}
                          {service === 'cardiology' && <Heart size={12} />}
                          {service === 'pediatrics' && <Users size={12} />}
                          {service === 'surgery' && <Scissors size={12} />}
                          {service}
                        </span>
                      ))}
                      {hospital.services.length > 3 && (
                        <span style={styles.moreServices}>+{hospital.services.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={styles.hospitalActions}>
                  {hospital.lat && hospital.lng ? (
                    <a
                      href={getDirectionsUrl(hospital)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={styles.directionsButton}
                      className="btn-3d"
                    >
                      <Navigation size={16} />
                      {windowWidth > 480 && <span>Directions</span>}
                      <ChevronRight size={16} style={styles.buttonIcon} />
                    </a>
                  ) : (
                    <button
                      style={{ ...styles.directionsButton, opacity: 0.5, cursor: 'not-allowed', padding: windowWidth <= 480 ? '12px' : '12px 20px' }}
                      disabled
                    >
                      <Navigation size={16} />
                      {windowWidth > 480 && <span>Location unavailable</span>}
                    </button>
                  )}

                  {hospital.phone && hospital.phone !== "No phone listed" && (
                    <a
                      href={`tel:${hospital.phone}`}
                      style={styles.callButton}
                      className="btn-outline-3d"
                    >
                      <Phone size={16} />
                    </a>
                  )}
                </div>

                {/* Distance Progress Bar */}
                {hospital.distance && (
                  <div style={styles.distanceProgress}>
                    <div style={{
                      ...styles.progressBar,
                      width: `${Math.min(100, (hospital.distance / searchRadius) * 100)}%`,
                      backgroundColor: hospital.distance < 2 ? '#2ecc71' : hospital.distance < 5 ? '#f39c12' : '#e74c3c'
                    }}></div>
                  </div>
                )}

                {/* Hover Info */}
                {selectedHospital === hospital && closestHospital === hospital && windowWidth > 768 && (
                  <div style={styles.hoverInfo}>
                    <BadgeCheck size={16} color="#2ecc71" />
                    <span>Closest match • {hospital.distance}km away</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Live Updates Footer */}
        <div style={{
          ...styles.liveFooter,
          flexDirection: windowWidth <= 768 ? 'column' : 'row',
          alignItems: windowWidth <= 768 ? 'stretch' : 'center',
          padding: windowWidth <= 480 ? '12px' : '15px',
        }}>
          <div style={styles.liveUpdate}>
            <Wifi size={14} color={error ? "#e74c3c" : "#2ecc71"} />
            <span>{error ? 'Connection issues' : 'Live data active'}</span>
          </div>
          <div style={styles.batteryStatus}>
            <MapPin size={14} color="#7f8c8d" />
            <span>
              {userLoc
                ? `${userLoc.lat.toFixed(4)}, ${userLoc.lng.toFixed(4)}`
                : 'Location pending'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Add keyframe animations */}
      <style jsx="true">{`
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
        
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        
        .icon-3d:hover {
          transform: translateY(-2px);
          background: rgba(52,152,219,0.2);
          border-color: rgba(52,152,219,0.4);
        }
        
        .btn-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(52,152,219,0.3);
        }
        
        .btn-outline-3d:hover {
          transform: translateY(-2px);
          background: rgba(46,204,113,0.2);
          border-color: #2ecc71;
        }
        
        .feature-card-3d:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border-color: rgba(46,204,113,0.3);
        }
        
        .filter-button:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%)',
    color: '#ffffff',
    position: 'relative',
    overflowX: 'hidden',
    width: '100%',
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
    borderBottom: '1px solid rgba(46,204,113,0.2)',
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
    flexWrap: 'wrap',
    gap: '15px',
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
    background: 'radial-gradient(circle, rgba(46,204,113,0.2) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  logoText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flexWrap: 'wrap',
  },
  gpsSignal: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  gpsText: {
    fontSize: '14px',
    color: '#ffffff',
  },
  accuracyText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    marginLeft: '5px',
  },
  mapToggle: {
    background: 'rgba(52,152,219,0.1)',
    border: '1px solid rgba(52,152,219,0.3)',
    borderRadius: '12px',
    padding: '10px',
    color: '#3498db',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 10,
    width: '100%',
    boxSizing: 'border-box',
  },
  heroSection: {
    display: 'grid',
    marginBottom: '30px',
    width: '100%',
  },
  heroLeft: {},
  welcomeBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(46,204,113,0.1)',
    borderRadius: '30px',
    marginBottom: '20px',
    border: '1px solid rgba(46,204,113,0.3)',
    fontSize: '14px',
  },
  heroTitle: {
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '15px',
    lineHeight: '1.1',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '30px',
    lineHeight: '1.6',
    maxWidth: '500px',
  },
  quickStats: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    width: '100%',
  },
  quickStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    flex: '1 1 auto',
    minWidth: '120px',
  },
  quickStatValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    display: 'block',
  },
  quickStatLabel: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
  },
  heroRight: {},
  mapPreview: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '20px',
    padding: '15px',
    border: '1px solid rgba(255,255,255,0.1)',
    transition: 'all 0.3s ease',
  },
  mapPreviewExpanded: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    height: '80vh',
    zIndex: 1000,
    background: '#0a0f1c',
  },
  mapHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  mapTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px',
    color: '#3498db',
  },
  expandButton: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '5px',
    color: '#ffffff',
    cursor: 'pointer',
  },
  mapContainer: {
    position: 'relative',
    width: '100%',
    height: '200px',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  mapLegend: {
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(5px)',
    padding: '8px 12px',
    borderRadius: '8px',
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  searchBar: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    marginBottom: '30px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    width: '100%',
    boxSizing: 'border-box',
  },
  radiusControl: {
    flex: 1,
    minWidth: '200px',
  },
  radiusLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#ffffff',
    marginBottom: '10px',
  },
  radiusSlider: {
    width: '100%',
    height: '4px',
    borderRadius: '2px',
    background: 'rgba(255,255,255,0.1)',
    outline: 'none',
    cursor: 'pointer',
  },
  filterControls: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: window.innerWidth < 480 ? 1 : 'auto',
    justifyContent: 'center',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '30px',
  },
  loadingSpinner: {
    animation: 'rotate 2s linear infinite',
    marginBottom: '20px',
  },
  spinnerIcon: {
    margin: '0 auto',
  },
  loadingText: {
    fontSize: '18px',
    color: '#ffffff',
    marginBottom: '20px',
  },
  loadingProgress: {
    width: '200px',
    height: '4px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '2px',
    margin: '0 auto',
    overflow: 'hidden',
  },
  loadingBar: {
    width: '60%',
    height: '100%',
    background: 'linear-gradient(90deg, #2ecc71, #3498db)',
    animation: 'loading 1.5s ease-in-out infinite',
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(231,76,60,0.1)',
    borderRadius: '30px',
    border: '1px solid rgba(231,76,60,0.3)',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: '10px',
  },
  errorText: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '20px',
    maxWidth: '400px',
    margin: '0 auto 20px',
  },
  retryButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    borderRadius: '12px',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    margin: '0 auto',
    transition: 'all 0.3s ease',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '30px',
    border: '2px dashed rgba(255,255,255,0.1)',
  },
  emptyStateIcon: {
    marginBottom: '20px',
  },
  emptyStateTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '10px',
  },
  emptyStateText: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '20px',
  },
  hospitalsGrid: {
    display: 'grid',
    gap: '20px',
    width: '100%',
  },
  hospitalCard: {
    background: 'rgba(255,255,255,0.03)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.05)',
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.3s ease',
    width: '100%',
  },
  hospitalStatus: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
  },
  hospitalHeader: {
    padding: '20px',
    display: 'flex',
    gap: '15px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    flexWrap: 'wrap',
  },
  hospitalIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    background: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  hospitalTitle: {
    flex: 1,
    minWidth: '150px',
  },
  hospitalName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '8px',
  },
  hospitalBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  emergencyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: 'rgba(231,76,60,0.1)',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#e74c3c',
  },
  ambulanceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: 'rgba(52,152,219,0.1)',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#3498db',
  },
  hoursBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: 'rgba(46,204,113,0.1)',
    borderRadius: '6px',
    fontSize: '11px',
    color: '#2ecc71',
  },
  distanceBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    background: 'rgba(52,152,219,0.1)',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#3498db',
    alignSelf: 'flex-start',
  },
  hospitalDetails: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.7)',
  },
  detailText: {
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  waitTimeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#f39c12',
    marginTop: '5px',
  },
  servicesList: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '5px',
  },
  serviceTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.8)',
  },
  moreServices: {
    padding: '4px 8px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '6px',
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
  },
  hospitalActions: {
    display: 'flex',
    gap: '10px',
    padding: '0 20px 20px',
  },
  directionsButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'linear-gradient(135deg, #3498db, #2980b9)',
    borderRadius: '12px',
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  buttonIcon: {
    transition: 'transform 0.3s ease',
  },
  callButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    background: 'rgba(46,204,113,0.1)',
    border: '1px solid rgba(46,204,113,0.3)',
    borderRadius: '12px',
    color: '#2ecc71',
    textDecoration: 'none',
    width: '48px',
    transition: 'all 0.3s ease',
  },
  distanceProgress: {
    height: '3px',
    background: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  hoverInfo: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    background: 'rgba(46,204,113,0.1)',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#2ecc71',
    border: '1px solid rgba(46,204,113,0.3)',
    backdropFilter: 'blur(10px)',
  },
  liveFooter: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '15px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.05)',
    width: '100%',
    boxSizing: 'border-box',
  },
  liveUpdate: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: '#2ecc71',
  },
  batteryStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'rgba(255,255,255,0.5)',
    wordBreak: 'break-all',
  },
};

export default Hospitals;