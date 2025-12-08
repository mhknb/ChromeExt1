/**
 * File Validator
 * Validates file formats, filenames, and encoding
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

class FileValidator {
  constructor() {
    // Magic bytes for file format detection
    this.magicBytes = {
      // DOCX: PK (ZIP) header followed by Office Open XML structure
      docx: [0x50, 0x4B, 0x03, 0x04],
      // PDF: %PDF-
      pdf: [0x25, 0x50, 0x44, 0x46, 0x2D]
    };
    
    // Valid filename characters (alphanumeric, dash, underscore, period, space)
    this.validFilenameRegex = /^[a-zA-Z0-9\-_. ]+$/;
    
    // Invalid filename characters that need sanitization
    this.invalidFilenameChars = /[<>:"/\\|?*\x00-\x1F]/g;
    
    // Reserved Windows filenames
    this.reservedNames = [
      'CON', 'PRN', 'AUX', 'NUL',
      'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
      'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
    ];
  }

  /**
   * Validate DOCX format (Office Open XML)
   * Validates: Requirement 9.1
   * @param {Blob|ArrayBuffer} file - File to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateDocx(file) {
    try {
      const buffer = await this.getArrayBuffer(file);
      const bytes = new Uint8Array(buffer);
      
      // Check minimum size (DOCX files are typically > 1KB)
      if (bytes.length < 1024) {
        return {
          valid: false,
          errors: ['File too small to be a valid DOCX file'],
          format: 'docx'
        };
      }
      
      // Check magic bytes (PK ZIP header)
      const hasPKHeader = this.checkMagicBytes(bytes, this.magicBytes.docx);
      if (!hasPKHeader) {
        return {
          valid: false,
          errors: ['Invalid DOCX format: Missing ZIP header'],
          format: 'docx'
        };
      }
      
      // Check for Office Open XML structure markers
      // DOCX files contain specific XML files in the ZIP archive
      const content = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, Math.min(2000, bytes.length)));
      const hasContentTypes = content.includes('[Content_Types]') || content.includes('Content_Types');
      const hasWordDocument = content.includes('word/document') || content.includes('word/');
      
      if (!hasContentTypes && !hasWordDocument) {
        return {
          valid: false,
          errors: ['Invalid DOCX format: Missing Office Open XML structure'],
          format: 'docx'
        };
      }
      
      return {
        valid: true,
        errors: [],
        format: 'docx',
        size: bytes.length
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [`DOCX validation error: ${error.message}`],
        format: 'docx'
      };
    }
  }

  /**
   * Validate PDF format (PDF 1.4+)
   * Validates: Requirement 9.2
   * @param {Blob|ArrayBuffer} file - File to validate
   * @returns {Promise<Object>} Validation result
   */
  async validatePdf(file) {
    try {
      const buffer = await this.getArrayBuffer(file);
      const bytes = new Uint8Array(buffer);
      
      // Check minimum size
      if (bytes.length < 100) {
        return {
          valid: false,
          errors: ['File too small to be a valid PDF file'],
          format: 'pdf'
        };
      }
      
      // Check magic bytes (%PDF-)
      const hasPDFHeader = this.checkMagicBytes(bytes, this.magicBytes.pdf);
      if (!hasPDFHeader) {
        return {
          valid: false,
          errors: ['Invalid PDF format: Missing %PDF- header'],
          format: 'pdf'
        };
      }
      
      // Extract PDF version from header
      // Format: %PDF-X.Y where X.Y is the version (e.g., 1.4, 1.5, 1.6, 1.7, 2.0)
      const headerBytes = bytes.slice(0, 20);
      const header = new TextDecoder('utf-8').decode(headerBytes);
      const versionMatch = header.match(/%PDF-(\d+)\.(\d+)/);
      
      if (!versionMatch) {
        return {
          valid: false,
          errors: ['Invalid PDF format: Cannot determine PDF version'],
          format: 'pdf'
        };
      }
      
      const majorVersion = parseInt(versionMatch[1], 10);
      const minorVersion = parseInt(versionMatch[2], 10);
      const version = `${majorVersion}.${minorVersion}`;
      
      // Check if version is 1.4 or higher
      if (majorVersion < 1 || (majorVersion === 1 && minorVersion < 4)) {
        return {
          valid: false,
          errors: [`PDF version ${version} is too old. Minimum required: 1.4`],
          format: 'pdf',
          version
        };
      }
      
      // Check for EOF marker (%%EOF)
      const endBytes = bytes.slice(-50);
      const endContent = new TextDecoder('utf-8', { fatal: false }).decode(endBytes);
      const hasEOF = endContent.includes('%%EOF');
      
      if (!hasEOF) {
        return {
          valid: false,
          errors: ['Invalid PDF format: Missing %%EOF marker'],
          format: 'pdf',
          version
        };
      }
      
      return {
        valid: true,
        errors: [],
        format: 'pdf',
        version,
        size: bytes.length
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [`PDF validation error: ${error.message}`],
        format: 'pdf'
      };
    }
  }

  /**
   * Validate Markdown format (GitHub Flavored Markdown)
   * Validates: Requirement 9.3
   * @param {string|Blob} content - Markdown content to validate
   * @returns {Promise<Object>} Validation result
   */
  async validateMarkdown(content) {
    try {
      let markdown;
      
      if (content instanceof Blob) {
        markdown = await this.blobToText(content);
      } else {
        markdown = content;
      }
      
      const errors = [];
      const warnings = [];
      
      // Check if content is empty
      if (!markdown || markdown.trim().length === 0) {
        return {
          valid: false,
          errors: ['Markdown content is empty'],
          warnings: [],
          format: 'markdown'
        };
      }
      
      // Check UTF-8 encoding validity
      const encodingCheck = this.validateUtf8(markdown);
      if (!encodingCheck.valid) {
        errors.push(...encodingCheck.errors);
      }
      
      // Check for unclosed code blocks
      const codeBlockMatches = markdown.match(/```/g);
      if (codeBlockMatches && codeBlockMatches.length % 2 !== 0) {
        errors.push('Unclosed code block detected (odd number of ``` markers)');
      }
      
      // Check for unclosed LaTeX blocks
      const blockLatexMatches = markdown.match(/\$\$/g);
      if (blockLatexMatches && blockLatexMatches.length % 2 !== 0) {
        warnings.push('Unclosed LaTeX block detected (odd number of $$ markers)');
      }
      
      // Check for GFM table format compliance
      const lines = markdown.split('\n');
      let inTable = false;
      let tableColumnCount = 0;
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // Check if line is a table row
        if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
          const columns = line.split('|').filter(cell => cell.trim() !== '').length;
          
          if (!inTable) {
            inTable = true;
            tableColumnCount = columns;
          } else {
            // Check if column count matches
            if (columns !== tableColumnCount) {
              warnings.push(
                `Table row at line ${index + 1} has ${columns} columns, expected ${tableColumnCount}`
              );
            }
          }
        } else if (inTable && trimmedLine === '') {
          inTable = false;
          tableColumnCount = 0;
        }
      });
      
      // Check for valid GFM table separators
      const tableSeparatorRegex = /^\|[\s:|\-]+\|$/;
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.includes('|') && trimmedLine.includes('-')) {
          const prevLine = index > 0 ? lines[index - 1].trim() : '';
          
          // If previous line is a table header and this looks like a separator
          if (prevLine.startsWith('|') && prevLine.endsWith('|')) {
            // Check if this line looks like a separator (has pipes and dashes)
            const pipeCount = (trimmedLine.match(/\|/g) || []).length;
            const prevPipeCount = (prevLine.match(/\|/g) || []).length;
            
            // If pipe counts don't match or regex doesn't match, it's malformed
            if (pipeCount !== prevPipeCount || !tableSeparatorRegex.test(trimmedLine)) {
              warnings.push(`Malformed table separator at line ${index + 1}`);
            }
          }
        }
      });
      
      // Check for common markdown syntax issues
      // Unmatched brackets in links (excluding code blocks)
      // Remove code blocks first to avoid false positives
      const markdownWithoutCode = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
      const linkBrackets = markdownWithoutCode.match(/\[|\]/g);
      if (linkBrackets) {
        const openBrackets = linkBrackets.filter(b => b === '[').length;
        const closeBrackets = linkBrackets.filter(b => b === ']').length;
        if (openBrackets !== closeBrackets) {
          warnings.push('Unmatched square brackets detected (possible malformed links)');
        }
      }
      
      return {
        valid: errors.length === 0,
        errors,
        warnings,
        format: 'markdown',
        size: new Blob([markdown]).size
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [`Markdown validation error: ${error.message}`],
        warnings: [],
        format: 'markdown'
      };
    }
  }

  /**
   * Sanitize filename to ensure valid filesystem characters
   * Validates: Requirement 9.4
   * @param {string} filename - Original filename
   * @param {string} extension - File extension (optional)
   * @returns {string} Sanitized filename
   */
  sanitizeFilename(filename, extension = '') {
    if (!filename || typeof filename !== 'string') {
      filename = 'untitled';
    }
    
    // Remove or replace invalid characters
    let sanitized = filename.replace(this.invalidFilenameChars, '_');
    
    // Replace multiple spaces with single space
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Remove leading/trailing spaces and dots
    sanitized = sanitized.trim().replace(/^\.+|\.+$/g, '');
    
    // Check if filename is a reserved Windows name
    const nameWithoutExt = sanitized.split('.')[0].toUpperCase();
    if (this.reservedNames.includes(nameWithoutExt)) {
      sanitized = `_${sanitized}`;
    }
    
    // Ensure filename is not empty
    if (sanitized.length === 0) {
      sanitized = 'untitled';
    }
    
    // Limit filename length (255 is typical filesystem limit, leave room for extension)
    const maxLength = 200;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }
    
    // Add extension if provided
    if (extension) {
      // Ensure extension starts with a dot
      const ext = extension.startsWith('.') ? extension : `.${extension}`;
      // Remove existing extension if present
      const lastDot = sanitized.lastIndexOf('.');
      if (lastDot > 0) {
        sanitized = sanitized.substring(0, lastDot);
      }
      sanitized = sanitized + ext;
    }
    
    return sanitized;
  }

  /**
   * Validate UTF-8 encoding
   * Validates: Requirement 9.5
   * @param {string} content - Content to validate
   * @returns {Object} Validation result
   */
  validateUtf8(content) {
    try {
      // Try to encode and decode the content
      const encoder = new TextEncoder();
      const decoder = new TextDecoder('utf-8', { fatal: true });
      
      const encoded = encoder.encode(content);
      const decoded = decoder.decode(encoded);
      
      // Check if round-trip is successful
      if (decoded !== content) {
        return {
          valid: false,
          errors: ['Content contains invalid UTF-8 sequences']
        };
      }
      
      // Check for null bytes (not allowed in UTF-8 text)
      if (content.includes('\0')) {
        return {
          valid: false,
          errors: ['Content contains null bytes']
        };
      }
      
      return {
        valid: true,
        errors: []
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [`UTF-8 validation error: ${error.message}`]
      };
    }
  }

  /**
   * Enforce UTF-8 encoding on content
   * Validates: Requirement 9.5
   * @param {string} content - Content to encode
   * @returns {Blob} UTF-8 encoded blob
   */
  enforceUtf8Encoding(content) {
    // Create a blob with explicit UTF-8 encoding
    return new Blob([content], { type: 'text/plain;charset=utf-8' });
  }

  /**
   * Validate file by format
   * @param {Blob|ArrayBuffer|string} file - File to validate
   * @param {string} format - Expected format (docx, pdf, markdown)
   * @returns {Promise<Object>} Validation result
   */
  async validateFile(file, format) {
    switch (format.toLowerCase()) {
      case 'docx':
        return await this.validateDocx(file);
      case 'pdf':
        return await this.validatePdf(file);
      case 'markdown':
      case 'md':
        return await this.validateMarkdown(file);
      default:
        return {
          valid: false,
          errors: [`Unsupported format: ${format}`],
          format
        };
    }
  }

  // Helper methods

  /**
   * Check if bytes match magic bytes pattern
   * @param {Uint8Array} bytes - File bytes
   * @param {Array<number>} magicBytes - Expected magic bytes
   * @returns {boolean} True if matches
   */
  checkMagicBytes(bytes, magicBytes) {
    if (bytes.length < magicBytes.length) {
      return false;
    }
    
    for (let i = 0; i < magicBytes.length; i++) {
      if (bytes[i] !== magicBytes[i]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Convert Blob to ArrayBuffer
   * @param {Blob|ArrayBuffer} file - File to convert
   * @returns {Promise<ArrayBuffer>} ArrayBuffer
   */
  async getArrayBuffer(file) {
    if (file instanceof ArrayBuffer) {
      return file;
    }
    
    if (file instanceof Blob) {
      return await file.arrayBuffer();
    }
    
    throw new Error('Invalid file type: expected Blob or ArrayBuffer');
  }

  /**
   * Convert Blob to text
   * @param {Blob} blob - Blob to convert
   * @returns {Promise<string>} Text content
   */
  async blobToText(blob) {
    return await blob.text();
  }
}

export default FileValidator;
