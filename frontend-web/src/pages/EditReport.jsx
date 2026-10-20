import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Save, ArrowLeft, Edit3, Activity } from 'lucide-react';
import '../App.css';

function EditReport() {
  const { id } = useParams(); // Grabs the report ID from the URL!
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch the existing report data when the page loads
  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reports/${id}`);
        setReportData(response.data);
      } catch (error) {
        console.error("Error fetching report:", error);
        alert("Could not load report data.");
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReportData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await axios.put(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reports/${id}`, reportData);
      alert("Report successfully updated!");
      navigate('/dashboard');
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Failed to update report.");
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Activity size={48} color="#3498db" className="spinner" style={{ animation: 'spin 2s linear infinite' }} />
        <p style={{ color: '#7f8c8d', marginTop: '20px' }}>Loading record...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2c3e50', margin: 0 }}>
          <Edit3 color="#f39c12" /> Edit Medical Record
        </h1>
        <Link to="/dashboard" style={{ textDecoration: 'none', color: '#3498db', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
          <ArrowLeft size={18} /> Back to Vault
        </Link>
      </div>

      <div style={{ padding: '30px', border: '1px solid #ecf0f1', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
        <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '25px' }}>
          Make changes to your AI-extracted medical record below. These changes will permanently overwrite the current data in your vault.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>DIAGNOSIS / DISEASE</label>
            <input type="text" name="diseaseName" value={reportData.diseaseName || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>DATE OF VISIT</label>
            <input type="text" name="visitDate" value={reportData.visitDate || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>DOCTOR NAME</label>
            <input type="text" name="doctorName" value={reportData.doctorName || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>HOSPITAL / CLINIC</label>
            <input type="text" name="hospitalName" value={reportData.hospitalName || ''} onChange={handleInputChange} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' }}>AI PATIENT SUMMARY</label>
            <textarea name="extractedText" value={reportData.extractedText || ''} onChange={handleInputChange} rows="4" style={{ padding: '10px', borderRadius: '6px', border: '1px solid #bdc3c7', outline: 'none', resize: 'vertical', lineHeight: '1.5' }} />
          </div>
        </div>

        <button
          onClick={handleUpdate}
          disabled={isSaving}
          style={{ padding: '15px 20px', backgroundColor: isSaving ? '#95a5a6' : '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: isSaving ? 'default' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', fontWeight: 'bold', transition: '0.2s' }}
        >
          <Save size={20} />
          {isSaving ? "Updating Record..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

export default EditReport;