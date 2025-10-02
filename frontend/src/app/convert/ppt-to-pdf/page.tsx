'use client';

import { getToolById } from '@/lib/tools';
import FileUploadModal from '@/components/FileUploadModal';
import Link from 'next/link';
import { ArrowLeft, Shield, Zap, Users, Globe, Download, CheckCircle, Presentation } from 'lucide-react';

export default function PowerPointToPDFPage() {
  const tool = getToolById('powerpoint-to-pdf');

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
          <h1 className="text-[1.9rem] font-bold text-gray-900 mb-3">PowerPoint to PDF</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Convert PowerPoint presentations to PDF format for easy sharing
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
                <h3 className="font-semibold text-gray-900 mb-2">Upload presentation</h3>
                <p className="text-gray-600">Select your PPTX or PPT file for conversion</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Perfect conversion</h3>
                <p className="text-gray-600">Preserve all slides, animations, and formatting</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-orange-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Download PDF</h3>
                <p className="text-gray-600">Get your presentation as a shareable PDF</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-50 p-6 rounded-lg">
              <Presentation className="w-8 h-8 text-orange-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Slide preservation</h3>
              <p className="text-gray-600">Every slide is converted with perfect layout, fonts, and visual elements preserved.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Animation handling</h3>
              <p className="text-gray-600">Animations are flattened into the final slide state for consistent viewing.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Universal sharing</h3>
              <p className="text-gray-600">PDFs can be viewed by anyone without needing PowerPoint or special software.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Download className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Print-ready quality</h3>
              <p className="text-gray-600">Generated PDFs are optimized for both digital viewing and high-quality printing.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Shield className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure processing</h3>
              <p className="text-gray-600">Your presentations are processed securely and automatically deleted after conversion.</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Globe className="w-8 h-8 text-indigo-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Multiple formats</h3>
              <p className="text-gray-600">Supports both PPTX and PPT formats from all versions of PowerPoint.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Questions and Answers</h2>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">How to convert PowerPoint to PDF?</h3>
                <ol className="text-gray-600 space-y-1 list-decimal list-inside">
                  <li>Upload your PowerPoint file (PPTX or PPT format).</li>
                  <li>Our conversion engine will process all slides and formatting.</li>
                  <li>Download the converted PDF file.</li>
                  <li>Share your presentation as a universally viewable PDF.</li>
                </ol>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What happens to animations and transitions?</h3>
                <p className="text-gray-600">Animations and transitions are flattened to show the final state of each slide, ensuring consistent appearance across all devices.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Will speaker notes be included?</h3>
                <p className="text-gray-600">By default, only the slide content is converted. Speaker notes are not included in the PDF to maintain a clean presentation format.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
