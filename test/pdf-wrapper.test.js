/**
 * Tests for PDF Wrapper (Enhanced)
 * Tests the integration of SyntaxHighlighter and LaTeXRenderer
 */

import { describe, test, expect, beforeEach } from 'vitest';
import PdfConverterBundled from '../src/pdf-wrapper.js';

describe('PdfConverterBundled - Enhanced', () => {
  let pdfConverter;

  beforeEach(() => {
    pdfConverter = new PdfConverterBundled();
  });

  describe('Constructor', () => {
    test('should initialize with SyntaxHighlighter and LaTeXRenderer', () => {
      expect(pdfConverter.syntaxHighlighter).toBeDefined();
      expect(pdfConverter.latexRenderer).toBeDefined();
    });
  });

  describe('escapeHtml', () => {
    test('should escape HTML special characters', () => {
      const input = '<div>Test & "quotes" \'apostrophe\'</div>';
      const expected = '&lt;div&gt;Test &amp; &quot;quotes&quot; &#039;apostrophe&#039;&lt;/div&gt;';
      expect(pdfConverter.escapeHtml(input)).toBe(expected);
    });

    test('should handle empty string', () => {
      expect(pdfConverter.escapeHtml('')).toBe('');
    });

    test('should handle string without special characters', () => {
      const input = 'Hello World';
      expect(pdfConverter.escapeHtml(input)).toBe(input);
    });
  });

  describe('markdownToHtmlWithKatex', () => {
    test('should convert simple markdown to HTML', async () => {
      const markdown = '# Hello World\n\nThis is a test.';
      const html = await pdfConverter.markdownToHtmlWithKatex(markdown);
      
      expect(html).toContain('<h1');
      expect(html).toContain('Hello World');
      expect(html).toContain('This is a test');
    });

    test('should preserve and highlight code blocks', async () => {
      const markdown = '```javascript\nconst x = 1;\nconsole.log(x);\n```';
      const html = await pdfConverter.markdownToHtmlWithKatex(markdown);
      
      expect(html).toContain('<pre class="code-block">');
      expect(html).toContain('<code');
      expect(html).toContain('const');
      expect(html).toContain('x');
    });

    test('should handle code blocks without language', async () => {
      const markdown = '```\nplain text code\n```';
      const html = await pdfConverter.markdownToHtmlWithKatex(markdown);
      
      expect(html).toContain('<pre class="code-block">');
      expect(html).toContain('plain text code');
    });

    test('should render inline LaTeX formulas', async () => {
      const markdown = 'The formula $x^2 + y^2 = z^2$ is famous.';
      const html = await pdfConverter.markdownToHtmlWithKatex(markdown);
      
      expect(html).toContain('<span class="math-inline">');
      expect(html).toContain('katex');
    });

    test('should render block LaTeX formulas', async () => {
      const markdown = 'Here is a formula:\n\n$$\\int_0^1 x^2 dx$$\n\nEnd.';
      const html = await pdfConverter.markdownToHtmlWithKatex(markdown);
      
      expect(html).toContain('<div class="math-block">');
      expect(html).toContain('katex');
    });

    test('should handle invalid LaTeX gracefully', async () => {
      const markdown = 'Invalid formula: $\\invalid{command}$';
      const html = await pdfConverter.markdownToHtmlWithKatex(markdown);
      
      // Should still produce output (either rendered or as code)
      expect(html).toBeTruthy();
      expect(html.length).toBeGreaterThan(0);
    });

    test('should not process LaTeX inside code blocks', async () => {
      const markdown = '```\n$x^2$ should not be rendered\n```';
      const html = await pdfConverter.markdownToHtmlWithKatex(markdown);
      
      // The $ symbols should be preserved in the code block
      expect(html).toContain('$');
    });

    test('should handle mixed content with code and LaTeX', async () => {
      const markdown = `# Math and Code

Here is some math: $E = mc^2$

And some code:

\`\`\`python
def calculate(x):
    return x ** 2
\`\`\`

More math:

$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$
`;
      const html = await pdfConverter.markdownToHtmlWithKatex(markdown);
      
      expect(html).toContain('<h1');
      expect(html).toContain('Math and Code');
      expect(html).toContain('<span class="math-inline">');
      expect(html).toContain('<pre class="code-block">');
      // Check for highlighted code (may be split across spans)
      expect(html).toContain('def');
      expect(html).toContain('calculate');
      expect(html).toContain('<div class="math-block">');
    });

    test('should handle multiple code blocks', async () => {
      const markdown = `\`\`\`javascript
const a = 1;
\`\`\`

Some text.

\`\`\`python
b = 2
\`\`\``;
      const html = await pdfConverter.markdownToHtmlWithKatex(markdown);
      
      expect(html).toContain('language-javascript');
      expect(html).toContain('language-python');
      expect(html).toContain('const');
    });

    test('should handle empty markdown', async () => {
      const html = await pdfConverter.markdownToHtmlWithKatex('');
      expect(html).toBe('');
    });
  });
});
