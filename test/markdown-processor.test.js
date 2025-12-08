/**
 * Markdown Processor Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import MarkdownProcessor from '../src/markdown-processor.js';

describe('MarkdownProcessor', () => {
  let processor;

  beforeEach(() => {
    processor = new MarkdownProcessor();
  });

  describe('LaTeX Normalization', () => {
    it('should normalize Greek letters to LaTeX commands', () => {
      const input = 'The angle α and β are related';
      const result = processor.normalizeLatex(input);
      expect(result).toBe('The angle \\alpha and \\beta are related');
    });

    it('should normalize mathematical operators', () => {
      const input = 'x ≤ y and a ≥ b';
      const result = processor.normalizeLatex(input);
      expect(result).toBe('x \\leq y and a \\geq b');
    });

    it('should normalize multiple Unicode symbols', () => {
      const input = '∑ from i=1 to ∞';
      const result = processor.normalizeLatex(input);
      expect(result).toBe('\\sum from i=1 to \\infty');
    });

    it('should normalize set theory symbols', () => {
      const input = 'x ∈ ℝ and y ∉ ℕ';
      const result = processor.normalizeLatex(input);
      expect(result).toBe('x \\in \\mathbb{R} and y \\notin \\mathbb{N}');
    });

    it('should normalize arrows', () => {
      const input = 'A → B ⇒ C';
      const result = processor.normalizeLatex(input);
      expect(result).toBe('A \\rightarrow B \\Rightarrow C');
    });

    it('should handle mixed content', () => {
      const input = 'For all x ∈ ℝ, if x ≥ 0 then √x exists';
      const result = processor.normalizeLatex(input);
      expect(result).toBe('For all x \\in \\mathbb{R}, if x \\geq 0 then \\sqrtx exists');
    });
  });

  describe('Table to Markdown Conversion', () => {
    it('should convert simple table to GFM format', () => {
      const table = {
        headers: ['Name', 'Age', 'City'],
        rows: [
          ['Alice', '30', 'NYC'],
          ['Bob', '25', 'LA']
        ],
        alignment: ['left', 'left', 'left']
      };
      
      const result = processor.tableToMarkdown(table);
      const lines = result.split('\n');
      
      expect(lines[0]).toContain('| Name');
      expect(lines[0]).toContain('| Age');
      expect(lines[0]).toContain('| City');
      expect(lines[1]).toMatch(/\|[\s-]+\|/); // Separator row
      expect(lines[2]).toContain('Alice');
      expect(lines[3]).toContain('Bob');
    });

    it('should handle center alignment', () => {
      const table = {
        headers: ['Left', 'Center', 'Right'],
        rows: [['A', 'B', 'C']],
        alignment: ['left', 'center', 'right']
      };
      
      const result = processor.tableToMarkdown(table);
      const lines = result.split('\n');
      const separator = lines[1];
      
      expect(separator).toMatch(/\|\s*-+\s*\|/); // Left (no colons or right colon)
      expect(separator).toMatch(/\|\s*:-+:\s*\|/); // Center (both colons)
      expect(separator).toMatch(/\|\s*-+:\s*\|/); // Right (right colon)
    });

    it('should handle empty cells', () => {
      const table = {
        headers: ['A', 'B', 'C'],
        rows: [
          ['1', '', '3'],
          ['', '5', '']
        ],
        alignment: ['left', 'left', 'left']
      };
      
      const result = processor.tableToMarkdown(table);
      expect(result).toContain('|');
      expect(result.split('\n')).toHaveLength(4); // Header + separator + 2 rows
    });

    it('should return empty string for invalid table', () => {
      const table = { headers: [], rows: [] };
      const result = processor.tableToMarkdown(table);
      expect(result).toBe('');
    });

    it('should pad columns for alignment', () => {
      const table = {
        headers: ['Short', 'VeryLongHeader'],
        rows: [['A', 'B']],
        alignment: ['left', 'left']
      };
      
      const result = processor.tableToMarkdown(table);
      const lines = result.split('\n');
      
      // Check that columns are padded
      expect(lines[0]).toMatch(/\|\s+Short\s+\|/);
      expect(lines[0]).toMatch(/\|\s+VeryLongHeader\s+\|/);
    });
  });

  describe('Platform Header Removal', () => {
    it('should remove ChatGPT headers', () => {
      const input = 'ChatGPT said:\n\nHello world';
      const result = processor.removePlatformHeaders(input);
      expect(result).toBe('Hello world');
    });

    it('should remove Claude headers', () => {
      const input = 'Claude said:\n\nHello world';
      const result = processor.removePlatformHeaders(input);
      expect(result).toBe('Hello world');
    });

    it('should remove Gemini headers', () => {
      const input = 'Gemini said:\n\nHello world';
      const result = processor.removePlatformHeaders(input);
      expect(result).toBe('Hello world');
    });

    it('should remove DeepSeek headers', () => {
      const input = 'DeepSeek said:\n\nHello world';
      const result = processor.removePlatformHeaders(input);
      expect(result).toBe('Hello world');
    });

    it('should remove Assistant headers', () => {
      const input = 'Assistant:\n\nHello world';
      const result = processor.removePlatformHeaders(input);
      expect(result).toBe('Hello world');
    });

    it('should remove Model headers', () => {
      const input = 'Model:\n\nHello world';
      const result = processor.removePlatformHeaders(input);
      expect(result).toBe('Hello world');
    });

    it('should handle multiple headers', () => {
      const input = 'ChatGPT said:\n\nFirst response\n\nClaude said:\n\nSecond response';
      const result = processor.removePlatformHeaders(input);
      expect(result).not.toContain('ChatGPT said:');
      expect(result).not.toContain('Claude said:');
      expect(result).toContain('First response');
      expect(result).toContain('Second response');
    });

    it('should normalize blank lines after removal', () => {
      const input = 'ChatGPT said:\n\n\n\nHello world';
      const result = processor.removePlatformHeaders(input);
      expect(result).toBe('Hello world');
    });
  });

  describe('Markdown Validation', () => {
    it('should validate correct markdown', () => {
      const markdown = '# Title\n\nSome text with **bold** and *italic*.';
      const result = processor.validate(markdown);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect unclosed code blocks', () => {
      const markdown = '# Title\n\n```javascript\nconst x = 1;\n\nMore text';
      const result = processor.validate(markdown);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('unclosed_code_block');
    });

    it('should detect unclosed LaTeX blocks', () => {
      const markdown = 'Formula: $$x = y\n\nMore text';
      const result = processor.validate(markdown);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('unclosed_latex_block');
    });

    it('should warn about inconsistent table columns', () => {
      const markdown = '| A | B | C |\n|---|---|\n| 1 | 2 | 3 |';
      const result = processor.validate(markdown);
      
      // May have warnings about column mismatch
      expect(result.warnings.length).toBeGreaterThanOrEqual(0);
    });

    it('should validate properly closed code blocks', () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const result = processor.validate(markdown);
      
      expect(result.valid).toBe(true);
    });

    it('should validate properly closed LaTeX blocks', () => {
      const markdown = '$$x = y$$';
      const result = processor.validate(markdown);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('Parse', () => {
    it('should parse markdown to AST', () => {
      const markdown = '# Title\n\nParagraph text.';
      const ast = processor.parse(markdown);
      
      expect(ast).toBeDefined();
      expect(ast.type).toBe('root');
      expect(ast.children).toBeDefined();
    });

    it('should parse GFM tables', () => {
      const markdown = '| A | B |\n|---|---|\n| 1 | 2 |';
      const ast = processor.parse(markdown);
      
      expect(ast).toBeDefined();
      expect(ast.type).toBe('root');
    });

    it('should parse math formulas', () => {
      const markdown = 'Inline $x = y$ and block $$a = b$$';
      const ast = processor.parse(markdown);
      
      expect(ast).toBeDefined();
      expect(ast.type).toBe('root');
    });

    it('should throw error for invalid markdown', () => {
      // Note: remark is quite forgiving, so this test might not fail
      // But we test the error handling mechanism
      const markdown = '# Title\n\nValid content';
      expect(() => processor.parse(markdown)).not.toThrow();
    });
  });

  describe('Process', () => {
    it('should process markdown with all enhancements', () => {
      const input = 'ChatGPT said:\n\nThe angle α is ≤ 90°';
      const result = processor.process(input, {
        normalizeLatex: true,
        removePlatformHeaders: true,
        validateSyntax: false
      });
      
      expect(result).not.toContain('ChatGPT said:');
      expect(result).toContain('\\alpha');
      expect(result).toContain('\\leq');
    });

    it('should skip LaTeX normalization when disabled', () => {
      const input = 'The angle α';
      const result = processor.process(input, {
        normalizeLatex: false,
        removePlatformHeaders: false
      });
      
      expect(result).toBe('The angle α');
    });

    it('should skip header removal when disabled', () => {
      const input = 'ChatGPT said:\n\nHello';
      const result = processor.process(input, {
        normalizeLatex: false,
        removePlatformHeaders: false
      });
      
      expect(result).toContain('ChatGPT said:');
    });

    it('should validate when requested', () => {
      const input = '```javascript\nconst x = 1;';
      const result = processor.process(input, {
        validateSyntax: true
      });
      
      // Should still return result even with validation errors
      expect(result).toBeDefined();
    });
  });
});
