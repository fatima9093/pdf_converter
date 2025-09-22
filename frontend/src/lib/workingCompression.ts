import { PDFDocument } from 'pdf-lib';

export class WorkingCompressionService {
  /**
   * Compress PDF using the proven working approach
   * This rebuilds the PDF document which often results in significant size reduction
   */
  static async compressPDF(file: File): Promise<Uint8Array> {
    const originalBuffer = await file.arrayBuffer();
    const originalSize = originalBuffer.byteLength;
    
    console.log(`🎯 WORKING COMPRESSION: Document rebuild approach`);
    console.log(`📏 Original: ${originalSize} bytes`);
    
    try {
      // Load the source PDF with encryption handling
      const src = await PDFDocument.load(originalBuffer, { ignoreEncryption: true });
      
      // Create a completely new PDF document
      const out = await PDFDocument.create();
      
      console.log(`📄 Source PDF has ${src.getPageCount()} pages`);
      
      // Copy all pages to the new document
      const copied = await out.copyPages(src, src.getPageIndices());
      for (const page of copied) {
        out.addPage(page);
      }
      
      // Set minimal metadata (clear unnecessary data)
      out.setTitle(src.getTitle() ?? "");
      out.setAuthor(src.getAuthor() ?? "");
      out.setSubject(src.getSubject() ?? "");
      out.setProducer(""); // Remove producer to reduce noise
      out.setCreator(""); // Remove creator to reduce noise
      const creationDate = src.getCreationDate();
      if (creationDate) {
        out.setCreationDate(creationDate);
      }
      out.setModificationDate(new Date());
      
      console.log(`🔧 Rebuilding PDF with optimization...`);
      
      // Save with object streams for better compression
      const outBytes = await out.save({ useObjectStreams: true });
      
      const finalSize = outBytes.length;
      const reduction = ((originalSize - finalSize) / originalSize * 100).toFixed(1);
      const spacesSaved = originalSize - finalSize;
      
      console.log(`✅ COMPRESSION COMPLETE:`);
      console.log(`📊 ${originalSize} → ${finalSize} bytes`);
      console.log(`📉 Reduction: ${reduction}%`);
      console.log(`💾 Saved: ${spacesSaved} bytes`);
      
      return outBytes;
      
    } catch (error) {
      console.error('❌ Compression failed:', error);
      
      // If the advanced method fails, try a simpler approach
      console.log(`🔄 Trying fallback compression...`);
      return this.fallbackCompression(originalBuffer);
    }
  }

  /**
   * Fallback compression method if the main approach fails
   */
  private static async fallbackCompression(buffer: ArrayBuffer): Promise<Uint8Array> {
    try {
      const pdf = await PDFDocument.load(buffer);
      
      // Just clean metadata and save with compression
      pdf.setTitle('');
      pdf.setAuthor('');
      pdf.setSubject('');
      pdf.setKeywords([]);
      pdf.setCreator('');
      pdf.setProducer('Compressed');
      
      const result = await pdf.save({ useObjectStreams: true });
      
      console.log(`📊 Fallback compression: ${buffer.byteLength} → ${result.length} bytes`);
      return result;
      
    } catch (error) {
      console.error('❌ Fallback compression also failed:', error);
      // Return original if all else fails
      return new Uint8Array(buffer);
    }
  }

  /**
   * Alternative compression with different settings
   */
  static async compressPDFAlternative(file: File): Promise<Uint8Array> {
    const originalBuffer = await file.arrayBuffer();
    const originalSize = originalBuffer.byteLength;
    
    console.log(`🔄 ALTERNATIVE COMPRESSION: Testing different strategies`);
    
    try {
      const strategies = [
        {
          name: 'Document Rebuild',
          fn: () => this.compressPDF(file)
        },
        {
          name: 'Direct Optimization',
          fn: async () => {
            const pdf = await PDFDocument.load(originalBuffer);
            pdf.setProducer('');
            pdf.setCreator('');
            return await pdf.save({ useObjectStreams: true, addDefaultPage: false });
          }
        },
        {
          name: 'Multi-pass',
          fn: async () => {
            let current = originalBuffer;
            for (let i = 0; i < 3; i++) {
              const pdf = await PDFDocument.load(current);
              pdf.setProducer(`Pass${i}`);
              const result = await pdf.save({ useObjectStreams: true });
              if (result.length >= current.byteLength) break;
              current = (result.buffer as ArrayBuffer).slice(result.byteOffset, result.byteOffset + result.byteLength);
            }
            return new Uint8Array(current);
          }
        }
      ];
      
      let bestResult: Uint8Array = new Uint8Array(originalBuffer);
      let bestSize = originalSize;
      
      for (const strategy of strategies) {
        try {
          const result = await strategy.fn();
          const size = result.length;
          const reduction = ((originalSize - size) / originalSize * 100).toFixed(1);
          
          console.log(`📊 ${strategy.name}: ${size} bytes (${reduction}% reduction)`);
          
          if (size < bestSize) {
            bestResult = result;
            bestSize = size;
          }
        } catch (error) {
          console.log(`⚠️ ${strategy.name} failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      
      const finalReduction = ((originalSize - bestSize) / originalSize * 100).toFixed(1);
      console.log(`🏆 Best result: ${finalReduction}% reduction`);
      
      return bestResult;
      
    } catch (error) {
      console.error('❌ All compression strategies failed:', error);
      return new Uint8Array(originalBuffer);
    }
  }
}


