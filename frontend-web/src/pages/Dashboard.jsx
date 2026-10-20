import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  PlusCircle, Calendar, Building, ChevronDown, ChevronUp,
  Pill, Volume2, LogOut, ShieldCheck, CheckCircle, HelpCircle,
  Activity, FileText, Heart, Clock, Award, Zap, Cpu,
  Sparkles, BadgeCheck, User, Bell, Settings, Search,
  Download, Share2, Printer, BookOpen, Brain,
  Microscope, Stethoscope, Thermometer, AlertCircle, FileImage, Trash2, Edit, Globe
} from 'lucide-react';

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('all');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [stats, setStats] = useState({
    totalReports: 0, uniqueDoctors: 0, medications: 0, lastVisit: null
  });

  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(null);

  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!userId) return navigate('/');
    fetchReports();
  }, [userId, navigate]);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reports/user/${userId}`);
      setReports(response.data);

      const uniqueDocs = [...new Set(response.data.map(r => r.doctorName))].length;
      const meds = response.data.reduce((acc, r) => acc + (r.medicines?.length || 0), 0);
      const lastVisit = response.data.length > 0 ? new Date(Math.max(...response.data.map(r => new Date(r.visitDate)))) : null;

      setStats({ totalReports: response.data.length, uniqueDoctors: uniqueDocs, medications: meds, lastVisit });
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);
  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const handleTranslate = async (reportId, text) => {
    const selectElement = document.getElementById(`lang-${reportId}`);
    const targetLang = selectElement.value;

    if (targetLang === "English") {
      const newTranslations = { ...translations };
      delete newTranslations[reportId];
      setTranslations(newTranslations);
      return;
    }

    setIsTranslating(reportId);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_AI_URL}/translate`, {
        text: text,
        target_language: targetLang
      });
      setTranslations(prev => ({ ...prev, [reportId]: response.data.translatedText }));
    } catch (error) {
      alert("Failed to translate text. Check if Python server is running.");
    } finally {
      setIsTranslating(null);
    }
  };

  const chartData = [...reports]
    .filter(r => r.vitals && (r.vitals.heartRate || r.vitals.bloodSugar || r.vitals.temperature))
    .sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate))
    .map(r => ({
      date: new Date(r.visitDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      HeartRate: r.vitals.heartRate,
      BloodSugar: r.vitals.bloodSugar,
      Temperature: r.vitals.temperature
    }));

  const handleDownload = (report) => {
    const content = `MEDICAL REPORT\n\nDiagnosis: ${report.diseaseName}\nDoctor: ${report.doctorName}\nHospital: ${report.hospitalName}\nDate: ${new Date(report.visitDate).toLocaleDateString()}\n\nSUMMARY:\n${translations[report._id] || report.extractedText}\n\nACTION PLAN:\n${report.actionPlan?.join('\n') || 'None'}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `SmartPHR_${report.diseaseName}.txt`; a.click();
  };

  const handleShare = async (report) => {
    if (navigator.share) {
      try { await navigator.share({ title: `Medical Report: ${report.diseaseName}`, text: `Diagnosis: ${report.diseaseName}\nDoctor: Dr. ${report.doctorName}\nSummary: ${translations[report._id] || report.extractedText}` }); }
      catch (err) { console.log('User cancelled share', err); }
    } else { alert("Sharing not supported on this browser."); }
  };

  const handlePrint = (report) => {
    const printContent = `<div style="font-family: sans-serif; padding: 20px;"><h1>Medical Report: ${report.diseaseName}</h1><p><strong>Doctor:</strong> ${report.doctorName}</p><hr/><h3>Summary</h3><p>${translations[report._id] || report.extractedText}</p>${report.croppedScanUrl ? `<img src="${report.croppedScanUrl}" style="max-width: 400px;"/>` : ''}</div>`;
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printContent); printWindow.document.close();
    printWindow.focus(); printWindow.print(); printWindow.close();
  };

  const handleDelete = async (reportId) => {
    if (window.confirm("Delete this report permanently?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reports/${reportId}`);
        setReports(reports.filter(r => r._id !== reportId));
        setStats(prev => ({ ...prev, totalReports: prev.totalReports - 1 }));
      } catch (error) { alert("Failed to delete report."); }
    }
  };

  const handleEdit = (reportId) => navigate(`/edit/${reportId}`);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.diseaseName?.toLowerCase().includes(searchTerm.toLowerCase()) || report.hospitalName?.toLowerCase().includes(searchTerm.toLowerCase()) || report.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterDate === 'all') return matchesSearch;
    if (filterDate === 'month') {
      const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return matchesSearch && new Date(report.visitDate) >= oneMonthAgo;
    }
    if (filterDate === 'year') {
      const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return matchesSearch && new Date(report.visitDate) >= oneYearAgo;
    }
    return matchesSearch;
  });

  const groupedReports = filteredReports.reduce((acc, report) => {
    const date = new Date(report.visitDate);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(report);
    return acc;
  }, {});

  return (
    <div style={styles.container}>
      <div style={{ ...styles.header, padding: windowWidth <= 480 ? '10px 15px' : '15px 30px' }}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <div style={styles.logo}><ShieldCheck size={32} color="#3498db" /><span style={styles.logoText}>Smart<span style={{ color: '#3498db' }}>.Health</span></span></div>
          </div>
          <div style={styles.headerRight}>
            <button onClick={handleLogout} style={styles.logoutButton} className="btn-outline-3d"><LogOut size={18} /><span>Logout</span></button>
          </div>
        </div>
      </div>

      <div style={{ ...styles.statsGrid, gridTemplateColumns: windowWidth <= 768 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', padding: '20px 30px' }}>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}><FileText size={24} color="#3498db" /></div>
          <div style={styles.statInfo}><span style={styles.statValue}>{stats.totalReports}</span><span style={styles.statLabel}>Total Reports</span></div>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}><User size={24} color="#2ecc71" /></div>
          <div style={styles.statInfo}><span style={styles.statValue}>{stats.uniqueDoctors}</span><span style={styles.statLabel}>Providers</span></div>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}><Pill size={24} color="#e74c3c" /></div>
          <div style={styles.statInfo}><span style={styles.statValue}>{stats.medications}</span><span style={styles.statLabel}>Prescriptions</span></div>
        </div>
        <div style={styles.statCard} className="stat-card">
          <div style={styles.statIconContainer}><Calendar size={24} color="#9b59b6" /></div>
          <div style={styles.statInfo}><span style={{ ...styles.statValue, fontSize: '20px' }}>{stats.lastVisit ? new Date(stats.lastVisit).toLocaleDateString() : 'N/A'}</span><span style={styles.statLabel}>Last Visit</span></div>
        </div>
      </div>

      <div style={{ ...styles.mainContent, padding: '0 30px' }}>

        {chartData.length > 0 && (
          <div className="animate-fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px', padding: '25px', marginBottom: '40px', backdropFilter: 'blur(10px)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity color="#e74c3c" /> Health Trends
            </h3>
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#7f8c8d" />
                  <YAxis stroke="#7f8c8d" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                  <Line type="monotone" dataKey="HeartRate" name="Heart Rate (bpm)" stroke="#e74c3c" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="BloodSugar" name="Blood Sugar (mg/dL)" stroke="#3498db" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div style={{ ...styles.searchBar, flexDirection: windowWidth <= 768 ? 'column' : 'row' }}>
          <div style={styles.searchInputContainer}>
            <Search size={20} color="#7f8c8d" />
            <input type="text" placeholder="Search by condition or doctor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <Link to="/scan" style={styles.uploadButton} className="btn-3d"><PlusCircle size={18} /><span>Upload Report</span></Link>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}><Activity size={48} color="#3498db" style={{ animation: 'spin 2s linear infinite' }} /></div>
        ) : filteredReports.length === 0 ? (
          <div style={styles.emptyState}><h3>No Reports Found</h3></div>
        ) : (
          <div style={styles.timeline}>
            {Object.entries(groupedReports).map(([monthYear, monthReports]) => (
              <div key={monthYear} style={styles.timelineSection}>
                <div style={styles.timelineHeader}><div style={styles.timelineDot}></div><h3 style={styles.timelineMonth}>{monthYear}</h3><div style={styles.timelineLine}></div></div>

                <div style={{ ...styles.reportsGrid, gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(auto-fill, minmax(500px, 1fr))' }}>
                  {monthReports.map((report) => {
                    const isExpanded = expandedId === report._id;

                    return (
                      <div key={report._id} style={{ ...styles.reportCard, ...(isExpanded ? styles.reportCardExpanded : {}) }} className="feature-card-3d">
                        <div onClick={() => toggleExpand(report._id)} style={styles.reportHeader}>
                          <div style={styles.reportHeaderLeft}>
                            <div style={styles.reportIcon}><FileText size={24} color="#3498db" /></div>
                            <div style={styles.reportInfo}>
                              <h4 style={styles.reportTitle}>{report.diseaseName || "General Assessment"}</h4>
                              <div style={styles.reportMeta}>
                                <span style={styles.reportMetaItem}><Calendar size={14} />{new Date(report.visitDate).toLocaleDateString()}</span>
                                <span style={styles.reportMetaItem}><Building size={14} />{report.hospitalName}</span>
                              </div>
                            </div>
                          </div>

                          {/* BADGES RE-ADDED HERE */}
                          <div style={styles.reportHeaderRight}>
                            {report.voiceReportUrl && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(230, 126, 34, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Volume2 size={16} color="#e67e22" /></div>}
                            {report.croppedScanUrl && <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(52, 152, 219, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileImage size={16} color="#3498db" /></div>}
                            <div style={styles.expandIcon}>{isExpanded ? <ChevronUp size={20} color="#3498db" /> : <ChevronDown size={20} color="#7f8c8d" />}</div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div style={styles.reportDetails}>

                            {report.vitals && (report.vitals.bloodPressure || report.vitals.heartRate || report.vitals.bloodSugar || report.vitals.temperature) && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', padding: '15px', backgroundColor: 'rgba(52, 152, 219, 0.05)', borderRadius: '12px', border: '1px solid rgba(52, 152, 219, 0.1)' }}>
                                {report.vitals.bloodPressure && (
                                  <div><span style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold' }}>BLOOD PRESSURE</span><br /><span style={{ fontSize: '16px', color: '#3498db', fontWeight: 'bold' }}>{report.vitals.bloodPressure}</span></div>
                                )}
                                {report.vitals.heartRate && (
                                  <div><span style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold' }}>HEART RATE</span><br /><span style={{ fontSize: '16px', color: '#e74c3c', fontWeight: 'bold' }}>{report.vitals.heartRate} bpm</span></div>
                                )}
                                {report.vitals.bloodSugar && (
                                  <div><span style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold' }}>BLOOD SUGAR</span><br /><span style={{ fontSize: '16px', color: '#9b59b6', fontWeight: 'bold' }}>{report.vitals.bloodSugar} mg/dL</span></div>
                                )}
                                {report.vitals.temperature && (
                                  <div><span style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold' }}>TEMPERATURE</span><br /><span style={{ fontSize: '16px', color: '#f1c40f', fontWeight: 'bold' }}>{report.vitals.temperature}°</span></div>
                                )}
                              </div>
                            )}

                            <div style={styles.detailSection}>
                              <div style={styles.doctorBadge}><Stethoscope size={16} color="#3498db" /><span>Dr. {report.doctorName}</span></div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: 'rgba(155, 89, 182, 0.05)', borderRadius: '12px', border: '1px solid rgba(155, 89, 182, 0.1)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Brain size={16} color="#9b59b6" />
                                    <span style={{ color: '#9b59b6', fontWeight: 'bold', fontSize: '14px' }}>AI Patient Summary</span>
                                  </div>

                                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <select id={`lang-${report._id}`} style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '12px', outline: 'none', cursor: 'pointer' }}>
                                      <option style={{ color: 'black' }} value="English">English</option>
                                      <option style={{ color: 'black' }} value="Hindi">Hindi</option>
                                      <option style={{ color: 'black' }} value="Tamil">Tamil</option>
                                      <option style={{ color: 'black' }} value="Telugu">Telugu</option>
                                      <option style={{ color: 'black' }} value="Spanish">Spanish</option>
                                      <option style={{ color: 'black' }} value="French">French</option>
                                    </select>
                                    <button
                                      onClick={() => handleTranslate(report._id, report.extractedText)}
                                      disabled={isTranslating === report._id}
                                      style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: isTranslating === report._id ? 'default' : 'pointer' }}
                                    >
                                      {isTranslating === report._id ? <Activity size={14} className="spinner" /> : <Globe size={14} />}
                                      Translate
                                    </button>
                                  </div>
                                </div>
                                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                                  {translations[report._id] ? translations[report._id] : report.extractedText}
                                </p>
                              </div>
                            </div>

                            {/* --- AUDIO PLAYER RE-ADDED HERE --- */}
                            {report.voiceReportUrl && (
                              <div style={{ display: 'flex', gap: '15px', padding: '15px', background: 'rgba(230, 126, 34, 0.05)', borderRadius: '12px', border: '1px solid rgba(230, 126, 34, 0.1)', alignItems: 'center', flexWrap: 'wrap' }}>
                                <Volume2 size={18} color="#e67e22" />
                                <span style={{ fontSize: '14px', color: '#e67e22', fontWeight: 'bold' }}>Clinical Audio Summary</span>
                                <audio controls src={report.voiceReportUrl} style={{ flex: 1, minWidth: '200px', height: '40px' }} />
                              </div>
                            )}

                            {report.croppedScanUrl && (
                              <div style={{ padding: '15px', background: 'rgba(52, 152, 219, 0.05)', borderRadius: '12px', border: '1px solid rgba(52, 152, 219, 0.1)', textAlign: 'center' }}>
                                <img src={report.croppedScanUrl} alt="Medical Scan" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                              </div>
                            )}

                            {/* UTILITIES */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleEdit(report._id)} style={{ ...styles.actionButton, color: '#f1c40f', borderColor: 'rgba(241, 196, 15, 0.3)' }}><Edit size={16} /> Edit</button>
                                <button onClick={() => handleDelete(report._id)} style={{ ...styles.actionButton, color: '#e74c3c', borderColor: 'rgba(231, 76, 60, 0.3)' }}><Trash2 size={16} /> Delete</button>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleDownload(report)} style={styles.actionButton}><Download size={16} /> Save</button>
                                <button onClick={() => handleShare(report)} style={styles.actionButton}><Share2 size={16} /> Share</button>
                                <button onClick={() => handlePrint(report)} style={styles.actionButton}><Printer size={16} /> Print</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx="true">{`.icon-3d:hover { transform: translateY(-2px); } .actionButton:hover { background: rgba(255,255,255,0.1) !important; } @keyframes spin { 100% { transform: rotate(360deg); } } .spinner { animation: spin 2s linear infinite; }`}</style>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#0a0f1c', color: '#ffffff', overflowX: 'hidden' },
  header: { background: 'rgba(10, 15, 28, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(52, 152, 219, 0.2)', position: 'sticky', top: 0, zIndex: 100 },
  headerContent: { maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '30px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  logoText: { fontWeight: 'bold', color: '#ffffff', fontSize: '20px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  logoutButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(231, 76, 60, 0.1)', border: '1px solid rgba(231, 76, 60, 0.3)', borderRadius: '12px', color: '#e74c3c', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  statsGrid: { display: 'grid', gap: '20px', maxWidth: '1400px', margin: '0 auto' },
  statCard: { background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '20px', border: '1px solid rgba(255,255,255,0.1)' },
  statIconContainer: { width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(52, 152, 219, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' },
  statInfo: { display: 'flex', flexDirection: 'column', gap: '5px' },
  statValue: { fontWeight: 'bold', color: '#ffffff', fontSize: '32px' },
  statLabel: { fontSize: '14px', color: 'rgba(255,255,255,0.7)' },
  mainContent: { maxWidth: '1400px', margin: '0 auto' },
  searchBar: { display: 'flex', justifyContent: 'space-between', marginBottom: '30px', gap: '20px' },
  searchInputContainer: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px' },
  searchInput: { flex: 1, background: 'none', border: 'none', color: '#ffffff', outline: 'none' },
  uploadButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'linear-gradient(135deg, #3498db, #2980b9)', borderRadius: '12px', color: '#ffffff', textDecoration: 'none' },
  timeline: { display: 'flex', flexDirection: 'column', gap: '40px' },
  timelineSection: { position: 'relative' },
  timelineHeader: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' },
  timelineDot: { width: '12px', height: '12px', borderRadius: '50%', background: '#3498db' },
  timelineMonth: { fontWeight: '600', color: '#ffffff', margin: 0 },
  timelineLine: { flex: 1, height: '2px', background: 'linear-gradient(90deg, rgba(52,152,219,0.3), transparent)' },
  reportsGrid: { display: 'grid', gap: '20px' },
  reportCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' },
  reportCardExpanded: { background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(52,152,219,0.3)' },
  reportHeader: { padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  reportHeaderLeft: { display: 'flex', gap: '15px' },
  reportIcon: { width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(52,152,219,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  reportInfo: { display: 'flex', flexDirection: 'column', gap: '8px' },
  reportTitle: { fontWeight: '600', color: '#ffffff', margin: 0 },
  reportMeta: { display: 'flex', gap: '15px' },
  reportMetaItem: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' },
  reportHeaderRight: { display: 'flex', alignItems: 'center', gap: '15px' },
  expandIcon: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  reportDetails: { padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '20px' },
  detailSection: { display: 'flex', flexDirection: 'column', gap: '15px' },
  doctorBadge: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(52,152,219,0.1)', borderRadius: '30px', fontSize: '14px', alignSelf: 'flex-start' },
  actionButton: { display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.8)', fontSize: '13px', cursor: 'pointer' }
};

export default Dashboard;