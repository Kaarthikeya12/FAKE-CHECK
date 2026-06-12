#!/bin/bash
# Build script for Render deployment

set -e  # Exit on error

echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

echo "Upgrading pip..."
pip install --upgrade pip

echo "Installing requirements from $(pwd)/requirements.txt..."
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt
    echo "Requirements installed successfully"
else
    echo "ERROR: requirements.txt not found in $(pwd)"
    exit 1
fi

echo "Verifying gunicorn installation..."
python -c "import gunicorn; print(f'Gunicorn version: {gunicorn.__version__}')" || {
    echo "ERROR: Gunicorn not installed!"
    pip list | grep -i gunicorn || echo "Gunicorn not in pip list"
    exit 1
}

echo "Build complete!"

