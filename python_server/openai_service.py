import os
import json
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ConversationContext:
    """Class to store conversation context for OpenAI API"""
    
    def __init__(self, user: Dict[str, Any], contact: Dict[str, Any], recent_messages: Optional[List[Dict[str, Any]]] = None):
        self.user = user
        self.contact = contact
        self.recent_messages = recent_messages

class ConversationStarter:
    """Class to store conversation starter data"""
    
    def __init__(self, text: str, category: str):
        self.text = text
        self.category = category
    
    def to_dict(self) -> Dict[str, str]:
        return {
            "text": self.text,
            "category": self.category
        }

def generate_conversation_starters(context: ConversationContext) -> List[Dict[str, str]]:
    """Generate conversation starters based on context"""
    try:
        # Build prompt based on available context
        prompt = build_prompt(context)
        
        # Call OpenAI API with prompt
        response = client.chat.completions.create(
            model="gpt-4o", # the newest OpenAI model is "gpt-4o" which was released May 13, 2024
            messages=[
                {
                    "role": "system",
                    "content": 
                    """You are an expert assistant for an Islamic messaging app that helps users craft thoughtful message starters.
                     Generate 5 conversation starters based on the provided context. Make them diverse, respectful, and appropriate.
                     Focus especially on religious and scholarly conversation starters if the contact is identified as a scholar.
                     Each starter should have a corresponding category: "greeting", "question", "religious", or "general".
                     Craft starters that are brief (under 80 characters) and natural sounding.
                     Return in JSON format like this:
                     [
                       {"text": "Assalamu alaikum, how are you today?", "category": "greeting"},
                       {"text": "What's your opinion on [relevant topic]?", "category": "question"},
                       ...
                     ]
                     Don't use placeholders like [relevant topic]. Be specific based on context."""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse and return the conversation starters
        content = response.choices[0].message.content
        if not content:
            return get_default_starters(context)
        
        try:
            parsed = json.loads(content)
            starters = parsed.get("starters", parsed)
            return starters
        except json.JSONDecodeError:
            print(f"Error parsing OpenAI response: {content}")
            return get_default_starters(context)
    
    except Exception as e:
        print(f"Error generating conversation starters: {e}")
        return get_default_starters(context)

def build_prompt(context: ConversationContext) -> str:
    """Build a detailed prompt based on available context"""
    user_name = context.user.get("displayName", context.user.get("username", "User"))
    contact_name = context.contact.get("displayName", "Contact")
    
    prompt = f"Generate conversation starters for a user named {user_name} to send to {contact_name}."
    
    if context.contact.get("isScholar"):
        prompt += f" {contact_name} is an Islamic scholar the user may want to consult about religious topics."
    
    if context.contact.get("status"):
        prompt += f" {contact_name}'s status is: \"{context.contact.get('status')}\"."
    
    if context.recent_messages and len(context.recent_messages) > 0:
        prompt += " Their most recent conversation includes these messages:\n"
        last_few_messages = context.recent_messages[-3:] if len(context.recent_messages) > 3 else context.recent_messages
        
        for msg in last_few_messages:
            sender = user_name if msg.get("senderId") == context.user.get("id") else contact_name
            message_text = msg.get("text", "(media message)")
            prompt += f"- {sender}: {message_text}\n"
    else:
        prompt += " This will be their first conversation."
    
    return prompt

def get_default_starters(context: ConversationContext) -> List[Dict[str, str]]:
    """Fallback default starters in case OpenAI API call fails"""
    is_scholar = context.contact.get("isScholar", False)
    
    default_starters = [
        {"text": "Assalamu alaikum, how are you today?", "category": "greeting"},
        {"text": "Hope you're having a blessed day!", "category": "greeting"},
        {"text": "What have you been up to lately?", "category": "general"}
    ]
    
    if is_scholar:
        default_starters.extend([
            {"text": "I had a question about Islamic jurisprudence if you have time.", "category": "religious"},
            {"text": "Could you recommend some good books on Islamic theology?", "category": "question"}
        ])
    else:
        default_starters.extend([
            {"text": "Would you like to meet up sometime this week?", "category": "question"},
            {"text": "Have you heard about the new community event?", "category": "general"}
        ])
    
    return default_starters