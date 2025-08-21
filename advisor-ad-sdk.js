/**
 * Advisor Ad SDK - Lightweight version for advisor cards
 * Only sends events, no modal functionality
 */

(function () {
  "use strict";

  class AdvisorAdSDK {
    constructor() {
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
      this.log("Advisor Ad SDK initialized");
    }

    /**
     * Open advisor URL via postMessage to parent window
     * @param {string} advisorUrl - The advisor URL to send
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
      } else {
        this.log("No parent window found, cannot send message");
      }
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
      if (
        window.advisorAdSDKConfig &&
        window.advisorAdSDKConfig.loggingEnabled
      ) {
        console.log("[AdvisorAdSDK] " + message);
      }
    }
  }

  // Expose the class globally
  window.AdvisorAdSDK = AdvisorAdSDK;

  // Create global instance
  window.advisorAdSDK = new AdvisorAdSDK();

  // Allow configuration via global config object
  window.advisorAdSDKConfig = {
    loggingEnabled: false,
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.advisorAdSDK) {
        window.advisorAdSDK.init();
      }
    });
  } else {
    if (window.advisorAdSDK) {
      window.advisorAdSDK.init();
    }
  }
})();
