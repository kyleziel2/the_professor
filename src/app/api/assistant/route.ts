import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const cookieStore = cookies();

  let threadId = (await cookieStore).get("threadId")?.value;
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

  // Run assistant and wait for completion
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: process.env.ASSISTANT_ID!,
  });

  // Get the assistant's latest message
  const messages = await openai.beta.threads.messages.list(threadId);
  const assistantMessage = messages.data.find((m) => m.role === "assistant");
  const reply =
    assistantMessage?.content?.[0]?.type === "text"
      ? (assistantMessage.content[0].text?.value ?? "No response")
      : "No valid assistant response";

  // Prepare the response
  const response = NextResponse.json({ reply });

  // Set threadId cookie if it's a new thread
  if (isNewThread) {
    response.cookies.set("threadId", threadId, {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
    });
  }

  return response;
}
