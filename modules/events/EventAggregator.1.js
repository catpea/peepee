import { EventEmitter } from 'events';

/**
 * Generic Event Aggregator - Waits for multiple events before emitting completion
 *
 * Perfect for scenarios where you need to wait for N events with specific criteria
 * before proceeding. Much simpler than saga pattern for basic coordination.
 */
class EventAggregator extends EventEmitter {
  constructor() {
    super();
    this.aggregations = new Map(); // aggregationId -> aggregation config
    this.eventCache = new Map(); // eventType -> array of cached events
    this.sequenceNumber = 0;
  }

  /**
   * Define an aggregation - what events to wait for and how to match them
   * @param {string} aggregationId - Unique identifier for this aggregation
   * @param {Object} config - Configuration object
   */
  define(aggregationId, config) {
    const {
      events = [], // Array of event definitions to wait for
      timeout = 300000, // 5 minutes default
      onComplete = null, // Function to call when all events collected
      onTimeout = null, // Function to call on timeout
      onPartialMatch = null, // Function to call when some events match
      cacheEvents = false, // Whether to cache events for late joiners
      allowDuplicates = false, // Whether to allow multiple events of same type
      correlationKey = null, // Key to correlate events (optional)
      correlationValue = null // Value to match correlation key against
    } = config;

    const aggregation = {
      aggregationId,
      events: events.map((event, index) => ({
        eventType: event.eventType,
        filter: event.filter || (() => true),
        alias: event.alias || `event_${index}`,
        required: event.required !== false,
        multiple: event.multiple === true, // Can capture multiple events of this type
        timeout: event.timeout || timeout
      })),
      timeout,
      onComplete,
      onTimeout,
      onPartialMatch,
      cacheEvents,
      allowDuplicates,
      correlationKey,
      correlationValue,
      state: 'WAITING',
      capturedEvents: new Map(), // alias -> event data (or array if multiple)
      requiredEvents: new Set(),
      startedAt: new Date(),
      timeoutHandle: null
    };

    // Set up required events tracking
    aggregation.requiredEvents = new Set(
      aggregation.events
        .filter(event => event.required)
        .map(event => event.alias)
    );

    this.aggregations.set(aggregationId, aggregation);

    // Set up event listeners
    for (const eventDef of aggregation.events) {
      this._setupEventListener(aggregationId, eventDef);
    }

    // Set up timeout
    if (aggregation.timeout > 0) {
      aggregation.timeoutHandle = setTimeout(() => {
        this._handleTimeout(aggregationId);
      }, aggregation.timeout);
    }

    // Check cached events if enabled
    if (cacheEvents) {
      this._checkCachedEvents(aggregationId);
    }

    return this;
  }

  /**
   * Start waiting for events with a specific correlation value
   * @param {string} aggregationId - ID of the aggregation definition
   * @param {string} correlationValue - Value to correlate events with
   * @param {Object} initialData - Initial data to include in completion
   */
  start(aggregationId, correlationValue, initialData = {}) {
    const template = this.aggregations.get(aggregationId);
    if (!template) {
      throw new Error(`Aggregation '${aggregationId}' not defined`);
    }

    const instanceId = `${aggregationId}-${correlationValue}-${Date.now()}`;

    // Clone the template for this instance
    const instance = {
      ...template,
      instanceId,
      correlationValue,
      initialData,
      capturedEvents: new Map(),
      requiredEvents: new Set(template.requiredEvents),
      startedAt: new Date(),
      state: 'WAITING'
    };

    // Set up timeout for this instance
    if (instance.timeout > 0) {
      instance.timeoutHandle = setTimeout(() => {
        this._handleTimeout(instanceId);
      }, instance.timeout);
    }

    this.aggregations.set(instanceId, instance);

    this.emit('aggregationStarted', {
      instanceId,
      aggregationId,
      correlationValue,
      requiredEvents: Array.from(instance.requiredEvents)
    });

    return instanceId;
  }

  /**
   * Set up event listener for a specific event type
   */
  _setupEventListener(aggregationId, eventDef) {
    const handler = (eventData) => {
      this._handleEvent(eventDef, eventData);
    };

    // Store handler reference for cleanup
    if (!this.eventListeners) {
      this.eventListeners = new Map();
    }

    const key = `${aggregationId}-${eventDef.eventType}`;
    this.eventListeners.set(key, handler);
    this.on(eventDef.eventType, handler);
  }

