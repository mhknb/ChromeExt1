import DocxExporterEnhanced from './docx-exporter-enhanced.js';

class DocxConverterBundled {
  constructor() {
    this.mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    this.enhancedExporter = new DocxExporterEnhanced();
  }

  /**
   * Convert markdown to DOCX using enhanced exporter
   * @param {string} markdown - Markdown content (with LaTeX as $...$ or $...$)
   * @param {Object} options - Export options
   * @returns {Promise<Blob>} - DOCX blob
   */
  async convertMarkdownToDocx(markdown, options = {}) {
    try {
      // Use the enhanced exporter with all features
      const docxBlob = await this.enhancedExporter.convertMarkdownToDocx(markdown, options);
      return docxBlob;
    } catch (error) {
      console.error('[DocxConverterBundled] Conversion failed:', error);
      throw new Error('DOCX dönüşümü başarısız: ' + error.message);
    }
  }
}

// Export directly (not as default) for UMD
module.exports = DocxConverterBundled;

// Also assign to window for direct access
if (typeof window !== 'undefined') {
  window.DocxConverterBundled = DocxConverterBundled;
}
