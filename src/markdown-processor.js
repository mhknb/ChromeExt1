/**
 * Markdown Processor
 * Handles markdown parsing, normalization, validation, and conversion
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

class MarkdownProcessor {
  constructor(performanceManager = null) {
    // Initialize unified processor with GFM and math support
    this.processor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath);
    
    // Performance manager for caching
    this.performanceManager = performanceManager;
    
    // Unicode to LaTeX mapping for common mathematical symbols
    this.unicodeToLatex = {
      // Greek letters
      'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
      'ε': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
      'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu',
      'ν': '\\nu', 'ξ': '\\xi', 'ο': '\\omicron', 'π': '\\pi',
      'ρ': '\\rho', 'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon',
      'φ': '\\phi', 'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
      'Α': '\\Alpha', 'Β': '\\Beta', 'Γ': '\\Gamma', 'Δ': '\\Delta',
      'Ε': '\\Epsilon', 'Ζ': '\\Zeta', 'Η': '\\Eta', 'Θ': '\\Theta',
      'Ι': '\\Iota', 'Κ': '\\Kappa', 'Λ': '\\Lambda', 'Μ': '\\Mu',
      'Ν': '\\Nu', 'Ξ': '\\Xi', 'Ο': '\\Omicron', 'Π': '\\Pi',
      'Ρ': '\\Rho', 'Σ': '\\Sigma', 'Τ': '\\Tau', 'Υ': '\\Upsilon',
      'Φ': '\\Phi', 'Χ': '\\Chi', 'Ψ': '\\Psi', 'Ω': '\\Omega',
      
      // Mathematical operators
      '≤': '\\leq', '≥': '\\geq', '≠': '\\neq', '≈': '\\approx',
      '∞': '\\infty', '∂': '\\partial', '∇': '\\nabla', '∫': '\\int',
      '∑': '\\sum', '∏': '\\prod', '√': '\\sqrt', '∈': '\\in',
      '∉': '\\notin', '⊂': '\\subset', '⊃': '\\supset', '⊆': '\\subseteq',
      '⊇': '\\supseteq', '∪': '\\cup', '∩': '\\cap', '∅': '\\emptyset',
      '∀': '\\forall', '∃': '\\exists', '¬': '\\neg', '∧': '\\wedge',
      '∨': '\\vee', '⊕': '\\oplus', '⊗': '\\otimes', '⊥': '\\perp',
      '∥': '\\parallel', '±': '\\pm', '∓': '\\mp', '×': '\\times',
      '÷': '\\div', '·': '\\cdot', '∘': '\\circ', '°': '^\\circ',
      
      // Arrows
      '→': '\\rightarrow', '←': '\\leftarrow', '↔': '\\leftrightarrow',
      '⇒': '\\Rightarrow', '⇐': '\\Leftarrow', '⇔': '\\Leftrightarrow',
      '↑': '\\uparrow', '↓': '\\downarrow', '⇑': '\\Uparrow', '⇓': '\\Downarrow',
      
      // Other symbols
      '∝': '\\propto', '∼': '\\sim', '≡': '\\equiv', '≅': '\\cong',
      '⊤': '\\top', '⊥': '\\bot', 'ℝ': '\\mathbb{R}', 'ℂ': '\\mathbb{C}',
      'ℕ': '\\mathbb{N}', 'ℤ': '\\mathbb{Z}', 'ℚ': '\\mathbb{Q}'
    };
    
    // Platform-specific header patterns
    this.platformHeaderPatterns = [
      /^(ChatGPT|Claude|Gemini|DeepSeek)\s+said:\s*$/gim,
      /^(ChatGPT|Claude|Gemini|DeepSeek):\s*$/gim,
      /^Assistant:\s*$/gim,
      /^Model:\s*$/gim
    ];
  }

  /**
   * Parse markdown to AST
   * @param {string} markdown - Raw markdown
   * @returns {Object} Markdown AST
   */
  parse(markdown) {
    // Check cache if performance manager is available
    if (this.performanceManager) {
      const cacheKey = `parse_${markdown.substring(0, 100)}`;
      const cached = this.performanceManager.getCachedMarkdown(cacheKey);
      
      if (cached) {
        console.log('[MarkdownProcessor] Using cached parse result');
        return cached;
      }
      
      try {
        const ast = this.processor.parse(markdown);
        this.performanceManager.cacheMarkdown(cacheKey, ast);
        return ast;
      } catch (error) {
        console.error('[MarkdownProcessor] Parse error:', error);
        throw new Error(`Markdown parsing failed: ${error.message}`);
      }
    }
    
    // No caching
    try {
      return this.processor.parse(markdown);
    } catch (error) {
      console.error('[MarkdownProcessor] Parse error:', error);
      throw new Error(`Markdown parsing failed: ${error.message}`);
    }
  }

  /**
   * Normalize LaTeX formulas (Unicode → LaTeX commands)
   * @param {string} markdown - Markdown with potential Unicode math symbols
   * @returns {string} Normalized markdown with LaTeX commands
   */
  normalizeLatex(markdown) {
    let normalized = markdown;
    
    // Process each Unicode character and replace with LaTeX equivalent
    for (const [unicode, latex] of Object.entries(this.unicodeToLatex)) {
      // Create a regex that matches the Unicode character
      const regex = new RegExp(unicode, 'g');
      normalized = normalized.replace(regex, latex);
    }
    
    return normalized;
  }

  /**
   * Convert HTML table to GitHub Flavored Markdown
   * @param {Object} table - Table object from ContentExtractor
   * @returns {string} GFM table markdown
   */
  tableToMarkdown(table) {
    if (!table || !table.headers || table.headers.length === 0) {
      return '';
    }
    
    const lines = [];
    const { headers, rows, alignment = [] } = table;
    
    // Ensure alignment array has correct length
    const alignments = [...alignment];
    while (alignments.length < headers.length) {
      alignments.push('left');
    }
    
    // Calculate column widths for better formatting
    const columnWidths = headers.map((header, i) => {
      const headerLen = header.length;
      const maxRowLen = rows.reduce((max, row) => {
        const cellLen = (row[i] || '').length;
        return Math.max(max, cellLen);
      }, 0);
      return Math.max(headerLen, maxRowLen, 3); // Minimum width of 3
    });
    
    // Build header row
    const headerRow = '| ' + headers.map((header, i) => {
      return header.padEnd(columnWidths[i]);
    }).join(' | ') + ' |';
    lines.push(headerRow);
    
    // Build separator row with alignment
    const separatorRow = '| ' + alignments.map((align, i) => {
      const width = columnWidths[i];
      if (align === 'center') {
        return ':' + '-'.repeat(width - 2) + ':';
      } else if (align === 'right') {
        return '-'.repeat(width - 1) + ':';
      } else {
        return '-'.repeat(width);
      }
    }).join(' | ') + ' |';
    lines.push(separatorRow);
    
    // Build data rows
    rows.forEach(row => {
      const rowData = '| ' + row.map((cell, i) => {
        const cellText = (cell || '').toString();
        return cellText.padEnd(columnWidths[i]);
      }).join(' | ') + ' |';
      lines.push(rowData);
    });
    
    return lines.join('\n');
  }

  /**
   * Remove platform-specific headers from markdown
   * @param {string} markdown - Markdown content
   * @returns {string} Cleaned markdown
   */
  removePlatformHeaders(markdown) {
    let cleaned = markdown;
    
    // Apply each platform header pattern
    this.platformHeaderPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Remove lines that only contain whitespace after header removal
    cleaned = cleaned.replace(/^\s*$/gm, '');
    
    // Normalize multiple consecutive blank lines to maximum 2
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    
    return cleaned.trim();
  }

  /**
   * Validate markdown syntax
   * @param {string} markdown - Markdown content
   * @returns {Object} Validation result
   */
  validate(markdown) {
    const errors = [];
    const warnings = [];
    
    try {
      // Try to parse the markdown
      const ast = this.parse(markdown);
      
      // Check for common issues
      
      // 1. Check for unclosed code blocks
      const codeBlockMatches = markdown.match(/```/g);
      if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
        errors.push({
          type: 'unclosed_code_block',
          message: 'Unclosed code block detected (odd number of ``` markers)'
        });
      }
      
      // 2. Check for unclosed LaTeX blocks
      const blockLatexMatches = markdown.match(/\$\$/g);
      if (blockLatexMatches && blockLatexMatches.length % 2 !== 0) {
        errors.push({
          type: 'unclosed_latex_block',
          message: 'Unclosed LaTeX block detected (odd number of $$ markers)'
        });
      }
      
      // 3. Check for malformed tables (basic check)
      const lines = markdown.split('\n');
      let inTable = false;
      let tableColumnCount = 0;
      
      lines.forEach((line, index) => {
        if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
          const columns = line.split('|').filter(cell => cell.trim() !== '').length;
          
          if (!inTable) {
            inTable = true;
            tableColumnCount = columns;
          } else {
            // Check if column count matches
            if (columns !== tableColumnCount) {
              warnings.push({
                type: 'inconsistent_table_columns',
                message: `Table row at line ${index + 1} has ${columns} columns, expected ${tableColumnCount}`,
                line: index + 1
              });
            }
          }
        } else if (inTable && line.trim() === '') {
          inTable = false;
          tableColumnCount = 0;
        }
      });
      
      // 4. Check for valid GFM table separators
      const tableSeparatorRegex = /^\|[\s:|-]+\|$/;
      lines.forEach((line, index) => {
        if (line.includes('|') && line.includes('-') && !tableSeparatorRegex.test(line.trim())) {
          // Might be a malformed separator
          const prevLine = index > 0 ? lines[index - 1] : '';
          if (prevLine.trim().startsWith('|')) {
            warnings.push({
              type: 'malformed_table_separator',
              message: `Possible malformed table separator at line ${index + 1}`,
              line: index + 1
            });
          }
        }
      });
      
      return {
        valid: errors.length === 0,
        errors,
        warnings,
        ast
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [{
          type: 'parse_error',
          message: error.message
        }],
        warnings,
        ast: null
      };
    }
  }

  /**
   * Process markdown content with all enhancements
   * @param {string} markdown - Raw markdown
   * @param {Object} options - Processing options
   * @returns {string} Processed markdown
   */
  process(markdown, options = {}) {
    const {
      normalizeLatex = true,
      removePlatformHeaders = true,
      validateSyntax = false
    } = options;
    
    let processed = markdown;
    
    // Remove platform headers
    if (removePlatformHeaders) {
      processed = this.removePlatformHeaders(processed);
    }
    
    // Normalize LaTeX
    if (normalizeLatex) {
      processed = this.normalizeLatex(processed);
    }
    
    // Validate if requested
    if (validateSyntax) {
      const validation = this.validate(processed);
      if (!validation.valid) {
        console.warn('[MarkdownProcessor] Validation errors:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        console.warn('[MarkdownProcessor] Validation warnings:', validation.warnings);
      }
    }
    
    return processed;
  }
}

export default MarkdownProcessor;
