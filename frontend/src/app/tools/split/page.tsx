'use client';

import { getToolById } from '@/lib/tools';
import SplitPDFModal from '@/components/SplitPDFModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, Scissors } from 'lucide-react';

export default function SplitPDFPage() {
  const tool = getToolById('split-pdf');

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
          <div className="inline-flex items-center justify-center w-18 h-18 bg-green-100 rounded-2xl mb-5 mt-2">
            <Scissors className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">Split PDF</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Split a PDF file into multiple documents or extract specific pages
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

      {/* SplitPDFModal component */}
      <div className="w-full p-8">
        <SplitPDFModal 
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
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF file</h3>
                <p className="text-gray-600">Select the PDF file you want to split</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Choose split method</h3>
                <p className="text-gray-600">Split into individual pages or custom page ranges</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Configure ranges</h3>
                <p className="text-gray-600">Set page ranges and file names if using custom split</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download files</h3>
                <p className="text-gray-600">Get your split PDF files as a ZIP archive</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No quality loss</h3>
              <p className="text-gray-600">Splitting PDF files preserves the original quality and formatting of each page.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Scissors className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Flexible splitting</h3>
              <p className="text-gray-600">Split into individual pages or create custom page ranges with specific file names.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy to use</h3>
              <p className="text-gray-600">Simple interface with drag-and-drop support. No technical knowledge required.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Batch download</h3>
              <p className="text-gray-600">All split files are packaged into a convenient ZIP file for easy download.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure processing</h3>
              <p className="text-gray-600">Your files are processed securely and automatically deleted after one hour.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Works everywhere</h3>
              <p className="text-gray-600">Compatible with all modern browsers and operating systems. No software installation needed.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to split PDF files?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload the PDF file you want to split.</li>
                  <li>Choose between splitting into individual pages or custom page ranges.</li>
                  <li>If using custom ranges, define your page ranges and file names.</li>
                  <li>Click the split button and download your files as a ZIP archive.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the difference between individual pages and custom ranges?</h3>
                <p className="text-gray-600">Individual pages creates one file per page (Page1.pdf, Page2.pdf, etc.). Custom ranges lets you define specific page ranges (e.g., pages 1-5, 6-10) with custom file names.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Is there a limit on PDF size or pages?</h3>
                <p className="text-gray-600">You can split PDF files up to 50MB in size. There&apos;s no specific limit on the number of pages, but very large files may take longer to process.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
