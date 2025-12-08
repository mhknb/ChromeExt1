/**
 * File Validator Tests
 * Tests for file format validation, filename sanitization, and UTF-8 encoding
 */

import { describe, test, expect, beforeEach } from 'vitest';
import FileValidator from '../src/file-validator.js';

describe('FileValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new FileValidator();
  });

  describe('DOCX Validation (Requirement 9.1)', () => {
    test('should validate valid DOCX file with PK header and Office Open XML structure', async () => {
      // Create a minimal DOCX-like structure (must be > 1024 bytes)
      const docxBytes = new Uint8Array([
        0x50, 0x4B, 0x03, 0x04, // PK header
        ...new Array(100).fill(0),
        ...[0x5B, 0x43, 0x6F, 0x6E, 0x74, 0x65, 0x6E, 0x74, 0x5F, 0x54, 0x79, 0x70, 0x65, 0x73, 0x5D], // [Content_Types]
        ...new Array(1000).fill(0) // Increased to ensure > 1024 bytes total
      ]);
      const blob = new Blob([docxBytes]);

      const result = await validator.validateDocx(blob);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.format).toBe('docx');
    });

    test('should reject file without PK header', async () => {
      const invalidBytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, ...new Array(1020).fill(0)]);
      const blob = new Blob([invalidBytes]);

      const result = await validator.validateDocx(blob);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid DOCX format: Missing ZIP header');
    });

    test('should reject file that is too small', async () => {
      const smallBytes = new Uint8Array([0x50, 0x4B, 0x03, 0x04]);
      const blob = new Blob([smallBytes]);

      const result = await validator.validateDocx(blob);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File too small to be a valid DOCX file');
    });

    test('should reject file without Office Open XML structure', async () => {
      const docxBytes = new Uint8Array([
        0x50, 0x4B, 0x03, 0x04, // PK header
        ...new Array(1020).fill(0x41) // Fill with 'A' characters
      ]);
      const blob = new Blob([docxBytes]);

      const result = await validator.validateDocx(blob);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid DOCX format: Missing Office Open XML structure');
    });
  });

  describe('PDF Validation (Requirement 9.2)', () => {
    test('should validate valid PDF 1.4 file', async () => {
      const pdfContent = '%PDF-1.4\n' + 'A'.repeat(1000) + '\n%%EOF';
      const blob = new Blob([pdfContent]);

      const result = await validator.validatePdf(blob);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.format).toBe('pdf');
      expect(result.version).toBe('1.4');
    });

    test('should validate valid PDF 1.7 file', async () => {
      const pdfContent = '%PDF-1.7\n' + 'A'.repeat(1000) + '\n%%EOF';
      const blob = new Blob([pdfContent]);

      const result = await validator.validatePdf(blob);

      expect(result.valid).toBe(true);
      expect(result.version).toBe('1.7');
    });

    test('should validate valid PDF 2.0 file', async () => {
      const pdfContent = '%PDF-2.0\n' + 'A'.repeat(1000) + '\n%%EOF';
      const blob = new Blob([pdfContent]);

      const result = await validator.validatePdf(blob);

      expect(result.valid).toBe(true);
      expect(result.version).toBe('2.0');
    });

    test('should reject PDF version older than 1.4', async () => {
      const pdfContent = '%PDF-1.3\n' + 'A'.repeat(1000) + '\n%%EOF';
      const blob = new Blob([pdfContent]);

      const result = await validator.validatePdf(blob);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('PDF version 1.3 is too old');
      expect(result.version).toBe('1.3');
    });

    test('should reject file without PDF header', async () => {
      const invalidContent = 'Not a PDF file\n' + 'A'.repeat(1000);
      const blob = new Blob([invalidContent]);

      const result = await validator.validatePdf(blob);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid PDF format: Missing %PDF- header');
    });

    test('should reject file without EOF marker', async () => {
      const pdfContent = '%PDF-1.4\n' + 'A'.repeat(1000);
      const blob = new Blob([pdfContent]);

      const result = await validator.validatePdf(blob);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid PDF format: Missing %%EOF marker');
    });

    test('should reject file that is too small', async () => {
      const smallContent = '%PDF-1.4';
      const blob = new Blob([smallContent]);

      const result = await validator.validatePdf(blob);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File too small to be a valid PDF file');
    });
  });

  describe('Markdown Validation (Requirement 9.3)', () => {
    test('should validate valid GFM markdown', async () => {
      const markdown = `# Heading

This is a paragraph with **bold** and *italic* text.

\`\`\`javascript
const x = 1;
\`\`\`

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;

      const result = await validator.validateMarkdown(markdown);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.format).toBe('markdown');
    });

    test('should reject empty markdown', async () => {
      const result = await validator.validateMarkdown('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Markdown content is empty');
    });

    test('should detect unclosed code blocks', async () => {
      const markdown = '# Heading\n\n```javascript\nconst x = 1;\n';

      const result = await validator.validateMarkdown(markdown);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unclosed code block detected (odd number of ``` markers)');
    });

    test('should warn about unclosed LaTeX blocks', async () => {
      const markdown = '# Heading\n\n$$\nx = y\n';

      const result = await validator.validateMarkdown(markdown);

      expect(result.warnings).toContain('Unclosed LaTeX block detected (odd number of $$ markers)');
    });

    test('should warn about inconsistent table columns', async () => {
      const markdown = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   |
`;

      const result = await validator.validateMarkdown(markdown);

      expect(result.warnings.some(w => w.includes('has 1 columns, expected 2'))).toBe(true);
    });

    test('should warn about malformed table separators', async () => {
      const markdown = `| Header 1 | Header 2 |
|-----|
| Cell 1   | Cell 2   |
`;

      const result = await validator.validateMarkdown(markdown);

      expect(result.warnings.some(w => w.includes('Malformed table separator'))).toBe(true);
    });

    test('should warn about unmatched brackets', async () => {
      const markdown = '# Heading\n\n[Link text without closing bracket\n\nAnother paragraph\n\n[Another unclosed link';

      const result = await validator.validateMarkdown(markdown);

      expect(result.warnings.some(w => w.includes('Unmatched square brackets'))).toBe(true);
    });

    test('should validate markdown from Blob', async () => {
      const markdown = '# Valid Markdown\n\nParagraph text.';
      const blob = new Blob([markdown]);

      const result = await validator.validateMarkdown(blob);

      expect(result.valid).toBe(true);
    });
  });

  describe('Filename Sanitization (Requirement 9.4)', () => {
    test('should keep valid alphanumeric filenames', () => {
      const result = validator.sanitizeFilename('MyDocument123');
      expect(result).toBe('MyDocument123');
    });

    test('should keep valid filenames with dashes and underscores', () => {
      const result = validator.sanitizeFilename('my-document_v2');
      expect(result).toBe('my-document_v2');
    });

    test('should replace invalid characters with underscores', () => {
      const result = validator.sanitizeFilename('my<document>file');
      expect(result).toBe('my_document_file');
    });

    test('should replace multiple invalid characters', () => {
      const result = validator.sanitizeFilename('file:name/with\\invalid|chars');
      expect(result).toBe('file_name_with_invalid_chars');
    });

    test('should replace multiple spaces with single space', () => {
      const result = validator.sanitizeFilename('my    document    file');
      expect(result).toBe('my document file');
    });

    test('should remove leading and trailing spaces', () => {
      const result = validator.sanitizeFilename('  my document  ');
      expect(result).toBe('my document');
    });

    test('should remove leading and trailing dots', () => {
      const result = validator.sanitizeFilename('...my.document...');
      expect(result).toBe('my.document');
    });

    test('should handle reserved Windows names', () => {
      const result = validator.sanitizeFilename('CON');
      expect(result).toBe('_CON');
    });

    test('should handle reserved Windows names with extensions', () => {
      const result = validator.sanitizeFilename('PRN.txt');
      expect(result).toBe('_PRN.txt');
    });

    test('should handle empty filename', () => {
      const result = validator.sanitizeFilename('');
      expect(result).toBe('untitled');
    });

    test('should handle null filename', () => {
      const result = validator.sanitizeFilename(null);
      expect(result).toBe('untitled');
    });

    test('should truncate long filenames', () => {
      const longName = 'a'.repeat(250);
      const result = validator.sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(200);
    });

    test('should add extension when provided', () => {
      const result = validator.sanitizeFilename('mydocument', '.pdf');
      expect(result).toBe('mydocument.pdf');
    });

    test('should add extension without dot', () => {
      const result = validator.sanitizeFilename('mydocument', 'pdf');
      expect(result).toBe('mydocument.pdf');
    });

    test('should replace existing extension when new one provided', () => {
      const result = validator.sanitizeFilename('mydocument.txt', '.pdf');
      expect(result).toBe('mydocument.pdf');
    });

    test('should handle special characters and add extension', () => {
      const result = validator.sanitizeFilename('my:document', '.docx');
      expect(result).toBe('my_document.docx');
    });
  });

  describe('UTF-8 Encoding Validation (Requirement 9.5)', () => {
    test('should validate valid UTF-8 content', () => {
      const content = 'Hello World! 你好世界 مرحبا بالعالم';
      const result = validator.validateUtf8(content);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate UTF-8 with emojis', () => {
      const content = 'Hello 👋 World 🌍';
      const result = validator.validateUtf8(content);

      expect(result.valid).toBe(true);
    });

    test('should validate UTF-8 with Turkish characters', () => {
      const content = 'Türkçe karakterler: ğ ü ş ı ö ç Ğ Ü Ş İ Ö Ç';
      const result = validator.validateUtf8(content);

      expect(result.valid).toBe(true);
    });

    test('should reject content with null bytes', () => {
      const content = 'Hello\0World';
      const result = validator.validateUtf8(content);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content contains null bytes');
    });

    test('should enforce UTF-8 encoding', () => {
      const content = 'Hello World! 你好世界';
      const blob = validator.enforceUtf8Encoding(content);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain;charset=utf-8');
    });

    test('should create blob with correct size', async () => {
      const content = 'Hello World!';
      const blob = validator.enforceUtf8Encoding(content);
      const text = await blob.text();

      expect(text).toBe(content);
    });
  });

  describe('Generic File Validation', () => {
    test('should validate DOCX through generic method', async () => {
      const docxBytes = new Uint8Array([
        0x50, 0x4B, 0x03, 0x04,
        ...new Array(100).fill(0),
        ...[0x5B, 0x43, 0x6F, 0x6E, 0x74, 0x65, 0x6E, 0x74, 0x5F, 0x54, 0x79, 0x70, 0x65, 0x73, 0x5D],
        ...new Array(1000).fill(0) // Increased to ensure > 1024 bytes total
      ]);
      const blob = new Blob([docxBytes]);

      const result = await validator.validateFile(blob, 'docx');

      expect(result.valid).toBe(true);
      expect(result.format).toBe('docx');
    });

    test('should validate PDF through generic method', async () => {
      const pdfContent = '%PDF-1.4\n' + 'A'.repeat(1000) + '\n%%EOF';
      const blob = new Blob([pdfContent]);

      const result = await validator.validateFile(blob, 'pdf');

      expect(result.valid).toBe(true);
      expect(result.format).toBe('pdf');
    });

    test('should validate markdown through generic method', async () => {
      const markdown = '# Valid Markdown\n\nParagraph text.';

      const result = await validator.validateFile(markdown, 'markdown');

      expect(result.valid).toBe(true);
      expect(result.format).toBe('markdown');
    });

    test('should handle unsupported format', async () => {
      const result = await validator.validateFile('content', 'unsupported');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unsupported format: unsupported');
    });
  });

  describe('Helper Methods', () => {
    test('should check magic bytes correctly', () => {
      const bytes = new Uint8Array([0x50, 0x4B, 0x03, 0x04, 0x00]);
      const magicBytes = [0x50, 0x4B, 0x03, 0x04];

      const result = validator.checkMagicBytes(bytes, magicBytes);

      expect(result).toBe(true);
    });

    test('should reject incorrect magic bytes', () => {
      const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
      const magicBytes = [0x50, 0x4B, 0x03, 0x04];

      const result = validator.checkMagicBytes(bytes, magicBytes);

      expect(result).toBe(false);
    });

    test('should handle bytes shorter than magic bytes', () => {
      const bytes = new Uint8Array([0x50, 0x4B]);
      const magicBytes = [0x50, 0x4B, 0x03, 0x04];

      const result = validator.checkMagicBytes(bytes, magicBytes);

      expect(result).toBe(false);
    });

    test('should convert Blob to ArrayBuffer', async () => {
      const blob = new Blob([new Uint8Array([1, 2, 3, 4])]);
      const buffer = await validator.getArrayBuffer(blob);

      expect(buffer).toBeInstanceOf(ArrayBuffer);
      expect(buffer.byteLength).toBe(4);
    });

    test('should return ArrayBuffer as-is', async () => {
      const buffer = new ArrayBuffer(4);
      const result = await validator.getArrayBuffer(buffer);

      expect(result).toBe(buffer);
    });

    test('should convert Blob to text', async () => {
      const text = 'Hello World';
      const blob = new Blob([text]);
      const result = await validator.blobToText(blob);

      expect(result).toBe(text);
    });
  });
});
