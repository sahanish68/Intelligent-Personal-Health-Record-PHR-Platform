import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, Clock, Calendar, CheckCircle, Activity, Trash2 } from 'lucide-react';
import '../App.css';

function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reminders/user/${userId}`);
      setReminders(response.data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reminders/${id}`);
      // Remove it from the screen immediately
      setReminders(reminders.filter(rem => rem._id !== id));
    } catch (error) {
      console.error("Error deleting reminder:", error);
      alert("Failed to delete reminder.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ backgroundColor: '#fdf2e9', padding: '15px', borderRadius: '50%' }}>
          <Bell color="#e67e22" size={32} />
        </div>
        <div>
          <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>Active Prescriptions</h1>
          <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>
            Your AI-automated medication schedule.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Activity size={40} color="#e67e22" className="spinner" style={{ margin: '0 auto', animation: 'spin 2s linear infinite' }} />
          <p style={{ color: '#95a5a6', marginTop: '15px' }}>Loading your schedule...</p>
        </div>
      ) : reminders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px', border: '2px dashed #bdc3c7' }}>
          <CheckCircle size={48} color="#2ecc71" style={{ margin: '0 auto 15px' }} />
          <h3 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>No Active Alarms</h3>
          <p style={{ color: '#7f8c8d', fontSize: '16px', margin: 0 }}>You have no medications scheduled. Stay healthy!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {reminders.map((reminder) => {
            // Calculate how many days are left
            const start = new Date(reminder.startDate);
            const now = new Date();
            const diffTime = Math.abs(now - start);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const daysLeft = reminder.durationInDays - diffDays;
            const isCompleted = daysLeft <= 0;

            return (
              <div key={reminder._id} style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', borderTop: isCompleted ? '4px solid #95a5a6' : '4px solid #e67e22', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', opacity: isCompleted ? 0.7 : 1 }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: isCompleted ? '#7f8c8d' : '#d35400', fontSize: '20px', fontWeight: '800' }}>
                    {reminder.medicineName}
                  </h3>
                  <button onClick={() => handleDelete(reminder._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', padding: '5px' }} title="Stop/Delete Reminder">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#34495e', fontSize: '15px', marginBottom: '20px', flexGrow: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <Clock size={16} color="#3498db" />
                    <span>{reminder.frequency}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} color="#2ecc71" />
                    <span>Total Duration: {reminder.durationInDays} days</span>
                  </div>
                </div>

                <div style={{ backgroundColor: isCompleted ? '#f1f2f6' : '#fdf2e9', padding: '12px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold', color: isCompleted ? '#7f8c8d' : '#e67e22', fontSize: '14px' }}>
                  {isCompleted ? "Course Completed 🎉" : `${daysLeft} Days Remaining`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Reminders;