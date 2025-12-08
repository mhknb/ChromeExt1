/**
 * Syntax Highlighter
 * Provides syntax highlighting for code blocks using highlight.js
 * with selective language loading and token extraction for DOCX/PDF rendering
 */

import hljs from 'highlight.js/lib/core';

// Import commonly used languages for selective loading
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import java from 'highlight.js/lib/languages/java';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import ruby from 'highlight.js/lib/languages/ruby';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import php from 'highlight.js/lib/languages/php';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import markdown from 'highlight.js/lib/languages/markdown';
import yaml from 'highlight.js/lib/languages/yaml';

class SyntaxHighlighter {
  constructor(performanceManager = null) {
    this.hljs = hljs;
    this.loadedLanguages = new Set();
    
    // Performance manager for caching
    this.performanceManager = performanceManager;
    
    // Color mapping for different token types (based on common syntax highlighting themes)
    this.tokenColorMap = {
      'hljs-keyword': '#CF222E',        // Keywords (red)
      'hljs-built_in': '#8250DF',       // Built-in functions (purple)
      'hljs-type': '#0550AE',           // Types (blue)
      'hljs-literal': '#0A3069',        // Literals (dark blue)
      'hljs-number': '#0550AE',         // Numbers (blue)
      'hljs-operator': '#CF222E',       // Operators (red)
      'hljs-punctuation': '#24292F',    // Punctuation (dark gray)
      'hljs-property': '#8250DF',       // Properties (purple)
      'hljs-regexp': '#116329',         // Regular expressions (green)
      'hljs-string': '#0A3069',         // Strings (dark blue)
      'hljs-char.escape': '#0A3069',    // Escape characters (dark blue)
      'hljs-subst': '#24292F',          // Substitutions (dark gray)
      'hljs-symbol': '#8250DF',         // Symbols (purple)
      'hljs-variable': '#953800',       // Variables (orange)
      'hljs-variable.language': '#953800', // Language variables (orange)
      'hljs-variable.constant': '#0550AE', // Constants (blue)
      'hljs-title': '#8250DF',          // Titles (purple)
      'hljs-title.class': '#8250DF',    // Class names (purple)
      'hljs-title.class.inherited': '#8250DF', // Inherited classes (purple)
      'hljs-title.function': '#8250DF', // Function names (purple)
      'hljs-params': '#24292F',         // Parameters (dark gray)
      'hljs-comment': '#6E7781',        // Comments (gray)
      'hljs-doctag': '#6E7781',         // Doc tags (gray)
      'hljs-meta': '#6E7781',           // Meta information (gray)
      'hljs-meta.prompt': '#6E7781',    // Meta prompts (gray)
      'hljs-meta-keyword': '#CF222E',   // Meta keywords (red)
      'hljs-meta-string': '#0A3069',    // Meta strings (dark blue)
      'hljs-section': '#0550AE',        // Sections (blue)
      'hljs-tag': '#116329',            // Tags (green)
      'hljs-name': '#116329',           // Names (green)
      'hljs-attr': '#0550AE',           // Attributes (blue)
      'hljs-attribute': '#0550AE',      // Attributes (blue)
      'hljs-bullet': '#953800',         // Bullets (orange)
      'hljs-code': '#24292F',           // Code (dark gray)
      'hljs-emphasis': '#24292F',       // Emphasis (dark gray)
      'hljs-strong': '#24292F',         // Strong (dark gray)
      'hljs-formula': '#0550AE',        // Formulas (blue)
      'hljs-link': '#0969DA',           // Links (blue)
      'hljs-quote': '#6E7781',          // Quotes (gray)
      'hljs-selector-tag': '#116329',   // Selector tags (green)
      'hljs-selector-id': '#8250DF',    // Selector IDs (purple)
      'hljs-selector-class': '#8250DF', // Selector classes (purple)
      'hljs-selector-attr': '#0550AE',  // Selector attributes (blue)
      'hljs-selector-pseudo': '#8250DF', // Selector pseudo (purple)
      'hljs-template-tag': '#CF222E',   // Template tags (red)
      'hljs-template-variable': '#953800', // Template variables (orange)
      'hljs-addition': '#116329',       // Additions (green)
      'hljs-deletion': '#CF222E',       // Deletions (red)
    };
    
    // Register commonly used languages on initialization
    this.registerCommonLanguages();
  }

