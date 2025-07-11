/**
 * Circle Component Plugin Example
 *
 * This demonstrates how to create a new plugin for the XML Widget Engine.
 * The Circle plugin creates interactive SVG circles with reactive properties.
 *
 * PLUGIN ARCHITECTURE OVERVIEW:
 * 1. Plugin Class - Manages lifecycle and component creation
 * 2. Component Class - Handles rendering and behavior
 * 3. Registration - Connect plugin to the engine
 * 4. XML Usage - Define components in markup
 */

// =============================================================================
// STEP 1: CREATE THE PLUGIN CLASS
// =============================================================================

/**
 * CircleComponentPlugin
 *
 * This is the plugin interface that the engine uses.
 *
 * REQUIRED METHODS:
 * - start(): Called when engine starts
 * - stop(): Called when engine stops
 * - createComponent(attributes, engine): Factory method for components
 *
 * HELPFUL HINTS:
 * - Keep plugin lightweight - it's just a factory
 * - Use start() for global setup (event listeners, resources)
 * - Use stop() for cleanup to prevent memory leaks
 * - The plugin instance is shared across all components of this type
 */
class CircleComponentPlugin {
    constructor() {
        this.engine = null;
        this.globalClickCount = 0; // Example: shared state across all circles

        // Optional: Define default styling or configuration
        this.defaultStyles = {
            fill: '#007bff',
            stroke: '#0056b3',
            strokeWidth: 0.5
        };
    }

    /**
     * Called when the engine starts
     * Use this for:
     * - Setting up global event listeners
     * - Initializing shared resources
     * - Adding CSS styles to the page
     * - Registering keyboard shortcuts
     */
    start() {
        console.log('Circle plugin started');

        // Example: Add global CSS for circle-specific features
        const style = document.createElement('style');
        style.textContent = `
            .circle-highlight {
                filter: drop-shadow(0 0 5px #007bff);
            }
        `;
        document.head.appendChild(style);

        // Example: Global keyboard handler for all circles
        document.addEventListener('keydown', this.onGlobalKeyDown.bind(this));
    }

    /**
     * Called when the engine stops
     * CRITICAL: Always clean up to prevent memory leaks
     */
    stop() {
        console.log('Circle plugin stopped');
        document.removeEventListener('keydown', this.onGlobalKeyDown);
    }

    /**
     * Factory method - creates new component instances
     * This is called for each <Circle> element in the XML
     *
     * @param {Object} attributes - XML attributes as key-value pairs
     * @param {WidgetEngine} engine - Reference to the main engine
     * @returns {CircleComponent} New component instance
     */
    createComponent(attributes, engine) {
        return new CircleComponent(attributes, engine, this);
    }

    /**
     * Example global event handler
     * Shows how plugins can implement cross-component features
     */
    onGlobalKeyDown(event) {
        if (event.key === 'c' && event.ctrlKey) {
            console.log('Global circle shortcut pressed!');
            // Could highlight all circles, change colors, etc.
        }
    }
}

// =============================================================================
// STEP 2: CREATE THE COMPONENT CLASS
// =============================================================================

/**
 * CircleComponent
 *
 * This handles the actual rendering and behavior of individual circles.
 *
 * INHERITANCE NOTES:
 * - Extends BaseComponent for reactive properties and common functionality
 * - BaseComponent provides: signals, children management, XML parsing
 * - Override render() and layout() for custom behavior
 *
 * REACTIVE PROPERTIES:
 * - Any XML attribute becomes a reactive signal automatically
 * - Access via this.attributeName.value
 * - Subscribe to changes: this.attributeName.subscribe(callback)
 */
class CircleComponent extends BaseComponent {
    /**
     * Constructor
     *
     * @param {Object} attributes - XML attributes
     * @param {WidgetEngine} engine - Engine reference
     * @param {CircleComponentPlugin} plugin - Plugin reference
     */
    constructor(attributes, engine, plugin) {
        // ALWAYS call super first
        super(attributes, engine);

        this.plugin = plugin;

        // Set default values for circle-specific properties
        this.setDefaults();

        // Optional: Add custom reactive properties not from XML
        this.isHovered = new Signal(false);
        this.clickCount = new Signal(0);

        // Subscribe to property changes for custom behavior
        this.setupPropertyWatchers();
    }

    /**
     * Set sensible defaults for circle properties
     * This ensures circles work even with minimal XML attributes
     */
    setDefaults() {
        // Use reactive properties from BaseComponent
        if (!this.radius) this.radius = new Signal(parseFloat(this.attributes.radius || 5));
        if (!this.cx) this.cx = new Signal(parseFloat(this.attributes.cx || 0));
        if (!this.cy) this.cy = new Signal(parseFloat(this.attributes.cy || 0));
        if (!this.fill) this.fill = new Signal(this.attributes.fill || '#007bff');
        if (!this.stroke) this.stroke = new Signal(this.attributes.stroke || '#0056b3');
        if (!this.strokeWidth) this.strokeWidth = new Signal(parseFloat(this.attributes.strokeWidth || 0.5));
        if (!this.opacity) this.opacity = new Signal(parseFloat(this.attributes.opacity || 1));
    }

