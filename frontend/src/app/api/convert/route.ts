import { NextRequest, NextResponse } from 'next/server';
import { getToolById } from '@/lib/tools';
import { PDFService } from '@/lib/pdfService';
import { getUserIdFromRequest } from '@/lib/api';

// Direct backend tracking function
async function trackConversion(params: {
  toolType: string;
  originalFileName: string;
  convertedFileName?: string;
  fileSize: number;
  userId?: string;
  status?: 'COMPLETED' | 'FAILED';
  request?: NextRequest; // Original request to forward cookies
}): Promise<void> {
  try {
    // Use NEXT_PUBLIC_API_URL which is properly configured for production
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://localhost:3002';
    
    // Get cookies from original request to forward to backend
    const cookieHeader = params.request?.headers.get('cookie');
    
    console.log(`🔄 Tracking conversion to: ${backendUrl}/api/track-conversion`, {
      toolType: params.toolType,
      userId: params.userId,
      hasCookies: !!cookieHeader,
      status: params.status || 'COMPLETED'
    });
    
    const response = await fetch(`${backendUrl}/api/track-conversion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader ? { 'Cookie': cookieHeader } : {}) // Forward cookies for authentication
      },
      body: JSON.stringify({
        toolType: params.toolType,
        originalFileName: params.originalFileName,
        convertedFileName: params.convertedFileName,
        fileSize: params.fileSize,
        userId: params.userId,
        status: params.status || 'COMPLETED',
        processingLocation: 'FRONTEND'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Conversion tracked successfully:', result);
    } else {
      const errorText = await response.text();
      console.warn(`⚠️ Tracking failed: ${response.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('⚠️ Failed to track conversion:', error);
  }
}

export async function POST(request: NextRequest) {
  let formData: FormData | undefined;
  let toolId: string | undefined;
  let fileCount: number;
  let userId: string | undefined;

  try {
    formData = await request.formData();
    toolId = formData.get('toolId') as string;
    fileCount = parseInt(formData.get('fileCount') as string || '1');

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

    // Get user ID for tracking
    userId = await getUserIdFromRequest(request);
    console.log('🔍 User ID extracted for tracking:', userId);

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
      
      // Track the conversion
      console.log('🔄 Tracking merge conversion...', {
        toolType: tool.id,
        originalFileName: `merged_${files.length}_files`,
        convertedFileName: `merged_${files.length}_files.pdf`,
        fileSize: files.reduce((total, file) => total + file.size, 0),
        userId      });
      await trackConversion({
        toolType: tool.id,
        originalFileName: `merged_${files.length}_files`,
        convertedFileName: `merged_${files.length}_files.pdf`,
        fileSize: files.reduce((total, file) => total + file.size, 0),
        userId,
        request      });
      
      return new NextResponse(Buffer.from(mergedPdfBytes), {
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
          
          try {
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
              console.log(`📄 API: Starting split operation for ${file.name}`);
              processedBytes = await PDFService.splitPDFByPages(file);
              console.log(`📄 API: Split operation completed successfully`);
            }
          } catch (splitError) {
            console.error('❌ API: Split PDF error:', splitError);
            const errorMessage = splitError instanceof Error ? splitError.message : 'Failed to split PDF';
            return NextResponse.json(
              { success: false, error: errorMessage },
              { status: 400 }
            );
          }
          
          // Track the conversion
          await trackConversion({
            toolType: tool.id,
            originalFileName: file.name,
            convertedFileName: `${file.name.split('.')[0]}_split.zip`,
            fileSize: file.size,
            userId, // Use actual user ID if authenticated
            request
          });
          
          // Return as ZIP file
          return new NextResponse(Buffer.from(processedBytes), {
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
          
          // Track the compression conversion
          await trackConversion({
            toolType: tool.id,
            originalFileName: file.name,
            convertedFileName: `compressed_${file.name}`,
            fileSize: file.size,
            userId,
            request
          });
          break;
          
        case 'jpg-to-pdf':
          processedBytes = await PDFService.imageToPDF(file);
          
          // Track the conversion
          await trackConversion({
            toolType: tool.id,
            originalFileName: file.name,
            convertedFileName: `${file.name.split('.')[0]}.pdf`,
            fileSize: file.size,
            userId,
            request
          });
          break;
          
        case 'word-to-pdf':
          console.log(`📄 Converting Word document: ${file.name} (${file.size} bytes)`);
          try {
            processedBytes = await PDFService.wordToPDF();
            console.log(`✅ Word to PDF conversion complete: ${processedBytes.length} bytes`);
            
            // Track the conversion
            await trackConversion({
              toolType: tool.id,
              originalFileName: file.name,
              convertedFileName: `${file.name.split('.')[0]}.pdf`,
              fileSize: file.size,
              userId,
              request
            });
          } catch (wordError) {
            console.error('❌ Word to PDF conversion failed:', wordError);
            
            // Track failed conversion
            await trackConversion({
              toolType: tool.id,
              originalFileName: file.name,
              fileSize: file.size,
              userId,
              status: 'FAILED',
              request
            });
            
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
            processedBytes = await PDFService.htmlToPDF();
            console.log(`✅ HTML to PDF conversion complete: ${processedBytes.length} bytes`);
            
            // Track the conversion
            await trackConversion({
              toolType: tool.id,
              originalFileName: file.name,
              convertedFileName: `${file.name.split('.')[0]}.pdf`,
              fileSize: file.size,
              userId,
              request
            });
          } catch (htmlError) {
            console.error('❌ HTML to PDF conversion failed:', htmlError);
            
            // Track failed conversion
            await trackConversion({
              toolType: tool.id,
              originalFileName: file.name,
              fileSize: file.size,
              userId,
              status: 'FAILED',
              request
            });
            
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
            
            processedBytes = await PDFService.pdfToJPG();
            console.log(`✅ PDF to JPG conversion complete: ${processedBytes.length} bytes`);
            
            // Track the conversion
            const outputFileName = pageCount === 1 
              ? `${file.name.split('.')[0]}.jpg`
              : `${file.name.split('.')[0]}_images.zip`;
            
            await trackConversion({
              toolType: tool.id,
              originalFileName: file.name,
              convertedFileName: outputFileName,
              fileSize: file.size,
              userId,
              request
            });
            
            // Single page: return JPG image directly
            if (pageCount === 1) {
              return new NextResponse(Buffer.from(processedBytes), {
                headers: {
                  'Content-Type': 'image/jpeg',
                  'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}.jpg"`,
                },
              });
            } else {
              // Multiple pages: return ZIP file
              return new NextResponse(Buffer.from(processedBytes), {
                headers: {
                  'Content-Type': 'application/zip',
                  'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}_images.zip"`,
                },
              });
            }
          } catch (pdfToJpgError) {
            console.error('❌ PDF to JPG conversion failed:', pdfToJpgError);
            
            // Track failed conversion
            await trackConversion({
              toolType: tool.id,
              originalFileName: file.name,
              fileSize: file.size,
              userId,
              status: 'FAILED',
              request
            });
            
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
            processedBytes = await PDFService.pdfToWord();
            console.log(`✅ PDF to Word conversion complete: ${processedBytes.length} bytes`);
            
            // Track the conversion
            await trackConversion({
              toolType: tool.id,
              originalFileName: file.name,
              convertedFileName: `${file.name.split('.')[0]}.docx`,
              fileSize: file.size,
              userId,
              request
            });
            
            // Return as Word document
            return new NextResponse(Buffer.from(processedBytes), {
              headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'Content-Disposition': `attachment; filename="${file.name.split('.')[0]}.docx"`,
              },
            });
          } catch (pdfToWordError) {
            console.error('❌ PDF to Word conversion failed:', pdfToWordError);
            
            // Track failed conversion
            await trackConversion({
              toolType: tool.id,
              originalFileName: file.name,
              fileSize: file.size,
              userId,
              status: 'FAILED',
              request
            });
            
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
      
      // Track the conversion for successful cases
      await trackConversion({
        toolType: tool.id,
        originalFileName: file.name,
        convertedFileName: `converted_${file.name.split('.')[0]}.${tool.outputFormat}`,
        fileSize: file.size,
        userId,
        request
      });
      
      return new NextResponse(Buffer.from(processedBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="converted_${file.name.split('.')[0]}.${tool.outputFormat}"`,
        },
      });
    }
  } catch (error) {
    console.error('Conversion error:', error);

    // Track failed conversion if we have the file info
    try {
      if (typeof toolId === 'string' && formData instanceof FormData) {
        const file = formData.get('file') as File;
        if (file && file instanceof File) {
          await trackConversion({
            toolType: toolId,
            originalFileName: file.name,
            fileSize: file.size,
            userId,
            status: 'FAILED',
            request
          });
        }
      }
    } catch (trackingError) {
      console.warn('Failed to track failed conversion:', trackingError);
    }

    return NextResponse.json(
      { success: false, error: 'File conversion failed' },
      { status: 500 }
    );
  }
}
