import os
import json
import bcrypt
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Storage:
    """Base Storage Interface"""
    
    def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        pass
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        pass
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    def update_user(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    def update_user_status(self, user_id: int, is_online: bool) -> Dict[str, Any]:
        pass
    
    def get_contacts_by_user_id(self, user_id: int) -> List[Dict[str, Any]]:
        pass
    
    def get_contact_by_user_and_contact_id(self, user_id: int, contact_id: int) -> Optional[Dict[str, Any]]:
        pass
    
    def create_contact(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    def get_chats_by_user_id(self, user_id: int) -> List[Dict[str, Any]]:
        pass
    
    def get_chat_by_id(self, chat_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        pass
    
    def get_chat_by_participants(self, participant_ids: List[int]) -> Optional[Dict[str, Any]]:
        pass
    
    def create_chat(self, chat_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    def get_chat_participants(self, chat_id: int) -> List[Dict[str, Any]]:
        pass
    
    def add_chat_participant(self, participant_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    def is_chat_participant(self, chat_id: int, user_id: int) -> bool:
        pass
    
    def get_messages_by_chat_id(self, chat_id: int) -> List[Dict[str, Any]]:
        pass
    
    def create_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    def get_message_status_by_message_and_user_id(self, message_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        pass
    
    def create_message_status(self, status_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    def update_message_status(self, message_id: int, user_id: int, status: str) -> Dict[str, Any]:
        pass


class InMemoryStorage(Storage):
    """In-memory storage for development and testing"""
    
    def __init__(self):
        self.users = {}
        self.contacts = {}
        self.chats = {}
        self.chat_participants = {}
        self.messages = {}
        self.message_statuses = {}
        
        self.user_id_counter = 1
        self.contact_id_counter = 1
        self.chat_id_counter = 1
        self.chat_participant_id_counter = 1
        self.message_id_counter = 1
        self.message_status_id_counter = 1
        
        # Load data from storage if available
        self._load_from_storage()
        
        # Initialize demo data if empty
        if not self.users:
            self._initialize_demo_data()
    
    def _load_from_storage(self):
        """Load data from file storage"""
        try:
            # Users
            if os.path.exists('storage/users.json'):
                with open('storage/users.json', 'r') as f:
                    self.users = json.load(f)
            
            # Contacts
            if os.path.exists('storage/contacts.json'):
                with open('storage/contacts.json', 'r') as f:
                    self.contacts = json.load(f)
            
            # Chats
            if os.path.exists('storage/chats.json'):
                with open('storage/chats.json', 'r') as f:
                    self.chats = json.load(f)
            
            # Chat Participants
            if os.path.exists('storage/chat_participants.json'):
                with open('storage/chat_participants.json', 'r') as f:
                    self.chat_participants = json.load(f)
            
            # Messages
            if os.path.exists('storage/messages.json'):
                with open('storage/messages.json', 'r') as f:
                    self.messages = json.load(f)
            
            # Message Statuses
            if os.path.exists('storage/message_statuses.json'):
                with open('storage/message_statuses.json', 'r') as f:
                    self.message_statuses = json.load(f)
            
            # Counters
            if os.path.exists('storage/counters.json'):
                with open('storage/counters.json', 'r') as f:
                    counters = json.load(f)
                    self.user_id_counter = counters.get('user_id', 1)
                    self.contact_id_counter = counters.get('contact_id', 1)
                    self.chat_id_counter = counters.get('chat_id', 1)
                    self.chat_participant_id_counter = counters.get('chat_participant_id', 1)
                    self.message_id_counter = counters.get('message_id', 1)
                    self.message_status_id_counter = counters.get('message_status_id', 1)
            
            print("Data loaded from storage")
        except Exception as e:
            print(f"Error loading data from storage: {e}")
    
    def _save_to_storage(self):
        """Save data to file storage"""
        try:
            # Create storage directory if it doesn't exist
            os.makedirs('storage', exist_ok=True)
            
            # Save users
            with open('storage/users.json', 'w') as f:
                json.dump(self.users, f)
            
            # Save contacts
            with open('storage/contacts.json', 'w') as f:
                json.dump(self.contacts, f)
            
            # Save chats
            with open('storage/chats.json', 'w') as f:
                json.dump(self.chats, f)
            
            # Save chat participants
            with open('storage/chat_participants.json', 'w') as f:
                json.dump(self.chat_participants, f)
            
            # Save messages
            with open('storage/messages.json', 'w') as f:
                json.dump(self.messages, f)
            
            # Save message statuses
            with open('storage/message_statuses.json', 'w') as f:
                json.dump(self.message_statuses, f)
            
            # Save counters
            counters = {
                'user_id': self.user_id_counter,
                'contact_id': self.contact_id_counter,
                'chat_id': self.chat_id_counter,
                'chat_participant_id': self.chat_participant_id_counter,
                'message_id': self.message_id_counter,
                'message_status_id': self.message_status_id_counter
            }
            with open('storage/counters.json', 'w') as f:
                json.dump(counters, f)
            
            print("Data saved to storage")
        except Exception as e:
            print(f"Error saving data to storage: {e}")
    
    def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        str_id = str(user_id)
        if str_id in self.users:
            return self.users[str_id]
        return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        for user_id, user in self.users.items():
            if user['username'] == username:
                return user
        return None
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = self.user_id_counter
        self.user_id_counter += 1
        
        # Create user
        user = {
            'id': user_id,
            'username': user_data['username'],
            'password': user_data['password'],
            'displayName': user_data.get('displayName', user_data['username']),
            'status': user_data.get('status', "Hey there! I'm using Gallan"),
            'avatar': user_data.get('avatar', None),
            'lastSeen': datetime.now().isoformat(),
            'isOnline': True
        }
        
        self.users[str(user_id)] = user
        self._save_to_storage()
        
        return user
    
    def update_user(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        str_id = str(user_id)
        if str_id not in self.users:
            raise ValueError(f"User with ID {user_id} not found")
        
        user = self.users[str_id]
        
        # Update fields
        for key, value in data.items():
            if key in user and key != 'id' and key != 'password':
                user[key] = value
        
        self._save_to_storage()
        
        return user
    
    def update_user_status(self, user_id: int, is_online: bool) -> Dict[str, Any]:
        str_id = str(user_id)
        if str_id not in self.users:
            raise ValueError(f"User with ID {user_id} not found")
        
        user = self.users[str_id]
        
        user['isOnline'] = is_online
        if not is_online:
            user['lastSeen'] = datetime.now().isoformat()
        
        self._save_to_storage()
        
        return user
    
    def get_contacts_by_user_id(self, user_id: int) -> List[Dict[str, Any]]:
        contacts = []
        for contact_id, contact in self.contacts.items():
            if contact['userId'] == user_id:
                # Get the contact user data
                contact_user = self.get_user(contact['contactId'])
                if contact_user:
                    # Create a contact object with user data
                    contact_with_user = {
                        **contact,
                        'user': contact_user,
                        'displayName': contact.get('displayName', contact_user['displayName']),
                        'status': contact_user.get('status', "Hey there! I'm using Gallan"),
                        'avatar': contact_user.get('avatar', None)
                    }
                    contacts.append(contact_with_user)
        
        return contacts
    
    def get_contact_by_user_and_contact_id(self, user_id: int, contact_id: int) -> Optional[Dict[str, Any]]:
        for contact_id_str, contact in self.contacts.items():
            if contact['userId'] == user_id and contact['contactId'] == contact_id:
                # Get the contact user data
                contact_user = self.get_user(contact['contactId'])
                if contact_user:
                    # Create a contact object with user data
                    contact_with_user = {
                        **contact,
                        'user': contact_user,
                        'displayName': contact.get('displayName', contact_user['displayName']),
                        'status': contact_user.get('status', "Hey there! I'm using Gallan"),
                        'avatar': contact_user.get('avatar', None)
                    }
                    return contact_with_user
        
        return None
    
    def create_contact(self, contact_data: Dict[str, Any]) -> Dict[str, Any]:
        contact_id = self.contact_id_counter
        self.contact_id_counter += 1
        
        # Create contact
        contact = {
            'id': contact_id,
            'userId': contact_data['userId'],
            'contactId': contact_data['contactId'],
            'displayName': contact_data.get('displayName', '')
        }
        
        self.contacts[str(contact_id)] = contact
        self._save_to_storage()
        
        # Get contact with user data
        return self.get_contact_by_user_and_contact_id(contact_data['userId'], contact_data['contactId'])
    
    def get_chats_by_user_id(self, user_id: int) -> List[Dict[str, Any]]:
        # Get all chat participants for this user
        chat_ids = []
        for participant_id, participant in self.chat_participants.items():
            if participant['userId'] == user_id:
                chat_ids.append(participant['chatId'])
        
        # Get chat data for each chat
        chats = []
        for chat_id in chat_ids:
            chat_with_data = self.get_chat_by_id(chat_id, user_id)
            if chat_with_data:
                chats.append(chat_with_data)
        
        return chats
    
    def get_chat_by_id(self, chat_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        str_id = str(chat_id)
        if str_id not in self.chats:
            return None
        
        chat = self.chats[str_id]
        
        # Check if user is a participant
        is_participant = self.is_chat_participant(chat_id, user_id)
        if not is_participant:
            return None
        
        # Get other participants
        other_participant_id = None
        if not chat['isGroup']:
            # For individual chats, get the other participant
            for participant_id, participant in self.chat_participants.items():
                if participant['chatId'] == chat_id and participant['userId'] != user_id:
                    other_participant_id = participant['userId']
                    break
        
        # Get the last message
        last_message = None
        last_message_time = None
        last_message_sent = False
        last_message_status = None
        unread_count = 0
        
        # Get all messages for this chat
        chat_messages = self.get_messages_by_chat_id(chat_id)
        
        if chat_messages:
            # Sort by createdAt
            chat_messages.sort(key=lambda m: m['createdAt'])
            
            # Get the last message
            last_message = chat_messages[-1]
            last_message_time = last_message['createdAt']
            last_message_sent = last_message['senderId'] == user_id
            
            # Get the last message status
            if not last_message_sent:
                status = self.get_message_status_by_message_and_user_id(last_message['id'], user_id)
                if status:
                    last_message_status = status['status']
                else:
                    last_message_status = 'delivered'
            else:
                # For sent messages, get the status for the other user
                if other_participant_id:
                    status = self.get_message_status_by_message_and_user_id(last_message['id'], other_participant_id)
                    if status:
                        last_message_status = status['status']
                    else:
                        last_message_status = 'sent'
                else:
                    last_message_status = 'sent'
            
            # Count unread messages
            for message in chat_messages:
                if message['senderId'] != user_id:
                    status = self.get_message_status_by_message_and_user_id(message['id'], user_id)
                    if not status or status['status'] != 'read':
                        unread_count += 1
        
        # Get online status and last seen
        is_online = False
        last_seen = None
        
        if other_participant_id:
            other_user = self.get_user(other_participant_id)
            if other_user:
                is_online = other_user.get('isOnline', False)
                last_seen = other_user.get('lastSeen', None)
        
        # Create formatted chat object
        formatted_chat = {
            **chat,
            'lastMessage': last_message['text'] if last_message else "",
            'lastMessageTime': last_message_time if last_message_time else chat['createdAt'],
            'lastMessageSent': last_message_sent,
            'lastMessageStatus': last_message_status if last_message_status else "sent",
            'unreadCount': unread_count,
            'isOnline': is_online,
            'lastSeen': last_seen
        }
        
        return formatted_chat
    
    def get_chat_by_participants(self, participant_ids: List[int]) -> Optional[Dict[str, Any]]:
        # Get all chats
        for chat_id, chat in self.chats.items():
            # Skip group chats
            if chat['isGroup']:
                continue
            
            # Get participants for this chat
            chat_participant_ids = []
            for participant_id, participant in self.chat_participants.items():
                if participant['chatId'] == int(chat_id):
                    chat_participant_ids.append(participant['userId'])
            
            # Check if participant_ids match exactly
            if sorted(chat_participant_ids) == sorted(participant_ids):
                return chat
        
        return None
    
    def create_chat(self, chat_data: Dict[str, Any]) -> Dict[str, Any]:
        chat_id = self.chat_id_counter
        self.chat_id_counter += 1
        
        # Create chat
        chat = {
            'id': chat_id,
            'name': chat_data.get('name', None),
            'avatar': chat_data.get('avatar', None),
            'createdAt': datetime.now().isoformat(),
            'isGroup': chat_data.get('isGroup', False)
        }
        
        self.chats[str(chat_id)] = chat
        self._save_to_storage()
        
        return chat
    
    def get_chat_participants(self, chat_id: int) -> List[Dict[str, Any]]:
        participants = []
        for participant_id, participant in self.chat_participants.items():
            if participant['chatId'] == chat_id:
                participants.append(participant)
        
        return participants
    
    def add_chat_participant(self, participant_data: Dict[str, Any]) -> Dict[str, Any]:
        participant_id = self.chat_participant_id_counter
        self.chat_participant_id_counter += 1
        
        # Create participant
        participant = {
            'id': participant_id,
            'chatId': participant_data['chatId'],
            'userId': participant_data['userId'],
            'joinedAt': datetime.now().isoformat(),
            'isAdmin': participant_data.get('isAdmin', False)
        }
        
        self.chat_participants[str(participant_id)] = participant
        self._save_to_storage()
        
        return participant
    
    def is_chat_participant(self, chat_id: int, user_id: int) -> bool:
        for participant_id, participant in self.chat_participants.items():
            if participant['chatId'] == chat_id and participant['userId'] == user_id:
                return True
        
        return False
    
    def get_messages_by_chat_id(self, chat_id: int) -> List[Dict[str, Any]]:
        messages = []
        for message_id, message in self.messages.items():
            if message['chatId'] == chat_id:
                messages.append(message)
        
        # Sort by createdAt
        messages.sort(key=lambda m: m['createdAt'])
        
        return messages
    
    def create_message(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        message_id = self.message_id_counter
        self.message_id_counter += 1
        
        # Create message
        message = {
            'id': message_id,
            'chatId': message_data['chatId'],
            'senderId': message_data['senderId'],
            'text': message_data.get('text', None),
            'mediaUrl': message_data.get('mediaUrl', None),
            'status': message_data.get('status', 'sent'),
            'createdAt': datetime.now().isoformat()
        }
        
        self.messages[str(message_id)] = message
        self._save_to_storage()
        
        return message
    
    def get_message_status_by_message_and_user_id(self, message_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        for status_id, status in self.message_statuses.items():
            if status['messageId'] == message_id and status['userId'] == user_id:
                return status
        
        return None
    
    def create_message_status(self, status_data: Dict[str, Any]) -> Dict[str, Any]:
        status_id = self.message_status_id_counter
        self.message_status_id_counter += 1
        
        # Create status
        status = {
            'id': status_id,
            'messageId': status_data['messageId'],
            'userId': status_data['userId'],
            'status': status_data.get('status', 'delivered'),
            'updatedAt': datetime.now().isoformat()
        }
        
        self.message_statuses[str(status_id)] = status
        self._save_to_storage()
        
        # Check if all participants have read the message
        self._update_message_status_if_all(status_data['messageId'])
        
        return status
    
    def update_message_status(self, message_id: int, user_id: int, status: str) -> Dict[str, Any]:
        # Get existing status
        existing_status = self.get_message_status_by_message_and_user_id(message_id, user_id)
        
        if existing_status:
            # Update status
            existing_status['status'] = status
            existing_status['updatedAt'] = datetime.now().isoformat()
            
            self._save_to_storage()
            
            # Check if all participants have read the message
            self._update_message_status_if_all(message_id)
            
            return existing_status
        else:
            # Create new status
            return self.create_message_status({
                'messageId': message_id,
                'userId': user_id,
                'status': status
            })
    
    def _update_message_status_if_all(self, message_id: int) -> None:
        """Update message status if all participants have read the message"""
        # Get the message
        message = None
        for msg_id, msg in self.messages.items():
            if msg['id'] == message_id:
                message = msg
                break
        
        if not message:
            return
        
        # Get the chat participants
        chat_id = message['chatId']
        participants = self.get_chat_participants(chat_id)
        
        # Skip the sender
        sender_id = message['senderId']
        other_participants = [p for p in participants if p['userId'] != sender_id]
        
        # Check if all participants have read the message
        all_read = True
        for participant in other_participants:
            status = self.get_message_status_by_message_and_user_id(message_id, participant['userId'])
            if not status or status['status'] != 'read':
                all_read = False
                break
        
        # Update message status if all read
        if all_read and message['status'] != 'read':
            message['status'] = 'read'
            self._save_to_storage()
    
    def _initialize_demo_data(self):
        """Initialize demo data for testing"""
        print("Initializing demo data...")
        
        # Hash password
        hashed_password = bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode()
        
        # Create demo user
        demo_user = self.create_user({
            'username': 'demo-user',
            'password': hashed_password,
            'displayName': 'Demo User',
            'status': "Hey there! I'm using Gallan",
            'avatar': None
        })
        print(f"Added demo user: {demo_user['username']}")
        
        # Create Islamic scholars
        mufti_samar = self.create_user({
            'username': 'mufti_samar',
            'password': hashed_password,
            'displayName': 'Mufti Samar Abbas Qadri',
            'status': 'إِنَّ مَعَ الْعُسْرِ يُسْرًا - With hardship comes ease',
            'avatar': None
        })
        
        mufti_naseer = self.create_user({
            'username': 'mufti_naseer',
            'password': hashed_password,
            'displayName': 'Mufti Naseer udin Naseer',
            'status': 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
            'avatar': None
        })
        
        # Add scholars as contacts for demo user
        self.create_contact({
            'userId': demo_user['id'],
            'contactId': mufti_samar['id'],
            'displayName': mufti_samar['displayName']
        })
        
        self.create_contact({
            'userId': demo_user['id'],
            'contactId': mufti_naseer['id'],
            'displayName': mufti_naseer['displayName']
        })
        
        print(f"Added demo contacts: {mufti_samar['displayName']}, {mufti_naseer['displayName']}")


class MongoStorage(Storage):
    """MongoDB storage implementation"""
    
    def __init__(self):
        # Get MongoDB connection string from environment variables
        mongo_uri = os.getenv("MONGODB_URI")
        if not mongo_uri:
            raise ValueError("MONGODB_URI environment variable is not set")
        
        # Connect to MongoDB
        self.client = MongoClient(mongo_uri)
        self.db = self.client.get_database("whatsapp_clone")
        
        # Initialize collections
        self.users_collection = self.db.users
        self.contacts_collection = self.db.contacts
        self.chats_collection = self.db.chats
        self.chat_participants_collection = self.db.chat_participants
        self.messages_collection = self.db.messages
        self.message_statuses_collection = self.db.message_statuses
        self.counters_collection = self.db.counters
        
        # Initialize counters if they don't exist
        if self.counters_collection.count_documents({}) == 0:
            self.counters_collection.insert_one({
                "_id": "counters",
                "user_id": 1,
                "contact_id": 1,
                "chat_id": 1,
                "chat_participant_id": 1,
                "message_id": 1,
                "message_status_id": 1
            })
        
        # Initialize demo data if users collection is empty
        if self.users_collection.count_documents({}) == 0:
            self._initialize_demo_data()
    
    def _get_next_sequence(self, name: str) -> int:
        """Get the next sequence value for a counter"""
        counter = self.counters_collection.find_one_and_update(
            {"_id": "counters"},
            {"$inc": {name: 1}},
            return_document=True
        )
        return counter[name]
    
    def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        user = self.users_collection.find_one({"id": user_id})
        if user:
            # Convert ObjectId to string
            user["_id"] = str(user["_id"])
            return user
        return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        user = self.users_collection.find_one({"username": username})
        if user:
            # Convert ObjectId to string
            user["_id"] = str(user["_id"])
            return user
        return None
    
    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = self._get_next_sequence("user_id")
        
        # Create user
        user = {
            'id': user_id,
            'username': user_data['username'],
            'password': user_data['password'],
            'displayName': user_data.get('displayName', user_data['username']),
            'status': user_data.get('status', "Hey there! I'm using Gallan"),
            'avatar': user_data.get('avatar', None),
            'lastSeen': datetime.now().isoformat(),
            'isOnline': True
        }
        
        # Insert into database
        self.users_collection.insert_one(user)
        
        # Convert ObjectId to string
        user["_id"] = str(user["_id"])
        
        return user
    
    def update_user(self, user_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        # Get user
        user = self.users_collection.find_one({"id": user_id})
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Update fields
        update_data = {}
        for key, value in data.items():
            if key in user and key != 'id' and key != 'password':
                update_data[key] = value
        
        # Update user
        self.users_collection.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = self.users_collection.find_one({"id": user_id})
        
        # Convert ObjectId to string
        updated_user["_id"] = str(updated_user["_id"])
        
        return updated_user
    
    def update_user_status(self, user_id: int, is_online: bool) -> Dict[str, Any]:
        # Get user
        user = self.users_collection.find_one({"id": user_id})
        if not user:
            raise ValueError(f"User with ID {user_id} not found")
        
        # Update status
        update_data = {
            "isOnline": is_online
        }
        
        if not is_online:
            update_data["lastSeen"] = datetime.now().isoformat()
        
        # Update user
        self.users_collection.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = self.users_collection.find_one({"id": user_id})
        
        # Convert ObjectId to string
        updated_user["_id"] = str(updated_user["_id"])
        
        return updated_user
    
    # Implement the rest of the MongoDB methods similarly
    
    def _initialize_demo_data(self):
        """Initialize demo data for testing"""
        print("Initializing demo data...")
        
        # Hash password
        hashed_password = bcrypt.hashpw("password123".encode(), bcrypt.gensalt()).decode()
        
        # Create demo user
        demo_user = self.create_user({
            'username': 'demo-user',
            'password': hashed_password,
            'displayName': 'Demo User',
            'status': "Hey there! I'm using Gallan",
            'avatar': None
        })
        print(f"Added demo user: {demo_user['username']}")
        
        # Create Islamic scholars
        mufti_samar = self.create_user({
            'username': 'mufti_samar',
            'password': hashed_password,
            'displayName': 'Mufti Samar Abbas Qadri',
            'status': 'إِنَّ مَعَ الْعُسْرِ يُسْرًا - With hardship comes ease',
            'avatar': None
        })
        
        mufti_naseer = self.create_user({
            'username': 'mufti_naseer',
            'password': hashed_password,
            'displayName': 'Mufti Naseer udin Naseer',
            'status': 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
            'avatar': None
        })
        
        # Add scholars as contacts for demo user
        self.create_contact({
            'userId': demo_user['id'],
            'contactId': mufti_samar['id'],
            'displayName': mufti_samar['displayName']
        })
        
        self.create_contact({
            'userId': demo_user['id'],
            'contactId': mufti_naseer['id'],
            'displayName': mufti_naseer['displayName']
        })
        
        print(f"Added demo contacts: {mufti_samar['displayName']}, {mufti_naseer['displayName']}")


def get_storage() -> Storage:
    """Get storage implementation based on environment variables"""
    if os.getenv("MONGODB_URI"):
        try:
            return MongoStorage()
        except Exception as e:
            print(f"Error initializing MongoDB storage: {e}")
            print("Falling back to in-memory storage")
            return InMemoryStorage()
    else:
        print("Using in-memory storage (no MONGODB_URI found)")
        return InMemoryStorage()