// Force Node.js runtime for streaming compatibility
export const runtime = "nodejs";

// Increase max duration to prevent timeouts on longer conversations
// Vercel Pro allows up to 300s; Hobby allows 60s
export const maxDuration = 60;

import { NextRequest } from "next/server";
import { openai, MODEL } from "@/app/lib/openai";
import { assembleSystemPrompt, getDefaultGuideId } from "@/prompts/assembler";

/**
 * Message type matching the frontend's message structure.
 * The frontend sends the full conversation history with each request.
 */
type ChatMessage = {
  role: string;
  content: string;
};

/**
 * Maximum number of recent messages to send to the API.
 * This controls cost and prevents timeouts on long conversations.
 *
 * The trimming strategy:
 * - Always keep the FIRST user message (establishes context/intent)
 * - Always keep the LAST N messages (recent conversation flow)
 * - Drop middle messages when the conversation exceeds the limit
 *
 * 20 messages = ~10 back-and-forth exchanges, which is plenty
 * for the model to maintain conversational coherence.
 */
const MAX_CONVERSATION_MESSAGES = 20;

/**
 * Trims conversation history to control token usage while preserving context.
 * Keeps the first user message (for intent/context) and the most recent messages.
 */
function trimConversationHistory(messages: ChatMessage[]): ChatMessage[] {
  if (messages.length <= MAX_CONVERSATION_MESSAGES) {
    return messages;
  }

  // Always keep the first user message for context
  const firstUserMessage = messages.find((m) => m.role === "user");
  const recentMessages = messages.slice(-MAX_CONVERSATION_MESSAGES);

  // If the first user message is already in the recent window, just return recent
  if (!firstUserMessage || recentMessages.includes(firstUserMessage)) {
    return recentMessages;
  }

  // Otherwise, prepend the first user message to the recent window
  return [firstUserMessage, ...recentMessages];
}

/**
 * Main chat endpoint — streams responses from OpenAI Responses API.
 *
 * Architecture:
 * 1. No threads — conversation history comes from the frontend
 * 2. System prompt is assembled from Core Identity + Conversation Guide
 * 3. Conversation history is trimmed to control cost and prevent timeouts
 * 4. Uses OpenAI Responses API with streaming
 */
export async function POST(req: NextRequest) {
  const { messages, guideId } = (await req.json()) as {
    messages: ChatMessage[];
    guideId?: string;
  };

  // Assemble the system prompt: Core Identity + selected Guide
  const selectedGuide = guideId || getDefaultGuideId();
  const systemPrompt = assembleSystemPrompt(selectedGuide);

  // Trim conversation history to control cost and prevent timeouts
  const trimmedMessages = trimConversationHistory(messages);

  // Convert to the format the Responses API expects
  const input = trimmedMessages.map((msg) => ({
    role: msg.role as "user" | "assistant",
    content: msg.content,
  }));

  const encoder = new TextEncoder();

  // Stream the response using the Responses API
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        const stream = await openai.responses.create({
          model: MODEL,
          instructions: systemPrompt,
          input,
          stream: true,
        });

        // Process streaming events from the Responses API
        for await (const event of stream) {
          if (event.type === "response.output_text.delta") {
            const text = event.delta;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }

          if (event.type === "error") {
            console.error("Stream error event:", event);
            controller.enqueue(
              encoder.encode(
                "\n\nI'm sorry, I encountered an issue. Could you try again?"
              )
            );
          }
        }

        controller.close();
      } catch (error) {
        console.error("Responses API error:", error);
        controller.enqueue(
          encoder.encode(
            "I'm having trouble connecting right now. Please try again in a moment."
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
