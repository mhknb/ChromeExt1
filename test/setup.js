/**
 * Vitest setup file
 * Global test configuration and mocks
 */

import { vi } from 'vitest';

// Mock Chrome API
global.chrome = {
  storage: {
    sync: {
      get: vi.fn((key, callback) => {
        callback({});
      }),
      set: vi.fn((data, callback) => {
        if (callback) callback();
      })
    }
  },
  runtime: {
    lastError: null
  }
};

// Mock DOM APIs
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock DOMParser for browser environment
if (typeof DOMParser === 'undefined') {
  global.DOMParser = class DOMParser {
    parseFromString(str, type) {
      const div = document.createElement('div');
      div.innerHTML = str;
      return {
        body: div
      };
    }
  };
}

// Polyfill Blob methods for Node.js environment
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = async function() {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(this);
    });
  };
}

if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
  Blob.prototype.text = async function() {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(this);
    });
  };
}
