import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Watch, Bluetooth, HeartPulse, Footprints, Droplet,
  Moon, BellRing, Activity, CheckCircle, RefreshCw, AlertTriangle, Clock
} from 'lucide-react';
import '../App.css';

function DeviceHealth() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastSynced, setLastSynced] = useState(null);
  const [activeReminders, setActiveReminders] = useState([]);
  const [schedulerActive, setSchedulerActive] = useState(false);

  // Vitals now start empty and will be filled by REAL data from your DB
  const [vitals, setVitals] = useState({
    heartRate: '--',
    steps: '--',
    spO2: '--',
    sleep: '--'
  });

  const userId = localStorage.getItem('userId') || "test-user-id";

  // --- 1. INITIAL LOAD: Fetch Vitals and Reminders ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reminders for the watch
        const remindersRes = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reminders/user/${userId}`);
        setActiveReminders(remindersRes.data);

        // Fetch the LATEST real vitals synced from Google Fit
        const vitalsRes = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/device/user/${userId}`);
        if (vitalsRes.data && vitalsRes.data.length > 0) {
          const latest = vitalsRes.data[0]; // Get the most recent sync
          setVitals({
            heartRate: latest.heartRate,
            steps: latest.steps,
            spO2: latest.spO2,
            sleep: latest.sleep
          });
          setLastSynced(new Date(latest.syncDate).toLocaleTimeString());
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    // Check if we just returned from a successful Google Login
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success') {
      alert("✅ Smartwatch successfully linked via Google Fit!");
      // Clean the URL
      window.history.replaceState({}, document.title, "/device-health");
    }
  }, [userId]);

  // --- 2. REAL AUTH: Redirect to Google Login ---
  const handleConnectWatch = async () => {
    setIsConnecting(true);
    try {
      // Step A: Get the Google Auth URL from our Node.js backend
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/device/google/auth?userId=${userId}`);

      // Step B: Redirect the entire browser to Google's secure login
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Failed to start Google Auth:", error);
      setIsConnecting(false);
      alert("Could not connect to the Auth server. Check if Node.js is running.");
    }
  };

  // --- 3. AUTOMATED BACKGROUND ENGINE ---

  // Logic to translate "1-0-1" or "dinner" into 24-hour clock times
  const getTriggerHours = (frequency) => {
    const hours = [];
    const freq = frequency ? frequency.toLowerCase() : "";

    // Morning / Breakfast
    if (freq.includes('1-') || freq.includes('morning') || freq.includes('breakfast')) hours.push(9); // 9:00 AM
    // Afternoon / Lunch
    if (freq.includes('-1-') || freq.includes('lunch') || freq.includes('afternoon')) hours.push(14); // 2:00 PM
    // Night / Dinner
    if (freq.includes('-1') || freq.includes('night') || freq.includes('dinner')) hours.push(20); // 8:00 PM

    // Default fallback
    if (hours.length === 0) hours.push(9);
    return hours;
  };

  // The function that actually triggers the OS notification to the watch
  const triggerWatchNotification = (medicineName, instructions) => {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(`💊 Medication Time: ${medicineName}`, {
        body: `It's time to take your medicine. (${instructions})`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
        vibrate: [300, 100, 300, 100, 300] // Aggressive vibration pattern for watch
      });
      setTimeout(() => notification.close(), 15000);
    }
  };

  // Turns on the scheduler and fires a TEST BUZZ immediately
  const activateScheduler = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    let permission = Notification.permission;
    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }

    if (permission === "granted") {
      setSchedulerActive(true);

      // 🔥 IMMEDIATE TEST BUZZ SO YOU CAN FEEL IT RIGHT NOW
      const testNotif = new Notification(`⚙️ SmartPHR Engine Active`, {
        body: `Your watch is connected! Automated alarms are now running in the background.`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png',
        vibrate: [200, 100, 200]
      });
      setTimeout(() => testNotif.close(), 8000);

    } else {
      alert("❌ You denied notification permissions. We cannot buzz your watch.");
    }
  };

  // The Cron Job: This loop checks the clock every 60 seconds
  useEffect(() => {
    if (!schedulerActive || activeReminders.length === 0) return;

    const timer = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Only trigger exactly at the top of the hour (e.g., exactly 20:00 for 8 PM)
      if (currentMinute === 0) {
        activeReminders.forEach(med => {
          const scheduledHours = getTriggerHours(med.frequency);
          if (scheduledHours.includes(currentHour)) {
            triggerWatchNotification(med.medicineName, med.frequency);
          }
        });
      }
    }, 60000); // Check every 60,000 milliseconds (1 minute)

    return () => clearInterval(timer);
  }, [schedulerActive, activeReminders]);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px', fontFamily: 'sans-serif', color: 'white' }}>

      {/* Header Section */}
      <div style={{ background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)', padding: '40px', borderRadius: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '20px', borderRadius: '50%' }}>
            <Watch size={48} color="white" />
          </div>
          <div>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>Real-Time Device Health</h1>
            <p style={{ margin: 0, fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>
              Connected to Fire-Boltt / Fastrack via Google Fit Cloud Bridge.
            </p>
          </div>
        </div>

        <button
          onClick={handleConnectWatch}
          disabled={isConnecting}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '15px 25px',
            backgroundColor: isConnected ? 'rgba(46, 204, 113, 0.2)' : '#fff',
            color: isConnected ? '#2ecc71' : '#b21f1f',
            border: isConnected ? '2px solid #2ecc71' : 'none',
            borderRadius: '12px', fontWeight: 'bold', fontSize: '16px',
            cursor: isConnecting ? 'default' : 'pointer',
            transition: 'all 0.3s'
          }}
        >
          {isConnecting ? <RefreshCw size={20} className="spinner" /> : isConnected ? <CheckCircle size={20} /> : <Bluetooth size={20} />}
          {isConnecting ? "Redirecting..." : isConnected ? "Watch Synced" : "Connect via Google Fit"}
        </button>
      </div>

      {/* Live Vitals Grid */}
      <h2 style={{ color: '#ecf0f1', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Activity size={24} color="#e74c3c" /> Live Sensor Data from Watch
        {lastSynced && <span style={{ fontSize: '12px', color: '#7f8c8d', fontWeight: 'normal', marginLeft: 'auto' }}>Last Cloud Sync: {lastSynced}</span>}
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <HeartPulse size={32} color="#e74c3c" style={{ margin: '0 auto 15px' }} />
          <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '12px', fontWeight: 'bold' }}>HEART RATE</p>
          <h3 style={{ margin: 0, fontSize: '32px', color: '#fff' }}>{vitals.heartRate} <span style={{ fontSize: '14px', color: '#7f8c8d' }}>bpm</span></h3>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <Footprints size={32} color="#2ecc71" style={{ margin: '0 auto 15px' }} />
          <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '12px', fontWeight: 'bold' }}>REAL STEPS</p>
          <h3 style={{ margin: 0, fontSize: '32px', color: '#fff' }}>{vitals.steps}</h3>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <Droplet size={32} color="#3498db" style={{ margin: '0 auto 15px' }} />
          <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '12px', fontWeight: 'bold' }}>BLOOD OXYGEN</p>
          <h3 style={{ margin: 0, fontSize: '32px', color: '#fff' }}>{vitals.spO2}</h3>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <Moon size={32} color="#9b59b6" style={{ margin: '0 auto 15px' }} />
          <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '12px', fontWeight: 'bold' }}>SLEEP STATUS</p>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{vitals.sleep}</h3>
        </div>

      </div>

      {/* Watch Reminders Sync Section */}
      <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.05)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(46, 204, 113, 0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>

          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 15px 0' }}>
              <Clock size={24} /> Automated Smartwatch Scheduler
            </h2>
            <p style={{ color: '#bdc3c7', margin: '0 0 20px 0', lineHeight: '1.6' }}>
              Turn this on, and the AI will automatically trigger your watch to vibrate at the correct times based on your active prescriptions.
            </p>

            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#7f8c8d', fontWeight: 'bold' }}>QUEUED ALARMS:</p>
              {activeReminders.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#ecf0f1' }}>
                  {activeReminders.map((med, idx) => {
                    const hours = getTriggerHours(med.frequency);
                    const times = hours.map(h => h === 9 ? '9:00 AM' : h === 14 ? '2:00 PM' : '8:00 PM').join(', ');
                    return (
                      <li key={idx} style={{ marginBottom: '5px', fontSize: '14px' }}>
                        {med.medicineName} — <strong style={{ color: '#f39c12' }}>Rings at {times}</strong>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p style={{ margin: 0, color: '#e74c3c', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <AlertTriangle size={16} /> No active prescriptions found in your vault.
                </p>
              )}
            </div>

            <button
              onClick={activateScheduler}
              disabled={schedulerActive || activeReminders.length === 0}
              style={{
                padding: '15px 30px',
                backgroundColor: schedulerActive ? '#27ae60' : '#2ecc71',
                color: 'white', border: 'none', borderRadius: '12px',
                fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px',
                cursor: schedulerActive || activeReminders.length === 0 ? 'default' : 'pointer',
                transition: '0.2s'
              }}
            >
              {schedulerActive ? <CheckCircle size={20} /> : <BellRing size={20} />}
              {schedulerActive ? "Engine is Running in Background..." : "Start Automated Alarms"}
            </button>
            <p style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '10px' }}>
              * Ensure your phone screen is locked to feel the vibration on your smartwatch.
            </p>
          </div>

        </div>
      </div>

      <style jsx="true">{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

export default DeviceHealth;