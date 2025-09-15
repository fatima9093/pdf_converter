import { NextResponse } from 'next/server';
import { TestPdfGenerator } from '@/lib/testPdfGenerator';

export async function GET() {
  try {
    const testPdfBytes = await TestPdfGenerator.createTestPDF();
    
    return new NextResponse(testPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="test-document.pdf"',
      },
    });
  } catch (error) {
    console.error('Error creating test PDF:', error);
    return NextResponse.json(
      { error: 'Failed to create test PDF' },
      { status: 500 }
    );
  }
}
