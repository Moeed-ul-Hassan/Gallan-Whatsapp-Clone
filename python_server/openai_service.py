#!/usr/bin/env python3
"""OpenAI integration service for the WhatsApp clone application."""
import os
import json
import time
from typing import Dict, List, Any, Optional
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

class ConversationContext:
    """Class to store conversation context for OpenAI API"""
    
    def __init__(self, user: Dict[str, Any], contact: Dict[str, Any], recent_messages: Optional[List[Dict[str, Any]]] = None):
        """Initialize conversation context"""
        self.user = user
        self.contact = contact
        self.recent_messages = recent_messages or []

class ConversationStarter:
    """Class to store conversation starter data"""
    
    def __init__(self, text: str, category: str):
        """Initialize conversation starter"""
        self.text = text
        self.category = category
    
    def to_dict(self) -> Dict[str, str]:
        """Convert to dictionary"""
        return {
            'text': self.text,
            'category': self.category
        }

def generate_conversation_starters(context: ConversationContext) -> List[Dict[str, str]]:
    """Generate conversation starters based on context"""
    try:
        # Build prompt based on available context
        prompt = build_prompt(context)
        
        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4o",  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful assistant that generates conversation starters based on context. "
                        "Generate a list of 5 conversation starters that a user could use to start a conversation with another person. "
                        "Each starter should be categorized as one of: greeting, question, religious, general. "
                        "Respond with a JSON array where each object has 'text' and 'category' fields."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse response
        result = json.loads(response.choices[0].message.content)
        
        # Extract conversation starters
        starters = result.get('starters', [])
        
        # Validate and return starters
        if not starters or len(starters) == 0:
            # Fallback to default starters
            return get_default_starters(context)
        
        return starters
    
    except Exception as e:
        print(f"Error generating conversation starters: {e}")
        # Fallback to default starters
        return get_default_starters(context)

def build_prompt(context: ConversationContext) -> str:
    """Build a detailed prompt based on available context"""
    user_name = context.user.get('displayName', 'User')
    contact_name = context.contact.get('displayName', 'Contact')
    contact_status = context.contact.get('status', '')
    is_scholar = context.contact.get('isScholar', False)
    
    # Build base prompt
    prompt = (
        f"I need conversation starters for a chat between {user_name} and {contact_name}. "
        f"The contact's status message is: '{contact_status}'. "
    )
    
    # Add context about the contact being a scholar
    if is_scholar:
        prompt += (
            f"{contact_name} is an Islamic scholar. "
            "The starters should be respectful and can include relevant religious topics. "
            "Include at least 2 religiously appropriate conversation starters. "
        )
    
    # Add context from recent messages if available
    if context.recent_messages and len(context.recent_messages) > 0:
        prompt += "\nRecent conversation context:\n"
        for msg in context.recent_messages[-5:]:  # Only include up to 5 most recent messages
            sender = "User" if msg.get('senderId') == context.user.get('id') else "Contact"
            content = msg.get('content', '')
            prompt += f"{sender}: {content}\n"
    
    # Final request
    prompt += (
        "\nPlease generate 5 conversation starters that would be appropriate and engaging. "
        "Make sure each starter is categorized as one of: greeting, question, religious, general. "
        "Format your response as a JSON object with a key called 'starters' that contains an array of objects, "
        "where each object has 'text' and 'category' fields."
    )
    
    return prompt

def get_default_starters(context: ConversationContext) -> List[Dict[str, str]]:
    """Fallback default starters in case OpenAI API call fails"""
    is_scholar = context.contact.get('isScholar', False)
    
    if is_scholar:
        # Default starters for scholars
        return [
            {
                "text": "Assalamu Alaikum, how are you doing today?",
                "category": "greeting"
            },
            {
                "text": "I've been reflecting on Surah Al-Fatiha recently. Do you have any insights about its deeper meanings?",
                "category": "religious"
            },
            {
                "text": "What topic have you been researching or teaching about lately?",
                "category": "question"
            },
            {
                "text": "Can you recommend any books or resources for better understanding Islamic ethics?",
                "category": "religious"
            },
            {
                "text": "I hope you and your family are in good health and spirits.",
                "category": "general"
            }
        ]
    else:
        # Default starters for regular contacts
        return [
            {
                "text": "Hey there! How's your day going?",
                "category": "greeting"
            },
            {
                "text": "What have you been up to lately?",
                "category": "question"
            },
            {
                "text": "I saw something interesting today that reminded me of you.",
                "category": "general"
            },
            {
                "text": "Do you have any plans for the weekend?",
                "category": "question"
            },
            {
                "text": "I was just thinking about our last conversation.",
                "category": "general"
            }
        ]