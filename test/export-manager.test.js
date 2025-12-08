/**
 * Tests for ExportManager
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import ExportManager from '../src/export-manager.js';

describe('ExportManager', () => {
  let exportManager;
  let mockExtractedContent;

  beforeEach(() => {
    exportManager = new ExportManager();
    
    mockExtractedContent = {
      rawText: '# Test Content\n\nThis is a test.',
      markdown: '# Test Content\n\nThis is a test.',
      codeBlocks: [],
      tables: [],
      latexFormulas: [],
      metadata: {
        platform: 'chatgpt',
        timestamp: new Date(),
        wordCount: 5,
        hasCode: false,
        hasTables: false,
        hasLatex: false
      }
    };
  });

  describe('Constructor', () => {
    test('should initialize all exporters', () => {
      expect(exportManager.markdownExporter).toBeDefined();
      expect(exportManager.docxExporter).toBeDefined();
      expect(exportManager.pdfFastExporter).toBeDefined();
      expect(exportManager.pdfQualityExporter).toBeDefined();
    });

    test('should initialize managers', () => {
      expect(exportManager.settingsManager).toBeDefined();
      expect(exportManager.errorHandler).toBeDefined();
    });

    test('should define all export formats', () => {
      expect(exportManager.formats).toBeDefined();
      expect(exportManager.formats.markdown).toBeDefined();
      expect(exportManager.formats.docx).toBeDefined();
      expect(exportManager.formats['pdf-fast']).toBeDefined();
      expect(exportManager.formats['pdf-quality']).toBeDefined();
    });

    test('should initialize progress tracking', () => {
      expect(exportManager.currentExport).toBeNull();
      expect(exportManager.progressCallbacks).toEqual([]);
    });
  });

  describe('getAvailableFormats', () => {
    test('should return all available formats', () => {
      const formats = exportManager.getAvailableFormats();
      
      expect(formats).toHaveLength(4);
      expect(formats[0]).toHaveProperty('id');
      expect(formats[0]).toHaveProperty('name');
      expect(formats[0]).toHaveProperty('extension');
      expect(formats[0]).toHaveProperty('mimeType');
      expect(formats[0]).toHaveProperty('estimatedTime');
    });

    test('should include markdown format', () => {
      const formats = exportManager.getAvailableFormats();
      const markdown = formats.find(f => f.id === 'markdown');
      
      expect(markdown).toBeDefined();
      expect(markdown.name).toBe('Markdown');
      expect(markdown.extension).toBe('.md');
      expect(markdown.mimeType).toBe('text/markdown');
    });

    test('should include docx format', () => {
      const formats = exportManager.getAvailableFormats();
      const docx = formats.find(f => f.id === 'docx');
      
      expect(docx).toBeDefined();
      expect(docx.name).toBe('DOCX');
      expect(docx.extension).toBe('.docx');
    });

    test('should include both PDF formats', () => {
      const formats = exportManager.getAvailableFormats();
      const pdfFast = formats.find(f => f.id === 'pdf-fast');
      const pdfQuality = formats.find(f => f.id === 'pdf-quality');
      
      expect(pdfFast).toBeDefined();
      expect(pdfQuality).toBeDefined();
      expect(pdfFast.name).toBe('PDF (Fast)');
      expect(pdfQuality.name).toBe('PDF (Quality)');
    });
  });

  describe('estimateExportTime', () => {
    test('should return base time for small content', () => {
      const time = exportManager.estimateExportTime(mockExtractedContent, 'markdown');
      
      expect(time).toBe(1000); // Base time for markdown
    });

    test('should increase time for large content', () => {
      const largeContent = {
        ...mockExtractedContent,
        rawText: 'x'.repeat(150000) // >100KB
      };
      
      const time = exportManager.estimateExportTime(largeContent, 'markdown');
      
      expect(time).toBeGreaterThan(1000);
      expect(time).toBe(2000); // 2x base time
    });

    test('should increase time for medium content', () => {
      const mediumContent = {
        ...mockExtractedContent,
        rawText: 'x'.repeat(75000) // >50KB
      };
      
      const time = exportManager.estimateExportTime(mediumContent, 'markdown');
      
      expect(time).toBeGreaterThan(1000);
      expect(time).toBe(1500); // 1.5x base time
    });

    test('should increase time for content with code blocks', () => {
      const contentWithCode = {
        ...mockExtractedContent,
        codeBlocks: [{ language: 'javascript', code: 'console.log("test");' }]
      };
      
      const time = exportManager.estimateExportTime(contentWithCode, 'markdown');
      
      expect(time).toBe(1200); // 1.2x base time
    });

    test('should increase time for content with tables', () => {
      const contentWithTables = {
        ...mockExtractedContent,
        tables: [{ headers: ['A', 'B'], rows: [['1', '2']] }]
      };
      
      const time = exportManager.estimateExportTime(contentWithTables, 'markdown');
      
      expect(time).toBe(1100); // 1.1x base time
    });

    test('should increase time for content with LaTeX', () => {
      const contentWithLatex = {
        ...mockExtractedContent,
        latexFormulas: [{ type: 'inline', formula: 'x^2' }]
      };
      
      const time = exportManager.estimateExportTime(contentWithLatex, 'markdown');
      
      expect(time).toBe(1300); // 1.3x base time
    });

    test('should compound time increases for complex content', () => {
      const complexContent = {
        ...mockExtractedContent,
        rawText: 'x'.repeat(75000), // 1.5x
        codeBlocks: [{ language: 'javascript', code: 'test' }], // 1.2x
        tables: [{ headers: ['A'], rows: [['1']] }], // 1.1x
        latexFormulas: [{ type: 'inline', formula: 'x' }] // 1.3x
      };
      
      const time = exportManager.estimateExportTime(complexContent, 'markdown');
      
      // 1000 * 1.5 * 1.2 * 1.1 * 1.3 = 2574
      expect(time).toBe(2574);
    });

    test('should return default time for unknown format', () => {
      const time = exportManager.estimateExportTime(mockExtractedContent, 'unknown');
      
      expect(time).toBe(5000); // Default 5 seconds
    });

    test('should have different base times for different formats', () => {
      const markdownTime = exportManager.estimateExportTime(mockExtractedContent, 'markdown');
      const docxTime = exportManager.estimateExportTime(mockExtractedContent, 'docx');
      const pdfFastTime = exportManager.estimateExportTime(mockExtractedContent, 'pdf-fast');
      const pdfQualityTime = exportManager.estimateExportTime(mockExtractedContent, 'pdf-quality');
      
      expect(markdownTime).toBe(1000);
      expect(docxTime).toBe(3000);
      expect(pdfFastTime).toBe(5000);
      expect(pdfQualityTime).toBe(8000);
    });
  });

  describe('getCurrentExportStatus', () => {
    test('should return null when no export in progress', () => {
      const status = exportManager.getCurrentExportStatus();
      
      expect(status).toBeNull();
    });

    test('should return status when export in progress', () => {
      exportManager.currentExport = {
        format: 'markdown',
        startTime: Date.now() - 500,
        status: 'in_progress'
      };
      
      const status = exportManager.getCurrentExportStatus();
      
      expect(status).toBeDefined();
      expect(status.format).toBe('markdown');
      expect(status.status).toBe('in_progress');
      expect(status.elapsed).toBeGreaterThanOrEqual(500);
      expect(status.progress).toBeGreaterThan(0);
      expect(status.estimated).toBe(1000);
    });

    test('should calculate progress percentage', () => {
      exportManager.currentExport = {
        format: 'markdown',
        startTime: Date.now() - 500,
        status: 'in_progress'
      };
      
      const status = exportManager.getCurrentExportStatus();
      
      // 500ms elapsed out of 1000ms estimated = ~50%
      expect(status.progress).toBeGreaterThanOrEqual(45);
      expect(status.progress).toBeLessThanOrEqual(55);
    });

    test('should cap progress at 99%', () => {
      exportManager.currentExport = {
        format: 'markdown',
        startTime: Date.now() - 2000, // More than estimated time
        status: 'in_progress'
      };
      
      const status = exportManager.getCurrentExportStatus();
      
      expect(status.progress).toBe(99);
    });
  });

  describe('Progress Callbacks', () => {
    test('should register progress callback', () => {
      const callback = vi.fn();
      
      exportManager.onProgress(callback);
      
      expect(exportManager.progressCallbacks).toContain(callback);
    });

    test('should unregister progress callback', () => {
      const callback = vi.fn();
      
      exportManager.onProgress(callback);
      exportManager.offProgress(callback);
      
      expect(exportManager.progressCallbacks).not.toContain(callback);
    });

    test('should notify all registered callbacks', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      exportManager.onProgress(callback1);
      exportManager.onProgress(callback2);
      
      const progressData = { status: 'started', format: 'markdown' };
      exportManager.notifyProgress(progressData);
      
      expect(callback1).toHaveBeenCalledWith(progressData);
      expect(callback2).toHaveBeenCalledWith(progressData);
    });

    test('should handle callback errors gracefully', () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Callback error');
      });
      const goodCallback = vi.fn();
      
      exportManager.onProgress(errorCallback);
      exportManager.onProgress(goodCallback);
      
      const progressData = { status: 'started' };
      
      // Should not throw
      expect(() => {
        exportManager.notifyProgress(progressData);
      }).not.toThrow();
      
      // Good callback should still be called
      expect(goodCallback).toHaveBeenCalledWith(progressData);
    });

    test('should ignore non-function callbacks', () => {
      exportManager.onProgress('not a function');
      exportManager.onProgress(null);
      exportManager.onProgress(undefined);
      
      expect(exportManager.progressCallbacks).toHaveLength(0);
    });
  });

  describe('generateFilename', () => {
    test('should generate filename with platform and date', () => {
      const filename = exportManager.generateFilename(mockExtractedContent, 'markdown');
      
      expect(filename).toMatch(/^chatgpt-export-\d{4}-\d{2}-\d{2}\.md$/);
    });

    test('should use correct extension for format', () => {
      const mdFilename = exportManager.generateFilename(mockExtractedContent, 'markdown');
      const docxFilename = exportManager.generateFilename(mockExtractedContent, 'docx');
      const pdfFilename = exportManager.generateFilename(mockExtractedContent, 'pdf-fast');
      
      expect(mdFilename).toMatch(/\.md$/);
      expect(docxFilename).toMatch(/\.docx$/);
      expect(pdfFilename).toMatch(/\.pdf$/);
    });

    test('should use default platform if not provided', () => {
      const contentWithoutPlatform = {
        ...mockExtractedContent,
        metadata: {}
      };
      
      const filename = exportManager.generateFilename(contentWithoutPlatform, 'markdown');
      
      expect(filename).toMatch(/^ai-export-/);
    });

    test('should use default extension for unknown format', () => {
      const filename = exportManager.generateFilename(mockExtractedContent, 'unknown');
      
      expect(filename).toMatch(/\.txt$/);
    });
  });

  describe('validateOptions', () => {
    test('should return false for null options', () => {
      expect(exportManager.validateOptions(null)).toBe(false);
    });

    test('should return false for undefined options', () => {
      expect(exportManager.validateOptions(undefined)).toBe(false);
    });

    test('should return true for empty options object', () => {
      expect(exportManager.validateOptions({})).toBe(true);
    });

    test('should return false for invalid format', () => {
      expect(exportManager.validateOptions({ format: 'invalid' })).toBe(false);
    });

    test('should return true for valid format', () => {
      expect(exportManager.validateOptions({ format: 'markdown' })).toBe(true);
      expect(exportManager.validateOptions({ format: 'docx' })).toBe(true);
      expect(exportManager.validateOptions({ format: 'pdf-fast' })).toBe(true);
      expect(exportManager.validateOptions({ format: 'pdf-quality' })).toBe(true);
    });

    test('should return false for filename with invalid characters', () => {
      const invalidFilenames = [
        'file<name>.md',
        'file>name.md',
        'file:name.md',
        'file"name.md',
        'file/name.md',
        'file\\name.md',
        'file|name.md',
        'file?name.md',
        'file*name.md'
      ];
      
      invalidFilenames.forEach(filename => {
        expect(exportManager.validateOptions({ filename })).toBe(false);
      });
    });

    test('should return true for valid filename', () => {
      expect(exportManager.validateOptions({ filename: 'valid-filename.md' })).toBe(true);
      expect(exportManager.validateOptions({ filename: 'file_name-123.docx' })).toBe(true);
    });
  });

  describe('Format Definitions', () => {
    test('markdown format should have correct properties', () => {
      const format = exportManager.formats.markdown;
      
      expect(format.name).toBe('Markdown');
      expect(format.extension).toBe('.md');
      expect(format.mimeType).toBe('text/markdown');
      expect(format.exporter).toBe(exportManager.markdownExporter);
      expect(format.estimatedTime).toBe(1000);
    });

    test('docx format should have correct properties', () => {
      const format = exportManager.formats.docx;
      
      expect(format.name).toBe('DOCX');
      expect(format.extension).toBe('.docx');
      expect(format.mimeType).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      expect(format.exporter).toBe(exportManager.docxExporter);
      expect(format.estimatedTime).toBe(3000);
    });

    test('pdf-fast format should have correct properties', () => {
      const format = exportManager.formats['pdf-fast'];
      
      expect(format.name).toBe('PDF (Fast)');
      expect(format.extension).toBe('.pdf');
      expect(format.mimeType).toBe('application/pdf');
      expect(format.exporter).toBe(exportManager.pdfFastExporter);
      expect(format.estimatedTime).toBe(5000);
    });

    test('pdf-quality format should have correct properties', () => {
      const format = exportManager.formats['pdf-quality'];
      
      expect(format.name).toBe('PDF (Quality)');
      expect(format.extension).toBe('.pdf');
      expect(format.mimeType).toBe('application/pdf');
      expect(format.exporter).toBe(exportManager.pdfQualityExporter);
      expect(format.estimatedTime).toBe(8000);
    });
  });

  describe('Integration', () => {
    test('should have all required dependencies', () => {
      expect(exportManager.markdownExporter).toBeDefined();
      expect(exportManager.docxExporter).toBeDefined();
      expect(exportManager.pdfFastExporter).toBeDefined();
      expect(exportManager.pdfQualityExporter).toBeDefined();
      expect(exportManager.settingsManager).toBeDefined();
      expect(exportManager.errorHandler).toBeDefined();
    });

    test('should provide complete export workflow', () => {
      // Check that all methods needed for export workflow exist
      expect(typeof exportManager.export).toBe('function');
      expect(typeof exportManager.getAvailableFormats).toBe('function');
      expect(typeof exportManager.estimateExportTime).toBe('function');
      expect(typeof exportManager.getCurrentExportStatus).toBe('function');
      expect(typeof exportManager.onProgress).toBe('function');
      expect(typeof exportManager.offProgress).toBe('function');
    });
  });
});
