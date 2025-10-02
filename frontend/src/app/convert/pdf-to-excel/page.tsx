'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, Table } from 'lucide-react';

export default function PDFToExcelPage() {
  const tool = getToolById('pdf-to-excel');

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
            <Table className="w-7 h-7 text-green-600" />
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">PDF to Excel</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert PDF tables and data to Excel spreadsheets for easy editing
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
              Table detection
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
                <h3 className="font-semibold text-gray-900 mb-2">Upload PDF file</h3>
                <p className="text-gray-600">Select the PDF containing tables or data you want to convert</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Table detection</h3>
                <p className="text-gray-600">Our AI identifies and extracts tables and structured data</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download Excel file</h3>
                <p className="text-gray-600">Get your data in XLSX format ready for analysis</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Table className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Smart table detection</h3>
              <p className="text-gray-600">Automatically identifies and extracts tables from PDF documents with high accuracy.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Preserve structure</h3>
              <p className="text-gray-600">Maintains original table structure, including rows, columns, and cell formatting.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Editable spreadsheet</h3>
              <p className="text-gray-600">Generated Excel files are fully editable with formulas, sorting, and filtering capabilities.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">XLSX format</h3>
              <p className="text-gray-600">Output files are in modern XLSX format, compatible with Excel, Google Sheets, and more.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Data accuracy</h3>
              <p className="text-gray-600">Advanced algorithms ensure accurate data extraction and minimal formatting errors.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multiple tables</h3>
              <p className="text-gray-600">Handles PDFs with multiple tables, creating separate sheets for each table found.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to convert PDF to Excel?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload the PDF file containing tables or data.</li>
                  <li>Our AI will automatically detect and extract tables.</li>
                  <li>Download the converted Excel file (XLSX format).</li>
                  <li>Open in Excel or Google Sheets to edit and analyze your data.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What types of PDFs work best?</h3>
                <p className="text-gray-600">PDFs with clear table structures work best. Financial reports, data sheets, and structured documents typically convert with high accuracy.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Can I convert multiple tables?</h3>
                <p className="text-gray-600">Yes! If your PDF contains multiple tables, each will be converted to a separate sheet in the Excel file for easy organization.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
