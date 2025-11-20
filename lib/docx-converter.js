/**
 * DOCX Generator using markdown-to-docx approach
 * Converts markdown to proper DOCX format
 */

// Import via dynamic import (ESM)
async function loadDocxLibraries() {
  try {
    // Try to load from esm.sh CDN
    const modules = await import('https://esm.sh/mdast-util-from-markdown@2.0.0');
    return modules;
  } catch (error) {
    console.error('Failed to load markdown parser:', error);
    throw new Error('DOCX kütüphanesi yüklenemedi');
  }
}

class DocxConverter {
  constructor() {
    this.mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    this.loaded = false;
  }

  /**
   * Convert markdown text to DOCX using proper library
   */
  async convertMarkdownToDocx(markdown) {
    try {
      // Use docx library approach
      const blob = await this.createDocxWithDocxLib(markdown);
      return blob;
    } catch (error) {
      console.error('DOCX conversion failed:', error);
      throw error;
    }
  }

  /**
   * Create DOCX using docx.js approach (lightweight alternative)
   */
  async createDocxWithDocxLib(markdown) {
    // Parse markdown to structured data
    const sections = this.parseMarkdownToSections(markdown);

    // Create DOCX structure
    const docxContent = await this.buildDocxContent(sections);

    return docxContent;
  }

  /**
   * Parse markdown into structured sections
   */
  parseMarkdownToSections(markdown) {
    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = { type: 'paragraph', content: [] };

    for (let line of lines) {
      const trimmed = line.trim();

      // Heading
      if (trimmed.match(/^#{1,6}\s/)) {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        const level = trimmed.match(/^#+/)[0].length;
        const text = trimmed.replace(/^#+\s*/, '');
        sections.push({
          type: 'heading',
          level: level,
          content: [{ text: text, bold: true }]
        });
        currentSection = { type: 'paragraph', content: [] };
      }
      // Empty line
      else if (trimmed === '') {
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
          currentSection = { type: 'paragraph', content: [] };
        }
      }
      // Regular text
      else {
        const textRuns = this.parseInlineFormatting(line);
        currentSection.content.push(...textRuns);
      }
    }

    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Parse inline formatting (bold, italic)
   */
  parseInlineFormatting(text) {
    const runs = [];
    let currentText = '';
    let i = 0;

    while (i < text.length) {
      // Bold **text**
      if (text.substr(i, 2) === '**') {
        if (currentText) {
          runs.push({ text: currentText });
          currentText = '';
        }
        i += 2;
        let boldText = '';
        while (i < text.length && text.substr(i, 2) !== '**') {
          boldText += text[i];
          i++;
        }
        if (text.substr(i, 2) === '**') {
          runs.push({ text: boldText, bold: true });
          i += 2;
        } else {
          currentText += '**' + boldText;
        }
      }
      // Italic *text*
      else if (text[i] === '*' && text[i + 1] !== '*') {
        if (currentText) {
          runs.push({ text: currentText });
          currentText = '';
        }
        i++;
        let italicText = '';
        while (i < text.length && text[i] !== '*') {
          italicText += text[i];
          i++;
        }
        if (text[i] === '*') {
          runs.push({ text: italicText, italic: true });
          i++;
        } else {
          currentText += '*' + italicText;
        }
      }
      else {
        currentText += text[i];
        i++;
      }
    }

    if (currentText) {
      runs.push({ text: currentText });
    }

    return runs.length > 0 ? runs : [{ text: text }];
  }

  /**
   * Build DOCX content using proper Open XML format
   */
  async buildDocxContent(sections) {
    // Create proper ZIP structure with all required files
    const files = this.createDocxFiles(sections);

    // Use JSZip to create proper ZIP
    const zipBlob = await this.createProperZip(files);

    return zipBlob;
  }

  /**
   * Create all required DOCX XML files
   */
  createDocxFiles(sections) {
    return {
      '[Content_Types].xml': this.createContentTypes(),
      '_rels/.rels': this.createRootRels(),
      'word/document.xml': this.createDocument(sections),
      'word/_rels/document.xml.rels': this.createDocumentRels(),
      'word/styles.xml': this.createStyles(),
      'docProps/core.xml': this.createCoreProperties(),
      'docProps/app.xml': this.createAppProperties()
    };
  }

  createContentTypes() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
  }

  createRootRels() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
  }

  createDocument(sections) {
    const paragraphs = sections.map(section => {
      if (section.type === 'heading') {
        return this.createHeadingParagraph(section);
      } else {
        return this.createNormalParagraph(section);
      }
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
${paragraphs}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;
  }

  createHeadingParagraph(section) {
    const fontSize = (7 - section.level) * 4 + 24; // 52, 48, 44, 40, 36, 32, 28
    const runs = section.content.map(run => this.createRun(run, fontSize)).join('\n');

    return `    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading${section.level}"/>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
${runs}
    </w:p>`;
  }

  createNormalParagraph(section) {
    const runs = section.content.map(run => this.createRun(run)).join('\n');

    return `    <w:p>
      <w:pPr>
        <w:spacing w:after="160"/>
      </w:pPr>
${runs}
    </w:p>`;
  }

  createRun(run, fontSize = 22) {
    const text = this.escapeXml(run.text);
    let properties = '';

    if (run.bold) {
      properties += '        <w:b/>\n';
    }
    if (run.italic) {
      properties += '        <w:i/>\n';
    }
    properties += `        <w:sz w:val="${fontSize}"/>\n`;

    return `      <w:r>
        <w:rPr>
${properties}        </w:rPr>
        <w:t xml:space="preserve">${text}</w:t>
      </w:r>`;
  }

  createDocumentRels() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  }

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
</w:styles>`;
  }

  createCoreProperties() {
    const now = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
                   xmlns:dc="http://purl.org/dc/elements/1.1/"
                   xmlns:dcterms="http://purl.org/dc/terms/"
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:creator>AI Content Exporter</dc:creator>
  <cp:lastModifiedBy>AI Content Exporter</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`;
  }

  createAppProperties() {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>AI Content Exporter</Application>
</Properties>`;
  }

  escapeXml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Create proper ZIP using local ZipGenerator
   */
  async createProperZip(files) {
    try {
      // Use local ZipGenerator (loaded via content script)
      const zip = new window.ZipGenerator();

      // Add all files to ZIP
      for (const [path, content] of Object.entries(files)) {
        zip.addFile(path, content);
      }

      // Generate ZIP blob
      const blob = zip.generate();
      return blob;
    } catch (error) {
      console.error('ZIP generation failed:', error);
      throw new Error('DOCX oluşturulamadı: ' + error.message);
    }
  }
}

// Export
window.DocxConverter = DocxConverter;
