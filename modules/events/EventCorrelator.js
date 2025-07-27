import { EventEmitter } from "events";
import { Signal, combineLatest } from "signals";
import { zip } from "utils";

export class EventCorrelator extends EventEmitter {
  constructor(eventBus, eventName, eventList, dataTransform = (o) => o, correlatorId = "id") {
    super();

    this.eventBus = eventBus;
    this.eventName = eventName;
    this.eventList = eventList;
    this.dataTransform = dataTransform;
    this.correlatorId = correlatorId;
    this.database = new Map();
  }

  start() {
    this.signals = new Map(eventList.map((eventName) => [eventName, new Signal()]));

    this.unlistenAll = eventList.map((eventName) => eventBus.on(eventName, (data) => (this.signals.get(eventName).value = data)));
    eventList.map((eventName) => {
      eventBus.on(eventName, (data) => {
        console.info("EEE <->", { eventName, current: this.signals.get(eventName).value, data });
      });
    });

    this.unsubscribe = combineLatest(...this.signals.values())
      .everyFilter((o) => o) // every value must be truthy, if every returned false STOP HERE
      .map((eventSignals) => Object.fromEntries(zip(eventList, eventSignals)))
      .map((o) => dataTransform(o))
      .subscribe((o)=>eventBus.emit(eventName, o));

    return ()=>this.stop();
  }

  stop() {
    this.unlistenAll.map((o) => o());
    this.unsubscribe();
    this.signals.clear();
  }
}

function test() {
  const bus = new EventEmitter();
  bus.on("A", (v) => console.log("EEE A", v));
  bus.on("B", (v) => console.log("EEE B", v));
  bus.on("C", (v) => console.log("EEE C", v));
  bus.on("✓", (v) => console.log("EEE ✓", v));
  const eventCorrelator = new EventCorrelator(bus, "✓", ["A", "B", "C"], (o) => o.B);
  setTimeout(() => bus.emit("A", 1), 1_000);
  setTimeout(() => bus.emit("B", 2), 2_000);
  setTimeout(() => bus.emit("C", 3), 3_000);
}

//test();
