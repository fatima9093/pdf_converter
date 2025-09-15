import { Tool } from '@/types';

export const tools: Tool[] = [
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDF files into one document',
    icon: 'Combine',
    acceptedFileTypes: ['.pdf'],
    outputFormat: 'pdf',
    color: 'bg-blue-500',
    allowMultipleFiles: true,
    maxFiles: 10
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Split a PDF file into multiple documents',
    icon: 'Split',
    acceptedFileTypes: ['.pdf'],
    outputFormat: 'pdf',
    color: 'bg-green-500'
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce PDF file size while preserving all content',
    icon: 'Archive',
    acceptedFileTypes: ['.pdf'],
    outputFormat: 'pdf',
    color: 'bg-purple-500'
  },
  {
    id: 'jpg-to-pdf',
    name: 'Image to PDF',
    description: 'Convert JPG/PNG images to PDF format',
    icon: 'Image',
    acceptedFileTypes: ['.jpg', '.jpeg', '.png'],
    outputFormat: 'pdf',
    color: 'bg-orange-500'
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents to PDF format',
    icon: 'FileText',
    acceptedFileTypes: ['.doc', '.docx'],
    outputFormat: 'pdf',
    color: 'bg-red-500'
  },
  {
    id: 'powerpoint-to-pdf',
    name: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations to PDF format',
    icon: 'Presentation',
    acceptedFileTypes: ['.ppt', '.pptx'],
    outputFormat: 'pdf',
    color: 'bg-indigo-500'
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert Excel spreadsheets to PDF format',
    icon: 'FileSpreadsheet',
    acceptedFileTypes: ['.xls', '.xlsx'],
    outputFormat: 'pdf',
    color: 'bg-emerald-500'
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    description: 'Convert HTML web pages to PDF documents',
    icon: 'Code',
    acceptedFileTypes: ['.html', '.htm'],
    outputFormat: 'pdf',
    color: 'bg-teal-500'
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert PDF pages to high-quality JPG images',
    icon: 'FileImage',
    acceptedFileTypes: ['.pdf'],
    outputFormat: 'jpg',
    color: 'bg-[#2b3d98]'
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF documents to editable Word format.',
    icon: 'FileText',
    acceptedFileTypes: ['.pdf'],
    outputFormat: 'docx',
    color: 'bg-[#2b3d98]'
  },
  {
    id: 'pdf-to-powerpoint',
    name: 'PDF to PowerPoint',
    description: 'Convert PDF documents to editable PowerPoint presentations with text, images, and layout preservation',
    icon: 'Presentation',
    acceptedFileTypes: ['.pdf'],
    outputFormat: 'pptx',
    color: 'bg-[#2b3d98]'
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Convert PDF tables to Excel spreadsheets',
    icon: 'FileSpreadsheet',
    acceptedFileTypes: ['.pdf'],
    outputFormat: 'xlsx',
    color: 'bg-green-600'
  }
];

export const getToolById = (id: string): Tool | undefined => {
  return tools.find(tool => tool.id === id);
};

export const getAcceptedFileTypesString = (tool: Tool): string => {
  return tool.acceptedFileTypes.join(', ');
};

export const isValidFileType = (file: File, tool: Tool): boolean => {
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  return tool.acceptedFileTypes.includes(fileExtension);
};
