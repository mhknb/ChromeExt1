/**
 * PDF Converter Wrapper for Content Script
 * Uses pdfmake with html-to-pdfmake for vector-based PDF generation
 */

import katex from 'katex';
import pdfMake from 'pdfmake/build/pdfmake';
import { marked } from 'marked';
import htmlToPdfmake from 'html-to-pdfmake';

// Load fonts dynamically from CDN to avoid UTF-8 encoding issues
async function loadPdfFonts() {
  if (pdfMake.vfs) {
    return; // Already loaded
  }

  try {
    // Load fonts from CDN
    const response = await fetch('https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js');
    const fontsCode = await response.text();

    // Execute the fonts code to populate pdfMake.vfs
    // The CDN file defines pdfMake.vfs
    const script = document.createElement('script');
    script.textContent = fontsCode;
    document.head.appendChild(script);
    document.head.removeChild(script);

    console.log('[PDF] Fonts loaded from CDN');
  } catch (error) {
    console.warn('[PDF] Failed to load fonts from CDN, using default fonts:', error);
    // Fallback: use standard fonts without custom fonts
    pdfMake.fonts = {
      Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      },
      Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
      }
    };
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
   * Export content as PDF using pdfmake
   * @param {string} markdown - Markdown content with LaTeX formulas
   * @returns {Promise<void>}
   */
  async exportToPdf(markdown) {
    let tempElement = null;

    try {
      console.log('[PDF] Starting PDF export with pdfmake');
      console.log('[PDF] Markdown length:', markdown.length);

      // Step 0: Load fonts dynamically
      await loadPdfFonts();

      // Step 1: Convert markdown to HTML with KaTeX
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

      // CRITICAL FIX: Attach element to DOM before processing
      document.body.appendChild(tempElement);
      console.log('[PDF] Element attached to DOM');

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

      console.log('[PDF] HTML converted to pdfmake format');

      // Step 4: Create PDF document definition
      const docDefinition = {
        content: pdfContent,
        pageSize: 'A4',
        pageMargins: [40, 60, 40, 60],
        defaultStyle: {
          font: 'Roboto',
          fontSize: 12,
          lineHeight: 1.6
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

// Export the class
export default PdfConverterBundled;

// Manually assign to window to ensure it's available in content script context
if (typeof window !== 'undefined') {
  window.PdfConverterBundled = PdfConverterBundled;
}
