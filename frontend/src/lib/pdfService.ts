import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { WorkingCompressionService } from './workingCompression';

export class PDFService {
  /**
   * Merge multiple PDF files into a single PDF
   * @param files Array of File objects to merge
   * @returns Promise<Uint8Array> The merged PDF as bytes
   */
  static async mergePDFs(files: File[]): Promise<Uint8Array> {
    if (files.length < 2) {
      throw new Error('At least 2 PDF files are required for merging');
    }

    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Process each file in order
    for (const file of files) {
      try {
        // Convert file to array buffer
        const fileBuffer = await file.arrayBuffer();
        
        // Load the PDF
        const pdf = await PDFDocument.load(fileBuffer);
        
        // Get all pages from the current PDF
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        // Add pages to the merged PDF
        pages.forEach((page) => {
          mergedPdf.addPage(page);
        });
        
        console.log(`Added ${pages.length} pages from ${file.name}`);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        throw new Error(`Failed to process ${file.name}. Make sure it's a valid PDF file.`);
      }
    }

    // Serialize the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    
    console.log(`Successfully merged ${files.length} PDFs into ${mergedPdfBytes.length} bytes`);
    
    return mergedPdfBytes;
  }

  /**
   * Split a PDF file into multiple PDFs (one page per file)
   * @param file The PDF file to split
   * @returns Promise<Uint8Array> ZIP file containing all split PDFs
   */
  static async splitPDFByPages(file: File): Promise<Uint8Array> {
    try {
      console.log(`📄 Starting PDF split for: ${file.name} (${file.size} bytes)`);
      console.log(`📄 File type: ${file.type}`);
      console.log(`📄 File lastModified: ${file.lastModified}`);
      
      // Validate file size
      if (file.size === 0) {
        throw new Error('The uploaded file is empty. Please upload a valid PDF file.');
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('File is too large. Please upload a PDF file smaller than 50MB.');
      }

      // Basic file type validation
      if (file.type && !file.type.includes('pdf')) {
        console.warn(`⚠️ File type ${file.type} may not be a PDF`);
      }

      const fileBuffer = await file.arrayBuffer();
      console.log(`📄 File buffer loaded: ${fileBuffer.byteLength} bytes`);
      
      let pdf: PDFDocument;
      try {
        pdf = await PDFDocument.load(fileBuffer);
      } catch (loadError) {
        console.error('❌ PDF load error:', loadError);
        if (loadError instanceof Error) {
          if (loadError.message.includes('Invalid PDF')) {
            throw new Error('The uploaded file is not a valid PDF. Please upload a properly formatted PDF file.');
          } else if (loadError.message.includes('password') || loadError.message.includes('encrypted')) {
            throw new Error('This PDF is password-protected. Please remove the password and try again.');
          } else if (loadError.message.includes('corrupted')) {
            throw new Error('The PDF file appears to be corrupted. Please try uploading a different PDF file.');
          }
        }
        throw new Error('Failed to load PDF file. Please ensure it is a valid, non-corrupted PDF.');
      }
      
      const pageCount = pdf.getPageCount();
      console.log(`📄 PDF loaded successfully with ${pageCount} pages`);
      
      if (pageCount <= 1) {
        throw new Error('PDF must have more than one page to split. This PDF only has 1 page.');
      }

      let zip: JSZip;
      try {
        zip = new JSZip();
      } catch (zipError) {
        console.error('❌ JSZip creation error:', zipError);
        throw new Error('Failed to create ZIP file. Please try again.');
      }
      
      const baseName = file.name.split('.')[0];

      // Create a separate PDF for each page
      for (let i = 0; i < pageCount; i++) {
        console.log(`📄 Processing page ${i + 1}/${pageCount}`);
        try {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(page);
          
          const pdfBytes = await newPdf.save();
          zip.file(`${baseName}_Page${i + 1}.pdf`, pdfBytes);
        } catch (pageError) {
          console.error(`❌ Error processing page ${i + 1}:`, pageError);
          throw new Error(`Failed to process page ${i + 1}. The PDF may be corrupted.`);
        }
      }

      console.log(`✅ Successfully split PDF into ${pageCount} files`);
      
      // Generate ZIP file
      let zipBytes: Uint8Array;
      try {
        zipBytes = await zip.generateAsync({ type: 'uint8array' });
        console.log(`✅ ZIP file generated: ${zipBytes.length} bytes`);
      } catch (zipGenError) {
        console.error('❌ ZIP generation error:', zipGenError);
        throw new Error('Failed to generate ZIP file. Please try again.');
      }
      
      return zipBytes;
    } catch (error) {
      console.error('❌ Error splitting PDF:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Invalid PDF')) {
          throw new Error('The uploaded file is not a valid PDF. Please upload a properly formatted PDF file.');
        } else if (error.message.includes('corrupted')) {
          throw new Error('The PDF file appears to be corrupted. Please try uploading a different PDF file.');
        } else if (error.message.includes('password')) {
          throw new Error('This PDF is password-protected. Please remove the password and try again.');
        } else if (error.message.includes('empty')) {
          throw new Error('The uploaded file is empty. Please upload a valid PDF file.');
        } else if (error.message.includes('too large')) {
          throw new Error(error.message);
        } else if (error.message.includes('more than one page')) {
          throw new Error(error.message);
        }
      }
      
