export function id() {
  const alphabet = 'abcdefghijklmnop'; // 16 characters (base16)
  let id = '';
  for (let i = 0; i < 32; i++) {
    // Generate a random number between 0 and 15
    const randomIndex = Math.floor(Math.random() * 16);
    id += alphabet[randomIndex];
  }
  return id;
}

/**
 * Modern Resizable class that observes element size changes using ResizeObserver
 * Supports multiple subscribers and provides comprehensive error handling
 */
export class Resizable {
    /**
     * Creates a new Resizable instance
     * @param {HTMLElement} element - The DOM element to observe for size changes
     * @throws {Error} When ResizeObserver is not supported or element is invalid
     */
    constructor(element) {
        // Validate ResizeObserver support
        if (!('ResizeObserver' in window)) {
            throw new Error(
                'ResizeObserver is not supported in this browser. ' +
                'Please use a modern browser or include a ResizeObserver polyfill.'
            );
        }

        // Validate element parameter
        if (!element) {
            throw new TypeError('Element is required but was not provided');
        }

        if (!(element instanceof Element)) {
            throw new TypeError(
                `Expected HTMLElement, received: ${typeof element}. ` +
                'Please provide a valid DOM element.'
            );
        }

        // Check if element is connected to DOM
        if (!element.isConnected) {
            //console.warn('Element is not connected to the DOM. Size observation may not work as expected.');
        }

        this.element = element;
        this.callbacks = new Set(); // Support multiple subscribers
        this.isObserving = false;
        this.lastSize = {width:0, height:0};

        // Create ResizeObserver with error handling
        try {
            this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
        } catch (error) {
            throw new Error(`Failed to create ResizeObserver: ${error.message}`);
        }

        // Start observing immediately
        this.startObserving();
    }

    /**
     * Handles resize events from ResizeObserver
     * @param {ResizeObserverEntry[]} entries - Array of resize entries
     * @private
     */
    handleResize(entries) {
        try {
            for (const entry of entries) {
                // Get the content rect which contains the width and height
                const { width, height } = entry.contentRect;

                // Create size object with additional useful properties
                const sizeData = {
                    width,
                    height,
                    element: entry.target,
                    contentRect: entry.contentRect,
                    borderBoxSize: entry.borderBoxSize,
                    contentBoxSize: entry.contentBoxSize,
                    devicePixelContentBoxSize: entry.devicePixelContentBoxSize
                };

                // Store last size for comparison
                this.lastSize = { width, height };

                // Execute all callbacks
                this.callbacks.forEach(callback => {
                    try {
                        callback(sizeData);
                    } catch (callbackError) {
                        console.error('Error in resize callback:', callbackError);
                        // Continue executing other callbacks even if one fails
                    }
                });
            }
        } catch (error) {
            console.error('Error handling resize event:', error);
        }
    }

    /**
     * Starts observing the element for size changes
     * @private
     */
    startObserving() {
        if (this.isObserving) return;

        try {
            this.resizeObserver.observe(this.element);
            this.isObserving = true;
        } catch (error) {
            throw new Error(`Failed to start observing element: ${error.message}`);
        }
    }

    /**
     * Stops observing the element for size changes
     * @private
     */
    stopObserving() {
        if (!this.isObserving) return;

        try {
            this.resizeObserver.unobserve(this.element);
            this.isObserving = false;
        } catch (error) {
            console.error('Error stopping observation:', error);
        }
    }

    /**
     * Subscribes to size change events
     * @param {Function} callback - Function to call when element size changes
     * @returns {Function} Unsubscribe function
     * @throws {TypeError} When callback is not a function
     */
    subscribe(callback) {
        // Validate callback
        if (typeof callback !== 'function') {
            throw new TypeError(
                `Callback must be a function, received: ${typeof callback}. ` +
                'Please provide a valid callback function.'
            );
        }

        // Add callback to set
        this.callbacks.add(callback);

        // If we have a last known size, immediately call the callback
        if (this.lastSize) {
            try {
                callback({
                    width: this.lastSize.width,
                    height: this.lastSize.height,
                    element: this.element,
                    contentRect: this.lastSize,
                    borderBoxSize: null,
                    contentBoxSize: null,
                    devicePixelContentBoxSize: null
                });
            } catch (callbackError) {
                console.error('Error in initial callback execution:', callbackError);
            }
        }

        // Return unsubscribe function
        return () => {
            this.callbacks.delete(callback);

            // If no more callbacks, stop observing
            if (this.callbacks.size === 0) {
                this.stopObserving();
            }
        };
    }

    /**
     * Gets the current size of the element
     * @returns {Object|null} Current size object or null if not yet measured
     */
    get value(){
      return { ...this.lastSize }; // non-null response
    }
    getCurrentSize() {
        return this.lastSize ? { ...this.lastSize } : null;
    }

    /**
     * Gets the number of active subscribers
     * @returns {number} Number of active callbacks
     */
    getSubscriberCount() {
        return this.callbacks.size;
    }

    /**
     * Checks if the element is currently being observed
     * @returns {boolean} True if observing, false otherwise
     */
    isActive() {
        return this.isObserving;
    }

    /**
     * Manually triggers a size check (useful for testing)
     * Note: This doesn't actually trigger ResizeObserver, but gets current size
     */
    checkSize() {
        const rect = this.element.getBoundingClientRect();
        const sizeData = {
            width: rect.width,
            height: rect.height,
            element: this.element,
            contentRect: rect,
            borderBoxSize: null,
            contentBoxSize: null,
            devicePixelContentBoxSize: null
        };

        this.lastSize = { width: rect.width, height: rect.height };

        this.callbacks.forEach(callback => {
            try {
                callback(sizeData);
            } catch (callbackError) {
                console.error('Error in manual size check callback:', callbackError);
            }
        });
    }

    /**
     * Destroys the Resizable instance, cleaning up all resources
     */
    destroy() {
        try {
            // Clear all callbacks
            this.callbacks.clear();

            // Stop observing
            this.stopObserving();

            // Disconnect the observer
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }

            // Clear references
            this.element = null;
            this.resizeObserver = null;
            this.lastSize = null;
        } catch (error) {
            console.error('Error during Resizable destruction:', error);
        }
    }

    /**
     * Static method to check if ResizeObserver is supported
     * @returns {boolean} True if ResizeObserver is supported
     */
    static isSupported() {
        return 'ResizeObserver' in window;
    }

    /**
     * Static factory method to create a Resizable instance with error handling
     * @param {HTMLElement} element - The DOM element to observe
     * @returns {Resizable|null} Resizable instance or null if creation fails
     */
    static create(element) {
        try {
            return new Resizable(element);
        } catch (error) {
            console.error('Failed to create Resizable instance:', error);
            return null;
        }
    }
}
