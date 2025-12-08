/**
 * Image Handler
 * Handles image extraction, validation, and conversion for different export formats
 */

class ImageHandler {
  constructor() {
    this.supportedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    this.maxImageSize = 10 * 1024 * 1024; // 10MB max per image
  }

  /**
   * Extract images from HTML content
   * @param {HTMLElement} element - Content element
   * @returns {Promise<Array<Object>>} Array of image objects
   */
  async extractImages(element) {
    const images = [];
    const imgElements = element.querySelectorAll('img');
    
    for (let i = 0; i < imgElements.length; i++) {
      const img = imgElements[i];
      const imageData = await this.processImage(img, i);
      
      if (imageData) {
        images.push(imageData);
      }
    }
    
    return images;
  }

  /**
   * Process a single image element
   * @param {HTMLImageElement} img - Image element
   * @param {number} index - Image index
   * @returns {Promise<Object|null>} Image data object or null if invalid
   */
  async processImage(img, index) {
    try {
      const src = img.src;
      const alt = img.alt || `Image ${index + 1}`;
      const title = img.title || '';
      
      // Get dimensions
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      
      // Determine if it's a data URL or external URL
      const isDataUrl = src.startsWith('data:');
      const isHttpUrl = src.startsWith('http://') || src.startsWith('https://');
      
      let base64Data = null;
      let mimeType = null;
      let externalUrl = null;
      
      if (isDataUrl) {
        // Extract base64 data and mime type from data URL
        const match = src.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      } else if (isHttpUrl) {
        // Store external URL
        externalUrl = src;
        // Try to fetch and convert to base64 (with CORS considerations)
        try {
          const fetchedData = await this.fetchImageAsBase64(src);
          if (fetchedData) {
            base64Data = fetchedData.base64;
            mimeType = fetchedData.mimeType;
          }
        } catch (error) {
          // If fetch fails (CORS, etc.), keep external URL
          console.warn(`Could not fetch image: ${src}`, error);
        }
      } else {
        // Relative URL or other format - try to resolve
        try {
          const absoluteUrl = new URL(src, window.location.href).href;
          externalUrl = absoluteUrl;
          const fetchedData = await this.fetchImageAsBase64(absoluteUrl);
          if (fetchedData) {
            base64Data = fetchedData.base64;
            mimeType = fetchedData.mimeType;
          }
        } catch (error) {
          console.warn(`Could not process image: ${src}`, error);
          externalUrl = src;
        }
      }
      
      // Validate image
      if (!this.validateImage(base64Data, mimeType, externalUrl)) {
        console.warn(`Invalid image skipped: ${src}`);
        return null;
      }
      
      return {
        index,
        src,
        alt,
        title,
        width,
        height,
        base64Data,
        mimeType,
        externalUrl,
        hasBase64: !!base64Data,
        hasExternalUrl: !!externalUrl
      };
    } catch (error) {
      console.error(`Error processing image at index ${index}:`, error);
      return null;
    }
  }

  /**
   * Fetch image from URL and convert to base64
   * @param {string} url - Image URL
   * @returns {Promise<Object|null>} Object with base64 and mimeType, or null
   */
  async fetchImageAsBase64(url) {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        return null;
      }
      
      const blob = await response.blob();
      const mimeType = blob.type;
      
      // Check size
      if (blob.size > this.maxImageSize) {
        console.warn(`Image too large: ${blob.size} bytes`);
        return null;
      }
      
      // Convert blob to base64
      const base64 = await this.blobToBase64(blob);
      