      // Generic fallback error
      throw new Error('Failed to split PDF. Please ensure the file is a valid, non-password-protected PDF with multiple pages.');
    }
  }

  /**
   * Split a PDF file by custom page ranges
   * @param file The PDF file to split
   * @param ranges Array of page ranges with file names
   * @returns Promise<Uint8Array> ZIP file containing split PDFs
   */
  static async splitPDFByRanges(
    file: File, 
    ranges: Array<{ startPage: number; endPage: number; fileName: string }>
  ): Promise<Uint8Array> {
    try {
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const pageCount = pdf.getPageCount();
      
      // Validate ranges
      for (const range of ranges) {
        if (range.startPage < 1 || range.endPage > pageCount || range.startPage > range.endPage) {
          throw new Error(`Invalid page range: ${range.startPage}-${range.endPage}. PDF has ${pageCount} pages.`);
        }
      }

      const zip = new JSZip();

      // Create PDF for each range
      for (const range of ranges) {
        const newPdf = await PDFDocument.create();
        
        // Get pages for this range (convert to 0-based indexing)
        const pageIndices = [];
        for (let i = range.startPage - 1; i < range.endPage; i++) {
          pageIndices.push(i);
        }
        
        const pages = await newPdf.copyPages(pdf, pageIndices);
        pages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const fileName = range.fileName.endsWith('.pdf') ? range.fileName : `${range.fileName}.pdf`;
        zip.file(fileName, pdfBytes);
        
        console.log(`Created ${fileName} with pages ${range.startPage}-${range.endPage}`);
      }

      console.log(`Successfully split PDF into ${ranges.length} custom ranges`);
      
      // Generate ZIP file
      const zipBytes = await zip.generateAsync({ type: 'uint8array' });
      return zipBytes;
    } catch (error) {
      console.error('Error splitting PDF by ranges:', error);
      throw new Error('Failed to split PDF. Make sure the page ranges are valid.');
    }
  }

  /**
   * Compress a PDF file while preserving all content
   * @param file The PDF file to compress
   * @returns Promise<Uint8Array> The compressed PDF as bytes
   */
  static async compressPDF(file: File): Promise<Uint8Array> {
    return WorkingCompressionService.compressPDF(file);
  }

  /**
   * Validate Word document file
   * @param file The Word document file to validate
   * @returns Promise<void>
   */
  private static async validateWordFile(file: File): Promise<void> {
    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum supported size is 50MB.');
    }

    // Check if file is empty
    if (file.size === 0) {
      throw new Error('File is empty or corrupted.');
    }

    // Check file extension
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (!fileExtension || !['doc', 'docx'].includes(fileExtension)) {
      throw new Error('Only .doc and .docx files are supported');
    }

    // Warn about DOC files as they have limited support
    if (fileExtension === 'doc') {
      console.warn('⚠️ DOC files have limited conversion support. For best results, please use DOCX format.');
    }

    // Basic MIME type validation
    const supportedMimeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/octet-stream' // Some browsers send this for .docx files
    ];
    
    if (file.type && !supportedMimeTypes.includes(file.type)) {
      console.warn(`⚠️ Unexpected MIME type: ${file.type}, but proceeding with conversion`);
    }
  }

  /**
   * Convert Word document (DOC/DOCX) to PDF
   * Note: Word to PDF conversion should be handled by the Express backend
   * @param file The Word document file to convert
   * @returns Promise<Uint8Array> The PDF as bytes
   */
  static async wordToPDF(): Promise<Uint8Array> {
    throw new Error('Word to PDF conversion should be handled by the Express backend. This method is not supported in the browser environment.');
  }

  /**
   * Convert image to PDF
   * @param file The image file to convert
   * @returns Promise<Uint8Array> The PDF as bytes
   */
  static async imageToPDF(file: File): Promise<Uint8Array> {
    try {
      const pdf = await PDFDocument.create();
      const page = pdf.addPage();
      
      // Get image bytes
      const imageBytes = await file.arrayBuffer();
      
      // Determine image type and embed
      let image;
      const fileType = file.type.toLowerCase();
      
      if (fileType.includes('jpeg') || fileType.includes('jpg')) {
        image = await pdf.embedJpg(imageBytes);
      } else if (fileType.includes('png')) {
        image = await pdf.embedPng(imageBytes);
      } else {
        throw new Error('Unsupported image format. Please use JPG or PNG.');
      }

      // Scale image to fit page
      const { width, height } = image.scale(1);
      const pageWidth = page.getWidth();
      const pageHeight = page.getHeight();
      
      // Calculate scaling to fit image on page while maintaining aspect ratio
      const scaleX = pageWidth / width;
      const scaleY = pageHeight / height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't upscale
      
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      
      // Center the image on the page
      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;
      
      page.drawImage(image, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      });

      const pdfBytes = await pdf.save();
      
      console.log(`Converted image ${file.name} to PDF (${pdfBytes.length} bytes)`);
      
      return pdfBytes;
    } catch (error) {
      console.error('Error converting image to PDF:', error);
      throw new Error('Failed to convert image to PDF. Make sure it\'s a valid image file.');
    }
  }

  /**
   * Convert HTML file to PDF
   * Note: HTML to PDF conversion should be handled by the Express backend
   * @param file The HTML file to convert
   * @returns Promise<Uint8Array> The PDF as bytes
   */
  static async htmlToPDF(): Promise<Uint8Array> {
    throw new Error('HTML to PDF conversion should be handled by the Express backend. This method is not supported in the browser environment.');
  }

  /**
   * Convert PDF to JPG images
   * Note: PDF to JPG conversion should be handled by the Express backend
   * @param file The PDF file to convert
   * @returns Promise<Uint8Array> Single JPG image or ZIP file containing multiple JPG images
   */
  static async pdfToJPG(): Promise<Uint8Array> {
    throw new Error('PDF to JPG conversion should be handled by the Express backend. This method is not supported in the browser environment.');
  }

  /**
   * Convert PDF to Word document (DOCX) using pdf2docx and OCR
   * Note: This method is not used directly - PDF to Word conversion is handled by the Express backend
   * which intelligently detects text-based vs scanned PDFs and uses appropriate conversion methods:
   * - Text-based PDFs: pdf2docx for accurate formatting
   * - Scanned PDFs: OCR + pdf2docx for text recognition and formatting
   * @param file The PDF file to convert
   * @returns Promise<Uint8Array> The Word document as bytes
   */
  static async pdfToWord(): Promise<Uint8Array> {
    throw new Error('PDF to Word conversion should be handled by the Express backend. This method is deprecated.');
  }
}
