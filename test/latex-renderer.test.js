/**
 * Tests for LaTeXRenderer
 */

import { describe, test, expect, beforeEach } from 'vitest';
import LaTeXRenderer from '../src/latex-renderer.js';

describe('LaTeXRenderer', () => {
  let renderer;

  beforeEach(() => {
    renderer = new LaTeXRenderer();
  });

  describe('Initialization', () => {
    test('should initialize with KaTeX', () => {
      expect(renderer.katex).toBeDefined();
      expect(renderer.defaultHtmlOptions).toBeDefined();
    });

    test('should have LaTeX to OMML mapping', () => {
      expect(renderer.latexToOmmlMap).toBeDefined();
      expect(renderer.latexToOmmlMap['\\alpha']).toBeDefined();
      expect(renderer.latexToOmmlMap['\\beta']).toBeDefined();
    });

    test('should have default HTML options', () => {
      expect(renderer.defaultHtmlOptions.throwOnError).toBe(false);
      expect(renderer.defaultHtmlOptions.output).toBe('html');
    });
  });

  describe('LaTeX Cleaning', () => {
    test('should remove $ delimiters', () => {
      expect(renderer.cleanLatex('$x + y$')).toBe('x + y');
      expect(renderer.cleanLatex('$$x + y$$')).toBe('x + y');
    });

    test('should remove \\( \\) delimiters', () => {
      expect(renderer.cleanLatex('\\(x + y\\)')).toBe('x + y');
    });

    test('should remove \\[ \\] delimiters', () => {
      expect(renderer.cleanLatex('\\[x + y\\]')).toBe('x + y');
    });

    test('should trim whitespace', () => {
      expect(renderer.cleanLatex('  x + y  ')).toBe('x + y');
      expect(renderer.cleanLatex('$  x + y  $')).toBe('x + y');
    });

    test('should handle empty input', () => {
      expect(renderer.cleanLatex('')).toBe('');
      expect(renderer.cleanLatex(null)).toBe('');
      expect(renderer.cleanLatex(undefined)).toBe('');
    });
  });

  describe('HTML Rendering', () => {
    test('should render simple inline formula', () => {
      const html = renderer.renderToHtml('x + y', false);
      
      expect(html).toBeDefined();
      expect(html).toContain('katex');
      expect(typeof html).toBe('string');
    });

    test('should render simple block formula', () => {
      const html = renderer.renderToHtml('x + y', true);
      
      expect(html).toBeDefined();
      expect(html).toContain('katex');
    });

    test('should render Greek letters', () => {
      const html = renderer.renderToHtml('\\alpha + \\beta', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should render fractions', () => {
      const html = renderer.renderToHtml('\\frac{a}{b}', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should render square roots', () => {
      const html = renderer.renderToHtml('\\sqrt{x}', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should render superscripts', () => {
      const html = renderer.renderToHtml('x^2', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should render subscripts', () => {
      const html = renderer.renderToHtml('x_i', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should handle empty input', () => {
      expect(renderer.renderToHtml('')).toBe('');
      expect(renderer.renderToHtml(null)).toBe('');
      expect(renderer.renderToHtml(undefined)).toBe('');
    });

    test('should handle invalid LaTeX gracefully', () => {
      const html = renderer.renderToHtml('\\invalid{command}', false);
      
      // Should not throw, should return fallback
      expect(html).toBeDefined();
      expect(typeof html).toBe('string');
    });

    test('should use custom options', () => {
      const html = renderer.renderToHtml('x + y', false, { displayMode: true });
      
      expect(html).toBeDefined();
    });
  });

  describe('DOCX Rendering', () => {
    test('should render simple formula to DOCX format', () => {
      const result = renderer.renderToDocx('x + y');
      
      expect(result).toBeDefined();
      expect(result.type).toBe('equation');
      expect(result.content).toBeDefined();
      expect(result.latex).toBe('x + y');
    });

    test('should convert Greek letters to Unicode', () => {
      const result = renderer.renderToDocx('\\alpha + \\beta');
      
      expect(result.type).toBe('equation');
      expect(result.content).toContain('&#x03B1;'); // alpha
      expect(result.content).toContain('&#x03B2;'); // beta
    });

    test('should convert mathematical operators', () => {
      const result = renderer.renderToDocx('x \\leq y');
      
      expect(result.type).toBe('equation');
      expect(result.content).toContain('&#x2264;'); // ≤
    });

    test('should handle fractions', () => {
      const result = renderer.renderToDocx('\\frac{a}{b}');
      
      expect(result.type).toBe('equation');
      expect(result.content).toContain('(a)/(b)');
    });

    test('should handle square roots', () => {
      const result = renderer.renderToDocx('\\sqrt{x}');
      
      expect(result.type).toBe('equation');
      expect(result.content).toContain('√');
    });

    test('should handle superscripts', () => {
      const result = renderer.renderToDocx('x^{2}');
      
      expect(result.type).toBe('equation');
      expect(result.content).toContain('^');
    });

    test('should handle subscripts', () => {
      const result = renderer.renderToDocx('x_{i}');
      
      expect(result.type).toBe('equation');
      expect(result.content).toContain('_');
    });

    test('should handle mathbb symbols', () => {
      const result = renderer.renderToDocx('\\mathbb{R}');
      
      expect(result.type).toBe('equation');
      expect(result.content).toContain('&#x211D;'); // ℝ
    });

    test('should handle empty input', () => {
      const result = renderer.renderToDocx('');
      
      expect(result.type).toBe('text');
      expect(result.content).toBe('');
    });

    test('should handle null input', () => {
      const result = renderer.renderToDocx(null);
      
      expect(result.type).toBe('text');
      expect(result.content).toBe('');
    });

    test('should clean LaTeX delimiters before conversion', () => {
      const result = renderer.renderToDocx('$x + y$');
      
      expect(result.type).toBe('equation');
      expect(result.latex).toBe('x + y');
    });
  });

  describe('OMML Conversion', () => {
    test('should convert simple expression', () => {
      const omml = renderer.convertToOmml('x + y');
      
      expect(omml).toBe('x + y');
    });

    test('should convert Greek letters', () => {
      const omml = renderer.convertToOmml('\\alpha \\beta \\gamma');
      
      expect(omml).toContain('&#x03B1;');
      expect(omml).toContain('&#x03B2;');
      expect(omml).toContain('&#x03B3;');
    });

    test('should convert operators', () => {
      const omml = renderer.convertToOmml('x \\leq y \\geq z');
      
      expect(omml).toContain('&#x2264;');
      expect(omml).toContain('&#x2265;');
    });

    test('should handle fractions', () => {
      const omml = renderer.convertToOmml('\\frac{a}{b}');
      
      expect(omml).toContain('(a)/(b)');
    });

    test('should handle text mode', () => {
      const omml = renderer.convertToOmml('\\text{hello}');
      
      expect(omml).toContain('hello');
      expect(omml).not.toContain('\\text');
    });

    test('should remove unknown commands', () => {
      const omml = renderer.convertToOmml('\\unknown{x}');
      
      expect(omml).not.toContain('\\');
    });
  });

  describe('LaTeX Validation', () => {
    test('should validate correct LaTeX', () => {
      expect(renderer.validate('x + y')).toBe(true);
      expect(renderer.validate('\\frac{a}{b}')).toBe(true);
      expect(renderer.validate('\\sqrt{x}')).toBe(true);
    });

    test('should validate Greek letters', () => {
      expect(renderer.validate('\\alpha + \\beta')).toBe(true);
    });

    test('should invalidate empty input', () => {
      expect(renderer.validate('')).toBe(false);
      expect(renderer.validate(null)).toBe(false);
      expect(renderer.validate(undefined)).toBe(false);
    });

    test('should invalidate malformed LaTeX', () => {
      expect(renderer.validate('\\frac{a}')).toBe(false); // Missing second argument
      expect(renderer.validate('{')).toBe(false); // Unmatched brace
    });

    test('should clean delimiters before validation', () => {
      expect(renderer.validate('$x + y$')).toBe(true);
      expect(renderer.validate('$$x + y$$')).toBe(true);
    });
  });

  describe('Formula Extraction', () => {
    test('should extract inline formulas', () => {
      const markdown = 'The formula $x + y$ is simple.';
      const formulas = renderer.extractFormulas(markdown);
      
      expect(formulas.length).toBe(1);
      expect(formulas[0].type).toBe('inline');
      expect(formulas[0].formula).toBe('x + y');
    });

    test('should extract block formulas', () => {
      const markdown = 'The formula:\n$$x + y$$\nis simple.';
      const formulas = renderer.extractFormulas(markdown);
      
      expect(formulas.length).toBe(1);
      expect(formulas[0].type).toBe('block');
      expect(formulas[0].formula).toBe('x + y');
    });

    test('should extract multiple formulas', () => {
      const markdown = 'First $a + b$ and second $c + d$.';
      const formulas = renderer.extractFormulas(markdown);
      
      expect(formulas.length).toBe(2);
      expect(formulas[0].formula).toBe('a + b');
      expect(formulas[1].formula).toBe('c + d');
    });

    test('should extract both inline and block formulas', () => {
      const markdown = 'Inline $x$ and block:\n$$y$$';
      const formulas = renderer.extractFormulas(markdown);
      
      expect(formulas.length).toBe(2);
      // Formulas are sorted by position, so inline comes first
      expect(formulas[0].type).toBe('inline');
      expect(formulas[1].type).toBe('block');
    });

    test('should handle empty input', () => {
      expect(renderer.extractFormulas('')).toEqual([]);
      expect(renderer.extractFormulas(null)).toEqual([]);
    });

    test('should handle text without formulas', () => {
      const formulas = renderer.extractFormulas('No formulas here.');
      
      expect(formulas).toEqual([]);
    });

    test('should not confuse block and inline delimiters', () => {
      const markdown = '$$block$$ and $inline$';
      const formulas = renderer.extractFormulas(markdown);
      
      expect(formulas.length).toBe(2);
      expect(formulas[0].type).toBe('block');
      expect(formulas[1].type).toBe('inline');
    });

    test('should include position information', () => {
      const markdown = 'Start $x$ end';
      const formulas = renderer.extractFormulas(markdown);
      
      expect(formulas[0].position).toBeGreaterThan(0);
      expect(formulas[0].length).toBeGreaterThan(0);
    });
  });

  describe('Markdown to HTML Rendering', () => {
    test('should render inline formulas in markdown', () => {
      const markdown = 'The formula $x + y$ is simple.';
      const html = renderer.renderMarkdownToHtml(markdown);
      
      expect(html).toContain('katex');
      expect(html).not.toContain('$x + y$');
    });

    test('should render block formulas in markdown', () => {
      const markdown = 'Formula:\n$$x + y$$\nEnd.';
      const html = renderer.renderMarkdownToHtml(markdown);
      
      expect(html).toContain('katex');
      expect(html).not.toContain('$$');
    });

    test('should render multiple formulas', () => {
      const markdown = 'First $a$ and second $b$.';
      const html = renderer.renderMarkdownToHtml(markdown);
      
      expect(html).toContain('katex');
      expect(html).not.toContain('$a$');
      expect(html).not.toContain('$b$');
    });

    test('should preserve non-formula text', () => {
      const markdown = 'Text $x$ more text.';
      const html = renderer.renderMarkdownToHtml(markdown);
      
      expect(html).toContain('Text');
      expect(html).toContain('more text');
    });

    test('should handle empty input', () => {
      expect(renderer.renderMarkdownToHtml('')).toBe('');
      expect(renderer.renderMarkdownToHtml(null)).toBe('');
    });

    test('should handle markdown without formulas', () => {
      const markdown = 'Just plain text.';
      const html = renderer.renderMarkdownToHtml(markdown);
      
      expect(html).toBe(markdown);
    });
  });

  describe('Error Handling', () => {
    test('should handle rendering errors gracefully', () => {
      // This should not throw
      const html = renderer.renderToHtml('\\invalid', false);
      
      expect(html).toBeDefined();
      expect(typeof html).toBe('string');
    });

    test('should fallback to code block on error', () => {
      const html = renderer.renderAsCode('\\invalid', false);
      
      expect(html).toContain('<code');
      expect(html).toContain('language-latex');
    });

    test('should fallback to code block for display mode', () => {
      const html = renderer.renderAsCode('\\invalid', true);
      
      expect(html).toContain('<pre>');
      expect(html).toContain('<code');
    });

    test('should escape HTML in fallback', () => {
      const html = renderer.renderAsCode('<script>alert("xss")</script>', false);
      
      expect(html).toContain('&lt;');
      expect(html).toContain('&gt;');
      expect(html).not.toContain('<script>');
    });

    test('should handle DOCX conversion errors gracefully', () => {
      // Should not throw
      const result = renderer.renderToDocx('\\invalid');
      
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('HTML Escaping', () => {
    test('should escape HTML special characters', () => {
      expect(renderer.escapeHtml('<div>')).toBe('&lt;div&gt;');
      expect(renderer.escapeHtml('a & b')).toBe('a &amp; b');
      expect(renderer.escapeHtml('"quoted"')).toBe('&quot;quoted&quot;');
      expect(renderer.escapeHtml("'single'")).toBe('&#039;single&#039;');
    });

    test('should handle mixed special characters', () => {
      const input = '<script>alert("test & \'xss\'")</script>';
      const escaped = renderer.escapeHtml(input);
      
      expect(escaped).not.toContain('<');
      expect(escaped).not.toContain('>');
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
    });
  });

  describe('Complex Formulas', () => {
    test('should render complex fraction', () => {
      const html = renderer.renderToHtml('\\frac{a + b}{c + d}', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should render nested expressions', () => {
      const html = renderer.renderToHtml('x^{y^z}', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should render summation', () => {
      const html = renderer.renderToHtml('\\sum_{i=1}^{n} i', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should render integral', () => {
      const html = renderer.renderToHtml('\\int_{0}^{1} x dx', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should render matrix', () => {
      const html = renderer.renderToHtml('\\begin{matrix} a & b \\\\ c & d \\end{matrix}', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });
  });

  describe('Version Info', () => {
    test('should return KaTeX version', () => {
      const version = renderer.getVersion();
      
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long formulas', () => {
      const longFormula = 'x + ' + 'y + '.repeat(100) + 'z';
      const html = renderer.renderToHtml(longFormula, false);
      
      expect(html).toBeDefined();
    });

    test('should handle formulas with special characters', () => {
      const html = renderer.renderToHtml('x \\neq y', false);
      
      expect(html).toBeDefined();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should handle formulas with Unicode', () => {
      const html = renderer.renderToHtml('α + β', false);
      
      expect(html).toBeDefined();
    });

    test('should handle multiple delimiters in extraction', () => {
      const markdown = '$a$ text $$b$$ more $c$';
      const formulas = renderer.extractFormulas(markdown);
      
      expect(formulas.length).toBe(3);
    });

    test('should handle formulas at start and end', () => {
      const markdown = '$start$ middle $end$';
      const formulas = renderer.extractFormulas(markdown);
      
      expect(formulas.length).toBe(2);
      expect(formulas[0].formula).toBe('start');
      expect(formulas[1].formula).toBe('end');
    });
  });
});
