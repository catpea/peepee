import { Signal } from "signals";
import { EventEmitter } from "events";
import { Component } from "./Component.js";

/**
 * Main Widget Engine class
 */
export class Engine extends EventEmitter {
  constructor(svgElement) {
    super();
    this.svg = svgElement;
    this.componentLayer = svgElement.querySelector("#widgets");
    this.portLayer = svgElement.querySelector("#ports");
    this.defs = svgElement.querySelector("defs");

    // Reactive signals
    this.containerWidth = new Signal(Component.ContainerWidth);
    this.containerHeight = new Signal(Component.ContainerHeight);
    this.scale = new Signal(1);

    // Plugin system
    this.plugins = [];
    this.componentPlugins = new Map();
    this.isRunning = false;

    // Component instances
    this.instances = [];
    this.registry = new Map();

    // Subscribe to container changes
    this.containerWidth.subscribe(() => this.layout());
    this.containerHeight.subscribe(() => this.layout());

    this.setupResizeObserver();
  }

  registerComponentPlugin(name, plugin) {
    this.componentPlugins.set(name, plugin);
    if (this.isRunning) {
      plugin.start();
    }
  }

  use(plugin) {
    plugin.engine = this;
    this.plugins.push(plugin);

    if (this.isRunning) {
      plugin.start();
    }

    return this;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.plugins.forEach((plugin) => plugin.start());
    this.componentPlugins.forEach((plugin) => plugin.start());
    return this;
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.plugins.forEach((plugin) => plugin.stop());
    this.componentPlugins.forEach((plugin) => plugin.stop());
    return this;
  }

  append(xmlString) {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      // Check for parser errors
      const parseError = xmlDoc.querySelector("parsererror");
      if (parseError) {
        throw new Error("XML Parse Error: " + parseError.textContent);
      }

      const rootElement = xmlDoc.documentElement;
      //console.log("Parsing root element:", rootElement.nodeName);

      const component = this.createComponentFromXML(rootElement);

      this.instances.push(component);
      component.render(this, this.componentLayer);
      this.layout();

      return component;
    } catch (error) {
      console.error("Error in append:", error);
      throw error;
    }
  }

  createComponentFromXML(xmlElement) {
    const componentName = xmlElement.nodeName;
    //console.log("Creating component:", componentName);

    const plugin = this.componentPlugins.get(componentName);

    if (!plugin) {
      throw new Error(`Unknown component: ${componentName}. Available: ${Array.from(this.componentPlugins.keys()).join(", ")}`);
    }

    // Extract attributes
    const attributes = {};
    for (let i = 0; i < xmlElement.attributes.length; i++) {
      const attr = xmlElement.attributes[i];
      attributes[attr.name] = this.parseValue(attr.value);
    }

    //console.log("EEE Component attributes:", attributes);

    // Create component instance using plugin
    const component = plugin.createComponent(attributes, this);
    if(component.id) this.registry.set(component.id, component)

    // Process children
    for (let child of xmlElement.children) {
      const childComponent = this.createComponentFromXML(child);
      component.addChild(childComponent);
    }

    return component;
  }

  layout() {
    this.instances.forEach((instance) => {
      instance.layout(this.containerWidth.value, this.containerHeight.value);
    });
  }

  setupResizeObserver() {
    const container = this.svg.parentElement;
    const resizeObserver = new ResizeObserver((entries) => {
      this.layout();
    });
    resizeObserver.observe(container);
  }

  clear() {
    this.instances.forEach((instance) => {
      if (instance.element) {
        instance.element.remove();
      }
    });
    this.instances = [];
  }

  query(xpath) {
    return this.instances[0];
  }

  parseValue(value) {
    if (typeof value === "string") {
      if (value.includes("%")) {
        return { value: parseFloat(value), unit: "%" };
      }
      if (!isNaN(value)) {
        return parseFloat(value);
      }
    }
    return value;
  }

  loadXML(xmlString) {
    try {
      // this.widgetEngine.clear();
      return this.append(xmlString);
    } catch (error) {
      console.error("Error loading XML:", error);
      throw error;
    }
  }

  async loadXMLFile(url) {
    try {
      const response = await fetch(url);
      const xmlContent = await response.text();
      return xmlContent;
    } catch (error) {
      console.error("Error loading XML file:", error);
      // Fallback to inline XML if file loading fails
      return null;
    }
  }

  loadStyleSheet(url) {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load CSS: ${response.statusText}`);
        return response.text();
      })
      .then((cssText) => {
        const style = document.createElement("style");
        style.textContent = cssText;
        document.head.appendChild(style);
      })
      .catch((error) => {
        console.error("Error loading stylesheet:", error);
      });
  }

}
