/**
 * Content Extractor Tests
 * Tests for enhanced content extraction functionality
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import ContentExtractor from '../src/content-extractor.js';

describe('ContentExtractor', () => {
  let extractor;
  let dom;

  beforeEach(() => {
    // Setup DOM environment
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://chat.openai.com'
    });
    global.window = dom.window;
    global.document = dom.window.document;
    
    extractor = new ContentExtractor();
  });

  describe('Platform Detection', () => {
    test('should detect ChatGPT platform', () => {
      dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'https://chat.openai.com'
      });
      global.window = dom.window;
      
      const platform = extractor.detectPlatform();
      expect(platform).toBe('chatgpt');
    });

    test('should detect Claude platform', () => {
      dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'https://claude.ai'
      });
      global.window = dom.window;
      
      const platform = extractor.detectPlatform();
      expect(platform).toBe('claude');
    });

    test('should detect Gemini platform', () => {
      dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'https://gemini.google.com'
      });
      global.window = dom.window;
      
      const platform = extractor.detectPlatform();
      expect(platform).toBe('gemini');
    });

    test('should detect DeepSeek platform', () => {
      dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'https://deepseek.com'
      });
      global.window = dom.window;
      
      const platform = extractor.detectPlatform();
      expect(platform).toBe('deepseek');
    });

    test('should return unknown for unsupported platform', () => {
      dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
        url: 'https://example.com'
      });
      global.window = dom.window;
      
      const platform = extractor.detectPlatform();
      expect(platform).toBe('unknown');
    });
  });

  describe('Code Block Extraction', () => {
    test('should extract code blocks with language from class', () => {
      const html = `
        <div>
          <pre><code class="language-javascript">const x = 1;</code></pre>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const codeBlocks = extractor.extractCodeBlocks(element);
      
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].language).toBe('javascript');
      expect(codeBlocks[0].code).toBe('const x = 1;');
    });

    test('should extract code blocks with lang- prefix', () => {
      const html = `
        <div>
          <pre><code class="lang-python">def hello():\n    print("Hello")</code></pre>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const codeBlocks = extractor.extractCodeBlocks(element);
      
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].language).toBe('python');
    });

    test('should detect language from data attributes', () => {
      const html = `
        <div>
          <pre data-language="typescript"><code>interface User { name: string; }</code></pre>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const codeBlocks = extractor.extractCodeBlocks(element);
      
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].language).toBe('typescript');
    });

    test('should detect JavaScript from code content', () => {
      const html = `
        <div>
          <pre><code>function test() {\n  const x = 1;\n  console.log(x);\n}</code></pre>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const codeBlocks = extractor.extractCodeBlocks(element);
      
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].language).toBe('javascript');
    });

    test('should detect Python from code content', () => {
      const html = `
        <div>
          <pre><code>def hello():\n    import sys\n    print("Hello")\n    if True:</code></pre>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const codeBlocks = extractor.extractCodeBlocks(element);
      
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].language).toBe('python');
    });

    test('should handle multiple code blocks', () => {
      const html = `
        <div>
          <pre><code class="language-javascript">const x = 1;</code></pre>
          <pre><code class="language-python">def hello(): pass</code></pre>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const codeBlocks = extractor.extractCodeBlocks(element);
      
      expect(codeBlocks).toHaveLength(2);
      expect(codeBlocks[0].language).toBe('javascript');
      expect(codeBlocks[1].language).toBe('python');
    });
  });

  describe('Table Extraction', () => {
    test('should extract table with thead', () => {
      const html = `
        <div>
          <table>
            <thead>
              <tr><th>Name</th><th>Age</th></tr>
            </thead>
            <tbody>
              <tr><td>John</td><td>30</td></tr>
              <tr><td>Jane</td><td>25</td></tr>
            </tbody>
          </table>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const tables = extractor.extractTables(element);
      
      expect(tables).toHaveLength(1);
      expect(tables[0].headers).toEqual(['Name', 'Age']);
      expect(tables[0].rows).toEqual([['John', '30'], ['Jane', '25']]);
      expect(tables[0].hasHeaderRow).toBe(true);
    });

    test('should extract table without thead but with th cells', () => {
      const html = `
        <div>
          <table>
            <tr><th>Name</th><th>Age</th></tr>
            <tr><td>John</td><td>30</td></tr>
          </table>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const tables = extractor.extractTables(element);
      
      expect(tables).toHaveLength(1);
      expect(tables[0].headers).toEqual(['Name', 'Age']);
      // Should have at least the data row
      expect(tables[0].rows.length).toBeGreaterThanOrEqual(1);
      // The last row should be the data row
      const lastRow = tables[0].rows[tables[0].rows.length - 1];
      expect(lastRow).toEqual(['John', '30']);
      expect(tables[0].hasHeaderRow).toBe(true);
    });

    test('should extract cell alignment', () => {
      const html = `
        <div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left">Left</th>
                <th style="text-align: center">Center</th>
                <th style="text-align: right">Right</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>A</td><td>B</td><td>C</td></tr>
            </tbody>
          </table>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const tables = extractor.extractTables(element);
      
      expect(tables).toHaveLength(1);
      expect(tables[0].alignment).toEqual(['left', 'center', 'right']);
    });

    test('should calculate column count', () => {
      const html = `
        <div>
          <table>
            <thead>
              <tr><th>A</th><th>B</th><th>C</th></tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>2</td><td>3</td></tr>
            </tbody>
          </table>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const tables = extractor.extractTables(element);
      
      expect(tables).toHaveLength(1);
      expect(tables[0].columnCount).toBe(3);
    });
  });

  describe('LaTeX Formula Extraction', () => {
    test('should extract block LaTeX formulas', () => {
      const text = 'Here is a formula: $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$ and more text';
      
      const formulas = extractor.extractLatexFormulas(text);
      
      expect(formulas).toHaveLength(1);
      expect(formulas[0].type).toBe('block');
      expect(formulas[0].formula).toBe('x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}');
    });

    test('should extract inline LaTeX formulas', () => {
      const text = 'The equation $E = mc^2$ is famous';
      
      const formulas = extractor.extractLatexFormulas(text);
      
      expect(formulas).toHaveLength(1);
      expect(formulas[0].type).toBe('inline');
      expect(formulas[0].formula).toBe('E = mc^2');
    });

    test('should not extract dollar signs without LaTeX', () => {
      const text = 'This costs $5 and that costs $10';
      
      const formulas = extractor.extractLatexFormulas(text);
      
      expect(formulas).toHaveLength(0);
    });

    test('should extract formulas with \\[ \\] delimiters', () => {
      const text = 'Formula: \\[x^2 + y^2 = z^2\\] is Pythagorean';
      
      const formulas = extractor.extractLatexFormulas(text);
      
      expect(formulas).toHaveLength(1);
      expect(formulas[0].type).toBe('block');
      expect(formulas[0].formula).toBe('x^2 + y^2 = z^2');
    });

    test('should extract formulas with \\( \\) delimiters', () => {
      const text = 'Inline formula \\(a^2 + b^2\\) here';
      
      const formulas = extractor.extractLatexFormulas(text);
      
      expect(formulas).toHaveLength(1);
      expect(formulas[0].type).toBe('inline');
      expect(formulas[0].formula).toBe('a^2 + b^2');
    });

    test('should handle multiple formulas', () => {
      const text = 'First $x^2$ then $$y = mx + b$$ and finally $z_i$';
      
      const formulas = extractor.extractLatexFormulas(text);
      
      expect(formulas.length).toBeGreaterThanOrEqual(2);
      expect(formulas.some(f => f.type === 'block')).toBe(true);
      expect(formulas.some(f => f.type === 'inline')).toBe(true);
    });

    test('should sort formulas by position', () => {
      const text = 'First $a$ then $b$ then $c$';
      
      const formulas = extractor.extractLatexFormulas(text);
      
      expect(formulas.length).toBeGreaterThanOrEqual(3);
      for (let i = 1; i < formulas.length; i++) {
        expect(formulas[i].position).toBeGreaterThan(formulas[i-1].position);
      }
    });
  });

  describe('LaTeX Detection', () => {
    test('should recognize LaTeX commands', () => {
      expect(extractor.looksLikeLaTeX('\\frac{1}{2}')).toBe(true);
      expect(extractor.looksLikeLaTeX('\\sum_{i=1}^n')).toBe(true);
    });

    test('should recognize subscript/superscript', () => {
      expect(extractor.looksLikeLaTeX('x^2')).toBe(true);
      expect(extractor.looksLikeLaTeX('a_i')).toBe(true);
    });

    test('should recognize math symbols', () => {
      expect(extractor.looksLikeLaTeX('∑')).toBe(true);
      expect(extractor.looksLikeLaTeX('∫')).toBe(true);
      expect(extractor.looksLikeLaTeX('≤')).toBe(true);
    });

    test('should not recognize plain text', () => {
      expect(extractor.looksLikeLaTeX('hello world')).toBe(false);
      expect(extractor.looksLikeLaTeX('123')).toBe(false);
    });
  });

  describe('Platform Header Removal', () => {
    test('should remove ChatGPT headers', () => {
      const text = 'ChatGPT said:\nHello world\nMore content';
      
      const cleaned = extractor.removePlatformHeaders(text, 'chatgpt');
      
      expect(cleaned).not.toContain('ChatGPT said:');
      expect(cleaned).toContain('Hello world');
    });

    test('should remove Claude headers', () => {
      const text = 'Claude said:\nHello world';
      
      const cleaned = extractor.removePlatformHeaders(text, 'claude');
      
      expect(cleaned).not.toContain('Claude said:');
      expect(cleaned).toContain('Hello world');
    });

    test('should handle multiple headers', () => {
      const text = 'ChatGPT:\nFirst\nChatGPT said:\nSecond';
      
      const cleaned = extractor.removePlatformHeaders(text, 'chatgpt');
      
      expect(cleaned).not.toContain('ChatGPT:');
      expect(cleaned).not.toContain('ChatGPT said:');
    });
  });

  describe('UI Element Cleaning', () => {
    test('should remove buttons', () => {
      const html = `
        <div>
          <p>Content</p>
          <button>Copy</button>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const cleaned = extractor.cleanPlatformElements(element);
      
      expect(cleaned.querySelector('button')).toBeNull();
      expect(cleaned.querySelector('p')).not.toBeNull();
    });

    test('should remove avatars', () => {
      const html = `
        <div>
          <div class="avatar"></div>
          <p>Content</p>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      const cleaned = extractor.cleanPlatformElements(element);
      
      expect(cleaned.querySelector('.avatar')).toBeNull();
      expect(cleaned.querySelector('p')).not.toBeNull();
    });

    test('should not modify original element', () => {
      const html = `
        <div>
          <button>Copy</button>
          <p>Content</p>
        </div>
      `;
      document.body.innerHTML = html;
      const element = document.body.querySelector('div');
      
      extractor.cleanPlatformElements(element);
      
      // Original should still have button
      expect(element.querySelector('button')).not.toBeNull();
    });
  });

  describe('Container Finding', () => {
    test('should find container with single selector', () => {
      const html = `<div class="test-container">Content</div>`;
      document.body.innerHTML = html;
      
      const container = extractor.findContainer('.test-container');
      
      expect(container).not.toBeNull();
      expect(container.textContent).toBe('Content');
    });

    test('should find container with array of selectors', () => {
      const html = `<div class="second-selector">Content</div>`;
      document.body.innerHTML = html;
      
      const container = extractor.findContainer([
        '.first-selector',
        '.second-selector',
        '.third-selector'
      ]);
      
      expect(container).not.toBeNull();
      expect(container.textContent).toBe('Content');
    });

    test('should return null if no selector matches', () => {
      const html = `<div class="other">Content</div>`;
      document.body.innerHTML = html;
      
      const container = extractor.findContainer([
        '.first-selector',
        '.second-selector'
      ]);
      
      expect(container).toBeNull();
    });
  });

  describe('Language Detection', () => {
    test('should detect JavaScript', () => {
      const code = 'function test() {\n  const x = 1;\n  console.log(x);\n}';
      expect(extractor.detectLanguageFromCode(code)).toBe('javascript');
    });

    test('should detect Python', () => {
      const code = 'def hello():\n    import sys\n    print("Hello")';
      expect(extractor.detectLanguageFromCode(code)).toBe('python');
    });

    test('should detect TypeScript', () => {
      const code = 'interface User {\n  name: string;\n  age: number;\n}\ntype ID = string;';
      expect(extractor.detectLanguageFromCode(code)).toBe('typescript');
    });

    test('should detect SQL', () => {
      const code = 'SELECT * FROM users WHERE age > 18 AND status = "active"';
      expect(extractor.detectLanguageFromCode(code)).toBe('sql');
    });

    test('should return text for unknown language', () => {
      const code = 'some random text without patterns';
      expect(extractor.detectLanguageFromCode(code)).toBe('text');
    });
  });
});
