import { Resend } from "resend";
import { marked } from "marked";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendPDFtoEmail(pdfBuffer: Buffer, toEmail: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  
  if (!process.env.FROM_EMAIL) {
    throw new Error("FROM_EMAIL environment variable is not set");
  }

  const result = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to: toEmail,
    subject: "Your Conversation PDF",
    html: `
      <div style="font-family: Poppins, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #00B5E8; margin-bottom: 16px;">Your Conversation PDF</h2>
        <p style="line-height: 1.6; font-size: 15px;">
          Hello! Here's your conversation transcript in PDF format as requested.
        </p>
        <p style="line-height: 1.6; font-size: 15px;">
          The PDF contains the full conversation history and is attached to this email.
        </p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="margin-top: 20px; font-size: 12px; color: #888;">
          Sent with ❤️ from your AI Assistant
        </p>
      </div>
    `,
    text: "Hello! Attached is your conversation in PDF format as requested.",
    attachments: [
      {
        filename: `conversation-${new Date().toISOString().split('T')[0]}.pdf`,
        content: pdfBuffer,
        type: "application/pdf",
      },
    ],
  });

  if (result.error) {
    throw new Error(`Failed to send email: ${result.error.message}`);
  }

  return result;
}

export async function sendSummaryToEmail(
  summaryMarkdown: string,
  toEmail: string
) {
  // Convert markdown to HTML
  const summaryHtml = marked(summaryMarkdown);

  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: toEmail,
    subject: "Your Conversation Summary",
    html: `
      <div style="font-family: Poppins, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333; background: #f9f9f9; border-radius: 12px;">
        <h2 style="color: #00B5E8; margin-bottom: 16px;">Conversation Summary</h2>
        <div style="line-height: 1.6; font-size: 15px;">
          ${summaryHtml}
        </div>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
        <p style="margin-top: 20px;">✨ Tip: Save this email for reference, or copy the key insights into your notes.</p>
      <p style="margin-top: 20px; font-size: 12px; color: #888;">
        Sent with ❤️ from your AI Professor
      </p>
      </div>
    `,
    text: summaryMarkdown, // fallback plain text
  });
}
