
export const manifest = {
  map:{
    key: "map",
    name: "Map",
    description: "Transforms each value emitted by the source signal using a provided function",
    properties: [{ key: "predicate", name: "Map Function Predicate", description: "Function to transform each emitted value", ports: [{ key: "fn" }] }],
    inputs: [{ key: "source", name: "Source Signal", description: "Input signal to transform" }],
    outputs: [{ key: "result", name: "Mapped Signal", description: "Signal with transformed values" }],
  },
  combineLatest:{
    key: "combineLatest",
    name: "Combine Latest",
    description: "Combines the latest values from multiple signals into a single signal",
    properties: [],
    inputs: [{ key: "signals", name: "Source Signals", description: "Array of signals to combine" }],
    outputs: [{ key: "result", name: "Combined Signal", description: "Signal emitting array of latest values from all input signals" }],
  },
  fromEvent:{
    key: "fromEvent",
    name: "From Event",
    description: "Creates a signal from DOM events on a specified element",
    properties: [
      { key: "element", name: "HTML Element", description: "DOM element to listen for events on", ports: [{ key: "el" }] },
      { key: "event", name: "Event Name", description: 'Name of the DOM event to listen for (e.g., "click", "input")', ports: [{ key: "name" }] },
    ],
    inputs: [],
    outputs: [{ key: "result", name: "Event Signal", description: "Signal that emits DOM event objects when the specified event occurs" }],
  },
  toTextContentOf:{
    key: "toTextContentOf",
    name: "To textContent Of",
    description: "Updates the textContent of an HTML element whenever the source signal emits a value",
    properties: [{ key: "element", name: "HTML Element", description: "DOM element whose textContent will be updated", ports: [{ key: "el" }] }],
    inputs: [{ key: "signal", name: "Source Signal", description: "Signal whose values will be displayed as textContent in the target element" }],
    outputs: [],
  },
  toSignal:{
    key: "toSignal",
    name: "To Signal",
    description: "Forwards values from a source signal to a destination signal, creating a signal bridge",
    properties: [],
    inputs: [
      { key: "source", name: "Source Signal", description: "Signal to read values from" },
      { key: "destination", name: "Destination Signal", description: "Signal to forward values to" },
    ],
    outputs: [{ key: "result", name: "Destination Signal Reference", description: "Reference to the destination signal for chaining" }],
  },
  filter:{
    key: "filter",
    name: "Filter",
    description: "Emits only those values from the source signal that pass a predicate test",
    properties: [{ key: "predicate", name: "Filter Predicate", description: "Function that returns true for values to keep", ports: [{ key: "fn" }] }],
    inputs: [{ key: "source", name: "Source Signal", description: "Input signal to filter" }],
    outputs: [{ key: "result", name: "Filtered Signal", description: "Signal containing only values that passed the predicate test" }],
  },
  debounceTime:{
    key: "debounceTime",
    name: "Debounce Time",
    description: "Delays emissions from the source signal until a specified time has passed without another emission",
    properties: [{ key: "delay", name: "Delay (ms)", description: "Time in milliseconds to wait before emitting", ports: [{ key: "ms" }] }],
    inputs: [{ key: "source", name: "Source Signal", description: "Input signal to debounce" }],
    outputs: [{ key: "result", name: "Debounced Signal", description: "Signal with debounced emissions" }],
  },
  distinctUntilChanged:{
    key: "distinctUntilChanged",
    name: "Distinct Until Changed",
    description: "Only emits when the current value is different from the previous value",
    properties: [],
    inputs: [{ key: "source", name: "Source Signal", description: "Input signal to filter for distinct values" }],
    outputs: [{ key: "result", name: "Distinct Signal", description: "Signal that only emits when values change" }],
  },
  startWith:{
    key: "startWith",
    name: "Start With",
    description: "Emits specified initial values before emitting values from the source signal",
    properties: [{ key: "initialValue", name: "Initial Value", description: "Value to emit first", ports: [{ key: "value" }] }],
    inputs: [{ key: "source", name: "Source Signal", description: "Signal to prepend initial value to" }],
    outputs: [{ key: "result", name: "Signal With Initial Value", description: "Signal that starts with the initial value" }],
  },
  scan:{
    key: "scan",
    name: "Scan",
    description: "Applies an accumulator function to each value and emits the accumulated result",
    properties: [
      { key: "accumulator", name: "Accumulator Function", description: "Function to accumulate values (acc, current) => newAcc", ports: [{ key: "fn" }] },
      { key: "initialValue", name: "Initial Value", description: "Starting value for accumulation", ports: [{ key: "seed" }] },
    ],
    inputs: [{ key: "source", name: "Source Signal", description: "Input signal to accumulate" }],
    outputs: [{ key: "result", name: "Accumulated Signal", description: "Signal emitting accumulated values" }],
  },
  merge:{
    key: "merge",
    name: "Merge",
    description: "Combines multiple signals into one by emitting values from any source signal as they arrive",
    properties: [],
    inputs: [{ key: "signals", name: "Source Signals", description: "Array of signals to merge" }],
    outputs: [{ key: "result", name: "Merged Signal", description: "Signal emitting values from all input signals" }],
  },
  switchMap:{
    key: "switchMap",
    name: "Switch Map",
    description: "Maps each value to a new signal and switches to the latest inner signal, cancelling previous ones",
    properties: [{ key: "project", name: "Project Function", description: "Function that maps values to signals", ports: [{ key: "fn" }] }],
    inputs: [{ key: "source", name: "Source Signal", description: "Input signal to switch map" }],
    outputs: [{ key: "result", name: "Switched Signal", description: "Signal from the latest projected inner signal" }],
  },
  take:{
    key: "take",
    name: "Take",
    description: "Emits only the first n values from the source signal, then completes",
    properties: [{ key: "count", name: "Count", description: "Number of values to take", ports: [{ key: "n" }] }],
    inputs: [{ key: "source", name: "Source Signal", description: "Input signal to take values from" }],
    outputs: [{ key: "result", name: "Limited Signal", description: "Signal containing only the first n values" }],
  },
  tap:{
    key: "tap",
    name: "Tap",
    description: "Performs side effects with each emitted value without modifying the signal stream",
    properties: [{ key: "sideEffect", name: "Side Effect Function", description: "Function to execute for each value (for debugging/logging)", ports: [{ key: "fn" }] }],
    inputs: [{ key: "source", name: "Source Signal", description: "Input signal to tap into" }],
    outputs: [{ key: "result", name: "Tapped Signal", description: "Original signal passed through unchanged" }],
  },
 fromValue:{
    key: "fromValue",
    name: "From Value",
    description: "Creates a signal that emits a single static value",
    properties: [{ key: "value", name: "Static Value", description: "Value to emit", ports: [{ key: "val" }] }],
    inputs: [],
    outputs: [{ key: "result", name: "Value Signal", description: "Signal that emits the specified value" }],
  },
  interval:{
    key: "interval",
    name: "Interval",
    description: "Creates a signal that emits sequential numbers at specified time intervals",
    properties: [{ key: "period", name: "Interval (ms)", description: "Time between emissions in milliseconds", ports: [{ key: "ms" }] }],
    inputs: [],
    outputs: [{ key: "result", name: "Interval Signal", description: "Signal emitting incremental numbers at regular intervals" }],
  },
};

