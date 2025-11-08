import os
import sys
from pathlib import Path
from flask import Flask
from flask_cors import CORS

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from utils import config
from routes import factcheck_bp
from routes import image_bp


def create_app():
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    
   
    
    app.register_blueprint(factcheck_bp)
    app.register_blueprint(image_bp)
    

    return app