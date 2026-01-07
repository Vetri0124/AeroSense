import os
import sys

# Add the server directory to the path so that imports in main.py work
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "server"))

from main import app
