import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { toDocx } from 'mdast2docx';

class DocxConverterBundled {
  constructor() {
    this.mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  /**
   * Convert markdown to DOCX using mdast2docx
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

      // 2. Transform math nodes to text nodes
      // mdast2docx doesn't support math nodes, so we convert them to text
      this.transformMathNodes(mdast);

      // 3. Convert MDAST to DOCX blob
      const docxBlob = await toDocx(
        mdast,
        {
          // Document properties
          title: 'AI Export',
          description: 'Exported from AI Content Exporter',
          creator: 'AI Content Exporter'
        },
        {
          // Section properties (optional)
          // page size, margins, etc.
        },
        'blob'  // Output format: 'blob' for browser
      );

      return docxBlob;
    } catch (error) {
      console.error('mdast2docx conversion failed:', error);
      throw new Error('DOCX dönüşümü başarısız: ' + error.message);
    }
  }

  /**
   * Transform math and inlineMath nodes to text nodes
   * This is necessary because mdast2docx doesn't support math nodes
   * @param {Object} node - MDAST node
   */
  transformMathNodes(node) {
    if (!node) return;

    // Handle math nodes (block equations $$...$$)
    if (node.type === 'math') {
      node.type = 'text';
      node.value = `$$${node.value}$$`;
      delete node.meta;
      return;
    }

    // Handle inlineMath nodes (inline equations $...$)
    if (node.type === 'inlineMath') {
      node.type = 'text';
      node.value = `$${node.value}$`;
      delete node.meta;
      return;
    }

    // Recursively process children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(child => this.transformMathNodes(child));
    }
  }
}

export default DocxConverterBundled;