let id = 1;
function generateId() {
  // const randomChars = (length = 8) => Array.from({ length }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
  // return `${randomChars()}-${randomChars(4)}-${randomChars(4)}-${randomChars(4)}-${randomChars(12)}`;
  return 'id'+id++;
}

class Graph {
  #nodes = new Map();
  #edges = new Map();

  add(id, node, label = "unnamed") {
    const data = { label, node };
    this.#nodes.set(id, data);
    return () => this.remove(id);
  }
  remove(id) {
    this.#nodes.delete(id);
  }

  connect(from, to, label = "relation") {
    if (from == null) throw new Error(`from may not be nullish`);
    if (to == null) throw new Error(`to may not be nullish`);

    const id = generateId();
    const data = { from, to, label };
    this.#edges.set(id, data);
    return () => this.disconnect(from, to, label);
  }

  disconnect(from, to, label = "relation") {
    const id = `${label}::${from}::${to}`;
    this.#edges.delete(id);
  }

  debug() {

    // Build adjacency list from edges
    const adjacencyList = new Map();
    const incomingEdges = new Map();

    // Initialize adjacency list for all nodes
    for (const nodeId of this.#nodes.keys()) {
      adjacencyList.set(nodeId, []);
      incomingEdges.set(nodeId, 0);
    }

    // Populate adjacency list and count incoming edges
    for (const [edgeId, edgeData] of this.#edges) {
      const { from, to, name } = edgeData;
      if (!adjacencyList.has(from)) adjacencyList.set(from, []);
      if (!adjacencyList.has(to)) adjacencyList.set(to, []);

      adjacencyList.get(from).push({ to, label: name || "relation" });
      incomingEdges.set(to, (incomingEdges.get(to) || 0) + 1);
    }

    // console.log(incomingEdges)
    // Find root nodes (nodes with no incoming edges)
    const rootNodes = [];
    for (const [nodeId, incomingCount] of incomingEdges) {
      if (incomingCount === 0) {
        rootNodes.push(nodeId);
      }
    }

    // If no root nodes found (circular graph), pick arbitrary starting points
    if (rootNodes.length === 0 && this.#nodes.size > 0) {
      rootNodes.push(this.#nodes.keys().next().value);
    }

    const visited = new Set();
    const rendering = new Set(); // Track nodes currently being rendered to detect cycles
    let output = [];

    const renderNode = (nodeId, prefix = "", isLast = true, depth = 0) => {
      // Prevent infinite recursion on cycles
      if (rendering.has(nodeId)) {
        output.push(prefix + (isLast ? "└─ " : "├─ ") + `${nodeId} [CYCLE]`);
        return;
      }

      // Prevent excessive depth
      if (depth > 10) {
        output.push(prefix + (isLast ? "└─ " : "├─ ") + `${nodeId} [MAX_DEPTH]`);
        return;
      }

      rendering.add(nodeId);

      const nodeData = this.#nodes.get(nodeId);
      const nodeLabel = (nodeData ? `${nodeData.label}` : nodeId ) + ' = ' + nodeData.node.value;

      output.push(prefix + (isLast ? "└─ " : "├─ ") + nodeLabel);

      const children = adjacencyList.get(nodeId) || [];
      const nextPrefix = prefix + (isLast ? "   " : "│  ");

      children.forEach((child, index) => {
        const childIsLast = index === children.length - 1;
        const edgeLabel = child.label !== "relation" ? `[${child.label}]` : "";

        if (edgeLabel) {
          output.push(nextPrefix + (childIsLast ? "└─ " : "├─ ") + edgeLabel);
          renderNode(child.to, nextPrefix + (childIsLast ? "   " : "│  "), true, depth + 1);
        } else {
          renderNode(child.to, nextPrefix, childIsLast, depth + 1);
        }
      });

      rendering.delete(nodeId);
    };

    // Render all root nodes
    if (rootNodes.length === 0) {
      output.push("(empty graph)");
    } else {
      rootNodes.forEach((rootId, index) => {
        const isLastRoot = index === rootNodes.length - 1;
        renderNode(rootId, "", isLastRoot);

        // Add spacing between multiple root trees
        if (!isLastRoot) {
          output.push("");
        }
      });
    }

    // Show any orphaned nodes that weren't reached
    const reachedNodes = new Set();
    const collectReached = (nodeId) => {
      if (reachedNodes.has(nodeId)) return;
      reachedNodes.add(nodeId);
      const children = adjacencyList.get(nodeId) || [];
      children.forEach((child) => collectReached(child.to));
    };

    rootNodes.forEach(collectReached);

    const orphanedNodes = [...this.#nodes.keys()].filter((id) => !reachedNodes.has(id));
    if (orphanedNodes.length > 0) {
      output.push("");
      output.push("Orphaned nodes:");
      orphanedNodes.forEach((nodeId, index) => {
        const isLast = index === orphanedNodes.length - 1;
        const nodeData = this.#nodes.get(nodeId);
        const nodeLabel = nodeData ? `${nodeData.label}` : nodeId;
        output.push((isLast ? "└─ " : "├─ ") + nodeLabel);
      });
    }

    console.log(output.join("\n"));
  }
}

const graph = new Graph();
globalThis.signalGraph = graph;

export class Pulse {
  #id;
  #value;
  #subscribers;
  #disposables;

  constructor(value, {id, label}={label:'unlabeled'}) {
    this.#id = id??generateId();
    this.#value = value;
    this.#subscribers = new Set();
    this.#disposables = new Set();
    graph.add(this.#id, this, label + ':' + this.#id);
  }
  get id(){ return this.#id}
  get value() {
    return this.#value;
  }

  set value(newValue) {
    if (newValue == this.#value) return; // IMPORTANT FEATURE: if value is the same, exit early, don't disturb if you don't need to
    this.#value = newValue;
    this.notify(); // all observers
  }

  subscribe(subscriber) {
    if (this.#value != null) subscriber(this.#value); // IMPORTANT FEATURE: instant notification (initialization on subscribe), but don't notify on null/undefined, predicate functions will look simpler, less error prone
    this.#subscribers.add(subscriber);
    return () => this.#subscribers.delete(subscriber); // IMPORTANT FEATURE: return unsubscribe function, execute this to stop getting notifications.
  }

  notify() {
    for (const subscriber of this.#subscribers) subscriber(this.#value);
  }

  clear() {
    // shutdown procedure
    this.#subscribers.clear(); // destroy subscribers
    this.#disposables.forEach((disposable) => disposable());
    this.#disposables.clear(); // execute and clear disposables
    graph.remove(this.#id);
  }

  // add related trash that makes sense to clean when the signal is shutdown
  collect(...input) {
    [input].flat(Infinity).forEach((disposable) => this.#disposables.add(disposable));
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "string") {
      return this.#id;
    } else if (hint === "number") {
      return 0;
    }
    return this.#id; // default case
  }
}

export class Signal extends Pulse {
  map(fn) {
    return map(this, fn);
  }
  filter(fn) {
    return filter(this, fn);
  }
  combineLatest(...signals) {
    return combineLatest(this, ...signals);
  }

  ///

  scan(accumulator, seed) {}
  debounce(ms) {}
  delay(ms) {}
  throttle(ms) {}
  merge(signal) {}

  // NOTE: to* methods return subscriptions not signals
  toInnerTextOf(el) {
    return toInnerTextOf(this, el);
  }

  toSignal(destination) {
    return toSignal(this, destination);
  }
}

// THIS IS THE MAP FUNCTION, it can be used standalone as map(usernameSignal, v=>`Hello ${v}`),
// but it looks nicer when you use the method: usernameSignal.map(v=>`Hello ${v}`).subscribe(v=>console.log(v))

export function map(parent, map) {
  const child = new Signal(undefined, {name: manifest.map.name});
  const subscription = parent.subscribe((v) => (child.value = map(v)));
  child.collect(subscription);
  const disconnect = graph.connect(parent.id, child.id, "map");
  child.collect(disconnect);
  return child;
}

export function filter(parent, test) {
  const child = new Signal(undefined, {name: manifest.filter.name});
  const subscription = parent.subscribe((v) => {
    if (test(v)) {
      child.value = v;
    }
  });
  child.collect(subscription);
  const disconnect = graph.connect(parent.id, child.id, "filter");
  child.collect(disconnect);
  return child;
}

export function combineLatest(...parents) {
  const child = new Signal(undefined,{name: manifest.combineLatest.name});
  const updateCombinedValue = () => {
    const values = [...parents.map((signal) => signal.value)];
    const nullish = values.some((value) => value == null);
    if (!nullish) child.value = values;
  };
  const subscriptions = parents.map((signal) => signal.subscribe(updateCombinedValue));
  child.collect(subscriptions);
  const disconnections = parents.map((parent) => graph.connect(parent.id, child.id, "combineLatest"));
  child.collect(disconnections);
  return child;
}

// INTEGRATIONS

export function fromEvent(el, eventType, options = {}) {
  const child = new Signal();
  const handler = (event) => (child.value = event);
  el.addEventListener(eventType, handler, options);
  child.collect(() => el.removeEventListener(eventType, handler, options));
  return child;
}

// SUBSCRIPTIONS = NOTE: to* functions return subscriptions not signals

export function toInnerTextOf(signal, el) {
  const subscription = signal.subscribe((v) => (el.innerText = v));
  return subscription;
}

export function toSignal(source, destination) {
  const subscription = source.subscribe((v) => (destination.value = v));
  return subscription;
}

export function fromBetweenEvents(startElement, startEvent, endElement, endEvent) {
  const child = new Signal();
  let hasActivated = false;
  const handleDown = () => { hasActivated = true; child.value = true; };
  const handleUp = () => { if(hasActivated){ child.value = false; hasActivated = false; }
  };
  // Add event listeners
  startElement.addEventListener(startEvent, handleDown);
  endElement.addEventListener(endEvent, handleUp);
  // Cleanup function to remove event listeners
  const cleanup = () => {
    startElement.removeEventListener(startEvent, handleDown);
    endElement.removeEventListener(endEvent, handleUp);
  };
  child.collect(cleanup);
  return child;
}



// function main() {
//   const count1 = new Signal(1, {name: 'count1'});
//   const count2 = new Signal(0, {name: 'count2'});
//   combineLatest(count1, count2)
//     .map(([value1, value2]) => value1 + value2)
//     .subscribe(console.log);
//   graph.print();
// }

// main();
