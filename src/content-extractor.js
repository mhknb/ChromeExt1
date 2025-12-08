/**
 * Content Extractor
 * Extracts and cleans content from AI platforms
 */

import ImageHandler from './image-handler.js';

class ContentExtractor {
  constructor() {
    this.imageHandler = new ImageHandler();
    
    // Enhanced platform-specific selectors with multiple fallbacks
    this.platformSelectors = {
      chatgpt: {
        container: [
          '[data-message-author-role="assistant"]',
          '.agent-turn',
          '[class*="Message"][class*="assistant"]'
        ],
        codeBlock: 'pre code',
        table: 'table',
        platformHeaders: [
          'ChatGPT said:',
          'ChatGPT:',
          'Assistant:'
        ],
        uiElements: [
          'button[class*="copy"]',
          '[aria-label*="Copy"]',
          '.text-token-text-secondary'
        ]
      },
      claude: {
        container: [
          '[data-test-render-count]',
          '.claude-message',
          '[class*="assistant"]'
        ],
        codeBlock: 'pre code',
        table: 'table',
        platformHeaders: [
          'Claude said:',
          'Claude:',
          'Assistant:'
        ],
        uiElements: [
          'button[class*="copy"]',
          '[aria-label*="Copy"]'
        ]
      },
      gemini: {
        container: [
          '.model-response',
          '[data-test-id*="model"]',
          '.response-container'
        ],
        codeBlock: 'pre code',
        table: 'table',
        platformHeaders: [
          'Gemini said:',
          'Gemini:',
          'Model:'
        ],
        uiElements: [
          'button[class*="copy"]',
          '[aria-label*="Copy"]'
        ]
      },
      deepseek: {
        container: [
          '.message-content',
          '[class*="assistant"]',
          '.ai-message'
        ],
        codeBlock: 'pre code',
        table: 'table',
        platformHeaders: [
          'DeepSeek said:',
          'DeepSeek:',
          'Assistant:'
        ],
        uiElements: [
          'button[class*="copy"]',
          '[aria-label*="Copy"]'
        ]
      }
    };
  }

