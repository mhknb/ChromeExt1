/**
 * LaTeX Renderer
 * Renders LaTeX formulas to HTML (for PDF) and DOCX equation format (OMML)
 * Uses KaTeX for high-quality mathematical typesetting
 */

import katex from 'katex';

class LaTeXRenderer {
  constructor() {
    this.katex = katex;
    
    // Default KaTeX options for HTML rendering
    this.defaultHtmlOptions = {
      throwOnError: false,
      displayMode: false,
      output: 'html',
      strict: false,
      trust: false,
      macros: {}
    };
    
    // LaTeX to OMML (Office Math Markup Language) conversion mappings
    // This is a simplified mapping for common LaTeX commands
    this.latexToOmmlMap = {
      // Greek letters (lowercase)
      '\\alpha': '&#x03B1;',
      '\\beta': '&#x03B2;',
      '\\gamma': '&#x03B3;',
      '\\delta': '&#x03B4;',
      '\\epsilon': '&#x03B5;',
      '\\zeta': '&#x03B6;',
      '\\eta': '&#x03B7;',
      '\\theta': '&#x03B8;',
      '\\iota': '&#x03B9;',
      '\\kappa': '&#x03BA;',
      '\\lambda': '&#x03BB;',
      '\\mu': '&#x03BC;',
      '\\nu': '&#x03BD;',
      '\\xi': '&#x03BE;',
      '\\pi': '&#x03C0;',
      '\\rho': '&#x03C1;',
      '\\sigma': '&#x03C3;',
      '\\tau': '&#x03C4;',
      '\\upsilon': '&#x03C5;',
      '\\phi': '&#x03C6;',
      '\\chi': '&#x03C7;',
      '\\psi': '&#x03C8;',
      '\\omega': '&#x03C9;',
      
      // Greek letters (uppercase)
      '\\Alpha': '&#x0391;',
      '\\Beta': '&#x0392;',
      '\\Gamma': '&#x0393;',
      '\\Delta': '&#x0394;',
      '\\Epsilon': '&#x0395;',
      '\\Zeta': '&#x0396;',
      '\\Eta': '&#x0397;',
      '\\Theta': '&#x0398;',
      '\\Iota': '&#x0399;',
      '\\Kappa': '&#x039A;',
      '\\Lambda': '&#x039B;',
      '\\Mu': '&#x039C;',
      '\\Nu': '&#x039D;',
      '\\Xi': '&#x039E;',
      '\\Pi': '&#x03A0;',
      '\\Rho': '&#x03A1;',
      '\\Sigma': '&#x03A3;',
      '\\Tau': '&#x03A4;',
      '\\Upsilon': '&#x03A5;',
      '\\Phi': '&#x03A6;',
      '\\Chi': '&#x03A7;',
      '\\Psi': '&#x03A8;',
      '\\Omega': '&#x03A9;',
      
      // Mathematical operators
      '\\leq': '&#x2264;',
      '\\geq': '&#x2265;',
      '\\neq': '&#x2260;',
      '\\approx': '&#x2248;',
      '\\infty': '&#x221E;',
      '\\partial': '&#x2202;',
      '\\nabla': '&#x2207;',
      '\\int': '&#x222B;',
      '\\sum': '&#x2211;',
      '\\prod': '&#x220F;',
      '\\sqrt': 'sqrt',
      '\\in': '&#x2208;',
      '\\notin': '&#x2209;',
      '\\subset': '&#x2282;',
      '\\supset': '&#x2283;',
      '\\subseteq': '&#x2286;',
      '\\supseteq': '&#x2287;',
      '\\cup': '&#x222A;',
      '\\cap': '&#x2229;',
      '\\emptyset': '&#x2205;',
      '\\forall': '&#x2200;',
      '\\exists': '&#x2203;',
      '\\neg': '&#x00AC;',
      '\\wedge': '&#x2227;',
      '\\vee': '&#x2228;',
      '\\oplus': '&#x2295;',
      '\\otimes': '&#x2297;',
      '\\perp': '&#x22A5;',
      '\\parallel': '&#x2225;',
      '\\pm': '&#x00B1;',
      '\\mp': '&#x2213;',
      '\\times': '&#x00D7;',
      '\\div': '&#x00F7;',
      '\\cdot': '&#x22C5;',
      '\\circ': '&#x2218;',
      
      // Arrows
      '\\rightarrow': '&#x2192;',
      '\\leftarrow': '&#x2190;',
      '\\leftrightarrow': '&#x2194;',
      '\\Rightarrow': '&#x21D2;',
      '\\Leftarrow': '&#x21D0;',
      '\\Leftrightarrow': '&#x21D4;',
      '\\uparrow': '&#x2191;',
      '\\downarrow': '&#x2193;',
      '\\Uparrow': '&#x21D1;',
      '\\Downarrow': '&#x21D3;',
      
      // Other symbols
      '\\propto': '&#x221D;',
      '\\sim': '&#x223C;',
      '\\equiv': '&#x2261;',
      '\\cong': '&#x2245;',
      '\\top': '&#x22A4;',
      '\\bot': '&#x22A5;'
    };
  }

