export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  let { message, threadId } = await req.json();
  //const cookieStore = cookies();

  //let threadId = (await cookieStore).get("threadId")?.value;
  let isNewThread = false;

  // Create a new thread if not found
  if (!threadId) {
    const thread = await openai.beta.threads.create();
    threadId = thread.id;
    isNewThread = true;
  }

  // Add user message to thread
  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: message,
  });

  const encoder = new TextEncoder();

  // Run assistant and wait for completion
  /*const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: process.env.ASSISTANT_ID!,
  });*/

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const runStream = await openai.beta.threads.runs.stream(threadId, {
          assistant_id: process.env.ASSISTANT_ID!,
        });
        controller.enqueue(encoder.encode(`__THREAD_ID__:${threadId}\n`));

        for await (const event of runStream) {
          if (event.event === "thread.message.delta") {
            const delta = event.data.delta;
            const text =
              delta.content?.[0]?.type === "text"
                ? (delta.content[0].text?.value ?? "No response")
                : "No valid assistant response";

            if (text) {
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

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });

  // Get the assistant's latest message
  /*const messages = await openai.beta.threads.messages.list(threadId);
  const assistantMessage = messages.data.find((m) => m.role === "assistant");
  const reply =
    assistantMessage?.content?.[0]?.type === "text"
      ? (assistantMessage.content[0].text?.value ?? "No response")
      : "No valid assistant response";

  // Prepare the response
  const response = NextResponse.json({ reply, threadId });

  // Set threadId cookie if it's a new thread
  /*if (isNewThread) {
    response.cookies.set("threadId", threadId, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
    });
  }*/

  //return response;
}
