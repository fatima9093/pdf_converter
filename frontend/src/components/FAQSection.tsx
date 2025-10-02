'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFaqs: FAQItem[] = [
  {
    question: 'Are the PDF tools really free to use?',
    answer: 'Yes! We offer free access to all basic PDF tools with generous daily limits. Users can convert, merge, split, and compress PDFs without any cost. For power users who need unlimited conversions, we offer premium plans.'
  },
  {
    question: 'Is it safe to upload my documents?',
    answer: 'Absolutely. Security and privacy are our top priorities. All file transfers are encrypted using SSL/TLS. Your files are automatically deleted from our servers immediately after processing. We never store, share, or access your documents.'
  },
  {
    question: 'Do I need to install any software?',
    answer: 'No installation required! All our tools work directly in your web browser. Simply visit our website, select a tool, upload your file, and download the result. It works on any device with internet access.'
  },
  {
    question: 'What file formats are supported?',
    answer: 'We support a wide range of formats including PDF, Word (DOC, DOCX), Excel (XLS, XLSX), PowerPoint (PPT, PPTX), and various image formats (JPG, PNG, etc.). Our tools can convert between most common document and image formats.'
  },
  {
    question: 'What is the maximum file size I can upload?',
    answer: 'Free users can upload files up to 50MB. Premium users enjoy higher limits up to 500MB per file. For most documents, the free limit is more than sufficient.'
  },
  {
    question: 'How long does the conversion process take?',
    answer: 'Most conversions are completed within seconds to a few minutes, depending on file size and complexity. Simple conversions like PDF to Word typically take 10-30 seconds, while OCR processing may take slightly longer.'
  },
  {
    question: 'Can I convert multiple files at once?',
    answer: 'Yes! Our tools support batch processing. You can upload multiple files and convert them all at once, saving you valuable time. The number of simultaneous conversions may vary based on your account type.'
  },
  {
    question: 'Will the formatting be preserved during conversion?',
    answer: 'We use advanced conversion algorithms to maintain original formatting, layouts, fonts, and images as accurately as possible. While most conversions are near-perfect, complex documents may occasionally require minor adjustments.'
  },
  {
    question: 'Do I need to create an account?',
    answer: 'You can use basic tools without an account! However, creating a free account unlocks additional benefits like conversion history, higher daily limits, and the ability to save your work for later.'
  },
  {
    question: 'What happens to my files after conversion?',
    answer: 'Your files are automatically deleted from our servers within 1 hour after processing. You can also manually delete them immediately after download. We recommend downloading your converted files promptly and do not use our service for file storage.'
  },
  {
    question: 'Can I use these tools on my mobile device?',
    answer: 'Yes! Our tools are fully responsive and work perfectly on smartphones and tablets. Simply access our website from your mobile browser and use all features just like on desktop.'
  },
  {
    question: 'What if my conversion fails or has errors?',
    answer: 'If you experience any issues, please try again or contact our support team. We continuously improve our conversion engines. For complex documents, you can also reach out to us for assistance.'
  }
];

interface FAQSectionProps {
  faqData?: FAQItem[];
}

export default function FAQSection({ faqData }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const faqs = faqData || defaultFaqs;

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our PDF tools
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#2b3d98] transition-colors duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-[#2b3d98] flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-12 p-8 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Can&apos;t find the answer you&apos;re looking for? Please contact our support team.
          </p>
          <a
            href="/contact"
            className="inline-block bg-[#2b3d98] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#1e2b6e] transition-colors duration-200"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
