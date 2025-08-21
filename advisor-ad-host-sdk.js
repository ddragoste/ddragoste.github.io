/**
 * Advisor Ad Host SDK - Full version for host applications
 * Receives events and manages modal popup functionality
 */

(function () {
  "use strict";

  class AdvisorAdHostSDK {
    constructor() {
      this.config = {
        modalTitle: "Schedule a Call",
        // Modal styling configuration
        modalStyles: {
          overlay: {
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
          },
          container: {
            width: "80vw",
            height: "80vh",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.3)",
          },
          header: {
            borderBottom: "1px solid #e5e7eb",
            padding: "20px",
          },
          title: {
            fontSize: "1.25rem",
            fontWeight: "600",
            color: "#1c1f2a",
          },
          closeButton: {
            fontSize: "1.5rem",
            color: "#6b7280",
            hoverBackground: "#f3f4f6",
          },
          content: {
            padding: "20px",
          },
          iframe: {
            borderRadius: "8px",
          },
          mobile: {
            containerWidth: "95vw",
            containerHeight: "90vh",
          },
        },
      };
      this.isInitialized = false;
      this.modalElement = null;
      this.iframeElement = null;
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
      this.log("Advisor Ad Host SDK initialized");

      // Create modal UI and start listening
      this.createModal();
      this.startListening();
    }

    /**
     * Create and add the modal to the page
     */
    createModal() {
      // Create modal HTML
      const modalHTML = `
        <div class="advisor-modal-overlay" id="advisorModalOverlay">
          <div class="advisor-modal-container">
            <div class="advisor-modal-header">
              <h3 class="advisor-modal-title">${this.config.modalTitle}</h3>
              <button class="advisor-modal-close" id="advisorModalClose">&times;</button>
            </div>
            <div class="advisor-modal-content">
              <iframe
                id="advisorModalIframe"
                class="advisor-modal-iframe"
                title="Advisor Scheduling"
                allow="camera; microphone; geolocation"
              >
              </iframe>
            </div>
          </div>
        </div>
      `;

      // Add modal to page
      document.body.insertAdjacentHTML("beforeend", modalHTML);

      // Store references
      this.modalElement = document.getElementById("advisorModalOverlay");
      this.iframeElement = document.getElementById("advisorModalIframe");

      // Add modal styles
      this.addModalStyles();

      this.log("Modal UI created and added to page");
    }

    /**
     * Add modal CSS styles to the page
     */
    addModalStyles() {
      const styleId = "advisor-modal-styles";
      if (document.getElementById(styleId)) {
        return; // Styles already added
      }

      const styles = `
        <style id="${styleId}">
          .advisor-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: ${this.config.modalStyles.overlay.background};
            backdrop-filter: ${this.config.modalStyles.overlay.backdropFilter};
            display: none;
            z-index: ${this.config.modalStyles.overlay.zIndex};
          }

          .advisor-modal-overlay.show {
            display: block;
          }

          .advisor-modal-container {
            position: absolute;
            width: ${this.config.modalStyles.container.width};
            height: ${this.config.modalStyles.container.height};
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${this.config.modalStyles.container.background};
            border-radius: ${this.config.modalStyles.container.borderRadius};
            overflow: hidden;
            box-shadow: ${this.config.modalStyles.container.boxShadow};
          }

          .advisor-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: ${this.config.modalStyles.header.padding};
            border-bottom: ${this.config.modalStyles.header.borderBottom};
          }

          .advisor-modal-title {
            font-size: ${this.config.modalStyles.title.fontSize};
            font-weight: ${this.config.modalStyles.title.fontWeight};
            color: ${this.config.modalStyles.title.color};
            margin: 0;
          }

          .advisor-modal-close {
            background: none;
            border: none;
            font-size: ${this.config.modalStyles.closeButton.fontSize};
            cursor: pointer;
            color: ${this.config.modalStyles.closeButton.color};
            padding: 4px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }

          .advisor-modal-close:hover {
            background: ${this.config.modalStyles.closeButton.hoverBackground};
          }

          .advisor-modal-content {
            height: calc(100% - 80px);
            padding: ${this.config.modalStyles.content.padding};
          }

          .advisor-modal-iframe {
            width: 100%;
            height: 100%;
            border: none;
            border-radius: ${this.config.modalStyles.iframe.borderRadius};
          }

          @media (max-width: 768px) {
            .advisor-modal-container {
              width: ${this.config.modalStyles.mobile.containerWidth};
              height: ${this.config.modalStyles.mobile.containerHeight};
            }
          }
        </style>
      `;

      document.head.insertAdjacentHTML("beforeend", styles);
    }

    /**
     * Start listening for advisor URL events and automatically open modal
     */
    startListening() {
      this.log("Starting to listen for advisor URL events");

      // Listen for postMessage events from iframes
      window.addEventListener("message", (event) => {
        if (event.data && event.data.type === "advisor:openUrl") {
          const advisorUrl = event.data.advisorUrl;
          this.log("Received advisor URL via postMessage: " + advisorUrl);
          this.openModal(advisorUrl);
        }
      });

      this.log("Listening for advisor URL events");
    }

    /**
     * Open the modal with the specified URL
     * @param {string} advisorUrl - The URL to load in the modal iframe
     */
    openModal(advisorUrl) {
      if (!this.modalElement || !this.iframeElement) {
        this.log("Modal elements not found, cannot open modal");
        return;
      }

      this.log("Opening modal with URL: " + advisorUrl);

      // Set the iframe source
      this.iframeElement.src = advisorUrl;

      // Show the modal
      this.modalElement.classList.add("show");
      document.body.style.overflow = "hidden";

      // Add click outside and escape key handlers
      this.addModalEventHandlers();
    }

    /**
     * Close the modal
     */
    closeModal() {
      if (!this.modalElement || !this.iframeElement) {
        return;
      }

      this.log("Closing modal");

      // Hide the modal
      this.modalElement.classList.remove("show");
      document.body.style.overflow = "auto";

      // Clear the iframe source
      this.iframeElement.src = "";

      // Remove event handlers
      this.removeModalEventHandlers();
    }

    /**
     * Add event handlers for modal interaction
     */
    addModalEventHandlers() {
      // Close modal when clicking outside
      this.modalElement.addEventListener("click", (event) => {
        if (event.target === this.modalElement) {
          this.closeModal();
        }
      });

      // Close modal with close button
      const closeButton = document.getElementById("advisorModalClose");
      if (closeButton) {
        closeButton.addEventListener("click", () => {
          this.closeModal();
        });
      }

      // Close modal with Escape key
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          this.closeModal();
        }
      });
    }

    /**
     * Remove modal event handlers
     */
    removeModalEventHandlers() {
      // Note: In a production environment, you'd want to store references to these handlers
      // and remove them specifically. For simplicity, we'll rely on the modal being hidden.
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
        window.advisorAdHostSDKConfig &&
        window.advisorAdHostSDKConfig.loggingEnabled
      ) {
        console.log("[AdvisorAdHostSDK] " + message);
      }
    }
  }

  // Expose the class globally
  window.AdvisorAdHostSDK = AdvisorAdHostSDK;

  // Create global instance
  window.advisorAdHostSDK = new AdvisorAdHostSDK();

  // Allow configuration via global config object
  window.advisorAdHostSDKConfig = {
    loggingEnabled: false,
  };

  // Add a static factory method for cleaner instantiation
  /**
   * Create a new AdvisorAdHostSDK instance
   * @param {boolean} loggingEnabled - Enable console logging for debugging
   * @returns {AdvisorAdHostSDK} A new AdvisorAdHostSDK instance
   */
  window.AdvisorAdHostSDK.create = function (loggingEnabled = false) {
    return new AdvisorAdHostSDK(loggingEnabled);
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.advisorAdHostSDK) {
        window.advisorAdHostSDK.init();
      }
    });
  } else {
    if (window.advisorAdHostSDK) {
      window.advisorAdHostSDK.init();
    }
  }
})();
