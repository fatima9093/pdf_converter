import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'PDF file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== '.pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    try {
      // Load the PDF and get page count
      const fileBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(fileBuffer);
      const pageCount = pdf.getPageCount();

      return NextResponse.json({
        success: true,
        pageCount,
        fileName: file.name,
        fileSize: file.size,
      });
    } catch (error) {
      console.error('Error reading PDF:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid PDF file or file is corrupted' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('PDF info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process PDF file' },
      { status: 500 }
    );
  }
}
