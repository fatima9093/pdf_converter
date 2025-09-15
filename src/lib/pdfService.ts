import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { WorkingCompressionService } from './workingCompression';
const mammoth = require('mammoth');
const htmlPdf = require('html-pdf-node');
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';
import sharp from 'sharp';

const execAsync = promisify(exec);

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
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const pageCount = pdf.getPageCount();
      
      if (pageCount <= 1) {
        throw new Error('PDF must have more than one page to split');
      }

      const zip = new JSZip();
      const baseName = file.name.split('.')[0];

      // Create a separate PDF for each page
      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        
        const pdfBytes = await newPdf.save();
        zip.file(`${baseName}_Page${i + 1}.pdf`, pdfBytes);
      }

      console.log(`Successfully split PDF into ${pageCount} files`);
      
      // Generate ZIP file
      const zipBytes = await zip.generateAsync({ type: 'uint8array' });
      return zipBytes;
    } catch (error) {
      console.error('Error splitting PDF:', error);
      throw new Error('Failed to split PDF. Make sure it\'s a valid PDF file.');
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
   * @param file The Word document file to convert
   * @returns Promise<Uint8Array> The PDF as bytes
   */
  static async wordToPDF(file: File): Promise<Uint8Array> {
    try {
      console.log(`📄 Converting Word document: ${file.name}`);
      console.log(`📏 Original file size: ${file.size} bytes`);
      console.log(`📋 MIME type: ${file.type}`);

      // Validate the file first
      await this.validateWordFile(file);

      // Get file extension to determine conversion method
      const fileExtension = file.name.toLowerCase().split('.').pop()!;

      // Check if it's a DOC file and warn user
      if (fileExtension === 'doc') {
        throw new Error('DOC files are not fully supported. Please convert your document to DOCX format in Microsoft Word and try again. This ensures all formatting and content is preserved during conversion.');
      }

      // Create temporary directory for file processing
      const tempDir = path.join(os.tmpdir(), `word-to-pdf-${Date.now()}`);
      await fs.promises.mkdir(tempDir, { recursive: true });

      try {
        // Save uploaded file to temporary location
        const inputPath = path.join(tempDir, `input.${fileExtension}`);
        
        // Convert File to Buffer and save to disk
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        await fs.promises.writeFile(inputPath, fileBuffer);

        let pdfBytes: Uint8Array;

        // Convert Word document to HTML using Mammoth.js
        console.log('🔄 Converting DOCX document to HTML using Mammoth.js...');
        const result = await mammoth.convertToHtml({ path: inputPath });
        
        if (result.messages && result.messages.length > 0) {
          console.warn('⚠️ Mammoth conversion warnings:', result.messages.map((m: any) => m.message));
        }

        if (!result.value || result.value.trim().length === 0) {
          throw new Error('Document appears to be empty or unreadable. Please ensure the file is a valid Word document and not corrupted.');
        }

        // Create well-formatted HTML for PDF conversion
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Converted Document</title>
            <style>
              @page {
                size: A4;
                margin: 2.5cm;
              }
              body { 
                font-family: 'Times New Roman', serif; 
                font-size: 12pt; 
                line-height: 1.6; 
                color: #000;
                margin: 0;
                padding: 0;
              }
              h1, h2, h3, h4, h5, h6 { 
                font-weight: bold; 
                margin-top: 18pt; 
                margin-bottom: 12pt; 
                page-break-after: avoid;
              }
              h1 { font-size: 18pt; }
              h2 { font-size: 16pt; }
              h3 { font-size: 14pt; }
              p { 
                margin-bottom: 12pt; 
                text-align: justify;
                orphans: 2;
                widows: 2;
              }
              ul, ol { 
                margin-bottom: 12pt; 
                padding-left: 24pt;
              }
              li { margin-bottom: 6pt; }
              table { 
                border-collapse: collapse; 
                width: 100%; 
                margin-bottom: 12pt;
                page-break-inside: avoid;
              }
              td, th { 
                border: 1px solid #000; 
                padding: 8pt; 
                text-align: left;
                vertical-align: top;
              }
              th { 
                background-color: #f0f0f0;
                font-weight: bold;
              }
              img { 
                max-width: 100%; 
                height: auto;
                page-break-inside: avoid;
              }
              .page-break { 
                page-break-before: always; 
              }
              strong, b { font-weight: bold; }
              em, i { font-style: italic; }
              u { text-decoration: underline; }
            </style>
          </head>
          <body>${result.value}</body>
          </html>
        `;

        // Convert HTML to PDF using html-pdf-node
        console.log('🔄 Converting HTML to PDF...');
        const options = { 
          format: 'A4',
          margin: { 
            top: '2.5cm', 
            right: '2.5cm', 
            bottom: '2.5cm', 
            left: '2.5cm' 
          },
          printBackground: true,
          preferCSSPageSize: true,
          displayHeaderFooter: false,
          timeout: 60000, // 60 second timeout
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        };
        
        const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, options);
        if (!pdfBuffer || pdfBuffer.length === 0) {
          throw new Error('PDF generation failed - empty output. The document may contain unsupported elements.');
        }
        
        pdfBytes = new Uint8Array(pdfBuffer);

        console.log(`✅ Word to PDF conversion successful: ${pdfBytes.length} bytes`);
        
        // Optimize the PDF using our compression service
        try {
          const optimizedFile = new File([pdfBytes], 'converted.pdf', { type: 'application/pdf' });
          const optimizedBytes = await WorkingCompressionService.compressPDF(optimizedFile);
          console.log(`🗜️ PDF optimized: ${pdfBytes.length} -> ${optimizedBytes.length} bytes`);
          return optimizedBytes;
        } catch (compressionError) {
          console.warn('⚠️ PDF optimization failed, returning uncompressed PDF:', compressionError);
          return pdfBytes;
        }
        
      } finally {
        // Clean up temporary files
        try {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
          console.warn('⚠️ Failed to clean up temporary files:', cleanupError);
        }
      }
      
    } catch (error) {
      console.error('❌ Word to PDF conversion failed:', error);
      throw new Error(`Failed to convert Word document to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
   * @param file The HTML file to convert
   * @returns Promise<Uint8Array> The PDF as bytes
   */
  static async htmlToPDF(file: File): Promise<Uint8Array> {
    try {
      console.log(`🔄 Converting HTML file: ${file.name} (${file.size} bytes)`);

      // Read HTML file content
      const htmlContent = await file.text();
      
      if (!htmlContent || htmlContent.trim().length === 0) {
        throw new Error('HTML file appears to be empty or unreadable.');
      }

      console.log('🔄 Converting HTML to PDF using html-pdf-node...');
      
      // Configure PDF generation options
      const options = { 
        format: 'A4' as const,
        margin: { 
          top: '2.5cm', 
          right: '2.5cm', 
          bottom: '2.5cm', 
          left: '2.5cm' 
        },
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: false,
        timeout: 60000, // 60 second timeout
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      };
      
      // Convert HTML to PDF using html-pdf-node
      const pdfBuffer = await htmlPdf.generatePdf({ content: htmlContent }, options);
      
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF generation failed - empty output. The HTML may contain unsupported elements.');
      }
      
      const pdfBytes = new Uint8Array(pdfBuffer);
      
      console.log(`✅ HTML to PDF conversion successful: ${pdfBytes.length} bytes`);
      
      // Optimize the PDF using our compression service
      try {
        const optimizedFile = new File([pdfBytes], 'converted.pdf', { type: 'application/pdf' });
        const optimizedBytes = await WorkingCompressionService.compressPDF(optimizedFile);
        console.log(`🗜️ PDF optimized: ${pdfBytes.length} -> ${optimizedBytes.length} bytes`);
        return optimizedBytes;
      } catch (compressionError) {
        console.warn('⚠️ PDF optimization failed, returning uncompressed PDF:', compressionError);
        return pdfBytes;
      }
      
    } catch (error) {
      console.error('❌ HTML to PDF conversion failed:', error);
      throw new Error(`HTML to PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert PDF to JPG images using Poppler (pdftoppm) + Sharp pipeline
   * @param file The PDF file to convert
   * @returns Promise<Uint8Array> Single JPG image or ZIP file containing multiple JPG images
   */
  static async pdfToJPG(file: File): Promise<Uint8Array> {
    let tempPdfPath: string | null = null;
    let tempOutputDir: string | null = null;
    
    try {
      console.log(`📄 Converting PDF to JPG: ${file.name} (${file.size} bytes)`);

      // Validate PDF first
      const fileBuffer = await file.arrayBuffer();
      let pdfDoc: PDFDocument;
      let pageCount: number;
      
      try {
        pdfDoc = await PDFDocument.load(fileBuffer);
        pageCount = pdfDoc.getPageCount();
        console.log(`📊 PDF has ${pageCount} page(s)`);
        
        if (pageCount === 0) {
          throw new Error('PDF appears to be empty or corrupted.');
        }
      } catch (pdfError) {
        throw new Error('Invalid PDF file. Please ensure the file is not corrupted or password-protected.');
      }

      console.log('🔄 Converting PDF pages to JPG using Poppler (pdftoppm) + Sharp pipeline...');

      // Create temporary directories
      const tempDir = os.tmpdir();
      const sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      tempPdfPath = path.join(tempDir, `temp_${sessionId}.pdf`);
      tempOutputDir = path.join(tempDir, `output_${sessionId}`);
      
      // Create output directory
      await fs.promises.mkdir(tempOutputDir, { recursive: true });
      
      // Write PDF buffer to temporary file
      await fs.promises.writeFile(tempPdfPath, Buffer.from(fileBuffer));
      console.log(`📝 Temporary PDF written to: ${tempPdfPath}`);

      const baseName = file.name.split('.')[0];

      // Use Poppler's pdftoppm to extract pages as PPM, then convert to JPEG with Sharp
      const outputPrefix = path.join(tempOutputDir, 'page');
      
      // pdftoppm command: extract all pages as PPM format
      // -r 200: 200 DPI resolution for good quality
      // -jpeg: direct JPEG output (if supported)
      // -jpegopt quality=90: JPEG quality
      let popplerCommand: string;
      
      // Try direct JPEG output first (if pdftoppm supports it)
      try {
        popplerCommand = `pdftoppm -jpeg -jpegopt quality=90 -r 200 "${tempPdfPath}" "${outputPrefix}"`;
        console.log(`🔧 Running Poppler command: ${popplerCommand}`);
        
        const { stdout, stderr } = await execAsync(popplerCommand);
        
        if (stderr && !stderr.includes('Warning')) {
          console.warn('Poppler stderr:', stderr);
        }
        if (stdout) {
          console.log('Poppler stdout:', stdout);
        }
        
      } catch (jpegError) {
        // Fallback to PPM output if direct JPEG is not supported
        console.log('📝 Direct JPEG not supported, falling back to PPM + Sharp conversion...');
        popplerCommand = `pdftoppm -r 200 "${tempPdfPath}" "${outputPrefix}"`;
        console.log(`🔧 Running Poppler fallback command: ${popplerCommand}`);
        
        const { stdout, stderr } = await execAsync(popplerCommand);
        
        if (stderr && !stderr.includes('Warning')) {
          console.warn('Poppler stderr:', stderr);
        }
        if (stdout) {
          console.log('Poppler stdout:', stdout);
        }
      }

      // Read the generated files
      const outputFiles = await fs.promises.readdir(tempOutputDir);
      const imageFiles = outputFiles
        .filter(file => file.startsWith('page') && (file.endsWith('.jpg') || file.endsWith('.ppm')))
        .sort((a, b) => {
          // Extract page numbers for proper sorting
          const aNum = parseInt(a.match(/page-?(\d+)/)?.[1] || '0');
          const bNum = parseInt(b.match(/page-?(\d+)/)?.[1] || '0');
          return aNum - bNum;
        });

      if (imageFiles.length === 0) {
        throw new Error('No image files were generated by Poppler');
      }

      console.log(`📊 Generated ${imageFiles.length} image file(s): ${imageFiles.join(', ')}`);

      // Process images through Sharp to guarantee valid JPEG output
      const processedImages: { fileName: string; buffer: Buffer }[] = [];

      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        const imagePath = path.join(tempOutputDir, imageFile);
        
        try {
          console.log(`🖼️ Processing ${imageFile} through Sharp...`);
          
          // Read and process through Sharp to guarantee valid JPEG
          const processedBuffer = await sharp(imagePath)
            .jpeg({
              quality: 90,
              progressive: true,
              mozjpeg: true // Use mozjpeg for better compression
            })
            .toBuffer();

          const outputFileName = `${baseName}_page_${i + 1}.jpg`;
          processedImages.push({
            fileName: outputFileName,
            buffer: processedBuffer
          });
          
          console.log(`✅ Processed ${imageFile} → ${outputFileName} (${processedBuffer.length} bytes)`);
          
        } catch (sharpError) {
          console.error(`❌ Failed to process ${imageFile} through Sharp:`, sharpError);
          // Continue with other images
        }
      }

      if (processedImages.length === 0) {
        throw new Error('No images were successfully processed through Sharp');
      }

      // If only one page, return the single image directly
      if (processedImages.length === 1) {
        console.log('📄 Single page PDF - returning single JPEG');
        const singleImage = processedImages[0];
        console.log(`✅ Single page PDF to JPG conversion successful: ${singleImage.buffer.length} bytes`);
        return new Uint8Array(singleImage.buffer);
      }

      // Multiple pages - create ZIP file
      console.log('📚 Multiple pages PDF - creating ZIP archive');
      const zip = new JSZip();

      // Add all processed images to ZIP
      for (const image of processedImages) {
        zip.file(image.fileName, image.buffer);
        console.log(`📎 Added ${image.fileName} to ZIP (${image.buffer.length} bytes)`);
      }

      // Generate ZIP file
      console.log('🗜️ Creating ZIP archive...');
      const zipBytes = await zip.generateAsync({ 
        type: 'uint8array',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      console.log(`✅ Multi-page PDF to JPG conversion successful: ${zipBytes.length} bytes, ${processedImages.length}/${pageCount} pages converted`);
      return zipBytes;

    } catch (error) {
      console.error('❌ PDF to JPG conversion failed:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('pdftoppm')) {
          throw new Error('Poppler utilities not found. Please install poppler-utils: PDF to image conversion requires Poppler to be installed on the system.');
        }
      }
      
      throw new Error(`Failed to convert PDF to JPG: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
    } finally {
      // Clean up temporary files
      const cleanupPromises: Promise<void>[] = [];
      
      if (tempPdfPath) {
        cleanupPromises.push(
          fs.promises.unlink(tempPdfPath).catch(err => 
            console.warn('Failed to cleanup temporary PDF file:', err)
          )
        );
      }
      
      if (tempOutputDir) {
        cleanupPromises.push(
          fs.promises.rmdir(tempOutputDir, { recursive: true }).catch(err => 
            console.warn('Failed to cleanup temporary output directory:', err)
          )
        );
      }
      
      await Promise.allSettled(cleanupPromises);
      console.log('🗑️ Cleanup completed');
    }
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
  static async pdfToWord(file: File): Promise<Uint8Array> {
    throw new Error('PDF to Word conversion should be handled by the Express backend. This method is deprecated.');
  }
}
