'use client';

import { getToolById } from '@/lib/tools';
import CompressPDFModal from '@/components/CompressPDFModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, Minimize2 } from 'lucide-react';

export default function CompressPDFPage() {
  const tool = getToolById('compress-pdf');

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
          <div className="inline-flex items-center justify-center w-18 h-18 bg-purple-100 rounded-2xl mb-5 mt-2">
            <Minimize2 className="w-7 h-7 text-purple-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">Compress PDF</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Reduce PDF file size while preserving all content and quality
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
              No limits
            </span>
          </div>
        </div>
      </div>

      {/* CompressPDFModal component */}
      <div className="w-full p-8">
        <CompressPDFModal 
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
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF file</h3>
                <p className="text-gray-600">Select the PDF file you want to compress</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Advanced compression</h3>
                <p className="text-gray-600">Our algorithms apply multiple optimization strategies</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download optimized PDF</h3>
                <p className="text-gray-600">Get your compressed PDF with significant size reduction</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Lossless compression</h3>
              <p className="text-gray-600">Preserves all text, images, and layout while removing unnecessary metadata and optimizing structure.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Advanced algorithms</h3>
              <p className="text-gray-600">Multiple compression strategies including object stream compression and font optimization.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Content protection</h3>
              <p className="text-gray-600">All text, images, and formatting remain exactly the same - only file size is reduced.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Significant savings</h3>
              <p className="text-gray-600">Achieve up to 70% file size reduction depending on your PDF&apos;s content and structure.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure processing</h3>
              <p className="text-gray-600">Your files are processed securely and automatically deleted from our servers after processing.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Universal compatibility</h3>
              <p className="text-gray-600">Compressed PDFs work with all PDF readers and maintain full compatibility across devices.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to compress PDF files?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload the PDF file you want to compress.</li>
                  <li>Our advanced compression algorithms will automatically optimize your file.</li>
                  <li>Review the compression results showing original vs. compressed size.</li>
                  <li>Download your optimized PDF file with reduced size.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Will compression affect PDF quality?</h3>
                <p className="text-gray-600">No, our lossless compression preserves all content, text, images, and formatting. Only unnecessary data and metadata are removed to reduce file size.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How much can I compress my PDF?</h3>
                <p className="text-gray-600">Compression results vary depending on your PDF&apos;s content. Text-heavy documents can achieve 50-70% size reduction, while image-heavy PDFs may see 20-40% reduction.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
