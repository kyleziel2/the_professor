import { NextRequest, NextResponse } from "next/server";
import { openai } from "@/app/lib/openai";
import { SUMMARY_INSTRUCTIONS } from "@/utils/instructions";
import { sendSummaryToEmail } from "@/app/lib/email-sender";

/**
 * API endpoint that generates AI-powered conversation summaries and emails them
 * Takes a threadId and email, fetches conversation history, generates summary via OpenAI
 */
export async function POST(request: NextRequest) {
  try {
    const { threadId, toEmail } = await request.json();

    if (!threadId || !toEmail) {
      return NextResponse.json(
        { error: "Missing required fields: threadId, toEmail" },
        { status: 400 }
      );
    }

    // Fetch all messages from the OpenAI thread
    const messagesResponse = await openai.beta.threads.messages.list(threadId);
    
    // Convert messages to readable transcript format
    const transcript = messagesResponse.data
      .map((m: any) => {
        const role = m.role.toUpperCase();
        // OpenAI messages can have multiple content parts, join them
        const content = m.content
          .map((c: any) => c.text?.value)
          .join(" ")
          .trim();
        return `${role}: ${content}`;
      })
      .reverse() // OpenAI returns newest first, reverse for chronological order
      .join("\n");

    // Send transcript back to assistant with special summarization instructions
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: `Here is the full conversation transcript. Please summarize it:\n\n${transcript}`,
    });

    // Run assistant with summary-specific instructions (overrides default behavior)
    await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: process.env.ASSISTANT_ID!,
      instructions: SUMMARY_INSTRUCTIONS, // Special prompts for summarization
    });

    // Get the assistant's summary response (most recent message)
    const messages = await openai.beta.threads.messages.list(threadId);
    const summaryMessage = messages.data[0]?.content
      ?.map((c: any) => c.text?.value)
      .join("\n");

    if (!summaryMessage) {
      return NextResponse.json(
        { error: "No summary generated" },
        { status: 500 }
      );
    }

    // Send formatted summary email to user
    await sendSummaryToEmail(summaryMessage, toEmail);

    return NextResponse.json(
      {
        summary: summaryMessage,
        message: "Summary generated and emailed successfully.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
