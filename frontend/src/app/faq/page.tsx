import { HelpCircle } from 'lucide-react';
import Link from 'next/link';
import FAQSection from '@/components/FAQSection';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'security' | 'technical' | 'conversion';
}

const faqData: FAQItem[] = [
  {
    id: 'files-safe',
    question: 'Are my files safe with your service?',
    answer: 'Yes, absolutely. All uploads use HTTPS/SSL encryption for secure transmission. Your files are processed on our secure servers and are automatically deleted within 2 hours after processing. We never store, copy, analyze, or share your files in any way. Your privacy and data security are our top priorities.',
    category: 'security'
  },
  {
    id: 'keep-files',
    question: 'Do you keep a copy of my processed files?',
    answer: 'Absolutely not. Your files are only yours. While your files are temporarily on our servers for processing, they are strictly secured and no one can access them. We keep them for a maximum of 2 hours so you can download the converted files. Right after, they are completely removed forever from our servers. You can also delete the files manually after each conversion.',
    category: 'security'
  },
  {
    id: 'company-files-safe',
    question: 'Are company files safe with your service?',
    answer: 'Yes. All uploads use HTTPS/SSL encryption and include end-to-end encryption for additional privacy. These security measures satisfy most corporate data privacy policies. Your data is processed as safely as possible, and we comply with strict data protection standards including GDPR.',
    category: 'security'
  },
  {
    id: 'upload-files',
    question: 'How can I upload my files?',
    answer: 'The easiest way is to drag and drop your files directly onto our upload area. You can also click the "Select Files" button to browse and choose files from your device. We support multiple file uploads for batch processing when available.',
    category: 'general'
  },
  {
    id: 'conversion-time',
    question: 'Why does my conversion take so long?',
    answer: 'Processing speed depends on several factors including your internet connection speed, the size and complexity of your files, and current server load. Large files with many pages or complex formatting may take longer to process. OCR conversions (for scanned PDFs) typically take more time due to the advanced text recognition processing required.',
    category: 'technical'
  },
  {
    id: 'scanned-pdf-conversion',
    question: 'Can I convert scanned PDFs to editable documents?',
    answer: 'Yes! To convert a scanned PDF to an editable format like Word or Excel, we use advanced OCR (Optical Character Recognition) technology. This system converts non-selectable and scanned text into editable office documents. The accuracy depends on the quality of the original scan and the clarity of the text.',
    category: 'conversion'
  },
  {
    id: 'supported-formats',
    question: 'What file formats do you support?',
    answer: 'We support a wide range of formats including:\n\n• PDF to: Word (.docx), Excel (.xlsx), PowerPoint (.pptx), Images (.jpg, .png), Text (.txt)\n• To PDF: Word documents, Excel spreadsheets, PowerPoint presentations, Images\n• PDF Tools: Merge, Split, Compress, Rotate, Password protect\n\nWe regularly add support for new formats based on user requests.',
    category: 'conversion'
  },
  {
    id: 'batch-processing',
    question: 'Can I process multiple files at once?',
    answer: 'Yes, many of our tools support batch processing. You can upload multiple files simultaneously for operations like PDF merging, compression, or format conversion. This saves time when you need to process several documents with the same settings.',
    category: 'technical'
  },
  {
    id: 'file-size-limit',
    question: 'Is there a file size limit?',
    answer: 'For optimal performance and to ensure fair usage for all users, we have reasonable file size limits:\n\n• Individual files: Up to 100MB\n• Batch processing: Up to 500MB total\n• OCR processing: Up to 50MB per file\n\nIf you need to process larger files, please contact us to discuss your specific requirements.',
    category: 'technical'
  },
  {
    id: 'account-required',
    question: 'Do I need to create an account?',
    answer: 'No account is required for basic usage! You can use all our core PDF tools without registration. However, creating a free account gives you benefits like:\n\n• Processing history\n• Saved preferences\n• Priority processing\n• Access to advanced features\n• Email notifications when processing is complete',
    category: 'general'
  },
  {
    id: 'mobile-support',
    question: 'Can I use your tools on my mobile device?',
    answer: 'Absolutely! Our website is fully responsive and optimized for mobile devices. You can upload, process, and download files directly from your smartphone or tablet using any modern web browser. The interface adapts to your screen size for the best user experience.',
    category: 'technical'
  },
  {
    id: 'ocr-accuracy',
    question: 'How accurate is your OCR technology?',
    answer: 'Our OCR technology typically achieves 95-99% accuracy for clear, high-quality scanned documents. Accuracy depends on factors like:\n\n• Image resolution and quality\n• Text clarity and font type\n• Document language\n• Presence of graphics or complex layouts\n\nFor best results, use high-resolution scans (300 DPI or higher) with clear, dark text on light backgrounds.',
    category: 'conversion'
  },
  {
    id: 'password-protected',
    question: 'Can you process password-protected PDFs?',
    answer: 'Yes, if you provide the correct password. When you upload a password-protected PDF, you\'ll be prompted to enter the password. We can then process the file normally. The password is only used temporarily for processing and is not stored on our servers.',
    category: 'technical'
  },
  {
    id: 'quality-loss',
    question: 'Will converting my files reduce their quality?',
    answer: 'We use advanced algorithms to maintain the highest possible quality during conversion. However, some quality considerations:\n\n• PDF to Image: You can choose resolution (DPI) settings\n• PDF to Office: Formatting is preserved as much as possible\n• Compression: Balances file size with visual quality\n• OCR: Quality depends on source document clarity\n\nWe always aim to provide the best balance between quality and functionality.',
    category: 'conversion'
  },
  {
    id: 'support-contact',
    question: 'How can I get help or report issues?',
    answer: 'We offer several support channels:\n\n• Contact Form: Available 24/7 for detailed inquiries\n• FAQ: Covers most common questions\n• Email: Direct support for technical issues\n• Live Chat: Available during business hours\n\nWe typically respond to all inquiries within 24 hours during business days.',
    category: 'general'
  },
  {
    id: 'free-service',
    question: 'Is your service really free?',
    answer: 'Yes, our core PDF tools are completely free to use. There are no hidden fees or subscription requirements. Our service is supported by non-intrusive advertisements to keep it free for everyone. We believe everyone should have access to essential PDF tools without cost barriers.',
    category: 'general'
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2b3d98] to-[#243485] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <HelpCircle className="h-16 w-16 mx-auto mb-6 text-blue-200" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Find answers to common questions about our PDF tools and services
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <FAQSection faqData={faqData} />

      {/* Still have questions? */}
      <div className="bg-[#2b3d98] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Still have questions?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-[#2b3d98] rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}