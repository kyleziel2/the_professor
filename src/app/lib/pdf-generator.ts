import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type Message = {
  role: string;
  content: string;
};

function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[\r\n\t]+/g, ' ') // Replace newlines and tabs with spaces
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '') // Keep basic ASCII and Latin-1 characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

export const generatePDF = async (messages: Message[]): Promise<Buffer> => {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('Messages array is required and cannot be empty');
  }

  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const fontSize = 11;
    const titleSize = 16;
    const margin = 50;
    const lineHeight = 16;
    const pageWidth = 595.28; // A4 width in points
    const maxLineWidth = pageWidth - (margin * 2);

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
      if (!msg || typeof msg.role !== 'string' || typeof msg.content !== 'string') {
        continue; // Skip invalid messages
      }

      const role = sanitizeText(msg.role.toUpperCase());
      const content = sanitizeText(msg.content);
      
      if (!content) continue; // Skip empty content

      const roleText = `${role}: `;
      const roleColor = role.includes('USER') ? rgb(0.2, 0.4, 0.8) : rgb(0.8, 0.4, 0.2);
      
      // Split content into words and wrap them
      const words = content.split(' ');
      let currentLine = '';
      const lines: string[] = [];
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, fontSize);
        
        if (testWidth <= maxLineWidth - font.widthOfTextAtSize(roleText, fontSize)) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            // Word is too long, break it
            let remainingWord = word;
            while (remainingWord.length > 0) {
              let chunk = '';
              for (let i = 0; i < remainingWord.length; i++) {
                const testChunk = chunk + remainingWord[i];
                if (font.widthOfTextAtSize(testChunk, fontSize) <= maxLineWidth - font.widthOfTextAtSize(roleText, fontSize)) {
                  chunk = testChunk;
                } else {
                  break;
                }
              }
              if (chunk) {
                lines.push(chunk);
                remainingWord = remainingWord.substring(chunk.length);
              } else {
                break; // Prevent infinite loop
              }
            }
          }
        }
      }
      
      if (currentLine) {
        lines.push(currentLine);
      }

      // Check if we need a new page
      const neededHeight = lineHeight * (lines.length + 1);
      if (y - neededHeight < margin) {
        page = pdfDoc.addPage([pageWidth, 841.89]);
        y = height - margin;
      }

      // Draw role and first line
      page.drawText(roleText, {
        x: margin,
        y,
        size: fontSize,
        font: boldFont,
        color: roleColor,
      });

      if (lines.length > 0) {
        const roleWidth = boldFont.widthOfTextAtSize(roleText, fontSize);
        page.drawText(lines[0], {
          x: margin + roleWidth,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;

        // Draw remaining lines
        for (let i = 1; i < lines.length; i++) {
          if (y - lineHeight < margin) {
            page = pdfDoc.addPage([pageWidth, 841.89]);
            y = height - margin;
          }
          
          page.drawText(lines[i], {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
          y -= lineHeight;
        }
      } else {
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
    console.error('PDF generation error:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};