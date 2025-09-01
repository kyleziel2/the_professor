import { PDFDocument, rgb, StandardFonts, PDFFont } from "pdf-lib";
import { marked } from "marked";

export type Message = {
  role: string;
  content: string;
};

// Convert markdown to styled text segments
type TextSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
};

function parseMarkdownToSegments(markdown: string): TextSegment[] {
  if (!markdown || typeof markdown !== "string") return [];

  const segments: TextSegment[] = [];
  let currentText = markdown;

  // Simple markdown parsing for bold, italic, and inline code
  const patterns = [
    { regex: /\*\*([^*]+)\*\*/g, type: "bold" },
    { regex: /\*([^*]+)\*/g, type: "italic" },
    { regex: /`([^`]+)`/g, type: "code" },
  ];

  let lastIndex = 0;
  const matches: Array<{
    index: number;
    length: number;
    text: string;
    type: string;
  }> = [];

  // Find all markdown patterns
  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.regex.exec(currentText)) !== null) {
      matches.push({
        index: match.index,
        length: match[0].length,
        text: match[1],
        type: pattern.type,
      });
    }
  });

  // Sort matches by position
  matches.sort((a, b) => a.index - b.index);

  // Build segments
  matches.forEach((match) => {
    // Add text before match
    if (match.index > lastIndex) {
      const plainText = currentText.substring(lastIndex, match.index);
      if (plainText) segments.push({ text: plainText });
    }

    // Add styled text
    const segment: TextSegment = { text: match.text };
    if (match.type === "bold") segment.bold = true;
    if (match.type === "italic") segment.italic = true;
    if (match.type === "code") segment.code = true;
    segments.push(segment);

    lastIndex = match.index + match.length;
  });

  // Add remaining text
  if (lastIndex < currentText.length) {
    const remainingText = currentText.substring(lastIndex);
    if (remainingText) segments.push({ text: remainingText });
  }

  // If no markdown found, return original text as single segment
  if (segments.length === 0) {
    segments.push({ text: currentText });
  }

  return segments
    .map((segment) => ({
      ...segment,
      text: segment.text
        .replace(/[\r\n\t]+/g, " ")
        .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((segment) => segment.text);
}

export const generatePDF = async (messages: Message[]): Promise<Buffer> => {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("Messages array is required and cannot be empty");
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const codeFont = await pdfDoc.embedFont(StandardFonts.Courier);

    const fontSize = 11;
    const titleSize = 16;
    const margin = 50;
    const lineHeight = 16;
    const pageWidth = 595.28; // A4 width in points
    const maxLineWidth = pageWidth - margin * 2;

    let page = pdfDoc.addPage([pageWidth, 841.89]); // A4 size
    const { height } = page.getSize();
    let y = height - margin;

    // Title
    const titleText = "Conversation Transcript";
    const titleWidth = boldFont.widthOfTextAtSize(titleText, titleSize);
    page.drawText(titleText, {
      x: (pageWidth - titleWidth) / 2, // Center the title
      y,
      size: titleSize,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    y -= 40;

    // Add date
    const dateText = `Generated on: ${new Date().toLocaleDateString()}`;
    const dateWidth = font.widthOfTextAtSize(dateText, fontSize);
    page.drawText(dateText, {
      x: (pageWidth - dateWidth) / 2,
      y,
      size: fontSize,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    y -= 30;

    for (const msg of messages) {
      if (
        !msg ||
        typeof msg.role !== "string" ||
        typeof msg.content !== "string"
      ) {
        continue; // Skip invalid messages
      }

      const role = msg.role.toUpperCase().trim();
      const segments = parseMarkdownToSegments(msg.content);

      if (segments.length === 0) continue; // Skip empty content

      const roleText = `${role === "USER" ? "User" : "Professor"}: `;
      const roleColor = role.includes("USER")
        ? rgb(0.2, 0.4, 0.8)
        : rgb(0.8, 0.4, 0.2);

      // Process segments and create wrapped lines with styling
      const styledLines: Array<{ text: string; segments: TextSegment[] }> = [];
      let currentLineText = "";
      let currentLineSegments: TextSegment[] = [];

      for (const segment of segments) {
        const words = segment.text.split(" ");

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const spacePrefix = currentLineText ? " " : "";
          const testText = currentLineText + spacePrefix + word;

          // Get appropriate font for width calculation
          const testFont = segment.bold
            ? boldFont
            : segment.italic
              ? italicFont
              : segment.code
                ? codeFont
                : font;
          const testWidth = testFont.widthOfTextAtSize(testText, fontSize);
          const roleWidth =
            styledLines.length === 0
              ? boldFont.widthOfTextAtSize(roleText, fontSize)
              : 0;

          if (testWidth <= maxLineWidth - roleWidth) {
            currentLineText = testText;
            currentLineSegments.push({ ...segment, text: spacePrefix + word });
          } else {
            // Line is full, save it and start new line
            if (currentLineText) {
              styledLines.push({
                text: currentLineText,
                segments: [...currentLineSegments],
              });
              currentLineText = word;
              currentLineSegments = [{ ...segment, text: word }];
            }
          }
        }
      }

      // Add the last line
      if (currentLineText) {
        styledLines.push({
          text: currentLineText,
          segments: currentLineSegments,
        });
      }

      // Check if we need a new page
      const neededHeight = lineHeight * (styledLines.length + 1);
      if (y - neededHeight < margin) {
        page = pdfDoc.addPage([pageWidth, 841.89]);
        y = height - margin;
      }

      // Draw role label
      page.drawText(roleText, {
        x: margin,
        y,
        size: fontSize,
        font: boldFont,
        color: roleColor,
      });

      // Draw styled content
      for (let lineIndex = 0; lineIndex < styledLines.length; lineIndex++) {
        const line = styledLines[lineIndex];
        let xOffset =
          lineIndex === 0
            ? margin + boldFont.widthOfTextAtSize(roleText, fontSize)
            : margin;

        if (y - lineHeight < margin) {
          page = pdfDoc.addPage([pageWidth, 841.89]);
          y = height - margin;
          xOffset = margin; // Reset to margin on new page
        }

        // Draw each segment with appropriate styling
        for (const segment of line.segments) {
          let segmentFont = font;
          let segmentColor = rgb(0, 0, 0);

          if (segment.bold) segmentFont = boldFont;
          else if (segment.italic) segmentFont = italicFont;
          else if (segment.code) {
            segmentFont = codeFont;
            segmentColor = rgb(0.2, 0.2, 0.6); // Blue color for code
          }

          page.drawText(segment.text, {
            x: xOffset,
            y,
            size: fontSize,
            font: segmentFont,
            color: segmentColor,
          });

          xOffset += segmentFont.widthOfTextAtSize(segment.text, fontSize);
        }

        y -= lineHeight;
      }

      y -= 8; // Extra spacing between messages
    }

    // Footer on last page
    const footerText = "End of Conversation";
    const footerWidth = font.widthOfTextAtSize(footerText, fontSize);
    if (y - 30 < margin) {
      page = pdfDoc.addPage([pageWidth, 841.89]);
      y = height - margin;
    }

    page.drawText(footerText, {
      x: (pageWidth - footerWidth) / 2,
      y: margin,
      size: fontSize,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(
      `Failed to generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
};
