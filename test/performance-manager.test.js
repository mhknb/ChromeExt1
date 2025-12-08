/**
 * Performance Manager Tests
 * Tests for lazy loading, caching, and Web Worker functionality
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import PerformanceManager from '../src/performance-manager.js';

describe('PerformanceManager', () => {
  let performanceManager;

  beforeEach(() => {
    performanceManager = new PerformanceManager();
  });

  describe('Initialization', () => {
    test('should initialize with empty caches', () => {
      const stats = performanceManager.getCacheStats();
      
      expect(stats.markdown.size).toBe(0);
      expect(stats.code.size).toBe(0);
      expect(stats.workerReady).toBe(false);
    });

    test('should have correct cache size limits', () => {
      const stats = performanceManager.getCacheStats();
      
      expect(stats.markdown.maxSize).toBe(50);
      expect(stats.code.maxSize).toBe(100);
    });
  });

  describe('Content Size Detection', () => {
    test('should detect small content (<100KB)', () => {
      const smallContent = 'a'.repeat(50 * 1024); // 50KB
      
      expect(performanceManager.shouldUseWorker(smallContent)).toBe(false);
    });

    test('should detect large content (>100KB)', () => {
      const largeContent = 'a'.repeat(150 * 1024); // 150KB
      
      expect(performanceManager.shouldUseWorker(largeContent)).toBe(true);
    });

    test('should handle edge case at exactly 100KB', () => {
      const edgeContent = 'a'.repeat(100 * 1024); // 100KB
      
      // Should not use worker at exactly 100KB (only >100KB)
      expect(performanceManager.shouldUseWorker(edgeContent)).toBe(false);
    });

    test('should handle empty content', () => {
      expect(performanceManager.shouldUseWorker('')).toBe(false);
    });
  });

  describe('Markdown Caching', () => {
    test('should cache markdown', () => {
      const key = 'test-key';
      const value = { parsed: true, ast: {} };
      
      performanceManager.cacheMarkdown(key, value);
      
      const cached = performanceManager.getCachedMarkdown(key);
      expect(cached).toEqual(value);
    });

    test('should return null for non-existent cache key', () => {
      const cached = performanceManager.getCachedMarkdown('non-existent');
      
      expect(cached).toBeNull();
    });

    test('should implement LRU eviction when cache is full', () => {
      // Fill cache to max size
      for (let i = 0; i < 50; i++) {
        performanceManager.cacheMarkdown(`key-${i}`, { value: i });
      }
      
      // Add one more item (should evict oldest)
      performanceManager.cacheMarkdown('key-new', { value: 'new' });
      
      // First item should be evicted
      expect(performanceManager.getCachedMarkdown('key-0')).toBeNull();
      
      // New item should exist
      expect(performanceManager.getCachedMarkdown('key-new')).toEqual({ value: 'new' });
      
      // Cache size should remain at max
      const stats = performanceManager.getCacheStats();
      expect(stats.markdown.size).toBe(50);
    });

    test('should expire old cache entries after 5 minutes', () => {
      const key = 'test-key';
      const value = { parsed: true };
      
      performanceManager.cacheMarkdown(key, value);
      
      // Mock time passing (5 minutes + 1 second)
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + (5 * 60 * 1000) + 1000);
      
      const cached = performanceManager.getCachedMarkdown(key);
      
      expect(cached).toBeNull();
      
      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe('Code Caching', () => {
    test('should cache highlighted code', () => {
      const code = 'const x = 1;';
      const language = 'javascript';
      const highlighted = { html: '<span>const x = 1;</span>', tokens: [] };
      
      performanceManager.cacheCode(code, language, highlighted);
      
      const cached = performanceManager.getCachedCode(code, language);
      expect(cached).toEqual(highlighted);
    });

    test('should return null for non-existent code cache', () => {
      const cached = performanceManager.getCachedCode('non-existent', 'javascript');
      
      expect(cached).toBeNull();
    });

    test('should generate consistent cache keys', () => {
      const code = 'const x = 1;';
      const language = 'javascript';
      const highlighted = { html: '<span>const x = 1;</span>' };
      
      performanceManager.cacheCode(code, language, highlighted);
      
      // Same code and language should retrieve same cached value
      const cached1 = performanceManager.getCachedCode(code, language);
      const cached2 = performanceManager.getCachedCode(code, language);
      
      expect(cached1).toEqual(cached2);
      expect(cached1).toEqual(highlighted);
    });

    test('should differentiate cache by language', () => {
      const code = 'print("hello")';
      const highlighted1 = { html: '<span class="python">print("hello")</span>' };
      const highlighted2 = { html: '<span class="ruby">print("hello")</span>' };
      
      performanceManager.cacheCode(code, 'python', highlighted1);
      performanceManager.cacheCode(code, 'ruby', highlighted2);
      
      expect(performanceManager.getCachedCode(code, 'python')).toEqual(highlighted1);
      expect(performanceManager.getCachedCode(code, 'ruby')).toEqual(highlighted2);
    });

    test('should implement LRU eviction for code cache', () => {
      // Fill cache to max size
      for (let i = 0; i < 100; i++) {
        performanceManager.cacheCode(`code-${i}`, 'javascript', { value: i });
      }
      
      // Add one more item (should evict oldest)
      performanceManager.cacheCode('code-new', 'javascript', { value: 'new' });
      
      // First item should be evicted
      expect(performanceManager.getCachedCode('code-0', 'javascript')).toBeNull();
      
      // New item should exist
      expect(performanceManager.getCachedCode('code-new', 'javascript')).toEqual({ value: 'new' });
      
      // Cache size should remain at max
      const stats = performanceManager.getCacheStats();
      expect(stats.code.size).toBe(100);
    });

    test('should expire old code cache entries after 10 minutes', () => {
      const code = 'const x = 1;';
      const language = 'javascript';
      const highlighted = { html: '<span>const x = 1;</span>' };
      
      performanceManager.cacheCode(code, language, highlighted);
      
      // Mock time passing (10 minutes + 1 second)
      const originalNow = Date.now;
      Date.now = vi.fn(() => originalNow() + (10 * 60 * 1000) + 1000);
      
      const cached = performanceManager.getCachedCode(code, language);
      
      expect(cached).toBeNull();
      
      // Restore Date.now
      Date.now = originalNow;
    });
  });

  describe('Cache Management', () => {
    test('should clear all caches', () => {
      // Add some cached items
      performanceManager.cacheMarkdown('md-key', { value: 'md' });
      performanceManager.cacheCode('code', 'js', { value: 'code' });
      
      // Verify items exist
      expect(performanceManager.getCachedMarkdown('md-key')).toBeTruthy();
      expect(performanceManager.getCachedCode('code', 'js')).toBeTruthy();
      
      // Clear caches
      performanceManager.clearCaches();
      
      // Verify items are gone
      expect(performanceManager.getCachedMarkdown('md-key')).toBeNull();
      expect(performanceManager.getCachedCode('code', 'js')).toBeNull();
      
      // Verify cache sizes are 0
      const stats = performanceManager.getCacheStats();
      expect(stats.markdown.size).toBe(0);
      expect(stats.code.size).toBe(0);
    });

    test('should get accurate cache statistics', () => {
      // Add some items
      performanceManager.cacheMarkdown('md-1', { value: 1 });
      performanceManager.cacheMarkdown('md-2', { value: 2 });
      performanceManager.cacheCode('code-1', 'js', { value: 1 });
      
      const stats = performanceManager.getCacheStats();
      
      expect(stats.markdown.size).toBe(2);
      expect(stats.code.size).toBe(1);
      expect(stats.loadedModules).toBeDefined();
      expect(stats.workerReady).toBe(false);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup all resources', () => {
      // Add some cached items
      performanceManager.cacheMarkdown('md-key', { value: 'md' });
      performanceManager.cacheCode('code', 'js', { value: 'code' });
      
      // Cleanup
      performanceManager.cleanup();
      
      // Verify everything is cleared
      const stats = performanceManager.getCacheStats();
      expect(stats.markdown.size).toBe(0);
      expect(stats.code.size).toBe(0);
      expect(stats.workerReady).toBe(false);
    });
  });

  describe('Cache Key Generation', () => {
    test('should generate different keys for different code', () => {
      const key1 = performanceManager.generateCodeCacheKey('code1', 'js');
      const key2 = performanceManager.generateCodeCacheKey('code2', 'js');
      
      expect(key1).not.toBe(key2);
    });

    test('should generate same key for same code and language', () => {
      const key1 = performanceManager.generateCodeCacheKey('const x = 1;', 'javascript');
      const key2 = performanceManager.generateCodeCacheKey('const x = 1;', 'javascript');
      
      expect(key1).toBe(key2);
    });

    test('should generate different keys for same code but different languages', () => {
      const key1 = performanceManager.generateCodeCacheKey('print("hello")', 'python');
      const key2 = performanceManager.generateCodeCacheKey('print("hello")', 'ruby');
      
      expect(key1).not.toBe(key2);
    });
  });
});
