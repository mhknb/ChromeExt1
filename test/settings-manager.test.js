/**
 * Settings Manager Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import SettingsManager from '../src/settings-manager.js';

describe('SettingsManager', () => {
  let manager;

  beforeEach(() => {
    manager = new SettingsManager();
  });

  it('should have default settings', () => {
    const defaults = manager.getDefaults();
    
    expect(defaults).toHaveProperty('export');
    expect(defaults).toHaveProperty('docx');
    expect(defaults).toHaveProperty('pdf');
    expect(defaults).toHaveProperty('ui');
  });

  it('should have correct default export format', () => {
    const defaults = manager.getDefaults();
    expect(defaults.export.defaultFormat).toBe('markdown');
  });

  it('should load settings from storage', async () => {
    const settings = await manager.loadSettings();
    expect(settings).toBeDefined();
  });

  it('should reset to defaults', async () => {
    const defaults = await manager.resetToDefaults();
    expect(defaults).toEqual(manager.getDefaults());
  });

  describe('Settings Validation', () => {
    it('should validate correct settings', () => {
      const settings = manager.getDefaults();
      const result = manager.validateSettings(settings);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid export format', () => {
      const settings = {
        ...manager.getDefaults(),
        export: {
          ...manager.getDefaults().export,
          defaultFormat: 'invalid-format'
        }
      };
      
      const result = manager.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid default format'))).toBe(true);
    });

    it('should reject non-boolean preserveCodeBlocks', () => {
      const settings = {
        ...manager.getDefaults(),
        export: {
          ...manager.getDefaults().export,
          preserveCodeBlocks: 'yes'
        }
      };
      
      const result = manager.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('preserveCodeBlocks must be a boolean'))).toBe(true);
    });

    it('should reject invalid PDF quality', () => {
      const settings = {
        ...manager.getDefaults(),
        pdf: {
          ...manager.getDefaults().pdf,
          defaultQuality: 'ultra'
        }
      };
      
      const result = manager.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid PDF quality'))).toBe(true);
    });

    it('should reject invalid DPI values', () => {
      const settings = {
        ...manager.getDefaults(),
        pdf: {
          ...manager.getDefaults().pdf,
          dpi: 1000
        }
      };
      
      const result = manager.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('dpi must be a number between 72 and 600'))).toBe(true);
    });

    it('should reject DPI below minimum', () => {
      const settings = {
        ...manager.getDefaults(),
        pdf: {
          ...manager.getDefaults().pdf,
          dpi: 50
        }
      };
      
      const result = manager.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('dpi must be a number between 72 and 600'))).toBe(true);
    });

    it('should reject invalid button position', () => {
      const settings = {
        ...manager.getDefaults(),
        ui: {
          ...manager.getDefaults().ui,
          buttonPosition: 'center'
        }
      };
      
      const result = manager.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid button position'))).toBe(true);
    });

    it('should reject missing export settings', () => {
      const settings = {
        docx: manager.getDefaults().docx,
        pdf: manager.getDefaults().pdf,
        ui: manager.getDefaults().ui
      };
      
      const result = manager.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('export settings are required'))).toBe(true);
    });

    it('should reject missing docx settings', () => {
      const settings = {
        export: manager.getDefaults().export,
        pdf: manager.getDefaults().pdf,
        ui: manager.getDefaults().ui
      };
      
      const result = manager.validateSettings(settings);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('docx settings are required'))).toBe(true);
    });

    it('should throw error when saving invalid settings', async () => {
      const invalidSettings = {
        ...manager.getDefaults(),
        export: {
          ...manager.getDefaults().export,
          defaultFormat: 'invalid'
        }
      };
      
      await expect(manager.saveSettings(invalidSettings)).rejects.toThrow('Invalid settings');
    });

    it('should accept valid alternative formats', () => {
      const formats = ['markdown', 'docx', 'pdf-fast', 'pdf-quality'];
      
      formats.forEach(format => {
        const settings = {
          ...manager.getDefaults(),
          export: {
            ...manager.getDefaults().export,
            defaultFormat: format
          }
        };
        
        const result = manager.validateSettings(settings);
        expect(result.isValid).toBe(true);
      });
    });

    it('should accept valid button positions', () => {
      const positions = ['top-right', 'bottom-right', 'top-left', 'bottom-left'];
      
      positions.forEach(position => {
        const settings = {
          ...manager.getDefaults(),
          ui: {
            ...manager.getDefaults().ui,
            buttonPosition: position
          }
        };
        
        const result = manager.validateSettings(settings);
        expect(result.isValid).toBe(true);
      });
    });

    it('should accept valid DPI range', () => {
      const dpiValues = [72, 150, 300, 600];
      
      dpiValues.forEach(dpi => {
        const settings = {
          ...manager.getDefaults(),
          pdf: {
            ...manager.getDefaults().pdf,
            dpi
          }
        };
        
        const result = manager.validateSettings(settings);
        expect(result.isValid).toBe(true);
      });
    });
  });
});
