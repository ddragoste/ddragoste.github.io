/**
 * Advisor SDK - Standalone JavaScript version
 * Enables communication between advisor cards and main application
 * for displaying Calendly scheduling iframes.
 */

(function () {
  "use strict";

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
        this.log("SDK already initialized");
        return;
      }

      this.isInitialized = true;
      this.log("Advisor SDK initialized");
    }

    /**
     * Open advisor URL - sends both custom event and postMessage (used by advisor cards)
     * @param {string} advisorUrl - The advisor URL to open
     */
    openAdvisorUrl(advisorUrl) {
      if (!this.isInitialized) {
        this.log("SDK not initialized. Call init() first.");
        return;
      }

      this.log("Opening advisor URL: " + advisorUrl);

      // Send via postMessage to parent window (for iframe communication)
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          {
            type: "advisor:openUrl",
            advisorUrl: advisorUrl,
          },
          "*"
        );
        this.log("Sent advisor URL via postMessage");
      }

      // Also dispatch custom event (for same-origin communication)
      const event = new CustomEvent("advisor:openUrl", {
        detail: { advisorUrl: advisorUrl },
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(event);
      this.log("Sent advisor URL via custom event");
    }

    /**
     * Receive advisor URL - handles both custom events and postMessage (used by main applications)
     * @param {Function} callback - Function to call when an advisor URL is received
     * @returns {Function} Cleanup function to remove the listeners
     */
    receiveAdvisorUrl(callback) {
      const eventHandler = (event) => {
        const advisorUrl = event.detail.advisorUrl;
        this.log("Received advisor URL via custom event: " + advisorUrl);
        callback(advisorUrl);
      };

      const messageHandler = (event) => {
        if (event.data && event.data.type === "advisor:openUrl") {
          const advisorUrl = event.data.advisorUrl;
          this.log("Received advisor URL via postMessage: " + advisorUrl);
          callback(advisorUrl);
        }
      };

      // Listen for both custom events and postMessage
      document.addEventListener("advisor:openUrl", eventHandler);
      window.addEventListener("message", messageHandler);

      // Return cleanup function
      return () => {
        document.removeEventListener("advisor:openUrl", eventHandler);
        window.removeEventListener("message", messageHandler);
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
        console.log("[AdvisorSDK] " + message);
      }
    }
  }

  // Create global instance for easy access
  window.AdvisorSDK = AdvisorSDK;
  window.advisorSDK = new AdvisorSDK({ enableLogging: true });

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.advisorSDK.init();
    });
  } else {
    window.advisorSDK.init();
  }
})();