  /**
   * Register commonly used languages for selective loading
   * This reduces initial bundle size while supporting most use cases
   */
  registerCommonLanguages() {
    const languages = {
      javascript,
      typescript,
      python,
      java,
      cpp,
      csharp,
      ruby,
      go,
      rust,
      php,
      sql,
      bash,
      json,
      xml,
      css,
      markdown,
      yaml
    };
    
    // Register each language
    Object.entries(languages).forEach(([name, language]) => {
      try {
        this.hljs.registerLanguage(name, language);
        this.loadedLanguages.add(name);
      } catch (error) {
        console.warn(`[SyntaxHighlighter] Failed to register language: ${name}`, error);
      }
    });
    
    // Register common aliases
    this.registerAliases();
  }

  /**
   * Register common language aliases
   */
  registerAliases() {
    const aliases = {
      'js': 'javascript',
      'ts': 'typescript',
      'py': 'python',
      'c++': 'cpp',
      'c#': 'csharp',
      'cs': 'csharp',
      'rb': 'ruby',
      'rs': 'rust',
      'sh': 'bash',
      'shell': 'bash',
      'html': 'xml',
      'yml': 'yaml'
    };
    
    // Note: highlight.js handles aliases internally, but we track them for our own use
    this.languageAliases = aliases;
  }

  /**
   * Normalize language name (handle aliases)
   * @param {string} language - Language name or alias
   * @returns {string} Normalized language name
   */
  normalizeLanguage(language) {
    if (!language) return 'text';
    
    const normalized = language.toLowerCase().trim();
    
    // Check if it's an alias
    if (this.languageAliases && this.languageAliases[normalized]) {
      return this.languageAliases[normalized];
    }
    
    return normalized;
  }

  /**
   * Check if a language is supported
   * @param {string} language - Language name
   * @returns {boolean} True if supported
   */
  isLanguageSupported(language) {
    const normalized = this.normalizeLanguage(language);
    return this.loadedLanguages.has(normalized);
  }

  /**
   * Highlight code with specified language
   * Implements language detection fallback if specified language is not supported
   * @param {string} code - Source code
   * @param {string} language - Programming language
   * @returns {Object} Highlighted code with tokens
   */
  highlight(code, language) {
    if (!code || typeof code !== 'string') {
      return {
        html: '',
        tokens: [],
        language: 'text'
      };
    }
    
    const normalized = this.normalizeLanguage(language);
    
    // Check cache if performance manager is available
    if (this.performanceManager) {
      const cached = this.performanceManager.getCachedCode(code, normalized);
      
      if (cached) {
        console.log('[SyntaxHighlighter] Using cached highlight result');
        return cached;
      }
    }
    
    try {
      // Try to highlight with specified language
      let result;
      
      if (normalized !== 'text' && this.isLanguageSupported(normalized)) {
        const hlResult = this.hljs.highlight(code, { language: normalized });
        
        result = {
          html: hlResult.value,
          tokens: this.extractTokens(hlResult.value),
          language: hlResult.language || normalized
        };
      } else {
        // Fallback: Try auto-detection if language not supported or is 'text'
        const autoResult = this.hljs.highlightAuto(code);
        
        // Only use auto-detection if confidence is reasonable
        if (autoResult.language && autoResult.relevance > 5) {
          result = {
            html: autoResult.value,
            tokens: this.extractTokens(autoResult.value),
            language: autoResult.language
          };
        } else {
          // Final fallback: Return plain text
          result = {
            html: this.escapeHtml(code),
            tokens: [{
              type: 'text',
              value: code,
              color: '#24292F'
            }],
            language: 'text'
          };
        }
      }
      
      // Cache the result if performance manager is available
      if (this.performanceManager && result) {
        this.performanceManager.cacheCode(code, normalized, result);
      }
      
      return result;
      
    } catch (error) {
      console.warn('[SyntaxHighlighter] Highlight failed:', error);
      
      // Return plain text on error
      return {
        html: this.escapeHtml(code),
        tokens: [{
          type: 'text',
          value: code,
          color: '#24292F'
        }],
        language: 'text'
      };
    }
  }

