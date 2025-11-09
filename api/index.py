"""
Vercel serverless function - Flask backend
Vercel auto-detects Flask apps when exported as 'app'
"""
import sys
import os
from pathlib import Path

# Get project root and backend path
project_root = Path(__file__).parent.parent
backend_path = project_root / "Backend"

# Add Backend to Python path
sys.path.insert(0, str(backend_path))

# Change to Backend directory
os.chdir(str(backend_path))

# Import and create Flask app
from app.init import create_app

# Export as 'app' - Vercel auto-detects Flask
app = create_app()
