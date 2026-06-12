"""
WSGI entry point for Render deployment
"""
import os
import sys
from pathlib import Path

# Get the absolute path of this file's directory
current_dir = Path(__file__).resolve().parent

# Add current directory to Python path (must be first)
if str(current_dir) not in sys.path:
    sys.path.insert(0, str(current_dir))

# Change working directory to where wsgi.py is located
os.chdir(str(current_dir))

# Import and create app
from app.init import create_app

# Create Flask app instance
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

