import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class TestPdfGenerator {
  /**
   * Create a test PDF with content that can be compressed
   */
  static async createTestPDF(): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    
    // Add multiple pages with content
    for (let i = 0; i < 10; i++) {
      const page = pdf.addPage([595, 842]); // A4 size
      
      // Add title
      page.drawText(`Test Page ${i + 1}`, {
        x: 50,
        y: 800,
        size: 24,
        font,
        color: rgb(0, 0, 0),
      });
      
      // Add lots of text content to make the file larger
      const content = `This is test content for page ${i + 1}. `.repeat(100);
      
      let yPosition = 750;
      const lines = this.wrapText(content, 80);
      
      lines.forEach(line => {
        if (yPosition > 50) {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
            color: rgb(0, 0, 0),
          });
          yPosition -= 15;
        }
      });
      
      // Add metadata to make file larger
      pdf.setTitle('Test PDF Document with Lots of Metadata and Content');
      pdf.setAuthor('Test Author with a Very Long Name That Takes Up Space');
      pdf.setSubject('This is a test subject that is intentionally very long to increase file size');
      pdf.setKeywords(['test', 'pdf', 'compression', 'demo', 'large', 'file', 'metadata']);
      pdf.setProducer('Test PDF Generator with Very Long Producer Name');
      pdf.setCreator('Test Creator Application with Extended Name for Size Testing');
    }
    
    const pdfBytes = await pdf.save({
      useObjectStreams: false, // Don't compress initially
      addDefaultPage: false,
    });
    
    console.log(`Created test PDF: ${pdfBytes.length} bytes`);
    return pdfBytes;
  }

  /**
   * Wrap text into lines
   */
  private static wrapText(text: string, maxLength: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) lines.push(currentLine);
    return lines;
  }
}
