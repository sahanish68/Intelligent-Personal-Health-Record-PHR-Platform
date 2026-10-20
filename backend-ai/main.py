import sys
import os
import io
import json
import traceback

# Ensure safe emoji and unicode logging on Windows terminals
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uvicorn
from google import genai
from google.genai import types
from gtts import gTTS
from dotenv import load_dotenv
from PIL import Image

# 1. LOAD ENVIRONMENT VARIABLES EXPLICITLY
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

app = FastAPI(title="Smart PHR AI Engine ULTRA")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. INITIALIZE CLIENT SAFELY WITH DYNAMIC LOOKUP
client = None

def get_gemini_client():
    global client
    if client is not None:
        return client
    cur_key = os.getenv("GEMINI_API_KEY")
    if cur_key and cur_key.strip() and cur_key != "your_gemini_api_key_here":
        cleaned_key = cur_key.strip().rstrip(':').strip('"\'')
        try:
            client = genai.Client(api_key=cleaned_key)
            return client
        except Exception as err:
            print(f"⚠️ Error creating Gemini client: {err}")
            return None
    return None

if api_key and api_key.strip() and api_key != "your_gemini_api_key_here":
    if get_gemini_client():
        print("✅ Gemini AI Client initialized successfully!")
else:
    print("⚠️ NOTE: GEMINI_API_KEY is not set in backend-ai/.env.")
    print("   Please get a free Gemini API key at https://aistudio.google.com/ and set GEMINI_API_KEY in backend-ai/.env")

# Optional Dermatology HuggingFace Model
skin_classifier = None
try:
    from transformers import pipeline
    print("⏳ Initializing Dermatology AI Model (This may take a minute on first run)...")
    skin_classifier = pipeline("image-classification", model="Anwarkh1/Skin_Cancer-Image_Classification")
    print("✅ Dermatology AI Model Loaded Successfully!")
except Exception as e:
    print(f"ℹ️ Local HuggingFace transformers model not initialized ({e}). Skin analyzer will use Gemini Vision AI.")

# Setup Static Folders
os.makedirs("audio_reports", exist_ok=True)
os.makedirs("scans", exist_ok=True) 
app.mount("/audio", StaticFiles(directory="audio_reports"), name="audio")
app.mount("/scans", StaticFiles(directory="scans"), name="scans")

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "backend-ai",
        "geminiConfigured": get_gemini_client() is not None,
        "skinClassifierLoaded": skin_classifier is not None
    }

