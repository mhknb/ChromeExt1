/**
 * Tests for PDF Quality Exporter
 */

import { describe, test, expect, beforeEach } from 'vitest';
import PdfQualityExporter from '../src/pdf-quality-exporter.js';

describe('PdfQualityExporter', () => {
  let exporter;

  beforeEach(() => {
    exporter = new PdfQualityExporter();
  });

  describe('Constructor', () => {
    test('should initialize with syntax highlighter and latex renderer', () => {
      expect(exporter.syntaxHighlighter).toBeDefined();
      expect(exporter.latexRenderer).toBeDefined();
    });

    test('should initialize with default settings', () => {
      expect(exporter.defaultSettings).toBeDefined();
      expect(exporter.defaultSettings.pageSize).toBe('A4');
      expect(exporter.defaultSettings.pageMargins).toEqual([60, 80, 60, 80]);
    });

    test('should initialize with empty headings array', () => {
      expect(exporter.headings).toEqual([]);
    });

    test('should have all required styles defined', () => {
      const styles = exporter.defaultSettings.styles;
      expect(styles.h1).toBeDefined();
      expect(styles.h2).toBeDefined();
      expect(styles.h3).toBeDefined();
      expect(styles.paragraph).toBeDefined();
      expect(styles.codeBlock).toBeDefined();
      expect(styles.tableHeader).toBeDefined();
    });
  });

  describe('extractPlainText', () => {
    test('should extract plain text from string', () => {
      const result = exporter.extractPlainText('Hello World');
      expect(result).toBe('Hello World');
    });

    test('should extract plain text from array', () => {
      const result = exporter.extractPlainText(['Hello', ' ', 'World']);
      expect(result).toBe('Hello World');
    });

    test('should extract plain text from object with text property', () => {
      const result = exporter.extractPlainText({ text: 'Hello World' });
      expect(result).toBe('Hello World');
    });

    test('should extract plain text from nested structure', () => {
      const result = exporter.extractPlainText([
        'Hello',
        { text: ' World' },
        { text: ['!'] }
      ]);
      expect(result).toBe('Hello World!');
    });

    test('should return empty string for null or undefined', () => {
      expect(exporter.extractPlainText(null)).toBe('');
      expect(exporter.extractPlainText(undefined)).toBe('');
    });
  });

  describe('calculateColumnWidths', () => {
    test('should calculate widths based on content length', () => {
      const headers = [
        { text: 'Short' },
        { text: 'Medium Length' },
        { text: 'Very Long Header Text' }
      ];
      const rows = [
        [{ text: 'A' }, { text: 'B' }, { text: 'C' }]
      ];

      const widths = exporter.calculateColumnWidths(headers, rows);
      
      expect(widths).toHaveLength(3);
      expect(widths[0]).toBeLessThan(widths[1]);
      expect(widths[1]).toBeLessThan(widths[2]);
      expect(widths.every(w => w >= 50)).toBe(true); // Minimum width
    });

    test('should handle empty rows', () => {
      const headers = [{ text: 'Header' }];
      const rows = [];

      const widths = exporter.calculateColumnWidths(headers, rows);
      
      expect(widths).toHaveLength(1);
      expect(widths[0]).toBeGreaterThanOrEqual(50);
    });

    test('should handle string headers and cells', () => {
      const headers = ['Name', 'Age', 'Email'];
      const rows = [
        ['John', '25', 'john@example.com'],
        ['Jane', '30', 'jane@example.com']
      ];

      const widths = exporter.calculateColumnWidths(headers, rows);
      
      expect(widths).toHaveLength(3);
      expect(widths[2]).toBeGreaterThan(widths[0]); // Email column wider than Name
    });
  });

  describe('createCodeBlock', () => {
    test('should create code block with syntax highlighting', () => {
      const code = 'const x = 1;';
      const language = 'javascript';

      const result = exporter.createCodeBlock(code, language);

      expect(result).toBeDefined();
      expect(result.table).toBeDefined();
      expect(result.layout).toBeDefined();
      expect(result.layout.fillColor).toBe('#f6f8fa');
    });

    test('should handle code without language', () => {
      const code = 'plain text';
      const language = 'text';

      const result = exporter.createCodeBlock(code, language);

      expect(result).toBeDefined();
    });

    test('should mark short code blocks as unbreakable', () => {
      const code = 'const x = 1;\nconst y = 2;';
      const language = 'javascript';

      const result = exporter.createCodeBlock(code, language);

      expect(result.unbreakable).toBe(true);
    });

    test('should allow breaking long code blocks', () => {
      const code = Array(40).fill('const x = 1;').join('\n');
      const language = 'javascript';

      const result = exporter.createCodeBlock(code, language);

      expect(result.unbreakable).toBe(false);
    });
  });

  describe('createTOC', () => {
    test('should create table of contents from headings', () => {
      exporter.headings = [
        { level: 1, text: 'Chapter 1', id: 'heading-0' },
        { level: 2, text: 'Section 1.1', id: 'heading-1' },
        { level: 2, text: 'Section 1.2', id: 'heading-2' },
        { level: 1, text: 'Chapter 2', id: 'heading-3' }
      ];

      const toc = exporter.createTOC();

      expect(toc).toBeDefined();
      expect(toc.stack).toBeDefined();
      expect(toc.stack.length).toBe(5); // Title + 4 headings
      expect(toc.stack[0].text).toBe('Table of Contents');
    });

    test('should indent TOC items based on heading level', () => {
      exporter.headings = [
        { level: 1, text: 'H1', id: 'heading-0' },
        { level: 2, text: 'H2', id: 'heading-1' },
        { level: 3, text: 'H3', id: 'heading-2' }
      ];

      const toc = exporter.createTOC();

      // Check indentation (level - 1) * 15
      expect(toc.stack[1].margin[0]).toBe(0);  // H1: (1-1)*15 = 0
      expect(toc.stack[2].margin[0]).toBe(15); // H2: (2-1)*15 = 15
      expect(toc.stack[3].margin[0]).toBe(30); // H3: (3-1)*15 = 30
    });

    test('should create links to heading destinations', () => {
      exporter.headings = [
        { level: 1, text: 'Chapter 1', id: 'heading-0' }
      ];

      const toc = exporter.createTOC();

      expect(toc.stack[1].linkToDestination).toBe('heading-0');
    });
  });

  describe('createHeader', () => {
    test('should create header function', () => {
      const title = 'Test Document';
      const headerFn = exporter.createHeader(title);

      expect(typeof headerFn).toBe('function');
    });

    test('should return null for first page', () => {
      const title = 'Test Document';
      const headerFn = exporter.createHeader(title);
      const result = headerFn(1, 10);

      expect(result).toBeNull();
    });

    test('should return header object for other pages', () => {
      const title = 'Test Document';
      const headerFn = exporter.createHeader(title);
      const result = headerFn(2, 10);

      expect(result).toBeDefined();
      expect(result.text).toBe(title);
      expect(result.alignment).toBe('center');
    });
  });

  describe('createFooter', () => {
    test('should create footer function', () => {
      const footerFn = exporter.createFooter(true);

      expect(typeof footerFn).toBe('function');
    });

    test('should include page numbers when enabled', () => {
      const footerFn = exporter.createFooter(true);
      const result = footerFn(2, 10);

      expect(result).toBeDefined();
      expect(result.stack).toBeDefined();
      expect(result.stack[0].text).toContain('Page 2 of 10');
    });

    test('should include date in footer', () => {
      const footerFn = exporter.createFooter(true);
      const result = footerFn(1, 10);

      expect(result).toBeDefined();
      expect(result.stack[1].text).toContain('Generated on');
    });

    test('should not include page numbers when disabled', () => {
      const footerFn = exporter.createFooter(false);
      const result = footerFn(2, 10);

      expect(result).toBeDefined();
      expect(result.stack[0].text).not.toContain('Page');
    });
  });

  describe('processInlineText', () => {
    test('should return plain text as-is', () => {
      const result = exporter.processInlineText('Hello World', [], [], '', '');
      expect(result).toBe('Hello World');
    });

    test('should parse bold text with **', () => {
      const result = exporter.processInlineText('Hello **World**', [], [], '', '');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContainEqual({ text: 'World', bold: true });
    });

    test('should parse italic text with *', () => {
      const result = exporter.processInlineText('Hello *World*', [], [], '', '');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toContainEqual({ text: 'World', italics: true });
    });

    test('should parse inline code with backticks', () => {
      const result = exporter.processInlineText('Use `const` keyword', [], [], '', '');
      expect(Array.isArray(result)).toBe(true);
      const codeItem = result.find(item => typeof item === 'object' && item.font === 'Courier');
      expect(codeItem).toBeDefined();
      expect(codeItem.text).toBe('const');
    });

    test('should handle mixed formatting', () => {
      const result = exporter.processInlineText('**Bold** and *italic* and `code`', [], [], '', '');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(3);
    });
  });

  describe('parseMarkdownToContent', () => {
    test('should parse simple paragraph', async () => {
      const markdown = 'Hello World';
      const content = await exporter.parseMarkdownToContent(markdown);

      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });

    test('should parse headings', async () => {
      const markdown = '# Heading 1\n\n## Heading 2';
      const content = await exporter.parseMarkdownToContent(markdown);

      expect(content).toBeDefined();
      expect(exporter.headings.length).toBe(2);
      expect(exporter.headings[0].level).toBe(1);
      expect(exporter.headings[1].level).toBe(2);
    });

    test('should parse code blocks', async () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const content = await exporter.parseMarkdownToContent(markdown);

      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });

    test('should parse lists', async () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const content = await exporter.parseMarkdownToContent(markdown);

      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });

    test('should parse tables', async () => {
      const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
      const content = await exporter.parseMarkdownToContent(markdown);

      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
    });
  });

  describe('Integration', () => {
    test('should handle complex markdown document', async () => {
      const markdown = `
# Main Title

This is a paragraph with **bold** and *italic* text.

## Code Example

\`\`\`javascript
const greeting = "Hello World";
console.log(greeting);
\`\`\`

## List

- Item 1
- Item 2
- Item 3

## Table

| Name | Age |
|------|-----|
| John | 25  |
| Jane | 30  |
      `.trim();

      const content = await exporter.parseMarkdownToContent(markdown);

      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(5);
      expect(exporter.headings.length).toBeGreaterThanOrEqual(3);
    });
  });
});
