import os
import sys

# Get the absolute path of the current file's directory
current_dir = os.path.dirname(os.path.abspath(__file__))
# Get the project root directory
project_root = os.path.dirname(current_dir)

# Add the server directory to the path so that imports in main.py work
server_dir = os.path.join(project_root, "server")
if server_dir not in sys.path:
    sys.path.append(server_dir)

# Also add the root to sys.path
if project_root not in sys.path:
    sys.path.append(project_root)

# Import the FastAPI app
try:
    from main import app
    # Export as handler for Vercel
    handler = app
except ImportError as e:
    print(f"ImportError in api/index.py: {e}")
    # Create a basic fallback app to show the error
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/api/health")
    def health():
        return {"status": "error", "message": str(e), "sys_path": sys.path}
    handler = app
