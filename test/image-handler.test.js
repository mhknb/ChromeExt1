/**
 * Image Handler Tests
 * Tests for image extraction, validation, and conversion
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import ImageHandler from '../src/image-handler.js';

describe('ImageHandler', () => {
  let imageHandler;

  beforeEach(() => {
    imageHandler = new ImageHandler();
  });

  describe('Image Validation', () => {
    it('should validate image with base64 data and mime type', () => {
      const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const mimeType = 'image/png';
      
      const isValid = imageHandler.validateImage(base64, mimeType, null);
      expect(isValid).toBe(true);
    });

    it('should validate image with external URL only', () => {
      const externalUrl = 'https://example.com/image.png';
      
      const isValid = imageHandler.validateImage(null, null, externalUrl);
      expect(isValid).toBe(true);
    });

    it('should reject image without base64 or external URL', () => {
      const isValid = imageHandler.validateImage(null, null, null);
      expect(isValid).toBe(false);
    });

    it('should reject unsupported mime type', () => {
      const base64 = 'validbase64data';
      const mimeType = 'image/bmp';
      
      const isValid = imageHandler.validateImage(base64, mimeType, null);
      expect(isValid).toBe(false);
    });

    it('should reject invalid base64 data', () => {
      const base64 = 'not-valid-base64!@#$';
      const mimeType = 'image/png';
      
      const isValid = imageHandler.validateImage(base64, mimeType, null);
      expect(isValid).toBe(false);
    });

    it('should validate supported image formats', () => {
      const supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      
      supportedFormats.forEach(format => {
        const isValid = imageHandler.validateImage(base64, format, null);
        expect(isValid).toBe(true);
      });
    });
  });

  describe('Base64 Validation', () => {
    it('should validate correct base64 string', () => {
      const validBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      expect(imageHandler.isValidBase64(validBase64)).toBe(true);
    });

    it('should reject invalid base64 string', () => {
      const invalidBase64 = 'not-valid-base64!@#$';
      expect(imageHandler.isValidBase64(invalidBase64)).toBe(false);
    });

    it('should reject null or undefined', () => {
      expect(imageHandler.isValidBase64(null)).toBe(false);
      expect(imageHandler.isValidBase64(undefined)).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(imageHandler.isValidBase64(123)).toBe(false);
      expect(imageHandler.isValidBase64({})).toBe(false);
    });
  });

  describe('Markdown Conversion', () => {
    it('should convert image to markdown with external URL', () => {
      const imageData = {
        alt: 'Test Image',
        title: '',
        externalUrl: 'https://example.com/image.png',
        src: 'https://example.com/image.png'
      };
      
      const markdown = imageHandler.toMarkdown(imageData);
      expect(markdown).toBe('![Test Image](https://example.com/image.png)');
    });

    it('should convert image to markdown with title', () => {
      const imageData = {
        alt: 'Test Image',
        title: 'Image Title',
        externalUrl: 'https://example.com/image.png',
        src: 'https://example.com/image.png'
      };
      
      const markdown = imageHandler.toMarkdown(imageData);
      expect(markdown).toBe('![Test Image](https://example.com/image.png "Image Title")');
    });

    it('should use src if externalUrl is not available', () => {
      const imageData = {
        alt: 'Test Image',
        title: '',
        externalUrl: null,
        src: 'data:image/png;base64,abc123'
      };
      
      const markdown = imageHandler.toMarkdown(imageData);
      expect(markdown).toBe('![Test Image](data:image/png;base64,abc123)');
    });
  });

  describe('Data URL Conversion', () => {
    it('should convert image to data URL', () => {
      const imageData = {
        base64Data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        mimeType: 'image/png'
      };
      
      const dataUrl = imageHandler.toDataUrl(imageData);
      expect(dataUrl).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
    });

    it('should return null if no base64 data', () => {
      const imageData = {
        base64Data: null,
        mimeType: 'image/png'
      };
      
      const dataUrl = imageHandler.toDataUrl(imageData);
      expect(dataUrl).toBeNull();
    });

    it('should return null if no mime type', () => {
      const imageData = {
        base64Data: 'abc123',
        mimeType: null
      };
      
      const dataUrl = imageHandler.toDataUrl(imageData);
      expect(dataUrl).toBeNull();
    });
  });

  describe('Dimension Calculation', () => {
    it('should preserve dimensions if within limits', () => {
      const imageData = { width: 400, height: 300 };
      const dimensions = imageHandler.calculateDimensions(imageData, 600, 800);
      
      expect(dimensions.width).toBe(400);
      expect(dimensions.height).toBe(300);
    });

    it('should scale down width if exceeds max', () => {
      const imageData = { width: 800, height: 600 };
      const dimensions = imageHandler.calculateDimensions(imageData, 400, 800);
      
      expect(dimensions.width).toBe(400);
      expect(dimensions.height).toBe(300); // Maintains aspect ratio
    });

    it('should scale down height if exceeds max', () => {
      const imageData = { width: 600, height: 1000 };
      const dimensions = imageHandler.calculateDimensions(imageData, 800, 500);
      
      expect(dimensions.width).toBe(300); // Maintains aspect ratio
      expect(dimensions.height).toBe(500);
    });

    it('should use defaults if no dimensions provided', () => {
      const imageData = { width: null, height: null };
      const dimensions = imageHandler.calculateDimensions(imageData, 600, 800);
      
      expect(dimensions.width).toBe(600);
      expect(dimensions.height).toBe(800);
    });

    it('should maintain aspect ratio when scaling', () => {
      const imageData = { width: 1600, height: 900 };
      const dimensions = imageHandler.calculateDimensions(imageData, 800, 600);
      
      const originalRatio = 1600 / 900;
      const scaledRatio = dimensions.width / dimensions.height;
      
      expect(Math.abs(originalRatio - scaledRatio)).toBeLessThan(0.01);
    });
  });

  describe('DOCX Preparation', () => {
    it('should prepare image for DOCX export', () => {
      const imageData = {
        base64Data: 'abc123',
        mimeType: 'image/png',
        alt: 'Test Image',
        width: 400,
        height: 300
      };
      
      const docxImage = imageHandler.prepareForDocx(imageData);
      
      expect(docxImage).toBeDefined();
      expect(docxImage.data).toBe('abc123');
      expect(docxImage.mimeType).toBe('image/png');
      expect(docxImage.alt).toBe('Test Image');
      expect(docxImage.width).toBeDefined();
      expect(docxImage.height).toBeDefined();
      expect(docxImage.widthEMU).toBeDefined();
      expect(docxImage.heightEMU).toBeDefined();
    });

    it('should return null if no base64 data', () => {
      const imageData = {
        base64Data: null,
        mimeType: 'image/png',
        alt: 'Test Image',
        width: 400,
        height: 300
      };
      
      const docxImage = imageHandler.prepareForDocx(imageData);
      expect(docxImage).toBeNull();
    });

    it('should calculate EMU dimensions correctly', () => {
      const imageData = {
        base64Data: 'abc123',
        mimeType: 'image/png',
        alt: 'Test Image',
        width: 96, // 1 inch at 96 DPI
        height: 96
      };
      
      const docxImage = imageHandler.prepareForDocx(imageData);
      
      // 1 pixel = 9525 EMUs at 96 DPI
      expect(docxImage.widthEMU).toBe(96 * 9525);
      expect(docxImage.heightEMU).toBe(96 * 9525);
    });
  });

  describe('PDF Preparation', () => {
    it('should prepare image with base64 for PDF export', () => {
      const imageData = {
        base64Data: 'abc123',
        mimeType: 'image/png',
        alt: 'Test Image',
        width: 400,
        height: 300
      };
      
      const pdfImage = imageHandler.prepareForPdf(imageData);
      
      expect(pdfImage).toBeDefined();
      expect(pdfImage.dataUrl).toBe('data:image/png;base64,abc123');
      expect(pdfImage.alt).toBe('Test Image');
      expect(pdfImage.isExternal).toBe(false);
    });

    it('should prepare image with external URL for PDF export', () => {
      const imageData = {
        base64Data: null,
        mimeType: null,
        alt: 'Test Image',
        externalUrl: 'https://example.com/image.png',
        src: 'https://example.com/image.png',
        width: 400,
        height: 300
      };
      
      const pdfImage = imageHandler.prepareForPdf(imageData);
      
      expect(pdfImage).toBeDefined();
      expect(pdfImage.url).toBe('https://example.com/image.png');
      expect(pdfImage.alt).toBe('Test Image');
      expect(pdfImage.isExternal).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should calculate image statistics', () => {
      const images = [
        { hasBase64: true, hasExternalUrl: true, base64Data: 'abc123' },
        { hasBase64: false, hasExternalUrl: true, base64Data: null },
        { hasBase64: true, hasExternalUrl: false, base64Data: 'def456' }
      ];
      
      const stats = imageHandler.getStatistics(images);
      
      expect(stats.total).toBe(3);
      expect(stats.withBase64).toBe(2);
      expect(stats.externalOnly).toBe(1);
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    it('should handle empty image array', () => {
      const stats = imageHandler.getStatistics([]);
      
      expect(stats.total).toBe(0);
      expect(stats.withBase64).toBe(0);
      expect(stats.externalOnly).toBe(0);
      expect(stats.totalSize).toBe(0);
    });
  });

  describe('Image Extraction', () => {
    it('should extract images from HTML element', async () => {
      // Create mock DOM
      const mockImg = {
        src: 'https://example.com/image.png',
        alt: 'Test Image',
        title: 'Image Title',
        naturalWidth: 400,
        naturalHeight: 300,
        width: 400,
        height: 300
      };

      const mockElement = {
        querySelectorAll: vi.fn().mockReturnValue([mockImg])
      };

      // Mock fetch to avoid actual network calls
      global.fetch = vi.fn().mockResolvedValue({
        ok: false
      });

      const images = await imageHandler.extractImages(mockElement);
      
      expect(images).toBeDefined();
      expect(Array.isArray(images)).toBe(true);
    });
  });
});
