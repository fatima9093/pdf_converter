'use client';

import { Tool } from '@/types';
import { 
  FileText, 
  Archive, 
  Image, 
  Presentation,
  Split,
  Combine,
  Code,
  FileImage,
  FileSpreadsheet
} from 'lucide-react';

interface ToolBoxProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
}

const iconMap = {
  'FileText': FileText,
  'Archive': Archive,
  'Image': Image,
  'Presentation': Presentation,
  'Split': Split,
  'Combine': Combine,
  'Code': Code,
  'FileImage': FileImage,
  'FileSpreadsheet': FileSpreadsheet,
};

export default function ToolBox({ tool, onClick }: ToolBoxProps) {
  const IconComponent = iconMap[tool.icon as keyof typeof iconMap] || FileText;

  return (
    <div
      onClick={() => onClick(tool)}
      className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden min-h-[200px] flex flex-col justify-between border border-gray-100"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gray-50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-300"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-center w-16 h-16 bg-[#e5322d]/10 rounded-lg mb-4 group-hover:bg-[#e5322d]/20 transition-all duration-300">
          <IconComponent className="w-8 h-8 text-[#e5322d]" />
        </div>
        
        <h3 className="text-xl font-bold text-black mb-2 group-hover:text-gray-800 transition-all duration-300">
          {tool.name}
        </h3>
        
        <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-900 transition-all duration-300">
          {tool.description}
        </p>
        
        {tool.allowMultipleFiles && (
          <div className="mt-3 inline-flex items-center px-2 py-1 bg-[#e5322d]/10 rounded-full text-xs text-[#e5322d] font-medium">
            <span>Multiple files supported</span>
          </div>
        )}
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gray-50 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-xl"></div>
    </div>
  );
}
