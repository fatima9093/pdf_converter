'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, Table } from 'lucide-react';

export default function ExcelToPDFPage() {
  const tool = getToolById('excel-to-pdf');

  if (!tool) {
    return <div>Tool not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to Tools Button */}
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
            <Table className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">Excel to PDF</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert Excel spreadsheets to PDF format for easy sharing and printing
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
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Upload Excel file</h3>
                <p className="text-gray-600">Select your XLSX or XLS spreadsheet for conversion</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Perfect conversion</h3>
                <p className="text-gray-600">Preserve all formatting, charts, and data layout</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download PDF</h3>
                <p className="text-gray-600">Get your professional PDF ready for sharing</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Table className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Perfect table formatting</h3>
              <p className="text-gray-600">Preserves all table structures, borders, colors, and cell formatting exactly as designed.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Charts and graphs</h3>
              <p className="text-gray-600">Maintains all charts, graphs, and visual elements with high-quality rendering.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multiple sheets</h3>
              <p className="text-gray-600">Converts all worksheets into a single PDF with proper page breaks and organization.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibent text-gray-900 mb-2">Print-ready quality</h3>
              <p className="text-gray-600">Generated PDFs are optimized for printing with proper scaling and page layouts.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure processing</h3>
              <p className="text-gray-600">Your spreadsheets are processed securely and automatically deleted after conversion.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Universal sharing</h3>
              <p className="text-gray-600">PDFs can be viewed by anyone without needing Excel or special software.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to convert Excel to PDF?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload your Excel file (XLSX or XLS format).</li>
                  <li>Our conversion engine will process all worksheets and formatting.</li>
                  <li>Download the converted PDF file.</li>
                  <li>Share or print your professional PDF document.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Will charts and formatting be preserved?</h3>
                <p className="text-gray-600">Yes! All charts, graphs, cell formatting, colors, borders, and visual elements are preserved in the PDF conversion.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How are multiple sheets handled?</h3>
                <p className="text-gray-600">All worksheets in your Excel file are converted and included in the PDF, with each sheet starting on a new page for clear organization.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
