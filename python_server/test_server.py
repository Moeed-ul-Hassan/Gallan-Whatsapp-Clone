#!/usr/bin/env python3
"""
Simple test script to verify that the Python server setup is working correctly.
"""
import os
import json
import bcrypt

# Import our modules
from db import MongoStorage, InMemoryStorage, get_storage
from openai_service import generate_conversation_starters, ConversationContext

def test_storage():
    """Test storage functionality"""
    print("Testing storage...")
    
    # Get storage implementation
    storage = get_storage()
    
    # Print storage type
    print(f"Storage type: {type(storage).__name__}")
    
    # List users
    users = [storage.get_user(i) for i in range(1, 10)]
    users = [user for user in users if user]
    
    print(f"Found {len(users)} users:")
    for user in users:
        print(f"  - {user['username']} (ID: {user['id']})")
    
    # Test creating a user
    password = "testpassword"
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    test_user = storage.create_user({
        'username': f"test-user-{len(users) + 1}",
        'password': hashed_password,
        'displayName': f"Test User {len(users) + 1}",
        'status': "Testing the Python backend"
    })
    
    print(f"Created test user: {test_user['username']} (ID: {test_user['id']})")
    
    # Test getting contacts
    contacts = storage.get_contacts_by_user_id(test_user['id'])
    print(f"User has {len(contacts)} contacts")
    
    return test_user

def test_openai():
    """Test OpenAI integration"""
    print("\nTesting OpenAI integration...")
    
    # Check if OpenAI API key is set
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("OpenAI API key not found. Please set the OPENAI_API_KEY environment variable.")
        return False
    
    print(f"OpenAI API key found: {api_key[:4]}...{api_key[-4:]}")
    
    # Create a test context
    context = ConversationContext(
        user={
            'id': 1,
            'username': 'test-user',
            'displayName': 'Test User'
        },
        contact={
            'displayName': 'Test Scholar',
            'status': 'Islamic Scholar',
            'isScholar': True
        }
    )
    
    # Generate conversation starters
    try:
        starters = generate_conversation_starters(context)
        print(f"Generated {len(starters)} conversation starters:")
        for starter in starters:
            print(f"  - {starter['text']} ({starter['category']})")
        return True
    except Exception as e:
        print(f"Error generating conversation starters: {e}")
        return False

if __name__ == "__main__":
    print("Testing Python server setup...")
    
    # Test storage
    test_user = test_storage()
    
    # Test OpenAI
    openai_success = test_openai()
    
    # Print summary
    print("\nTest summary:")
    print(f"  - Storage: {'OK' if test_user else 'FAILED'}")
    print(f"  - OpenAI: {'OK' if openai_success else 'FAILED'}")
    
    print("\nPython server setup is complete!")