# app/utils/config.py

import os
from dotenv import load_dotenv

load_dotenv()

# Upload folder path
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'uploads')

class Config:
    # Existing configs
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
    
    # NEW: Add these API keys
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    SERPER_API_KEY = os.getenv('SERPER_API_KEY')
   
    # Verification settings
    VERIFICATION_TIMEOUT = 10
    MAX_SEARCH_RESULTS = 10