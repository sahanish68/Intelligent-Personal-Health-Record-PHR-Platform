import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, Clock, Calendar, CheckCircle, XCircle, Edit3 } from 'lucide-react';

function ConfirmReminders() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  // We grab the medicines that Scanner.jsx passed to us through the router!
  const initialMedicines = location.state?.medicines || [];

  // Put them in a state so the user can edit them
  const [medicines, setMedicines] = useState(initialMedicines);
  const [isSaving, setIsSaving] = useState(false);

  // If there are no medicines, redirect to dashboard
  if (initialMedicines.length === 0) {
    navigate('/dashboard');
    return null;
  }

  const handleEdit = (index, field, value) => {
    const updatedMeds = [...medicines];
    updatedMeds[index][field] = value;
    setMedicines(updatedMeds);
  };

  const removeMedicine = (index) => {
    const updatedMeds = medicines.filter((_, i) => i !== index);
    setMedicines(updatedMeds);
  };

  const handleConfirmAndSave = async () => {
    if (medicines.length === 0) {
      navigate('/reminders');
      return;
    }

    setIsSaving(true);
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reminders/add-bulk`, {
        userId: userId,
        medicines: medicines
      });
      alert("✅ Reminders successfully set!");
      navigate('/reminders'); // Take them to see their new active alarms
    } catch (error) {
      console.error("Failed to set alarms.", error);
      alert("Failed to save reminders. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>

      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', borderTop: '5px solid #e67e22' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ backgroundColor: '#fdf2e9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
            <Bell color="#e67e22" size={32} />
          </div>
          <h1 style={{ color: '#2c3e50', margin: '0 0 10px 0' }}>Confirm Medication Alarms</h1>
          <p style={{ color: '#7f8c8d', margin: 0 }}>
            The AI detected these prescriptions. Please review, edit, or remove them before we set your daily alarms.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
          {medicines.map((med, index) => (
            <div key={index} style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '10px', border: '1px solid #ecf0f1', position: 'relative' }}>

              <button
                onClick={() => removeMedicine(index)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold' }}
              >
                <XCircle size={16} /> Remove Alarm
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d', display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <Edit3 size={14} /> MEDICINE NAME
                  </label>
                  <input
                    type="text"
                    value={med.name || ''}
                    onChange={(e) => handleEdit(index, 'name', e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', marginTop: '5px', outline: 'none', fontWeight: 'bold', color: '#2c3e50' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d', display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <Clock size={14} /> FREQUENCY
                  </label>
                  <input
                    type="text"
                    value={med.frequency || ''}
                    onChange={(e) => handleEdit(index, 'frequency', e.target.value)}
                    placeholder="e.g. Twice a day"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', marginTop: '5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d', display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <Calendar size={14} /> DURATION (DAYS)
                  </label>
                  <input
                    type="number"
                    value={med.durationInDays || 7}
                    onChange={(e) => handleEdit(index, 'durationInDays', parseInt(e.target.value))}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', marginTop: '5px', outline: 'none' }}
                  />
                </div>

              </div>
            </div>
          ))}

          {medicines.length === 0 && (
            <p style={{ textAlign: 'center', color: '#e74c3c', fontWeight: 'bold' }}>All alarms removed. No reminders will be set.</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ flex: 1, padding: '15px', backgroundColor: '#ecf0f1', color: '#7f8c8d', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Skip Reminders
          </button>

          <button
            onClick={handleConfirmAndSave}
            disabled={isSaving || medicines.length === 0}
            style={{ flex: 2, padding: '15px', backgroundColor: medicines.length === 0 ? '#bdc3c7' : '#e67e22', color: 'white', border: 'none', borderRadius: '8px', cursor: medicines.length === 0 ? 'default' : 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <CheckCircle size={20} />
            {isSaving ? "Setting Alarms..." : "Confirm & Set Alarms"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmReminders;