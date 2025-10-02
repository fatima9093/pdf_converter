'use client';

import { tools } from '@/lib/tools';
import { Tool } from '@/types';
import ToolBox from './ToolBox';
import { useRouter } from 'next/navigation';
import { getUrlByToolId } from '@/lib/toolMapping';
import FeaturesSection from './FeaturesSection';
import FAQSection from './FAQSection';

export default function HeroSection() {
  const router = useRouter();

  const handleToolClick = (tool: Tool) => {
    const toolUrl = getUrlByToolId(tool.id);
    if (toolUrl) {
      router.push(toolUrl);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Header */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          PDF Tools Made
          <span className="text-[#2b3d98]"> Simple</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
          Convert, merge, split, and compress your documents with ease. 
          Professional-grade PDF tools that work right in your browser.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <ToolBox
              key={tool.id}
              tool={tool}
              onClick={handleToolClick}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* FAQ Section */}
      <FAQSection />

    </div>
  );
}