      return {
        base64: base64.split(',')[1], // Remove data:image/...;base64, prefix
        mimeType
      };
    } catch (error) {
      // CORS or network error
      return null;
    }
  }

  /**
   * Convert blob to base64 data URL
   * @param {Blob} blob - Image blob
   * @returns {Promise<string>} Base64 data URL
   */
  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Validate image data
   * @param {string|null} base64Data - Base64 encoded image data
   * @param {string|null} mimeType - MIME type
   * @param {string|null} externalUrl - External URL
   * @returns {boolean} True if valid
   */
  validateImage(base64Data, mimeType, externalUrl) {
    // Must have either base64 data or external URL
    if (!base64Data && !externalUrl) {
      return false;
    }
    
    // If we have base64 data, validate mime type
    if (base64Data && mimeType) {
      if (!this.supportedFormats.includes(mimeType)) {
        return false;
      }
      
      // Validate base64 format
      if (!this.isValidBase64(base64Data)) {
        return false;
      }
      
      // Check size (rough estimate: base64 is ~1.37x original size)
      const estimatedSize = (base64Data.length * 3) / 4;
      if (estimatedSize > this.maxImageSize) {
        return false;
      }
    }
    
    // If we have external URL, validate format
    if (externalUrl && !base64Data) {
      try {
        new URL(externalUrl);
        return true;
      } catch {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if string is valid base64
   * @param {string} str - String to check
   * @returns {boolean} True if valid base64
   */
  isValidBase64(str) {
    if (!str || typeof str !== 'string') {
      return false;
    }
    
    // Base64 regex pattern
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return base64Regex.test(str);
  }

  /**
   * Convert image to markdown format
   * @param {Object} imageData - Image data object
   * @returns {string} Markdown image syntax
   */
  toMarkdown(imageData) {
    const { alt, title, externalUrl, src } = imageData;
    
    // For markdown, always use external URL (not base64)
    const url = externalUrl || src;
    
    if (title) {
      return `![${alt}](${url} "${title}")`;
    }
    return `![${alt}](${url})`;
  }

  /**
   * Convert image to base64 data URL for embedding
   * @param {Object} imageData - Image data object
   * @returns {string|null} Data URL or null if no base64 data
   */
  toDataUrl(imageData) {
    const { base64Data, mimeType } = imageData;
    
    if (!base64Data || !mimeType) {
      return null;
    }
    
    return `data:${mimeType};base64,${base64Data}`;
  }

  /**
   * Get image dimensions with aspect ratio preservation
   * @param {Object} imageData - Image data object
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @returns {Object} Calculated dimensions {width, height}
   */
  calculateDimensions(imageData, maxWidth = 600, maxHeight = 800) {
    let { width, height } = imageData;
    
    // If no dimensions, use defaults
    if (!width || !height) {
      return { width: maxWidth, height: maxHeight };
    }
    
    // Calculate aspect ratio
    const aspectRatio = width / height;
    
    // Scale down if needed
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * Prepare image for DOCX export
   * @param {Object} imageData - Image data object
   * @returns {Object|null} DOCX image object or null
   */
  prepareForDocx(imageData) {
    const { base64Data, mimeType, alt, width, height } = imageData;
    
    // DOCX requires base64 data
    if (!base64Data || !mimeType) {
      return null;
    }
    
    // Calculate dimensions (max 6 inches wide for standard document)
    const maxWidthInches = 6;
    const maxHeightInches = 8;
    const dpi = 96; // Standard screen DPI
    
    const dimensions = this.calculateDimensions(
      imageData,
      maxWidthInches * dpi,
      maxHeightInches * dpi
    );
    
    return {
      data: base64Data,
      mimeType,
      alt,
      width: dimensions.width,
      height: dimensions.height,
      // Convert pixels to EMUs (English Metric Units) for DOCX
      // 1 inch = 914400 EMUs, 1 pixel = 9525 EMUs (at 96 DPI)
      widthEMU: Math.round(dimensions.width * 9525),
      heightEMU: Math.round(dimensions.height * 9525)
    };
  }

  /**
   * Prepare image for PDF export
   * @param {Object} imageData - Image data object
   * @returns {Object|null} PDF image object or null
   */
  prepareForPdf(imageData) {
    const dataUrl = this.toDataUrl(imageData);
    
    if (!dataUrl) {
      // If no base64, try external URL
      return {
        url: imageData.externalUrl || imageData.src,
        alt: imageData.alt,
        width: imageData.width,
        height: imageData.height,
        isExternal: true
      };
    }
    
    const dimensions = this.calculateDimensions(imageData, 500, 700);
    
    return {
      dataUrl,
      alt: imageData.alt,
      width: dimensions.width,
      height: dimensions.height,
      isExternal: false
    };
  }

  /**
   * Get image statistics
   * @param {Array<Object>} images - Array of image objects
   * @returns {Object} Statistics
   */
  getStatistics(images) {
    return {
      total: images.length,
      withBase64: images.filter(img => img.hasBase64).length,
      externalOnly: images.filter(img => !img.hasBase64 && img.hasExternalUrl).length,
      totalSize: images.reduce((sum, img) => {
        if (img.base64Data) {
          return sum + (img.base64Data.length * 3) / 4; // Approximate size in bytes
        }
        return sum;
      }, 0)
    };
  }
}

export default ImageHandler;
