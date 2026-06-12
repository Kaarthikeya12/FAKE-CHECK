#!/bin/bash
# Startup script for Render

# Try multiple paths to find Backend directory
if [ -d "/opt/render/project/src/Backend" ]; then
    cd /opt/render/project/src/Backend
elif [ -d "Backend" ]; then
    cd Backend
elif [ -f "wsgi.py" ]; then
    # Already in Backend directory
    :
else
    echo "ERROR: Cannot find Backend directory or wsgi.py"
    echo "Current directory: $(pwd)"
    echo "Contents:"
    ls -la
    exit 1
fi

# Print debug info
echo "Starting from: $(pwd)"
echo "wsgi.py exists: $([ -f wsgi.py ] && echo 'YES' || echo 'NO')"

# Set PYTHONPATH
export PYTHONPATH="$(pwd):$PYTHONPATH"

# Start gunicorn
exec gunicorn wsgi:app
