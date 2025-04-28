#!/usr/bin/env python3
"""
Flask application for WhatsApp clone backend.
"""
import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import our modules
from db import get_storage

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SESSION_SECRET', 'whatsapp-clone-secret')
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# Initialize SocketIO with CORS support
socketio = SocketIO(app, cors_allowed_origins="*")

# Initialize storage
storage = get_storage()

# Import routes after initializing app, socketio, and storage
from routes import register_routes

# Register API routes
register_routes(app, storage, socketio)

# SocketIO event handlers
@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"Client connected: {request.sid}")

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"Client disconnected: {request.sid}")

@socketio.on('join')
def handle_join(data):
    """Join a chat room"""
    user_id = data.get('userId')
    chat_id = data.get('chatId')
    
    if user_id and chat_id:
        # Verify user is a participant in this chat
        if storage.is_chat_participant(chat_id, user_id):
            room = f"chat_{chat_id}"
            join_room(room)
            print(f"User {user_id} joined room {room}")
            
            # Notify other participants
            emit('user_joined', {
                'userId': user_id,
                'chatId': chat_id,
                'timestamp': round(time.time() * 1000)
            }, room=room, skip_sid=request.sid)
        else:
            emit('error', {'message': 'Not authorized to join this chat'})

@socketio.on('leave')
def handle_leave(data):
    """Leave a chat room"""
    user_id = data.get('userId')
    chat_id = data.get('chatId')
    
    if user_id and chat_id:
        room = f"chat_{chat_id}"
        leave_room(room)
        print(f"User {user_id} left room {room}")
        
        # Notify other participants
        emit('user_left', {
            'userId': user_id,
            'chatId': chat_id,
            'timestamp': round(time.time() * 1000)
        }, room=room)

@socketio.on('message')
def handle_message(data):
    """Handle new message"""
    user_id = data.get('userId')
    chat_id = data.get('chatId')
    content = data.get('content')
    
    if user_id and chat_id and content:
        # Verify user is a participant in this chat
        if storage.is_chat_participant(chat_id, user_id):
            # Create new message
            message = storage.create_message({
                'chatId': chat_id,
                'senderId': user_id,
                'content': content,
                'timestamp': round(time.time() * 1000),
                'status': 'sent'
            })
            
            # Create message status for sender
            storage.create_message_status({
                'messageId': message['id'],
                'userId': user_id,
                'status': 'sent',
                'timestamp': round(time.time() * 1000)
            })
            
            # Get all chat participants
            participants = storage.get_chat_participants(chat_id)
            
            # Create message status for other participants
            for participant in participants:
                if participant['userId'] != user_id:
                    storage.create_message_status({
                        'messageId': message['id'],
                        'userId': participant['userId'],
                        'status': 'delivered',
                        'timestamp': round(time.time() * 1000)
                    })
            
            # Broadcast message to room
            room = f"chat_{chat_id}"
            emit('message', message, room=room)
        else:
            emit('error', {'message': 'Not authorized to send messages to this chat'})

@socketio.on('typing')
def handle_typing(data):
    """Handle typing indicator"""
    user_id = data.get('userId')
    chat_id = data.get('chatId')
    is_typing = data.get('isTyping', False)
    
    if user_id and chat_id:
        # Verify user is a participant in this chat
        if storage.is_chat_participant(chat_id, user_id):
            room = f"chat_{chat_id}"
            emit('typing', {
                'userId': user_id,
                'chatId': chat_id,
                'isTyping': is_typing
            }, room=room, skip_sid=request.sid)

@socketio.on('read')
def handle_read(data):
    """Handle message read receipts"""
    user_id = data.get('userId')
    message_id = data.get('messageId')
    
    if user_id and message_id:
        # Update message status to read
        message_status = storage.update_message_status(message_id, user_id, 'read')
        
        if message_status:
            # Get the message from chat messages
            chat_messages = []
            for chat_id_str in range(1, 100):  # Attempt to get messages from chats with IDs 1-99
                try:
                    chat_messages.extend(storage.get_messages_by_chat_id(chat_id_str))
                except:
                    pass
            message = next((m for m in chat_messages if m['id'] == message_id), None)
            
            if message:
                # Notify sender
                emit('message_read', {
                    'messageId': message_id,
                    'userId': user_id,
                    'timestamp': round(time.time() * 1000)
                }, room=f"user_{message['senderId']}")

if __name__ == '__main__':
    # For development only - in production, use a proper WSGI server
    port = int(os.getenv('PORT', 5001))
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)