'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, FileText } from 'lucide-react';

export default function WordToPDFPage() {
  const tool = getToolById('word-to-pdf');

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
          <div className="inline-flex items-center justify-center w-18 h-18 bg-red-100 rounded-2xl mb-5 mt-2">
            <FileText className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">Word to PDF</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert Word documents to PDF format with perfect formatting preservation
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
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload Word document</h3>
                <p className="text-gray-600">Select your DOCX or DOC file for conversion</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Perfect conversion</h3>
                <p className="text-gray-600">Preserve all formatting, images, and layout elements</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download PDF</h3>
                <p className="text-gray-600">Get your professional PDF ready for sharing</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Perfect formatting</h3>
              <p className="text-gray-600">Preserves all fonts, colors, images, tables, and layout exactly as in your Word document.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Fast conversion</h3>
              <p className="text-gray-600">Convert Word documents to PDF in seconds with our optimized conversion engine.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Universal compatibility</h3>
              <p className="text-gray-600">Generated PDFs work on all devices and can be opened by anyone without special software.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Professional quality</h3>
              <p className="text-gray-600">Create high-quality PDFs suitable for printing, sharing, and professional use.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure processing</h3>
              <p className="text-gray-600">Your documents are processed securely and automatically deleted after conversion.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multiple formats</h3>
              <p className="text-gray-600">Supports both DOCX and DOC formats from all versions of Microsoft Word.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to convert Word to PDF?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload your Word document (DOCX or DOC format).</li>
                  <li>Our conversion engine will process your file while preserving all formatting.</li>
                  <li>Download the converted PDF file.</li>
                  <li>Share or print your professional PDF document.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Will my formatting be preserved?</h3>
                <p className="text-gray-600">Yes! Our converter maintains all formatting including fonts, colors, images, tables, headers, footers, and page layouts exactly as they appear in Word.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibent text-gray-900 mb-2">What Word formats are supported?</h3>
                <p className="text-gray-600">We support both modern DOCX files and legacy DOC files from all versions of Microsoft Word, as well as documents from other word processors.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
