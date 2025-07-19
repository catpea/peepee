import { EventEmitter } from "events";
import { Signal } from "signals";

// import { Graph } from "./core/Graph.js";

export class Application extends EventEmitter {
  constructor(svgElement) {
    super();

    // All Plugins Use This
    this.palette = {}
    this.selectedTool = new Signal(undefined, {label: 'Selected Tool'});

    this.svg = svgElement;

    this.tools = {};

    this.layers = {
      grid: document.createElementNS("http://www.w3.org/2000/svg", "g"),
      trays: document.createElementNS("http://www.w3.org/2000/svg", "g"),
      connections: document.createElementNS("http://www.w3.org/2000/svg", "g"),
      stations: document.createElementNS("http://www.w3.org/2000/svg", "g"),
      widgets: document.createElementNS("http://www.w3.org/2000/svg", "g"),
      ports: document.createElementNS("http://www.w3.org/2000/svg", "g"),
      labels: document.createElementNS("http://www.w3.org/2000/svg", "g"),
      ghost: document.createElementNS("http://www.w3.org/2000/svg", "g"),
    };

    this.plugins = new Map();
    // this.graph = new Graph();

    this.init();
  }

  async init() {
    // Append layers
    Object.entries(this.layers).forEach(([id, layer]) => {
      viewport.appendChild(layer);
      layer.id = id;
    });

    for (const [key, plugin] of this.plugins) {
      await plugin.init(this);
    }
  }

  use(plugin) {
    const pluginName = plugin.constructor.name;
    this.plugins.set(pluginName, plugin);
  }
}
