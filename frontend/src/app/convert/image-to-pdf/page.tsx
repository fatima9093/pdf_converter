'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, Image } from 'lucide-react';

export default function ImageToPDFPage() {
  const tool = getToolById('jpg-to-pdf');

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
          <div className="inline-flex items-center justify-center w-18 h-18 bg-pink-100 rounded-2xl mb-5 mt-2">
            <Image className="w-7 h-7 text-pink-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">Image to PDF</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert JPG, PNG, and other images to PDF format for easy sharing
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
              Multiple formats
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
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-pink-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload images</h3>
                <p className="text-gray-600">Select one or multiple image files to convert</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-pink-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Arrange and optimize</h3>
                <p className="text-gray-600">Images are optimized and arranged in the PDF</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-pink-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download PDF</h3>
                <p className="text-gray-600">Get your PDF with all images perfectly formatted</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Image className="w-8 h-8 text-pink-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multiple formats</h3>
              <p className="text-gray-600">Supports JPG, PNG, GIF, BMP, TIFF, and other popular image formats.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Batch conversion</h3>
              <p className="text-gray-600">Convert multiple images at once into a single PDF document.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Quality preservation</h3>
              <p className="text-gray-600">Maintains original image quality while optimizing file size for sharing.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Custom layout</h3>
              <p className="text-gray-600">Images are automatically sized and positioned for optimal PDF layout.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure processing</h3>
              <p className="text-gray-600">Your images are processed securely and automatically deleted after conversion.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Universal compatibility</h3>
              <p className="text-gray-600">Generated PDFs work on all devices and can be viewed without special software.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to convert images to PDF?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload one or multiple image files (JPG, PNG, etc.).</li>
                  <li>Our system will optimize and arrange them in the PDF.</li>
                  <li>Download the converted PDF file.</li>
                  <li>Share or print your image collection as a PDF document.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What image formats are supported?</h3>
                <p className="text-gray-600">We support all major image formats including JPG, JPEG, PNG, GIF, BMP, TIFF, and WebP. Both single images and multiple images can be converted.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Will image quality be preserved?</h3>
                <p className="text-gray-600">Yes! We maintain the original image quality while optimizing the PDF file size for efficient sharing and storage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
