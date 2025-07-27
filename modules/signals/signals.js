import { zip, get } from "utils";

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
  log(...a) { return log(this, ...a) }
  map(fn) { return map(this, fn) }
  filter(fn) { return filter(this, fn) }
  combineLatest(...signals) { return combineLatest(this, ...signals) }
  // flat(...signals) { return combineLatest(this, ...signals) }
  switchMap(mapperFn) { return switchMap(this, mapperFn) }
  scan(reducerFn, initialValue) { return scan(this, reducerFn, initialValue) }
  everyFilter(condition){ return everyFilter(this, condition) }
  debounce(ms) {}
  delay(ms) {}
  throttle(ms) {}
  merge(signal) {}

  // NOTE: to* methods return subscriptions not signals
  toInnerTextOf(el) { return toInnerTextOf(this, el); }
  toSignal(destination) { return toSignal(this, destination); }
  toEvent(bus, eventName) { return toEvent(this, bus, eventName); }
}

// THIS IS THE MAP FUNCTION, it can be used standalone as map(usernameSignal, v=>`Hello ${v}`),
// but it looks nicer when you use the method: usernameSignal.map(v=>`Hello ${v}`).subscribe(v=>console.log(v))

export function log(parent, ...args) {
  const child = new Signal(undefined, {name: manifest.filter.name});
  const subscription = parent.subscribe((v) => {
    console.log(...args, v);
    child.value = v;
  });
  child.collect(subscription);
  child.collect(graph.connect(parent.id, child.id, "filter"));
  return child;
}
export function filter(parent, test) {
  const child = new Signal(undefined, {name: manifest.filter.name});
  const subscription = parent.subscribe((v) => { if (test(v)) { child.value = v; } });
  child.collect(subscription);
  child.collect(graph.connect(parent.id, child.id, "filter"));
  return child;
}

export function map(parent, map) {
  const child = new Signal(undefined, {name: manifest.map.name});
  const subscription = parent.subscribe((v) => (child.value = map(v)));
  child.collect(subscription);
  child.collect(graph.connect(parent.id, child.id, "map"));
  return child;
}

export function everyFilter(parent, condition) {
  // every = pass the text
  // filter = drop packet if no pass
  // this exists because every alone could only rerturn True or False, which would replace the packet with boolean, but now the packet passes only if condition is true
  const child = new Signal(undefined, {name: 'Every Filter'});
  const subscription = parent.subscribe(v => {
    if (v.every(condition)){
      child.value = v;
    }
  });
  child.collect(subscription);
  child.collect(graph.connect(parent.id, child.id, "everyFilter"));
  return child;
}


export function correlateEvents(eventEmitter, ...events){
  //NOTE: format of events: [ { alias:'station', name:'stationAdded', correlationField:'id' }, ...]
  const cache = new Map();
  const child = new Signal(undefined, {name: 'Correlate Events'});


  // NOTE:
  // NOTE:
  const updateCorrelatedValue = (event, data) => {
    const id = data.id;
    // console.log('HHH correlateEvents->updateCorrelatedValue', id);

    if(!cache.has(id)){
      const signalMap = new Map( events.map(event=>[event.name, new Signal()]) )
      const unsubscription = combineLatest(...signalMap.values())
        .everyFilter((o) => o) // every value must be truthy, if every returned false STOP HERE
        // .log('HHH 111', events.map(event=>event.alias))
        // .log('HHH 111', signalMap.values())
        .map(() => Object.fromEntries(   zip(   events.map(event=>event.alias), [...signalMap.values().map(s=>s.value)] )) )
        // .log('HHH 111')
        .subscribe(v=>child.value=v);
      child.collect(unsubscription);
      cache.set(id, signalMap);
    }
    // console.log('HHH correlateEvents assign to signal', id, event.name, data)
    cache.get(id).get(event.name).value = data;
  };

  // pipe events from the bus into the signal system.
  const eventListeners = events.map( event =>  eventEmitter.on(event.name, data=> updateCorrelatedValue(event, data)) );
  child.collect(eventListeners);
  child.collect(()=>cache.clear());

  // const ttl = 2_000;
  // for (const event of events){
  //   const timeoutId = setTimeout(() => { console.warn(`Timeout for ${event.name} executed :(`) }, ttl);
  //   eventEmitter.on(event.name, () => {
  //      // console.info(`Timeout cleared for ${event.name} executed :)`)
  //     clearTimeout(timeoutId);
  //   });
  // }


  // memory management
  // child.collect(graph.connect(parent.id, child.id, "correlateEvents"));
  return child;

}

export function correlateSignals(...signalDescriptors){
      const cache = new Map();
      const child = new Signal(undefined, {name: 'Correlate Signals'});
      const processSignal = (descriptor, index) => {

        const unsubscription = descriptor.signal.subscribe(value=>{
          const id = get(value, descriptor.correlationField, null);

          if(id==null) {
            console.error('failed to retrieve id from correlationField', id, descriptor.correlationField, value);
            console.error(value.station );
            console.error(value.station.agentType);
          }
          if(id==null) throw new Error('failed to retrieve id from correlationField');

          if(!cache.has(id)){
            const signalMap = [...signalDescriptors.map(()=>new Signal())];
            const unsubscription = combineLatest(...signalMap )
              .everyFilter((o) => o) // every value must be truthy, if every returned false STOP HERE
              .map( a => Object.assign({}, ...a))
              .subscribe(v=>child.value=v);
            child.collect(unsubscription);
            cache.set(id, signalMap);
          } //!
          // console.error('MISSING SIGNAL DATA, monitor whgat signal we are waiting for')
          cache.get(id)[index].value = value;
        });
       return unsubscription;
      };
      const subscriptions = signalDescriptors.map( (descriptor, index) => processSignal(descriptor, index) );
      child.collect(subscriptions);
      child.collect(()=>cache.clear());

      return child;
    }








export function scan(parent, reducer, initialValue) {
  const child = new Signal(initialValue, { name: manifest.scan.name });
  const subscription = parent.subscribe((v) => {
    child.value = v.reduce(reducer, initialValue);
  });
  child.collect(subscription);
  child.collect(graph.connect(parent.id, child.id, "correlateSignals"));
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
  child.collect(parents.map((parent) => graph.connect(parent.id, child.id, "combineLatest")));
  return child;
}

export function switchMap(parent, mapper) {
  const child = new Signal(undefined, { name: manifest.switchMap.name });
  let innerSubscription = null;
  const parentSubscription = parent.subscribe((v) => {
  if (innerSubscription) innerSubscription(); // On data from parent Unsubscribe from the previous innerSubscription if it exists
    const newSignal = mapper(v); // Map the value to a new signal
    innerSubscription = newSignal.subscribe((newValue) =>  child.value = newValue ); // Subscribe to the new signal
  });
  child.collect(innerSubscription); // clean the final one on terminate
  child.collect(parentSubscription);
  child.collect(graph.connect(parent.id, child.id, "combineLatest"));
  return child;
}










// INTEGRATIONS

export function fromBus(bus, eventName) {
  const child = new Signal();
  const handler = (data) => (child.value = data);
  const unsubscribeFromBus = bus.on(eventName, handler);
  child.collect(unsubscribeFromBus);
  return child;
}

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
export function toEvent(source, bus, eventName) {
  const subscription = source.subscribe(v=> bus.emit(eventName, v) );
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
