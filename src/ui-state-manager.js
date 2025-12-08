/**
 * UI State Manager
 * Manages UI state during export operations
 * Validates: Requirement 6.5 (button disabling during export)
 */

class UIStateManager {
  constructor() {
    this.activeExports = new Set();
    this.buttonStates = new Map();
    
    console.log('[UIStateManager] Initialized');
  }

  /**
   * Disable button during export
   * Validates: Requirement 6.5 (button disabling)
   * @param {HTMLElement} button - Button element
   * @param {string} exportId - Unique export ID
   */
  disableButton(button, exportId) {
    if (!button) return;
    
    // Store original state
    this.buttonStates.set(exportId, {
      button,
      originalDisabled: button.disabled,
      originalClass: button.className,
      originalHTML: button.innerHTML
    });
    
    // Disable button
    button.disabled = true;
    button.classList.add('exporting');
    
    // Add loading indicator
    const loadingIcon = `
      <svg class="loading-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" stroke-width="3" stroke-dasharray="31.4 31.4" />
      </svg>
    `;
    button.innerHTML = loadingIcon;
    
    this.activeExports.add(exportId);
    
    console.log('[UIStateManager] Button disabled for export:', exportId);
  }

  /**
   * Enable button after export
   * @param {string} exportId - Unique export ID
   * @param {boolean} success - Whether export was successful
   */
  enableButton(exportId, success = true) {
    const state = this.buttonStates.get(exportId);
    
    if (!state) {
      console.warn('[UIStateManager] No state found for export:', exportId);
      return;
    }
    
    const { button, originalDisabled, originalClass, originalHTML } = state;
    
    // Show success/error feedback
    if (success) {
      button.classList.add('success');
      button.innerHTML = '✓';
    } else {
      button.classList.add('error');
      button.innerHTML = '✗';
    }
    
    // Restore original state after delay
    setTimeout(() => {
      button.disabled = originalDisabled;
      button.className = originalClass;
      button.innerHTML = originalHTML;
      
      this.buttonStates.delete(exportId);
      this.activeExports.delete(exportId);
      
      console.log('[UIStateManager] Button enabled for export:', exportId);
    }, 2000);
  }

  /**
   * Disable all export buttons
   */
  disableAllButtons() {
    const buttons = document.querySelectorAll('.ai-export-btn');
    buttons.forEach(button => {
      button.disabled = true;
      button.classList.add('disabled-global');
    });
    
    console.log('[UIStateManager] All buttons disabled');
  }

  /**
   * Enable all export buttons
   */
  enableAllButtons() {
    const buttons = document.querySelectorAll('.ai-export-btn');
    buttons.forEach(button => {
      if (!button.classList.contains('exporting')) {
        button.disabled = false;
        button.classList.remove('disabled-global');
      }
    });
    
    console.log('[UIStateManager] All buttons enabled');
  }

  /**
   * Check if any export is active
   * @returns {boolean} Has active exports
   */
  hasActiveExports() {
    return this.activeExports.size > 0;
  }

  /**
   * Get active export count
   * @returns {number} Number of active exports
   */
  getActiveExportCount() {
    return this.activeExports.size;
  }

  /**
   * Show progress indicator
   * @param {string} exportId - Export ID
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} message - Progress message
   */
  showProgress(exportId, progress, message) {
    const state = this.buttonStates.get(exportId);
    
    if (!state || !state.button) {
      return;
    }
    
    // Update button with progress
    state.button.setAttribute('data-progress', progress);
    state.button.setAttribute('title', message || `${progress}%`);
    
    console.log('[UIStateManager] Progress update:', exportId, progress);
  }

  /**
   * Clear all button states
   */
  clearAllStates() {
    this.buttonStates.forEach((state, exportId) => {
      this.enableButton(exportId, false);
    });
    
    this.buttonStates.clear();
    this.activeExports.clear();
    
    console.log('[UIStateManager] All states cleared');
  }
}

export default UIStateManager;
