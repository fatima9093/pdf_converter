'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, Image } from 'lucide-react';

export default function PDFToImagePage() {
  const tool = getToolById('pdf-to-jpg');

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
          <div className="inline-flex items-center justify-center w-18 h-18 bg-cyan-100 rounded-2xl mb-5 mt-2">
            <Image className="w-7 h-7 text-cyan-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">PDF to Image</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert PDF pages to high-quality JPG, PNG, or other image formats
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
              High resolution
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
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-cyan-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF file</h3>
                <p className="text-gray-600">Select the PDF you want to convert to images</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-cyan-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">High-quality rendering</h3>
                <p className="text-gray-600">Each page is rendered as a high-resolution image</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-cyan-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download images</h3>
                <p className="text-gray-600">Get all pages as individual image files in a ZIP</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Image className="w-8 h-8 text-cyan-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multiple formats</h3>
              <p className="text-gray-600">Convert to JPG, PNG, GIF, BMP, or TIFF formats based on your needs.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">High resolution</h3>
              <p className="text-gray-600">Generate high-quality images suitable for printing and professional use.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Page-by-page conversion</h3>
              <p className="text-gray-600">Each PDF page becomes a separate image file for easy use and sharing.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Batch download</h3>
              <p className="text-gray-600">All converted images are packaged in a convenient ZIP file for download.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Quality preservation</h3>
              <p className="text-gray-600">Maintains all visual elements, colors, and details from the original PDF.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Universal compatibility</h3>
              <p className="text-gray-600">Generated images work with all image viewers, editors, and web browsers.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to convert PDF to images?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload the PDF file you want to convert.</li>
                  <li>Our system will render each page as a high-quality image.</li>
                  <li>Download the ZIP file containing all converted images.</li>
                  <li>Extract and use the individual image files as needed.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What image formats are available?</h3>
                <p className="text-gray-600">We support JPG (best for photos), PNG (best for graphics with transparency), GIF, BMP, and TIFF formats to suit different use cases.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What resolution are the images?</h3>
                <p className="text-gray-600">Images are generated at high resolution (typically 300 DPI) to ensure quality suitable for both digital use and printing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