# --- 1. REPORT ANALYZER MODULE (WITH INTERACTION & VITALS) ---
@app.post("/analyze-report")
async def analyze_report(
    files: List[UploadFile] = File(...),
    current_meds: str = Form(default="None") 
):
    try:
        print(f"\n📥 Analysis Started. Pages: {len(files)} | Current Meds: {current_meds}")
        gemini = get_gemini_client()
        if not gemini:
            return JSONResponse(
                content={"status": "error", "message": "GEMINI_API_KEY is not configured in backend-ai/.env. Please configure your key from https://aistudio.google.com/ to analyze reports."},
                status_code=400
            )
        
        image_list = []
        for file in files:
            image_data = await file.read()
            image = Image.open(io.BytesIO(image_data))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image_list.append(image)
        
        prompt = f"""
        You are an elite Medical Consultant and Clinical Pharmacist. 
        Analyze these MULTI-PAGE report images and provide a deep clinical extraction.
        
        SAFETY CHECK: The patient is currently taking the following medications: {current_meds}.
        You MUST cross-reference any NEW medications found in this report against their current medications to check for adverse drug-drug interactions.

        Return STRICTLY as a JSON object with this exact structure. Do not add markdown formatting to the JSON:
        {{
            "doctorName": "name of the doctor",
            "hospitalName": "name of the hospital or clinic",
            "visitDate": "YYYY-MM-DD",
            "diseaseName": "The exact diagnosis",
            "reasonForCondition": "The symptoms or root cause identified",
            "patientFriendlySummary": "A clear, professional, jargon-free explanation covering ALL pages.",
            
            "vitals": {{
                "bloodPressure": "string (e.g., '120/80'). Return null if not found.",
                "heartRate": "integer (e.g., 75). Return null if not found.",
                "bloodSugar": "integer (e.g., 110). Return null if not found.",
                "temperature": "float (e.g., 98.6). Return null if not found."
            }},

            "actionPlan": ["Strict clinical step 1", "Strict clinical step 2"],
            
            "medicines": [
                {{
                    "name": "medicine name", 
                    "specification": "dosage and instructions",
                    "purpose": "clinical reason",
                    "durationInDays": "Number of days (integer)",
                    "frequency": "How often?"
                }}
            ],

            "drugInteractions": [
                {{
                    "interactingDrugs": "Name of New Drug + Name of Current Drug",
                    "severity": "High / Medium / Low",
                    "description": "Clinical explanation of why mixing these is dangerous"
                }}
            ],

            "audioScript": "Write a strictly factual, professional audio script summarizing the diagnosis. No greetings.",
            
            "containsVisualScan": "boolean (true or false). True ONLY if there is an actual X-Ray, MRI, CT Scan, or Ultrasound image.",
            "scanType": "If containsVisualScan is true, what is it? (e.g., 'Chest X-Ray'). If false, return 'None'.",
            "scanImageIndex": "Integer (0, 1, 2). WHICH uploaded page contains the scan? 0 is the first page.",
            "scanBoundingBox": "If containsVisualScan is true, provide the exact bounding box array [ymin, xmin, ymax, xmax] scaled from 0 to 1000 covering the visual scan itself. If false, return []"
        }}
        """
        
        print(f"🧠 Sending {len(image_list)} images to Gemini AI...")
        contents_payload = [prompt] + image_list
        
        response = gemini.models.generate_content(
            model='gemini-2.5-flash', 
            contents=contents_payload,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        extracted_data = json.loads(response.text)
        print("✅ Clinical Data extracted successfully")

        if extracted_data.get("containsVisualScan") and extracted_data.get("scanBoundingBox"):
            print("✂️ Visual Scan detected! Attempting to crop...")
            try:
                box = extracted_data["scanBoundingBox"]
                idx = int(extracted_data.get("scanImageIndex", 0))
                if len(box) == 4 and idx < len(image_list):
                    target_img = image_list[idx]
                    w, h = target_img.size
                    left = (box[1]/1000.0) * w
                    top = (box[0]/1000.0) * h
                    right = (box[3]/1000.0) * w
                    bottom = (box[2]/1000.0) * h
                    cropped_img = target_img.crop((left, top, right, bottom))
                    
                    safe_filename = files[0].filename.split('.')[0] if files[0].filename else "scan"
                    fname = f"scan_{safe_filename}.jpg"
                    fpath = os.path.join("scans", fname)
                    cropped_img.save(fpath)
                    extracted_data["croppedScanUrl"] = f"http://localhost:8000/scans/{fname}"
                    print(f"✅ Successfully cropped scan saved to: {fpath}")
            except Exception as e:
                print(f"⚠️ Crop Error: {e}")

        print("🗣️ Generating Audio Briefing...")
        audio_text = extracted_data.get('audioScript', 'Error reading script.')
        tts = gTTS(text=audio_text, lang='en')
        safe_audio_name = files[0].filename.split('.')[0] if files[0].filename else "audio"
        a_name = f"audio_{safe_audio_name}.mp3"
        a_path = f"audio_reports/{a_name}"
        tts.save(a_path)
        
        extracted_data["extractedText"] = extracted_data.get("patientFriendlySummary", "")
        extracted_data["voiceReportUrl"] = f"http://localhost:8000/audio/{a_name}"
        
        return JSONResponse(content={"status": "success", "data": extracted_data})
        
    except Exception as e:
        print("\n❌ ANALYZER ERROR:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

# --- 2. ADVANCED AI HEALTH AGENT CHATBOT ---
class ChatRequest(BaseModel):
    message: str
    patient_context: str = "No medical history provided."

@app.post("/chat")
async def ai_chat(request: ChatRequest):
    try:
        user_message = request.message
        context = request.patient_context
        print(f"\n💬 Chat query received: {user_message}")
        print(f"🧠 Injecting Context: {context[:100]}...")

        if not user_message:
            return JSONResponse(content={"status": "error", "message": "No message provided"}, status_code=400)

        gemini = get_gemini_client()
        if not gemini:
            return JSONResponse(
                content={"status": "error", "message": "GEMINI_API_KEY is not configured in backend-ai/.env. Please configure your key from https://aistudio.google.com/ to use the AI Health Chat."},
                status_code=400
            )

        prompt = f"""
        You are 'SmartPHR Agent', an elite, highly accurate medical AI. 
        You have direct access to the user's private medical vault. 
        
        HERE IS THE PATIENT'S ACTUAL MEDICAL RECORD (YOUR SOURCE OF TRUTH):
        {context}
        
        STRICT RULES YOU MUST FOLLOW:
        1. NO GENERIC ANSWERS: If the user asks "What are my conditions?" you MUST read the Patient's Record above and list them exactly. If the record says "No medical history", you MUST reply "I don't see any conditions in your vault yet. Please upload a report."
        2. BE DIRECT: Do not say "I can help you with that" or "Here is your answer." Just give the exact answer immediately.
        3. ACCURACY: Do not invent diseases or medicines. Only state what is in the provided context.
        4. GENERAL QUESTIONS: If they ask a general health question (e.g., "What is good for a fever?"), give standard medical advice (e.g., "Paracetamol, rest, and hydration") but cross-check it against their medications in the context to ensure there are no bad interactions.
        5. FORMATTING: Use bullet points for readability.
        6. CRITICAL: Always end your response with a short disclaimer that you are an AI and they should consult their doctor for clinical decisions.
        
        Patient's Question: {user_message}
        """

        response = gemini.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )

        print("✅ Strict AI Reply generated successfully")
        return JSONResponse(content={"status": "success", "reply": response.text})

    except Exception as e:
        print("\n❌ CHAT ERROR OCCURRED:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
    
# --- 3. NATIVE LANGUAGE TRANSLATION MODULE ---
class TranslationRequest(BaseModel):
    text: str
    target_language: str

@app.post("/translate")
async def translate_text(request: TranslationRequest):
    try:
        print(f"🌍 Translating summary to {request.target_language}...")
        
        gemini = get_gemini_client()
        if not gemini:
            return JSONResponse(
                content={"status": "error", "message": "GEMINI_API_KEY is not configured in backend-ai/.env. Please configure your key to use medical translation."},
                status_code=400
            )

        prompt = f"""
        You are an expert medical translator. Translate the following medical summary into {request.target_language}.
        Keep the clinical meaning 100% accurate, but make sure it is easy for a normal patient to understand.
        Do not add any conversational filler. Just return the translated text.
        
        Text to translate:
        {request.text}
        """
        
        response = gemini.models.generate_content(
            model='gemini-2.5-flash', 
            contents=prompt
        )
        
        print("✅ Translation complete!")
        return JSONResponse(content={"status": "success", "translatedText": response.text})
    except Exception as e:
        print("\n❌ TRANSLATION ERROR:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

# --- 4. AI DIET & LIFESTYLE ENGINE ---
class LifestyleRequest(BaseModel):
    medical_history: str

@app.post("/generate-lifestyle")
async def generate_lifestyle(request: LifestyleRequest):
    try:
        print(f"🥗 Generating Lifestyle Plan for history length: {len(request.medical_history)}")
        gemini = get_gemini_client()
        if not gemini:
            return JSONResponse(
                content={"status": "error", "message": "GEMINI_API_KEY is not configured in backend-ai/.env. Please configure your key to generate a lifestyle plan."},
                status_code=400
            )
        
        prompt = f"""
        You are an elite clinical nutritionist and physical therapist. 
        Analyze the following patient medical history (which includes past diagnoses, medicines, and vitals).
        
        Patient History:
        {request.medical_history}
        
        Create a personalized, medically-safe dietary and exercise plan. 
        If they have conditions like hypertension, ensure the diet is low-sodium. If they have diabetes, ensure low glycemic index, etc.
        
        Return STRICTLY as a JSON object with this exact structure. Do not add markdown formatting to the JSON:
        {{
            "healthAnalysis": "A short, encouraging paragraph explaining how this plan targets their specific conditions.",
            "foodsToAvoid": ["Food 1", "Food 2", "Food 3"],
            "superfoods": ["Food 1", "Food 2", "Food 3"],
            "dailyDiet": [
                {{
                    "meal": "Breakfast",
                    "suggestion": "Detailed healthy meal idea",
                    "benefits": "Why this helps their condition"
                }},
                {{
                    "meal": "Lunch",
                    "suggestion": "Detailed healthy meal idea",
                    "benefits": "Why this helps their condition"
                }},
                {{
                    "meal": "Dinner",
                    "suggestion": "Detailed healthy meal idea",
                    "benefits": "Why this helps their condition"
                }}
            ],
            "exercisePlan": [
                {{
                    "activity": "Name of exercise",
                    "duration": "How many minutes",
                    "frequency": "How many times a week",
                    "precautions": "Safety warnings based on their health"
                }}
            ]
        }}
        """
        
        response = gemini.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(response_mime_type="application/json")
        )
        
        lifestyle_data = json.loads(response.text)
        print("✅ Lifestyle Plan generated successfully!")
        
        return JSONResponse(content={"status": "success", "data": lifestyle_data})

    except Exception as e:
        print("\n❌ LIFESTYLE ENGINE ERROR:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)
    
# --- 5. VOICE SYMPTOM ANALYZER ---
@app.post("/analyze-symptoms-audio")
async def analyze_symptoms_audio(
    audio: UploadFile = File(...),
    patient_context: str = Form(default="No history provided."),
    lat: Optional[float] = Form(default=None),
    lon: Optional[float] = Form(default=None)
):
    import uuid
    try:
        mime_type = audio.content_type or "audio/webm"
        print(f"\n🎙️ Symptom Analysis Audio Received: {audio.filename} ({mime_type})")
        print(f"🔒 Patient Context: {patient_context[:100]}...")
        
        gemini = get_gemini_client()
        if not gemini:
            return JSONResponse(
                content={"status": "error", "message": "GEMINI_API_KEY is not configured in backend-ai/.env. Please configure your key to analyze audio symptoms."},
                status_code=400
            )

        audio_bytes = await audio.read()
        
        location_context = ""
        if lat and lon:
            location_context = f"\nTHE PATIENT IS CURRENTLY AT LATITUDE: {lat}, LONGITUDE: {lon}.\n"

        prompt = f"""
        You are an elite Medical Consultant AI. You have received an audio file where a patient is describing their symptoms.
        {location_context}
        HERE IS THE PATIENT'S ACTUAL MEDICAL RECORD (YOUR SOURCE OF TRUTH):
        {patient_context}

        TASK:
        1. Transcribe the audio exactly.
        2. Identify the language spoken.
        3. Analyze the symptoms and provide:
           - The likely condition.
           - Immediate safe remedies.
           - Suggested tablets/drugs ONLY if you are absolutely sure of the safety and it is an over-the-counter medicine. CROSS-REFERENCE WITH THEIR MEDICAL RECORD TO AVOID DANGEROUS DRUG INTERACTIONS. If unsure, state "Consult Doctor".
           - Safety precautions.
        4. Identify affected body parts from this list: ["head", "neck", "chest", "stomach", "pelvis", "arm_left", "arm_right", "leg_left", "leg_right", "back"]. Return an array of these precise strings. Return empty array if not applicable.
        5. Draft a 'voiceResponse' that speaks directly back to the patient IN THE EXACT SAME LANGUAGE they used. It should cross-reference their history context if relevant.
        6. If latitude and longitude are provided, determine the exact medical specialist or facility needed. Use Google Search to find exactly 3 real, currently open hospitals/clinics near this location that match this exact need.
        
        Return ONLY a JSON object perfectly formatted inside a ```json block with this exact structure:
        {{
            "transcription": "The spoken words",
            "detectedLanguage": "The language code (e.g., 'en', 'es', 'hi', 'te', 'ta', 'fr')",
            "likelyCondition": "String",
            "immediateRemedies": ["String", "String"],
            "suggestedTablets": ["String", "String"],
            "safetyPrecautions": ["String", "String"],
            "affected_body_parts": ["string from the allowed list"],
            "voiceResponse": "The text to speak back to the user in their native language.",
            "recommendedSpecialist": "string (or null if no location)",
            "hospitals": [
                {{
                    "name": "string",
                    "address": "string",
                    "isOpen": true,
                    "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=..."
                }}
            ]
        }}
        """
        
        audio_part = types.Part.from_bytes(
            data=audio_bytes,
            mime_type=mime_type
        )
        
        config_kwargs = {}
        if lat and lon:
            config_kwargs["tools"] = [{"google_search": {}}]
        else:
            config_kwargs["response_mime_type"] = "application/json"

        response = gemini.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt, audio_part],
            config=types.GenerateContentConfig(**config_kwargs)
        )
        
        raw_text = response.text
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json\n", "", 1)
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
        elif raw_text.startswith("```"):
            raw_text = raw_text.replace("```\n", "", 1)
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
        
        extracted_data = json.loads(raw_text.strip())
        print(f"✅ Voice Analysis complete. Detected Lang: {extracted_data.get('detectedLanguage')}")

        # Generate Audio Response
        lang_code = extracted_data.get('detectedLanguage', 'en')
        if len(lang_code) > 2 and '-' not in lang_code:
            lang_code = lang_code[:2]

        audio_text = extracted_data.get('voiceResponse', 'Analysis complete.')
        try:
            tts = gTTS(text=audio_text, lang=lang_code)
        except ValueError:
            # fallback to english if language not supported by gtts
            print(f"⚠️ gTTS language '{lang_code}' not supported. Falling back to 'en'.")
            tts = gTTS(text=audio_text, lang='en')

        uid = str(uuid.uuid4())[:8]
        a_name = f"symptom_reply_{uid}.mp3"
        a_path = os.path.join("audio_reports", a_name)
        tts.save(a_path)
        
        extracted_data["voiceReportUrl"] = f"http://localhost:8000/audio/{a_name}"
        
        return JSONResponse(content={"status": "success", "data": extracted_data})
        
    except Exception as e:
        print("\n❌ AUDIO SYMPTOM ANALYZER ERROR:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

class SymptomTextRequest(BaseModel):
    text: str
    patient_context: str = "No history provided."
    lat: Optional[float] = None
    lon: Optional[float] = None

@app.post("/analyze-symptoms-text")
async def analyze_symptoms_text(request: SymptomTextRequest):
    import uuid
    try:
        user_text = request.text
        context = request.patient_context
        print(f"\n📝 Symptom Analysis Text Received: {user_text}")
        print(f"🔒 Patient Context: {context[:100]}...")
        
        gemini = get_gemini_client()
        if not gemini:
            return JSONResponse(
                content={"status": "error", "message": "GEMINI_API_KEY is not configured in backend-ai/.env. Please configure your key to analyze text symptoms."},
                status_code=400
            )

        location_context = ""
        if request.lat and request.lon:
            location_context = f"\nTHE PATIENT IS CURRENTLY AT LATITUDE: {request.lat}, LONGITUDE: {request.lon}.\n"

        prompt = f"""
        You are an elite Medical Consultant AI. You have received a text where a patient is describing their symptoms.
        {location_context}
        Patient Text: "{user_text}"
        
        HERE IS THE PATIENT'S ACTUAL MEDICAL RECORD (YOUR SOURCE OF TRUTH):
        {context}

        TASK:
        1. Identify the language the patient used.
        2. Analyze the symptoms and provide:
           - The likely condition.
           - Immediate safe remedies.
           - Suggested tablets/drugs ONLY if you are absolutely sure of the safety and it is an over-the-counter medicine. CROSS-REFERENCE WITH THEIR MEDICAL RECORD TO AVOID DANGEROUS DRUG INTERACTIONS. If unsure, state "Consult Doctor".
           - Safety precautions.
        4. Identify affected body parts from this list: ["head", "neck", "chest", "stomach", "pelvis", "arm_left", "arm_right", "leg_left", "leg_right", "back"]. Return an array of these precise strings. Return empty array if not applicable.
        5. Draft a 'voiceResponse' that speaks directly back to the patient IN THE EXACT SAME LANGUAGE they used. It should cross-reference their history context if relevant.
        6. If latitude and longitude are provided, determine the exact medical specialist or facility needed. Use Google Search to find exactly 3 real, currently open hospitals/clinics near this location that match this exact need.
        
        Return ONLY a JSON object perfectly formatted inside a ```json block with this exact structure:
        {{
            "transcription": "The original text provided",
            "detectedLanguage": "The language code (e.g., 'en', 'es', 'hi', 'te', 'ta', 'fr')",
            "likelyCondition": "String",
            "immediateRemedies": ["String", "String"],
            "suggestedTablets": ["String", "String"],
            "safetyPrecautions": ["String", "String"],
            "affected_body_parts": ["string from the allowed list"],
            "voiceResponse": "The text to speak back to the user in their native language.",
            "recommendedSpecialist": "string (or null if no location)",
            "hospitals": [
                {{
                    "name": "string",
                    "address": "string",
                    "isOpen": true,
                    "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=..."
                }}
            ]
        }}
        """
        
        config_kwargs = {}
        if request.lat and request.lon:
            config_kwargs["tools"] = [{"google_search": {}}]
        else:
            config_kwargs["response_mime_type"] = "application/json"

        response = gemini.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt],
            config=types.GenerateContentConfig(**config_kwargs)
        )
        
        raw_text = response.text
        if raw_text.startswith("```json"):
            raw_text = raw_text.replace("```json\n", "", 1)
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
        elif raw_text.startswith("```"):
            raw_text = raw_text.replace("```\n", "", 1)
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

        extracted_data = json.loads(raw_text.strip())
        print(f"✅ Text Analysis complete. Detected Lang: {extracted_data.get('detectedLanguage')}")

        # Generate Audio Response
        lang_code = extracted_data.get('detectedLanguage', 'en')
        if len(lang_code) > 2 and '-' not in lang_code:
            lang_code = lang_code[:2]

        audio_text = extracted_data.get('voiceResponse', 'Analysis complete.')
        try:
            tts = gTTS(text=audio_text, lang=lang_code)
        except ValueError:
            print(f"⚠️ gTTS language '{lang_code}' not supported. Falling back to 'en'.")
            tts = gTTS(text=audio_text, lang='en')

        uid = str(uuid.uuid4())[:8]
        a_name = f"symptom_reply_{uid}.mp3"
        a_path = os.path.join("audio_reports", a_name)
        tts.save(a_path)
        
        extracted_data["voiceReportUrl"] = f"http://localhost:8000/audio/{a_name}"
        
        return JSONResponse(content={"status": "success", "data": extracted_data})
        
    except Exception as e:
        print("\n❌ TEXT SYMPTOM ANALYZER ERROR:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

# --- 6. DERMATOLOGY IMAGE ANALYZER ---
@app.post("/analyze-skin")
async def analyze_skin(
    image: UploadFile = File(...),
    lat: Optional[float] = Form(default=None),
    lon: Optional[float] = Form(default=None)
):
    try:
        print(f"\n🔬 Dermatology Analysis Started for: {image.filename}")
        gemini = get_gemini_client()
        image_data = await image.read()
        img = Image.open(io.BytesIO(image_data))
        
        # Ensure image is in RGB
        if img.mode != 'RGB':
            img = img.convert('RGB')
            
        formatted_results = []
        top_prediction = None
        max_score = -1

        # If local HuggingFace classifier is available, run it
        if skin_classifier is not None:
            predictions = skin_classifier(img)
            for pred in predictions:
                score = round(pred['score'] * 100, 2)
                label = pred['label']
                formatted_results.append({
                    "label": label,
                    "confidence": score
                })
                if score > max_score:
                    max_score = score
                    top_prediction = label
        elif gemini:
            # Fallback to Gemini Multimodal Vision Classifier
            print("🧠 Running Dermatology Classification via Gemini Vision AI...")
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            skin_img_part = types.Part.from_bytes(data=img_byte_arr.getvalue(), mime_type="image/jpeg")
            
            vision_prompt = """
            You are an elite Clinical Dermatologist AI. Analyze this image of a patient's skin condition or lesion.
            Provide the top 3 differential diagnoses with realistic confidence percentages (e.g. 75, 15, 10).
            Return STRICTLY a JSON object:
            {
                "predictions": [
                    {"label": "Specific condition or lesion name", "confidence": 75.0},
                    {"label": "Alternative differential diagnosis", "confidence": 15.0},
                    {"label": "Other possible condition", "confidence": 10.0}
                ]
            }
            """
            v_resp = gemini.models.generate_content(
                model='gemini-2.5-flash',
                contents=[vision_prompt, skin_img_part],
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            v_data = json.loads(v_resp.text)
            formatted_results = v_data.get("predictions", [{"label": "Dermatological Lesion / Rash", "confidence": 85.0}])
            if formatted_results:
                top_prediction = formatted_results[0].get("label")
                max_score = formatted_results[0].get("confidence", 85.0)
        else:
            return JSONResponse(
                content={"status": "error", "message": "GEMINI_API_KEY is not configured in backend-ai/.env."},
                status_code=400
            )

        print("✅ Dermatology Analysis Complete:", formatted_results)

        # Retrieve Safe Recommendations from Gemini
        gemini_recommendations = None
        if top_prediction and gemini:
            try:
                print(f"🧠 Querying Gemini for recommendations on: {top_prediction}")
                
                location_context = ""
                if lat and lon:
                    location_context = f"\nTHE PATIENT IS CURRENTLY AT LATITUDE: {lat}, LONGITUDE: {lon}.\n"

                prompt = f"""
                You are an elite Medical Consultant AI assisting a Dermatologist.
                A clinical analysis of the patient's skin identified: {top_prediction} (Confidence: {max_score}%).
                {location_context}
                
                TASK:
                1. Provide safety precautions the patient should take immediately for '{top_prediction}'.
                2. Suggest tablets/drugs or ointments ONLY if you are absolutely sure of the safety and it is an OVER-THE-COUNTER (OTC) medicine commonly used for this exact condition. 
                3. If the condition is severe (like Melanoma or Carcinoma), explicitly state "Consult Doctor Immediately" in the suggested tablets array and do NOT hallucinate or suggest random medications.
                4. If latitude and longitude are provided, determine the exact medical specialist needed (e.g., Dermatologist, Oncologist). Use Google Search to find exactly 3 real, currently open clinics/hospitals near this location that match this exact need.
                
                Return ONLY a JSON object perfectly formatted inside a ```json block with this exact structure:
                {{
                    "suggestedTablets": ["List", "of", "strings"],
                    "safetyPrecautions": ["List", "of", "strings"],
                    "recommendedSpecialist": "string (or null if no location)",
                    "hospitals": [
                        {{
                            "name": "string",
                            "address": "string",
                            "isOpen": true,
                            "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=..."
                        }}
                    ]
                }}
                """
                
                config_kwargs = {}
                if lat and lon:
                    config_kwargs["tools"] = [{"google_search": {}}]
                else:
                    config_kwargs["response_mime_type"] = "application/json"

                response = gemini.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[prompt],
                    config=types.GenerateContentConfig(**config_kwargs)
                )
                
                raw_text = response.text
                if raw_text.startswith("```json"):
                    raw_text = raw_text.replace("```json\n", "", 1)
                    if raw_text.endswith("```"):
                        raw_text = raw_text[:-3]
                elif raw_text.startswith("```"):
                    raw_text = raw_text.replace("```\n", "", 1)
                    if raw_text.endswith("```"):
                        raw_text = raw_text[:-3]

                gemini_recommendations = json.loads(raw_text.strip())
                print(f"✅ Gemini Recommendations generated successfully.")
            except Exception as gemini_err:
                print(f"⚠️ Failed to get Gemini recommendations for skin condition. {gemini_err}")
                gemini_recommendations = None

        return JSONResponse(content={
            "status": "success", 
            "predictions": formatted_results, 
            "recommendations": gemini_recommendations
        })
        
    except Exception as e:
        print("\n❌ DERMATOLOGY ANALYZER ERROR:")
        traceback.print_exc()
        return JSONResponse(content={"status": "error", "message": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)