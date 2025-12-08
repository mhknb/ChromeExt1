/**
 * Export Manager
 * Coordinates all export operations and manages format selection
 * Validates: Requirements 3.1, 5.4
 */

import MarkdownExporter from './markdown-exporter.js';
import DocxExporterEnhanced from './docx-exporter-enhanced.js';
import PdfConverterBundled from './pdf-wrapper.js';
import PdfQualityExporter from './pdf-quality-exporter.js';
import SettingsManager from './settings-manager.js';
import ErrorHandler from './error-handler.js';
import PerformanceManager from './performance-manager.js';

class ExportManager {
  constructor() {
    // Initialize exporters
    this.markdownExporter = new MarkdownExporter();
    this.docxExporter = new DocxExporterEnhanced();
    this.pdfFastExporter = new PdfConverterBundled();
    this.pdfQualityExporter = new PdfQualityExporter();
    
    // Initialize managers
    this.settingsManager = new SettingsManager();
    this.errorHandler = new ErrorHandler();
    this.performanceManager = new PerformanceManager();
    
    // Export format definitions
    this.formats = {
      markdown: {
        name: 'Markdown',
        extension: '.md',
        mimeType: 'text/markdown',
        exporter: this.markdownExporter,
        estimatedTime: 1000 // 1 second
      },
      docx: {
        name: 'DOCX',
        extension: '.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        exporter: this.docxExporter,
        estimatedTime: 3000 // 3 seconds
      },
      'pdf-fast': {
        name: 'PDF (Fast)',
        extension: '.pdf',
        mimeType: 'application/pdf',
        exporter: this.pdfFastExporter,
        estimatedTime: 5000 // 5 seconds
      },
      'pdf-quality': {
        name: 'PDF (Quality)',
        extension: '.pdf',
        mimeType: 'application/pdf',
        exporter: this.pdfQualityExporter,
        estimatedTime: 8000 // 8 seconds
      }
    };
    
    // Progress tracking
    this.currentExport = null;
    this.progressCallbacks = [];
  }

  /**
   * Export content in specified format
   * Validates: Requirement 3.1 (format selection)
   * @param {Object} extractedContent - Content from ContentExtractor
   * @param {Object} options - Export options
   * @returns {Promise<Object>} Export result
   */
  async export(extractedContent, options = {}) {
    const startTime = Date.now();
    
    try {
      // Load settings if not provided
      const settings = options.settings || await this.settingsManager.loadSettings();
      
      // Determine format
      const format = options.format || settings.export.defaultFormat || 'markdown';
      
      // Validate format
      if (!this.formats[format]) {
        throw new Error(`Unsupported format: ${format}`);
      }
      
      console.log('[ExportManager] Starting export:', format);
      console.log('[ExportManager] Content size:', extractedContent.rawText?.length || 0);
      
      // Check if we should use Web Worker for large content
      const contentSize = extractedContent.rawText?.length || 0;
      const useWorker = this.performanceManager.shouldUseWorker(extractedContent.rawText || '');
      
      if (useWorker) {
        console.log('[ExportManager] Large content detected, will use Web Worker');
      }
      
      // Set current export for progress tracking
      this.currentExport = {
        format,
        startTime,
        status: 'in_progress'
      };
      
      // Notify progress: started
      this.notifyProgress({
        status: 'started',
        format,
        estimatedTime: this.estimateExportTime(extractedContent, format)
      });
      
      // Perform export based on format
      let result;
      
      switch (format) {
        case 'markdown':
          result = await this.exportMarkdown(extractedContent, options, settings);
          break;
        
        case 'docx':
          result = await this.exportDocx(extractedContent, options, settings);
          break;
        
        case 'pdf-fast':
          result = await this.exportPdfFast(extractedContent, options, settings);
          break;
        
        case 'pdf-quality':
          result = await this.exportPdfQuality(extractedContent, options, settings);
          break;
        
        default:
          throw new Error(`Format not implemented: ${format}`);
      }
      
      // Calculate duration
      const duration = Date.now() - startTime;
      
      // Update result with timing
      const exportResult = {
        ...result,
        format,
        duration,
        timestamp: new Date().toISOString()
      };
      
      // Update current export status
      this.currentExport.status = 'completed';
      this.currentExport.duration = duration;
      
      // Notify progress: completed
      this.notifyProgress({
        status: 'completed',
        format,
        duration,
        result: exportResult
      });
      
      console.log('[ExportManager] Export completed:', format, 'in', duration, 'ms');
      
      return exportResult;
      
    } catch (error) {
      console.error('[ExportManager] Export failed:', error);
      
      // Handle error
      const errorResponse = this.errorHandler.handle(error, 'ExportManager.export');
      
      // Update current export status
      if (this.currentExport) {
        this.currentExport.status = 'failed';
        this.currentExport.error = errorResponse;
      }
      
      // Notify progress: failed
      this.notifyProgress({
        status: 'failed',
        format: options.format,
        error: errorResponse
      });
      
      throw error;
    } finally {
      // Clear current export after a delay
      setTimeout(() => {
        this.currentExport = null;
      }, 1000);
    }
  }

