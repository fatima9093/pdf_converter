'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle } from 'lucide-react';

export default function MergePDFPage() {
  const tool = getToolById('merge-pdf');

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
            <span className="text-xl font-bold text-blue-600">M</span>
          </div>
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">Merge PDF</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Combine multiple PDF files into one document
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
                <h3 className="font-semibold text-gray-900 mb-2">Select files to merge</h3>
                <p className="text-gray-600">Choose multiple PDF files you want to combine</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Arrange file order</h3>
                <p className="text-gray-600">Drag and drop to set the order of files in your merged PDF</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download merged PDF</h3>
                <p className="text-gray-600">Get your combined PDF file ready for download</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No quality loss</h3>
              <p className="text-gray-600">Merging PDF files does not affect the quality of your documents. The content remains exactly the same.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Easy to use</h3>
              <p className="text-gray-600">Simply select your PDF files and merge them. No installation or setup required.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Supports your system</h3>
              <p className="text-gray-600">Works with all current operating systems and browsers. No special requirements needed.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No installation required</h3>
              <p className="text-gray-600">PDF files are merged in the cloud, so this tool doesn&apos;t use your system resources.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure merging</h3>
              <p className="text-gray-600">Your files are automatically deleted from our servers after processing for your privacy.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multiple file support</h3>
              <p className="text-gray-600">Merge up to 10 PDF files at once. Perfect for combining reports, documents, and presentations.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to merge PDF files?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Click in the file selection area and select the PDF files to merge.</li>
                  <li>If necessary, correct the file order using drag & drop.</li>
                  <li>Start merging the files with the merge button.</li>
                  <li>Finally, download the merged file as a single PDF.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Is it safe to merge PDFs online?</h3>
                <p className="text-gray-600">Yes, your files are processed securely and automatically deleted from our servers after one hour. We use SSL encryption for all file transfers.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What&apos;s the maximum file size?</h3>
                <p className="text-gray-600">You can merge PDF files up to 50MB each. For larger files, consider compressing them first or contact support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
