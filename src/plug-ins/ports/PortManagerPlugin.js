import { Signal, combineLatest, fromEvent, fromBetweenEvents } from "signals";

import { Plugin } from "plugin";

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
    this.svg = app.svg;

    this.stationManager = app.plugins.get("AgentManagerPlugin");
    this.agentInstances = this.stationManager.agentInstances;
    this.agentManifests = this.stationManager.agentManifests;

    this.stationManager = app.plugins.get("StationManagerPlugin");
    this.stationInstances = this.stationManager.stationInstances;

    this.recordsManager = app.plugins.get('RecordsManagerPlugin');
    this.recordInstances = this.recordsManager.recordInstances;

    this.gadgetManagerPlugin = app.plugins.get("GadgetManagerPlugin");
    this.gadgetRegistry = this.gadgetManagerPlugin.gadgetRegistry;

    this.widgetManagerPlugin = app.plugins.get("WidgetManagerPlugin");
    this.widgets = this.widgetManagerPlugin.widgets;

    this.workbenchPlugin = app.plugins.get("WorkbenchPlugin");
    this.engine = this.workbenchPlugin.engine;

    this.app.on("stationAgentAdded", (agent) => this.instantiatePorts(agent));

    // this.app.on("agentRemoved", (id) => this.destroyPorts(id));
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
      unsubscribe: [],
    };

    // when station changes of moves, update port coordinates
    combineLatest(station.connect(), this.engine.scale, portComponent.attributes.portSocketX).subscribe(([[id, x1, y1, r, label, agentType], scale, portSocketX]) => {
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
    const gadget = this.gadgetRegistry.get(station.agentType);



    let record = this.recordInstances.get(id);
    if(!record){
      await this.app.until('recordAdded', id);
      record = this.recordInstances.get(id);
    }




    let rootComponent;

    if(gadget){

      let { content, properties } = gadget({ manifest, station });
        rootComponent = this.widgets.append(content);

        record.subscribe((name, value)=>{
          if(name in properties && this.widgets.registry.has(properties[name])) this.widgets.registry.get(properties[name]).attributes[name].value = value;
        });


    }else{
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
      rootComponent = this.widgets.append(component);

    }



    rootComponent.element.setAttribute("data-station-id", station.id);
    rootComponent.element.addEventListener("click", () => this.eventDispatch("selectNode", station));



    // PASS RECORD DATA TO ATTRIBUTES
    // this.tuneIn(record.get('color', 'green'), v=>path.style.stroke =  this.primaryColorTransform(v) )
    // for(const property of manifest.node.properties){

    // }




    // INSTALL CONV TOOL ON PORTS
    for (const port of manifest.node.outputs) {
      const id = [station.id, "output", port.id].join(":");
      const portComponent = this.widgets.registry.get(id);
      if(!portComponent) continue;
      let previousTool = this.app.selectedTool.value;
      let convenienceTool = "connect";
      const pressingActivity = fromBetweenEvents(portComponent.element, "mousedown", this.svg, "mouseup");
      const unsubscribe = pressingActivity.subscribe((isPressing) => {
        if (isPressing) {
          previousTool = this.app.selectedTool.value;
          this.app.selectedTool.value = convenienceTool;
        } else {
          this.app.selectedTool.value = previousTool;
        }
      });
      console.warn("unsubscribe", unsubscribe);
    }

    // let lastTool = this.app.selectedTool.value;
    // let overrideActive = false;

    // // fromEvent(rootComponent.element, 'mousedown').subscribe(()=>{
    // //   overrideActive=true;
    // //   lastTool = this.app.selectedTool.value;
    // //   this.app.selectedTool.value = 'move';
    // //   const currentTool = this.app.selectedTool.value
    // //   console.log({lastTool, currentTool})
    // // });

    // // fromEvent(rootComponent.element, 'mouseup').subscribe(()=>{
    // //   console.log('mouseup', lastTool)
    // //   if(!overrideActive) return;
    // //   overrideActive = false;
    // //   this.app.selectedTool.value = lastTool;
    // // });

    let previousTool = this.app.selectedTool.value;
    let convenienceTool = "move";
    const pressingActivity = fromBetweenEvents(rootComponent.dragHandle, "mousedown", this.svg, "mouseup");

    pressingActivity.subscribe((isPressing) => {
      if (isPressing) {
        previousTool = this.app.selectedTool.value;
        this.app.selectedTool.value = convenienceTool;
      } else {
        this.app.selectedTool.value = previousTool;
      }
    });

    // fromEvent(rootComponent.element, 'mousedown')
    // .switchMap(this.app.selectedTool)
    // .subscribe(tool=>{
    //   tool.value = 'move'
    // })

    // fromEvent(document, 'mouseup')
    // .switchMap(this.app.selectedTool)
    // .subscribe(tool=>tool.value = 'move')

    // Station Position
    station.connect().subscribe(([id, x, y, r, label, agentType]) => {
      rootComponent.attributes.top.value = y;
      rootComponent.attributes.left.value = x;
    });

    manifest.node.inputs.forEach((o) => this.createPort(station, "input", o));
    manifest.node.outputs.forEach((o) => this.createPort(station, "output", o));

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
