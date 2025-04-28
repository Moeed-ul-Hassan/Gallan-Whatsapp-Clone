#!/usr/bin/env python3
"""Database interface for the application."""
import os
import json
import time
import bcrypt
from typing import Dict, List, Any, Optional, Union
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Storage:
    """Base Storage Interface"""
    
    def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        raise NotImplementedError
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        raise NotImplementedError
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new user"""
        raise NotImplementedError
    
    def update_user(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user data"""
        raise NotImplementedError
    
    def update_user_status(self, user_id: int, is_online: bool) -> Dict[str, Any]:
        """Update user online status"""
        raise NotImplementedError
    
    def get_contacts_by_user_id(self, user_id: int) -> List[Dict[str, Any]]:
        """Get contacts for user"""
        raise NotImplementedError
    
    def get_contact_by_user_and_contact_id(self, user_id: int, contact_id: int) -> Optional[Dict[str, Any]]:
        """Get contact by user ID and contact ID"""
        raise NotImplementedError
    
    def create_contact(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new contact"""
        raise NotImplementedError
    
    def get_chats_by_user_id(self, user_id: int) -> List[Dict[str, Any]]:
        """Get chats for user"""
        raise NotImplementedError
    
    def get_chat_by_id(self, chat_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get chat by ID"""
        raise NotImplementedError
    
    def get_chat_by_participants(self, participant_ids: List[int]) -> Optional[Dict[str, Any]]:
        """Get chat by participant IDs"""
        raise NotImplementedError
    
    def create_chat(self, chat_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new chat"""
        raise NotImplementedError
    
    def get_chat_participants(self, chat_id: int) -> List[Dict[str, Any]]:
        """Get participants for chat"""
        raise NotImplementedError
    
    def add_chat_participant(self, participant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add participant to chat"""
        raise NotImplementedError
    
    def is_chat_participant(self, chat_id: int, user_id: int) -> bool:
        """Check if user is participant in chat"""
        raise NotImplementedError
    
    def get_messages_by_chat_id(self, chat_id: int) -> List[Dict[str, Any]]:
        """Get messages for chat"""
        raise NotImplementedError
    
    def create_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new message"""
        raise NotImplementedError
    
    def get_message_status_by_message_and_user_id(self, message_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get message status by message ID and user ID"""
        raise NotImplementedError
    
    def create_message_status(self, status_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create message status"""
        raise NotImplementedError
    
    def update_message_status(self, message_id: int, user_id: int, status: str) -> Dict[str, Any]:
        """Update message status"""
        raise NotImplementedError

class InMemoryStorage(Storage):
    """In-memory storage for development and testing"""
    
    def __init__(self):
        """Initialize in-memory storage"""
        # Define data structures
        self.users = {}
        self.contacts = {}
        self.chats = {}
        self.chat_participants = {}
        self.messages = {}
        self.message_statuses = {}
        
        # Define counters
        self.user_id_counter = 0
        self.contact_id_counter = 0
        self.chat_id_counter = 0
        self.chat_participant_id_counter = 0
        self.message_id_counter = 0
        self.message_status_id_counter = 0
        
        # File storage paths
        self.storage_dir = os.path.join(os.path.dirname(__file__), 'data')
        os.makedirs(self.storage_dir, exist_ok=True)
        
        self.storage_files = {
            'users': os.path.join(self.storage_dir, 'users.json'),
            'contacts': os.path.join(self.storage_dir, 'contacts.json'),
            'chats': os.path.join(self.storage_dir, 'chats.json'),
            'chat_participants': os.path.join(self.storage_dir, 'chat_participants.json'),
            'messages': os.path.join(self.storage_dir, 'messages.json'),
            'message_statuses': os.path.join(self.storage_dir, 'message_statuses.json'),
            'counters': os.path.join(self.storage_dir, 'counters.json'),
        }
        
        # Load data from storage
        self._load_from_storage()
        
        # Initialize demo data if needed
        if not self.users:
            print("Initializing demo data...")
            self._initialize_demo_data()
            self._save_to_storage()
    
    def _load_from_storage(self):
        """Load data from file storage"""
        print("Data loaded from storage")
        
        try:
            # Load counters
            if os.path.exists(self.storage_files['counters']):
                with open(self.storage_files['counters'], 'r') as f:
                    counters = json.load(f)
                    self.user_id_counter = counters.get('user_id', 0)
                    self.contact_id_counter = counters.get('contact_id', 0)
                    self.chat_id_counter = counters.get('chat_id', 0)
                    self.chat_participant_id_counter = counters.get('chat_participant_id', 0)
                    self.message_id_counter = counters.get('message_id', 0)
                    self.message_status_id_counter = counters.get('message_status_id', 0)
            
            # Load users
            if os.path.exists(self.storage_files['users']):
                with open(self.storage_files['users'], 'r') as f:
                    self.users = json.load(f)
            
            # Load contacts
            if os.path.exists(self.storage_files['contacts']):
                with open(self.storage_files['contacts'], 'r') as f:
                    self.contacts = json.load(f)
            
            # Load chats
            if os.path.exists(self.storage_files['chats']):
                with open(self.storage_files['chats'], 'r') as f:
                    self.chats = json.load(f)
            
            # Load chat participants
            if os.path.exists(self.storage_files['chat_participants']):
                with open(self.storage_files['chat_participants'], 'r') as f:
                    self.chat_participants = json.load(f)
            
            # Load messages
            if os.path.exists(self.storage_files['messages']):
                with open(self.storage_files['messages'], 'r') as f:
                    self.messages = json.load(f)
            
            # Load message statuses
            if os.path.exists(self.storage_files['message_statuses']):
                with open(self.storage_files['message_statuses'], 'r') as f:
                    self.message_statuses = json.load(f)
        
        except Exception as e:
            print(f"Error loading data from storage: {e}")
    
    def _save_to_storage(self):
        """Save data to file storage"""
        print("Data saved to storage")
        
        try:
            # Save counters
            counters = {
                'user_id': self.user_id_counter,
                'contact_id': self.contact_id_counter,
                'chat_id': self.chat_id_counter,
                'chat_participant_id': self.chat_participant_id_counter,
                'message_id': self.message_id_counter,
                'message_status_id': self.message_status_id_counter,
            }
            with open(self.storage_files['counters'], 'w') as f:
                json.dump(counters, f)
            
            # Save users
            with open(self.storage_files['users'], 'w') as f:
                json.dump(self.users, f)
            
            # Save contacts
            with open(self.storage_files['contacts'], 'w') as f:
                json.dump(self.contacts, f)
            
            # Save chats
            with open(self.storage_files['chats'], 'w') as f:
                json.dump(self.chats, f)
            
            # Save chat participants
            with open(self.storage_files['chat_participants'], 'w') as f:
                json.dump(self.chat_participants, f)
            
            # Save messages
            with open(self.storage_files['messages'], 'w') as f:
                json.dump(self.messages, f)
            
            # Save message statuses
            with open(self.storage_files['message_statuses'], 'w') as f:
                json.dump(self.message_statuses, f)
        
        except Exception as e:
            print(f"Error saving data to storage: {e}")
    
    def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        user_id_str = str(user_id)
        if user_id_str in self.users:
            return self.users[user_id_str]
        return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        for user_id, user in self.users.items():
            if user['username'] == username:
                return user
        return None
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new user"""
        self.user_id_counter += 1
        user_id = self.user_id_counter
        user_id_str = str(user_id)
        
        # Check if username already exists
        if self.get_user_by_username(user_data['username']):
            raise ValueError(f"Username '{user_data['username']}' already exists")
        
        # Create user
        user = {
            'id': user_id,
            'username': user_data['username'],
            'password': user_data['password'],
            'displayName': user_data.get('displayName', user_data['username']),
            'status': user_data.get('status', 'Hey there! I am using WhatsApp.'),
            'avatar': user_data.get('avatar', None),
            'createdAt': int(time.time() * 1000),
            'updatedAt': int(time.time() * 1000),
            'isOnline': False,
            'lastSeen': int(time.time() * 1000),
        }
        
        self.users[user_id_str] = user
        self._save_to_storage()
        
        # If username starts with 'test-', add demo contacts
        if user['username'].startswith('test-'):
            # Add demo contacts for test users
            self._add_demo_contacts_for_user(user_id)
        
        # Create copies without password
        user_copy = user.copy()
        user_copy.pop('password', None)
        
        # Special case for demo user - add Islamic scholar contacts
        if user['username'] == 'demo-user':
            self._add_islamic_scholar_contacts_for_user(user_id)
            print("Added demo contacts: Mufti Samar Abbas Qadri, Mufti Naseer udin Naseer")
        
        return user_copy
    
    def update_user(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user data"""
        user_id_str = str(user_id)
        if user_id_str not in self.users:
            raise ValueError(f"User with ID {user_id} not found")
        
        user = self.users[user_id_str]
        
        # Update user data
        for key, value in data.items():
            if key != 'id' and key != 'password':  # Don't update ID or password this way
                user[key] = value
        
        user['updatedAt'] = int(time.time() * 1000)
        self._save_to_storage()
        
        # Create copy without password
        user_copy = user.copy()
        user_copy.pop('password', None)
        
        return user_copy
    
    def update_user_status(self, user_id: int, is_online: bool) -> Dict[str, Any]:
        """Update user online status"""
        user_id_str = str(user_id)
        if user_id_str not in self.users:
            raise ValueError(f"User with ID {user_id} not found")
        
        user = self.users[user_id_str]
        
        # Update online status
        user['isOnline'] = is_online
        
        # Update last seen if going offline
        if not is_online:
            user['lastSeen'] = int(time.time() * 1000)
        
        user['updatedAt'] = int(time.time() * 1000)
        self._save_to_storage()
        
        # Create copy without password
        user_copy = user.copy()
        user_copy.pop('password', None)
        
        return user_copy
    
    def get_contacts_by_user_id(self, user_id: int) -> List[Dict[str, Any]]:
        """Get contacts for user"""
        user_contacts = []
        
        for contact_id, contact in self.contacts.items():
            if contact['userId'] == user_id:
                # Get the contact user details
                contact_user = self.get_user(contact['contactId'])
                if contact_user:
                    contact_user_copy = contact_user.copy()
                    contact_user_copy.pop('password', None)  # Remove password
                    
                    # Merge contact and user details
                    contact_data = {**contact, 'user': contact_user_copy}
                    user_contacts.append(contact_data)
        
        return user_contacts
    
    def get_contact_by_user_and_contact_id(self, user_id: int, contact_id: int) -> Optional[Dict[str, Any]]:
        """Get contact by user ID and contact ID"""
        for c_id, contact in self.contacts.items():
            if contact['userId'] == user_id and contact['contactId'] == contact_id:
                # Get the contact user details
                contact_user = self.get_user(contact['contactId'])
                if contact_user:
                    contact_user_copy = contact_user.copy()
                    contact_user_copy.pop('password', None)  # Remove password
                    
                    # Merge contact and user details
                    contact_data = {**contact, 'user': contact_user_copy}
                    return contact_data
        
        return None
    
    def create_contact(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new contact"""
        self.contact_id_counter += 1
        contact_id = self.contact_id_counter
        contact_id_str = str(contact_id)
        
        # Check if user exists
        user = self.get_user(contact_data['userId'])
        if not user:
            raise ValueError(f"User with ID {contact_data['userId']} not found")
        
        # Check if contact user exists
        contact_user = self.get_user(contact_data['contactId'])
        if not contact_user:
            raise ValueError(f"Contact user with ID {contact_data['contactId']} not found")
        
        # Check if contact already exists
        existing_contact = self.get_contact_by_user_and_contact_id(
            contact_data['userId'], contact_data['contactId']
        )
        if existing_contact:
            raise ValueError(f"Contact already exists")
        
        # Create contact
        contact = {
            'id': contact_id,
            'userId': contact_data['userId'],
            'contactId': contact_data['contactId'],
            'displayName': contact_data.get('displayName', contact_user['displayName']),
            'email': contact_data.get('email', None),
            'phone': contact_data.get('phone', None),
            'isBlocked': contact_data.get('isBlocked', False),
            'isStarred': contact_data.get('isStarred', False),
            'isArchived': contact_data.get('isArchived', False),
            'isMuted': contact_data.get('isMuted', False),
            'isScholar': contact_data.get('isScholar', False),
            'notes': contact_data.get('notes', None),
            'createdAt': int(time.time() * 1000),
            'updatedAt': int(time.time() * 1000),
        }
        
        self.contacts[contact_id_str] = contact
        self._save_to_storage()
        
        # Get the contact user details
        contact_user_copy = contact_user.copy()
        contact_user_copy.pop('password', None)  # Remove password
        
        # Merge contact and user details
        contact_data = {**contact, 'user': contact_user_copy}
        
        return contact_data
    
    def get_chats_by_user_id(self, user_id: int) -> List[Dict[str, Any]]:
        """Get chats for user"""
        user_chats = []
        
        # Find chat participants for the user
        user_chat_ids = []
        for participant_id, participant in self.chat_participants.items():
            if participant['userId'] == user_id:
                user_chat_ids.append(participant['chatId'])
        
        # Get chat details for each chat
        for chat_id in user_chat_ids:
            chat = self.get_chat_by_id(chat_id, user_id)
            if chat:
                user_chats.append(chat)
        
        return user_chats
    
    def get_chat_by_id(self, chat_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get chat by ID"""
        chat_id_str = str(chat_id)
        if chat_id_str not in self.chats:
            return None
        
        # Check if user is a participant
        if not self.is_chat_participant(chat_id, user_id):
            return None
        
        chat = self.chats[chat_id_str]
        
        # Get participants
        participants = self.get_chat_participants(chat_id)
        
        # Get latest message
        chat_messages = self.get_messages_by_chat_id(chat_id)
        latest_message = None
        if chat_messages:
            latest_message = max(chat_messages, key=lambda m: m['timestamp'])
        
        # Get unread messages count for the user
        unread_count = 0
        for message in chat_messages:
            if message['senderId'] != user_id:
                message_status = self.get_message_status_by_message_and_user_id(message['id'], user_id)
                if message_status and message_status['status'] != 'read':
                    unread_count += 1
        
        # Enrich chat object
        chat_data = {
            **chat,
            'participants': participants,
            'latestMessage': latest_message,
            'unreadCount': unread_count,
        }
        
        return chat_data
    
    def get_chat_by_participants(self, participant_ids: List[int]) -> Optional[Dict[str, Any]]:
        """Get chat by participant IDs"""
        # Find chats where all participants are present
        for chat_id, chat in self.chats.items():
            chat_id_int = int(chat_id)
            
            # Get all participants for this chat
            chat_participant_ids = []
            for participant in self.get_chat_participants(chat_id_int):
                chat_participant_ids.append(participant['userId'])
            
            # Check if participants match exactly
            if sorted(chat_participant_ids) == sorted(participant_ids) and len(chat_participant_ids) == len(participant_ids):
                return self.get_chat_by_id(chat_id_int, participant_ids[0])
        
        return None
    
    def create_chat(self, chat_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new chat"""
        self.chat_id_counter += 1
        chat_id = self.chat_id_counter
        chat_id_str = str(chat_id)
        
        # Create chat
        chat = {
            'id': chat_id,
            'type': chat_data.get('type', 'personal'),  # personal, group
            'name': chat_data.get('name', None),  # For group chats
            'avatar': chat_data.get('avatar', None),  # For group chats
            'description': chat_data.get('description', None),  # For group chats
            'createdBy': chat_data.get('createdBy', None),  # For group chats
            'isArchived': chat_data.get('isArchived', False),
            'isMuted': chat_data.get('isMuted', False),
            'createdAt': int(time.time() * 1000),
            'updatedAt': int(time.time() * 1000),
        }
        
        self.chats[chat_id_str] = chat
        self._save_to_storage()
        
        # Add participants
        participants = []
        for participant_data in chat_data.get('participants', []):
            participant_data['chatId'] = chat_id
            participant = self.add_chat_participant(participant_data)
            participants.append(participant)
        
        # Enrich chat object
        chat_data = {
            **chat,
            'participants': participants,
            'latestMessage': None,
            'unreadCount': 0,
        }
        
        return chat_data
    
    def get_chat_participants(self, chat_id: int) -> List[Dict[str, Any]]:
        """Get participants for chat"""
        chat_participants = []
        
        for participant_id, participant in self.chat_participants.items():
            if participant['chatId'] == chat_id:
                # Get the user details
                user = self.get_user(participant['userId'])
                if user:
                    user_copy = user.copy()
                    user_copy.pop('password', None)  # Remove password
                    
                    # Merge participant and user details
                    participant_data = {**participant, 'user': user_copy}
                    chat_participants.append(participant_data)
        
        return chat_participants
    
    def add_chat_participant(self, participant_data: Dict[str, Any]) -> Dict[str, Any]:
        """Add participant to chat"""
        self.chat_participant_id_counter += 1
        participant_id = self.chat_participant_id_counter
        participant_id_str = str(participant_id)
        
        # Check if chat exists
        chat_id = participant_data['chatId']
        chat_id_str = str(chat_id)
        if chat_id_str not in self.chats:
            raise ValueError(f"Chat with ID {chat_id} not found")
        
        # Check if user exists
        user_id = participant_data['userId']
        user = self.get_user(user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Check if user is already a participant
        if self.is_chat_participant(chat_id, user_id):
            raise ValueError(f"User with ID {user_id} is already a participant in chat with ID {chat_id}")
        
        # Create participant
        participant = {
            'id': participant_id,
            'chatId': chat_id,
            'userId': user_id,
            'role': participant_data.get('role', 'member'),  # admin, member
            'joinedAt': int(time.time() * 1000),
        }
        
        self.chat_participants[participant_id_str] = participant
        self._save_to_storage()
        
        # Get the user details
        user_copy = user.copy()
        user_copy.pop('password', None)  # Remove password
        
        # Merge participant and user details
        participant_data = {**participant, 'user': user_copy}
        
        return participant_data
    
    def is_chat_participant(self, chat_id: int, user_id: int) -> bool:
        """Check if user is participant in chat"""
        for participant_id, participant in self.chat_participants.items():
            if participant['chatId'] == chat_id and participant['userId'] == user_id:
                return True
        return False
    
    def get_messages_by_chat_id(self, chat_id: int) -> List[Dict[str, Any]]:
        """Get messages for chat"""
        chat_messages = []
        
        for message_id, message in self.messages.items():
            if message['chatId'] == chat_id:
                # Enrich message with sender details
                sender = self.get_user(message['senderId'])
                if sender:
                    sender_copy = sender.copy()
                    sender_copy.pop('password', None)  # Remove password
                    
                    # Enrich message object
                    message_data = {**message, 'sender': sender_copy}
                    chat_messages.append(message_data)
        
        # Sort by timestamp
        chat_messages.sort(key=lambda m: m['timestamp'])
        
        return chat_messages
    
    def create_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new message"""
        self.message_id_counter += 1
        message_id = self.message_id_counter
        message_id_str = str(message_id)
        
        # Check if chat exists
        chat_id = message_data['chatId']
        chat_id_str = str(chat_id)
        if chat_id_str not in self.chats:
            raise ValueError(f"Chat with ID {chat_id} not found")
        
        # Check if sender exists
        sender_id = message_data['senderId']
        sender = self.get_user(sender_id)
        if not sender:
            raise ValueError(f"User with ID {sender_id} not found")
        
        # Check if sender is a participant
        if not self.is_chat_participant(chat_id, sender_id):
            raise ValueError(f"User with ID {sender_id} is not a participant in chat with ID {chat_id}")
        
        # Create message
        message = {
            'id': message_id,
            'chatId': chat_id,
            'senderId': sender_id,
            'content': message_data['content'],
            'type': message_data.get('type', 'text'),  # text, image, video, audio, file
            'quotedMessageId': message_data.get('quotedMessageId', None),
            'timestamp': message_data.get('timestamp', int(time.time() * 1000)),
            'status': message_data.get('status', 'sent'),  # sent, delivered, read
        }
        
        self.messages[message_id_str] = message
        self._save_to_storage()
        
        # Update chat's updatedAt timestamp
        chat = self.chats[chat_id_str]
        chat['updatedAt'] = int(time.time() * 1000)
        self._save_to_storage()
        
        # Get the sender details
        sender_copy = sender.copy()
        sender_copy.pop('password', None)  # Remove password
        
        # Enrich message object
        message_data = {**message, 'sender': sender_copy}
        
        return message_data
    
    def get_message_status_by_message_and_user_id(self, message_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """Get message status by message ID and user ID"""
        for status_id, status in self.message_statuses.items():
            if status['messageId'] == message_id and status['userId'] == user_id:
                return status
        
        return None
    
    def create_message_status(self, status_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create message status"""
        self.message_status_id_counter += 1
        status_id = self.message_status_id_counter
        status_id_str = str(status_id)
        
        # Check if message exists
        message_id = status_data['messageId']
        message_id_str = str(message_id)
        if message_id_str not in self.messages:
            raise ValueError(f"Message with ID {message_id} not found")
        
        # Check if user exists
        user_id = status_data['userId']
        user = self.get_user(user_id)
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Check if status already exists
        existing_status = self.get_message_status_by_message_and_user_id(message_id, user_id)
        if existing_status:
            raise ValueError(f"Status already exists for message with ID {message_id} and user with ID {user_id}")
        
        # Create status
        status = {
            'id': status_id,
            'messageId': message_id,
            'userId': user_id,
            'status': status_data['status'],  # sent, delivered, read
            'timestamp': status_data.get('timestamp', int(time.time() * 1000)),
        }
        
        self.message_statuses[status_id_str] = status
        self._save_to_storage()
        
        return status
    
    def update_message_status(self, message_id: int, user_id: int, status: str) -> Dict[str, Any]:
        """Update message status"""
        # Check if status exists
        existing_status = self.get_message_status_by_message_and_user_id(message_id, user_id)
        if not existing_status:
            raise ValueError(f"Status not found for message with ID {message_id} and user with ID {user_id}")
        
        # Update status
        status_id_str = str(existing_status['id'])
        self.message_statuses[status_id_str]['status'] = status
        self.message_statuses[status_id_str]['timestamp'] = int(time.time() * 1000)
        self._save_to_storage()
        
        # Update message status if all participants have read
        if status == 'read':
            self._update_message_status_if_all(message_id)
        
        return self.message_statuses[status_id_str]
    
    def _update_message_status_if_all(self, message_id: int) -> None:
        """Update message status if all participants have read the message"""
        message_id_str = str(message_id)
        if message_id_str not in self.messages:
            return
        
        message = self.messages[message_id_str]
        chat_id = message['chatId']
        sender_id = message['senderId']
        
        # Get all participants except sender
        participants = []
        for participant in self.get_chat_participants(chat_id):
            if participant['userId'] != sender_id:
                participants.append(participant)
        
        # Check if all participants have read
        all_read = True
        for participant in participants:
            status = self.get_message_status_by_message_and_user_id(message_id, participant['userId'])
            if not status or status['status'] != 'read':
                all_read = False
                break
        
        # Update message status if all read
        if all_read:
            message['status'] = 'read'
            self._save_to_storage()
    
    def _add_demo_contacts_for_user(self, user_id: int) -> None:
        """Add demo contacts for user"""
        # Create a demo contact if it doesn't exist
        demo_username = 'demo-user'
        demo_user = self.get_user_by_username(demo_username)
        
        if not demo_user:
            # Create demo user
            demo_user_password = bcrypt.hashpw('password123'.encode(), bcrypt.gensalt()).decode()
            demo_user = self.create_user({
                'username': demo_username,
                'password': demo_user_password,
                'displayName': 'Demo User',
                'status': 'This is a demo account',
            })
            print(f"Added demo user: {demo_username}")
        
        # Add demo user as contact
        try:
            self.create_contact({
                'userId': user_id,
                'contactId': demo_user['id'],
                'displayName': 'Demo User',
            })
        except ValueError:
            pass  # Contact already exists
        
        # Also add Islamic scholar contacts
        self._add_islamic_scholar_contacts_for_user(user_id)
    
    def _add_islamic_scholar_contacts_for_user(self, user_id: int) -> None:
        """Add Islamic scholar contacts for user"""
        # Add Mufti Samar Abbas Qadri
        mufti_samar_username = 'mufti_samar'
        mufti_samar = self.get_user_by_username(mufti_samar_username)
        
        if not mufti_samar:
            # Create scholar user
            scholar_password = bcrypt.hashpw('scholar123'.encode(), bcrypt.gensalt()).decode()
            mufti_samar = self.create_user({
                'username': mufti_samar_username,
                'password': scholar_password,
                'displayName': 'Mufti Samar Abbas Qadri',
                'status': 'اللهم صل على محمد وعلى آل محمد كما صليت على إبراهيم وعلى آل إبراهيم إنك حميد مجيد',
            })
        
        # Add as contact
        try:
            self.create_contact({
                'userId': user_id,
                'contactId': mufti_samar['id'],
                'displayName': 'Mufti Samar Abbas Qadri',
                'isScholar': True,
            })
        except ValueError:
            pass  # Contact already exists
        
        # Add Mufti Naseer udin Naseer
        mufti_naseer_username = 'mufti_naseer'
        mufti_naseer = self.get_user_by_username(mufti_naseer_username)
        
        if not mufti_naseer:
            # Create scholar user
            scholar_password = bcrypt.hashpw('scholar123'.encode(), bcrypt.gensalt()).decode()
            mufti_naseer = self.create_user({
                'username': mufti_naseer_username,
                'password': scholar_password,
                'displayName': 'Mufti Naseer udin Naseer',
                'status': 'بسم الله الرحمن الرحيم',
            })
        
        # Add as contact
        try:
            self.create_contact({
                'userId': user_id,
                'contactId': mufti_naseer['id'],
                'displayName': 'Mufti Naseer udin Naseer',
                'isScholar': True,
            })
        except ValueError:
            pass  # Contact already exists
    
    def _initialize_demo_data(self):
        """Initialize demo data for testing"""
        # Create a demo user
        demo_password = bcrypt.hashpw('password123'.encode(), bcrypt.gensalt()).decode()
        demo_user = self.create_user({
            'username': 'demo-user',
            'password': demo_password,
            'displayName': 'Demo User',
            'status': 'This is a demo account',
        })
        print(f"Added demo user: demo-user")
        
        # Add Islamic scholar contacts
        self._add_islamic_scholar_contacts_for_user(demo_user['id'])

class MongoStorage(Storage):
    """MongoDB storage implementation"""
    
    def __init__(self):
        """Initialize MongoDB storage"""
        # Get MongoDB URI from environment
        mongodb_uri = os.getenv('MONGODB_URI')
        
        if not mongodb_uri:
            raise ValueError("MongoDB URI not found in environment variables")
        
        # Connect to MongoDB
        self.client = MongoClient(mongodb_uri)
        self.db = self.client['whatsapp_clone']
        
        # Initialize collections
        self.users_collection = self.db['users']
        self.contacts_collection = self.db['contacts']
        self.chats_collection = self.db['chats']
        self.chat_participants_collection = self.db['chat_participants']
        self.messages_collection = self.db['messages']
        self.message_statuses_collection = self.db['message_statuses']
        self.counters_collection = self.db['counters']
        
        # Ensure indexes
        self.users_collection.create_index('username', unique=True)
        self.contacts_collection.create_index([('userId', 1), ('contactId', 1)], unique=True)
        self.chat_participants_collection.create_index([('chatId', 1), ('userId', 1)], unique=True)
        self.message_statuses_collection.create_index([('messageId', 1), ('userId', 1)], unique=True)
        
        # Initialize counters if needed
        counters = ['user_id', 'contact_id', 'chat_id', 'chat_participant_id', 'message_id', 'message_status_id']
        for counter in counters:
            if not self.counters_collection.find_one({'_id': counter}):
                self.counters_collection.insert_one({'_id': counter, 'seq': 0})
        
        # Initialize demo data if needed
        if self.users_collection.count_documents({}) == 0:
            print("Initializing demo data...")
            self._initialize_demo_data()
    
    def _get_next_sequence(self, name: str) -> int:
        """Get the next sequence value for a counter"""
        counter = self.counters_collection.find_one_and_update(
            {'_id': name},
            {'$inc': {'seq': 1}},
            return_document=True
        )
        return counter['seq']
    
    def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        user = self.users_collection.find_one({'id': user_id})
        if user:
            user.pop('_id', None)  # Remove MongoDB _id
            return user
        return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """Get user by username"""
        user = self.users_collection.find_one({'username': username})
        if user:
            user.pop('_id', None)  # Remove MongoDB _id
            return user
        return None
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new user"""
        # Check if username already exists
        if self.get_user_by_username(user_data['username']):
            raise ValueError(f"Username '{user_data['username']}' already exists")
        
        # Get next user ID
        user_id = self._get_next_sequence('user_id')
        
        # Create user
        user = {
            'id': user_id,
            'username': user_data['username'],
            'password': user_data['password'],
            'displayName': user_data.get('displayName', user_data['username']),
            'status': user_data.get('status', 'Hey there! I am using WhatsApp.'),
            'avatar': user_data.get('avatar', None),
            'createdAt': int(time.time() * 1000),
            'updatedAt': int(time.time() * 1000),
            'isOnline': False,
            'lastSeen': int(time.time() * 1000),
        }
        
        # Insert into MongoDB
        self.users_collection.insert_one(user)
        
        # Create copies without password and _id
        user_copy = user.copy()
        user_copy.pop('password', None)
        user_copy.pop('_id', None)
        
        # If username starts with 'test-', add demo contacts
        if user['username'].startswith('test-'):
            # Add demo contacts for test users
            self._add_demo_contacts_for_user(user_id)
        
        # Special case for demo user - add Islamic scholar contacts
        if user['username'] == 'demo-user':
            self._add_islamic_scholar_contacts_for_user(user_id)
            print("Added demo contacts: Mufti Samar Abbas Qadri, Mufti Naseer udin Naseer")
        
        return user_copy
    
    def _initialize_demo_data(self):
        """Initialize demo data for testing"""
        # Create a demo user
        demo_password = bcrypt.hashpw('password123'.encode(), bcrypt.gensalt()).decode()
        demo_user = self.create_user({
            'username': 'demo-user',
            'password': demo_password,
            'displayName': 'Demo User',
            'status': 'This is a demo account',
        })
        print(f"Added demo user: demo-user")
        
        # Add Islamic scholar contacts
        self._add_islamic_scholar_contacts_for_user(demo_user['id'])
    
    def _add_demo_contacts_for_user(self, user_id: int) -> None:
        """Add demo contacts for user"""
        # Create a demo contact if it doesn't exist
        demo_username = 'demo-user'
        demo_user = self.get_user_by_username(demo_username)
        
        if not demo_user:
            # Create demo user
            demo_user_password = bcrypt.hashpw('password123'.encode(), bcrypt.gensalt()).decode()
            demo_user = self.create_user({
                'username': demo_username,
                'password': demo_user_password,
                'displayName': 'Demo User',
                'status': 'This is a demo account',
            })
            print(f"Added demo user: {demo_username}")
        
        # Add demo user as contact
        try:
            self.create_contact({
                'userId': user_id,
                'contactId': demo_user['id'],
                'displayName': 'Demo User',
            })
        except ValueError:
            pass  # Contact already exists
        
        # Also add Islamic scholar contacts
        self._add_islamic_scholar_contacts_for_user(user_id)
    
    def _add_islamic_scholar_contacts_for_user(self, user_id: int) -> None:
        """Add Islamic scholar contacts for user"""
        # Add Mufti Samar Abbas Qadri
        mufti_samar_username = 'mufti_samar'
        mufti_samar = self.get_user_by_username(mufti_samar_username)
        
        if not mufti_samar:
            # Create scholar user
            scholar_password = bcrypt.hashpw('scholar123'.encode(), bcrypt.gensalt()).decode()
            mufti_samar = self.create_user({
                'username': mufti_samar_username,
                'password': scholar_password,
                'displayName': 'Mufti Samar Abbas Qadri',
                'status': 'اللهم صل على محمد وعلى آل محمد كما صليت على إبراهيم وعلى آل إبراهيم إنك حميد مجيد',
            })
        
        # Add as contact
        try:
            self.create_contact({
                'userId': user_id,
                'contactId': mufti_samar['id'],
                'displayName': 'Mufti Samar Abbas Qadri',
                'isScholar': True,
            })
        except ValueError:
            pass  # Contact already exists
        
        # Add Mufti Naseer udin Naseer
        mufti_naseer_username = 'mufti_naseer'
        mufti_naseer = self.get_user_by_username(mufti_naseer_username)
        
        if not mufti_naseer:
            # Create scholar user
            scholar_password = bcrypt.hashpw('scholar123'.encode(), bcrypt.gensalt()).decode()
            mufti_naseer = self.create_user({
                'username': mufti_naseer_username,
                'password': scholar_password,
                'displayName': 'Mufti Naseer udin Naseer',
                'status': 'بسم الله الرحمن الرحيم',
            })
        
        # Add as contact
        try:
            self.create_contact({
                'userId': user_id,
                'contactId': mufti_naseer['id'],
                'displayName': 'Mufti Naseer udin Naseer',
                'isScholar': True,
            })
        except ValueError:
            pass  # Contact already exists

def get_storage() -> Storage:
    """Get storage implementation based on environment variables"""
    # Check if MongoDB URI is set
    mongodb_uri = os.getenv('MONGODB_URI')
    
    if mongodb_uri:
        try:
            # Try to initialize MongoDB storage
            mongo_storage = MongoStorage()
            print("Using MongoDB storage")
            return mongo_storage
        except Exception as e:
            print(f"Error initializing MongoDB storage: {e}")
            print("Falling back to in-memory storage")
    else:
        print("Using in-memory storage for now")
    
    # Fallback to in-memory storage
    return InMemoryStorage()