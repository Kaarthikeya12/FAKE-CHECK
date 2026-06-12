"""
WSGI entry point for Render deployment
Fixed version that handles path issues
"""
import os
import sys
from pathlib import Path

# Get the directory where this file is located
current_dir = Path(__file__).resolve().parent

# Add current directory to Python path
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

# Change to the directory containing wsgi.py
os.chdir(str(current_dir))

# Import and create app
try:
    from app.init import create_app
except ImportError as e:
    # Debug: Print path information
    print(f"Current directory: {os.getcwd()}")
    print(f"Python path: {sys.path}")
    print(f"Files in current dir: {os.listdir('.')}")
    raise

# Create Flask app instance
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