  /**
   * Handle incoming events
   */
  _handleEvent(eventDef, eventData) {
    const eventRecord = {
      eventType: eventDef.eventType,
      eventData,
      receivedAt: new Date(),
      sequenceNumber: ++this.sequenceNumber
    };

    // Cache event if caching is enabled
    if (this.cacheEvents) {
      if (!this.eventCache.has(eventDef.eventType)) {
        this.eventCache.set(eventDef.eventType, []);
      }
      this.eventCache.get(eventDef.eventType).push(eventRecord);
    }

    // Check all active aggregations
    for (const [instanceId, aggregation] of this.aggregations) {
      if (aggregation.state !== 'WAITING') continue;

      // Check if this event matches any of the aggregation's requirements
      const matchingEventDef = aggregation.events.find(e =>
        e.eventType === eventDef.eventType && e.filter(eventData, aggregation.initialData)
      );

      if (!matchingEventDef) continue;

      // Check correlation if specified
      if (aggregation.correlationKey && aggregation.correlationValue) {
        const eventCorrelationValue = eventData[aggregation.correlationKey];
        if (eventCorrelationValue !== aggregation.correlationValue) {
          continue;
        }
      }

      this._captureEvent(instanceId, matchingEventDef, eventRecord);
    }
  }

  /**
   * Capture an event for an aggregation
   */
  _captureEvent(instanceId, eventDef, eventRecord) {
    const aggregation = this.aggregations.get(instanceId);

    if (eventDef.multiple) {
      // Handle multiple events of the same type
      if (!aggregation.capturedEvents.has(eventDef.alias)) {
        aggregation.capturedEvents.set(eventDef.alias, []);
      }
      aggregation.capturedEvents.get(eventDef.alias).push(eventRecord);
    } else {
      // Handle single event
      if (aggregation.capturedEvents.has(eventDef.alias) && !aggregation.allowDuplicates) {
        return; // Already captured and duplicates not allowed
      }
      aggregation.capturedEvents.set(eventDef.alias, eventRecord);
    }

    // Mark as captured
    aggregation.requiredEvents.delete(eventDef.alias);

    this.emit('eventCaptured', {
      instanceId,
      aggregationId: aggregation.aggregationId,
      eventType: eventDef.eventType,
      alias: eventDef.alias,
      capturedCount: aggregation.capturedEvents.size,
      requiredCount: aggregation.requiredEvents.size,
      isComplete: aggregation.requiredEvents.size === 0
    });

    // Call partial match handler if provided
    if (aggregation.onPartialMatch) {
      try {
        aggregation.onPartialMatch({
          instanceId,
          alias: eventDef.alias,
          eventData: eventRecord.eventData,
          capturedEvents: Object.fromEntries(aggregation.capturedEvents),
          remainingEvents: Array.from(aggregation.requiredEvents)
        });
      } catch (error) {
        this.emit('partialMatchError', { instanceId, error });
      }
    }

    // Check for completion
    this._checkCompletion(instanceId);
  }

  /**
   * Check if aggregation is complete
   */
  _checkCompletion(instanceId) {
    const aggregation = this.aggregations.get(instanceId);

    if (aggregation.requiredEvents.size === 0) {
      this._completeAggregation(instanceId);
    }
  }

  /**
   * Complete an aggregation
   */
  async _completeAggregation(instanceId) {
    const aggregation = this.aggregations.get(instanceId);

    aggregation.state = 'COMPLETED';
    aggregation.completedAt = new Date();

    // Clear timeout
    if (aggregation.timeoutHandle) {
      clearTimeout(aggregation.timeoutHandle);
    }

    const completionData = {
      instanceId,
      aggregationId: aggregation.aggregationId,
      correlationValue: aggregation.correlationValue,
      initialData: aggregation.initialData,
      capturedEvents: Object.fromEntries(aggregation.capturedEvents),
      duration: aggregation.completedAt - aggregation.startedAt,
      completedAt: aggregation.completedAt
    };

    // Execute completion handler
    if (aggregation.onComplete) {
      try {
        await aggregation.onComplete(completionData);
      } catch (error) {
        this.emit('completionError', { instanceId, error });
      }
    }

    this.emit('aggregationCompleted', completionData);

    // Clean up after a delay
    setTimeout(() => {
      this.aggregations.delete(instanceId);
    }, 60000); // 1 minute
  }

