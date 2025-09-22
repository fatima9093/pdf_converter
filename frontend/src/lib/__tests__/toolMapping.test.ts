import { getToolInfo, getAllTools, isValidTool } from '../toolMapping';

describe('toolMapping utilities', () => {
  describe('getToolInfo', () => {
    test('returns correct tool info for valid tool', () => {
      const toolInfo = getToolInfo('pdf-to-word');
      
      expect(toolInfo).toBeDefined();
      expect(toolInfo?.id).toBe('pdf-to-word');
      expect(toolInfo?.name).toBe('PDF to Word');
      expect(toolInfo?.description).toContain('Convert PDF files to Word documents');
      expect(toolInfo?.inputFormats).toContain('pdf');
      expect(toolInfo?.outputFormat).toBe('docx');
    });

    test('returns undefined for invalid tool', () => {
      const toolInfo = getToolInfo('invalid-tool');
      
      expect(toolInfo).toBeUndefined();
    });

    test('returns correct info for all main tools', () => {
      const tools = [
        'pdf-to-word',
        'pdf-to-excel', 
        'pdf-to-powerpoint',
        'office-to-pdf',
        'pdf-to-jpg'
      ];

      tools.forEach(toolId => {
        const toolInfo = getToolInfo(toolId);
        expect(toolInfo).toBeDefined();
        expect(toolInfo?.id).toBe(toolId);
        expect(typeof toolInfo?.name).toBe('string');
        expect(typeof toolInfo?.description).toBe('string');
      });
    });
  });

  describe('getAllTools', () => {
    test('returns array of all available tools', () => {
      const allTools = getAllTools();
      
      expect(Array.isArray(allTools)).toBe(true);
      expect(allTools.length).toBeGreaterThan(0);
      
      // Check that each tool has required properties
      allTools.forEach(tool => {
        expect(tool.id).toBeDefined();
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.inputFormats).toBeDefined();
        expect(tool.outputFormat).toBeDefined();
      });
    });

    test('includes main conversion tools', () => {
      const allTools = getAllTools();
      const toolIds = allTools.map(tool => tool.id);
      
      expect(toolIds).toContain('pdf-to-word');
      expect(toolIds).toContain('pdf-to-excel');
      expect(toolIds).toContain('pdf-to-powerpoint');
      expect(toolIds).toContain('office-to-pdf');
      expect(toolIds).toContain('pdf-to-jpg');
    });
  });

  describe('isValidTool', () => {
    test('returns true for valid tools', () => {
      expect(isValidTool('pdf-to-word')).toBe(true);
      expect(isValidTool('pdf-to-excel')).toBe(true);
      expect(isValidTool('office-to-pdf')).toBe(true);
    });

    test('returns false for invalid tools', () => {
      expect(isValidTool('invalid-tool')).toBe(false);
      expect(isValidTool('')).toBe(false);
      expect(isValidTool('pdf-to-invalid')).toBe(false);
    });

    test('is case sensitive', () => {
      expect(isValidTool('PDF-TO-WORD')).toBe(false);
      expect(isValidTool('pdf-to-word')).toBe(true);
    });
  });
});
