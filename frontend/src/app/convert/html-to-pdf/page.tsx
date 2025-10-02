'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, Code } from 'lucide-react';

export default function HTMLToPDFPage() {
  const tool = getToolById('html-to-pdf');

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
          <div className="inline-flex items-center justify-center w-18 h-18 bg-teal-100 rounded-2xl mb-5 mt-2">
            <Code className="w-7 h-7 text-teal-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">HTML to PDF</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert HTML files and web pages to PDF format with perfect rendering
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
              CSS support
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
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload HTML file</h3>
                <p className="text-gray-600">Select your HTML file or web page for conversion</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Render with CSS</h3>
                <p className="text-gray-600">Process HTML with full CSS styling and layout</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-teal-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download PDF</h3>
                <p className="text-gray-600">Get your web page as a professional PDF document</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Code className="w-8 h-8 text-teal-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Full HTML support</h3>
              <p className="text-gray-600">Supports modern HTML5, CSS3, and JavaScript for accurate web page rendering.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">CSS styling</h3>
              <p className="text-gray-600">Preserves all CSS styles, fonts, colors, and layout exactly as displayed in browsers.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Responsive design</h3>
              <p className="text-gray-600">Handles responsive layouts and media queries for optimal PDF formatting.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Web page archival</h3>
              <p className="text-gray-600">Perfect for archiving web pages, reports, and documentation in PDF format.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Image handling</h3>
              <p className="text-gray-600">Automatically includes and optimizes images, graphics, and media elements.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Print optimization</h3>
              <p className="text-gray-600">Optimizes layout for PDF viewing and printing with proper page breaks.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to convert HTML to PDF?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload your HTML file or provide a web page URL.</li>
                  <li>Our engine will render the HTML with full CSS styling.</li>
                  <li>Download the converted PDF file.</li>
                  <li>Share or archive your web content as a PDF document.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Are CSS styles preserved?</h3>
                <p className="text-gray-600">Yes! All CSS styles, fonts, colors, layouts, and responsive design elements are preserved in the PDF conversion.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Can I convert web pages from URLs?</h3>
                <p className="text-gray-600">Currently, we support HTML file uploads. For URL conversion, you can save the web page as an HTML file and upload it.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
