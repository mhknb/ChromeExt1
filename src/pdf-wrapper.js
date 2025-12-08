/**
 * PDF Converter Wrapper for Content Script
 * Bundles katex, html2pdf.js, and marked for browser use
 * Enhanced with SyntaxHighlighter and LaTeXRenderer integration
 */

import katex from 'katex';
import html2pdf from 'html2pdf.js';
import { marked } from 'marked';
import 'katex/dist/katex.min.css';
import SyntaxHighlighter from './syntax-highlighter.js';
import LaTeXRenderer from './latex-renderer.js';
import ImageHandler from './image-handler.js';

class PdfConverterBundled {
  constructor() {
    // Initialize syntax highlighter and LaTeX renderer
    this.syntaxHighlighter = new SyntaxHighlighter();
    this.latexRenderer = new LaTeXRenderer();
    this.imageHandler = new ImageHandler();
  }

  /**
   * Convert Markdown to HTML with KaTeX-rendered formulas and syntax highlighting
   * Enhanced version with integrated SyntaxHighlighter and LaTeXRenderer
   * @param {string} markdown - Markdown content with LaTeX formulas
   * @returns {Promise<string>} - HTML string with rendered KaTeX formulas and highlighted code
   */
  async markdownToHtmlWithKatex(markdown, katex, marked) {
    let html = markdown;

    console.log('[PDF] Processing markdown with LaTeX formulas and code blocks');
    console.log('[PDF] Input length:', markdown.length);

    // Step 1: Extract and preserve code blocks to prevent LaTeX processing inside them
    const codeBlocks = [];
    const codeBlockPlaceholder = '\x00CODEBLOCK\x00';
    
    // Match fenced code blocks with optional language
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, language, code) => {
      const index = codeBlocks.length;
      codeBlocks.push({ language: language || 'text', code: code.trim() });
      return `${codeBlockPlaceholder}${index}${codeBlockPlaceholder}`;
    });

    // Step 2: Process block math ($...$) using LaTeXRenderer
    html = html.replace(/\$\$\n?([\s\S]*?)\n?\$\$/g, (match, latex) => {
      try {
        const rendered = this.latexRenderer.renderToHtml(latex.trim(), true);
        console.log('[PDF] Rendered block math:', latex.substring(0, 50));
        return `<div class="math-block">${rendered}</div>`;
      } catch (error) {
        console.warn('[PDF] LaTeX block error:', error, 'LaTeX:', latex);
        return `<div class="math-block-error"><code>${this.escapeHtml(latex)}</code></div>`;
      }
    });

    // Step 3: Process inline math ($...$) using LaTeXRenderer
    html = html.replace(/\$([^$\n]+)\$/g, (match, latex) => {
      try {
        const rendered = this.latexRenderer.renderToHtml(latex, false);
        console.log('[PDF] Rendered inline math:', latex.substring(0, 30));
        return `<span class="math-inline">${rendered}</span>`;
      } catch (error) {
        console.warn('[PDF] LaTeX inline error:', error, 'LaTeX:', latex);
        return `<code>${this.escapeHtml(latex)}</code>`;
      }
    });

    // Step 4: Convert remaining markdown to HTML
    console.log('[PDF] Converting markdown to HTML with marked');
    html = marked.parse(html);

    // Step 5: Restore code blocks with syntax highlighting
    html = html.replace(new RegExp(`${codeBlockPlaceholder}(\\d+)${codeBlockPlaceholder}`, 'g'), (match, index) => {
      const block = codeBlocks[parseInt(index)];
      
      try {
        // Use SyntaxHighlighter to highlight the code
        const highlighted = this.syntaxHighlighter.highlight(block.code, block.language);
        
        console.log('[PDF] Highlighted code block:', block.language);
        
        // Wrap in pre/code with syntax highlighting
        return `<pre class="code-block"><code class="language-${highlighted.language}">${highlighted.html}</code></pre>`;
      } catch (error) {
        console.warn('[PDF] Syntax highlighting error:', error);
        // Fallback to plain code block
        return `<pre class="code-block"><code class="language-${block.language}">${this.escapeHtml(block.code)}</code></pre>`;
      }
    });

    console.log('[PDF] HTML conversion complete, length:', html.length);
    return html;
  }

  /**
   * Escape HTML special characters
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    
    return text.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Export content as PDF using html2pdf.js
   * Enhanced with better styling for code blocks and formulas
   * @param {string} markdown - Markdown content with LaTeX formulas
   * @returns {Promise<void>}
   */
  async exportToPdf(markdown) {
    let tempElement = null;

    try {
      console.log('[PDF] Starting PDF export with pdfmake');
      console.log('[PDF] Markdown length:', markdown.length);

      // Step 1: Convert markdown to HTML with KaTeX and syntax highlighting
      const htmlContent = await this.markdownToHtmlWithKatex(markdown);

      // Step 2: Create styled container and attach to DOM (required for html-to-pdfmake)
      tempElement = document.createElement('div');
      tempElement.innerHTML = htmlContent;
      tempElement.id = 'pdf-export-content';

      // Apply styles
      tempElement.style.cssText = `
        position: absolute;
        left: -9999px;
        top: -9999px;
        width: 210mm;
        padding: 20px;
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #333;
        background: white;
      `;

      // Step 3: Inject enhanced styles for better PDF rendering
      const styleEl = document.createElement('style');
      styleEl.id = 'pdf-export-styles';
      styleEl.textContent = `
        #pdf-export-content h1 {
          font-size: 24pt;
          margin-top: 20px;
          margin-bottom: 15px;
          font-weight: bold;
          color: #1a1a1a;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 10px;
        }
        #pdf-export-content h2 {
          font-size: 18pt;
          margin-top: 18px;
          margin-bottom: 12px;
          font-weight: bold;
          color: #2563eb;
        }
        #pdf-export-content h3 {
          font-size: 14pt;
          margin-top: 15px;
          margin-bottom: 10px;
          font-weight: bold;
          color: #333;
        }
        #pdf-export-content p {
          margin-bottom: 12px;
          text-align: justify;
        }
        #pdf-export-content strong {
          font-weight: bold;
        }
        #pdf-export-content em {
          font-style: italic;
        }
        #pdf-export-content ul, #pdf-export-content ol {
          margin-left: 30px;
          margin-bottom: 12px;
        }
        #pdf-export-content li {
          margin-bottom: 6px;
        }
        #pdf-export-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        #pdf-export-content th {
          background: #f0f0f0;
          padding: 10px;
          border: 1px solid #ddd;
          font-weight: bold;
          text-align: left;
        }
        #pdf-export-content td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        #pdf-export-content code {
          background: #f5f5f5;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', 'Monaco', monospace;
          font-size: 11pt;
        }
        /* Enhanced code block styling with syntax highlighting support */
        #pdf-export-content pre.code-block {
          background: #f6f8fa;
          padding: 16px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 16px 0;
          border: 1px solid #d0d7de;
          line-height: 1.5;
        }
        #pdf-export-content pre.code-block code {
          background: none;
          padding: 0;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 10pt;
          color: #24292f;
          display: block;
        }
        /* Syntax highlighting token colors */
        #pdf-export-content .hljs-keyword { color: #CF222E; font-weight: bold; }
        #pdf-export-content .hljs-built_in { color: #8250DF; }
        #pdf-export-content .hljs-type { color: #0550AE; }
        #pdf-export-content .hljs-literal { color: #0A3069; }
        #pdf-export-content .hljs-number { color: #0550AE; }
        #pdf-export-content .hljs-operator { color: #CF222E; }
        #pdf-export-content .hljs-punctuation { color: #24292F; }
        #pdf-export-content .hljs-property { color: #8250DF; }
        #pdf-export-content .hljs-regexp { color: #116329; }
        #pdf-export-content .hljs-string { color: #0A3069; }
        #pdf-export-content .hljs-char.escape { color: #0A3069; }
        #pdf-export-content .hljs-subst { color: #24292F; }
        #pdf-export-content .hljs-symbol { color: #8250DF; }
        #pdf-export-content .hljs-variable { color: #953800; }
        #pdf-export-content .hljs-variable.language { color: #953800; }
        #pdf-export-content .hljs-variable.constant { color: #0550AE; }
        #pdf-export-content .hljs-title { color: #8250DF; }
        #pdf-export-content .hljs-title.class { color: #8250DF; }
        #pdf-export-content .hljs-title.class.inherited { color: #8250DF; }
        #pdf-export-content .hljs-title.function { color: #8250DF; }
        #pdf-export-content .hljs-params { color: #24292F; }
        #pdf-export-content .hljs-comment { color: #6E7781; font-style: italic; }
        #pdf-export-content .hljs-doctag { color: #6E7781; }
        #pdf-export-content .hljs-meta { color: #6E7781; }
        #pdf-export-content .hljs-meta.prompt { color: #6E7781; }
        #pdf-export-content .hljs-meta-keyword { color: #CF222E; }
        #pdf-export-content .hljs-meta-string { color: #0A3069; }
        #pdf-export-content .hljs-section { color: #0550AE; }
        #pdf-export-content .hljs-tag { color: #116329; }
        #pdf-export-content .hljs-name { color: #116329; }
        #pdf-export-content .hljs-attr { color: #0550AE; }
        #pdf-export-content .hljs-attribute { color: #0550AE; }
        #pdf-export-content .hljs-bullet { color: #953800; }
        #pdf-export-content .hljs-code { color: #24292F; }
        #pdf-export-content .hljs-emphasis { font-style: italic; }
        #pdf-export-content .hljs-strong { font-weight: bold; }
        #pdf-export-content .hljs-formula { color: #0550AE; }
        #pdf-export-content .hljs-link { color: #0969DA; text-decoration: underline; }
        #pdf-export-content .hljs-quote { color: #6E7781; }
        #pdf-export-content .hljs-selector-tag { color: #116329; }
        #pdf-export-content .hljs-selector-id { color: #8250DF; }
        #pdf-export-content .hljs-selector-class { color: #8250DF; }
        #pdf-export-content .hljs-selector-attr { color: #0550AE; }
        #pdf-export-content .hljs-selector-pseudo { color: #8250DF; }
        #pdf-export-content .hljs-template-tag { color: #CF222E; }
        #pdf-export-content .hljs-template-variable { color: #953800; }
        #pdf-export-content .hljs-addition { color: #116329; background: #dafbe1; }
        #pdf-export-content .hljs-deletion { color: #CF222E; background: #ffebe9; }
        /* Math block styling */
        #pdf-export-content .math-block {
          display: flex;
          justify-content: center;
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 4px;
        }
        #pdf-export-content .math-inline {
          display: inline;
          margin: 0 2px;
        }
        #pdf-export-content .math-block-error {
          color: #d32f2f;
          background: #ffebee;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
          font-family: monospace;
        }
        #pdf-export-content blockquote {
          border-left: 4px solid #2563eb;
          padding-left: 15px;
          margin: 15px 0;
          color: #555;
          font-style: italic;
        }
        #pdf-export-content hr {
          border: none;
          border-top: 2px solid #ddd;
          margin: 20px 0;
        }
        /* KaTeX styling overrides for better PDF rendering */
        #pdf-export-content .katex {
          font-size: 1.1em;
        }
        #pdf-export-content .katex-display {
          margin: 1em 0;
        }
      `;

      // Step 3: Convert HTML to pdfmake format
      const pdfContent = htmlToPdfmake(tempElement.innerHTML, {
        defaultStyles: {
          h1: { fontSize: 24, bold: true, margin: [0, 20, 0, 15], color: '#1a1a1a' },
          h2: { fontSize: 18, bold: true, margin: [0, 18, 0, 12], color: '#2563eb' },
          h3: { fontSize: 14, bold: true, margin: [0, 15, 0, 10], color: '#333' },
          p: { fontSize: 12, margin: [0, 0, 0, 12], alignment: 'justify' },
          strong: { bold: true },
          em: { italics: true },
          code: {
            font: 'Courier',
            fontSize: 11,
            background: '#f5f5f5'
          },
          pre: {
            font: 'Courier',
            fontSize: 10,
            margin: [0, 15, 0, 15],
            background: '#f5f5f5'
          },
          ul: { margin: [0, 0, 0, 12] },
          ol: { margin: [0, 0, 0, 12] },
          li: { margin: [0, 0, 0, 6] },
          table: { margin: [0, 15, 0, 15] },
          th: {
            bold: true,
            fillColor: '#f0f0f0',
            margin: [0, 5, 0, 5]
          },
          td: { margin: [0, 5, 0, 5] },
          blockquote: {
            margin: [15, 15, 0, 15],
            italics: true,
            color: '#555'
          }
        }
      });

      // Step 4: Configure html2pdf options with performance optimization
      const options = {
        margin: [15, 15, 15, 15],
        filename: `ai-export-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          letterRendering: true,
        },
        styles: {
          header: {
            fontSize: 24,
            bold: true,
            margin: [0, 0, 0, 20]
          },
          subheader: {
            fontSize: 18,
            bold: true,
            margin: [0, 10, 0, 10]
          },
          code: {
            font: 'Courier',
            background: '#f5f5f5'
          }
        },
        info: {
          title: `ChatGPT Export ${new Date().toLocaleDateString()}`,
          author: 'ChatGPT Chrome Extension',
          subject: 'Conversation Export',
          creator: 'ChatGPT Export Extension'
        },
        compress: true
      };

      console.log('[PDF] Generating PDF with pdfmake');

      // Step 5: Generate and download PDF
      const fileName = `chatgpt-export-${new Date().toISOString().split('T')[0]}.pdf`;
      pdfMake.createPdf(docDefinition).download(fileName);

      console.log('[PDF] PDF generated successfully');

    } catch (error) {
      console.error('[PDF] Export failed:', error);
      throw new Error(`PDF export başarısız: ${error.message}`);
    } finally {
      // Step 6: Cleanup - remove temporary element from DOM
      if (tempElement && tempElement.parentNode) {
        document.body.removeChild(tempElement);
        console.log('[PDF] Temporary element removed from DOM');
      }
    }
  }
}

// Export directly (not as default) for UMD
module.exports = PdfConverterBundled;

// Also assign directly to window for dynamic loading
if (typeof window !== 'undefined') {
  window.PdfConverterBundled = PdfConverterBundled;
}
