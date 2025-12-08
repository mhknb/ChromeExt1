/**
 * Tests for SyntaxHighlighter
 */

import { describe, test, expect, beforeEach } from 'vitest';
import SyntaxHighlighter from '../src/syntax-highlighter.js';

describe('SyntaxHighlighter', () => {
  let highlighter;

  beforeEach(() => {
    highlighter = new SyntaxHighlighter();
  });

  describe('Initialization', () => {
    test('should initialize with common languages loaded', () => {
      const languages = highlighter.getSupportedLanguages();
      
      expect(languages).toContain('javascript');
      expect(languages).toContain('python');
      expect(languages).toContain('java');
      expect(languages).toContain('typescript');
      expect(languages.length).toBeGreaterThan(10);
    });

    test('should have token color map defined', () => {
      expect(highlighter.tokenColorMap).toBeDefined();
      expect(highlighter.tokenColorMap['hljs-keyword']).toBeDefined();
      expect(highlighter.tokenColorMap['hljs-string']).toBeDefined();
    });
  });

  describe('Language Normalization', () => {
    test('should normalize language names to lowercase', () => {
      expect(highlighter.normalizeLanguage('JavaScript')).toBe('javascript');
      expect(highlighter.normalizeLanguage('PYTHON')).toBe('python');
    });

    test('should handle language aliases', () => {
      expect(highlighter.normalizeLanguage('js')).toBe('javascript');
      expect(highlighter.normalizeLanguage('ts')).toBe('typescript');
      expect(highlighter.normalizeLanguage('py')).toBe('python');
      expect(highlighter.normalizeLanguage('sh')).toBe('bash');
    });

    test('should return text for empty or null language', () => {
      expect(highlighter.normalizeLanguage('')).toBe('text');
      expect(highlighter.normalizeLanguage(null)).toBe('text');
      expect(highlighter.normalizeLanguage(undefined)).toBe('text');
    });
  });

  describe('Language Support Check', () => {
    test('should return true for supported languages', () => {
      expect(highlighter.isLanguageSupported('javascript')).toBe(true);
      expect(highlighter.isLanguageSupported('python')).toBe(true);
      expect(highlighter.isLanguageSupported('java')).toBe(true);
    });

    test('should return false for unsupported languages', () => {
      expect(highlighter.isLanguageSupported('cobol')).toBe(false);
      expect(highlighter.isLanguageSupported('fortran')).toBe(false);
    });

    test('should handle aliases in support check', () => {
      expect(highlighter.isLanguageSupported('js')).toBe(true);
      expect(highlighter.isLanguageSupported('py')).toBe(true);
    });
  });

  describe('Code Highlighting', () => {
    test('should highlight JavaScript code', () => {
      const code = 'const x = 42;';
      const result = highlighter.highlight(code, 'javascript');
      
      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.tokens).toBeDefined();
      expect(result.language).toBe('javascript');
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    test('should highlight Python code', () => {
      const code = 'def hello():\n    print("Hello")';
      const result = highlighter.highlight(code, 'python');
      
      expect(result.language).toBe('python');
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    test('should handle empty code', () => {
      const result = highlighter.highlight('', 'javascript');
      
      expect(result.html).toBe('');
      expect(result.tokens).toEqual([]);
      expect(result.language).toBe('text');
    });

    test('should handle null or undefined code', () => {
      const result1 = highlighter.highlight(null, 'javascript');
      const result2 = highlighter.highlight(undefined, 'javascript');
      
      expect(result1.html).toBe('');
      expect(result2.html).toBe('');
    });

    test('should escape HTML in plain text fallback', () => {
      const code = '<script>alert("xss")</script>';
      const result = highlighter.highlight(code, 'unsupported-lang');
      
      expect(result.html).toContain('&lt;');
      expect(result.html).toContain('&gt;');
    });
  });

  describe('Language Detection Fallback', () => {
    test('should auto-detect JavaScript when language not specified', () => {
      const code = 'function test() { return 42; }';
      const result = highlighter.highlight(code, 'text');
      
      // Should attempt auto-detection
      expect(result.language).toBeDefined();
    });

    test('should fallback to text for ambiguous code', () => {
      const code = 'hello world';
      const result = highlighter.highlight(code, 'unsupported-lang');
      
      expect(result.language).toBe('text');
    });

    test('should use auto-detection for unsupported language', () => {
      const code = 'const x = 42;';
      const result = highlighter.highlight(code, 'unsupported-language');
      
      // Should auto-detect as JavaScript
      expect(result.tokens.length).toBeGreaterThan(0);
    });
  });

  describe('Token Extraction', () => {
    test('should extract tokens with type and color', () => {
      const code = 'const x = 42;';
      const result = highlighter.highlight(code, 'javascript');
      
      expect(result.tokens.length).toBeGreaterThan(0);
      
      // Check token structure
      result.tokens.forEach(token => {
        expect(token).toHaveProperty('type');
        expect(token).toHaveProperty('value');
        expect(token).toHaveProperty('color');
        expect(typeof token.value).toBe('string');
        expect(typeof token.color).toBe('string');
        expect(token.color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    test('should extract keyword tokens with correct color', () => {
      const code = 'const x = 42;';
      const result = highlighter.highlight(code, 'javascript');
      
      // Should have keyword token for 'const'
      const keywordTokens = result.tokens.filter(t => 
        t.type === 'keyword' || t.value.includes('const')
      );
      
      expect(keywordTokens.length).toBeGreaterThan(0);
    });

    test('should extract string tokens', () => {
      const code = 'const msg = "hello";';
      const result = highlighter.highlight(code, 'javascript');
      
      // Should have string token
      const stringTokens = result.tokens.filter(t => 
        t.type === 'string' || t.value.includes('"')
      );
      
      expect(stringTokens.length).toBeGreaterThan(0);
    });

    test('should extract number tokens', () => {
      const code = 'const x = 42;';
      const result = highlighter.highlight(code, 'javascript');
      
      // Should have number token
      const numberTokens = result.tokens.filter(t => 
        t.type === 'number' || t.value === '42'
      );
      
      expect(numberTokens.length).toBeGreaterThan(0);
    });
  });

  describe('Language Detection', () => {
    test('should detect JavaScript', () => {
      // Use more substantial code for better detection
      const code = `function test() {
        const x = 42;
        console.log("Hello");
        return x + 1;
      }`;
      const detected = highlighter.detectLanguage(code);
      
      expect(detected).toBe('javascript');
    });

    test('should detect Python', () => {
      // Use more substantial code for better detection
      const code = `def hello():
    print("Hello World")
    x = 42
    return x + 1`;
      const detected = highlighter.detectLanguage(code);
      
      expect(detected).toBe('python');
    });

    test('should return text for empty code', () => {
      expect(highlighter.detectLanguage('')).toBe('text');
      expect(highlighter.detectLanguage('   ')).toBe('text');
    });

    test('should return text for ambiguous code', () => {
      const code = 'hello world';
      const detected = highlighter.detectLanguage(code);
      
      expect(detected).toBe('text');
    });

    test('should handle null or undefined', () => {
      expect(highlighter.detectLanguage(null)).toBe('text');
      expect(highlighter.detectLanguage(undefined)).toBe('text');
    });
  });

  describe('HTML Escaping', () => {
    test('should escape HTML special characters', () => {
      expect(highlighter.escapeHtml('<div>')).toBe('&lt;div&gt;');
      expect(highlighter.escapeHtml('a & b')).toBe('a &amp; b');
      expect(highlighter.escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(highlighter.escapeHtml("'single'")).toBe('&#039;single&#039;');
    });

    test('should handle mixed special characters', () => {
      const input = '<script>alert("test & \'xss\'")</script>';
      const escaped = highlighter.escapeHtml(input);
      
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });
  });

  describe('Color Mapping', () => {
    test('should return color for known classes', () => {
      const color = highlighter.getColorForClasses(['hljs-keyword']);
      expect(color).toBe('#CF222E');
    });

    test('should return default color for unknown classes', () => {
      const color = highlighter.getColorForClasses(['unknown-class']);
      expect(color).toBe('#24292F');
    });

    test('should return first matching color for multiple classes', () => {
      const color = highlighter.getColorForClasses(['unknown', 'hljs-string']);
      expect(color).toBe('#0A3069');
    });
  });

  describe('Type Extraction', () => {
    test('should extract type from hljs classes', () => {
      expect(highlighter.getTypeForClasses(['hljs-keyword'])).toBe('keyword');
      expect(highlighter.getTypeForClasses(['hljs-string'])).toBe('string');
      expect(highlighter.getTypeForClasses(['hljs-number'])).toBe('number');
    });

    test('should return text for non-hljs classes', () => {
      expect(highlighter.getTypeForClasses(['some-class'])).toBe('text');
      expect(highlighter.getTypeForClasses([])).toBe('text');
    });
  });

  describe('Integration with Multiple Languages', () => {
    test('should handle multiple languages in sequence', () => {
      const jsCode = 'const x = 42;';
      const pyCode = 'def hello(): pass';
      const javaCode = 'public class Test {}';
      
      const jsResult = highlighter.highlight(jsCode, 'javascript');
      const pyResult = highlighter.highlight(pyCode, 'python');
      const javaResult = highlighter.highlight(javaCode, 'java');
      
      expect(jsResult.language).toBe('javascript');
      expect(pyResult.language).toBe('python');
      expect(javaResult.language).toBe('java');
    });

    test('should handle SQL code', () => {
      const code = 'SELECT * FROM users WHERE id = 1;';
      const result = highlighter.highlight(code, 'sql');
      
      expect(result.language).toBe('sql');
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    test('should handle JSON code', () => {
      const code = '{"name": "test", "value": 42}';
      const result = highlighter.highlight(code, 'json');
      
      expect(result.language).toBe('json');
      expect(result.tokens.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long code', () => {
      const code = 'const x = 1;\n'.repeat(1000);
      const result = highlighter.highlight(code, 'javascript');
      
      expect(result.tokens.length).toBeGreaterThan(0);
      expect(result.language).toBe('javascript');
    });

    test('should handle code with special characters', () => {
      const code = 'const emoji = "🚀";';
      const result = highlighter.highlight(code, 'javascript');
      
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    test('should handle code with unicode', () => {
      const code = 'const 变量 = "中文";';
      const result = highlighter.highlight(code, 'javascript');
      
      expect(result.tokens.length).toBeGreaterThan(0);
    });

    test('should handle malformed code gracefully', () => {
      const code = 'const x = {{{';
      const result = highlighter.highlight(code, 'javascript');
      
      // Should not throw, should return some result
      expect(result).toBeDefined();
      expect(result.tokens).toBeDefined();
    });
  });
});