  /**
   * Extract tokens from highlighted HTML for DOCX/PDF rendering
   * Tokens include type, value, and color information
   * @param {string} html - Highlighted HTML from highlight.js
   * @returns {Array<Object>} Array of tokens with styling information
   */
  extractTokens(html) {
    const tokens = [];
    
    // Use DOMParser if available (browser environment)
    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
      
      const walk = (node, parentClasses = []) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent;
          if (text) {
            // Determine color based on parent element classes
            const color = this.getColorForClasses(parentClasses);
            const type = this.getTypeForClasses(parentClasses);
            
            tokens.push({
              type,
              value: text,
              color
            });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // Collect classes from this element
          const classes = Array.from(node.classList);
          const allClasses = [...parentClasses, ...classes];
          
          // Recursively process child nodes
          node.childNodes.forEach(child => walk(child, allClasses));
        }
      };
      
      if (doc.body.firstChild) {
        doc.body.firstChild.childNodes.forEach(node => walk(node, []));
      }
    } else {
      // Fallback for non-browser environments (e.g., Node.js tests)
      // Simple regex-based token extraction
      tokens.push(...this.extractTokensRegex(html));
    }
    
    return tokens;
  }

  /**
   * Extract tokens using regex (fallback for non-browser environments)
   * @param {string} html - Highlighted HTML
   * @returns {Array<Object>} Tokens
   */
  extractTokensRegex(html) {
    const tokens = [];
    const spanRegex = /<span class="([^"]+)">([^<]+)<\/span>/g;
    let lastIndex = 0;
    let match;
    
    while ((match = spanRegex.exec(html)) !== null) {
      // Add any text before this span
      if (match.index > lastIndex) {
        const text = html.substring(lastIndex, match.index);
        const plainText = text.replace(/<[^>]+>/g, '');
        if (plainText) {
          tokens.push({
            type: 'text',
            value: plainText,
            color: '#24292F'
          });
        }
      }
      
      // Add the span content
      const classes = match[1].split(' ');
      const text = match[2];
      const color = this.getColorForClasses(classes);
      const type = this.getTypeForClasses(classes);
      
      tokens.push({
        type,
        value: text,
        color
      });
      
      lastIndex = spanRegex.lastIndex;
    }
    
    // Add any remaining text
    if (lastIndex < html.length) {
      const text = html.substring(lastIndex);
      const plainText = text.replace(/<[^>]+>/g, '');
      if (plainText) {
        tokens.push({
          type: 'text',
          value: plainText,
          color: '#24292F'
        });
      }
    }
    
    return tokens;
  }

  /**
   * Get color for a set of CSS classes
   * @param {Array<string>} classes - CSS classes
   * @returns {string} Hex color code
   */
  getColorForClasses(classes) {
    // Try to find a matching color in our map
    for (const cls of classes) {
      if (this.tokenColorMap[cls]) {
        return this.tokenColorMap[cls];
      }
    }
    
    // Default color
    return '#24292F';
  }

  /**
   * Get token type for a set of CSS classes
   * @param {Array<string>} classes - CSS classes
   * @returns {string} Token type
   */
  getTypeForClasses(classes) {
    // Extract the primary type from classes
    for (const cls of classes) {
      if (cls.startsWith('hljs-')) {
        return cls.replace('hljs-', '');
      }
    }
    
    return 'text';
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
   * Get list of supported languages
   * @returns {Array<string>} Array of language names
   */
  getSupportedLanguages() {
    return Array.from(this.loadedLanguages);
  }

  /**
   * Detect language from code using auto-detection
   * Implements fallback to 'text' if detection confidence is low
   * @param {string} code - Source code
   * @returns {string} Detected language or 'text'
   */
  detectLanguage(code) {
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      return 'text';
    }
    
    try {
      const result = this.hljs.highlightAuto(code);
      
      // Only return detected language if confidence is reasonable
      // relevance > 3 indicates reasonable confidence (lowered threshold for short snippets)
      if (result.language && result.relevance > 3) {
        return result.language;
      }
      
      return 'text';
    } catch (error) {
      console.warn('[SyntaxHighlighter] Language detection failed:', error);
      return 'text';
    }
  }
}

export default SyntaxHighlighter;
