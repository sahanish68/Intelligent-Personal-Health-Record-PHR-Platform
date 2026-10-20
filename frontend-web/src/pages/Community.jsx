import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Users, ShieldCheck, Lock, Camera, Phone,
  MessageSquare, HeartPulse, Activity, AlertCircle, Send, Paperclip
} from 'lucide-react';
import '../App.css';

// Connect to the Backend WebSocket Server
const socket = io(import.meta.env.VITE_BACKEND_MAIN_URL);

function Community() {
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [userData, setUserData] = useState(null);

  // Verification Form State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chat State
  const [activeChannel, setActiveChannel] = useState('Blood-Donation');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const messagesEndRef = useRef(null);

  const userId = localStorage.getItem('userId') || "test-user-id";

  // --- 1. CHECK VERIFICATION ON LOAD ---
  useEffect(() => {
    const checkVerification = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/community/check-verification/${userId}`);
        setIsVerified(response.data.isVerified);
        setUserData(response.data.userData); // We need this for the chat ID card!
        setLoading(false);
      } catch (error) {
        console.error("Verification check failed:", error);
        setLoading(false);
      }
    };
    checkVerification();
  }, [userId]);

  // --- 2. SOCKET.IO REAL-TIME LOGIC ---
  useEffect(() => {
    if (isVerified) {
      // Tell the server we want to join this specific room
      socket.emit('join_channel', activeChannel);

      // Listen for the chat history from MongoDB
      socket.on('receive_history', (history) => {
        setMessages(history);
        scrollToBottom();
      });

      // Listen for brand new messages broadcasted by other users
      socket.on('receive_message', (newMsg) => {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      });

      return () => {
        socket.off('receive_history');
        socket.off('receive_message');
      };
    }
  }, [isVerified, activeChannel]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // --- 3. VERIFICATION SUBMIT ---
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/community/verify-profile`, {
        userId, phoneNumber, profilePhotoUrl
      });
      if (response.data.isVerified) {
        window.location.reload(); // Reload to fetch user data properly
      }
    } catch (error) {
      console.error("Failed to verify", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 4. IMAGE UPLOAD HANDLER ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result); // Save as Base64 string
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 5. SEND REAL-TIME MESSAGE ---
  const sendMessage = () => {
    if (currentMessage.trim() === '' && !proofImage) return;

    const messageData = {
      channel: activeChannel,
      userId: userId,
      name: userData.name || "Anonymous",
      email: userData.email || "No Email",
      profilePhoto: userData.profilePhoto || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      text: currentMessage,
      proofImage: proofImage // Optional image proof
    };

    // Send to WebSocket Server
    socket.emit('send_message', messageData);

    // Clear inputs
    setCurrentMessage('');
    setProofImage(null);
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Community Engine...</div>;
  }

  // ==========================================
  // VIEW A: THE SECURITY GATEKEEPER
  // ==========================================
  if (!isVerified) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '50px auto', padding: '40px', background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '20px', color: 'white', boxShadow: '0 15px 35px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'inline-block', backgroundColor: 'rgba(231, 76, 60, 0.1)', padding: '20px', borderRadius: '50%', marginBottom: '15px' }}>
            <Lock size={48} color="#e74c3c" />
          </div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>Community Locked</h1>
          <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
            You must complete your verified profile before entering the community chat.
          </p>
        </div>

        <form onSubmit={handleVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: '#cbd5e1', marginBottom: '8px', fontWeight: 'bold' }}><Phone size={18} /> Phone Number</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '16px' }} required />
          </div>
          <div>
            <label style={{ color: '#cbd5e1', marginBottom: '8px', fontWeight: 'bold' }}><Camera size={18} /> Profile Photo URL</label>
            <input type="url" placeholder="https://..." value={profilePhotoUrl} onChange={(e) => setProfilePhotoUrl(e.target.value)} style={{ width: '100%', padding: '15px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '16px' }} required />
          </div>
          <button type="submit" disabled={isSubmitting} style={{ padding: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isSubmitting ? "Verifying..." : "Unlock Community"}
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // VIEW B: THE SECURE COMMUNITY DASHBOARD
  // ==========================================
  return (
    <div className="animate-fade-in" style={{ display: 'flex', height: '80vh', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#0f172a', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>

      {/* LEFT SIDEBAR: Channels */}
      <div style={{ width: '300px', backgroundColor: '#1e293b', padding: '20px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 30px 0', fontSize: '20px' }}>
          <Users size={24} color="#3b82f6" /> Verified Network
        </h2>

        <div style={{ flex: 1 }}>
          <p style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '15px' }}>EMERGENCY CHANNELS</p>

          <button onClick={() => setActiveChannel('Blood-Donation')} style={{ width: '100%', textAlign: 'left', padding: '12px 15px', borderRadius: '10px', backgroundColor: activeChannel === 'Blood-Donation' ? 'rgba(239, 68, 68, 0.1)' : 'transparent', color: activeChannel === 'Blood-Donation' ? '#ef4444' : '#cbd5e1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
            <HeartPulse size={18} /> # Blood-Donation
          </button>

          <button onClick={() => setActiveChannel('Organ-Transplant')} style={{ width: '100%', textAlign: 'left', padding: '12px 15px', borderRadius: '10px', backgroundColor: activeChannel === 'Organ-Transplant' ? 'rgba(168, 85, 247, 0.1)' : 'transparent', color: activeChannel === 'Organ-Transplant' ? '#a855f7' : '#cbd5e1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontWeight: 'bold' }}>
            <Activity size={18} /> # Organ-Transplant
          </button>

          <button onClick={() => setActiveChannel('General-Advice')} style={{ width: '100%', textAlign: 'left', padding: '12px 15px', borderRadius: '10px', backgroundColor: activeChannel === 'General-Advice' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeChannel === 'General-Advice' ? '#3b82f6' : '#cbd5e1', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
            <MessageSquare size={18} /> # General-Advice
          </button>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={userData?.profilePhoto} alt="profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <p style={{ margin: 0, color: 'white', fontSize: '14px', fontWeight: 'bold' }}>{userData?.name}</p>
            <p style={{ margin: 0, color: '#10b981', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '3px' }}><ShieldCheck size={12} /> Verified</p>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN AREA: Chat Interface */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a' }}>

        {/* Chat Header */}
        <div style={{ padding: '20px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '24px' }}># {activeChannel}</h2>
        </div>

        {/* --- REAL-TIME CHAT FEED --- */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', margin: 'auto', color: '#64748b' }}>
              <MessageSquare size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
              <h3>Welcome to #{activeChannel}</h3>
              <p>Be the first to request or offer help.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '15px', backgroundColor: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Profile Card UI (Automated per user request) */}
              <div style={{ flexShrink: 0 }}>
                <img src={msg.profilePhoto} alt="user" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3b82f6' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{msg.name}</span>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>{msg.email}</span>
                  <span style={{ color: '#64748b', fontSize: '12px', marginLeft: 'auto' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p style={{ margin: '0 0 10px 0', color: '#cbd5e1', lineHeight: '1.5' }}>{msg.text}</p>

                {/* Proof Image Display */}
                {msg.proofImage && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <AlertCircle size={14} /> Medical Proof Attached
                    </p>
                    <img src={msg.proofImage} alt="Medical Proof" style={{ maxWidth: '300px', maxHeight: '200px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* --- CHAT INPUT & PROOF UPLOAD --- */}
        <div style={{ padding: '20px 30px', backgroundColor: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

          {/* Preview selected image before sending */}
          {proofImage && (
            <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={proofImage} alt="preview" style={{ height: '50px', borderRadius: '5px' }} />
              <button onClick={() => setProofImage(null)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Remove Proof</button>
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>

            {/* Upload Proof Button */}
            <label style={{ cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
              <Paperclip size={24} />
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>

            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null}
              placeholder={`Post in #${activeChannel}...`}
              style={{ flex: 1, padding: '15px 20px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '16px' }}
            />

            <button onClick={sendMessage} style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '0 25px', height: '50px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={20} />
            </button>
          </div>
        </div>

      </div>
      <style jsx="true">{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}

export default Community;