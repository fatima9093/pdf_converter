'use client';

import { tools } from '@/lib/tools';
import { Tool } from '@/types';
import ToolBox from './ToolBox';
import { useModal } from '@/contexts/ModalContext';

export default function HeroSection() {
  const { openModal } = useModal();

  const handleToolClick = (tool: Tool) => {
    openModal(tool);
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

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h2>
            <p className="text-gray-600 mb-6">
              Choose any tool above to begin converting your files. 
              No registration required for basic usage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#2b3d98] text-white px-8 py-3 rounded-lg hover:bg-[#243485] transition-colors duration-200 font-medium">
                Start Converting
              </button>
              <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
