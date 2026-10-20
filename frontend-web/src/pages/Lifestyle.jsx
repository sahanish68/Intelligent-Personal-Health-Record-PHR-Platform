import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, Apple, Dumbbell, AlertTriangle, CheckCircle, Flame, HeartPulse, Coffee } from 'lucide-react';
import '../App.css';

function Lifestyle() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    generatePlan();
  }, []);

  const generatePlan = async () => {
    try {
      // 1. Fetch all the user's past reports
      const reportsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reports/user/${userId}`);
      const reports = reportsResponse.data;

      if (reports.length === 0) {
        setError("You need to upload at least one medical report before the AI can generate a custom lifestyle plan!");
        setLoading(false);
        return;
      }

      // 2. Compile their history into a text string
      const historyString = reports.map(r => `Diagnosis: ${r.diseaseName}, Medicines: ${r.medicines?.map(m => m.name).join(', ')}`).join(' | ');

      // 3. Send it to the Python AI Nutritionist
      const aiResponse = await axios.post(`${import.meta.env.VITE_BACKEND_AI_URL}/generate-lifestyle`, {
        medical_history: historyString
      });

      setPlan(aiResponse.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate your personalized plan. Please ensure the AI engine is running.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', color: 'white' }}>
        <Activity size={64} color="#2ecc71" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 20px' }} />
        <h2>Analyzing your medical history...</h2>
        <p style={{ color: '#7f8c8d' }}>Consulting our AI Nutritionist & Physical Therapist</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', color: 'white' }}>
        <AlertTriangle size={64} color="#e74c3c" style={{ margin: '0 auto 20px' }} />
        <h2>Cannot Generate Plan</h2>
        <p style={{ color: '#7f8c8d' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px', fontFamily: 'sans-serif', color: 'white' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #27ae60, #2ecc71)', padding: '40px', borderRadius: '20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(46, 204, 113, 0.2)' }}>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '50%' }}>
          <Apple size={48} color="white" />
        </div>
        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>Your AI Wellness Plan</h1>
          <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
            Tailored specifically for your unique medical profile.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '25px', borderRadius: '15px', marginBottom: '30px', borderLeft: '4px solid #3498db' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#3498db', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HeartPulse size={20} /> Clinical Assessment
        </h3>
        <p style={{ margin: 0, lineHeight: '1.6', color: '#bdc3c7' }}>{plan.healthAnalysis}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '40px' }}>

        {/* Do's and Don'ts */}
        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} /> Foods to Avoid
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plan.foodsToAvoid.map((food, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#bdc3c7' }}><XCircle size={16} color="#e74c3c" /> {food}</li>
            ))}
          </ul>
        </div>

        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '25px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#f1c40f', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} /> Superfoods For You
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {plan.superfoods.map((food, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#bdc3c7' }}><CheckCircle size={16} color="#f1c40f" /> {food}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Daily Diet Plan */}
      <h2 style={{ color: '#2ecc71', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Coffee size={24} /> Daily Meal Routine
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {plan.dailyDiet.map((meal, i) => (
          <div key={i} style={{ backgroundColor: 'rgba(46, 204, 113, 0.05)', border: '1px solid rgba(46, 204, 113, 0.2)', padding: '20px', borderRadius: '15px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#2ecc71', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>{meal.meal}</h3>
            <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', fontSize: '16px' }}>{meal.suggestion}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#95a5a6' }}><strong>Benefit:</strong> {meal.benefits}</p>
          </div>
        ))}
      </div>

      {/* Exercise Routine */}
      <h2 style={{ color: '#9b59b6', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Dumbbell size={24} /> Recommended Physical Therapy
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {plan.exercisePlan.map((ex, i) => (
          <div key={i} style={{ backgroundColor: 'rgba(155, 89, 182, 0.05)', border: '1px solid rgba(155, 89, 182, 0.2)', padding: '20px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#9b59b6' }}>{ex.activity}</h3>
              <p style={{ margin: 0, color: '#bdc3c7', fontSize: '14px' }}>{ex.frequency} • {ex.duration}</p>
            </div>
            <div style={{ backgroundColor: 'rgba(231, 76, 60, 0.1)', padding: '10px 15px', borderRadius: '8px', borderLeft: '3px solid #e74c3c', maxWidth: '300px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#e74c3c' }}><strong>Precaution:</strong> {ex.precautions}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

// Quick fallback for the XCircle icon missing above
const XCircle = ({ size, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

export default Lifestyle;