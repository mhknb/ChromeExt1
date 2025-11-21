/**
 * PDF Converter Wrapper for Content Script
 * Bundles katex, jspdf, html2canvas, and marked for browser use
 */

import katex from 'katex';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import 'katex/dist/katex.min.css';

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
   * Export content as PDF using jsPDF native text API (text-based, not image)
   * @param {string} markdown - Markdown content with LaTeX formulas
   * @returns {Promise<void>}
   */
  async exportToPdf(markdown) {
    try {
      console.log('[PDF] Starting text-based PDF export');
      console.log('[PDF] Markdown length:', markdown.length);

      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Page settings
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Helper function to check if we need a new page
      const checkNewPage = (requiredSpace) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Helper function to process inline LaTeX and formatting
      const processInlineText = (text) => {
        // Replace inline math $...$ with placeholder
        return text.replace(/\$([^$\n]+)\$/g, (match, latex) => {
          return `[${latex}]`; // Show formula in brackets
        });
      };

      // Step 1: Process LaTeX formulas first
      let processedMarkdown = markdown;

      // Process block math ($$...$$)
      processedMarkdown = processedMarkdown.replace(/\$\$\n?([\s\S]*?)\n?\$\$/g, (match, latex) => {
        return `\n\n[BLOCK MATH: ${latex.trim()}]\n\n`;
      });

      // Step 2: Parse markdown into tokens
      console.log('[PDF] Parsing markdown');
      const tokens = marked.lexer(processedMarkdown);
      console.log('[PDF] Found', tokens.length, 'tokens');

      // Step 3: Render each token
      for (const token of tokens) {
        switch (token.type) {
          case 'heading':
            checkNewPage(15);
            yPosition += 5; // Extra space before heading

            // Set font size based on heading level
            const headingSizes = { 1: 18, 2: 14, 3: 12, 4: 11, 5: 10, 6: 10 };
            pdf.setFontSize(headingSizes[token.depth] || 12);
            pdf.setFont('helvetica', 'bold');

            const headingText = processInlineText(token.text);
            const headingLines = pdf.splitTextToSize(headingText, contentWidth);
            pdf.text(headingLines, margin, yPosition);
            yPosition += headingLines.length * 7;
            yPosition += 3; // Extra space after heading
            break;

          case 'paragraph':
            checkNewPage(10);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');

            const paraText = processInlineText(token.text);
            const paraLines = pdf.splitTextToSize(paraText, contentWidth);
            pdf.text(paraLines, margin, yPosition);
            yPosition += paraLines.length * 5;
            yPosition += 3;
            break;

          case 'code':
            checkNewPage(15);
            pdf.setFontSize(9);
            pdf.setFont('courier', 'normal');
            pdf.setFillColor(245, 245, 245);

            const codeLines = token.text.split('\n');
            const codeHeight = codeLines.length * 4.5 + 6;

            if (yPosition + codeHeight > pageHeight - margin) {
              pdf.addPage();
              yPosition = margin;
            }

            // Draw background
            pdf.rect(margin, yPosition - 3, contentWidth, codeHeight, 'F');

            // Draw code
            for (const line of codeLines) {
              pdf.text(line || ' ', margin + 2, yPosition);
              yPosition += 4.5;
            }
            yPosition += 6;
            break;

          case 'list':
            checkNewPage(10);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');

            for (let i = 0; i < token.items.length; i++) {
              const item = token.items[i];
              const bullet = token.ordered ? `${i + 1}. ` : '• ';
              const itemText = processInlineText(item.text);
              const itemLines = pdf.splitTextToSize(bullet + itemText, contentWidth - 5);

              checkNewPage(itemLines.length * 5);
              pdf.text(itemLines, margin + 5, yPosition);
              yPosition += itemLines.length * 5;
            }
            yPosition += 3;
            break;

          case 'blockquote':
            checkNewPage(10);
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(85, 85, 85);

            const quoteText = processInlineText(token.text);
            const quoteLines = pdf.splitTextToSize(quoteText, contentWidth - 8);

            // Draw left border
            pdf.setDrawColor(37, 99, 235);
            pdf.setLineWidth(1);
            pdf.line(margin, yPosition - 2, margin, yPosition + quoteLines.length * 5);

            pdf.text(quoteLines, margin + 5, yPosition);
            yPosition += quoteLines.length * 5;
            yPosition += 3;

            pdf.setTextColor(0, 0, 0); // Reset color
            break;

          case 'hr':
            checkNewPage(5);
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.5);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 5;
            break;

          case 'space':
            yPosition += 2;
            break;

          default:
            // For other token types, just add some space
            console.log('[PDF] Unhandled token type:', token.type);
            yPosition += 2;
        }
      }

      // Step 4: Save PDF
      const filename = `chatgpt-export-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);

      console.log('[PDF] Text-based PDF generated successfully');

    } catch (error) {
      console.error('[PDF] Export failed:', error);
      throw new Error(`PDF export başarısız: ${error.message}`);
    }
  }
}

// Export as global window object for content script
export default PdfConverterBundled;
