/**
 * PDF Converter Wrapper for Content Script
 * Bundles katex, jspdf, html2canvas, and marked for browser use
 */

import katex from 'katex';
import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import { notoSerifRegularBase64, notoSerifBoldBase64 } from './fonts/noto-serif-font.js';
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

      // Add Noto Serif font for full Unicode support (Turkish, Greek, Math symbols, etc.)
      pdf.addFileToVFS('NotoSerif-Regular.ttf', notoSerifRegularBase64);
      pdf.addFileToVFS('NotoSerif-Bold.ttf', notoSerifBoldBase64);
      pdf.addFont('NotoSerif-Regular.ttf', 'NotoSerif', 'normal');
      pdf.addFont('NotoSerif-Bold.ttf', 'NotoSerif', 'bold');
      pdf.setFont('NotoSerif');

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
      const processInlineText = (text, keepBold = false) => {
        if (!text) return '';

        // Store bold sections if needed
        let boldMarkers = [];
        if (keepBold) {
          // Find all bold sections and their positions
          let boldPattern = /\*\*(.+?)\*\*/g;
          let match;
          while ((match = boldPattern.exec(text)) !== null) {
            boldMarkers.push({ start: match.index, end: boldPattern.lastIndex, text: match[1] });
          }
        }

        // First, replace inline math $...$ with styled brackets
        // Using unicode mathematical characters for better readability
        text = text.replace(/\$([^$\n]+)\$/g, (match, latex) => {
          // Clean up common LaTeX commands for better display
          let cleanLatex = latex
            .replace(/\\epsilon/g, 'ε')
            .replace(/\\delta/g, 'δ')
            .replace(/\\alpha/g, 'α')
            .replace(/\\beta/g, 'β')
            .replace(/\\gamma/g, 'γ')
            .replace(/\\pi/g, 'π')
            .replace(/\\sigma/g, 'σ')
            .replace(/\\theta/g, 'θ')
            .replace(/\\lambda/g, 'λ')
            .replace(/\\mu/g, 'μ')
            .replace(/\\sum/g, '∑')
            .replace(/\\int/g, '∫')
            .replace(/\\infty/g, '∞')
            .replace(/\\leq/g, '≤')
            .replace(/\\geq/g, '≥')
            .replace(/\\neq/g, '≠')
            .replace(/\\approx/g, '≈')
            .replace(/\\times/g, '×')
            .replace(/\\div/g, '÷')
            .replace(/\\pm/g, '±')
            .replace(/\\sqrt/g, '√')
            .replace(/\\cdot/g, '·')
            .replace(/\\_/g, '_')
            .replace(/\\\\/g, ' ');

          return `【${cleanLatex}】`; // Using special brackets for formulas
        });

        // Remove markdown formatting but keep the text
        text = text.replace(/\*\*\*(.+?)\*\*\*/g, '$1'); // Bold italic
        text = text.replace(/\*\*(.+?)\*\*/g, '$1'); // Bold
        text = text.replace(/\*(.+?)\*/g, '$1'); // Italic
        text = text.replace(/___(.+?)___/g, '$1'); // Bold italic
        text = text.replace(/__(.+?)__/g, '$1'); // Bold
        text = text.replace(/_(.+?)_/g, '$1'); // Italic
        text = text.replace(/~~(.+?)~~/g, '$1'); // Strikethrough
        text = text.replace(/`([^`]+)`/g, '$1'); // Inline code
        text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // Links [text](url) → text

        return text;
      };

      // Step 1: Process LaTeX formulas - keep them for special rendering
      let processedMarkdown = markdown;

      // Step 2: Parse markdown into tokens
      console.log('[PDF] Parsing markdown');
      const tokens = marked.lexer(processedMarkdown);
      console.log('[PDF] Found', tokens.length, 'tokens');

      // Helper to extract plain text from tokens
      const extractText = (token) => {
        if (typeof token === 'string') return token;

        // If token has text property, use it
        if (token.text) return processInlineText(token.text);

        // If token has tokens (nested), recursively extract
        if (token.tokens && Array.isArray(token.tokens)) {
          return token.tokens.map(t => extractText(t)).join('');
        }

        return '';
      };

      // Step 3: Render each token
      for (const token of tokens) {
        switch (token.type) {
          case 'heading':
            checkNewPage(15);
            yPosition += 5; // Extra space before heading

            // Set font size based on heading level
            const headingSizes = { 1: 18, 2: 14, 3: 12, 4: 11, 5: 10, 6: 10 };
            pdf.setFontSize(headingSizes[token.depth] || 12);
            pdf.setFont('NotoSerif', 'bold');

            const headingText = extractText(token);
            const headingLines = pdf.splitTextToSize(headingText, contentWidth);
            pdf.text(headingLines, margin, yPosition);
            yPosition += headingLines.length * 7;
            yPosition += 3; // Extra space after heading
            break;

          case 'paragraph':
            checkNewPage(10);
            pdf.setFontSize(11);
            pdf.setFont('NotoSerif', 'normal');

            const paraText = extractText(token);
            const paraLines = pdf.splitTextToSize(paraText, contentWidth);
            pdf.text(paraLines, margin, yPosition);
            yPosition += paraLines.length * 5;
            yPosition += 3;
            break;

          case 'code':
            checkNewPage(15);

            // Check if this is a math block (starts with $$ or has math lang)
            const isMathBlock = token.lang === 'math' ||
                                token.text.trim().startsWith('$$') ||
                                (token.text.includes('\\int') || token.text.includes('\\sum') ||
                                 token.text.includes('\\frac') || token.text.includes('\\epsilon'));

            if (isMathBlock) {
              // Render math blocks with special styling
              pdf.setFontSize(10);
              pdf.setFont('NotoSerif', 'normal');
              pdf.setFillColor(249, 250, 251);
              pdf.setDrawColor(220, 220, 220);

              let mathText = token.text.trim();
              // Remove surrounding $$ if present
              mathText = mathText.replace(/^\$\$\s*/, '').replace(/\s*\$\$$/, '');

              const mathLines = pdf.splitTextToSize(mathText, contentWidth - 20);
              const mathHeight = mathLines.length * 6 + 12;

              if (yPosition + mathHeight > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
              }

              // Draw rounded background box
              pdf.setLineWidth(0.5);
              pdf.rect(margin + 10, yPosition - 3, contentWidth - 20, mathHeight, 'FD');

              // Add "Formula:" label
              pdf.setFontSize(9);
              pdf.setTextColor(100, 100, 100);
              pdf.text('Formula:', margin + 12, yPosition + 2);
              pdf.setTextColor(0, 0, 0);

              // Draw math content
              pdf.setFontSize(10);
              for (let i = 0; i < mathLines.length; i++) {
                pdf.text(mathLines[i], margin + 15, yPosition + 8 + (i * 6));
              }
              yPosition += mathHeight + 3;
            } else {
              // Regular code block
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
            }
            break;

          case 'list':
            checkNewPage(10);
            pdf.setFontSize(11);
            pdf.setFont('NotoSerif', 'normal');

            for (let i = 0; i < token.items.length; i++) {
              const item = token.items[i];
              const bullet = token.ordered ? `${i + 1}. ` : '• ';
              const itemText = extractText(item);
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
            pdf.setFont('NotoSerif', 'normal'); // Use normal instead of italic for better Unicode support
            pdf.setTextColor(85, 85, 85);

            const quoteText = extractText(token);
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

          case 'table':
            checkNewPage(20);

            // Reset all colors and styles for clean table rendering
            pdf.setFontSize(9);
            pdf.setFont('NotoSerif', 'normal');
            pdf.setTextColor(0, 0, 0); // Ensure text is black
            pdf.setFillColor(255, 255, 255); // Reset fill to white
            pdf.setDrawColor(0, 0, 0); // Reset draw to black

            const table = token;
            const colCount = table.header.length;
            const cellWidth = contentWidth / colCount;
            const cellPadding = 1.5;
            const minRowHeight = 7;

            console.log('[PDF] Rendering table with', colCount, 'columns');
            console.log('[PDF] Cell width:', cellWidth, 'mm');

            // Calculate header height first
            let headerHeight = minRowHeight;
            for (let col = 0; col < table.header.length; col++) {
              const headerText = extractText(table.header[col]);
              const lines = pdf.splitTextToSize(headerText, cellWidth - (cellPadding * 2));
              const height = lines.length * 4 + (cellPadding * 2);
              if (height > headerHeight) headerHeight = height;
            }

            // Draw table header
            pdf.setFillColor(240, 240, 240);
            pdf.setDrawColor(180, 180, 180);
            pdf.setLineWidth(0.3);
            pdf.setFont('NotoSerif', 'bold');

            for (let col = 0; col < table.header.length; col++) {
              const cellX = margin + (col * cellWidth);

              // Draw cell background and border
              pdf.rect(cellX, yPosition, cellWidth, headerHeight, 'FD');

              // Draw text - handle multi-line properly
              const headerText = extractText(table.header[col]);
              const lines = pdf.splitTextToSize(headerText, cellWidth - (cellPadding * 2));

              // Start from top of cell
              let lineY = yPosition + 3.5;
              for (let i = 0; i < lines.length; i++) {
                pdf.text(lines[i], cellX + cellPadding, lineY);
                lineY += 4; // Line height
              }
            }
            yPosition += headerHeight;

            // Draw table rows
            pdf.setFont('NotoSerif', 'normal');
            pdf.setFillColor(255, 255, 255);

            for (let rowIdx = 0; rowIdx < table.rows.length; rowIdx++) {
              const row = table.rows[rowIdx];
              let maxHeight = minRowHeight;

              // Calculate row height based on content
              for (let col = 0; col < row.length; col++) {
                const cellText = extractText(row[col]);
                const lines = pdf.splitTextToSize(cellText, cellWidth - (cellPadding * 2));
                const height = lines.length * 4 + (cellPadding * 2);
                if (height > maxHeight) maxHeight = height;
              }

              // Check if we need a new page
              if (yPosition + maxHeight > pageHeight - margin) {
                pdf.addPage();
                yPosition = margin;
              }

              // Alternate row colors for better readability
              if (rowIdx % 2 === 0) {
                pdf.setFillColor(255, 255, 255);
              } else {
                pdf.setFillColor(250, 250, 250);
              }

              // Draw cells
              for (let col = 0; col < row.length; col++) {
                const cellX = margin + (col * cellWidth);

                // Draw cell background and border
                pdf.rect(cellX, yPosition, cellWidth, maxHeight, 'FD');

                // Draw text - handle multi-line properly
                const cellText = extractText(row[col]);
                const lines = pdf.splitTextToSize(cellText, cellWidth - (cellPadding * 2));

                // Start text slightly below top of cell
                let lineY = yPosition + 3.5;
                for (let i = 0; i < lines.length; i++) {
                  pdf.text(lines[i], cellX + cellPadding, lineY);
                  lineY += 4; // Line height
                }
              }

              yPosition += maxHeight;
            }
            yPosition += 5;

            // Reset colors
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(0, 0, 0);
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
