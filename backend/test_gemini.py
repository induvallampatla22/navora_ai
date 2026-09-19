import os
from dotenv import load_dotenv
load_dotenv()
import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY")
print(f"API KEY present: {bool(api_key)}")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    print("Model initialized")
    res = model.generate_content("Hello")
    print(f"Response: {res.text}")
except Exception as e:
    print(f"Error: {e}")