  /**
   * Render LaTeX to HTML using KaTeX (for PDF export)
   * @param {string} latex - LaTeX formula
   * @param {boolean} displayMode - Block (true) or inline (false) mode
   * @param {Object} options - Additional KaTeX options
   * @returns {string} Rendered HTML
   */
  renderToHtml(latex, displayMode = false, options = {}) {
    if (!latex || typeof latex !== 'string') {
      return '';
    }
    
    // Clean the LaTeX input
    const cleanedLatex = this.cleanLatex(latex);
    
    if (!cleanedLatex) {
      return '';
    }
    
    try {
      // Merge options with defaults
      const renderOptions = {
        ...this.defaultHtmlOptions,
        ...options,
        displayMode
      };
      
      // Render using KaTeX
      const html = this.katex.renderToString(cleanedLatex, renderOptions);
      
      return html;
      
    } catch (error) {
      console.warn('[LaTeXRenderer] KaTeX rendering failed:', error.message);
      
      // Graceful degradation: return the LaTeX as code
      return this.renderAsCode(cleanedLatex, displayMode);
    }
  }

  /**
   * Render LaTeX to DOCX equation format (OMML)
   * This is a simplified conversion that handles common LaTeX commands
   * For complex equations, we convert to Unicode math symbols
   * @param {string} latex - LaTeX formula
   * @returns {Object} DOCX equation object
   */
  renderToDocx(latex) {
    if (!latex || typeof latex !== 'string') {
      return {
        type: 'text',
        content: ''
      };
    }
    
    // Clean the LaTeX input
    const cleanedLatex = this.cleanLatex(latex);
    
    if (!cleanedLatex) {
      return {
        type: 'text',
        content: ''
      };
    }
    
    try {
      // Convert LaTeX to Unicode/OMML representation
      const ommlContent = this.convertToOmml(cleanedLatex);
      
      return {
        type: 'equation',
        content: ommlContent,
        latex: cleanedLatex
      };
      
    } catch (error) {
      console.warn('[LaTeXRenderer] DOCX conversion failed:', error.message);
      
      // Graceful degradation: return as text
      return {
        type: 'text',
        content: cleanedLatex
      };
    }
  }

  /**
   * Convert LaTeX to OMML (Office Math Markup Language) representation
   * This is a simplified conversion for common LaTeX commands
   * @param {string} latex - LaTeX formula
   * @returns {string} OMML/Unicode representation
   */
  convertToOmml(latex) {
    let omml = latex;
    
    // Handle fractions first: \frac{a}{b} -> a/b (simplified)
    omml = omml.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)');
    
    // Handle square root: \sqrt{x}
    omml = omml.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
    
    // Handle text mode: \text{...}
    omml = omml.replace(/\\text\{([^}]+)\}/g, '$1');
    
    // Handle mathbb (blackboard bold): \mathbb{R} -> ℝ
    const mathbbMap = {
      'R': '&#x211D;',
      'C': '&#x2102;',
      'N': '&#x2115;',
      'Z': '&#x2124;',
      'Q': '&#x211A;'
    };
    omml = omml.replace(/\\mathbb\{([RCNZQ])\}/g, (match, letter) => {
      return mathbbMap[letter] || letter;
    });
    
    // Replace LaTeX commands with Unicode equivalents
    for (const [latexCmd, unicodeOrOmml] of Object.entries(this.latexToOmmlMap)) {
      const regex = new RegExp(latexCmd.replace(/\\/g, '\\\\'), 'g');
      omml = omml.replace(regex, unicodeOrOmml);
    }
    
    // Handle superscripts: ^{x} or ^x
    omml = omml.replace(/\^{([^}]+)}/g, '^($1)');
    omml = omml.replace(/\^(\w)/g, '^$1');
    
    // Handle subscripts: _{x} or _x
    omml = omml.replace(/_{([^}]+)}/g, '_($1)');
    omml = omml.replace(/_(\w)/g, '_$1');
    
    // Remove remaining backslashes from unknown commands
    omml = omml.replace(/\\([a-zA-Z]+)/g, '$1');
    
    // Clean up extra braces
    omml = omml.replace(/[{}]/g, '');
    
    return omml;
  }

  /**
   * Clean LaTeX input by removing delimiters and trimming
   * @param {string} latex - Raw LaTeX input
   * @returns {string} Cleaned LaTeX
   */
  cleanLatex(latex) {
    if (!latex) return '';
    
    let cleaned = latex.trim();
    
    // Remove common LaTeX delimiters
    // Remove $...$ or $$...$$ delimiters
    cleaned = cleaned.replace(/^\$+/, '').replace(/\$+$/, '');
    
    // Remove \(...\) or \[...\] delimiters
    cleaned = cleaned.replace(/^\\\(/, '').replace(/\\\)$/, '');
    cleaned = cleaned.replace(/^\\\[/, '').replace(/\\\]$/, '');
    
    return cleaned.trim();
  }

  /**
   * Render LaTeX as code block (fallback for errors)
   * @param {string} latex - LaTeX formula
   * @param {boolean} displayMode - Block or inline mode
   * @returns {string} HTML code block
   */
  renderAsCode(latex, displayMode) {
    const escaped = this.escapeHtml(latex);
    
    if (displayMode) {
      return `<pre><code class="language-latex">${escaped}</code></pre>`;
    } else {
      return `<code class="language-latex">${escaped}</code>`;
    }
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
   * Validate LaTeX syntax
   * Attempts to parse with KaTeX to check for errors
   * @param {string} latex - LaTeX formula
   * @returns {boolean} True if valid, false otherwise
   */
  validate(latex) {
    if (!latex || typeof latex !== 'string') {
      return false;
    }
    
    const cleanedLatex = this.cleanLatex(latex);
    
    if (!cleanedLatex) {
      return false;
    }
    
    try {
      // Try to render with KaTeX in strict mode
      this.katex.renderToString(cleanedLatex, {
        throwOnError: true,
        displayMode: false,
        strict: 'warn'
      });
      
      return true;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Extract LaTeX formulas from markdown text
   * Finds both inline ($...$) and block ($$...$$) formulas
   * @param {string} markdown - Markdown text
   * @returns {Array<Object>} Array of formula objects
   */
  extractFormulas(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return [];
    }
    
    const formulas = [];
    
    // Extract block formulas ($$...$$)
    const blockRegex = /\$\$([^$]+)\$\$/g;
    let match;
    
    while ((match = blockRegex.exec(markdown)) !== null) {
      formulas.push({
        type: 'block',
        formula: match[1].trim(),
        position: match.index,
        length: match[0].length
      });
    }
    
    // Extract inline formulas ($...$)
    // Avoid matching block formulas
    const inlineRegex = /(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g;
    
    while ((match = inlineRegex.exec(markdown)) !== null) {
      formulas.push({
        type: 'inline',
        formula: match[1].trim(),
        position: match.index,
        length: match[0].length
      });
    }
    
    // Sort by position
    formulas.sort((a, b) => a.position - b.position);
    
    return formulas;
  }

  /**
   * Render all LaTeX formulas in markdown to HTML
   * @param {string} markdown - Markdown text with LaTeX
   * @returns {string} HTML with rendered formulas
   */
  renderMarkdownToHtml(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }
    
    let html = markdown;
    const formulas = this.extractFormulas(markdown);
    
    // Process formulas in reverse order to maintain positions
    for (let i = formulas.length - 1; i >= 0; i--) {
      const formula = formulas[i];
      const displayMode = formula.type === 'block';
      
      // Render the formula
      const rendered = this.renderToHtml(formula.formula, displayMode);
      
      // Replace in the text
      const start = formula.position;
      const end = start + formula.length;
      html = html.substring(0, start) + rendered + html.substring(end);
    }
    
    return html;
  }

  /**
   * Get KaTeX version
   * @returns {string} KaTeX version
   */
  getVersion() {
    return this.katex.version || 'unknown';
  }
}

export default LaTeXRenderer;
