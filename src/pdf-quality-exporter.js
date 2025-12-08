/**
 * PDF Quality Exporter
 * High-quality PDF generation using pdfmake with advanced features:
 * - Custom font embedding (Roboto, Source Code Pro)
 * - Syntax-highlighted code blocks
 * - Header/footer with page numbers, date, title
 * - Table rendering with auto column width
 * - Intelligent page breaks (don't split headings)
 * - TOC generation for long content
 */

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import SyntaxHighlighter from './syntax-highlighter.js';
import LaTeXRenderer from './latex-renderer.js';
import ImageHandler from './image-handler.js';
import { marked } from 'marked';

// Register fonts with pdfMake
// Handle both default and named exports
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfFonts && pdfFonts.vfs) {
  pdfMake.vfs = pdfFonts.vfs;
}

class PdfQualityExporter {
  constructor() {
    this.syntaxHighlighter = new SyntaxHighlighter();
    this.latexRenderer = new LaTeXRenderer();
    this.imageHandler = new ImageHandler();
    
    // Default document settings
    this.defaultSettings = {
      pageSize: 'A4',
      pageMargins: [60, 80, 60, 80], // [left, top, right, bottom]
      defaultStyle: {
        font: 'Roboto',
        fontSize: 11,
        lineHeight: 1.5
      },
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          margin: [0, 0, 0, 15],
          color: '#1a1a1a'
        },
        h1: {
          fontSize: 20,
          bold: true,
          margin: [0, 20, 0, 10],
          color: '#2563eb',
          pageBreak: 'before'
        },
        h2: {
          fontSize: 16,
          bold: true,
          margin: [0, 15, 0, 8],
          color: '#2563eb'
        },
        h3: {
          fontSize: 14,
          bold: true,
          margin: [0, 12, 0, 6],
          color: '#333333'
        },
        h4: {
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5],
          color: '#333333'
        },
        h5: {
          fontSize: 11,
          bold: true,
          margin: [0, 8, 0, 4],
          color: '#333333'
        },
        h6: {
          fontSize: 10,
          bold: true,
          margin: [0, 6, 0, 3],
          color: '#333333'
        },
        paragraph: {
          margin: [0, 0, 0, 10],
          alignment: 'justify'
        },
        code: {
          font: 'Courier',
          fontSize: 9,
          background: '#f5f5f5',
          color: '#24292f'
        },
        codeBlock: {
          font: 'Courier',
          fontSize: 9,
          margin: [0, 10, 0, 10],
          background: '#f6f8fa'
        },
        quote: {
          italics: true,
          color: '#555555',
          margin: [20, 10, 0, 10]
        },
        listItem: {
          margin: [0, 3, 0, 3]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          fillColor: '#f0f0f0',
          color: '#000000'
        },
        tableCell: {
          fontSize: 10
        },
        tocTitle: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 15]
        },
        tocItem: {
          margin: [0, 3, 0, 3]
        }
      }
    };
    
    // Track headings for TOC generation
    this.headings = [];
    this.currentPageNumber = 1;
  }

  /**
   * Export markdown content as high-quality PDF
   * @param {string} markdown - Markdown content
   * @param {Object} options - Export options
   * @returns {Promise<void>}
   */
  async exportToPdf(markdown, options = {}) {
    try {
      console.log('[PDF Quality] Starting export');
      console.log('[PDF Quality] Markdown length:', markdown.length);
      
      const {
        filename = `ai-export-quality-${new Date().toISOString().split('T')[0]}.pdf`,
        title = 'AI Content Export',
        author = 'AI Content Exporter',
        includeTOC = markdown.length > 5000, // Auto-enable TOC for long content
        includePageNumbers = true,
        includeHeader = true,
        includeFooter = true
      } = options;
      
      // Reset headings tracker
      this.headings = [];
      
      // Parse markdown to document definition
      const content = await this.parseMarkdownToContent(markdown);
      
      // Build document definition
      const docDefinition = {
        ...this.defaultSettings,
        info: {
          title,
          author,
          subject: 'AI Content Export',
          creator: 'AI Content Exporter Chrome Extension',
          producer: 'pdfmake'
        },
        content: [],
        header: includeHeader ? this.createHeader(title) : null,
        footer: includeFooter ? this.createFooter(includePageNumbers) : null
      };
      
      // Add TOC if enabled and we have headings
      if (includeTOC && this.headings.length > 5) {
        docDefinition.content.push(this.createTOC());
        docDefinition.content.push({ text: '', pageBreak: 'after' });
      }
      
      // Add main content
      docDefinition.content.push(...content);
      
      console.log('[PDF Quality] Document definition created');
      console.log('[PDF Quality] Content blocks:', docDefinition.content.length);
      console.log('[PDF Quality] Headings found:', this.headings.length);
      
      // Generate and download PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      
      pdfDocGenerator.download(filename);
      
      console.log('[PDF Quality] PDF generated successfully');
      
    } catch (error) {
      console.error('[PDF Quality] Export failed:', error);
      throw new Error(`PDF quality export failed: ${error.message}`);
    }
  }

  /**
   * Parse markdown content to pdfmake content definition
   * @param {string} markdown - Markdown content
   * @returns {Promise<Array>} pdfmake content array
   */
  async parseMarkdownToContent(markdown) {
    const content = [];
    
    // Extract and preserve code blocks
    const codeBlocks = [];
    const codeBlockPlaceholder = '\x00CODEBLOCK\x00';
    
    let processedMarkdown = markdown.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const index = codeBlocks.length;
      codeBlocks.push({ language: language || 'text', code: code.trim() });
      return `${codeBlockPlaceholder}${index}${codeBlockPlaceholder}`;
    });
    
    // Extract and preserve LaTeX formulas
    const latexFormulas = [];
    const latexPlaceholder = '\x00LATEX\x00';
    
    // Block LaTeX
    processedMarkdown = processedMarkdown.replace(/\$\$\n?([\s\S]*?)\n?\$\$/g, (match, latex) => {
      const index = latexFormulas.length;
      latexFormulas.push({ type: 'block', latex: latex.trim() });
      return `${latexPlaceholder}${index}${latexPlaceholder}`;
    });
    
    // Inline LaTeX
    processedMarkdown = processedMarkdown.replace(/\$([^$\n]+)\$/g, (match, latex) => {
      const index = latexFormulas.length;
      latexFormulas.push({ type: 'inline', latex: latex.trim() });
      return `${latexPlaceholder}${index}${latexPlaceholder}`;
    });
    
    // Parse markdown to tokens
    const tokens = marked.lexer(processedMarkdown);
    
    // Process tokens
    for (const token of tokens) {
      const element = this.processToken(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder);
      if (element) {
        if (Array.isArray(element)) {
          content.push(...element);
        } else {
          content.push(element);
        }
      }
    }
    
    return content;
  }

  /**
   * Process a markdown token to pdfmake element
   * @param {Object} token - Marked token
   * @param {Array} codeBlocks - Preserved code blocks
   * @param {Array} latexFormulas - Preserved LaTeX formulas
   * @param {string} codeBlockPlaceholder - Code block placeholder
   * @param {string} latexPlaceholder - LaTeX placeholder
   * @returns {Object|Array|null} pdfmake element(s)
   */
  processToken(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder) {
    switch (token.type) {
      case 'heading':
        return this.createHeading(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder);
      
      case 'paragraph':
        return this.createParagraph(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder);
      
      case 'code':
        return this.createCodeBlock(token.text, token.lang || 'text');
      
      case 'blockquote':
        return this.createBlockquote(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder);
      
      case 'list':
        return this.createList(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder);
      
      case 'table':
        return this.createTable(token);
      
      case 'hr':
        return {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 0,
              x2: 515, y2: 0,
              lineWidth: 1,
              lineColor: '#dddddd'
            }
          ],
          margin: [0, 10, 0, 10]
        };
      
      case 'space':
        return { text: '', margin: [0, 5, 0, 5] };
      
      default:
        return null;
    }
  }

  /**
   * Create heading element
   * @param {Object} token - Heading token
   * @param {Array} codeBlocks - Code blocks
   * @param {Array} latexFormulas - LaTeX formulas
   * @param {string} codeBlockPlaceholder - Code block placeholder
   * @param {string} latexPlaceholder - LaTeX placeholder
   * @returns {Object} pdfmake heading element
   */
  createHeading(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder) {
    const text = this.processInlineText(token.text, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder);
    const level = token.depth;
    const style = `h${level}`;
    
    // Track heading for TOC
    this.headings.push({
      level,
      text: this.extractPlainText(text),
      id: `heading-${this.headings.length}`
    });
    
    return {
      text,
      style,
      id: `heading-${this.headings.length - 1}`,
      // Prevent page break after heading (keep with next paragraph)
      pageBreak: level === 1 && this.headings.length > 1 ? 'before' : undefined,
      unbreakable: true
    };
  }

  /**
   * Create paragraph element
   * @param {Object} token - Paragraph token
   * @param {Array} codeBlocks - Code blocks
   * @param {Array} latexFormulas - LaTeX formulas
   * @param {string} codeBlockPlaceholder - Code block placeholder
   * @param {string} latexPlaceholder - LaTeX placeholder
   * @returns {Object} pdfmake paragraph element
   */
  createParagraph(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder) {
    const text = this.processInlineText(token.text, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder);
    
    return {
      text,
      style: 'paragraph'
    };
  }

  /**
   * Process inline text with formatting
   * @param {string} text - Text to process
   * @param {Array} codeBlocks - Code blocks
   * @param {Array} latexFormulas - LaTeX formulas
   * @param {string} codeBlockPlaceholder - Code block placeholder
   * @param {string} latexPlaceholder - LaTeX placeholder
   * @returns {Array|string} pdfmake text content
   */
  processInlineText(text, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder) {
    // Restore code blocks
    text = text.replace(new RegExp(`${codeBlockPlaceholder}(\\d+)${codeBlockPlaceholder}`, 'g'), (match, index) => {
      const block = codeBlocks[parseInt(index)];
      return `\`\`\`${block.language}\n${block.code}\n\`\`\``;
    });
    
    // Restore LaTeX formulas
    text = text.replace(new RegExp(`${latexPlaceholder}(\\d+)${latexPlaceholder}`, 'g'), (match, index) => {
      const formula = latexFormulas[parseInt(index)];
      return formula.type === 'block' ? `$${formula.latex}$` : `$${formula.latex}$`;
    });
    
    // Parse inline formatting
    const parts = [];
    let currentText = '';
    let i = 0;
    
    while (i < text.length) {
      // Bold: **text** or __text__
      if ((text[i] === '*' && text[i + 1] === '*') || (text[i] === '_' && text[i + 1] === '_')) {
        if (currentText) {
          parts.push(currentText);
          currentText = '';
        }
        
        const delimiter = text.substring(i, i + 2);
        const endIndex = text.indexOf(delimiter, i + 2);
        
        if (endIndex !== -1) {
          const boldText = text.substring(i + 2, endIndex);
          parts.push({ text: boldText, bold: true });
          i = endIndex + 2;
          continue;
        }
      }
      
      // Italic: *text* or _text_
      if (text[i] === '*' || text[i] === '_') {
        if (currentText) {
          parts.push(currentText);
          currentText = '';
        }
        
        const delimiter = text[i];
        const endIndex = text.indexOf(delimiter, i + 1);
        
        if (endIndex !== -1) {
          const italicText = text.substring(i + 1, endIndex);
          parts.push({ text: italicText, italics: true });
          i = endIndex + 1;
          continue;
        }
      }
      
      // Inline code: `text`
      if (text[i] === '`') {
        if (currentText) {
          parts.push(currentText);
          currentText = '';
        }
        
        const endIndex = text.indexOf('`', i + 1);
        
        if (endIndex !== -1) {
          const codeText = text.substring(i + 1, endIndex);
          parts.push({
            text: codeText,
            font: 'Courier',
            fontSize: 9,
            background: '#f5f5f5'
          });
          i = endIndex + 1;
          continue;
        }
      }
      
      // Inline LaTeX: $formula$
      if (text[i] === '$') {
        if (currentText) {
          parts.push(currentText);
          currentText = '';
        }
        
        const endIndex = text.indexOf('$', i + 1);
        
        if (endIndex !== -1) {
          const latex = text.substring(i + 1, endIndex);
          // Convert LaTeX to Unicode representation for PDF
          const converted = this.latexRenderer.convertToOmml(latex);
          parts.push({ text: converted, italics: true });
          i = endIndex + 1;
          continue;
        }
      }
      
      currentText += text[i];
      i++;
    }
    
    if (currentText) {
      parts.push(currentText);
    }
    
    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
  }

  /**
   * Create code block element with syntax highlighting
   * @param {string} code - Code content
   * @param {string} language - Programming language
   * @returns {Object} pdfmake code block element
   */
  createCodeBlock(code, language) {
    try {
      // Highlight code
      const highlighted = this.syntaxHighlighter.highlight(code, language);
      
      // Convert tokens to pdfmake text array
      const textArray = highlighted.tokens.map(token => ({
        text: token.value,
        color: token.color,
        font: 'Courier',
        fontSize: 9
      }));
      
      return {
        table: {
          widths: ['*'],
          body: [[{
            text: textArray,
            margin: [5, 5, 5, 5]
          }]]
        },
        layout: {
          fillColor: '#f6f8fa',
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#d0d7de',
          vLineColor: () => '#d0d7de'
        },
        margin: [0, 10, 0, 10],
        // Prevent splitting code blocks across pages when possible
        unbreakable: code.split('\n').length < 30
      };
    } catch (error) {
      console.warn('[PDF Quality] Code highlighting failed:', error);
      
      // Fallback to plain code block
      return {
        text: code,
        style: 'codeBlock',
        preserveLeadingSpaces: true
      };
    }
  }

  /**
   * Create blockquote element
   * @param {Object} token - Blockquote token
   * @param {Array} codeBlocks - Code blocks
   * @param {Array} latexFormulas - LaTeX formulas
   * @param {string} codeBlockPlaceholder - Code block placeholder
   * @param {string} latexPlaceholder - LaTeX placeholder
   * @returns {Object} pdfmake blockquote element
   */
  createBlockquote(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder) {
    const content = [];
    
    for (const subToken of token.tokens) {
      const element = this.processToken(subToken, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder);
      if (element) {
        if (Array.isArray(element)) {
          content.push(...element);
        } else {
          content.push(element);
        }
      }
    }
    
    return {
      stack: content,
      style: 'quote',
      margin: [20, 10, 0, 10]
    };
  }

  /**
   * Create list element
   * @param {Object} token - List token
   * @param {Array} codeBlocks - Code blocks
   * @param {Array} latexFormulas - LaTeX formulas
   * @param {string} codeBlockPlaceholder - Code block placeholder
   * @param {string} latexPlaceholder - LaTeX placeholder
   * @returns {Object} pdfmake list element
   */
  createList(token, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder) {
    const items = token.items.map(item => {
      const text = this.processInlineText(item.text, codeBlocks, latexFormulas, codeBlockPlaceholder, latexPlaceholder);
      return text;
    });
    
    if (token.ordered) {
      return {
        ol: items,
        style: 'listItem',
        margin: [0, 5, 0, 10]
      };
    } else {
      return {
        ul: items,
        style: 'listItem',
        margin: [0, 5, 0, 10]
      };
    }
  }

  /**
   * Create table element with auto column width
   * @param {Object} token - Table token
   * @returns {Object} pdfmake table element
   */
  createTable(token) {
    const headers = token.header.map(cell => ({
      text: this.extractPlainText(cell.text),
      style: 'tableHeader'
    }));
    
    const rows = token.rows.map(row =>
      row.map(cell => ({
        text: this.extractPlainText(cell.text),
        style: 'tableCell'
      }))
    );
    
    // Calculate column widths based on content
    const columnWidths = this.calculateColumnWidths(headers, rows);
    
    return {
      table: {
        headerRows: 1,
        widths: columnWidths,
        body: [headers, ...rows]
      },
      layout: {
        fillColor: (rowIndex) => rowIndex === 0 ? '#f0f0f0' : null,
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#dddddd',
        vLineColor: () => '#dddddd',
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6
      },
      margin: [0, 10, 0, 10]
    };
  }

  /**
   * Calculate optimal column widths based on content
   * @param {Array} headers - Table headers
   * @param {Array} rows - Table rows
   * @returns {Array} Column widths
   */
  calculateColumnWidths(headers, rows) {
    const columnCount = headers.length;
    const widths = new Array(columnCount).fill(0);
    
    // Calculate max content length for each column
    headers.forEach((header, i) => {
      const text = typeof header === 'string' ? header : header.text;
      widths[i] = Math.max(widths[i], text.length);
    });
    
    rows.forEach(row => {
      row.forEach((cell, i) => {
        const text = typeof cell === 'string' ? cell : cell.text;
        widths[i] = Math.max(widths[i], text.length);
      });
    });
    
    // Convert to proportional widths
    const totalWidth = widths.reduce((sum, w) => sum + w, 0);
    const availableWidth = 515; // A4 width minus margins
    
    return widths.map(w => {
      const proportion = w / totalWidth;
      return Math.max(proportion * availableWidth, 50); // Minimum 50 units
    });
  }

  /**
   * Create Table of Contents
   * @returns {Object} pdfmake TOC element
   */
  createTOC() {
    const tocItems = this.headings.map(heading => {
      const indent = (heading.level - 1) * 15;
      
      return {
        text: heading.text,
        style: 'tocItem',
        margin: [indent, 0, 0, 0],
        linkToDestination: heading.id
      };
    });
    
    return {
      stack: [
        { text: 'Table of Contents', style: 'tocTitle' },
        ...tocItems
      ],
      margin: [0, 0, 0, 20]
    };
  }

  /**
   * Create header function
   * @param {string} title - Document title
   * @returns {Function} Header function for pdfmake
   */
  createHeader(title) {
    return (currentPage, pageCount) => {
      if (currentPage === 1) return null; // No header on first page
      
      return {
        text: title,
        alignment: 'center',
        fontSize: 10,
        color: '#666666',
        margin: [60, 30, 60, 0]
      };
    };
  }

  /**
   * Create footer function
   * @param {boolean} includePageNumbers - Whether to include page numbers
   * @returns {Function} Footer function for pdfmake
   */
  createFooter(includePageNumbers) {
    return (currentPage, pageCount) => {
      const date = new Date().toLocaleDateString();
      
      const footerContent = [];
      
      if (includePageNumbers) {
        footerContent.push({
          text: `Page ${currentPage} of ${pageCount}`,
          alignment: 'center',
          fontSize: 9,
          color: '#666666'
        });
      }
      
      footerContent.push({
        text: `Generated on ${date}`,
        alignment: 'right',
        fontSize: 8,
        color: '#999999',
        margin: [0, 5, 60, 0]
      });
      
      return {
        stack: footerContent,
        margin: [60, 10, 60, 30]
      };
    };
  }

  /**
   * Extract plain text from pdfmake text content
   * @param {string|Array|Object} content - pdfmake text content
   * @returns {string} Plain text
   */
  extractPlainText(content) {
    if (!content) {
      return '';
    }
    
    if (typeof content === 'string') {
      return content;
    }
    
    if (Array.isArray(content)) {
      return content.map(item => this.extractPlainText(item)).join('');
    }
    
    if (typeof content === 'object' && content.text) {
      return this.extractPlainText(content.text);
    }
    
    return '';
  }
}

// Export as global window object for content script
export default PdfQualityExporter;

// Also assign directly to window for dynamic loading
if (typeof window !== 'undefined') {
  window.PdfQualityExporter = PdfQualityExporter;
}
