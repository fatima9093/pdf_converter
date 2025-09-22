'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Shield, Upload, FileText, Zap } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'security' | 'technical' | 'conversion';
}

interface Category {
  id: 'all' | 'general' | 'security' | 'technical' | 'conversion';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface FAQSectionProps {
  faqData: FAQItem[];
}

export default function FAQSection({ faqData }: FAQSectionProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'general' | 'security' | 'technical' | 'conversion'>('all');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const categories: Category[] = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'general', name: 'General', icon: FileText },
    { id: 'security', name: 'Security & Privacy', icon: Shield },
    { id: 'technical', name: 'Technical', icon: Zap },
    { id: 'conversion', name: 'Conversion', icon: Upload }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === activeCategory);

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Our support team answers these questions nearly every day
        </h2>
        <p className="text-lg text-gray-600">
          We thought they could be useful for you too
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                activeCategory === category.id
                  ? 'bg-[#2b3d98] text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#2b3d98] hover:text-[#2b3d98]'
              }`}
            >
              <Icon className="h-5 w-5 mr-2" />
              {category.name}
            </button>
          );
        })}
      </div>

      {/* FAQ Items */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {filteredFAQs.map((faq) => {
            const isOpen = openItems.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-150"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-5">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
