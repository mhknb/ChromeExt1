/**
 * Markdown Exporter Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import MarkdownExporter from '../src/markdown-exporter.js';

describe('MarkdownExporter', () => {
  let exporter;

  beforeEach(() => {
    exporter = new MarkdownExporter();
  });

  it('should initialize with correct mime type', () => {
    expect(exporter.mimeType).toBe('text/markdown');
  });

  it('should clean platform headers', () => {
    const markdown = 'ChatGPT said:\n\nHello world';
    const cleaned = exporter.cleanMarkdown(markdown);
    expect(cleaned).toBe('Hello world');
  });

  it('should normalize line breaks', () => {
    const markdown = 'Line 1\r\nLine 2\r\nLine 3';
    const cleaned = exporter.cleanMarkdown(markdown);
    expect(cleaned).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should remove excessive blank lines', () => {
    const markdown = 'Line 1\n\n\n\nLine 2';
    const cleaned = exporter.cleanMarkdown(markdown);
    expect(cleaned).toBe('Line 1\n\nLine 2');
  });

  describe('Code Block Preservation (Requirement 1.2)', () => {
    it('should preserve code blocks with language specifiers', () => {
      const extractedContent = {
        rawText: 'Here is some code:\n\nconst x = 1;\n\nEnd of code',
        codeBlocks: [
          { language: 'javascript', code: 'const x = 1;' }
        ],
        tables: [],
        latexFormulas: [],
        metadata: { platform: 'chatgpt' }
      };

      const markdown = exporter.convertToMarkdown(extractedContent);
      expect(markdown).toContain('const x = 1;');
    });

    it('should handle multiple code blocks', () => {
      const extractedContent = {
        rawText: 'Code 1:\nprint("hello")\n\nCode 2:\nconsole.log("world")',
        codeBlocks: [
          { language: 'python', code: 'print("hello")' },
          { language: 'javascript', code: 'console.log("world")' }
        ],
        tables: [],
        latexFormulas: [],
        metadata: { platform: 'chatgpt' }
      };

      const markdown = exporter.convertToMarkdown(extractedContent);
      expect(markdown).toContain('print("hello")');
      expect(markdown).toContain('console.log("world")');
    });
  });

  describe('LaTeX Formula Preservation (Requirement 1.3)', () => {
    it('should preserve inline LaTeX formulas', () => {
      const extractedContent = {
        rawText: 'The formula $E = mc^2$ is famous',
        codeBlocks: [],
        tables: [],
        latexFormulas: [
          { type: 'inline', formula: 'E = mc^2', position: 12 }
        ],
        metadata: { platform: 'chatgpt' }
      };

      const markdown = exporter.convertToMarkdown(extractedContent);
      expect(markdown).toContain('$E = mc^2$');
    });

    it('should preserve block LaTeX formulas', () => {
      const extractedContent = {
        rawText: 'Here is an equation:\n\n\\int_0^1 x^2 dx\n\nEnd',
        codeBlocks: [],
        tables: [],
        latexFormulas: [
          { type: 'block', formula: '\\int_0^1 x^2 dx', position: 20 }
        ],
        metadata: { platform: 'chatgpt' }
      };

      const markdown = exporter.convertToMarkdown(extractedContent);
      expect(markdown).toContain('\\int_0^1 x^2 dx');
    });
  });

  describe('Table Export (Requirement 1.4)', () => {
    it('should convert tables to GFM format', () => {
      const extractedContent = {
        rawText: 'Here is a table',
        codeBlocks: [],
        tables: [
          {
            headers: ['Name', 'Age'],
            rows: [['Alice', '30'], ['Bob', '25']],
            alignment: ['left', 'left']
          }
        ],
        latexFormulas: [],
        metadata: { platform: 'chatgpt' }
      };

      const markdown = exporter.convertToMarkdown(extractedContent);
      expect(markdown).toContain('Name');
      expect(markdown).toContain('Age');
      expect(markdown).toContain('Alice');
      expect(markdown).toContain('Bob');
    });
  });

  describe('Platform Header Removal (Requirement 1.5)', () => {
    it('should remove ChatGPT headers', () => {
      const extractedContent = {
        rawText: 'ChatGPT said:\n\nHello world',
        codeBlocks: [],
        tables: [],
        latexFormulas: [],
        metadata: { platform: 'chatgpt' }
      };

      const markdown = exporter.convertToMarkdown(extractedContent, {
        removePlatformHeaders: true
      });
      expect(markdown).not.toContain('ChatGPT said:');
      expect(markdown).toContain('Hello world');
    });

    it('should remove Claude headers', () => {
      const extractedContent = {
        rawText: 'Claude said:\n\nHello world',
        codeBlocks: [],
        tables: [],
        latexFormulas: [],
        metadata: { platform: 'claude' }
      };

      const markdown = exporter.convertToMarkdown(extractedContent, {
        removePlatformHeaders: true
      });
      expect(markdown).not.toContain('Claude said:');
    });
  });

  describe('Filename Generation', () => {
    it('should generate filename with platform and date', () => {
      const extractedContent = {
        metadata: { platform: 'chatgpt' }
      };

      const filename = exporter.generateFilename(extractedContent);
      expect(filename).toContain('chatgpt');
      expect(filename).toContain('.md');
    });

    it('should sanitize invalid filename characters', () => {
      const filename = 'test<>:"/\\|?*file.md';
      const sanitized = exporter.sanitizeFilename(filename);
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
      expect(sanitized).not.toContain(':');
      expect(sanitized).not.toContain('"');
      expect(sanitized).not.toContain('/');
      expect(sanitized).not.toContain('\\');
      expect(sanitized).not.toContain('|');
      expect(sanitized).not.toContain('?');
      expect(sanitized).not.toContain('*');
    });
  });

  describe('Full Export Flow (Requirement 1.1)', () => {
    it('should export content with all features', async () => {
      // Mock DOM for download
      global.document = {
        createElement: vi.fn(() => ({
          click: vi.fn(),
          href: '',
          download: ''
        })),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      };
      global.URL = {
        createObjectURL: vi.fn(() => 'blob:mock'),
        revokeObjectURL: vi.fn()
      };
      global.Blob = class {
        constructor(content, options) {
          this.content = content;
          this.options = options;
          this.size = content[0].length;
        }
      };

      const extractedContent = {
        rawText: 'Test content with code:\n\nconst x = 1;\n\nAnd formula: $E = mc^2$',
        codeBlocks: [
          { language: 'javascript', code: 'const x = 1;' }
        ],
        tables: [],
        latexFormulas: [
          { type: 'inline', formula: 'E = mc^2', position: 40 }
        ],
        metadata: { platform: 'chatgpt' }
      };

      const result = await exporter.exportContent(extractedContent, {
        filename: 'test-export.md'
      });

      expect(result.success).toBe(true);
      expect(result.filename).toBe('test-export.md');
      expect(result.markdown).toBeTruthy();
    });
  });
});
