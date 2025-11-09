"""
Vercel serverless function entry point for Flask app
"""
import sys
import os
from pathlib import Path

# Add Backend directory to path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Change to Backend directory  
os.chdir(str(backend_dir))

# Import Flask app
from app.init import create_app

# Create app instance - Vercel will automatically handle it
app = create_app()