    /**
     * Set up watchers for property changes
     * This shows how to react to signal changes
     */
    setupPropertyWatchers() {
        // Example: Log when radius changes
        this.radius.subscribe(newRadius => {
            console.log(`Circle ${this.id} radius changed to:`, newRadius);
        });

        // Example: Validate minimum size
        this.radius.subscribe(newRadius => {
            if (newRadius < 1) {
                console.warn('Circle radius too small, setting to minimum');
                this.radius.value = 1;
            }
        });

        // Example: React to hover state changes
        this.isHovered.subscribe(hovered => {
            if (this.element) {
                this.element.classList.toggle('circle-highlight', hovered);
            }
        });
    }

    /**
     * Render the circle component
     *
     * RENDERING PATTERN:
     * 1. Remove existing element if re-rendering
     * 2. Create new SVG group container
     * 3. Add visual elements (circle, text, etc.)
     * 4. Add event listeners
     * 5. Append to parent
     *
     * @param {SVGElement} parent - Parent SVG element
     * @returns {SVGElement} The created element
     */
    render(parent) {
        // Step 1: Clean up existing element
        if (this.element) {
            this.element.remove();
        }

        // Step 2: Create container group
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.element.setAttribute('id', this.id);
        this.element.setAttribute('transform', `translate(${this.cx.value}, ${this.cy.value})`);

        // Step 3: Create the circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('r', this.radius.value);
        circle.setAttribute('fill', this.fill.value);
        circle.setAttribute('stroke', this.stroke.value);
        circle.setAttribute('stroke-width', this.strokeWidth.value);
        circle.setAttribute('opacity', this.opacity.value);
        circle.style.cursor = 'pointer';
        this.element.appendChild(circle);

        // Step 4: Optional - Add center text/label
        if (this.attributes.label) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('dominant-baseline', 'central');
            text.setAttribute('font-size', Math.max(2, this.radius.value / 3));
            text.setAttribute('fill', 'white');
            text.setAttribute('font-weight', 'bold');
            text.textContent = this.attributes.label;
            this.element.appendChild(text);
        }

        // Step 5: Add event listeners
        this.setupEventListeners(circle);

        // Step 6: Render children (if any)
        this.children.forEach(child => {
            child.render(this.element);
        });

        // Step 7: Append to parent
        parent.appendChild(this.element);

        return this.element;
    }

    /**
     * Set up event listeners for interactivity
     * Separated for clarity and reusability
     *
     * @param {SVGElement} circle - The circle element
     */
    setupEventListeners(circle) {
        // Mouse events
        this.element.addEventListener('mouseenter', () => {
            this.isHovered.value = true;
            circle.setAttribute('fill', this.lightenColor(this.fill.value));
        });

        this.element.addEventListener('mouseleave', () => {
            this.isHovered.value = false;
            circle.setAttribute('fill', this.fill.value);
        });

        this.element.addEventListener('click', (event) => {
            this.onClick(event);
        });

        // Double-click for special behavior
        this.element.addEventListener('dblclick', (event) => {
            this.onDoubleClick(event);
        });
    }

    /**
     * Handle click events
     * Shows how to implement interactive behavior
     */
    onClick(event) {
        // Update click counter
        this.clickCount.value += 1;
        this.plugin.globalClickCount += 1;

        console.log(`Circle clicked! Local: ${this.clickCount.value}, Global: ${this.plugin.globalClickCount}`);

        // Example: Grow circle on click
        this.radius.value = Math.min(this.radius.value * 1.2, 20);

        // Example: Emit custom event for other components
        this.engine.emit('circleClicked', {
            id: this.id,
            clickCount: this.clickCount.value,
            position: { x: this.cx.value, y: this.cy.value }
        });

        // Prevent event bubbling if needed
        event.stopPropagation();
    }

    /**
     * Handle double-click events
     */
    onDoubleClick(event) {
        console.log('Circle double-clicked!');

        // Example: Reset to original size
        const originalRadius = parseFloat(this.attributes.radius || 5);
        this.radius.value = originalRadius;

        // Example: Change color randomly
        const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        this.fill.value = randomColor;
    }

    /**
     * Layout method - called when container resizes
     * Use this for responsive behavior
     *
     * @param {number} containerWidth - Available width
     * @param {number} containerHeight - Available height
     */
    layout(containerWidth, containerHeight) {
        // Example: Keep circle within bounds
        const maxRadius = Math.min(containerWidth, containerHeight) / 10;
        if (this.radius.value > maxRadius) {
            this.radius.value = maxRadius;
        }

        // Example: Responsive positioning
        if (this.attributes.responsive === 'true') {
            this.cx.value = (containerWidth * parseFloat(this.attributes.xPercent || 50)) / 100;
            this.cy.value = (containerHeight * parseFloat(this.attributes.yPercent || 50)) / 100;
        }

        // Call parent layout for children
        super.layout(containerWidth, containerHeight);
    }

    // =============================================================================
    // UTILITY METHODS
    // =============================================================================

    /**
     * Utility: Lighten a color for hover effects
     * @param {string} color - Hex color string
     * @returns {string} Lightened color
     */
    lightenColor(color) {
        // Simple color lightening (could use a proper color library)
        if (color.startsWith('#')) {
            const num = parseInt(color.slice(1), 16);
            const amt = 40;
            const R = (num >> 16) + amt;
            const G = (num >> 8 & 0x00FF) + amt;
            const B = (num & 0x0000FF) + amt;
            return `#${(0x1000000 + (R < 255 ? R : 255) * 0x10000 +
                (G < 255 ? G : 255) * 0x100 + (B < 255 ? B : 255))
                .toString(16).slice(1)}`;
        }
        return color;
    }

    /**
     * Utility: Get current position
     * @returns {Object} Current x, y position
     */
    getPosition() {
        return {
            x: this.cx.value,
            y: this.cy.value
        };
    }

    /**
     * Utility: Move circle to new position with animation
     * @param {number} newX - New X coordinate
     * @param {number} newY - New Y coordinate
     * @param {number} duration - Animation duration in ms
     */
    animateToPosition(newX, newY, duration = 300) {
        const startX = this.cx.value;
        const startY = this.cy.value;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - progress, 3);

            this.cx.value = startX + (newX - startX) * eased;
            this.cy.value = startY + (newY - startY) * eased;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
}

