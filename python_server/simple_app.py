#!/usr/bin/env python3
"""A simple Flask application to verify our setup."""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "ok", "message": "Python server is running!"}), 200

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print("Client connected!")
    return {"status": "connected"}

if __name__ == '__main__':
    print("Starting simple Flask application...")
    socketio.run(app, host='0.0.0.0', port=5001, debug=True, allow_unsafe_werkzeug=True)