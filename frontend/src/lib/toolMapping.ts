import { getToolById } from './tools';
import { Tool } from '@/types';

// Mapping from navbar URLs to tool IDs
const URL_TO_TOOL_ID_MAP: Record<string, string> = {
  // Tools dropdown
  '/tools/merge': 'merge-pdf',
  '/tools/split': 'split-pdf',
  '/tools/compress': 'compress-pdf',
  
  // PDF to Files dropdown
  '/convert/pdf-to-word': 'pdf-to-word',
  '/convert/pdf-to-excel': 'pdf-to-excel',
  '/convert/pdf-to-ppt': 'pdf-to-powerpoint',
  '/convert/pdf-to-image': 'pdf-to-jpg',
  
  // Files to PDF dropdown
  '/convert/word-to-pdf': 'word-to-pdf',
  '/convert/excel-to-pdf': 'excel-to-pdf',
  '/convert/ppt-to-pdf': 'powerpoint-to-pdf',
  '/convert/image-to-pdf': 'jpg-to-pdf',
};

/**
 * Get tool by URL path
 */
export const getToolByUrl = (url: string): Tool | undefined => {
  const toolId = URL_TO_TOOL_ID_MAP[url];
  if (!toolId) return undefined;
  return getToolById(toolId);
};

/**
 * Check if a URL should open a modal instead of navigating
 */
export const shouldOpenModal = (url: string): boolean => {
  return url in URL_TO_TOOL_ID_MAP;
};

export { URL_TO_TOOL_ID_MAP };
