import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { toDocx } from '@m2d/core';
import { mathPlugin } from '@m2d/math';
import { tablePlugin } from '@m2d/table';

class DocxConverterBundled {
  constructor() {
    this.mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  /**
   * Convert markdown to DOCX using @m2d/core with math support
   * @param {string} markdown - Markdown content (with LaTeX as $...$ or $$...$$)
   * @returns {Promise<Blob>} - DOCX blob
   */
  async convertMarkdownToDocx(markdown) {
    try {
      // 1. Parse markdown to MDAST (Markdown Abstract Syntax Tree)
      const processor = unified()
        .use(remarkParse)      // Parse markdown
        .use(remarkGfm)        // GitHub Flavored Markdown (tables, strikethrough, etc.)
        .use(remarkMath);      // Math support ($...$ and $$...$$)

      const mdast = processor.parse(markdown);

      // Debug: Log MDAST to check math nodes
      console.log('Parsed MDAST:', JSON.stringify(mdast, null, 2));

      // 2. Convert MDAST to DOCX blob with math plugin
      // mathPlugin() converts LaTeX to Word native equation format
      const docxBlob = await toDocx(
        mdast,
        {
          // Document properties
          title: 'AI Export',
          description: 'Exported from AI Content Exporter',
          creator: 'AI Content Exporter'
        },
        {
          // Plugins for advanced features
          plugins: [
            mathPlugin(),    // LaTeX → Word MathRun (native equations)
            tablePlugin(),   // Enhanced table support
          ]
        },
        'blob'  // Output format: 'blob' for browser
      );

      return docxBlob;
    } catch (error) {
      console.error('@m2d/core conversion failed:', error);
      throw new Error('DOCX dönüşümü başarısız: ' + error.message);
    }
  }
}

// Export the class
export default DocxConverterBundled;

// Manually assign to window to ensure it's available in content script context
if (typeof window !== 'undefined') {
  window.DocxConverterBundled = DocxConverterBundled;
}
