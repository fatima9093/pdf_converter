'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, FileText } from 'lucide-react';

export default function PDFToWordPage() {
  const tool = getToolById('pdf-to-word');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div>
        <div className="max-w-6xl mx-auto px-4 pt-8 pb-10 text-center relative">
          {/* Back to Tools Button (top left of hero section, not navbar) */}
          <div className="absolute left-0 top-0 pt-3">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tools
            </Link>
          </div>
          <div className="inline-flex items-center justify-center w-18 h-18 bg-blue-100 rounded-2xl mb-5 mt-2">
            <FileText className="w-7 h-7 text-blue-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">PDF to Word</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert PDF files to editable Word documents with preserved formatting
          </p>
          <div className="flex items-center justify-center space-x-6 mt-5 text-sm text-gray-500">
            <span className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
              Free
            </span>
            <span className="flex items-center">
              <Globe className="w-4 h-4 mr-1 text-blue-500" />
              Online
            </span>
            <span className="flex items-center">
              <Zap className="w-4 h-4 mr-1 text-yellow-500" />
              High quality
            </span>
          </div>
        </div>
      </div>

      {/* FileUploadModal component */}
      <div className="w-full p-8">
        <FileUploadModal 
          tool={tool} 
          isOpen={true} 
          onClose={() => {}} 
          asPage={true}
        />
      </div>
      
      {/* Information Section */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          {/* How it works */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF file</h3>
                <p className="text-gray-600">Select the PDF file you want to convert to Word</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Advanced conversion</h3>
                <p className="text-gray-600">Our OCR technology extracts text and preserves formatting</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download Word document</h3>
                <p className="text-gray-600">Get your editable DOCX file ready for editing</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Preserve formatting</h3>
              <p className="text-gray-600">Maintains original layout, fonts, and styling as much as possible during conversion.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">OCR technology</h3>
              <p className="text-gray-600">Advanced optical character recognition for accurate text extraction from scanned PDFs.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Editable output</h3>
              <p className="text-gray-600">Generated Word documents are fully editable with selectable text and images.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">DOCX format</h3>
              <p className="text-gray-600">Output files are in modern DOCX format, compatible with Microsoft Word and other editors.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure conversion</h3>
              <p className="text-gray-600">Your files are processed securely and automatically deleted after conversion.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No software needed</h3>
              <p className="text-gray-600">Convert PDFs to Word online without installing any software on your device.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to convert PDF to Word?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload the PDF file you want to convert.</li>
                  <li>Our conversion engine will process your file using OCR technology.</li>
                  <li>Download the converted Word document (DOCX format).</li>
                  <li>Open in Microsoft Word or any compatible editor to edit.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Will the formatting be preserved?</h3>
                <p className="text-gray-600">We do our best to preserve the original formatting, including fonts, colors, and layout. However, complex layouts may require minor adjustments after conversion.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Can I convert scanned PDFs?</h3>
                <p className="text-gray-600">Yes! Our OCR technology can extract text from scanned PDFs and image-based documents, making them editable in Word.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
