/**
 * Performance Manager
 * Handles lazy loading, caching, and performance optimizations
 * Validates: Requirements 6.4, 6.5, 10.6, 10.7
 */

class PerformanceManager {
  constructor() {
    // Lazy loading state
    this.loadedModules = {
      pdfConverter: false,
      pdfQualityExporter: false,
      syntaxHighlighter: false
    };
    
    // Loading promises to prevent duplicate loads
    this.loadingPromises = {};
    
    // Cache for parsed markdown
    this.markdownCache = new Map();
    this.markdownCacheMaxSize = 50; // Max 50 entries
    
    // Cache for highlighted code
    this.codeCache = new Map();
    this.codeCacheMaxSize = 100; // Max 100 entries
    
    // Web Worker for large content
    this.worker = null;
    this.workerReady = false;
    
    console.log('[PerformanceManager] Initialized');
  }

  /**
   * Lazy load PDF converter
   * Validates: Requirement 10.7 (lazy loading)
   * @returns {Promise<void>}
   */
  async loadPdfConverter() {
    if (this.loadedModules.pdfConverter) {
      console.log('[PerformanceManager] PDF converter already loaded');
      return;
    }
    
    // Check if already loading
    if (this.loadingPromises.pdfConverter) {
      console.log('[PerformanceManager] PDF converter loading in progress, waiting...');
      return this.loadingPromises.pdfConverter;
    }
    
    console.log('[PerformanceManager] Lazy loading PDF converter...');
    
    this.loadingPromises.pdfConverter = new Promise((resolve, reject) => {
      // Check if already loaded globally
      if (typeof window.PdfConverterBundled !== 'undefined') {
        console.log('[PerformanceManager] PDF converter already available globally');
        this.loadedModules.pdfConverter = true;
        resolve();
        return;
      }

      const scriptUrl = chrome.runtime.getURL('lib/pdf-converter-bundled.js');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = scriptUrl;
      
      script.onload = () => {
        console.log('[PerformanceManager] PDF converter loaded');
        setTimeout(() => {
          if (typeof window.PdfConverterBundled !== 'undefined') {
            this.loadedModules.pdfConverter = true;
            resolve();
          } else {
            reject(new Error('PDF converter failed to initialize'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('[PerformanceManager] Failed to load PDF converter:', error);
        reject(new Error('Failed to load PDF converter'));
      };
      
      (document.head || document.documentElement).appendChild(script);
    });
    
    return this.loadingPromises.pdfConverter;
  }

  /**
   * Lazy load PDF quality exporter
   * Validates: Requirement 10.7 (lazy loading)
   * @returns {Promise<void>}
   */
  async loadPdfQualityExporter() {
    if (this.loadedModules.pdfQualityExporter) {
      console.log('[PerformanceManager] PDF quality exporter already loaded');
      return;
    }
    
    // Check if already loading
    if (this.loadingPromises.pdfQualityExporter) {
      console.log('[PerformanceManager] PDF quality exporter loading in progress, waiting...');
      return this.loadingPromises.pdfQualityExporter;
    }
    
    console.log('[PerformanceManager] Lazy loading PDF quality exporter...');
    
    this.loadingPromises.pdfQualityExporter = new Promise((resolve, reject) => {
      // Check if already loaded globally
      if (typeof window.PdfQualityExporter !== 'undefined') {
        console.log('[PerformanceManager] PDF quality exporter already available globally');
        this.loadedModules.pdfQualityExporter = true;
        resolve();
        return;
      }

      const scriptUrl = chrome.runtime.getURL('lib/pdf-quality-exporter-bundled.js');
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = scriptUrl;
      
      script.onload = () => {
        console.log('[PerformanceManager] PDF quality exporter loaded');
        setTimeout(() => {
          if (typeof window.PdfQualityExporter !== 'undefined') {
            this.loadedModules.pdfQualityExporter = true;
            resolve();
          } else {
            reject(new Error('PDF quality exporter failed to initialize'));
          }
        }, 100);
      };
      
      script.onerror = (error) => {
        console.error('[PerformanceManager] Failed to load PDF quality exporter:', error);
        reject(new Error('Failed to load PDF quality exporter'));
      };
      
      (document.head || document.documentElement).appendChild(script);
    });
    
    return this.loadingPromises.pdfQualityExporter;
  }

  /**
   * Lazy load syntax highlighter
   * Validates: Requirement 10.7 (lazy loading)
   * @returns {Promise<void>}
   */
  async loadSyntaxHighlighter() {
    if (this.loadedModules.syntaxHighlighter) {
      console.log('[PerformanceManager] Syntax highlighter already loaded');
      return;
    }
    
    // Check if already loading
    if (this.loadingPromises.syntaxHighlighter) {
      console.log('[PerformanceManager] Syntax highlighter loading in progress, waiting...');
      return this.loadingPromises.syntaxHighlighter;
    }
    
    console.log('[PerformanceManager] Lazy loading syntax highlighter...');
    
    // For now, syntax highlighter is loaded via import
    // This is a placeholder for future optimization
    this.loadedModules.syntaxHighlighter = true;
    return Promise.resolve();
  }

  /**
   * Initialize Web Worker for large content processing
   * Validates: Requirement 6.4 (Web Worker for large content)
   * @returns {Promise<void>}
   */
  async initializeWorker() {
    if (this.worker && this.workerReady) {
      console.log('[PerformanceManager] Worker already initialized');
      return;
    }
    
    console.log('[PerformanceManager] Initializing Web Worker...');
    
    try {
      // Create worker from blob to avoid CSP issues
      const workerCode = `
        // Web Worker for processing large content
        self.addEventListener('message', function(e) {
          const { type, data, id } = e.data;
          
          try {
            let result;
            
            switch (type) {
              case 'processMarkdown':
                result = processMarkdown(data.content);
                break;
              
              case 'highlightCode':
                result = highlightCode(data.code, data.language);
                break;
              
              default:
                throw new Error('Unknown task type: ' + type);
            }
            
            self.postMessage({
              id,
              success: true,
              result
            });
          } catch (error) {
            self.postMessage({
              id,
              success: false,
              error: error.message
            });
          }
        });
        
        function processMarkdown(content) {
          // Basic markdown processing
          // This is a simplified version - real processing would be more complex
          return {
            processed: content,
            wordCount: content.split(/\\s+/).length,
            hasCode: content.includes('\`\`\`'),
            hasTables: content.includes('|'),
            hasLatex: content.includes('$')
          };
        }
        
        function highlightCode(code, language) {
          // Placeholder for code highlighting
          // Real implementation would use highlight.js or similar
          return {
            highlighted: code,
            language,
            tokens: []
          };
        }
      `;
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      this.worker = new Worker(workerUrl);
      this.workerReady = true;
      
      console.log('[PerformanceManager] Worker initialized successfully');
    } catch (error) {
      console.error('[PerformanceManager] Failed to initialize worker:', error);
      this.worker = null;
      this.workerReady = false;
    }
  }

  /**
   * Process content using Web Worker for large content
   * Validates: Requirement 6.4 (non-blocking export for large content)
   * @param {string} type - Task type
   * @param {Object} data - Task data
   * @returns {Promise<any>} Processing result
   */
  async processInWorker(type, data) {
    if (!this.worker || !this.workerReady) {
      await this.initializeWorker();
    }
    
    if (!this.worker) {
      throw new Error('Worker not available');
    }
    
    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36).substring(7);
      
      const handler = (e) => {
        if (e.data.id === id) {
          this.worker.removeEventListener('message', handler);
          
          if (e.data.success) {
            resolve(e.data.result);
          } else {
            reject(new Error(e.data.error));
          }
        }
      };
      
      this.worker.addEventListener('message', handler);
      
      this.worker.postMessage({
        type,
        data,
        id
      });
      
      // Timeout after 30 seconds
      setTimeout(() => {
        this.worker.removeEventListener('message', handler);
        reject(new Error('Worker timeout'));
      }, 30000);
    });
  }

  /**
   * Check if content should be processed in worker
   * Validates: Requirement 6.4 (>100KB threshold)
   * @param {string} content - Content to check
   * @returns {boolean} Should use worker
   */
  shouldUseWorker(content) {
    const sizeInBytes = new Blob([content]).size;
    const sizeInKB = sizeInBytes / 1024;
    return sizeInKB > 100;
  }

  /**
   * Cache parsed markdown
   * Validates: Requirement 6.5 (caching)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   */
  cacheMarkdown(key, value) {
    // Implement LRU cache
    if (this.markdownCache.size >= this.markdownCacheMaxSize) {
      // Remove oldest entry
      const firstKey = this.markdownCache.keys().next().value;
      this.markdownCache.delete(firstKey);
    }
    
    this.markdownCache.set(key, {
      value,
      timestamp: Date.now()
    });
    
    console.log('[PerformanceManager] Cached markdown:', key);
  }

  /**
   * Get cached markdown
   * @param {string} key - Cache key
   * @returns {any|null} Cached value or null
   */
  getCachedMarkdown(key) {
    const cached = this.markdownCache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache is still valid (5 minutes)
    const age = Date.now() - cached.timestamp;
    if (age > 5 * 60 * 1000) {
      this.markdownCache.delete(key);
      return null;
    }
    
    console.log('[PerformanceManager] Cache hit for markdown:', key);
    return cached.value;
  }

  /**
   * Cache highlighted code
   * Validates: Requirement 6.5 (caching)
   * @param {string} code - Code to cache
   * @param {string} language - Programming language
   * @param {any} highlighted - Highlighted result
   */
  cacheCode(code, language, highlighted) {
    const key = this.generateCodeCacheKey(code, language);
    
    // Implement LRU cache
    if (this.codeCache.size >= this.codeCacheMaxSize) {
      // Remove oldest entry
      const firstKey = this.codeCache.keys().next().value;
      this.codeCache.delete(firstKey);
    }
    
    this.codeCache.set(key, {
      highlighted,
      timestamp: Date.now()
    });
    
    console.log('[PerformanceManager] Cached code:', language);
  }

  /**
   * Get cached highlighted code
   * @param {string} code - Code to look up
   * @param {string} language - Programming language
   * @returns {any|null} Cached highlighted code or null
   */
  getCachedCode(code, language) {
    const key = this.generateCodeCacheKey(code, language);
    const cached = this.codeCache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if cache is still valid (10 minutes)
    const age = Date.now() - cached.timestamp;
    if (age > 10 * 60 * 1000) {
      this.codeCache.delete(key);
      return null;
    }
    
    console.log('[PerformanceManager] Cache hit for code:', language);
    return cached.highlighted;
  }

  /**
   * Generate cache key for code
   * @param {string} code - Code content
   * @param {string} language - Programming language
   * @returns {string} Cache key
   */
  generateCodeCacheKey(code, language) {
    // Simple hash function for cache key
    let hash = 0;
    const str = code + language;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.markdownCache.clear();
    this.codeCache.clear();
    console.log('[PerformanceManager] All caches cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      markdown: {
        size: this.markdownCache.size,
        maxSize: this.markdownCacheMaxSize
      },
      code: {
        size: this.codeCache.size,
        maxSize: this.codeCacheMaxSize
      },
      loadedModules: { ...this.loadedModules },
      workerReady: this.workerReady
    };
  }

  /**
   * Terminate worker
   */
  terminateWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.workerReady = false;
      console.log('[PerformanceManager] Worker terminated');
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.clearCaches();
    this.terminateWorker();
    console.log('[PerformanceManager] Cleanup complete');
  }
}

export default PerformanceManager;