  /**
   * Export as Markdown
   * @param {Object} extractedContent - Extracted content
   * @param {Object} options - Export options
   * @param {Object} settings - User settings
   * @returns {Promise<Object>} Export result
   */
  async exportMarkdown(extractedContent, options, settings) {
    const exportOptions = {
      filename: options.filename,
      preserveCodeBlocks: settings.export.preserveCodeBlocks,
      preserveLatex: true,
      preserveTables: true,
      removePlatformHeaders: true
    };
    
    return await this.markdownExporter.exportContent(extractedContent, exportOptions);
  }

  /**
   * Export as DOCX
   * @param {Object} extractedContent - Extracted content
   * @param {Object} options - Export options
   * @param {Object} settings - User settings
   * @returns {Promise<Object>} Export result
   */
  async exportDocx(extractedContent, options, settings) {
    const markdown = extractedContent.rawText || '';
    
    const exportOptions = {
      title: options.title || 'AI Export',
      embedFonts: settings.docx.embedFonts,
      includeHeader: settings.docx.includeHeader,
      includeFooter: settings.docx.includeFooter,
      pageNumbers: settings.docx.pageNumbers,
      syntaxHighlighting: settings.export.syntaxHighlighting
    };
    
    // Convert markdown to DOCX
    const blob = await this.docxExporter.convertMarkdownToDocx(markdown, exportOptions);
    
    // Generate filename
    const filename = options.filename || this.generateFilename(extractedContent, 'docx');
    
    // Download file
    await this.downloadBlob(blob, filename);
    
    return {
      success: true,
      filename,
      fileSize: blob.size
    };
  }

  /**
   * Export as Fast PDF
   * @param {Object} extractedContent - Extracted content
   * @param {Object} options - Export options
   * @param {Object} settings - User settings
   * @returns {Promise<Object>} Export result
   */
  async exportPdfFast(extractedContent, options, settings) {
    const markdown = extractedContent.rawText || '';
    
    // Lazy load PDF converter if not already loaded
    await this.performanceManager.loadPdfConverter();
    
    // Export using fast PDF converter
    await this.pdfFastExporter.exportToPdf(markdown);
    
    const filename = options.filename || this.generateFilename(extractedContent, 'pdf');
    
    return {
      success: true,
      filename,
      fileSize: 0 // Size not available for fast PDF
    };
  }

  /**
   * Export as Quality PDF
   * @param {Object} extractedContent - Extracted content
   * @param {Object} options - Export options
   * @param {Object} settings - User settings
   * @returns {Promise<Object>} Export result
   */
  async exportPdfQuality(extractedContent, options, settings) {
    const markdown = extractedContent.rawText || '';
    
    // Lazy load PDF quality exporter if not already loaded
    await this.performanceManager.loadPdfQualityExporter();
    
    const exportOptions = {
      filename: options.filename || this.generateFilename(extractedContent, 'pdf'),
      title: options.title || 'AI Export',
      author: 'AI Content Exporter',
      includeTOC: settings.pdf.includeTOC || markdown.length > 5000,
      includePageNumbers: settings.docx.pageNumbers,
      includeHeader: settings.docx.includeHeader,
      includeFooter: settings.docx.includeFooter
    };
    
    // Export using quality PDF converter
    await this.pdfQualityExporter.exportToPdf(markdown, exportOptions);
    
    return {
      success: true,
      filename: exportOptions.filename,
      fileSize: 0 // Size not available until download
    };
  }

