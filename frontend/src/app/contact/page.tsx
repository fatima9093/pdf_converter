'use client';

import { useState } from 'react';
import { Mail, MessageSquare, User, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  name: string;
  surname: string;
  email: string;
  subject: string;
  message: string;
  acceptTerms: boolean;
}

interface FormErrors {
  name?: string;
  surname?: string;
  email?: string;
  subject?: string;
  message?: string;
  acceptTerms?: string;
}

const subjectOptions = [
  { value: '', label: 'Choose a subject...' },
  { value: 'general', label: 'General information / Contact' },
  { value: 'billing', label: 'Billing' },
  { value: 'sales', label: 'Sales' },
  { value: 'feature', label: 'Suggest a feature' },
  { value: 'problem', label: 'Report a Problem' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'other', label: 'Other' }
];

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    surname: '',
    email: '',
    subject: '',
    message: '',
    acceptTerms: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_EXPRESS_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          surname: '',
          email: '',
          subject: '',
          message: '',
          acceptTerms: false
        });
        console.log('Contact form submitted successfully:', data);
      } else {
        throw new Error(data.message || 'Failed to submit contact form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2b3d98] to-[#243485] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Contact
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Contact us to report a problem, clarify any doubts about Simple PDF Tools, or just find out more.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {submitStatus === 'success' && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Message Sent Successfully!</h3>
                <p className="text-green-700 mt-1">
                  Thank you for contacting us. We&apos;ll get back to you as soon as possible.
                </p>
              </div>
            </div>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Sending Message</h3>
                <p className="text-red-700 mt-1">
                  There was an error sending your message. Please try again or contact us directly.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name and Surname Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2b3d98] focus:border-transparent transition-colors text-black ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your name"
                    style={{ color: 'black' }}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="surname" className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Surname *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2b3d98] focus:border-transparent transition-colors text-black ${
                      errors.surname ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your surname"
                    style={{ color: 'black' }}
                  />
                </div>
                {errors.surname && (
                  <p className="mt-1 text-sm text-red-600">{errors.surname}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Your Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2b3d98] focus:border-transparent transition-colors text-black ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                  style={{ color: 'black' }}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                Subject *
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2b3d98] focus:border-transparent transition-colors text-black ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                {subjectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#2b3d98] focus:border-transparent transition-colors resize-vertical text-black ${
                  errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Please describe your question or issue in detail..."
                style={{ color: 'black' }}
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">{errors.message}</p>
              )}
            </div>

            {/* Terms and Conditions */}
            <div>
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  className={`mt-1 h-4 w-4 text-[#2b3d98] focus:ring-[#2b3d98] border-gray-300 rounded ${
                    errors.acceptTerms ? 'border-red-300' : ''
                  }`}
                />
                <span className="text-sm text-gray-700">
                  I accept{' '}
                  <Link href="/terms" className="text-[#2b3d98] hover:underline">
                    Terms & Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-[#2b3d98] hover:underline">
                    Legal & Privacy
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full md:w-auto inline-flex items-center justify-center px-8 py-4 bg-[#2b3d98] text-white rounded-lg font-semibold text-lg transition-all duration-200 ${
                  isSubmitting
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-[#243485] hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Additional Contact Info */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Other Ways to Reach Us
            </h2>
            <p className="text-lg text-gray-600">
              We&apos;re here to help and answer any questions you might have
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FAQ Link */}
            <div className="text-center bg-gray-50 rounded-lg p-8">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-[#2b3d98]" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Frequently Asked Questions</h3>
              <p className="text-gray-600 mb-4">
                Find answers to common questions about our PDF tools and services.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center text-[#2b3d98] font-medium hover:underline"
              >
                View FAQ
              </Link>
            </div>

            {/* Documentation */}
            <div className="text-center bg-gray-50 rounded-lg p-8">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tool Guides</h3>
              <p className="text-gray-600 mb-4">
                Learn how to use our PDF tools effectively with step-by-step guides.
              </p>
              <Link
                href="/tools"
                className="inline-flex items-center text-green-600 font-medium hover:underline"
              >
                Explore Tools
              </Link>
            </div>

            {/* About Us */}
            <div className="text-center bg-gray-50 rounded-lg p-8">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">About Our Service</h3>
              <p className="text-gray-600 mb-4">
                Learn more about our mission and the team behind Simple PDF Tools.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center text-purple-600 font-medium hover:underline"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time Notice */}
      <div className="bg-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
            </div>
            <p className="text-gray-600">
              We typically respond to all inquiries within 24-48 hours during business days. 
              For urgent issues, please include &quot;URGENT&quot; in your subject line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
