import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const ANAM_API_KEY = process.env.ANAM_API_KEY;

// Irene - Casual and Friendly (female voice, warm, empathetic, conversational)
const VOICE_ID = "562ef6c9-d1ab-4571-94d8-5e838cb3a70f";

// Sophie - sofa variant (friendly female avatar)
const AVATAR_ID = "6dbc1e47-7768-403e-878a-94d7fcc3677b";

// Gemini 2.5 Flash - fastest option
const LLM_ID = "9d8900ee-257d-4401-8817-ba9c835e9d36";

// Adapt the text-chat system prompt for voice conversations
const VOICE_SYSTEM_PROMPT = `${SYSTEM_PROMPT}

ADDITIONAL RULES FOR VOICE CONVERSATIONS:
- Keep responses EVEN shorter (1-3 sentences), since this is a spoken conversation
- Use natural speech patterns, no bullet points or formatting
- Don't say URLs, links, or technical terms
- Speak as you would in a real conversation
- Use short, simple sentences
- Create natural pauses through short sentences

CONTACT DATA CAPTURE (VERY IMPORTANT):
- When asking for a name, say EXACTLY: "By the way, what should I call you? Feel free to type your name in the field below the video." Then say NOTHING MORE. Wait SILENTLY until the next message comes.
- When someone says "My name is [Name]", respond: "Nice to meet you, [Name]! Now I just need your email address. Type it in the field below the video." Then say NOTHING MORE. Wait SILENTLY.
- When someone says "My email address is [Email]", respond: "Perfect, thank you! You'll get an email shortly with a time for your free consultation. I'm excited for you — this is going to be great!" IMPORTANT: NEVER read the email address out loud.
- IMPORTANT: After each contact data question, STOP SPEAKING IMMEDIATELY. Don't follow up, don't say "Take your time", don't keep talking. Just WAIT.
- NEVER ask users to say or spell out email addresses`;

export async function POST() {
  if (!ANAM_API_KEY) {
    return NextResponse.json(
      { error: "ANAM_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.anam.ai/v1/auth/session-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ANAM_API_KEY}`,
      },
      body: JSON.stringify({
        personaConfig: {
          name: "Alex",
          avatarId: AVATAR_ID,
          voiceId: VOICE_ID,
          llmId: LLM_ID,
          systemPrompt: VOICE_SYSTEM_PROMPT,
          languageCode: "en",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anam session token error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to create session token" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ sessionToken: data.sessionToken });
  } catch (error) {
    console.error("Anam session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