  /**
   * Detect current platform
   * @returns {string} Platform identifier
   */
  detectPlatform() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('openai.com') || hostname.includes('chatgpt.com')) {
      return 'chatgpt';
    } else if (hostname.includes('claude.ai')) {
      return 'claude';
    } else if (hostname.includes('gemini.google.com')) {
      return 'gemini';
    } else if (hostname.includes('deepseek.com')) {
      return 'deepseek';
    }
    
    return 'unknown';
  }

  /**
   * Detect programming language from code content
   * @param {string} code - Code content
   * @returns {string} Detected language
   */
  detectLanguageFromCode(code) {
    // Simple heuristics for common languages
    const patterns = {
      javascript: [/\bfunction\b/, /\bconst\b/, /\blet\b/, /\bvar\b/, /=>/, /console\.log/],
      python: [/\bdef\b/, /\bimport\b/, /\bfrom\b.*\bimport\b/, /\bprint\(/, /\bif\b.*:/],
      java: [/\bpublic\b.*\bclass\b/, /\bprivate\b/, /\bprotected\b/, /System\.out\.println/],
      cpp: [/#include/, /std::/, /\bnamespace\b/, /cout\s*<</, /\bvoid\b.*\(/],
      csharp: [/\busing\b.*System/, /\bnamespace\b/, /\bpublic\b.*\bclass\b/, /Console\.WriteLine/],
      ruby: [/\bdef\b/, /\bend\b/, /\brequire\b/, /puts\s/, /@\w+/],
      go: [/\bfunc\b/, /\bpackage\b/, /\bimport\b/, /fmt\.Print/, /:=/],
      rust: [/\bfn\b/, /\blet\b.*mut/, /\bimpl\b/, /println!/, /\buse\b/],
      php: [/<\?php/, /\$\w+/, /\bfunction\b/, /echo\s/, /\bnamespace\b/],
      sql: [/\bSELECT\b/i, /\bFROM\b/i, /\bWHERE\b/i, /\bINSERT\b/i, /\bUPDATE\b/i],
      html: [/<html/, /<div/, /<span/, /<body/, /<head/],
      css: [/\{[^}]*:[^}]*\}/, /@media/, /\.[\w-]+\s*\{/, /#[\w-]+\s*\{/],
      json: [/^\s*\{/, /^\s*\[/, /"[\w-]+":\s*["{[]/, /^\s*"[\w-]+":/],
      yaml: [/^[\w-]+:/, /^\s+-\s+/, /^---/, /^\s+[\w-]+:/],
      bash: [/^#!\/bin\/bash/, /\becho\b/, /\bif\b.*\bthen\b/, /\[\[.*\]\]/, /\$\{/],
      typescript: [/\binterface\b/, /\btype\b.*=/, /:\s*(string|number|boolean)/, /<.*>/, /\bas\b/]
    };

    for (const [lang, regexes] of Object.entries(patterns)) {
      let matches = 0;
      for (const regex of regexes) {
        if (regex.test(code)) {
          matches++;
        }
      }
      // If at least 2 patterns match, consider it detected
      if (matches >= 2) {
        return lang;
      }
    }

    return 'text';
  }

  /**
   * Extract code blocks with language info (enhanced)
   * @param {HTMLElement} element - Content element
   * @returns {Array<Object>} Code blocks
   */
  extractCodeBlocks(element) {
    const codeBlocks = [];
    const preElements = element.querySelectorAll('pre');
    
    preElements.forEach((pre, index) => {
      const codeElement = pre.querySelector('code');
      if (codeElement) {
        let language = 'text';
        const code = codeElement.textContent;
        
        // Try multiple methods to detect language
        // 1. Check code element classes
        const classList = Array.from(codeElement.classList);
        for (const className of classList) {
          if (className.startsWith('language-')) {
            language = className.replace('language-', '');
            break;
          } else if (className.startsWith('lang-')) {
            language = className.replace('lang-', '');
            break;
          }
        }
        
        // 2. Check pre element classes
        if (language === 'text') {
          const preClassList = Array.from(pre.classList);
          for (const className of preClassList) {
            if (className.startsWith('language-')) {
              language = className.replace('language-', '');
              break;
            } else if (className.startsWith('lang-')) {
              language = className.replace('lang-', '');
              break;
            }
          }
        }
        
        // 3. Check data attributes
        if (language === 'text') {
          language = codeElement.getAttribute('data-language') || 
                     pre.getAttribute('data-language') ||
                     codeElement.getAttribute('data-lang') ||
                     pre.getAttribute('data-lang') ||
                     'text';
        }
        
        // 4. Try to detect from code content if still unknown
        if (language === 'text' && code.trim().length > 0) {
          language = this.detectLanguageFromCode(code);
        }
        
        codeBlocks.push({
          index,
          language: language.toLowerCase(),
          code: code,
          lineNumbers: false
        });
      }
    });
    
    return codeBlocks;
  }

  /**
   * Extract tables with structure preservation (enhanced)
   * @param {HTMLElement} element - Content element
   * @returns {Array<Object>} Tables
   */
  extractTables(element) {
    const tables = [];
    const tableElements = element.querySelectorAll('table');
    
    tableElements.forEach((table, index) => {
      const headers = [];
      const rows = [];
      const alignment = [];
      
      // Extract headers from thead
      const headerCells = table.querySelectorAll('thead th, thead td');
      headerCells.forEach(cell => {
        headers.push(cell.textContent.trim());
        // Extract alignment from style or class
        const align = this.extractCellAlignment(cell);
        alignment.push(align);
      });
      
      // Check if we need to look for header in first row (no thead case)
      let hasHeaderRow = headers.length > 0;
      let headerRowIndex = hasHeaderRow ? -1 : -1; // -1 means no header row found yet
      
      // Get all rows once
      const allTableRows = table.querySelectorAll('tr');
      
      if (!hasHeaderRow && allTableRows.length > 0) {
        const firstRowCells = allTableRows[0].querySelectorAll('th');
        if (firstRowCells.length > 0) {
          hasHeaderRow = true;
          headerRowIndex = 0;
          firstRowCells.forEach(cell => {
            headers.push(cell.textContent.trim());
            const align = this.extractCellAlignment(cell);
            alignment.push(align);
          });
        }
      }
      
      // Extract body rows
      const bodyRows = table.querySelectorAll('tbody tr');
      if (bodyRows.length > 0) {
        // Has tbody, use those rows
        bodyRows.forEach(row => {
          const rowData = [];
          const cells = row.querySelectorAll('td, th');
          cells.forEach(cell => {
            rowData.push(cell.textContent.trim());
          });
          if (rowData.length > 0) {
            rows.push(rowData);
          }
        });
      } else {
        // No tbody, extract all rows except header row
        const startIndex = headerRowIndex >= 0 ? headerRowIndex + 1 : 0;
        
        for (let i = startIndex; i < allTableRows.length; i++) {
          const rowData = [];
          // For body rows, only select td cells (not th)
          const cells = allTableRows[i].querySelectorAll('td');
          cells.forEach(cell => {
            rowData.push(cell.textContent.trim());
          });
          // Only add row if it has data cells
          if (rowData.length > 0) {
            rows.push(rowData);
          }
        }
      }
      
      // Ensure alignment array matches header length
      while (alignment.length < headers.length) {
        alignment.push('left');
      }
      
      tables.push({
        index,
        headers,
        rows,
        alignment,
        hasHeaderRow,
        columnCount: Math.max(headers.length, ...rows.map(r => r.length))
      });
    });
    
    return tables;
  }

  /**
   * Extract cell alignment from style or attributes
   * @param {HTMLElement} cell - Table cell element
   * @returns {string} Alignment (left, center, right)
   */
  extractCellAlignment(cell) {
    // Check style attribute
    const style = cell.getAttribute('style') || '';
    if (style.includes('text-align: center') || style.includes('text-align:center')) {
      return 'center';
    }
    if (style.includes('text-align: right') || style.includes('text-align:right')) {
      return 'right';
    }
    
    // Check align attribute
    const align = cell.getAttribute('align');
    if (align) {
      return align.toLowerCase();
    }
    
    // Check computed style if available
    if (typeof window !== 'undefined' && window.getComputedStyle) {
      const computed = window.getComputedStyle(cell);
      const textAlign = computed.textAlign;
      if (textAlign === 'center' || textAlign === 'right') {
        return textAlign;
      }
    }
    
    return 'left';
  }

  /**
   * Extract LaTeX formulas (enhanced with better detection)
   * @param {string} text - Text content
   * @returns {Array<Object>} LaTeX formulas
   */
  extractLatexFormulas(text) {
    const formulas = [];
    const processedPositions = new Set();
    
    // Block math: $$...$$ (must be processed first to avoid conflicts)
    const blockRegex = /\$\$\n?([\s\S]*?)\n?\$\$/g;
    let match;
    
    while ((match = blockRegex.exec(text)) !== null) {
      formulas.push({
        type: 'block',
        formula: match[1].trim(),
        position: match.index,
        length: match[0].length
      });
      // Mark this range as processed
      for (let i = match.index; i < match.index + match[0].length; i++) {
        processedPositions.add(i);
      }
    }
    
    // Inline math: $...$ (avoid matching within already processed block math)
    const inlineRegex = /\$([^$\n]+?)\$/g;
    while ((match = inlineRegex.exec(text)) !== null) {
      // Check if this position was already processed as block math
      if (!processedPositions.has(match.index)) {
        // Validate that it looks like LaTeX (contains typical LaTeX characters)
        const formula = match[1];
        if (this.looksLikeLaTeX(formula)) {
          formulas.push({
            type: 'inline',
            formula: formula,
            position: match.index,
            length: match[0].length
          });
        }
      }
    }
    
    // Also check for \[ \] and \( \) delimiters
    const blockBracketRegex = /\\\[([\s\S]*?)\\\]/g;
    while ((match = blockBracketRegex.exec(text)) !== null) {
      if (!processedPositions.has(match.index)) {
        formulas.push({
          type: 'block',
          formula: match[1].trim(),
          position: match.index,
          length: match[0].length
        });
      }
    }
    
    const inlineBracketRegex = /\\\(([\s\S]*?)\\\)/g;
    while ((match = inlineBracketRegex.exec(text)) !== null) {
      if (!processedPositions.has(match.index)) {
        formulas.push({
          type: 'inline',
          formula: match[1].trim(),
          position: match.index,
          length: match[0].length
        });
      }
    }
    
    // Sort by position
    formulas.sort((a, b) => a.position - b.position);
    
    return formulas;
  }

  /**
   * Check if text looks like LaTeX
   * @param {string} text - Text to check
   * @returns {boolean} True if it looks like LaTeX
   */
  looksLikeLaTeX(text) {
    // Check for common LaTeX commands or symbols
    const latexPatterns = [
      /\\[a-zA-Z]+/,  // LaTeX commands like \frac, \sum, etc.
      /[_^]/,          // Subscript/superscript
      /\\{|\\}/,       // Escaped braces
      /[∑∫∏√∞≤≥≠±×÷]/  // Math symbols
    ];
    
    // If it matches any pattern, it's LaTeX
    if (latexPatterns.some(pattern => pattern.test(text))) {
      return true;
    }
    
    // Also accept single letters or simple variables (common in math)
    // But reject if it looks like regular English words
    const trimmed = text.trim();
    if (trimmed.length <= 3 && /^[a-zA-Z][a-zA-Z0-9]*$/.test(trimmed)) {
      return true;
    }
    
    return false;
  }

  /**
   * Remove platform-specific UI elements (enhanced)
   * @param {HTMLElement} element - Content element
   * @param {string} platform - Platform identifier
   * @returns {HTMLElement} Cleaned element
   */
  cleanPlatformElements(element, platform = 'unknown') {
    // Clone to avoid modifying original
    const cleaned = element.cloneNode(true);
    
    // Remove generic UI elements
    const genericSelectors = [
      'button',
      '[role="button"]',
      '.avatar',
      '.user-avatar',
      '.copy-button',
      '.edit-button',
      'svg[class*="icon"]',
      '[class*="toolbar"]',
      '[class*="action"]'
    ];
    
    genericSelectors.forEach(selector => {
      const elements = cleaned.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
    
    // Remove platform-specific UI elements
    if (platform !== 'unknown' && this.platformSelectors[platform]) {
      const platformSelectors = this.platformSelectors[platform].uiElements || [];
      platformSelectors.forEach(selector => {
        const elements = cleaned.querySelectorAll(selector);
        elements.forEach(el => el.remove());
      });
    }
    
    return cleaned;
  }

  /**
   * Remove platform-specific headers from text
   * @param {string} text - Text content
   * @param {string} platform - Platform identifier
   * @returns {string} Cleaned text
   */
  removePlatformHeaders(text, platform = 'unknown') {
    let cleaned = text;
    
    if (platform !== 'unknown' && this.platformSelectors[platform]) {
      const headers = this.platformSelectors[platform].platformHeaders || [];
      headers.forEach(header => {
        // Remove header at start of line
        const regex = new RegExp(`^${header}\\s*`, 'gm');
        cleaned = cleaned.replace(regex, '');
        // Also remove if it's the only thing on a line
        const lineRegex = new RegExp(`^\\s*${header}\\s*$`, 'gm');
        cleaned = cleaned.replace(lineRegex, '');
      });
    }
    
    return cleaned;
  }

  /**
   * Find container element using multiple selectors
   * @param {Array<string>} selectors - Array of selectors to try
   * @returns {HTMLElement|null} Found container or null
   */
  findContainer(selectors) {
    if (typeof selectors === 'string') {
      return document.querySelector(selectors);
    }
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
    }
    
    return null;
  }

  /**
   * Extract content from current page
   * @returns {Promise<Object>} Extracted content
   */
  async extractContent() {
    const platform = this.detectPlatform();
    
    if (platform === 'unknown') {
      throw new Error('Unsupported platform');
    }
    
    // Get main content container using multiple selectors
    const containerSelectors = this.platformSelectors[platform].container;
    const container = this.findContainer(containerSelectors);
    
    if (!container) {
      throw new Error('Content container not found');
    }
    
    // Clean platform elements
    const cleaned = this.cleanPlatformElements(container, platform);
    
    // Extract components
    const codeBlocks = this.extractCodeBlocks(cleaned);
    const tables = this.extractTables(cleaned);
    const images = await this.imageHandler.extractImages(cleaned);
    let rawText = cleaned.textContent;
    
    // Remove platform headers from text
    rawText = this.removePlatformHeaders(rawText, platform);
    
    const latexFormulas = this.extractLatexFormulas(rawText);
    
    return {
      platform,
      rawHtml: cleaned.innerHTML,
      rawText,
      codeBlocks,
      tables,
      images,
      latexFormulas,
      metadata: {
        platform,
        timestamp: new Date(),
        wordCount: rawText.split(/\s+/).filter(w => w.length > 0).length,
        hasCode: codeBlocks.length > 0,
        hasTables: tables.length > 0,
        hasImages: images.length > 0,
        hasLatex: latexFormulas.length > 0
      }
    };
  }
}

export default ContentExtractor;
