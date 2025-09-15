import { NextRequest, NextResponse } from 'next/server';
import { getToolById } from '@/lib/tools';
import { PDFService } from '@/lib/pdfService';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const toolId = formData.get('toolId') as string;
    const fileCount = parseInt(formData.get('fileCount') as string || '1');

    if (!toolId) {
      return NextResponse.json(
        { success: false, error: 'Tool ID is required' },
        { status: 400 }
      );
    }

    const tool = getToolById(toolId);
    if (!tool) {
      return NextResponse.json(
        { success: false, error: 'Invalid tool ID' },
        { status: 400 }
      );
    }

    // Handle multiple files for merge operation
    if (tool.allowMultipleFiles && fileCount > 1) {
      const files: File[] = [];
      
      for (let i = 0; i < fileCount; i++) {
        const file = formData.get(`file_${i}`) as File;
        if (file) {
          // Validate file type
          const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
          if (!tool.acceptedFileTypes.includes(fileExtension)) {
            return NextResponse.json(
              { 
                success: false, 
                error: `File ${file.name}: Only ${tool.acceptedFileTypes.join(', ')} files are supported for this tool.` 
              },
              { status: 400 }
            );
          }
          files.push(file);
        }
      }

      if (files.length < 2) {
        return NextResponse.json(
          { success: false, error: 'At least 2 files are required for merging' },
          { status: 400 }
        );
      }

      console.log(`Merging ${files.length} files with ${tool.name}:`, files.map(f => f.name));
      
      // Actually merge the PDFs using pdf-lib
      const mergedPdfBytes = await PDFService.mergePDFs(files);
      
      return new NextResponse(mergedPdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="merged_${files.length}_files.${tool.outputFormat}"`,
        },
      });
    } else {
      // Handle single file conversion
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { success: false, error: 'File is required' },
          { status: 400 }
        );
      }

      // Validate file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!tool.acceptedFileTypes.includes(fileExtension)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Only ${tool.acceptedFileTypes.join(', ')} files are supported for this tool.` 
          },
          { status: 400 }
        );
      }

      console.log(`Processing ${file.name} with ${tool.name}`);
      
      let processedBytes: Uint8Array;
      
      // Handle different tool types
      switch (tool.id) {
        case 'split-pdf':
          const splitMode = formData.get('splitMode') as string || 'individual';
          
          if (splitMode === 'ranges') {
            const pageRangesStr = formData.get('pageRanges') as string;
            if (!pageRangesStr) {
              return NextResponse.json(
                { success: false, error: 'Page ranges are required for custom split' },
                { status: 400 }
              );
            }
            
            const pageRanges = JSON.parse(pageRangesStr);
            processedBytes = await PDFService.splitPDFByRanges(file, pageRanges);
          } else {
            // Split into individual pages
            processedBytes = await PDFService.splitPDFByPages(file);
          }
          
          // Return as ZIP file
          return new NextResponse(processedBytes, {
            headers: {
              'Content-Type': 'application/zip',
              'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}_split.zip"`,
            },
          });
          break;
          
        case 'compress-pdf':
          console.log(`🗜️ Lossless compression: ${file.name} (preserving all content)`);
          console.log(`📏 Original file size: ${file.size} bytes`);
          
          processedBytes = await PDFService.compressPDF(file);
          
          const compressionRatio = ((file.size - processedBytes.length) / file.size * 100).toFixed(1);
          const spacesSaved = file.size - processedBytes.length;
          console.log(`✅ Optimized file size: ${processedBytes.length} bytes`);
          console.log(`📉 Size reduction: ${compressionRatio}%`);
          console.log(`💾 Space saved: ${spacesSaved} bytes`);
          break;
          
        case 'jpg-to-pdf':
          processedBytes = await PDFService.imageToPDF(file);
          break;
          
        case 'word-to-pdf':
          console.log(`📄 Converting Word document: ${file.name} (${file.size} bytes)`);
          try {
            processedBytes = await PDFService.wordToPDF(file);
            console.log(`✅ Word to PDF conversion complete: ${processedBytes.length} bytes`);
          } catch (wordError) {
            console.error('❌ Word to PDF conversion failed:', wordError);
            return NextResponse.json(
              { 
                success: false, 
                error: `Word to PDF conversion failed: ${wordError instanceof Error ? wordError.message : 'Unknown error'}` 
              },
              { status: 400 }
            );
          }
          break;
          
        case 'html-to-pdf':
          console.log(`🌐 Converting HTML file: ${file.name} (${file.size} bytes)`);
          try {
            processedBytes = await PDFService.htmlToPDF(file);
            console.log(`✅ HTML to PDF conversion complete: ${processedBytes.length} bytes`);
          } catch (htmlError) {
            console.error('❌ HTML to PDF conversion failed:', htmlError);
            return NextResponse.json(
              { 
                success: false, 
                error: `HTML to PDF conversion failed: ${htmlError instanceof Error ? htmlError.message : 'Unknown error'}` 
              },
              { status: 400 }
            );
          }
          break;
          
        case 'pdf-to-jpg':
          console.log(`🖼️ Converting PDF to JPG: ${file.name} (${file.size} bytes)`);
          try {
            // First, check how many pages the PDF has to determine return type
            const fileBuffer = await file.arrayBuffer();
            const { PDFDocument: TempPDFDocument } = await import('pdf-lib');
            const tempPdf = await TempPDFDocument.load(fileBuffer);
            const pageCount = tempPdf.getPageCount();
            
            processedBytes = await PDFService.pdfToJPG(file);
            console.log(`✅ PDF to JPG conversion complete: ${processedBytes.length} bytes`);
            
            // Single page: return JPG image directly
            if (pageCount === 1) {
              return new NextResponse(processedBytes, {
                headers: {
                  'Content-Type': 'image/jpeg',
                  'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}.jpg"`,
                },
              });
            } else {
              // Multiple pages: return ZIP file
              return new NextResponse(processedBytes, {
                headers: {
                  'Content-Type': 'application/zip',
                  'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}_images.zip"`,
                },
              });
            }
          } catch (pdfToJpgError) {
            console.error('❌ PDF to JPG conversion failed:', pdfToJpgError);
            return NextResponse.json(
              { 
                success: false, 
                error: `PDF to JPG conversion failed: ${pdfToJpgError instanceof Error ? pdfToJpgError.message : 'Unknown error'}` 
              },
              { status: 400 }
            );
          }
          break;
          
        case 'pdf-to-word':
          console.log(`📄 Converting PDF to Word: ${file.name} (${file.size} bytes)`);
          try {
            processedBytes = await PDFService.pdfToWord(file);
            console.log(`✅ PDF to Word conversion complete: ${processedBytes.length} bytes`);
            
            // Return as Word document
            return new NextResponse(processedBytes, {
              headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}.docx"`,
              },
            });
          } catch (pdfToWordError) {
            console.error('❌ PDF to Word conversion failed:', pdfToWordError);
            return NextResponse.json(
              { 
                success: false, 
                error: `PDF to Word conversion failed: ${pdfToWordError instanceof Error ? pdfToWordError.message : 'Unknown error'}` 
              },
              { status: 400 }
            );
          }
          break;
          
        case 'powerpoint-to-pdf':
          // PowerPoint conversion not yet implemented
          return NextResponse.json(
            { success: false, error: `${tool.name} conversion is not yet implemented. Coming soon!` },
            { status: 501 }
          );
          
        default:
          // Fallback: return original file
          const buffer = await file.arrayBuffer();
          processedBytes = new Uint8Array(buffer);
      }
      
      return new NextResponse(processedBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="converted_${file.name.split('.')[0]}.${tool.outputFormat}"`,
        },
      });
    }
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { success: false, error: 'File conversion failed' },
      { status: 500 }
    );
  }
}
