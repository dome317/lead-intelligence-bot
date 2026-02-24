import Anthropic from "@anthropic-ai/sdk";
import { EXTRACT_LEAD_PROMPT } from "@/lib/system-prompt";
import { addLead } from "@/lib/leads-store";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface LeadData {
  name: string | null;
  email: string | null;
  goal: string;
  obstacle: string;
  readiness: string;
  score: number;
  score_label: "HOT" | "WARM" | "COLD";
  conversation_summary: string;
}

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return Response.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const conversationText = messages
      .map(
        (msg: { role: string; content: string }) =>
          `${msg.role === "user" ? "Prospect" : "Alex"}: ${msg.content}`
      )
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `${EXTRACT_LEAD_PROMPT}\n\nConversation:\n${conversationText}`,
        },
      ],
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text response from Claude");
    }

    const rawText = textContent.text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    const leadData: LeadData = JSON.parse(rawText);

    await addLead({
      ...leadData,
      source: "chat",
      timestamp: new Date().toISOString(),
    });

    // Forward to n8n/Make webhook if configured
    const webhookUrl =
      process.env.N8N_WEBHOOK_URL || process.env.MAKE_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadData,
          timestamp: new Date().toISOString(),
          source: "lead-intelligence-bot",
        }),
      }).catch((err) => console.error("Webhook error:", err));
    }

    return Response.json({ lead: leadData });
  } catch (error) {
    console.error("Extract lead error:", error);
    return Response.json(
      { error: "Failed to extract lead data" },
      { status: 500 }
    );
  }
}