// =============================================================================
// STEP 3: REGISTRATION AND USAGE
// =============================================================================

/**
 * REGISTERING THE PLUGIN:
 *
 * // In your main application:
 * const circlePlugin = new CircleComponentPlugin();
 * widgetEngine.registerComponentPlugin('Circle', circlePlugin);
 * widgetEngine.start();
 */

/**
 * XML USAGE EXAMPLES:
 *
 * <!-- Basic circle -->
 * <Circle radius="10" cx="50" cy="50" fill="#ff0000" />
 *
 * <!-- Circle with label -->
 * <Circle radius="15" cx="25" cy="25" fill="#00ff00" label="A" />
 *
 * <!-- Responsive circle -->
 * <Circle radius="8" xPercent="75" yPercent="75" responsive="true" />
 *
 * <!-- Circle in a layout -->
 * <VGroup gap="5">
 *   <Circle radius="5" fill="#007bff" label="1" />
 *   <Circle radius="7" fill="#28a745" label="2" />
 *   <Circle radius="6" fill="#dc3545" label="3" />
 * </VGroup>
 *
 * <!-- Advanced circle with custom properties -->
 * <Circle
 *   radius="12"
 *   cx="50"
 *   cy="50"
 *   fill="#6f42c1"
 *   stroke="#495057"
 *   strokeWidth="2"
 *   opacity="0.8"
 *   label="Click me!"
 *   responsive="true"
 *   xPercent="50"
 *   yPercent="30" />
 */

/**
 * HELPFUL DEVELOPMENT HINTS:
 *
 * 1. DEBUGGING:
 *    - Use console.log in render() to track component creation
 *    - Use browser dev tools to inspect SVG elements
 *    - Add data attributes for easier debugging: element.setAttribute('data-debug', this.id)
 *
 * 2. PERFORMANCE:
 *    - Avoid creating elements in every layout() call
 *    - Use requestAnimationFrame for smooth animations
 *    - Debounce expensive operations (resize, etc.)
 *
 * 3. REACTIVE PATTERNS:
 *    - Always use .value when setting signals
 *    - Subscribe to signals for side effects
 *    - Unsubscribe in cleanup to prevent memory leaks
 *
 * 4. SVG BEST PRACTICES:
 *    - Use groups (g) for complex components
 *    - Set viewBox for scalability
 *    - Use transforms for positioning
 *    - Prefer CSS classes over inline styles
 *
 * 5. ERROR HANDLING:
 *    - Validate attributes in constructor
 *    - Provide sensible defaults
 *    - Guard against invalid values
 *    - Log warnings for developer feedback
 *
 * 6. TESTING:
 *    - Test with minimal XML attributes
 *    - Test responsive behavior
 *    - Test signal updates
 *    - Test cleanup (start/stop cycles)
 *
 * 7. EXTENSIBILITY:
 *    - Design for inheritance (protected methods)
 *    - Use composition over inheritance when possible
 *    - Provide hooks for customization
 *    - Document public API clearly
 */

/**
 * COMMON PITFALLS TO AVOID:
 *
 * 1. Don't forget to call super() in constructor
 * 2. Don't create SVG elements without namespace
 * 3. Don't forget to remove event listeners in stop()
 * 4. Don't mutate signals directly (always use .value)
 * 5. Don't forget to handle missing attributes gracefully
 * 6. Don't create memory leaks with uncleaned subscriptions
 * 7. Don't forget to call parent.appendChild(this.element)
 */
