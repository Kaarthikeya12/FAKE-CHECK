# app/routes/factcheck_routes.py

import sys
from pathlib import Path
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os


# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from services.factcheck_service import FactCheckService
from services.image_verification_service import ImageVerificationService

factcheck_bp = Blueprint('factcheck', __name__)

# Initialize service
factcheck_service = FactCheckService()

@factcheck_bp.route('/verify/text', methods=['POST'])
def verify_text():
    """
    Verify text claim
    
    Body:
    {
        "text": "Claim to verify"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'error': 'Missing required field: text',
                'example': {'text': 'Your claim here'}
            }), 400
        
        text = data['text'].strip()
        
        if not text:
            return jsonify({'error': 'Text cannot be empty'}), 400
        
        # Verify claim
        result = factcheck_service.verify_text(text)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@factcheck_bp.route('/verify/url', methods=['POST'])
def verify_url():
    """
    Verify article from URL
    
    Body:
    {
        "url": "https://example.com/article"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'url' not in data:
            return jsonify({
                'error': 'Missing required field: url',
                'example': {'url': 'https://example.com/article'}
            }), 400
        
        url = data['url'].strip()
        
        if not url.startswith(('http://', 'https://')):
            return jsonify({'error': 'Invalid URL format'}), 400
        
        # Verify URL
        result = factcheck_service.verify_url(url)
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@factcheck_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    import os
    
    return jsonify({
        'status': 'healthy',
        'service': 'Fact Check Service',
        'gemini_configured': bool(os.getenv('GEMINI_API_KEY')),
        'serper_configured': bool(os.getenv('SERPER_API_KEY')),
        'version': '1.0.0'
    }), 200


@factcheck_bp.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint with sample claim"""
    
    sample_claim = "The Earth is round"
    
    try:
        result = factcheck_service.verify_text(sample_claim)
        
        return jsonify({
            'message': 'Test successful',
            'sample_claim': sample_claim,
            'result': result
        }), 200
        
    except Exception as e:
        return jsonify({
            'message': 'Test failed',
            'error': str(e)
        }), 500
       

image_bp = Blueprint('image', __name__)

# Initialize service
image_service = ImageVerificationService()

# Configure upload folder
UPLOAD_FOLDER = '/tmp/fakecheck_uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'}

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@image_bp.route('/verify/image', methods=['POST'])
def verify_image():
    """
    Verify uploaded image for misinformation
    
    Accepts:
    - multipart/form-data with 'image' field (file upload)
    
    Returns:
    {
        "verdict": "LIKELY TRUE/FALSE/UNCERTAIN",
        "credibility_score": 0-100,
        "extracted_text": "...",
        "manipulation_detected": true/false,
        "red_flags": [...],
        "reasoning": "..."
    }
    """
    
    try:
        # Check if image file is in request
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image file provided',
                'help': 'Send image as multipart/form-data with field name "image"',
                'example': 'curl -X POST -F "image=@photo.jpg" http://localhost:5000/verify/image'
            }), 400
        
        file = request.files['image']
        
        # Check if filename is empty
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Invalid file type',
                'allowed_types': list(ALLOWED_EXTENSIONS)
            }), 400
        
        # Save file temporarily
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Verify image
        result = image_service.verify_image(filepath)
        
        # Clean up - delete temporary file
        try:
            os.remove(filepath)
        except:
            pass
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@image_bp.route('/verify/image/url', methods=['POST'])
def verify_image_url():
    """
    Verify image from URL
    
    Body:
    {
        "image_url": "https://example.com/image.jpg"
    }
    """
    
    try:
        data = request.get_json()
        
        if not data or 'image_url' not in data:
            return jsonify({
                'error': 'Missing required field: image_url',
                'example': {'image_url': 'https://example.com/image.jpg'}
            }), 400
        
        image_url = data['image_url'].strip()
        
        if not image_url.startswith(('http://', 'https://')):
            return jsonify({'error': 'Invalid URL format'}), 400
        
        # Download image
        import requests
        import tempfile
        
        response = requests.get(image_url, timeout=10)
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to download image'}), 400
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            tmp_file.write(response.content)
            tmp_filepath = tmp_file.name
        
        # Verify image
        result = image_service.verify_image(tmp_filepath)
        
        # Clean up
        try:
            os.remove(tmp_filepath)
        except:
            pass
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500


@image_bp.route('/test/image', methods=['GET'])
def test_image_endpoint():
    """Test endpoint - verifies a sample image"""
    
    return jsonify({
        'message': 'Image verification service is running',
        'endpoints': {
            'verify_image': 'POST /verify/image (upload file)',
            'verify_image_url': 'POST /verify/image/url (provide URL)'
        },
        'accepted_formats': list(ALLOWED_EXTENSIONS),
        'status': 'ready'
    }), 200