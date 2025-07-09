import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type Message = {
  role: string;
  content: string;
};

export const generatePDF = async (messages: Message[]): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = 12;
  const margin = 50;
  const lineHeight = 18;
  const maxLineWidth = 500; // width of the text block

  let page = pdfDoc.addPage();
  const { height } = page.getSize();
  let y = height - margin;

  // Title
  page.drawText("Conversation Transcript", {
    x: margin,
    y,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 30;

  for (const msg of messages) {
    const roleLine = `${msg.role.toUpperCase()}: `;
    const textLines = splitTextIntoLines(
      font,
      `${msg.content}`,
      fontSize,
      maxLineWidth - font.widthOfTextAtSize(roleLine, fontSize)
    );

    // Check for space
    if (y - lineHeight * (textLines.length + 1) < margin) {
      page = pdfDoc.addPage();
      y = height - margin;
    }

    // Draw role
    page.drawText(roleLine, {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0.53, 0.71), // blue-ish
    });

    const roleWidth = font.widthOfTextAtSize(roleLine, fontSize);
    page.drawText(textLines[0], {
      x: margin + roleWidth,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;

    // Draw the remaining lines
    for (let i = 1; i < textLines.length; i++) {
      if (y - lineHeight < margin) {
        page = pdfDoc.addPage();
        y = height - margin;
      }
      page.drawText(textLines[i], {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }

    y -= 10; // Extra spacing after each message
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};

/**
 * Wraps text into multiple lines so it doesn't overflow the page width
 */
function splitTextIntoLines(
  font: any,
  text: string,
  fontSize: number,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth < maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}
