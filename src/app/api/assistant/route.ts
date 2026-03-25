// Force Node.js runtime for streaming compatibility
export const runtime = "nodejs";

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
 * Main chat endpoint — streams responses from OpenAI Responses API.
 *
 * Key architectural changes from the Assistants API version:
 * 1. No threads — conversation history comes from the frontend
 * 2. System prompt is assembled from Core Identity + Conversation Guide
 * 3. Uses OpenAI Responses API (not Assistants API)
 * 4. Streams using response.output_text.delta events
 */
export async function POST(req: NextRequest) {
  const { messages, guideId } = (await req.json()) as {
    messages: ChatMessage[];
    guideId?: string;
  };

  // Assemble the system prompt: Core Identity + selected Guide
  // Phase 1: Uses default guide (Values Clarification)
  // Phase 2: guideId will come from intent detection on the frontend or first message
  const selectedGuide = guideId || getDefaultGuideId();
  const systemPrompt = assembleSystemPrompt(selectedGuide);

  // Convert our message history to the format the Responses API expects.
  // The Responses API accepts an array of {role, content} objects in the `input` field.
  const input = messages.map((msg) => ({
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
          // Listen for text delta events — these contain the incremental text chunks
          if (event.type === "response.output_text.delta") {
            const text = event.delta;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }

          // Handle errors from the stream
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

  // Return streaming response with proper headers
  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
