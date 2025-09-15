'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-3 lg:px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Simple PDF Tool</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Free online tools for working with PDF files. 
              No registration required. Supported by ads to 
              keep the service free.
            </p>
          </div>

          {/* Tools Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tools/merge" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/convert/pdf-to-word" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  Edit PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/split" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/compress" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  Compress PDF
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-600 hover:text-[#2b3d98] text-sm transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
          <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Features */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-4 md:mb-0">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure Processing
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Privacy Protected
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Fast & Efficient
              </div>
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-500">
              © 2025 Simple PDF Tool. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
