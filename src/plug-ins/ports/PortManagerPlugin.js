import { Signal } from 'signals';

import { Plugin } from "plugin";

// import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class PortManagerPlugin extends Plugin {
  app;
  subscriptions;

  portInstances;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.portInstances = new Map();
  }

  init(app) {
    this.app = app;

    this.stationManager = app.plugins.get("AgentManagerPlugin");
    this.agentInstances = this.stationManager.agentInstances;
    this.agentManifests = this.stationManager.agentManifests;

    this.stationManager = app.plugins.get("StationManagerPlugin");
    this.stationInstances = this.stationManager.stationInstances;

    this.widgetManagerPlugin = app.plugins.get("WidgetManagerPlugin");
    this.widgets = this.widgetManagerPlugin.widgets;

    this.workbenchPlugin = app.plugins.get("WorkbenchPlugin");
    this.engine = this.workbenchPlugin.engine;

    this.app.on("stationAgentAdded", (agent) => this.instantiatePorts(agent));

    this.app.on("agentRemoved", (id) => this.destroyPorts(id));
    this.app.on("stationRemoved", (id) => this.destroyPorts(id));

    this.loadStyleSheet(new URL("./style.css", import.meta.url).href);
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  createPort(station, kind, input) {
    const id = [station.id, kind, input.id].join(":");
    const name = [kind, input.id].join(":");

    const portComponent = this.widgets.registry.get(id);
    if (!portComponent) throw new Error(`Failed to locate component ${id} in component registry, does it have a valid id?`);

    const port = {
      id,
      name,
      stationId: station.id,
      portElement: portComponent.element,
      x: new Signal(0),
      y: new Signal(0),
      unsubscribe:[],
    };

    // when station changes of moves, update port coordinates
    station.connect().combineLatest(this.engine.scale, portComponent.attributes.portSocketX ).subscribe((arg) => {
      const [id, x1, y1, r, label, agentType, scale, portSocketX] = arg.flat();
      // if(! portComponent.portSocket) return;
      // if(! portComponent.portSocket.getCTM()) return;
      //console.info('CTM UPDATE, lol', arg )
      const { e: x, f: y } = portComponent.portSocket.getCTM();
      const point = this.engine.clientToWorld(x, y);
      port.x.value = point.x + portSocketX;
      port.y.value = point.y + 8;

      // port.x.value = portComponent.attributes.portSocketXCTM.value;
      // port.y.value = portComponent.attributes.portSocketYCTM.valuealue = portComponent.attributes.portSocketYCTM.value;

    });

    this.portInstances.set(port.id, port);
    this.eventDispatch("portAdded", port);
  }

  async instantiatePorts(agent) {
    const { id } = agent;
    const station = this.stationInstances.get(id);
    const manifest = this.agentManifests.get(station.agentType);

    const component = `
      <Panel caption="Basic Example" left="500" top="500" width="200" height="200" horizontalCenter="0" verticalCenter="0">
        <Group left="10" top="10">
          <VGroup gap="5">
            ${manifest.node.inputs.map((port) => `<Port id="${[station.id, "input", port.id].join(":")}" group="${station.id}" type="input" caption="${port.id}" width="180"/>`).join()}
            ${manifest.node.outputs.map((port) => `<Port id="${[station.id, "output", port.id].join(":")}" group="${station.id}" type="output" caption="${port.id}" width="180"/>`).join()}
          </VGroup>
        </Group>
      </Panel>
    `;
    const rootComponent = this.widgets.append(component);

    rootComponent.element.setAttribute("data-station-id", station.id);
    rootComponent.element.addEventListener("click", () => this.eventDispatch("selectNode", station));

    // Station Position
    station.connect().subscribe(([id, x, y, r, label, agentType]) => {

      rootComponent.attributes.top.value = y;
      rootComponent.attributes.left.value = x;

    });

    manifest.node.inputs.forEach((o) => this.createPort(station, 'input', o));
    manifest.node.outputs.forEach((o) => this.createPort(station, 'output', o));

    this.eventDispatch("portsAdded", agent);
  }

  destroyPorts(stationId) {
    // Remove ports matching the condition (it is safe to delete items being iterated via forEach)
    this.portInstances.forEach((port, key) => {
      if (port.stationId == stationId) {
        port.portElement.remove();
        port.unsubscribe.forEach((stop) => stop());
        this.portInstances.delete(key);
      }
    });
  }

}
