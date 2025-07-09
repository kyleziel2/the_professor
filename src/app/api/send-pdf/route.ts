import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/app/lib/pdf-generator";
import { sendPDFtoEmail } from "@/app/lib/email-sender";

export async function POST(req: NextRequest) {
  try {
    const { messages, toEmail } = await req.json();

    if (!messages || !toEmail) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const pdfBuffer = await generatePDF(messages);
    await sendPDFtoEmail(pdfBuffer, toEmail);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PDF email error:", error);
    return NextResponse.json({ error: "Failed to send PDF" }, { status: 500 });
  }
}
