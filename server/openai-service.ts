import OpenAI from "openai";
import { Message, User } from "@shared/schema";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Context types
export interface ConversationContext {
  user: User;
  contact: {
    displayName: string;
    status?: string;
    isScholar?: boolean;
  };
  recentMessages?: Message[];
}

export interface ConversationStarter {
  text: string;
  category: "greeting" | "question" | "religious" | "general";
}

/**
 * Generate conversation starters based on context
 * @param context Context containing user and contact information
 * @returns Array of conversation starter suggestions
 */
export async function generateConversationStarters(
  context: ConversationContext
): Promise<ConversationStarter[]> {
  try {
    // Build prompt based on available context
    const prompt = buildPrompt(context);

    // Call OpenAI API with prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: 
          `You are an expert assistant for an Islamic messaging app that helps users craft thoughtful message starters.
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
           Don't use placeholders like [relevant topic]. Be specific based on context.`
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse and return the conversation starters
    const content = response.choices[0].message.content;
    if (!content) {
      return getDefaultStarters(context);
    }

    try {
      const parsed = JSON.parse(content);
      return parsed.hasOwnProperty("starters") ? parsed.starters : parsed;
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      return getDefaultStarters(context);
    }
  } catch (error) {
    console.error("Error generating conversation starters:", error);
    return getDefaultStarters(context);
  }
}

/**
 * Build a detailed prompt based on available context
 */
function buildPrompt(context: ConversationContext): string {
  const { user, contact, recentMessages } = context;
  
  let prompt = `Generate conversation starters for a user named ${user.displayName} to send to ${contact.displayName}.`;
  
  if (contact.isScholar) {
    prompt += ` ${contact.displayName} is an Islamic scholar the user may want to consult about religious topics.`;
  }
  
  if (contact.status) {
    prompt += ` ${contact.displayName}'s status is: "${contact.status}".`;
  }
  
  if (recentMessages && recentMessages.length > 0) {
    prompt += ` Their most recent conversation includes these messages:\n`;
    const lastFewMessages = recentMessages.slice(-3);
    lastFewMessages.forEach(msg => {
      const sender = msg.senderId === user.id ? user.displayName : contact.displayName;
      prompt += `- ${sender}: ${msg.text || "(media message)"}\n`;
    });
  } else {
    prompt += ` This will be their first conversation.`;
  }
  
  return prompt;
}

/**
 * Fallback default starters in case OpenAI API call fails
 */
function getDefaultStarters(context: ConversationContext): ConversationStarter[] {
  const isScholar = context.contact.isScholar;
  
  const defaultStarters: ConversationStarter[] = [
    { text: "Assalamu alaikum, how are you today?", category: "greeting" },
    { text: "Hope you're having a blessed day!", category: "greeting" },
    { text: "What have you been up to lately?", category: "general" },
  ];
  
  if (isScholar) {
    defaultStarters.push(
      { text: "I had a question about Islamic jurisprudence if you have time.", category: "religious" },
      { text: "Could you recommend some good books on Islamic theology?", category: "question" }
    );
  } else {
    defaultStarters.push(
      { text: "Would you like to meet up sometime this week?", category: "question" },
      { text: "Have you heard about the new community event?", category: "general" }
    );
  }
  
  return defaultStarters;
}