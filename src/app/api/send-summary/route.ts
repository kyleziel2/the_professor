import { NextRequest, NextResponse } from "next/server";
import { openai, MODEL } from "@/app/lib/openai";
import { SUMMARY_INSTRUCTIONS } from "@/utils/instructions";
import { sendSummaryToEmail } from "@/app/lib/email-sender";

type ChatMessage = {
  role: string;
  content: string;
};

/**
 * API endpoint that generates AI-powered conversation summaries and emails them.
 *
 * KEY CHANGE: No more threadId. Receives the full message history from the frontend
 * and makes a single Responses API call with summary-specific instructions.
 */
export async function POST(request: NextRequest) {
  try {
    const { messages, toEmail } = (await request.json()) as {
      messages: ChatMessage[];
      toEmail: string;
    };

    if (!messages || messages.length === 0 || !toEmail) {
      return NextResponse.json(
        { error: "Missing required fields: messages, toEmail" },
        { status: 400 }
      );
    }

    // Build a transcript from the conversation history
    const transcript = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    // Generate the summary using a direct Responses API call
    // with summary-specific instructions (not the Professor's normal prompt)
    const response = await openai.responses.create({
      model: MODEL,
      instructions: SUMMARY_INSTRUCTIONS,
      input: [
        {
          role: "user",
          content: `Here is the full conversation transcript. Please summarize it:\n\n${transcript}`,
        },
      ],
    });

    const summaryMessage = response.output_text;

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
