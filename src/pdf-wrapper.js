/**
 * PDF Converter Wrapper for Content Script
 * Bundles katex, html2pdf.js, and marked for browser use
 */

import katex from 'katex';
import html2pdf from 'html2pdf.js';
import { marked } from 'marked';
// Note: KaTeX CSS is not imported here to keep bundle size small
// KaTeX injects its own styles at runtime

// Inject KaTeX CSS if not already loaded
function injectKatexCSS() {
  if (!document.getElementById('katex-css')) {
    const link = document.createElement('link');
    link.id = 'katex-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  }
}

class PdfConverterBundled {
  /**
   * Convert Markdown to HTML with KaTeX-rendered formulas
   * @param {string} markdown - Markdown content with LaTeX formulas
   * @returns {Promise<string>} - HTML string with rendered KaTeX formulas
   */
  async markdownToHtmlWithKatex(markdown) {
    let html = markdown;

    console.log('[PDF] Processing markdown with LaTeX formulas');
    console.log('[PDF] Input length:', markdown.length);

    // Step 1: Process block math ($$...$$)
    html = html.replace(/\$\$\n?([\s\S]*?)\n?\$\$/g, (match, latex) => {
      try {
        const rendered = katex.renderToString(latex.trim(), {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
        console.log('[PDF] Rendered block math:', latex.substring(0, 50));
        return `<div class="math-block">${rendered}</div>`;
      } catch (error) {
        console.warn('[PDF] KaTeX block error:', error, 'LaTeX:', latex);
        return `<div class="math-block-error"><code>${latex}</code></div>`;
      }
    });

    // Step 2: Process inline math ($...$)
    html = html.replace(/\$([^$\n]+)\$/g, (match, latex) => {
      try {
        const rendered = katex.renderToString(latex, {
          displayMode: false,
          throwOnError: false,
          strict: false,
        });
        console.log('[PDF] Rendered inline math:', latex.substring(0, 30));
        return `<span class="math-inline">${rendered}</span>`;
      } catch (error) {
        console.warn('[PDF] KaTeX inline error:', error, 'LaTeX:', latex);
        return `<code>${latex}</code>`;
      }
    });

    // Step 3: Convert remaining markdown to HTML
    console.log('[PDF] Converting markdown to HTML with marked');
    html = marked(html);

    console.log('[PDF] HTML conversion complete, length:', html.length);
    return html;
  }

  /**
   * Export content as PDF using html2pdf.js
   * @param {string} markdown - Markdown content with LaTeX formulas
   * @returns {Promise<void>}
   */
  async exportToPdf(markdown) {
    try {
      console.log('[PDF] Starting PDF export');
      console.log('[PDF] Markdown length:', markdown.length);

      // Inject KaTeX CSS
      injectKatexCSS();

      // Step 1: Convert markdown to HTML with KaTeX
      const htmlContent = await this.markdownToHtmlWithKatex(markdown);

      // Step 2: Create styled container
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      element.id = 'pdf-export-content';

      // Apply comprehensive styles
      element.style.cssText = `
        padding: 30px;
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        font-size: 12pt;
        line-height: 1.8;
        color: #333;
        background: white;
        max-width: 100%;
        box-sizing: border-box;
      `;

      // Step 3: Inject styles for better PDF rendering
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
        #pdf-export-content pre {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
          margin: 15px 0;
        }
        #pdf-export-content pre code {
          background: none;
          padding: 0;
        }
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

      document.head.appendChild(styleEl);

      // Step 4: Configure html2pdf options
      const options = {
        margin: [15, 15, 15, 15],
        filename: `chatgpt-export-${new Date().toISOString().split('T')[0]}.pdf`,
        enableLinks: false,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
          putOnlyUsedFonts: false,
          userUnit: 1.0
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      console.log('[PDF] Starting html2pdf conversion');

      // Step 5: Generate and download PDF
      await html2pdf().set(options).from(element).toPdf().save();

      console.log('[PDF] PDF generated successfully');

      // Step 6: Cleanup
      document.head.removeChild(styleEl);

    } catch (error) {
      console.error('[PDF] Export failed:', error);
      throw new Error(`PDF export başarısız: ${error.message}`);
    }
  }
}

// Export as global window object for content script
// Explicitly assign to window to ensure availability
if (typeof window !== 'undefined') {
  window.PdfConverterBundled = PdfConverterBundled;
  console.log('[PDF Wrapper] PdfConverterBundled assigned to window');
}

export default PdfConverterBundled;
