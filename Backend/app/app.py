import sys
from init import create_app

if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

