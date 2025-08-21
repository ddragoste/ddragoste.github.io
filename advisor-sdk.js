/**
 * Advisor SDK - Standalone JavaScript version
 * Enables communication between advisor cards and main application
 * for displaying Calendly scheduling iframes.
 */

(function () {
  'use strict';

  class AdvisorSDK {
    constructor(config = {}) {
      this.config = {
        enableLogging: false,
        ...config,
      };
      this.isInitialized = false;
    }

    /**
     * Initialize the SDK
     */
    init() {
      if (this.isInitialized) {
        this.log('SDK already initialized');
        return;
      }

      this.isInitialized = true;
      this.log('Advisor SDK initialized');
    }

    /**
     * Send a schedule call request (used by advisor cards)
     * @param {string} calendlyUrl - The Calendly URL to schedule
     */
    sendScheduleCall(calendlyUrl) {
      if (!this.isInitialized) {
        this.log('SDK not initialized. Call init() first.');
        return;
      }

      this.log('Sending schedule call request: ' + calendlyUrl);

      // Dispatch custom event that main app can listen to
      const event = new CustomEvent('advisor:scheduleCall', {
        detail: { calendlyUrl: calendlyUrl },
        bubbles: true,
        cancelable: true,
      });

      document.dispatchEvent(event);
    }

    /**
     * Listen for schedule call requests (used by main applications)
     * @param {Function} callback - Function to call when a schedule request is received
     * @returns {Function} Cleanup function to remove the listener
     */
    onScheduleCall(callback) {
      const eventHandler = event => {
        const calendlyUrl = event.detail.calendlyUrl;
        this.log('Received schedule call request: ' + calendlyUrl);
        callback(calendlyUrl);
      };

      document.addEventListener('advisor:scheduleCall', eventHandler);

      // Return cleanup function
      return () => {
        document.removeEventListener('advisor:scheduleCall', eventHandler);
      };
    }

    /**
     * Check if SDK is initialized
     */
    getInitialized() {
      return this.isInitialized;
    }

    /**
     * Log messages if logging is enabled
     */
    log(message) {
      if (this.config.enableLogging) {
        console.log('[AdvisorSDK] ' + message);
      }
    }
  }

  // Create global instance for easy access
  window.AdvisorSDK = AdvisorSDK;
  window.advisorSDK = new AdvisorSDK({ enableLogging: true });

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.advisorSDK.init();
    });
  } else {
    window.advisorSDK.init();
  }
})();
