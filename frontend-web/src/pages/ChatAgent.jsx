import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Activity, Bot, ShieldCheck } from 'lucide-react';
import '../App.css';

function ChatAgent() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hello! I am connected to the Gemini AI and your SmartPHR Vault. Ask me anything about your health or your past medical reports!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [patientContext, setPatientContext] = useState("No medical history loaded yet.");

  const userId = localStorage.getItem('userId');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages]);

  // Fetch the patient's context to feed to Gemini
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const [reportsRes, medsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reports/user/${userId}`),
          axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reminders/user/${userId}`)
        ]);

        const reports = reportsRes.data;
        const meds = medsRes.data;

        let contextBuilder = `The patient's name is ${localStorage.getItem('userName')}. `;

        if (reports.length > 0) {
          const conditions = [...new Set(reports.map(r => r.diseaseName))].filter(Boolean).join(", ");
          contextBuilder += `Past Diagnoses: ${conditions || 'None recorded'}. `;
        } else {
          contextBuilder += `Past Diagnoses: None on file. `;
        }

        if (meds.length > 0) {
          const activeMeds = meds.map(m => m.medicineName).join(", ");
          contextBuilder += `Currently taking medications: ${activeMeds}. `;
        } else {
          contextBuilder += `Currently taking medications: None. `;
        }

        console.log("🔒 Compiled Patient Context for AI:", contextBuilder);
        setPatientContext(contextBuilder);
      } catch (error) {
        console.error("Could not load context", error);
        setPatientContext("Error loading medical history.");
      }
    };

    if (userId) fetchPatientData();
  }, [userId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      console.log("🚀 Sending to Gemini Python Server:", { message: userMessage.text, patient_context: patientContext });

      // THIS is where it talks to your Python server and Gemini!
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_AI_URL}/chat`, {
        message: userMessage.text,
        patient_context: patientContext
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.data.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Server Error: Could not reach the Python Gemini API." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#111827', padding: '20px 30px', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ backgroundColor: '#3498db', padding: '12px', borderRadius: '50%' }}>
          <Bot color="white" size={28} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: 'white', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            SmartPHR Intelligence <ShieldCheck size={18} color="#2ecc71" />
          </h2>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>Powered by Gemini AI</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flexGrow: 1, backgroundColor: '#f9fafb', padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '25px', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: '15px' }}>
            <div style={{ backgroundColor: msg.role === 'user' ? '#2c3e50' : '#3498db', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {msg.role === 'user' ? <User color="white" size={20} /> : <Activity color="white" size={20} />}
            </div>
            <div style={{ backgroundColor: msg.role === 'user' ? '#2c3e50' : 'white', color: msg.role === 'user' ? 'white' : '#1f2937', padding: '18px 22px', borderRadius: msg.role === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0', maxWidth: '80%', lineHeight: '1.6', fontSize: '15px', border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb', whiteSpace: 'pre-wrap' }}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
            <div style={{ backgroundColor: '#3498db', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Bot color="white" size={20} /></div>
            <div style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '20px 20px 20px 0', color: '#9ca3af', fontStyle: 'italic', border: '1px solid #e5e7eb' }}>Analyzing vault...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '0 0 12px 12px', borderTop: '1px solid #e5e7eb', borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
        <form onSubmit={handleSend} style={{ display: 'flex', gap: '15px' }}>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="E.g., What conditions have I been diagnosed with?" disabled={isLoading} style={{ flexGrow: 1, padding: '16px 20px', borderRadius: '30px', border: '2px solid #e5e7eb', fontSize: '16px', outline: 'none' }} />
          <button type="submit" disabled={isLoading || !input.trim()} style={{ backgroundColor: isLoading || !input.trim() ? '#9ca3af' : '#3498db', color: 'white', border: 'none', borderRadius: '30px', padding: '0 25px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '16px', cursor: isLoading || !input.trim() ? 'default' : 'pointer' }}>
            Send <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatAgent;