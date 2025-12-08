/**
 * Enhanced DOCX Exporter
 * High-quality DOCX export with syntax highlighting, LaTeX equations,
 * custom fonts, headers/footers, and professional styling
 */

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import SyntaxHighlighter from './syntax-highlighter.js';
import LaTeXRenderer from './latex-renderer.js';
import ImageHandler from './image-handler.js';

class DocxExporterEnhanced {
  constructor() {
    this.mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    this.syntaxHighlighter = new SyntaxHighlighter();
    this.latexRenderer = new LaTeXRenderer();
    this.imageHandler = new ImageHandler();
    
    // Unicode math symbol normalization map
    this.unicodeMathMap = {
      '≤': '\\leq',
      '≥': '\\geq',
      '≠': '\\neq',
      '≈': '\\approx',
      '∞': '\\infty',
      '∂': '\\partial',
      '∇': '\\nabla',
      '∫': '\\int',
      '∑': '\\sum',
      '∏': '\\prod',
      '√': '\\sqrt',
      '∈': '\\in',
      '∉': '\\notin',
      '⊂': '\\subset',
      '⊃': '\\supset',
      '⊆': '\\subseteq',
      '⊇': '\\supseteq',
      '∪': '\\cup',
      '∩': '\\cap',
      '∅': '\\emptyset',
      '∀': '\\forall',
      '∃': '\\exists',
      '¬': '\\neg',
      '∧': '\\wedge',
      '∨': '\\vee',
      '⊕': '\\oplus',
      '⊗': '\\otimes',
      '⊥': '\\perp',
      '∥': '\\parallel',
      '±': '\\pm',
      '∓': '\\mp',
      '×': '\\times',
      '÷': '\\div',
      '⋅': '\\cdot',
      '∘': '\\circ',
      '→': '\\rightarrow',
      '←': '\\leftarrow',
      '↔': '\\leftrightarrow',
      '⇒': '\\Rightarrow',
      '⇐': '\\Leftarrow',
      '⇔': '\\Leftrightarrow',
      '↑': '\\uparrow',
      '↓': '\\downarrow',
      '⇑': '\\Uparrow',
      '⇓': '\\Downarrow',
      '∝': '\\propto',
      '∼': '\\sim',
      '≡': '\\equiv',
      '≅': '\\cong',
      '⊤': '\\top',
      '⊥': '\\bot',
      // Greek letters
      'α': '\\alpha',
      'β': '\\beta',
      'γ': '\\gamma',
      'δ': '\\delta',
      'ε': '\\epsilon',
      'ζ': '\\zeta',
      'η': '\\eta',
      'θ': '\\theta',
      'ι': '\\iota',
      'κ': '\\kappa',
      'λ': '\\lambda',
      'μ': '\\mu',
      'ν': '\\nu',
      'ξ': '\\xi',
      'π': '\\pi',
      'ρ': '\\rho',
      'σ': '\\sigma',
      'τ': '\\tau',
      'υ': '\\upsilon',
      'φ': '\\phi',
      'χ': '\\chi',
      'ψ': '\\psi',
      'ω': '\\omega',
      'Γ': '\\Gamma',
      'Δ': '\\Delta',
      'Θ': '\\Theta',
      'Λ': '\\Lambda',
      'Ξ': '\\Xi',
      'Π': '\\Pi',
      'Σ': '\\Sigma',
      'Φ': '\\Phi',
      'Ψ': '\\Psi',
      'Ω': '\\Omega'
    };
  }

  /**
   * Convert markdown to DOCX with enhanced features
   * @param {string} markdown - Markdown content
   * @param {Object} options - Export options
   * @returns {Promise<Blob>} DOCX blob
   */
  async convertMarkdownToDocx(markdown, options = {}) {
    try {
      // Normalize Unicode math symbols to LaTeX
      const normalizedMarkdown = this.normalizeUnicodeMath(markdown);
      
      // Parse markdown to MDAST
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath);
      
      const mdast = processor.parse(normalizedMarkdown);
      
      // Convert MDAST to DOCX structure
      const docxStructure = await this.convertMdastToDocx(mdast, options);
      
      // Generate DOCX blob
      const blob = await this.generateDocxBlob(docxStructure, options);
      
      return blob;
      
    } catch (error) {
      console.error('[DocxExporterEnhanced] Conversion failed:', error);
      throw new Error('DOCX dönüşümü başarısız: ' + error.message);
    }
  }

  /**
   * Normalize Unicode math symbols to LaTeX commands
   * @param {string} text - Text with Unicode math symbols
   * @returns {string} Text with LaTeX commands
   */
  normalizeUnicodeMath(text) {
    let normalized = text;
    
    for (const [unicode, latex] of Object.entries(this.unicodeMathMap)) {
      const regex = new RegExp(unicode, 'g');
      normalized = normalized.replace(regex, latex);
    }
    
    return normalized;
  }

  /**
   * Convert MDAST to DOCX structure
   * @param {Object} mdast - Markdown AST
   * @param {Object} options - Export options
   * @returns {Promise<Object>} DOCX structure
   */
  async convertMdastToDocx(mdast, options) {
    const sections = [];
    
    // Process each node in the MDAST
    for (const node of mdast.children) {
      const section = await this.processNode(node, options);
      if (section) {
        sections.push(section);
      }
    }
    
    return {
      sections,
      metadata: {
        title: options.title || 'AI Export',
        creator: 'AI Content Exporter',
        date: new Date()
      }
    };
  }

  /**
   * Process a single MDAST node
   * @param {Object} node - MDAST node
   * @param {Object} options - Export options
   * @returns {Promise<Object>} DOCX section
   */
  async processNode(node, options) {
    switch (node.type) {
      case 'heading':
        return this.processHeading(node);
      
      case 'paragraph':
        return this.processParagraph(node);
      
      case 'code':
        return this.processCodeBlock(node);
      
      case 'table':
        return this.processTable(node);
      
      case 'math':
        return this.processMath(node, true); // block math
      
      case 'inlineMath':
        return this.processMath(node, false); // inline math
      
      case 'list':
        return this.processList(node);
      
      case 'blockquote':
        return this.processBlockquote(node);
      
      default:
        return null;
    }
  }

  /**
   * Process heading node
   * @param {Object} node - Heading node
   * @returns {Object} DOCX heading section
   */
  processHeading(node) {
    const level = node.depth; // 1-6
    const text = this.extractText(node);
    
    return {
      type: 'heading',
      level: level,
      style: `Heading${level}`,
      content: [{
        text: text,
        bold: true
      }]
    };
  }

  /**
   * Process paragraph node
   * @param {Object} node - Paragraph node
   * @returns {Object} DOCX paragraph section
   */
  processParagraph(node) {
    const runs = this.processInlineContent(node.children);
    
    return {
      type: 'paragraph',
      content: runs
    };
  }

  /**
   * Process code block with syntax highlighting
   * @param {Object} node - Code node
   * @returns {Object} DOCX code block section
   */
  processCodeBlock(node) {
    const code = node.value || '';
    const language = node.lang || 'text';
    
    // Highlight code
    const highlighted = this.syntaxHighlighter.highlight(code, language);
    
    // Convert tokens to DOCX runs with colors
    const runs = highlighted.tokens.map(token => ({
      text: token.value,
      font: 'Source Code Pro',
      fontSize: 20, // 10pt
      color: token.color,
      preserveWhitespace: true
    }));
    
    return {
      type: 'codeBlock',
      language: highlighted.language,
      content: runs,
      background: '#F6F8FA' // Light gray background
    };
  }

  /**
   * Process table with enhanced styling
   * @param {Object} node - Table node
   * @returns {Object} DOCX table section
   */
  processTable(node) {
    const rows = [];
    
    // Process table rows
    for (const row of node.children) {
      const cells = [];
      
      for (const cell of row.children) {
        const content = this.processInlineContent(cell.children);
        cells.push({
          content: content,
          align: cell.align || 'left'
        });
      }
      
      rows.push({
        cells: cells,
        isHeader: row.type === 'tableRow' && rows.length === 0
      });
    }
    
    return {
      type: 'table',
      rows: rows,
      borders: true,
      headerBackground: '#F6F8FA'
    };
  }

  /**
   * Process math node (LaTeX equation)
   * @param {Object} node - Math node
   * @param {boolean} displayMode - Block or inline
   * @returns {Object} DOCX math section
   */
  processMath(node, displayMode) {
    const latex = node.value || '';
    
    // Convert LaTeX to DOCX equation format
    const equation = this.latexRenderer.renderToDocx(latex);
    
    return {
      type: displayMode ? 'mathBlock' : 'mathInline',
      equation: equation,
      latex: latex
    };
  }

  /**
   * Process list node
   * @param {Object} node - List node
   * @returns {Object} DOCX list section
   */
  processList(node) {
    const items = [];
    
    for (const item of node.children) {
      const content = this.processInlineContent(item.children[0]?.children || []);
      items.push({
        content: content,
        level: 0
      });
    }
    
    return {
      type: 'list',
      ordered: node.ordered || false,
      items: items
    };
  }

  /**
   * Process blockquote node
   * @param {Object} node - Blockquote node
   * @returns {Object} DOCX blockquote section
   */
  processBlockquote(node) {
    const content = this.processInlineContent(node.children[0]?.children || []);
    
    return {
      type: 'blockquote',
      content: content
    };
  }

  /**
   * Process inline content (text, emphasis, strong, code, etc.)
   * @param {Array} children - Child nodes
   * @returns {Array} DOCX runs
   */
  processInlineContent(children) {
    const runs = [];
    
    for (const child of children) {
      switch (child.type) {
        case 'text':
          runs.push({
            text: child.value
          });
          break;
        
        case 'strong':
          runs.push({
            text: this.extractText(child),
            bold: true
          });
          break;
        
        case 'emphasis':
          runs.push({
            text: this.extractText(child),
            italic: true
          });
          break;
        
        case 'inlineCode':
          runs.push({
            text: child.value,
            font: 'Source Code Pro',
            fontSize: 20,
            background: '#F6F8FA'
          });
          break;
        
        case 'inlineMath':
          const equation = this.latexRenderer.renderToDocx(child.value);
          runs.push({
            text: equation.content,
            isEquation: true
          });
          break;
        
        case 'link':
          runs.push({
            text: this.extractText(child),
            link: child.url,
            color: '#0969DA'
          });
          break;
        
        default:
          if (child.children) {
            runs.push(...this.processInlineContent(child.children));
          }
      }
    }
    
    return runs;
  }

  /**
   * Extract plain text from a node
   * @param {Object} node - MDAST node
   * @returns {string} Plain text
   */
  extractText(node) {
    if (node.type === 'text') {
      return node.value;
    }
    
    if (node.children) {
      return node.children.map(child => this.extractText(child)).join('');
    }
    
    return '';
  }

  /**
   * Generate DOCX blob from structure
   * @param {Object} structure - DOCX structure
   * @param {Object} options - Export options
   * @returns {Promise<Blob>} DOCX blob
   */
  async generateDocxBlob(structure, options) {
    const files = this.createDocxFiles(structure, options);
    const blob = await this.createZip(files);
    return blob;
  }

  /**
   * Create all DOCX XML files
   * @param {Object} structure - DOCX structure
   * @param {Object} options - Export options
   * @returns {Object} File map
   */
  createDocxFiles(structure, options) {
    return {
      '[Content_Types].xml': this.createContentTypes(),
      '_rels/.rels': this.createRootRels(),
      'word/document.xml': this.createDocument(structure, options),
      'word/_rels/document.xml.rels': this.createDocumentRels(),
      'word/styles.xml': this.createStyles(),
      'word/numbering.xml': this.createNumbering(),
      'word/fontTable.xml': this.createFontTable(),
      'word/header1.xml': this.createHeader(structure.metadata),
      'word/footer1.xml': this.createFooter(structure.metadata),
      'docProps/core.xml': this.createCoreProperties(structure.metadata),
      'docProps/app.xml': this.createAppProperties()
    };
  }

  /**
   * Create Content Types XML
   */
  createContentTypes() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/word/fontTable.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
  }

  /**
   * Create Root Relationships XML
   */
  createRootRels() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
  }

  /**
   * Create Document Relationships XML
   */
  createDocumentRels() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable" Target="fontTable.xml"/>
  <Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`;
  }

  /**
   * Create Document XML
   */
  createDocument(structure, options) {
    const paragraphs = structure.sections.map(section => {
      return this.createSection(section);
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math">
  <w:body>
${paragraphs}
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId4"/>
      <w:footerReference w:type="default" r:id="rId5"/>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
      <w:cols w:space="720"/>
    </w:sectPr>
  </w:body>
</w:document>`;
  }

  /**
   * Create a section (paragraph, heading, table, etc.)
   */
  createSection(section) {
    switch (section.type) {
      case 'heading':
        return this.createHeadingParagraph(section);
      
      case 'paragraph':
        return this.createNormalParagraph(section);
      
      case 'codeBlock':
        return this.createCodeBlockParagraph(section);
      
      case 'table':
        return this.createTableElement(section);
      
      case 'mathBlock':
        return this.createMathParagraph(section, true);
      
      case 'list':
        return this.createListItems(section);
      
      case 'blockquote':
        return this.createBlockquoteParagraph(section);
      
      default:
        return '';
    }
  }

  /**
   * Create heading paragraph with style
   */
  createHeadingParagraph(section) {
    const runs = section.content.map(run => this.createRun(run)).join('\n');
    
    return `    <w:p>
      <w:pPr>
        <w:pStyle w:val="${section.style}"/>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
${runs}
    </w:p>`;
  }

  /**
   * Create normal paragraph
   */
  createNormalParagraph(section) {
    const runs = section.content.map(run => this.createRun(run)).join('\n');
    
    return `    <w:p>
      <w:pPr>
        <w:spacing w:after="160"/>
      </w:pPr>
${runs}
    </w:p>`;
  }

  /**
   * Create code block paragraph with syntax highlighting
   */
  createCodeBlockParagraph(section) {
    const runs = section.content.map(run => this.createRun(run)).join('\n');
    
    return `    <w:p>
      <w:pPr>
        <w:shd w:val="clear" w:color="auto" w:fill="F6F8FA"/>
        <w:spacing w:before="120" w:after="120"/>
        <w:ind w:left="240" w:right="240"/>
      </w:pPr>
${runs}
    </w:p>`;
  }

  /**
   * Create table element with borders and styling
   */
  createTableElement(section) {
    const rows = section.rows.map((row, rowIndex) => {
      const cells = row.cells.map(cell => {
        const runs = cell.content.map(run => this.createRun(run)).join('\n');
        const background = row.isHeader ? section.headerBackground : 'auto';
        
        return `        <w:tc>
          <w:tcPr>
            <w:shd w:val="clear" w:color="auto" w:fill="${background}"/>
            <w:tcBorders>
              <w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
              <w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
              <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
              <w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
            </w:tcBorders>
          </w:tcPr>
          <w:p>
${runs}
          </w:p>
        </w:tc>`;
      }).join('\n');
      
      return `      <w:tr>
${cells}
      </w:tr>`;
    }).join('\n');
    
    return `    <w:tbl>
      <w:tblPr>
        <w:tblStyle w:val="TableGrid"/>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="CCCCCC"/>
        </w:tblBorders>
      </w:tblPr>
${rows}
    </w:tbl>`;
  }

  /**
   * Create math paragraph
   */
  createMathParagraph(section, displayMode) {
    const mathContent = this.escapeXml(section.equation.content);
    
    return `    <w:p>
      <w:pPr>
        <w:jc w:val="${displayMode ? 'center' : 'left'}"/>
      </w:pPr>
      <w:r>
        <w:t>${mathContent}</w:t>
      </w:r>
    </w:p>`;
  }

  /**
   * Create list items
   */
  createListItems(section) {
    return section.items.map((item, index) => {
      const runs = item.content.map(run => this.createRun(run)).join('\n');
      
      return `    <w:p>
      <w:pPr>
        <w:pStyle w:val="ListParagraph"/>
        <w:numPr>
          <w:ilvl w:val="${item.level}"/>
          <w:numId w:val="${section.ordered ? '1' : '2'}"/>
        </w:numPr>
      </w:pPr>
${runs}
    </w:p>`;
    }).join('\n');
  }

  /**
   * Create blockquote paragraph
   */
  createBlockquoteParagraph(section) {
    const runs = section.content.map(run => this.createRun(run)).join('\n');
    
    return `    <w:p>
      <w:pPr>
        <w:pStyle w:val="Quote"/>
        <w:ind w:left="720"/>
      </w:pPr>
${runs}
    </w:p>`;
  }

  /**
   * Create a text run with formatting
   */
  createRun(run, defaultFontSize = 22) {
    const text = this.escapeXml(run.text || '');
    let properties = '';
    
    // Font
    if (run.font) {
      properties += `        <w:rFonts w:ascii="${run.font}" w:hAnsi="${run.font}"/>\n`;
    }
    
    // Bold
    if (run.bold) {
      properties += '        <w:b/>\n';
    }
    
    // Italic
    if (run.italic) {
      properties += '        <w:i/>\n';
    }
    
    // Font size
    const fontSize = run.fontSize || defaultFontSize;
    properties += `        <w:sz w:val="${fontSize}"/>\n`;
    
    // Color
    if (run.color) {
      const color = run.color.replace('#', '');
      properties += `        <w:color w:val="${color}"/>\n`;
    }
    
    // Background (shading)
    if (run.background) {
      const bg = run.background.replace('#', '');
      properties += `        <w:shd w:val="clear" w:color="auto" w:fill="${bg}"/>\n`;
    }
    
    // Preserve whitespace for code
    const xmlSpace = run.preserveWhitespace ? ' xml:space="preserve"' : '';
    
    return `      <w:r>
        <w:rPr>
${properties}        </w:rPr>
        <w:t${xmlSpace}>${text}</w:t>
      </w:r>`;
  }

  /**
   * Create Styles XML with heading styles
   */
  createStyles() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="22"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
  
  <!-- Heading 1 -->
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="Heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="480" w:after="240"/>
      <w:outlineLvl w:val="0"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="52"/>
      <w:color w:val="2E74B5"/>
    </w:rPr>
  </w:style>
  
  <!-- Heading 2 -->
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="Heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="360" w:after="180"/>
      <w:outlineLvl w:val="1"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="44"/>
      <w:color w:val="2E74B5"/>
    </w:rPr>
  </w:style>
  
  <!-- Heading 3 -->
  <w:style w:type="paragraph" w:styleId="Heading3">
    <w:name w:val="Heading 3"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120"/>
      <w:outlineLvl w:val="2"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="36"/>
      <w:color w:val="1F4D78"/>
    </w:rPr>
  </w:style>
  
  <!-- Heading 4 -->
  <w:style w:type="paragraph" w:styleId="Heading4">
    <w:name w:val="Heading 4"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="240" w:after="120"/>
      <w:outlineLvl w:val="3"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="32"/>
      <w:color w:val="1F4D78"/>
    </w:rPr>
  </w:style>
  
  <!-- Heading 5 -->
  <w:style w:type="paragraph" w:styleId="Heading5">
    <w:name w:val="Heading 5"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="120" w:after="60"/>
      <w:outlineLvl w:val="4"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="28"/>
      <w:color w:val="2E74B5"/>
    </w:rPr>
  </w:style>
  
  <!-- Heading 6 -->
  <w:style w:type="paragraph" w:styleId="Heading6">
    <w:name w:val="Heading 6"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:pPr>
      <w:spacing w:before="120" w:after="60"/>
      <w:outlineLvl w:val="5"/>
    </w:pPr>
    <w:rPr>
      <w:b/>
      <w:sz w:val="24"/>
      <w:color w:val="1F4D78"/>
    </w:rPr>
  </w:style>
  
  <!-- List Paragraph -->
  <w:style w:type="paragraph" w:styleId="ListParagraph">
    <w:name w:val="List Paragraph"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:ind w:left="720"/>
    </w:pPr>
  </w:style>
  
  <!-- Quote -->
  <w:style w:type="paragraph" w:styleId="Quote">
    <w:name w:val="Quote"/>
    <w:basedOn w:val="Normal"/>
    <w:pPr>
      <w:ind w:left="720"/>
    </w:pPr>
    <w:rPr>
      <w:i/>
      <w:color w:val="6E7781"/>
    </w:rPr>
  </w:style>
</w:styles>`;
  }

  /**
   * Create Numbering XML for lists
   */
  createNumbering() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <!-- Ordered list -->
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="decimal"/>
      <w:lvlText w:val="%1."/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:ind w:left="720" w:hanging="360"/>
      </w:pPr>
    </w:lvl>
  </w:abstractNum>
  
  <!-- Unordered list -->
  <w:abstractNum w:abstractNumId="1">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr>
        <w:ind w:left="720" w:hanging="360"/>
      </w:pPr>
    </w:lvl>
  </w:abstractNum>
  
  <w:num w:numId="1">
    <w:abstractNumId w:val="0"/>
  </w:num>
  
  <w:num w:numId="2">
    <w:abstractNumId w:val="1"/>
  </w:num>
</w:numbering>`;
  }

  /**
   * Create Font Table XML with custom fonts
   */
  createFontTable() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
         xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:font w:name="Calibri">
    <w:panose1 w:val="020F0502020204030204"/>
    <w:charset w:val="00"/>
    <w:family w:val="swiss"/>
    <w:pitch w:val="variable"/>
  </w:font>
  
  <w:font w:name="Source Code Pro">
    <w:panose1 w:val="02070309020205020404"/>
    <w:charset w:val="00"/>
    <w:family w:val="modern"/>
    <w:pitch w:val="fixed"/>
  </w:font>
</w:fonts>`;
  }

  /**
   * Create Header XML with title
   */
  createHeader(metadata) {
    const title = this.escapeXml(metadata.title || 'AI Export');
    
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:sz w:val="20"/>
        <w:color w:val="6E7781"/>
      </w:rPr>
      <w:t>${title}</w:t>
    </w:r>
  </w:p>
</w:hdr>`;
  }

  /**
   * Create Footer XML with page numbers and date
   */
  createFooter(metadata) {
    const date = metadata.date ? metadata.date.toLocaleDateString() : new Date().toLocaleDateString();
    
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:sz w:val="18"/>
        <w:color w:val="6E7781"/>
      </w:rPr>
      <w:t>${date} - Page </w:t>
    </w:r>
    <w:r>
      <w:rPr>
        <w:sz w:val="18"/>
        <w:color w:val="6E7781"/>
      </w:rPr>
      <w:fldChar w:fldCharType="begin"/>
    </w:r>
    <w:r>
      <w:rPr>
        <w:sz w:val="18"/>
        <w:color w:val="6E7781"/>
      </w:rPr>
      <w:instrText xml:space="preserve"> PAGE </w:instrText>
    </w:r>
    <w:r>
      <w:rPr>
        <w:sz w:val="18"/>
        <w:color w:val="6E7781"/>
      </w:rPr>
      <w:fldChar w:fldCharType="end"/>
    </w:r>
  </w:p>
</w:ftr>`;
  }

  /**
   * Create Core Properties XML
   */
  createCoreProperties(metadata) {
    const now = new Date().toISOString();
    const title = this.escapeXml(metadata.title || 'AI Export');
    const creator = this.escapeXml(metadata.creator || 'AI Content Exporter');
    
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${title}</dc:title>
  <dc:creator>${creator}</dc:creator>
  <cp:lastModifiedBy>${creator}</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
  }

  /**
   * Create App Properties XML
   */
  createAppProperties() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>AI Content Exporter</Application>
  <AppVersion>2.0</AppVersion>
</Properties>`;
  }

  /**
   * Escape XML special characters
   */
  escapeXml(text) {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Create ZIP file from file map
   */
  async createZip(files) {
    try {
      // Use ZipGenerator if available (browser environment)
      if (typeof window !== 'undefined' && window.ZipGenerator) {
        const zip = new window.ZipGenerator();
        
        for (const [path, content] of Object.entries(files)) {
          zip.addFile(path, content);
        }
        
        return zip.generate();
      }
      
      // Fallback: throw error if ZipGenerator not available
      throw new Error('ZipGenerator not available');
      
    } catch (error) {
      console.error('[DocxExporterEnhanced] ZIP generation failed:', error);
      throw new Error('DOCX oluşturulamadı: ' + error.message);
    }
  }
}

export default DocxExporterEnhanced;
