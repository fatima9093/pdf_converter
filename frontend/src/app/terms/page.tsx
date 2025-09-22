'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Scale, AlertTriangle, Shield, Users, Globe, Mail } from 'lucide-react';

export default function TermsOfServicePage() {
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
            <Scale className="h-8 w-8 text-[#2b3d98] mr-3" />
            Terms of Service
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Important Notice</h3>
                  <p className="text-blue-800 text-sm">
                    Please read these Terms of Service carefully before using our service. 
                    By accessing or using Simple PDF Tools, you agree to be bound by these terms.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms of Service (&quot;Terms&quot;) govern your use of Simple PDF Tools (&quot;Service&quot;) 
              operated by us (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). By accessing or using our Service, you 
              agree to comply with and be bound by these Terms.
            </p>
            <p className="text-gray-700 leading-relaxed">
              If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using this Service, you accept and agree to be bound by the 
              terms and provision of this agreement. Additionally, when using this Service, 
              you shall be subject to any posted guidelines or rules applicable to such services.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to update or modify these Terms at any time without prior 
              notice. Your continued use of the Service after any changes indicates your 
              acceptance of the new Terms.
            </p>
          </section>

          {/* Description of Service */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-6 w-6 text-[#2b3d98] mr-2" />
              Description of Service
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Simple PDF Tools is a web-based platform that provides free online tools 
                for working with PDF files, including but not limited to:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Conversion Services</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• PDF to Excel conversion</li>
                    <li>• PDF to Word conversion</li>
                    <li>• PDF to Image conversion</li>
                    <li>• Other format conversions</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">PDF Tools</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• PDF merging and splitting</li>
                    <li>• PDF compression</li>
                    <li>• PDF editing tools</li>
                    <li>• Document processing</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                Our Service is provided free of charge and is supported by advertisements. 
                No registration is required for basic functionality.
              </p>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-6 w-6 text-[#2b3d98] mr-2" />
              User Responsibilities
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Acceptable Use</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You agree to use our Service only for lawful purposes and in accordance 
                  with these Terms. You agree not to:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 text-sm">Upload malicious or harmful content</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 text-sm">Violate any applicable laws or regulations</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 text-sm">Infringe on intellectual property rights</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 text-sm">Attempt to gain unauthorized access</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 text-sm">Interfere with Service operation</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 text-sm">Use automated tools to access the Service</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 text-sm">Upload copyrighted material without permission</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                      <p className="text-gray-700 text-sm">Reverse engineer or copy the Service</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Content Responsibility</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  You are solely responsible for the content of files you upload to our Service. 
                  You represent and warrant that:
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <ul className="space-y-2 text-green-800">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <span className="text-sm">You own or have the right to use all uploaded content</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <span className="text-sm">Your content does not violate any laws or third-party rights</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                      <span className="text-sm">Your content is not defamatory, obscene, or harmful</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Account Security</h3>
                <p className="text-gray-700 leading-relaxed">
                  If you create an account, you are responsible for maintaining the security 
                  of your account credentials and for all activities that occur under your account.
                </p>
              </div>
            </div>
          </section>

          {/* File Processing and Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-6 w-6 text-[#2b3d98] mr-2" />
              File Processing and Privacy
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">File Handling Policy</h3>
                <p className="text-blue-800 text-sm mb-2">
                  We take your privacy seriously. Here&apos;s how we handle your files:
                </p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Files are processed temporarily and automatically deleted within 24 hours</li>
                  <li>• We do not store, read, or analyze your file contents</li>
                  <li>• All file transfers are encrypted using SSL/TLS</li>
                  <li>• No human access to your uploaded files</li>
                </ul>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                By uploading files to our Service, you acknowledge that temporary processing 
                is necessary to provide the conversion services. You retain all rights to 
                your original files and converted outputs.
              </p>
            </div>
          </section>

          {/* Service Availability */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
            
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We strive to maintain high availability of our Service, but we do not guarantee 
                uninterrupted access. The Service may be temporarily unavailable due to:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Scheduled maintenance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Technical difficulties</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Server overload</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-700 text-sm">Force majeure events</span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                We will make reasonable efforts to provide advance notice of planned maintenance 
                when possible.
              </p>
            </div>
          </section>

          {/* Disclaimers and Limitations */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimers and Limitations</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Service &quot;As Is&quot;</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    <strong>IMPORTANT:</strong> Our Service is provided &quot;as is&quot; and &quot;as available&quot; 
                    without any warranties, express or implied. We do not guarantee the accuracy, 
                    completeness, or quality of conversions.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Limitation of Liability</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  To the maximum extent permitted by law, we shall not be liable for any 
                  indirect, incidental, special, consequential, or punitive damages, including:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <span className="text-gray-700 text-sm">Loss of data or files</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <span className="text-gray-700 text-sm">Business interruption</span>
                    </li>
                  </ul>
                  
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <span className="text-gray-700 text-sm">Lost profits or revenue</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                      <span className="text-gray-700 text-sm">Service interruptions</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">File Conversion Accuracy</h3>
                <p className="text-gray-700 leading-relaxed">
                  While we strive to provide accurate conversions, we cannot guarantee perfect 
                  results due to the complexity of different file formats and layouts. Users 
                  should verify converted files before using them for important purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Our Rights</h3>
                <p className="text-gray-700 leading-relaxed">
                  The Service and its original content, features, and functionality are and 
                  will remain the exclusive property of Simple PDF Tools and its licensors. 
                  The Service is protected by copyright, trademark, and other laws.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Your Rights</h3>
                <p className="text-gray-700 leading-relaxed">
                  You retain all rights to the files you upload and the converted outputs. 
                  We do not claim ownership of your content. You grant us a temporary license 
                  to process your files solely for the purpose of providing the conversion service.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Copyright Infringement</h3>
                <p className="text-gray-700 leading-relaxed">
                  We respect intellectual property rights. If you believe your copyrighted 
                  work has been used inappropriately, please contact us with details of the 
                  alleged infringement.
                </p>
              </div>
            </div>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
            
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                We may terminate or suspend your access to the Service immediately, without 
                prior notice or liability, for any reason, including breach of these Terms.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-medium text-red-900 mb-2">Termination Reasons</h3>
                <ul className="text-red-800 text-sm space-y-1">
                  <li>• Violation of these Terms of Service</li>
                  <li>• Fraudulent or illegal activity</li>
                  <li>• Abuse of the Service or its resources</li>
                  <li>• At our sole discretion for any reason</li>
                </ul>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                Upon termination, your right to use the Service will cease immediately. 
                All provisions of these Terms that by their nature should survive termination 
                shall survive.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="h-6 w-6 text-[#2b3d98] mr-2" />
              Governing Law
            </h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              These Terms shall be interpreted and governed by the laws of the jurisdiction 
              in which we operate, without regard to its conflict of law provisions.
            </p>
            
            <p className="text-gray-700 leading-relaxed">
              Any disputes arising from these Terms or the use of our Service shall be 
              resolved through binding arbitration in accordance with the rules of the 
              applicable arbitration association.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision 
              is material, we will try to provide at least 30 days notice prior to any new 
              terms taking effect.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> What constitutes a material change will be determined 
                at our sole discretion. Your continued use of the Service after any changes 
                indicates your acceptance of the new Terms.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Mail className="h-6 w-6 text-[#2b3d98] mr-2" />
              Contact Us
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              
              <div className="space-y-3">
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
                We will respond to your inquiry within 7 business days.
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm mb-4 sm:mb-0">
                These Terms of Service are effective as of {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}.
              </p>
              
              <div className="flex space-x-4 text-sm">
                <Link href="/privacy" className="text-[#2b3d98] hover:underline">
                  Privacy Policy
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
