from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os
import bcrypt
import json
import jwt
from datetime import datetime, timedelta

# Import our modules
from db import MongoStorage, InMemoryStorage, get_storage
from routes import register_routes

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv("SESSION_SECRET", "whatsapp-clone-secret")
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SECURE"] = os.getenv("ENV") == "production"

# Enable CORS
CORS(app, supports_credentials=True)

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize storage
storage = get_storage()

# Register all routes
register_routes(app, storage, socketio)

# Socket.IO event handlers
@socketio.on('connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Client disconnected: {request.sid}")

@socketio.on('message')
def handle_message(data):
    print(f"Received message: {data}")
    # Broadcast to all clients
    socketio.emit('message', data)

if __name__ == "__main__":
    # Use 0.0.0.0 to make the server accessible from the network
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)