/**
 * Tests for Enhanced DOCX Exporter
 */

import { describe, test, expect, beforeEach } from 'vitest';
import DocxExporterEnhanced from '../src/docx-exporter-enhanced.js';

describe('DocxExporterEnhanced', () => {
  let exporter;

  beforeEach(() => {
    exporter = new DocxExporterEnhanced();
  });

  describe('Unicode Math Normalization', () => {
    test('should normalize Unicode math symbols to LaTeX', () => {
      const input = 'x ≤ y and a ≥ b';
      const result = exporter.normalizeUnicodeMath(input);
      expect(result).toContain('\\leq');
      expect(result).toContain('\\geq');
    });

    test('should normalize Greek letters', () => {
      const input = 'α + β = γ';
      const result = exporter.normalizeUnicodeMath(input);
      expect(result).toContain('\\alpha');
      expect(result).toContain('\\beta');
      expect(result).toContain('\\gamma');
    });

    test('should normalize multiple symbols', () => {
      const input = '∀x ∈ ℝ: x² ≥ 0';
      const result = exporter.normalizeUnicodeMath(input);
      expect(result).toContain('\\forall');
      expect(result).toContain('\\in');
      expect(result).toContain('\\geq');
    });
  });

  describe('Text Extraction', () => {
    test('should extract text from text node', () => {
      const node = { type: 'text', value: 'Hello World' };
      const result = exporter.extractText(node);
      expect(result).toBe('Hello World');
    });

    test('should extract text from nested nodes', () => {
      const node = {
        type: 'paragraph',
        children: [
          { type: 'text', value: 'Hello ' },
          { type: 'text', value: 'World' }
        ]
      };
      const result = exporter.extractText(node);
      expect(result).toBe('Hello World');
    });
  });

  describe('Heading Processing', () => {
    test('should process heading with correct level', () => {
      const node = {
        type: 'heading',
        depth: 1,
        children: [{ type: 'text', value: 'Title' }]
      };
      const result = exporter.processHeading(node);
      expect(result.type).toBe('heading');
      expect(result.level).toBe(1);
      expect(result.style).toBe('Heading1');
      expect(result.content[0].text).toBe('Title');
      expect(result.content[0].bold).toBe(true);
    });

    test('should handle different heading levels', () => {
      for (let level = 1; level <= 6; level++) {
        const node = {
          type: 'heading',
          depth: level,
          children: [{ type: 'text', value: `Heading ${level}` }]
        };
        const result = exporter.processHeading(node);
        expect(result.level).toBe(level);
        expect(result.style).toBe(`Heading${level}`);
      }
    });
  });

  describe('Code Block Processing', () => {
    test('should process code block with syntax highlighting', () => {
      const node = {
        type: 'code',
        lang: 'javascript',
        value: 'const x = 1;'
      };
      const result = exporter.processCodeBlock(node);
      expect(result.type).toBe('codeBlock');
      expect(result.language).toBeDefined();
      expect(result.content).toBeInstanceOf(Array);
      expect(result.content.length).toBeGreaterThan(0);
      expect(result.background).toBe('#F6F8FA');
    });

    test('should use Source Code Pro font for code', () => {
      const node = {
        type: 'code',
        lang: 'python',
        value: 'print("hello")'
      };
      const result = exporter.processCodeBlock(node);
      expect(result.content[0].font).toBe('Source Code Pro');
    });
  });

  describe('Table Processing', () => {
    test('should process table with headers and rows', () => {
      const node = {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: 'Header 1' }] },
              { type: 'tableCell', children: [{ type: 'text', value: 'Header 2' }] }
            ]
          },
          {
            type: 'tableRow',
            children: [
              { type: 'tableCell', children: [{ type: 'text', value: 'Cell 1' }] },
              { type: 'tableCell', children: [{ type: 'text', value: 'Cell 2' }] }
            ]
          }
        ]
      };
      const result = exporter.processTable(node);
      expect(result.type).toBe('table');
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].isHeader).toBe(true);
      expect(result.borders).toBe(true);
      expect(result.headerBackground).toBe('#F6F8FA');
    });
  });

  describe('Inline Content Processing', () => {
    test('should process bold text', () => {
      const children = [
        {
          type: 'strong',
          children: [{ type: 'text', value: 'Bold' }]
        }
      ];
      const result = exporter.processInlineContent(children);
      expect(result[0].text).toBe('Bold');
      expect(result[0].bold).toBe(true);
    });

    test('should process italic text', () => {
      const children = [
        {
          type: 'emphasis',
          children: [{ type: 'text', value: 'Italic' }]
        }
      ];
      const result = exporter.processInlineContent(children);
      expect(result[0].text).toBe('Italic');
      expect(result[0].italic).toBe(true);
    });

    test('should process inline code', () => {
      const children = [
        {
          type: 'inlineCode',
          value: 'code'
        }
      ];
      const result = exporter.processInlineContent(children);
      expect(result[0].text).toBe('code');
      expect(result[0].font).toBe('Source Code Pro');
      expect(result[0].background).toBe('#F6F8FA');
    });

    test('should process links', () => {
      const children = [
        {
          type: 'link',
          url: 'https://example.com',
          children: [{ type: 'text', value: 'Link' }]
        }
      ];
      const result = exporter.processInlineContent(children);
      expect(result[0].text).toBe('Link');
      expect(result[0].link).toBe('https://example.com');
      expect(result[0].color).toBe('#0969DA');
    });
  });

  describe('XML Escaping', () => {
    test('should escape XML special characters', () => {
      const input = '<tag>content & "quotes" \'apostrophe\'</tag>';
      const result = exporter.escapeXml(input);
      expect(result).toBe('&lt;tag&gt;content &amp; &quot;quotes&quot; &apos;apostrophe&apos;&lt;/tag&gt;');
    });

    test('should handle empty string', () => {
      const result = exporter.escapeXml('');
      expect(result).toBe('');
    });

    test('should handle null/undefined', () => {
      expect(exporter.escapeXml(null)).toBe('');
      expect(exporter.escapeXml(undefined)).toBe('');
    });
  });

  describe('Document Structure Creation', () => {
    test('should create valid Content Types XML', () => {
      const xml = exporter.createContentTypes();
      expect(xml).toContain('<?xml version="1.0"');
      expect(xml).toContain('word/document.xml');
      expect(xml).toContain('word/styles.xml');
      expect(xml).toContain('word/fontTable.xml');
    });

    test('should create valid Styles XML with heading styles', () => {
      const xml = exporter.createStyles();
      expect(xml).toContain('Heading1');
      expect(xml).toContain('Heading2');
      expect(xml).toContain('Heading3');
      expect(xml).toContain('Heading4');
      expect(xml).toContain('Heading5');
      expect(xml).toContain('Heading6');
    });

    test('should create Font Table with Source Code Pro', () => {
      const xml = exporter.createFontTable();
      expect(xml).toContain('Source Code Pro');
      expect(xml).toContain('Calibri');
    });

    test('should create header with title', () => {
      const metadata = { title: 'Test Document' };
      const xml = exporter.createHeader(metadata);
      expect(xml).toContain('Test Document');
    });

    test('should create footer with page numbers', () => {
      const metadata = { date: new Date('2024-01-01') };
      const xml = exporter.createFooter(metadata);
      expect(xml).toContain('Page');
      expect(xml).toContain('PAGE');
    });
  });
});
