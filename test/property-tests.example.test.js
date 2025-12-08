/**
 * Example Property-Based Tests
 * Demonstrates fast-check integration
 */

import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import MarkdownExporter from '../src/markdown-exporter.js';

describe('Property-Based Tests (Examples)', () => {
  it('should always remove platform headers regardless of input', () => {
    const exporter = new MarkdownExporter();
    
    fc.assert(
      fc.property(
        fc.string(),
        (content) => {
          const withHeader = `ChatGPT said:\n\n${content}`;
          const cleaned = exporter.cleanMarkdown(withHeader);
          
          // Platform header should be removed
          return !cleaned.includes('ChatGPT said:');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should normalize all line breaks to LF', () => {
    const exporter = new MarkdownExporter();
    
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 10 }),
        (lines) => {
          const markdown = lines.join('\r\n');
          const cleaned = exporter.cleanMarkdown(markdown);
          
          // Should not contain CRLF
          return !cleaned.includes('\r\n');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve content length approximately (within reason)', () => {
    const exporter = new MarkdownExporter();
    
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 1000 }),
        (content) => {
          const cleaned = exporter.cleanMarkdown(content);
          
          // Cleaned content should not be drastically different in length
          // (allowing for whitespace normalization)
          const lengthRatio = cleaned.length / content.length;
          return lengthRatio >= 0.5 && lengthRatio <= 1.5;
        }
      ),
      { numRuns: 100 }
    );
  });
});
