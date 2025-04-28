from flask import request, jsonify, session
from flask_socketio import SocketIO
from functools import wraps
import bcrypt
import json
from datetime import datetime
import os
from openai_service import generate_conversation_starters, ConversationContext

# Auth middleware
def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('user_id'):
            return jsonify({"message": "Unauthorized"}), 401
        return f(*args, **kwargs)
    return decorated_function

def register_routes(app, storage, socketio):
    """Register all routes for the application"""
    
    # Auth routes
    @app.route('/api/auth/register', methods=['POST'])
    def register():
        try:
            data = request.json
            
            # Validate required fields
            if not data.get('username') or not data.get('password'):
                return jsonify({"message": "Username and password are required"}), 400
            
            # Check if username exists
            existing_user = storage.get_user_by_username(data['username'])
            if existing_user:
                return jsonify({"message": "Username already exists"}), 409
            
            # Hash password
            hashed_password = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt()).decode()
            
            # Create user
            user = storage.create_user({
                **data,
                'password': hashed_password
            })
            
            # Add Islamic scholar contacts for ALL new users
            try:
                # Create contact for Mufti Samar Abbas Qadri (ID: 2)
                storage.create_contact({
                    'userId': user['id'],
                    'contactId': 2,  # mufti_samar
                    'displayName': "Mufti Samar Abbas Qadri"
                })
                
                # Create contact for Mufti Naseer udin Naseer (ID: 3)
                storage.create_contact({
                    'userId': user['id'],
                    'contactId': 3,  # mufti_naseer
                    'displayName': "Mufti Naseer udin Naseer" 
                })
                
                print(f"Added Islamic scholar contacts for new user: {user['username']}")
            except Exception as e:
                print(f"Error adding Islamic scholar contacts: {e}")
            
            # Set user session
            session['user_id'] = user['id']
            
            # Update user status
            storage.update_user_status(user['id'], True)
            
            # Remove password from response
            user.pop('password', None)
            
            return jsonify(user), 201
        
        except Exception as e:
            print(f"Error in register: {e}")
            return jsonify({"message": "An error occurred during registration"}), 500
    
    @app.route('/api/auth/login', methods=['POST'])
    def login():
        try:
            data = request.json
            
            # Validate required fields
            if not data.get('username') or not data.get('password'):
                return jsonify({"message": "Username and password are required"}), 400
            
            # Get user
            user = storage.get_user_by_username(data['username'])
            if not user:
                return jsonify({"message": "Invalid username or password"}), 401
            
            # Check password
            if not bcrypt.checkpw(data['password'].encode(), user['password'].encode()):
                return jsonify({"message": "Invalid username or password"}), 401
            
            # Set user session
            session['user_id'] = user['id']
            
            # Update user status
            storage.update_user_status(user['id'], True)
            
            # Remove password from response
            user.pop('password', None)
            
            return jsonify(user), 200
        
        except Exception as e:
            print(f"Error in login: {e}")
            return jsonify({"message": "An error occurred during login"}), 500
    
    @app.route('/api/auth/me', methods=['GET'])
    @auth_required
    def get_current_user():
        user_id = session.get('user_id')
        user = storage.get_user(user_id)
        
        if not user:
            return jsonify({"message": "User not found"}), 404
        
        # Remove password from response
        user.pop('password', None)
        
        return jsonify(user), 200
    
    @app.route('/api/auth/logout', methods=['POST'])
    @auth_required
    def logout():
        user_id = session.get('user_id')
        
        # Update user status
        storage.update_user_status(user_id, False)
        
        # Clear session
        session.clear()
        
        return jsonify({"message": "Logged out successfully"}), 200
    
    # User routes
    @app.route('/api/users/<int:user_id>', methods=['PATCH'])
    @auth_required
    def update_user(user_id):
        try:
            current_user_id = session.get('user_id')
            
            # Ensure user can only update their own profile
            if user_id != current_user_id:
                return jsonify({"message": "Forbidden"}), 403
            
            data = request.json
            allowed_fields = ['displayName', 'status']
            update_data = {k: v for k, v in data.items() if k in allowed_fields}
            
            updated_user = storage.update_user(user_id, update_data)
            
            # Remove password from response
            updated_user.pop('password', None)
            
            return jsonify(updated_user), 200
        
        except Exception as e:
            print(f"Error in update_user: {e}")
            return jsonify({"message": "Failed to update user"}), 500
    
    # Contacts routes
    @app.route('/api/contacts', methods=['GET'])
    @auth_required
    def get_contacts():
        try:
            user_id = session.get('user_id')
            contacts = storage.get_contacts_by_user_id(user_id)
            return jsonify(contacts), 200
        
        except Exception as e:
            print(f"Error in get_contacts: {e}")
            return jsonify({"message": "Failed to fetch contacts"}), 500
    
    @app.route('/api/contacts', methods=['POST'])
    @auth_required
    def create_contact():
        try:
            user_id = session.get('user_id')
            data = request.json
            
            print(f"Adding contact with username: {data.get('username')}")
            
            # Find user by username
            contact_user = storage.get_user_by_username(data.get('username'))
            if not contact_user:
                print(f"User not found with username: {data.get('username')}")
                
                # Let's create a test user for demonstration purposes if username contains "test-"
                if data.get('username') and "test-" in data.get('username'):
                    # Create a test user
                    test_user = storage.create_user({
                        'username': data.get('username'),
                        'password': bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode(),
                        'displayName': data.get('displayName') or data.get('username'),
                        'status': "Hey there! I'm using Gallan",
                        'avatar': None
                    })
                    
                    print(f"Created test user: {test_user['username']}")
                    
                    # Create contact
                    contact = storage.create_contact({
                        'userId': user_id,
                        'contactId': test_user['id'],
                        'displayName': data.get('displayName') or test_user['displayName']
                    })
                    
                    return jsonify(contact), 201
                
                return jsonify({"message": "User not found. Please register this user first."}), 404
            
            # Can't add yourself as a contact
            if contact_user['id'] == user_id:
                return jsonify({"message": "Cannot add yourself as a contact"}), 400
            
            # Check if contact already exists
            existing_contact = storage.get_contact_by_user_and_contact_id(user_id, contact_user['id'])
            if existing_contact:
                return jsonify({"message": "Contact already exists"}), 409
            
            # Create contact
            contact = storage.create_contact({
                'userId': user_id,
                'contactId': contact_user['id'],
                'displayName': data.get('displayName') or contact_user['displayName']
            })
            
            return jsonify(contact), 201
        
        except Exception as e:
            print(f"Error in create_contact: {e}")
            return jsonify({"message": "Failed to add contact"}), 500
    
    # Chats routes
    @app.route('/api/chats', methods=['GET'])
    @auth_required
    def get_chats():
        try:
            user_id = session.get('user_id')
            chats = storage.get_chats_by_user_id(user_id)
            return jsonify(chats), 200
        
        except Exception as e:
            print(f"Error in get_chats: {e}")
            return jsonify({"message": "Failed to fetch chats"}), 500
    
    @app.route('/api/chats', methods=['POST'])
    @auth_required
    def create_chat():
        try:
            user_id = session.get('user_id')
            data = request.json
            
            contact_id = data.get('contactId')
            is_group = data.get('isGroup', False)
            
            # For individual chats, check if a chat already exists
            if not is_group:
                existing_chat = storage.get_chat_by_participants([user_id, contact_id])
                if existing_chat:
                    # Get formatted chat
                    formatted_chat = storage.get_chat_by_id(existing_chat['id'], user_id)
                    return jsonify(formatted_chat), 200
                
                # Get contact details
                contact_user = storage.get_user(contact_id)
                if not contact_user:
                    return jsonify({"message": "Contact not found"}), 404
                
                # Create a new chat
                chat = storage.create_chat({
                    'name': data.get('name') or contact_user['displayName'],
                    'isGroup': False,
                    'avatar': contact_user.get('avatar')
                })
                
                # Add participants
                storage.add_chat_participant({'chatId': chat['id'], 'userId': user_id, 'isAdmin': False})
                storage.add_chat_participant({'chatId': chat['id'], 'userId': contact_id, 'isAdmin': False})
                
                # Get the formatted chat
                formatted_chat = storage.get_chat_by_id(chat['id'], user_id)
                
                return jsonify(formatted_chat), 201
            
            # For group chats (not fully implemented)
            return jsonify({"message": "Group chats not implemented"}), 501
        
        except Exception as e:
            print(f"Error in create_chat: {e}")
            return jsonify({"message": "Failed to create chat"}), 500
    
    # Messages routes
    @app.route('/api/messages/<int:chat_id>', methods=['GET'])
    @auth_required
    def get_messages(chat_id):
        try:
            user_id = session.get('user_id')
            
            # Check if user is a participant in the chat
            is_participant = storage.is_chat_participant(chat_id, user_id)
            if not is_participant:
                return jsonify({"message": "Forbidden"}), 403
            
            # Get messages
            messages = storage.get_messages_by_chat_id(chat_id)
            
            # Update message statuses to read for this user
            for message in messages:
                if message['senderId'] != user_id:
                    storage.update_message_status(message['id'], user_id, "read")
            
            return jsonify(messages), 200
        
        except Exception as e:
            print(f"Error in get_messages: {e}")
            return jsonify({"message": "Failed to fetch messages"}), 500
    
    @app.route('/api/messages', methods=['POST'])
    @auth_required
    def create_message():
        try:
            user_id = session.get('user_id')
            data = request.json
            
            # Validate required fields
            if not data.get('chatId'):
                return jsonify({"message": "Chat ID is required"}), 400
            
            # Check if user is a participant in the chat
            is_participant = storage.is_chat_participant(data['chatId'], user_id)
            if not is_participant:
                return jsonify({"message": "Forbidden"}), 403
            
            # Create message
            message = storage.create_message({
                **data,
                'senderId': user_id
            })
            
            # Get chat participants and create message status for each (except sender)
            participants = storage.get_chat_participants(data['chatId'])
            for participant in participants:
                if participant['userId'] != user_id:
                    storage.create_message_status({
                        'messageId': message['id'],
                        'userId': participant['userId'],
                        'status': "delivered"
                    })
            
            # Emit message to all clients
            socketio.emit('new_message', message)
            
            return jsonify(message), 201
        
        except Exception as e:
            print(f"Error in create_message: {e}")
            return jsonify({"message": "Failed to create message"}), 500
    
    # AI-powered conversation starters API
    @app.route('/api/conversation-starters/<int:contact_id>', methods=['GET'])
    @auth_required
    def get_conversation_starters(contact_id):
        try:
            user_id = session.get('user_id')
            
            # Get user
            user = storage.get_user(user_id)
            if not user:
                return jsonify({"message": "User not found"}), 404
            
            # Get contact details
            contact_user = storage.get_user(contact_id)
            if not contact_user:
                return jsonify({"message": "Contact not found"}), 404
            
            # Check if contact exists in user's contacts
            contact = storage.get_contact_by_user_and_contact_id(user_id, contact_id)
            if not contact:
                return jsonify({"message": "Contact not in your contacts list"}), 404
            
            # Check if a chat already exists between them
            chat = storage.get_chat_by_participants([user_id, contact_id])
            recent_messages = []
            
            if chat:
                # Get recent messages if any
                recent_messages = storage.get_messages_by_chat_id(chat['id'])
                # Limit to last 5 messages
                recent_messages = recent_messages[-5:] if len(recent_messages) > 5 else recent_messages
            
            # Determine if contact is an Islamic scholar (IDs 2 and 3 are scholars)
            is_scholar = contact_id == 2 or contact_id == 3
            
            # Build context for AI
            context = ConversationContext(
                user=user,
                contact={
                    'displayName': contact['displayName'],
                    'status': contact_user.get('status'),
                    'isScholar': is_scholar
                },
                recent_messages=recent_messages or None
            )
            
            # Generate conversation starters
            starters = generate_conversation_starters(context)
            
            return jsonify(starters), 200
        
        except Exception as e:
            print(f"Error generating conversation starters: {e}")
            return jsonify({
                "message": "Failed to generate conversation starters",
                "error": str(e)
            }), 500