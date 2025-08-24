// Force Node.js runtime for OpenAI streaming compatibility
export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { openai } from "@/app/lib/openai";

/**
 * Main chat endpoint that handles streaming responses from OpenAI Assistant
 * Creates new threads as needed and streams responses back to client
 */
export async function POST(req: NextRequest) {
  let { message, threadId } = await req.json();

  //const cookieStore = cookies();

  //let threadId = (await cookieStore).get("threadId")?.value;
  let isNewThread = false;

  // Create a new OpenAI thread if none exists (each conversation needs a thread)
  if (!threadId) {
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
    isNewThread = true;
  }

  // Add the user's message to the OpenAI thread
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  const encoder = new TextEncoder();

  // Stream the assistant's response in real-time using OpenAI's streaming API
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Create streaming run with the assistant
        const runStream = await openai.beta.threads.runs.stream(threadId, {
          assistant_id: process.env.ASSISTANT_ID!,
        });
        
        // Send threadId first so client can track conversation
        controller.enqueue(encoder.encode(`__THREAD_ID__:${threadId}\n`));

        // Process each streaming event from OpenAI
        for await (const event of runStream) {
          // Only handle text message deltas (incremental text chunks)
          if (event.event === "thread.message.delta") {
            const delta = event.data.delta;
            const text =
              delta.content?.[0]?.type === "text"
                ? (delta.content[0].text?.value ?? "No response")
                : "No valid assistant response";

            if (text) {
              // Stream each text chunk to the client
              controller.enqueue(encoder.encode(text));
            }
          }
        }
        controller.close();
      } catch (error) {
        console.error(error);
        controller.enqueue(encoder.encode("There was a problem"));
        controller.close();
      }
    },
  });

  // Return streaming response with proper headers for SSE-like behavior
  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache", // Prevent caching of streaming responses
      Connection: "keep-alive", // Keep connection open for streaming
    },
  });

  /* Legacy non-streaming implementation - kept for reference
  const messages = await openai.beta.threads.messages.list(threadId);
  const assistantMessage = messages.data.find((m) => m.role === "assistant");
  const reply =
    assistantMessage?.content?.[0]?.type === "text"
      ? (assistantMessage.content[0].text?.value ?? "No response")
      : "No valid assistant response";

  const response = NextResponse.json({ reply, threadId });

  // Cookie-based thread tracking (replaced with client-side storage)
  if (isNewThread) {
    response.cookies.set("threadId", threadId, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
    });
  }
  */
}
