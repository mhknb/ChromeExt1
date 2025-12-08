/**
 * Error Handler Tests
 * Tests for centralized error handling with user-friendly messages
 */

import { describe, test, expect, beforeEach } from 'vitest';
import ErrorHandler from '../src/error-handler.js';

describe('ErrorHandler', () => {
  let errorHandler;
  
  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });
  
  describe('Error Categorization', () => {
    test('should categorize platform errors', () => {
      const error = new Error('Unsupported platform');
      const category = errorHandler.categorize(error);
      expect(category).toBe('PLATFORM_ERROR');
    });
    
    test('should categorize content errors', () => {
      const error = new Error('Content not found');
      const category = errorHandler.categorize(error);
      expect(category).toBe('CONTENT_ERROR');
    });
    
    test('should categorize LaTeX errors', () => {
      const error = new Error('LaTeX rendering failed');
      const category = errorHandler.categorize(error);
      expect(category).toBe('LATEX_ERROR');
    });
    
    test('should categorize syntax highlighting errors', () => {
      const error = new Error('Syntax highlight failed');
      const category = errorHandler.categorize(error);
      expect(category).toBe('SYNTAX_ERROR');
    });
    
    test('should categorize timeout errors', () => {
      const error = new Error('Operation timed out');
      const category = errorHandler.categorize(error);
      expect(category).toBe('TIMEOUT_ERROR');
    });
    
    test('should categorize memory errors', () => {
      const error = new Error('Insufficient memory');
      const category = errorHandler.categorize(error);
      expect(category).toBe('MEMORY_ERROR');
    });
    
    test('should categorize size errors', () => {
      const error = new Error('Content too large');
      const category = errorHandler.categorize(error);
      expect(category).toBe('SIZE_ERROR');
    });
    
    test('should categorize export errors', () => {
      const error = new Error('Export failed');
      const category = errorHandler.categorize(error);
      expect(category).toBe('EXPORT_ERROR');
    });
    
    test('should categorize validation errors', () => {
      const error = new Error('Invalid data');
      const category = errorHandler.categorize(error);
      expect(category).toBe('VALIDATION_ERROR');
    });
    
    test('should categorize network errors', () => {
      const error = new Error('Network error');
      const category = errorHandler.categorize(error);
      expect(category).toBe('NETWORK_ERROR');
    });
    
    test('should categorize unknown errors', () => {
      const error = new Error('Something went wrong');
      const category = errorHandler.categorize(error);
      expect(category).toBe('UNKNOWN_ERROR');
    });
  });
  
  describe('User Messages', () => {
    test('should provide user-friendly message for platform errors', () => {
      const message = errorHandler.getUserMessage('PLATFORM_ERROR');
      expect(message).toContain('Platform desteklenmiyor');
      expect(message).toContain('ChatGPT');
    });
    
    test('should provide user-friendly message for LaTeX errors', () => {
      const message = errorHandler.getUserMessage('LATEX_ERROR');
      expect(message).toContain('Matematiksel formül');
      expect(message).toContain('kod bloğu');
    });
    
    test('should provide user-friendly message for size errors', () => {
      const message = errorHandler.getUserMessage('SIZE_ERROR');
      expect(message).toContain('çok büyük');
      expect(message).toContain('10MB');
    });
    
    test('should provide default message for unknown error types', () => {
      const message = errorHandler.getUserMessage('INVALID_TYPE');
      expect(message).toContain('Beklenmeyen');
    });
  });
  
  describe('Recovery Options', () => {
    test('should provide recovery options for platform errors', () => {
      const options = errorHandler.getRecoveryOptions('PLATFORM_ERROR');
      expect(options).toBeInstanceOf(Array);
      expect(options.length).toBeGreaterThan(0);
      expect(options.some(opt => opt.includes('Desteklenen'))).toBe(true);
    });
    
    test('should provide recovery options for LaTeX errors', () => {
      const options = errorHandler.getRecoveryOptions('LATEX_ERROR');
      expect(options).toBeInstanceOf(Array);
      expect(options.some(opt => opt.includes('kod bloğu'))).toBe(true);
    });
    
    test('should provide recovery options for timeout errors', () => {
      const options = errorHandler.getRecoveryOptions('TIMEOUT_ERROR');
      expect(options).toBeInstanceOf(Array);
      expect(options.some(opt => opt.includes('Tekrar deneyin'))).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle error and return complete response', () => {
      const error = new Error('LaTeX rendering failed');
      const response = errorHandler.handle(error, 'PDF Export');
      
      expect(response.handled).toBe(true);
      expect(response.errorType).toBe('LATEX_ERROR');
      expect(response.userMessage).toBeTruthy();
      expect(response.recovery).toBeInstanceOf(Array);
      expect(response.degradation).toBeTruthy();
      expect(response.timestamp).toBeTruthy();
    });
    
    test('should handle error with degradation', () => {
      const error = new Error('LaTeX rendering failed');
      const fallback = 'x = y + z';
      const response = errorHandler.handleWithDegradation(error, 'PDF Export', fallback);
      
      expect(response.handled).toBe(true);
      expect(response.usedFallback).toBe(true);
      expect(response.degradedValue).toBeTruthy();
    });
  });
  
  describe('Retryable Errors', () => {
    test('should identify timeout errors as retryable', () => {
      expect(errorHandler.isRetryable('TIMEOUT_ERROR')).toBe(true);
    });
    
    test('should identify export errors as retryable', () => {
      expect(errorHandler.isRetryable('EXPORT_ERROR')).toBe(true);
    });
    
    test('should identify network errors as retryable', () => {
      expect(errorHandler.isRetryable('NETWORK_ERROR')).toBe(true);
    });
    
    test('should identify platform errors as not retryable', () => {
      expect(errorHandler.isRetryable('PLATFORM_ERROR')).toBe(false);
    });
    
    test('should identify LaTeX errors as not retryable', () => {
      expect(errorHandler.isRetryable('LATEX_ERROR')).toBe(false);
    });
  });
  
  describe('Degradation Strategies', () => {
    test('should provide fallback_to_code strategy for LaTeX errors', () => {
      const strategy = errorHandler.getDegradationStrategy('LATEX_ERROR');
      expect(strategy.strategy).toBe('fallback_to_code');
      expect(strategy.action).toBe('continue');
    });
    
    test('should provide fallback_to_plain strategy for syntax errors', () => {
      const strategy = errorHandler.getDegradationStrategy('SYNTAX_ERROR');
      expect(strategy.strategy).toBe('fallback_to_plain');
      expect(strategy.action).toBe('continue');
    });
    
    test('should provide user_confirmation strategy for size errors', () => {
      const strategy = errorHandler.getDegradationStrategy('SIZE_ERROR');
      expect(strategy.strategy).toBe('user_confirmation');
      expect(strategy.action).toBe('prompt');
    });
    
    test('should provide abort strategy for platform errors', () => {
      const strategy = errorHandler.getDegradationStrategy('PLATFORM_ERROR');
      expect(strategy.strategy).toBe('abort');
      expect(strategy.action).toBe('abort');
    });
  });
  
  describe('Degradation Application', () => {
    test('should apply fallback_to_code for LaTeX errors', () => {
      const error = new Error('LaTeX rendering failed');
      const fallback = 'x = y + z';
      const result = errorHandler.applyDegradation(error, fallback);
      expect(result).toContain('`');
      expect(result).toContain(fallback);
    });
    
    test('should apply fallback_to_plain for syntax errors', () => {
      const error = new Error('Syntax highlight failed');
      const fallback = 'const x = 1;';
      const result = errorHandler.applyDegradation(error, fallback);
      expect(result).toBe(fallback);
    });
    
    test('should handle null fallback values', () => {
      const error = new Error('LaTeX rendering failed');
      const result = errorHandler.applyDegradation(error, null);
      expect(result).toBeNull();
    });
  });
  
  describe('Content Size Validation', () => {
    test('should validate small content as valid', () => {
      const content = 'Small content';
      const result = errorHandler.validateContentSize(content);
      
      expect(result.isValid).toBe(true);
      expect(result.needsConfirmation).toBe(false);
      expect(result.size).toBeLessThan(errorHandler.MAX_CONTENT_SIZE);
    });
    
    test('should validate large content as invalid', () => {
      // Create content larger than 10MB
      const largeContent = 'x'.repeat(11 * 1024 * 1024);
      const result = errorHandler.validateContentSize(largeContent);
      
      expect(result.isValid).toBe(false);
      expect(result.needsConfirmation).toBe(true);
      expect(result.size).toBeGreaterThan(errorHandler.MAX_CONTENT_SIZE);
      expect(result.message).toContain('çok büyük');
    });
    
    test('should calculate size for string content', () => {
      const content = 'Test content';
      const result = errorHandler.validateContentSize(content);
      
      expect(result.size).toBeGreaterThan(0);
      expect(result.sizeMB).toBeTruthy();
    });
    
    test('should calculate size for Blob content', () => {
      const blob = new Blob(['Test content']);
      const result = errorHandler.validateContentSize(blob);
      
      expect(result.size).toBeGreaterThan(0);
      expect(result.sizeMB).toBeTruthy();
    });
    
    test('should calculate size for object content', () => {
      const obj = { data: 'Test content', metadata: { size: 100 } };
      const result = errorHandler.validateContentSize(obj);
      
      expect(result.size).toBeGreaterThan(0);
      expect(result.sizeMB).toBeTruthy();
    });
  });
  
  describe('Error Logging', () => {
    test('should log errors with context', () => {
      const error = new Error('Test error');
      errorHandler.logError(error, 'Test Context');
      
      const log = errorHandler.getErrorLog();
      expect(log.length).toBe(1);
      expect(log[0].context).toBe('Test Context');
      expect(log[0].message).toBe('Test error');
      expect(log[0].timestamp).toBeTruthy();
    });
    
    test('should maintain error log with max size', () => {
      // Add more than maxLogSize errors
      for (let i = 0; i < 150; i++) {
        const error = new Error(`Error ${i}`);
        errorHandler.logError(error, 'Test');
      }
      
      const log = errorHandler.getErrorLog();
      expect(log.length).toBeLessThanOrEqual(errorHandler.maxLogSize);
    });
    
    test('should clear error log', () => {
      const error = new Error('Test error');
      errorHandler.logError(error, 'Test');
      
      expect(errorHandler.getErrorLog().length).toBe(1);
      
      errorHandler.clearErrorLog();
      expect(errorHandler.getErrorLog().length).toBe(0);
    });
  });
  
  describe('Error Statistics', () => {
    test('should provide error statistics', () => {
      errorHandler.logError(new Error('LaTeX error'), 'PDF Export');
      errorHandler.logError(new Error('LaTeX error'), 'DOCX Export');
      errorHandler.logError(new Error('Export failed'), 'PDF Export');
      
      const stats = errorHandler.getErrorStats();
      
      expect(stats.total).toBe(3);
      expect(stats.byType.LATEX_ERROR).toBe(2);
      expect(stats.byType.EXPORT_ERROR).toBe(1);
      expect(stats.byContext['PDF Export']).toBe(2);
      expect(stats.byContext['DOCX Export']).toBe(1);
      expect(stats.recent).toBeInstanceOf(Array);
    });
    
    test('should limit recent errors to 10', () => {
      for (let i = 0; i < 20; i++) {
        errorHandler.logError(new Error(`Error ${i}`), 'Test');
      }
      
      const stats = errorHandler.getErrorStats();
      expect(stats.recent.length).toBe(10);
    });
  });
  
  describe('Integration Tests', () => {
    test('should handle complete error flow for LaTeX error', () => {
      const error = new Error('KaTeX rendering failed for formula: x^2');
      const response = errorHandler.handleWithDegradation(
        error,
        'PDF Export',
        'x^2'
      );
      
      expect(response.handled).toBe(true);
      expect(response.errorType).toBe('LATEX_ERROR');
      expect(response.userMessage).toContain('Matematiksel formül');
      expect(response.degradation.strategy).toBe('fallback_to_code');
      expect(response.degradedValue).toContain('x^2');
      expect(response.shouldRetry).toBe(false);
      
      // Check that error was logged
      const log = errorHandler.getErrorLog();
      expect(log.length).toBe(1);
      expect(log[0].errorType).toBe('LATEX_ERROR');
    });
    
    test('should handle complete error flow for size error', () => {
      const largeContent = 'x'.repeat(11 * 1024 * 1024);
      const sizeValidation = errorHandler.validateContentSize(largeContent);
      
      expect(sizeValidation.isValid).toBe(false);
      expect(sizeValidation.needsConfirmation).toBe(true);
      
      if (!sizeValidation.isValid) {
        const error = new Error('Content too large');
        const response = errorHandler.handle(error, 'Export');
        
        expect(response.errorType).toBe('SIZE_ERROR');
        expect(response.degradation.action).toBe('prompt');
      }
    });
  });
});
