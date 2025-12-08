/**
 * Error Handler
 * Centralized error handling with user-friendly messages and graceful degradation
 * Validates: Requirements 5.1, 5.2, 5.3
 */

class ErrorHandler {
  constructor() {
    this.errorCategories = {
      PLATFORM_ERROR: 'Platform detection failed',
      CONTENT_ERROR: 'Content extraction failed',
      LATEX_ERROR: 'LaTeX rendering failed',
      SYNTAX_ERROR: 'Syntax highlighting failed',
      TIMEOUT_ERROR: 'Operation timed out',
      MEMORY_ERROR: 'Insufficient memory',
      SIZE_ERROR: 'Content too large',
      EXPORT_ERROR: 'Export failed',
      VALIDATION_ERROR: 'Validation failed',
      NETWORK_ERROR: 'Network error',
      UNKNOWN_ERROR: 'Unknown error occurred'
    };
    
    // Maximum content size (10MB as per requirement 5.3)
    this.MAX_CONTENT_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    
    // Error log for debugging
    this.errorLog = [];
    this.maxLogSize = 100;
  }

  /**
   * Handle error with appropriate user feedback
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @returns {Object} Error response
   */
  handle(error, context) {
    const errorType = this.categorize(error);
    const userMessage = this.getUserMessage(errorType, error);
    const recovery = this.getRecoveryOptions(errorType);
    const degradation = this.getDegradationStrategy(errorType);
    
    this.logError(error, context);
    
    return {
      handled: true,
      errorType,
      userMessage,
      recovery,
      degradation,
      shouldRetry: this.isRetryable(errorType),
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Handle error with graceful degradation
   * Implements graceful degradation strategies as per design document
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   * @param {*} fallbackValue - Fallback value to return
   * @returns {Object} Error response with fallback
   */
  handleWithDegradation(error, context, fallbackValue = null) {
    const response = this.handle(error, context);
    const degradedValue = this.applyDegradation(error, fallbackValue);
    
    return {
      ...response,
      degradedValue,
      usedFallback: true
    };
  }

  /**
   * Categorize error type
   * @param {Error} error - Error object
   * @returns {string} Error category
   */
  categorize(error) {
    const message = error.message.toLowerCase();
    
    // Check for specific error patterns
    if (message.includes('platform') || message.includes('unsupported platform')) {
      return 'PLATFORM_ERROR';
    }
    if (message.includes('content') && message.includes('not found')) {
      return 'CONTENT_ERROR';
    }
    if (message.includes('latex') || message.includes('katex')) {
      return 'LATEX_ERROR';
    }
    if (message.includes('syntax') || message.includes('highlight')) {
      return 'SYNTAX_ERROR';
    }
    if (message.includes('timeout') || message.includes('timed out')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('memory') || message.includes('heap')) {
      return 'MEMORY_ERROR';
    }
    if (message.includes('too large') || message.includes('size')) {
      return 'SIZE_ERROR';
    }
    if (message.includes('export') || message.includes('conversion')) {
      return 'EXPORT_ERROR';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'VALIDATION_ERROR';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR';
    }
    
    return 'UNKNOWN_ERROR';
  }

  /**
   * Get user-friendly error message
   * Requirement 5.1: Show understandable error messages
   * @param {string} errorType - Error type
   * @param {Error} error - Original error object
   * @returns {string} User message
   */
  getUserMessage(errorType, error = null) {
    const messages = {
      PLATFORM_ERROR: 'Platform desteklenmiyor veya içerik bulunamadı. ChatGPT, Claude, Gemini veya DeepSeek kullandığınızdan emin olun.',
      CONTENT_ERROR: 'İçerik çıkarılamadı. Sayfada geçerli bir sohbet olduğundan emin olun.',
      LATEX_ERROR: 'Matematiksel formül işlenemedi. Formül kod bloğu olarak gösterilecek ve işlem devam edecek.',
      SYNTAX_ERROR: 'Kod vurgulama başarısız oldu. Kod düz metin olarak gösterilecek.',
      TIMEOUT_ERROR: 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin veya daha küçük bir içerik seçin.',
      MEMORY_ERROR: 'Yetersiz bellek. İçerik çok büyük olabilir. Daha küçük bir bölüm seçin veya tarayıcıyı yeniden başlatın.',
      SIZE_ERROR: 'İçerik çok büyük (>10MB). Devam etmek performans sorunlarına neden olabilir.',
      EXPORT_ERROR: 'Dışa aktarma başarısız oldu. Lütfen tekrar deneyin veya farklı bir format seçin.',
      VALIDATION_ERROR: 'Geçersiz veri. Lütfen içeriği kontrol edin.',
      NETWORK_ERROR: 'Ağ hatası. İnternet bağlantınızı kontrol edin.',
      UNKNOWN_ERROR: 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.'
    };
    
    let message = messages[errorType] || messages.UNKNOWN_ERROR;
    
    // Add technical details for debugging if available
    if (error && error.message && console) {
      console.debug(`[ErrorHandler] Technical details: ${error.message}`);
    }
    
    return message;
  }

  /**
   * Get recovery options
   * @param {string} errorType - Error type
   * @returns {Array<string>} Recovery options
   */
  getRecoveryOptions(errorType) {
    const options = {
      PLATFORM_ERROR: [
        'Desteklenen bir platformda olduğunuzdan emin olun (ChatGPT, Claude, Gemini, DeepSeek)',
        'Sayfayı yenileyin ve tekrar deneyin'
      ],
      CONTENT_ERROR: [
        'Sayfada geçerli bir sohbet olduğundan emin olun',
        'Sayfayı yenileyin ve tekrar deneyin'
      ],
      LATEX_ERROR: [
        'İşlem devam edecek, formül kod bloğu olarak gösterilecek'
      ],
      SYNTAX_ERROR: [
        'İşlem devam edecek, kod düz metin olarak gösterilecek'
      ],
      TIMEOUT_ERROR: [
        'Tekrar deneyin',
        'Daha küçük bir içerik bölümü seçin',
        'Hızlı PDF formatını deneyin'
      ],
      MEMORY_ERROR: [
        'Daha küçük bir içerik bölümü seçin',
        'Diğer tarayıcı sekmelerini kapatın',
        'Tarayıcıyı yeniden başlatın'
      ],
      SIZE_ERROR: [
        'Daha küçük bir içerik bölümü seçin',
        'Devam etmek için onaylayın'
      ],
      EXPORT_ERROR: [
        'Tekrar deneyin',
        'Farklı bir format deneyin',
        'Tarayıcı konsolunu kontrol edin'
      ],
      VALIDATION_ERROR: [
        'İçeriği kontrol edin',
        'Tekrar deneyin'
      ],
      NETWORK_ERROR: [
        'İnternet bağlantınızı kontrol edin',
        'Tekrar deneyin'
      ],
      UNKNOWN_ERROR: [
        'Tekrar deneyin',
        'Sayfayı yenileyin',
        'Tarayıcı konsolunu kontrol edin'
      ]
    };
    
    return options[errorType] || options.UNKNOWN_ERROR;
  }

  /**
   * Check if error is retryable
   * @param {string} errorType - Error type
   * @returns {boolean} Is retryable
   */
  isRetryable(errorType) {
    const retryableErrors = [
      'TIMEOUT_ERROR',
      'EXPORT_ERROR',
      'NETWORK_ERROR',
      'UNKNOWN_ERROR'
    ];
    return retryableErrors.includes(errorType);
  }
  
  /**
   * Get degradation strategy for error type
   * Implements graceful degradation as per design document
   * @param {string} errorType - Error type
   * @returns {Object} Degradation strategy
   */
  getDegradationStrategy(errorType) {
    const strategies = {
      LATEX_ERROR: {
        strategy: 'fallback_to_code',
        description: 'Render LaTeX as code block',
        action: 'continue'
      },
      SYNTAX_ERROR: {
        strategy: 'fallback_to_plain',
        description: 'Render code as plain text',
        action: 'continue'
      },
      CONTENT_ERROR: {
        strategy: 'partial_content',
        description: 'Use available content',
        action: 'continue'
      },
      SIZE_ERROR: {
        strategy: 'user_confirmation',
        description: 'Ask user to confirm',
        action: 'prompt'
      },
      PLATFORM_ERROR: {
        strategy: 'abort',
        description: 'Cannot proceed',
        action: 'abort'
      },
      MEMORY_ERROR: {
        strategy: 'abort',
        description: 'Cannot proceed',
        action: 'abort'
      },
      TIMEOUT_ERROR: {
        strategy: 'retry',
        description: 'Retry operation',
        action: 'retry'
      }
    };
    
    return strategies[errorType] || {
      strategy: 'abort',
      description: 'Unknown error',
      action: 'abort'
    };
  }
  
  /**
   * Apply degradation strategy
   * Requirement 5.2: Graceful degradation for LaTeX errors
   * @param {Error} error - Error object
   * @param {*} fallbackValue - Fallback value
   * @returns {*} Degraded value
   */
  applyDegradation(error, fallbackValue) {
    const errorType = this.categorize(error);
    const strategy = this.getDegradationStrategy(errorType);
    
    switch (strategy.strategy) {
      case 'fallback_to_code':
        // For LaTeX errors, return as code block
        return fallbackValue ? `\`${fallbackValue}\`` : null;
        
      case 'fallback_to_plain':
        // For syntax highlighting errors, return plain text
        return fallbackValue || null;
        
      case 'partial_content':
        // Use whatever content is available
        return fallbackValue || '';
        
      default:
        return fallbackValue;
    }
  }
  
  /**
   * Validate content size
   * Requirement 5.3: Warn when content is too large (>10MB)
   * @param {string|Blob} content - Content to validate
   * @returns {Object} Validation result
   */
  validateContentSize(content) {
    let size = 0;
    
    if (typeof content === 'string') {
      // Calculate string size in bytes (UTF-8)
      size = new Blob([content]).size;
    } else if (content instanceof Blob) {
      size = content.size;
    } else if (content && typeof content === 'object') {
      // Estimate object size
      size = new Blob([JSON.stringify(content)]).size;
    }
    
    const isValid = size <= this.MAX_CONTENT_SIZE;
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    
    return {
      isValid,
      size,
      sizeMB,
      maxSize: this.MAX_CONTENT_SIZE,
      maxSizeMB: (this.MAX_CONTENT_SIZE / (1024 * 1024)).toFixed(2),
      needsConfirmation: !isValid,
      message: isValid 
        ? `İçerik boyutu: ${sizeMB}MB` 
        : `İçerik çok büyük: ${sizeMB}MB (maksimum: ${(this.MAX_CONTENT_SIZE / (1024 * 1024)).toFixed(2)}MB). Devam etmek performans sorunlarına neden olabilir.`
    };
  }
  
  /**
   * Show user feedback
   * @param {string} message - Message to show
   * @param {Array<string>} options - Recovery options
   * @returns {void}
   */
  showUserFeedback(message, options = []) {
    // This would typically integrate with UI components
    // For now, log to console
    console.warn('[ErrorHandler] User Feedback:', message);
    if (options.length > 0) {
      console.info('[ErrorHandler] Recovery Options:', options);
    }
  }

  /**
   * Log error with context
   * @param {Error} error - Error object
   * @param {string} context - Context where error occurred
   */
  logError(error, context) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      context,
      errorType: this.categorize(error),
      message: error.message,
      stack: error.stack
    };
    
    // Add to error log
    this.errorLog.push(logEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
    
    // Console logging
    console.error(`[ErrorHandler] ${context}:`, error);
    
    // In development, log full details
    if (console.debug) {
      console.debug('[ErrorHandler] Error details:', logEntry);
    }
  }
  
  /**
   * Get error log
   * @returns {Array<Object>} Error log entries
   */
  getErrorLog() {
    return [...this.errorLog];
  }
  
  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }
  
  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      byContext: {},
      recent: this.errorLog.slice(-10)
    };
    
    this.errorLog.forEach(entry => {
      // Count by type
      stats.byType[entry.errorType] = (stats.byType[entry.errorType] || 0) + 1;
      
      // Count by context
      stats.byContext[entry.context] = (stats.byContext[entry.context] || 0) + 1;
    });
    
    return stats;
  }
}

export default ErrorHandler;
