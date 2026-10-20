import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)

lat = 37.7749
lon = -122.4194
symptoms = "severe chest pain and left arm numbness"

prompt = f"""
You are an elite Medical AI.
A patient at latitude {lat}, longitude {lon} is experiencing: '{symptoms}'.
1. Determine the exact medical specialist or facility needed (e.g., 'Emergency Room', 'Cardiologist').
2. Use Google Search to find exactly 3 real, currently open hospitals/clinics near this location that match this exact need.
3. Return ONLY a JSON object perfectly formatted inside a ```json``` block with this structure:
{{
    "recommendedSpecialist": "string",
    "hospitals": [
        {{
            "name": "string",
            "address": "string",
            "isOpen": "boolean",
            "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=URL_ENCODED_NAME+ADDRESS"
        }}
    ]
}}
"""

try:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[{"google_search": {}}]
        )
    )
    print(response.text)
except Exception as e:
    print("Error:", e)
