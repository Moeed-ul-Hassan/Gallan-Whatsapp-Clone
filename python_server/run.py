#!/usr/bin/env python3
"""
Main entry point for the WhatsApp clone Python backend.
"""
import os
from dotenv import load_dotenv
from app import app, socketio

# Load environment variables
load_dotenv()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)