  /**
   * Get available export formats
   * @returns {Array<Object>} Available formats
   */
  getAvailableFormats() {
    return Object.entries(this.formats).map(([key, format]) => ({
      id: key,
      name: format.name,
      extension: format.extension,
      mimeType: format.mimeType,
      estimatedTime: format.estimatedTime
    }));
  }

  /**
   * Estimate export time based on content size and format
   * Validates: Requirement 5.4 (progress tracking)
   * @param {Object} extractedContent - Content to export
   * @param {string} format - Export format
   * @returns {number} Estimated time in milliseconds
   */
  estimateExportTime(extractedContent, format) {
    const formatInfo = this.formats[format];
    if (!formatInfo) {
      return 5000; // Default 5 seconds
    }
    
    // Base time from format definition
    let estimatedTime = formatInfo.estimatedTime;
    
    // Adjust based on content size
    const contentSize = extractedContent.rawText?.length || 0;
    
    if (contentSize > 100000) {
      // Large content (>100KB)
      estimatedTime *= 2;
    } else if (contentSize > 50000) {
      // Medium content (>50KB)
      estimatedTime *= 1.5;
    }
    
    // Adjust based on content complexity
    const hasCode = extractedContent.codeBlocks?.length > 0;
    const hasTables = extractedContent.tables?.length > 0;
    const hasLatex = extractedContent.latexFormulas?.length > 0;
    
    if (hasCode) estimatedTime *= 1.2;
    if (hasTables) estimatedTime *= 1.1;
    if (hasLatex) estimatedTime *= 1.3;
    
    return Math.round(estimatedTime);
  }

  /**
   * Get current export status
   * Validates: Requirement 5.4 (progress tracking)
   * @returns {Object|null} Current export status
   */
  getCurrentExportStatus() {
    if (!this.currentExport) {
      return null;
    }
    
    const elapsed = Date.now() - this.currentExport.startTime;
    const estimated = this.formats[this.currentExport.format]?.estimatedTime || 5000;
    const progress = Math.min(Math.round((elapsed / estimated) * 100), 99);
    
    return {
      ...this.currentExport,
      elapsed,
      progress,
      estimated
    };
  }

  /**
   * Register progress callback
   * @param {Function} callback - Progress callback function
   */
  onProgress(callback) {
    if (typeof callback === 'function') {
      this.progressCallbacks.push(callback);
    }
  }

  /**
   * Unregister progress callback
   * @param {Function} callback - Progress callback function
   */
  offProgress(callback) {
    const index = this.progressCallbacks.indexOf(callback);
    if (index !== -1) {
      this.progressCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all progress callbacks
   * @param {Object} progressData - Progress data
   */
  notifyProgress(progressData) {
    this.progressCallbacks.forEach(callback => {
      try {
        callback(progressData);
      } catch (error) {
        console.error('[ExportManager] Progress callback error:', error);
      }
    });
  }

  /**
   * Generate filename from content metadata
   * @param {Object} extractedContent - Content from ContentExtractor
   * @param {string} format - Export format
   * @returns {string} Generated filename
   */
  generateFilename(extractedContent, format) {
    const timestamp = new Date().toISOString().split('T')[0];
    const platform = extractedContent.metadata?.platform || 'ai';
    const extension = this.formats[format]?.extension || '.txt';
    
    return `${platform}-export-${timestamp}${extension}`;
  }

  /**
   * Download blob as file
   * @param {Blob} blob - File blob
   * @param {string} filename - Filename
   */
  async downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Validate export options
   * @param {Object} options - Export options
   * @returns {boolean} Is valid
   */
  validateOptions(options) {
    if (!options) {
      return false;
    }
    
    // Validate format
    if (options.format && !this.formats[options.format]) {
      return false;
    }
    
    // Validate filename if provided
    if (options.filename) {
      const invalidChars = /[<>:"/\\|?*\x00-\x1F]/g;
      if (invalidChars.test(options.filename)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance stats
   */
  getPerformanceStats() {
    return this.performanceManager.getCacheStats();
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.performanceManager.clearCaches();
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.performanceManager.cleanup();
  }
}

export default ExportManager;
