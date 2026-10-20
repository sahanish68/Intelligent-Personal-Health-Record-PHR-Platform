import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Mic, Image as ImageIcon, Loader2, Volume2, ShieldCheck, Activity, AlertCircle, Square, Pill, FileText, CheckCircle2, Send, HeartPulse, MapPin, Building2, ExternalLink, UploadCloud } from 'lucide-react';
import '../App.css';

function SymptomAnalyzer() {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [audioUrl, setAudioUrl] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [animationClass, setAnimationClass] = useState('');
    const [textInput, setTextInput] = useState('');
    const [patientContext, setPatientContext] = useState("No medical history loaded yet.");
    const [location, setLocation] = useState({ lat: 40.7128, lon: -74.0060 }); // Default to NYC for demo purposes if geolocation is blocked
    const [skinImagePreview, setSkinImagePreview] = useState(null);
    const [skinAnalysisResult, setSkinAnalysisResult] = useState(null);
    const [skinRecommendations, setSkinRecommendations] = useState(null);
    const [isAnalyzingSkin, setIsAnalyzingSkin] = useState(false);
    const [hospitalOverlayData, setHospitalOverlayData] = useState(null);
    const userId = localStorage.getItem('userId');

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    useEffect(() => {
        setAnimationClass('fade-in');

        // Fetch Patient Context exactly like the Chat Agent
        const fetchPatientData = async () => {
            try {
                const [reportsRes, medsRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reports/user/${userId}`),
                    axios.get(`${import.meta.env.VITE_BACKEND_MAIN_URL}/api/reminders/user/${userId}`)
                ]);

                const reports = reportsRes.data;
                const meds = medsRes.data;

                let contextBuilder = `The patient's name is ${localStorage.getItem('userName') || 'Unknown'}. `;

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

                console.log("🔒 Compiled Patient Context for AI Symptoms:", contextBuilder);
                setPatientContext(contextBuilder);
            } catch (error) {
                console.error("Could not load context", error);
                setPatientContext("Error loading medical history.");
            }
        };

        if (userId) fetchPatientData();

        // Capture Geolocation for Hospital Recommendation
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    console.log("📍 Location captured for precise hospital matching:", position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("Geolocation denied or error, using default location:", error.message);
                },
                { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
            );
        }

    }, [userId]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                audioChunksRef.current = []; // reset
                handleVoiceAnalysis(audioBlob);
            };

            audioChunksRef.current = [];
            mediaRecorderRef.current.start(100); // 100ms per timeslice for responsiveness
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing mic:", err);
            alert("Microphone access needed for Voice Analysis.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    const handleVoiceAnalysis = async (audioBlob) => {
        setIsProcessing(true);
        setAnalysisResult(null);
        setAudioUrl(null);

        const formData = new FormData();
        formData.append('audio', audioBlob, 'symptoms.webm');
        formData.append('patient_context', patientContext);
        if (location) {
            formData.append('lat', location.lat);
            formData.append('lon', location.lon);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_AI_URL}/analyze-symptoms-audio`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.status === 'success' && data.data) {
                setAnalysisResult(data.data);
                if (data.data.voiceReportUrl) {
                    setAudioUrl(data.data.voiceReportUrl);
                    // FIXED AUDIO BUG: Removing programmatic .play() since HTML <audio autoPlay> handles it!
                }
            } else {
                console.error("Analysis Error:", data.message);
                alert("Failed to analyze audio. Please try again.");
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Network error connecting to the AI Engine.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSkinImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSkinImagePreview(URL.createObjectURL(file));
        setIsAnalyzingSkin(true);
        setSkinAnalysisResult(null);
        setSkinRecommendations(null);

        const formData = new FormData();
        formData.append('image', file);
        if (location) {
            formData.append('lat', location.lat);
            formData.append('lon', location.lon);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_AI_URL}/analyze-skin`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.status === 'success' && data.predictions) {
                setSkinAnalysisResult(data.predictions);
                if (data.recommendations) {
                    setSkinRecommendations(data.recommendations);
                }
            } else {
                console.error("Skin Analysis Error:", data.message);
                alert("Failed to analyze skin image. " + data.message);
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Network error connecting to the AI Engine for skin analysis.");
        } finally {
            setIsAnalyzingSkin(false);
        }
    };

    const handleTextAnalysis = async () => {
        if (!textInput.trim()) return;
        setIsProcessing(true);
        setAnalysisResult(null);
        setAudioUrl(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_AI_URL}/analyze-symptoms-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: textInput,
                    patient_context: patientContext,
                    ...(location && { lat: location.lat, lon: location.lon })
                }),
            });

            const data = await response.json();
            if (data.status === 'success' && data.data) {
                setAnalysisResult(data.data);
                if (data.data.voiceReportUrl) {
                    setAudioUrl(data.data.voiceReportUrl);
                    // FIXED AUDIO BUG: Removing programmatic .play() since HTML <audio autoPlay> handles it!
                }
            } else {
                console.error("Analysis Error:", data.message);
                alert("Failed to analyze text. Please try again.");
            }
        } catch (error) {
            console.error("Network Error:", error);
            alert("Network error connecting to the AI Engine.");
        } finally {
            setIsProcessing(false);
            setTextInput('');
        }
    };

    return (
        <div className={`symptom-analyzer-container ${animationClass}`} style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerTitle}>
                    <Activity size={32} color="#3498db" />
                    <h1 style={styles.title}>AI Symptom Analyzer</h1>
                </div>
                <p style={styles.subtitle}>Get immediate insights, remedies, and safe recommendations based on your symptoms.</p>
            </div>

            <div style={styles.grid}>

                {/* LEFT COLUMN: SKIN CANCER CLASSIFICATION */}
                <div style={styles.card} className="glass-card">
                    <div style={styles.cardHeader}>
                        <div style={{ ...styles.iconWrapper, background: 'rgba(155, 89, 182, 0.2)' }}>
                            <ImageIcon size={24} color="#9b59b6" />
                        </div>
                        <h2 style={styles.cardTitle}>Dermatology AI</h2>
                    </div>
                    <p style={styles.cardDesc}>Upload a clear image of your skin condition. Our elite vision neural network will screen it for melanoma and other conditions instantly.</p>

                    <div style={styles.skinUploadArea}>
                        {skinImagePreview ? (
                            <img src={skinImagePreview} alt="Skin Preview" style={styles.skinImagePreview} />
                        ) : (
                            <div style={styles.uploadPlaceholder}>
                                <UploadCloud size={40} color="rgba(255,255,255,0.4)" />
                                <p style={styles.uploadPlaceholderText}>Click to upload skin image</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleSkinImageUpload}
                            style={styles.fileInputOverlay}
                            title="Upload Skin Image"
                        />
                    </div>

                    {isAnalyzingSkin && (
                        <div style={{ ...styles.processingState, marginTop: '20px' }}>
                            <Loader2 size={30} color="#9b59b6" className="spin" />
                            <p style={{ color: '#fff', marginTop: '10px' }}>Analyzing skin patterns...</p>
                        </div>
                    )}

                    {skinAnalysisResult && !isAnalyzingSkin && (
                        <div style={styles.skinResultsContainer} className="fade-in-up">
                            <h4 style={{ color: '#9b59b6', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Activity size={18} /> Vision Analysis Results
                            </h4>
                            {skinAnalysisResult.map((res, i) => (
                                <div key={i} style={styles.predictionRow}>
                                    <div style={styles.predictionHeader}>
                                        <span style={styles.predictionLabel}>{res.label}</span>
                                        <span style={styles.predictionScore}>{res.confidence}%</span>
                                    </div>
                                    <div style={styles.predictionBarBg}>
                                        <div style={{ ...styles.predictionBarFill, width: `${res.confidence}%`, background: res.confidence > 50 && res.label.toLowerCase().includes('malignant') ? '#e74c3c' : res.confidence > 50 ? '#f1c40f' : '#2ecc71' }}></div>
                                    </div>
                                </div>
                            ))}
                            <p style={styles.skinWarning}>⚠ AI screening is not a diagnosis. Always consult a dermatologist.</p>

                            {skinRecommendations && (
                                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(155, 89, 182, 0.2)' }}>
                                    <h4 style={styles.tagHeader}><Pill size={16} /> Suggested Safe Treatments:</h4>
                                    <div style={styles.tagsContainer}>
                                        {skinRecommendations.suggestedTablets?.map((tablet, i) => (
                                            <span key={i} style={styles.medicineTag} className="pulse-on-hover">{tablet}</span>
                                        ))}
                                    </div>

                                    <h4 style={{ ...styles.tagHeader, marginTop: '15px' }}><ShieldCheck size={16} /> Safety Precautions:</h4>
                                    <ul style={styles.list}>
                                        {skinRecommendations.safetyPrecautions?.map((pre, i) => (
                                            <li key={i} style={styles.listItem}>{pre}</li>
                                        ))}
                                    </ul>
                                    {skinRecommendations.hospitals && skinRecommendations.hospitals.length > 0 && (
                                        <button
                                            onClick={() => setHospitalOverlayData(skinRecommendations)}
                                            style={styles.specialistBtn}
                                            className="pulse-on-hover"
                                        >
                                            <MapPin size={16} /> View Nearby Specialists
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: VOICE & TEXT ANALYSIS (Active) */}
                <div style={{ ...styles.card, border: isRecording ? '1px solid rgba(231, 76, 60, 0.5)' : '1px solid rgba(52, 152, 219, 0.2)' }} className="glass-card zoom-effect">
                    <div style={styles.cardHeader}>
                        <div style={{ ...styles.iconWrapper, background: 'rgba(52, 152, 219, 0.2)' }}>
                            <Volume2 size={24} color="#3498db" />
                        </div>
                        <h2 style={styles.cardTitle}>Symptoms Analysis</h2>
                    </div>
                    <p style={styles.cardDesc}>Speak directly or type your symptoms. Describe how you feel, how long it's been happening, and any prior medicines.</p>

                    <div style={styles.voiceInteractionArea}>
                        {!isRecording && !isProcessing && (
                            <button
                                onClick={startRecording}
                                style={styles.recordButton}
                                className="pulse-on-hover"
                            >
                                <Mic size={32} color="#fff" />
                            </button>
                        )}

                        {isRecording && (
                            <div style={styles.recordingState}>
                                <div className="recording-waves" style={styles.waves}>
                                    <div style={styles.wave}></div>
                                    <div style={{ ...styles.wave, animationDelay: '0.2s' }}></div>
                                    <div style={{ ...styles.wave, animationDelay: '0.4s' }}></div>
                                </div>
                                <button
                                    onClick={stopRecording}
                                    style={styles.stopButton}
                                >
                                    <Square size={24} color="#fff" />
                                    <span>Stop Recording</span>
                                </button>
                                <p style={styles.recordingText}>Listening across any language...</p>
                            </div>
                        )}

                        {isProcessing && (
                            <div style={styles.processingState}>
                                <Loader2 size={40} color="#3498db" className="spin" style={{ marginBottom: '15px' }} />
                                <p style={{ color: '#fff' }}>Consulting AI Engine...</p>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Extracting insights & generating audio</p>
                            </div>
                        )}

                        {!isRecording && !isProcessing && (
                            <div style={styles.textInputSection}>
                                <div style={styles.textInputWrapper}>
                                    <input
                                        type="text"
                                        placeholder="Or type your symptoms here..."
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleTextAnalysis()}
                                        style={styles.textInput}
                                    />
                                    <button
                                        onClick={handleTextAnalysis}
                                        disabled={!textInput.trim()}
                                        style={{ ...styles.sendButton, opacity: !textInput.trim() ? 0.5 : 1 }}
                                    >
                                        <Send size={18} color="#fff" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RESULTS DISPLAY */}
                    {analysisResult && !isProcessing && (
                        <div style={styles.resultsContainer} className="fade-in-up">
                            <div style={styles.resultHeader}>
                                <CheckCircle2 size={20} color="#2ecc71" />
                                <span style={styles.resultTitle}>Analysis Complete in {analysisResult.detectedLanguage?.toUpperCase()}</span>
                            </div>

                            <div style={styles.resultRow}>
                                <strong style={styles.resultLabel}>Transcription:</strong>
                                <p style={styles.resultText}>"{analysisResult.transcription}"</p>
                            </div>

                            <div style={styles.resultRow}>
                                <strong style={styles.resultLabel}>Likely Condition:</strong>
                                <p style={{ ...styles.resultText, color: '#e74c3c', fontWeight: 'bold' }}>{analysisResult.likelyCondition}</p>
                            </div>

                            <div style={styles.tagSection}>
                                <h4 style={styles.tagHeader}><Activity size={16} /> Immediate Remedies:</h4>
                                <div style={styles.tags}>
                                    {analysisResult.immediateRemedies?.map((rem, i) => (
                                        <span key={i} style={styles.tagRemedy}>{rem}</span>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.tagSection}>
                                <h4 style={styles.tagHeader}><Pill size={16} /> Suggested Tablets (OTA):</h4>
                                <div style={styles.tags}>
                                    {analysisResult.suggestedTablets?.length ? analysisResult.suggestedTablets.map((tab, i) => (
                                        <span key={i} style={styles.tagTablet}>{tab}</span>
                                    )) : <span style={styles.tagSafe}>Only taking doctor prescribed meds mapped. Consult Doctor.</span>}
                                </div>
                            </div>

                            <div style={styles.tagSection}>
                                <h4 style={styles.tagHeader}><ShieldCheck size={16} /> Safety Precautions:</h4>
                                <ul style={styles.list}>
                                    {analysisResult.safetyPrecautions?.map((pre, i) => (
                                        <li key={i} style={styles.listItem}>{pre}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* HOSPITAL RECOMMENDATIONS BUTTON */}
                            {analysisResult.hospitals && analysisResult.hospitals.length > 0 && (
                                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'center' }}>
                                    <button
                                        onClick={() => setHospitalOverlayData(analysisResult)}
                                        style={styles.specialistBtn}
                                        className="pulse-on-hover"
                                    >
                                        <MapPin size={16} /> View Nearby Specialists
                                    </button>
                                </div>
                            )}

                            {audioUrl && (
                                <div style={styles.audioPlayer}>
                                    <p style={{ fontSize: '12px', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <Volume2 size={14} /> AI Voice Response Playback
                                    </p>
                                    <audio controls src={audioUrl} style={{ width: '100%', height: '40px' }} autoPlay />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* HOSPITAL OVERLAY MODAL */}
            {hospitalOverlayData && (
                <div style={styles.overlayBackdrop} onClick={() => setHospitalOverlayData(null)} className="fade-in">
                    <div style={styles.overlayModal} onClick={(e) => e.stopPropagation()} className="fade-in-up">
                        <button style={styles.closeModalBtn} onClick={() => setHospitalOverlayData(null)}>✖</button>

                        <div style={styles.modalHeader}>
                            <h3 style={styles.modalTitle}><MapPin size={24} color="#e74c3c" /> Neaby Facilities Found</h3>
                            <p style={styles.modalSubtitle}>Matched Specialist: <strong>{hospitalOverlayData.recommendedSpecialist}</strong></p>
                        </div>

                        <div style={styles.overlayGrid}>
                            {hospitalOverlayData.hospitals.map((hospital, i) => (
                                <div key={i} style={styles.hospitalCard} className="hospital-zoom">
                                    <div style={styles.hospitalInfo}>
                                        <h5 style={styles.hospitalName}><Building2 size={16} color="#3498db" /> {hospital.name}</h5>
                                        <p style={styles.hospitalAddress}>{hospital.address}</p>
                                        <span style={hospital.isOpen !== false ? styles.openBadge : styles.closedBadge}>
                                            {hospital.isOpen !== false ? 'Currently Open' : 'May be Closed'}
                                        </span>
                                    </div>
                                    <a href={hospital.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ ...styles.navigateBtn, width: '100%', justifyContent: 'center', marginTop: '15px' }} className="pulse-on-hover">
                                        <ExternalLink size={16} /> Get Directions
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx="true">{`
        .glass-card {
          background: rgba(20, 25, 40, 0.6);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .zoom-effect:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.2);
        }
        .spin {
          animation: spin 1.5s linear infinite;
        }
        .pulse-on-hover {
          transition: all 0.3s ease;
        }
        .pulse-on-hover:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(52, 152, 219, 0.6);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes waveAnim {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.5); }
        }
        .hospital-zoom {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hospital-zoom:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.2);
          border-color: rgba(52, 152, 219, 0.5) !important;
        }
      `}</style>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        color: '#fff',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    header: {
        marginBottom: '40px',
        textAlign: 'center',
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        marginBottom: '10px',
    },
    title: {
        fontSize: '32px',
        fontWeight: '700',
        margin: 0,
        background: 'linear-gradient(90deg, #fff, #3498db)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        fontSize: '16px',
        color: 'rgba(255,255,255,0.6)',
        maxWidth: '600px',
        margin: '0 auto',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '30px',
        alignItems: 'start',
    },
    card: {
        borderRadius: '20px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px',
    },
    iconWrapper: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: '22px',
        fontWeight: '600',
        margin: 0,
    },
    cardDesc: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.6)',
        marginBottom: '30px',
        lineHeight: '1.5',
    },
    uploadBox: {
        border: '2px dashed rgba(255,255,255,0.1)',
        borderRadius: '15px',
        padding: '50px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        position: 'relative',
        overflow: 'hidden',
    },
    uploadText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
    },
    bodyMapContainer: {
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '15px',
        padding: '20px'
    },
    comingSoonBadge: {
        position: 'absolute',
        top: '20px',
        right: '-30px',
        background: '#f39c12',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold',
        padding: '5px 40px',
        transform: 'rotate(45deg)',
    },
    voiceInteractionArea: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '15px',
        minHeight: '200px',
    },
    recordButton: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#3498db',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 0 20px rgba(52, 152, 219, 0.4)',
    },
    recordingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    waves: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        height: '60px',
        marginBottom: '20px',
    },
    wave: {
        width: '6px',
        height: '30px',
        backgroundColor: '#e74c3c',
        borderRadius: '3px',
        animation: 'waveAnim 1s ease-in-out infinite',
    },
    stopButton: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 24px',
        backgroundColor: '#e74c3c',
        border: 'none',
        borderRadius: '30px',
        color: '#fff',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 0 15px rgba(231, 76, 60, 0.4)',
        transition: 'all 0.2s',
    },
    recordingText: {
        marginTop: '15px',
        color: '#e74c3c',
        fontSize: '14px',
        animation: 'fadeIn 1s infinite alternate',
    },
    processingState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    textInputSection: {
        width: '100%',
        marginTop: '25px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '20px',
    },
    textInputWrapper: {
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '25px',
        padding: '5px 5px 5px 20px',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
    },
    textInput: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        color: '#fff',
        fontSize: '14px',
        outline: 'none',
    },
    sendButton: {
        background: '#3498db',
        border: 'none',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    resultsContainer: {
        marginTop: '30px',
        padding: '20px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '15px',
        border: '1px solid rgba(255,255,255,0.05)',
    },
    resultHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    resultTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#2ecc71',
    },
    resultRow: {
        marginBottom: '15px',
    },
    resultLabel: {
        display: 'block',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '5px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    resultText: {
        fontSize: '15px',
        color: 'rgba(255,255,255,0.9)',
        lineHeight: '1.5',
        margin: 0,
        fontStyle: 'italic',
    },
    tagSection: {
        marginTop: '20px',
    },
    tagHeader: {
        fontSize: '14px',
        color: '#fff',
        marginBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
    },
    tagRemedy: {
        padding: '6px 12px',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        color: '#2ecc71',
        border: '1px solid rgba(46, 204, 113, 0.3)',
        borderRadius: '20px',
        fontSize: '13px',
    },
    tagTablet: {
        padding: '6px 12px',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        color: '#3498db',
        border: '1px solid rgba(52, 152, 219, 0.3)',
        borderRadius: '20px',
        fontSize: '13px',
    },
    tagSafe: {
        padding: '6px 12px',
        backgroundColor: 'rgba(241, 196, 15, 0.1)',
        color: '#f1c40f',
        border: '1px solid rgba(241, 196, 15, 0.3)',
        borderRadius: '20px',
        fontSize: '13px',
    },
    list: {
        margin: 0,
        paddingLeft: '20px',
        color: 'rgba(255,255,255,0.8)',
        fontSize: '14px',
        lineHeight: '1.6',
    },
    listItem: {
        marginBottom: '5px',
    },
    audioPlayer: {
        marginTop: '25px',
        padding: '15px',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
    },
    hospitalGrid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: '12px',
        marginTop: '15px'
    },
    hospitalCard: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '15px',
        borderRadius: '12px',
        flexWrap: 'wrap',
        gap: '15px'
    },
    hospitalInfo: {
        flex: 1,
        minWidth: '200px'
    },
    hospitalName: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#fff',
        margin: '0 0 5px 0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '6px',
        lineHeight: '1.3'
    },
    hospitalAddress: {
        fontSize: '13px',
        color: 'rgba(255,255,255,0.6)',
        margin: '0 0 10px 0',
        paddingLeft: '20px',
        lineHeight: '1.4'
    },
    openBadge: {
        fontSize: '11px',
        color: '#2ecc71',
        background: 'rgba(46, 204, 113, 0.1)',
        padding: '3px 8px',
        borderRadius: '10px',
        border: '1px solid rgba(46, 204, 113, 0.2)',
        marginLeft: '20px',
        fontWeight: 'bold'
    },
    closedBadge: {
        fontSize: '11px',
        color: '#e74c3c',
        background: 'rgba(231, 76, 60, 0.1)',
        padding: '3px 8px',
        borderRadius: '10px',
        border: '1px solid rgba(231, 76, 60, 0.2)',
        marginLeft: '20px',
        fontWeight: 'bold'
    },
    navigateBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '10px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '600',
        border: 'none',
    },
    skinUploadArea: {
        width: '100%',
        height: '220px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '15px',
        border: '2px dashed rgba(155, 89, 182, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    uploadPlaceholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px'
    },
    uploadPlaceholderText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: '14px',
        margin: 0
    },
    skinImagePreview: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
    },
    fileInputOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        cursor: 'pointer'
    },
    skinResultsContainer: {
        marginTop: '25px',
        padding: '20px',
        backgroundColor: 'rgba(155, 89, 182, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(155, 89, 182, 0.2)',
    },
    predictionRow: {
        marginBottom: '15px'
    },
    predictionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '5px'
    },
    predictionLabel: {
        fontSize: '14px',
        color: '#fff',
        fontWeight: '500'
    },
    predictionScore: {
        fontSize: '14px',
        color: 'rgba(255,255,255,0.7)'
    },
    predictionBarBg: {
        height: '6px',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: '3px',
        overflow: 'hidden'
    },
    predictionBarFill: {
        height: '100%',
        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    skinWarning: {
        fontSize: '11px',
        color: 'rgba(255,255,255,0.4)',
        marginTop: '20px',
        fontStyle: 'italic',
        textAlign: 'center'
    },
    specialistBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        color: '#fff',
        padding: '12px 25px',
        borderRadius: '25px',
        border: 'none',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(231, 76, 60, 0.4)',
        marginTop: '15px'
    },
    overlayBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
    },
    overlayModal: {
        background: 'rgba(20, 25, 40, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
    },
    closeModalBtn: {
        position: 'absolute',
        top: '20px',
        right: '25px',
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.6)',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'color 0.2s',
    },
    modalHeader: {
        marginBottom: '25px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
    },
    modalTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '24px',
        fontWeight: 'bold',
        margin: '0 0 5px 0'
    },
    modalSubtitle: {
        fontSize: '15px',
        color: '#3498db',
        margin: 0
    },
    overlayGrid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
        gap: '20px',
    }
};

// Add responsive grid via media query string handling if needed,
// but for simplicity inline grid is set. In real app, standard CSS might be better for 768px breaks.
// Added simple global styling.
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = `
    @media (max-width: 900px) {
      .symptom-analyzer-container > div:nth-child(2) {
        grid-template-columns: 1fr !important;
      }
    }
  `;
    document.head.appendChild(style);
}

export default SymptomAnalyzer;
