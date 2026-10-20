# 🏥 SmartPHR: Advanced AI Health OS

SmartPHR is a fully-loaded, proactive Personal Health Record (PHR) system. It bridges the gap between static medical data and real-time health intelligence. By combining a Node.js/MongoDB Vault, a React Frontend, and a Python FastAPI engine powered by Google's Gemini AI, this platform acts as an elite medical consultant, pharmacist, and lifestyle coach.

## ✨ Core Features Built

### 1. 🧠 AI Medical Scanner & Vault
* **Batch Report Analysis:** Upload multi-page medical reports (prescriptions, blood tests, clinical summaries). The AI extracts diagnosis, hospital details, and full medication lists into strict JSON.
* **Auto X-Ray Cropping:** The AI detects X-Rays/MRIs within documents, calculates bounding boxes, and auto-crops the scan for the user's gallery.
* **Drug-Drug Interaction Checker (Safety Engine):** The AI cross-references newly scanned medicines against the user's active vault prescriptions to flag dangerous chemical interactions in real-time.

### 2. ⌚ Real-Time Wearable Integration
* **Google Fit Cloud Bridge:** Secure OAuth 2.0 integration to fetch real-time Heart Rate, Steps, SpO2, and Sleep data directly from smartwatches.
* **Haptic Watch Reminders:** Utilizes HTML5 Web Push API to ping the user's smartphone, natively pushing vibration alerts and medication reminders directly to their smartwatch.

### 3. 💬 Context-Aware AI Health Agent
* **Self-Aware Chatbot:** The chat agent securely injects the patient's exact medical history, vitals, and active prescriptions into its memory to provide highly personalized, medically-safe advice.

### 4. 🥗 AI Diet & Lifestyle Engine
* **Proactive Health Plans:** Analyzes the user's entire history of diseases and vitals to generate a safe, personalized 7-day meal plan, physical therapy routine, and a list of specific "Superfoods" and "Foods to Avoid."

### 5. 🌍 Accessibility & Analytics
* **One-Click Native Translation:** Instantly translates complex medical jargon into languages like Hindi, Tamil, Spanish, and French.
* **Longitudinal Vitals Tracking:** Automatically graphs Blood Pressure, Heart Rate, and Blood Sugar trends over time using `recharts`.
* **Audio Briefings:** Uses `gTTS` to generate professional audio summaries of the uploaded reports.

---

## 🏗️ System Architecture

The application is split into three microservices:
1. **`frontend-web/`** (Port 5173): React.js (Vite) User Interface with interactive body map, dashboard, and radar.
2. **`backend-main/`** (Port 5001): Node.js/Express API managing MongoDB operations, encrypted vault, SOS dispatch, and Google Fit OAuth.
3. **`backend-ai/`** (Port 8000): Python/FastAPI server running Google Gemini multimodal models and audio synthesis.

---

## ⚙️ Prerequisites

* [Node.js](https://nodejs.org/) (v18+)
* [Python](https://www.python.org/) (3.10+)
* [MongoDB](https://www.mongodb.com/) (Local service or free MongoDB Atlas URI)
* [Google Gemini API Key](https://aistudio.google.com/) (Free from Google AI Studio)

---

## 🚀 Quick Start (Single Command)

To run all three microservices concurrently with unified logs:

```bash
# In the root project directory:
npm start
```
*Or using the PowerShell launcher:*
```powershell
.\start-dev.ps1
```

Access the interfaces:
- 🌐 **Web Dashboard:** [http://localhost:5173](http://localhost:5173)
- 🔌 **Node.js Main API:** [http://localhost:5001/api/health](http://localhost:5001/api/health)
- 🧠 **FastAPI AI Engine:** [http://localhost:8000/docs](http://localhost:8000/docs) (Interactive Swagger UI)

---

## 🔑 Environment Configuration

Each microservice contains its own `.env` file (with pre-configured `.env.example` templates):

### 1. `backend-main/.env`
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/smartphr
JWT_SECRET=smartphr_jwt_secret_dev_key_2026_super_secure
MASTER_KEY=smartphr_32_byte_master_key_secure_env
GOOGLE_MAPS_API_KEY=
GOOGLE_CLIENT_SECRET=
EMAIL_USER=
EMAIL_PASS=
```
*(Note: If `GOOGLE_MAPS_API_KEY` is not provided, the server automatically provides realistic geospatial fallback radar data so the map functions out-of-the-box).*

### 2. `backend-ai/.env`
```env
# Get your free key at https://aistudio.google.com/
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
HOST=0.0.0.0
```

### 3. `frontend-web/.env`
```env
VITE_BACKEND_MAIN_URL=http://localhost:5001
VITE_BACKEND_AI_URL=http://localhost:8000
```

---

## 🛠️ Running Services Individually

### 1. Main Backend (`backend-main`)
```bash
cd backend-main
npm install
npm run dev
```

### 2. AI Backend (`backend-ai`)
```bash
cd backend-ai
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Web (`frontend-web`)
```bash
cd frontend-web
npm install
npm run dev
```

---

## 🛡️ Security & Privacy
* **Envelope Encryption:** Medical records in MongoDB are secured using field-level AES-256 envelope encryption with dynamic Data Encryption Keys (DEKs).
* **Protected Routes:** User vault and dashboard are authenticated via JWT bearer tokens.