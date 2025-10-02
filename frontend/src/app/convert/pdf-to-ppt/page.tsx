'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, Presentation } from 'lucide-react';

export default function PDFToPowerPointPage() {
  const tool = getToolById('pdf-to-powerpoint');

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
          <div className="inline-flex items-center justify-center w-18 h-18 bg-orange-100 rounded-2xl mb-5 mt-2">
            <Presentation className="w-7 h-7 text-orange-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">PDF to PowerPoint</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert PDF files to editable PowerPoint presentations
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
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF file</h3>
                <p className="text-gray-600">Select the PDF you want to convert to PowerPoint</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Smart conversion</h3>
                <p className="text-gray-600">Extract content and convert to editable slides</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download PPTX</h3>
                <p className="text-gray-600">Get your editable PowerPoint presentation</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Presentation className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Slide-by-slide conversion</h3>
              <p className="text-gray-600">Each PDF page becomes an editable PowerPoint slide with preserved layout.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Editable content</h3>
              <p className="text-gray-600">Text and images become fully editable PowerPoint elements you can modify.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Professional quality</h3>
              <p className="text-gray-600">Maintains professional appearance suitable for business presentations.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">PPTX format</h3>
              <p className="text-gray-600">Output files work with PowerPoint, Google Slides, and other presentation software.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure processing</h3>
              <p className="text-gray-600">Your files are processed securely and automatically deleted after conversion.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy editing</h3>
              <p className="text-gray-600">Add animations, transitions, and speaker notes to your converted presentation.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to convert PDF to PowerPoint?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload the PDF file you want to convert.</li>
                  <li>Our conversion engine will process each page as a slide.</li>
                  <li>Download the converted PowerPoint file (PPTX format).</li>
                  <li>Open in PowerPoint to edit, add animations, and present.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Will I be able to edit the content?</h3>
                <p className="text-gray-600">Yes! The converted PowerPoint file contains editable text and images that you can modify, format, and enhance with PowerPoint features.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What types of PDFs work best?</h3>
                <p className="text-gray-600">PDFs with clear text and images work best. Presentation-style PDFs with slides or pages designed for viewing convert most effectively.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
