'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-[#2b3d98] transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 flex items-center">
            <Shield className="h-8 w-8 text-[#2b3d98] mr-3" />
            Privacy Policy
          </h1>
          <p className="text-gray-600 mt-2">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          
          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Simple PDF Tools (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your 
              information when you visit our website and use our PDF conversion services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using our service, you agree to the collection and use of information in 
              accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="h-6 w-6 text-[#2b3d98] mr-2" />
              Information We Collect
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We may collect personally identifiable information that you voluntarily provide:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Email address (when you create an account or contact us)</li>
                  <li>Name (when provided during account registration)</li>
                  <li>Contact information (when you reach out to us)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">File Information</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  When you use our PDF conversion services:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>PDF files you upload for conversion</li>
                  <li>File metadata (size, type, creation date)</li>
                  <li>Conversion preferences and settings</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Information</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  We automatically collect certain information about your device and usage:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>IP address and location data</li>
                  <li>Browser type and version</li>
                  <li>Device information and operating system</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referral sources</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="h-6 w-6 text-[#2b3d98] mr-2" />
              How We Use Your Information
            </h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the collected information for the following purposes:
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Service Provision</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Process PDF conversions</li>
                  <li>• Maintain service functionality</li>
                  <li>• Provide customer support</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Communication</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Send service notifications</li>
                  <li>• Respond to inquiries</li>
                  <li>• Provide updates and announcements</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Improvement</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Analyze usage patterns</li>
                  <li>• Enhance user experience</li>
                  <li>• Develop new features</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Legal Compliance</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Comply with legal obligations</li>
                  <li>• Protect our rights and interests</li>
                  <li>• Prevent fraud and abuse</li>
                </ul>
              </div>
            </div>
          </section>

          {/* File Processing and Storage */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="h-6 w-6 text-[#2b3d98] mr-2" />
              File Processing and Storage
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">Important: File Handling</h3>
              <p className="text-blue-800 text-sm">
                Your privacy is our priority. Here&apos;s how we handle your files:
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Temporary Processing</h3>
                <p className="text-gray-700 leading-relaxed">
                  Files uploaded for conversion are processed temporarily on our servers. 
                  We do not permanently store your files or their contents.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Automatic Deletion</h3>
                <p className="text-gray-700 leading-relaxed">
                  All uploaded files and converted outputs are automatically deleted from 
                  our servers within 24 hours of processing, or immediately after download.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Analysis</h3>
                <p className="text-gray-700 leading-relaxed">
                  We do not read, analyze, or store the content of your PDF files beyond 
                  what is necessary for the conversion process.
                </p>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="h-6 w-6 text-[#2b3d98] mr-2" />
              Information Sharing and Disclosure
            </h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third 
              parties except in the following circumstances:
            </p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-medium text-gray-900">Service Providers</h3>
                <p className="text-gray-700 text-sm">
                  Trusted third parties who assist in operating our website and conducting business, 
                  provided they agree to keep information confidential.
                </p>
              </div>
              
              <div className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-medium text-gray-900">Legal Requirements</h3>
                <p className="text-gray-700 text-sm">
                  When required by law, court order, or government regulation.
                </p>
              </div>
              
              <div className="border-l-4 border-gray-300 pl-4">
                <h3 className="font-medium text-gray-900">Business Transfers</h3>
                <p className="text-gray-700 text-sm">
                  In connection with a merger, acquisition, or sale of business assets.
                </p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Lock className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Encryption</h3>
                  <p className="text-gray-700 text-sm">All data transmission is encrypted using SSL/TLS</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Access Control</h3>
                  <p className="text-gray-700 text-sm">Restricted access to personal information</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Database className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Secure Storage</h3>
                  <p className="text-gray-700 text-sm">Protected servers with regular security updates</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Eye className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Monitoring</h3>
                  <p className="text-gray-700 text-sm">Continuous monitoring for security threats</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking Technologies</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience:
            </p>
            
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-900">Essential Cookies</h3>
                <p className="text-gray-700 text-sm">Required for basic site functionality and security</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                <p className="text-gray-700 text-sm">Help us understand how visitors interact with our site</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900">Preference Cookies</h3>
                <p className="text-gray-700 text-sm">Remember your settings and preferences</p>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm mt-4">
              You can control cookie settings through your browser preferences. Note that 
              disabling certain cookies may affect site functionality.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Privacy Rights</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Depending on your location, you may have the following rights:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#2b3d98] rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Access</h3>
                  <p className="text-gray-700 text-sm">Request access to your personal information</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#2b3d98] rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Correction</h3>
                  <p className="text-gray-700 text-sm">Request correction of inaccurate information</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#2b3d98] rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Deletion</h3>
                  <p className="text-gray-700 text-sm">Request deletion of your personal information</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#2b3d98] rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Portability</h3>
                  <p className="text-gray-700 text-sm">Request transfer of your data to another service</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-[#2b3d98] rounded-full mt-2"></div>
                <div>
                  <h3 className="font-medium text-gray-900">Objection</h3>
                  <p className="text-gray-700 text-sm">Object to processing of your personal information</p>
                </div>
              </div>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              Our website may contain links to third-party websites or integrate with 
              third-party services. We are not responsible for the privacy practices 
              of these external sites.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> We recommend reviewing the privacy policies of any 
                third-party sites you visit through our service.
              </p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children&apos;s Privacy</h2>
            
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13. If you become 
              aware that a child has provided us with personal information, please contact us 
              immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Privacy Policy</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the &quot;Last 
              updated&quot; date.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              You are advised to review this Privacy Policy periodically for any changes. 
              Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-6 w-6 text-[#2b3d98] mr-2" />
              Contact Us
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us:
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <Link 
                    href="/contact" 
                    className="text-[#2b3d98] hover:underline"
                  >
                    Contact Form
                  </Link>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Globe className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">Simple PDF Tools</span>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mt-4">
                We will respond to your inquiry within 30 days.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm mb-4 sm:mb-0">
                This Privacy Policy is effective as of {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}.
              </p>
              
              <div className="flex space-x-4 text-sm">
                <Link href="/terms" className="text-[#2b3d98] hover:underline">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="text-[#2b3d98] hover:underline">
                  Cookie Policy
                </Link>
                <Link href="/contact" className="text-[#2b3d98] hover:underline">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
