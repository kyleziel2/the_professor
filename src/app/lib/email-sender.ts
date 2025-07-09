import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendPDFtoEmail(pdfBuffer: Buffer, toEmail: string) {
  await resend.emails.send({
    from: process.env.FROM_EMAIL!,
    to: toEmail,
    subject: "Your Conversation PDF",
    text: "Attached is your conversation in PDF format.",
    attachments: [
      {
        filename: "conversation.pdf",
        content: pdfBuffer.toString("base64"),
      },
    ],
  });
}
