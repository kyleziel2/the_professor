import { NextRequest, NextResponse } from "next/server";
import { generatePDF } from "@/app/lib/pdf-generator";
import { sendPDFtoEmail } from "@/app/lib/email-sender";

/**
 * API endpoint for generating PDF from conversation messages and emailing it
 * Validates input, generates PDF using pdf-lib, and sends via Resend email service
 */

// Email format validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Message array validation helper - ensures proper structure for PDF generation
function isValidMessages(messages: any): boolean {
  return Array.isArray(messages) && 
         messages.length > 0 && 
         messages.every(msg => 
           msg && 
           typeof msg === 'object' && 
           typeof msg.role === 'string' && 
           typeof msg.content === 'string' &&
           msg.role.trim() !== '' &&
           msg.content.trim() !== ''
         );
}

export async function POST(req: NextRequest) {
  try {
    let requestBody;
    
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }

    const { messages, toEmail } = requestBody;

    if (!toEmail || typeof toEmail !== 'string') {
      return NextResponse.json(
        { error: "Email address is required and must be a string" }, 
        { status: 400 }
      );
    }

    if (!isValidEmail(toEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" }, 
        { status: 400 }
      );
    }

    if (!messages) {
      return NextResponse.json(
        { error: "Messages array is required" }, 
        { status: 400 }
      );
    }

    if (!isValidMessages(messages)) {
      return NextResponse.json(
        { error: "Messages must be a non-empty array with valid message objects" }, 
        { status: 400 }
      );
    }

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generatePDF(messages);
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return NextResponse.json(
        { error: "Failed to generate PDF" }, 
        { status: 500 }
      );
    }

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return NextResponse.json(
        { error: "Generated PDF is empty" }, 
        { status: 500 }
      );
    }

    try {
      await sendPDFtoEmail(pdfBuffer, toEmail);
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      return NextResponse.json(
        { error: "Failed to send email" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "PDF sent successfully to " + toEmail 
    });
    
  } catch (error) {
    console.error("Unexpected error in send-pdf:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