  /**
   * Handle timeout
   */
  async _handleTimeout(instanceId) {
    const aggregation = this.aggregations.get(instanceId);
    if (!aggregation || aggregation.state !== 'WAITING') return;

    aggregation.state = 'TIMED_OUT';
    aggregation.timedOutAt = new Date();

    const timeoutData = {
      instanceId,
      aggregationId: aggregation.aggregationId,
      correlationValue: aggregation.correlationValue,
      capturedEvents: Object.fromEntries(aggregation.capturedEvents),
      missingEvents: Array.from(aggregation.requiredEvents),
      duration: aggregation.timedOutAt - aggregation.startedAt
    };

    if (aggregation.onTimeout) {
      try {
        await aggregation.onTimeout(timeoutData);
      } catch (error) {
        this.emit('timeoutError', { instanceId, error });
      }
    }

    this.emit('aggregationTimedOut', timeoutData);
  }

  /**
   * Check cached events for a new aggregation
   */
  _checkCachedEvents(aggregationId) {
    const aggregation = this.aggregations.get(aggregationId);

    for (const eventDef of aggregation.events) {
      const cachedEvents = this.eventCache.get(eventDef.eventType) || [];

      for (const eventRecord of cachedEvents) {
        if (eventDef.filter(eventRecord.eventData, aggregation.initialData)) {
          this._captureEvent(aggregationId, eventDef, eventRecord);
        }
      }
    }
  }

  /**
   * Get aggregation status
   */
  getAggregation(instanceId) {
    return this.aggregations.get(instanceId);
  }

  /**
   * Get all active aggregations
   */
  getActiveAggregations() {
    return Array.from(this.aggregations.values())
      .filter(agg => agg.state === 'WAITING');
  }

  /**
   * Cancel an aggregation
   */
  cancel(instanceId) {
    const aggregation = this.aggregations.get(instanceId);
    if (!aggregation || aggregation.state !== 'WAITING') return false;

    aggregation.state = 'CANCELLED';
    if (aggregation.timeoutHandle) {
      clearTimeout(aggregation.timeoutHandle);
    }

    this.emit('aggregationCancelled', { instanceId });
    return true;
  }

  /**
   * Clean up old completed aggregations
   */
  cleanup(maxAge = 3600000) { // 1 hour default
    const now = Date.now();
    const toDelete = [];

    for (const [instanceId, aggregation] of this.aggregations) {
      const age = now - aggregation.startedAt.getTime();
      if (aggregation.state !== 'WAITING' && age > maxAge) {
        toDelete.push(instanceId);
      }
    }

    for (const instanceId of toDelete) {
      this.aggregations.delete(instanceId);
    }

    return toDelete.length;
  }
}

export default EventAggregator;

/* Example Usage:

const aggregator = new EventAggregator();

// Define a connection ready aggregation that works for any connection
aggregator.define('connectionReady', {
  events: [
    {
      eventType: 'portAdded',
      filter: (data, context) => data.id === context.fromPortId,
      alias: 'fromPort'
    },
    {
      eventType: 'portAdded',
      filter: (data, context) => data.id === context.toPortId,
      alias: 'toPort'
    }
  ],
  timeout: 30000,
  onComplete: (data) => {
    console.log('Connection ready!', data);
    aggregator.emit('connectionReady', {
      connectionId: data.correlationValue,
      fromPortId: data.initialData.fromPortId,
      toPortId: data.initialData.toPortId,
      fromPort: data.capturedEvents.fromPort.eventData,
      toPort: data.capturedEvents.toPort.eventData
    });
  }
});

// Start waiting for a specific connection - pass context as initialData
const instanceId = aggregator.start('connectionReady', 'conn-123', {
  fromPortId: 'port-1',
  toPortId: 'port-2'
});

// Emit events - filters will use the context to match
aggregator.emit('portAdded', { id: 'port-1', type: 'input' });
aggregator.emit('portAdded', { id: 'port-2', type: 'output' });
// -> Will emit 'connectionReady' event

*/
