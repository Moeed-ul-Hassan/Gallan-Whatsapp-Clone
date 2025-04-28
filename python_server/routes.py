#!/usr/bin/env python3
"""API routes for the WhatsApp clone application."""
import os
import time
import json
from flask import Flask, request, jsonify, session
import bcrypt
from functools import wraps
from typing import Dict, List, Any, Optional, Callable

# Import our modules
from openai_service import generate_conversation_starters, ConversationContext

def auth_required(f: Callable) -> Callable:
    """Decorator to check if user is authenticated"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        """Wrapper function"""
        if 'user_id' not in session:
            return jsonify({'message': 'Unauthorized'}), 401
        return f(*args, **kwargs)
    return decorated_function

def register_routes(app: Flask, storage, socketio) -> None:
    """Register all routes for the application"""
    
    @app.route('/api/register', methods=['POST'])
    def register():
        """Register a new user"""
        data = request.json
        
        # Validate request data
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Missing username or password'}), 400
        
        # Check if username already exists
        existing_user = storage.get_user_by_username(data['username'])
        if existing_user:
            return jsonify({'message': 'Username already exists'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
        
        # Create user
        user_data = {
            'username': data['username'],
            'password': hashed_password,
            'displayName': data.get('displayName', data['username']),
            'status': data.get('status', 'Hey there! I am using WhatsApp.'),
        }
        
        try:
            user = storage.create_user(user_data)
            
            # Set session
            session['user_id'] = user['id']
            
            return jsonify(user), 201
        
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    
    @app.route('/api/login', methods=['POST'])
    def login():
        """Login a user"""
        data = request.json
        
        # Validate request data
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'message': 'Missing username or password'}), 400
        
        # Check if username exists
        user = storage.get_user_by_username(data['username'])
        if not user:
            return jsonify({'message': 'Invalid username or password'}), 401
        
        # Check password
        if not bcrypt.checkpw(data['password'].encode(), user['password'].encode()):
            return jsonify({'message': 'Invalid username or password'}), 401
        
        # Set session
        session['user_id'] = user['id']
        
        # Update user status
        user = storage.update_user_status(user['id'], True)
        
        return jsonify(user), 200
    
    @app.route('/api/user', methods=['GET'])
    @auth_required
    def get_current_user():
        """Get current user"""
        user_id = session['user_id']
        user = storage.get_user(user_id)
        
        if not user:
            session.pop('user_id', None)
            return jsonify({'message': 'User not found'}), 404
        
        # Create copy without password
        user_copy = user.copy()
        user_copy.pop('password', None)
        
        return jsonify(user_copy), 200
    
    @app.route('/api/logout', methods=['POST'])
    @auth_required
    def logout():
        """Logout a user"""
        user_id = session['user_id']
        
        # Update user status
        storage.update_user_status(user_id, False)
        
        # Clear session
        session.pop('user_id', None)
        
        return jsonify({'message': 'Logged out successfully'}), 200
    
    @app.route('/api/users/<int:user_id>', methods=['PATCH'])
    @auth_required
    def update_user(user_id: int):
        """Update user"""
        current_user_id = session['user_id']
        
        # Check if user is updating their own profile
        if current_user_id != user_id:
            return jsonify({'message': 'Unauthorized'}), 401
        
        data = request.json
        
        try:
            user = storage.update_user(user_id, data)
            return jsonify(user), 200
        
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    
    @app.route('/api/contacts', methods=['GET'])
    @auth_required
    def get_contacts():
        """Get user contacts"""
        user_id = session['user_id']
        
        try:
            contacts = storage.get_contacts_by_user_id(user_id)
            return jsonify(contacts), 200
        
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    
    @app.route('/api/contacts', methods=['POST'])
    @auth_required
    def create_contact():
        """Create new contact"""
        user_id = session['user_id']
        data = request.json
        
        # Validate request data
        if not data or not data.get('contactId'):
            return jsonify({'message': 'Missing contact ID'}), 400
        
        # Check if contact exists
        contact_user = storage.get_user(data['contactId'])
        if not contact_user:
            return jsonify({'message': 'Contact user not found'}), 404
        
        # Create contact data
        contact_data = {
            'userId': user_id,
            'contactId': data['contactId'],
            'displayName': data.get('displayName', contact_user['displayName']),
            'isScholar': data.get('isScholar', False),
        }
        
        try:
            contact = storage.create_contact(contact_data)
            return jsonify(contact), 201
        
        except ValueError as e:
            return jsonify({'message': str(e)}), 400
        
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    
    @app.route('/api/chats', methods=['GET'])
    @auth_required
    def get_chats():
        """Get user chats"""
        user_id = session['user_id']
        
        try:
            chats = storage.get_chats_by_user_id(user_id)
            return jsonify(chats), 200
        
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    
    @app.route('/api/chats', methods=['POST'])
    @auth_required
    def create_chat():
        """Create new chat"""
        user_id = session['user_id']
        data = request.json
        
        # Validate request data
        if not data or not data.get('participants'):
            return jsonify({'message': 'Missing participants'}), 400
        
        # Make sure the current user is included in participants
        participant_ids = [p['userId'] for p in data.get('participants', [])]
        if user_id not in participant_ids:
            participant_ids.append(user_id)
        
        # Check if chat already exists for these participants
        existing_chat = storage.get_chat_by_participants(participant_ids)
        if existing_chat:
            return jsonify(existing_chat), 200
        
        # Create chat data
        chat_data = {
            'type': data.get('type', 'personal'),
            'name': data.get('name'),
            'createdBy': user_id,
            'participants': [{'userId': pid} for pid in participant_ids],
        }
        
        try:
            chat = storage.create_chat(chat_data)
            return jsonify(chat), 201
        
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    
    @app.route('/api/chats/<int:chat_id>/messages', methods=['GET'])
    @auth_required
    def get_messages(chat_id: int):
        """Get chat messages"""
        user_id = session['user_id']
        
        # Check if user is a participant
        if not storage.is_chat_participant(chat_id, user_id):
            return jsonify({'message': 'Unauthorized'}), 401
        
        try:
            messages = storage.get_messages_by_chat_id(chat_id)
            return jsonify(messages), 200
        
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    
    @app.route('/api/messages', methods=['POST'])
    @auth_required
    def create_message():
        """Create new message"""
        user_id = session['user_id']
        data = request.json
        
        # Validate request data
        if not data or not data.get('chatId') or not data.get('content'):
            return jsonify({'message': 'Missing chat ID or content'}), 400
        
        chat_id = data['chatId']
        
        # Check if user is a participant
        if not storage.is_chat_participant(chat_id, user_id):
            return jsonify({'message': 'Unauthorized'}), 401
        
        # Create message data
        message_data = {
            'chatId': chat_id,
            'senderId': user_id,
            'content': data['content'],
            'type': data.get('type', 'text'),
            'quotedMessageId': data.get('quotedMessageId'),
            'timestamp': int(time.time() * 1000),
            'status': 'sent',
        }
        
        try:
            message = storage.create_message(message_data)
            
            # Create message status for sender
            storage.create_message_status({
                'messageId': message['id'],
                'userId': user_id,
                'status': 'sent',
                'timestamp': int(time.time() * 1000),
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
                        'timestamp': int(time.time() * 1000),
                    })
            
            # Broadcast message to room
            socketio.emit('message', message, room=f"chat_{chat_id}")
            
            return jsonify(message), 201
        
        except Exception as e:
            return jsonify({'message': str(e)}), 500
    
    @app.route('/api/contacts/<int:contact_id>/conversation-starters', methods=['GET'])
    @auth_required
    def get_conversation_starters(contact_id: int):
        """Get conversation starters for a contact"""
        user_id = session['user_id']
        
        # Get user
        user = storage.get_user(user_id)
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        # Get contact
        contact = storage.get_contact_by_user_and_contact_id(user_id, contact_id)
        if not contact:
            return jsonify({'message': 'Contact not found'}), 404
        
        # Get contact user
        contact_user = storage.get_user(contact_id)
        if not contact_user:
            return jsonify({'message': 'Contact user not found'}), 404
        
        # Check if chat exists
        chat = storage.get_chat_by_participants([user_id, contact_id])
        
        # Get recent messages if chat exists
        recent_messages = []
        if chat:
            # Get all messages for chat
            all_messages = storage.get_messages_by_chat_id(chat['id'])
            # Get most recent 5 messages
            recent_messages = all_messages[-5:] if all_messages else []
        
        # Create context
        context = ConversationContext(
            user=user,
            contact={
                'displayName': contact['displayName'],
                'status': contact_user.get('status', ''),
                'isScholar': contact.get('isScholar', False),
            },
            recent_messages=recent_messages
        )
        
        try:
            # Generate conversation starters
            starters = generate_conversation_starters(context)
            return jsonify(starters), 200
        
        except Exception as e:
            return jsonify({'message': str(e)}), 500