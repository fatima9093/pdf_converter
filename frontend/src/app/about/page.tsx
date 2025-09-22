import { ArrowRight, Shield, Zap, Users, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2b3d98] to-[#243485] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About Simple PDF Tool
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Empowering users with free, secure, and easy-to-use PDF tools for all their document needs.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            We believe that working with PDF documents should be simple, accessible, and free for everyone. 
            Our mission is to provide powerful PDF tools that are easy to use, secure, and available to anyone 
            without requiring registration or payment.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Zap className="h-8 w-8 text-[#2b3d98]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Fast & Efficient</h3>
            <p className="text-gray-600">
              Our tools are optimized for speed and performance, allowing you to complete your PDF tasks quickly and efficiently.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Secure & Private</h3>
            <p className="text-gray-600">
              Your documents are processed securely and automatically deleted after conversion. We never store or access your files.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-md text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">User-Focused</h3>
            <p className="text-gray-600">
              No registration required. Just upload your file, process it, and download the result. It&apos;s that simple.
            </p>
          </div>
        </div>
      </div>

      {/* What We Offer Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              What We Offer
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              A comprehensive suite of PDF tools designed to handle all your document processing needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-[#2b3d98] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Tools</h3>
              <p className="text-gray-600 text-sm">
                Merge, split, and compress PDF files with ease.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-[#2b3d98] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF to Files</h3>
              <p className="text-gray-600 text-sm">
                Convert PDFs to Word, Excel, PowerPoint, and images.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-[#2b3d98] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Files to PDF</h3>
              <p className="text-gray-600 text-sm">
                Convert various file formats to PDF documents.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <FileText className="h-12 w-12 text-[#2b3d98] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">OCR Processing</h3>
              <p className="text-gray-600 text-sm">
                Advanced OCR technology for accurate text extraction.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Why Choose Simple PDF Tool?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">100% Free</h3>
                <p className="text-gray-600">
                  All our tools are completely free to use. No hidden fees, no subscription required.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Registration</h3>
                <p className="text-gray-600">
                  Start using our tools immediately without creating an account or providing personal information.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Processing</h3>
                <p className="text-gray-600">
                  Your files are processed securely and automatically deleted from our servers after conversion.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">High Quality</h3>
                <p className="text-gray-600">
                  Professional-grade conversion quality with advanced OCR technology for accurate results.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy to Use</h3>
                <p className="text-gray-600">
                  Intuitive interface designed for users of all technical levels. Just upload, process, and download.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Multiple Formats</h3>
                <p className="text-gray-600">
                  Support for various file formats including PDF, Word, Excel, PowerPoint, and images.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#2b3d98] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Try our free PDF tools today and experience the simplicity and power of our platform.
          </p>
          <Link
            href="/tools"
            className="inline-flex items-center px-8 py-4 bg-white text-[#2b3d98] rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Explore Our Tools
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
