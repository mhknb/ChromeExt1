/**
 * Settings Manager
 * Manages user settings with Chrome storage
 */

class SettingsManager {
  constructor() {
    this.storageKey = 'aiContentExporterSettings';
    this.defaults = this.getDefaults();
  }

  /**
   * Get default settings
   * @returns {Object} Default settings
   */
  getDefaults() {
    return {
      export: {
        defaultFormat: 'markdown',
        preserveCodeBlocks: true,
        syntaxHighlighting: true,
        removeEmojis: false
      },
      docx: {
        embedFonts: true,
        includeHeader: true,
        includeFooter: true,
        pageNumbers: true
      },
      pdf: {
        defaultQuality: 'fast',
        dpi: 300,
        embedFonts: true,
        includeTOC: false
      },
      ui: {
        showFloatingButton: true,
        buttonPosition: 'top-right'
      }
    };
  }

  /**
   * Load settings from Chrome storage
   * @returns {Promise<Object>} Settings
   */
  async loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve) => {
        chrome.storage.sync.get(this.storageKey, (result) => {
          resolve(result[this.storageKey] || this.defaults);
        });
      });
    }
    return this.defaults;
  }

  /**
   * Validate settings object
   * @param {Object} settings - Settings to validate
   * @returns {Object} Validation result with isValid and errors
   */
  validateSettings(settings) {
    const errors = [];

    // Validate export settings
    if (settings.export) {
      const validFormats = ['markdown', 'docx', 'pdf-fast', 'pdf-quality'];
      if (settings.export.defaultFormat && !validFormats.includes(settings.export.defaultFormat)) {
        errors.push(`Invalid default format: ${settings.export.defaultFormat}. Must be one of: ${validFormats.join(', ')}`);
      }
      
      if (typeof settings.export.preserveCodeBlocks !== 'boolean') {
        errors.push('preserveCodeBlocks must be a boolean');
      }
      
      if (typeof settings.export.syntaxHighlighting !== 'boolean') {
        errors.push('syntaxHighlighting must be a boolean');
      }
      
      if (typeof settings.export.removeEmojis !== 'boolean') {
        errors.push('removeEmojis must be a boolean');
      }
    } else {
      errors.push('export settings are required');
    }

    // Validate docx settings
    if (settings.docx) {
      if (typeof settings.docx.embedFonts !== 'boolean') {
        errors.push('docx.embedFonts must be a boolean');
      }
      
      if (typeof settings.docx.includeHeader !== 'boolean') {
        errors.push('docx.includeHeader must be a boolean');
      }
      
      if (typeof settings.docx.includeFooter !== 'boolean') {
        errors.push('docx.includeFooter must be a boolean');
      }
      
      if (typeof settings.docx.pageNumbers !== 'boolean') {
        errors.push('docx.pageNumbers must be a boolean');
      }
    } else {
      errors.push('docx settings are required');
    }

    // Validate pdf settings
    if (settings.pdf) {
      const validQualities = ['fast', 'quality'];
      if (settings.pdf.defaultQuality && !validQualities.includes(settings.pdf.defaultQuality)) {
        errors.push(`Invalid PDF quality: ${settings.pdf.defaultQuality}. Must be one of: ${validQualities.join(', ')}`);
      }
      
      if (typeof settings.pdf.dpi !== 'number' || settings.pdf.dpi < 72 || settings.pdf.dpi > 600) {
        errors.push('pdf.dpi must be a number between 72 and 600');
      }
      
      if (typeof settings.pdf.embedFonts !== 'boolean') {
        errors.push('pdf.embedFonts must be a boolean');
      }
      
      if (typeof settings.pdf.includeTOC !== 'boolean') {
        errors.push('pdf.includeTOC must be a boolean');
      }
    } else {
      errors.push('pdf settings are required');
    }

    // Validate ui settings
    if (settings.ui) {
      if (typeof settings.ui.showFloatingButton !== 'boolean') {
        errors.push('ui.showFloatingButton must be a boolean');
      }
      
      const validPositions = ['top-right', 'bottom-right', 'top-left', 'bottom-left'];
      if (settings.ui.buttonPosition && !validPositions.includes(settings.ui.buttonPosition)) {
        errors.push(`Invalid button position: ${settings.ui.buttonPosition}. Must be one of: ${validPositions.join(', ')}`);
      }
    } else {
      errors.push('ui settings are required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Save settings to Chrome storage
   * @param {Object} settings - Settings to save
   * @returns {Promise<void>}
   */
  async saveSettings(settings) {
    // Validate settings before saving
    const validation = this.validateSettings(settings);
    if (!validation.isValid) {
      throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
      return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [this.storageKey]: settings }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    }
  }

  /**
   * Reset to default settings
   * @returns {Promise<Object>} Default settings
   */
  async resetToDefaults() {
    await this.saveSettings(this.defaults);
    return this.defaults;
  }
}

export default SettingsManager;
