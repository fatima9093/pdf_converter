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
  '/convert/html-to-pdf': 'html-to-pdf',
};

// Reverse mapping from tool IDs to URLs
const TOOL_ID_TO_URL_MAP: Record<string, string> = {
  'merge-pdf': '/tools/merge',
  'split-pdf': '/tools/split',
  'compress-pdf': '/tools/compress',
  'pdf-to-word': '/convert/pdf-to-word',
  'pdf-to-excel': '/convert/pdf-to-excel',
  'pdf-to-powerpoint': '/convert/pdf-to-ppt',
  'pdf-to-jpg': '/convert/pdf-to-image',
  'word-to-pdf': '/convert/word-to-pdf',
  'excel-to-pdf': '/convert/excel-to-pdf',
  'powerpoint-to-pdf': '/convert/ppt-to-pdf',
  'jpg-to-pdf': '/convert/image-to-pdf',
  'html-to-pdf': '/convert/html-to-pdf',
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
 * Get URL by tool ID
 */
export const getUrlByToolId = (toolId: string): string | undefined => {
  return TOOL_ID_TO_URL_MAP[toolId];
};

/**
 * Check if a URL should open a modal instead of navigating
 * This is used by the navbar - toolbox will now navigate to pages instead
 */
export const shouldOpenModal = (url: string): boolean => {
  // For now, we disable modal behavior for all tools since toolbox should navigate
  // The navbar can still use this for future modal behavior if needed
  return false;
};

export { URL_TO_TOOL_ID_MAP, TOOL_ID_TO_URL_MAP };
