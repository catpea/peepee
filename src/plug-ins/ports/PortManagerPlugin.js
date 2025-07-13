import { Plugin } from 'plugin';

import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

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


    this.stationManager = app.plugins.get('AgentManagerPlugin');
    this.agentInstances = this.stationManager.agentInstances;
    this.agentManifests = this.stationManager.agentManifests;

    this.stationManager = app.plugins.get('StationManagerPlugin');
    this.stationInstances = this.stationManager.stationInstances;

    this.widgetManagerPlugin = app.plugins.get('WidgetManagerPlugin');
    this.widgetEngine = this.widgetManagerPlugin.widgetEngine;

    this.workbenchPlugin = app.plugins.get('WorkbenchPlugin');
    this.engine = this.workbenchPlugin.engine;


    this.app.on("stationAgentAdded", (agent) => this.instantiatePorts(agent));

    this.app.on("agentRemoved", (id) => this.destroyPorts(id));
    this.app.on("stationRemoved", (id) => this.destroyPorts(id));

   this.loadStyleSheet(new URL('./style.css', import.meta.url).href);

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }












  async instantiatePorts(agent) {
    const {id} = agent;
    const station = this.stationInstances.get(id);
    const manifest = this.agentManifests.get(station.agentType);




      // const test1 = `
      //   <Panel caption="Basic Example" left="500" top="500" width="320" height="200" horizontalCenter="0" verticalCenter="0">
      //     <Group left="10" top="10">
      //       <VGroup gap="5">
      //         ${manifest.node.inputs.map(port=>`<Port name="input" caption="${port.id}"/>`).join()}
      //         <Button caption="Click Me" />
      //         <Button caption="Or Me" />
      //       </VGroup>
      //     </Group>
      //   </Panel>
      // `;
      const test1 = `
        <Panel caption="Basic Example" left="500" top="500" width="200" height="200" horizontalCenter="0" verticalCenter="0">
          <Group left="10" top="10">
            <VGroup gap="5">
              ${manifest.node.inputs.map(port=>`<Port id="${[station.id, 'input', port.id].join(':')}" group="${station.id}" type="input" caption="${port.id}"/>`).join()}
              ${manifest.node.outputs.map(port=>`<Port id="${[station.id, 'output', port.id].join(':')}" group="${station.id}" type="output" caption="${port.id}"/>`).join()}
            </VGroup>
          </Group>
        </Panel>
      `;
      const rootComponent = this.widgetEngine.append(test1);
      rootComponent.element.setAttribute("data-station-id", station.id);
      rootComponent.element.addEventListener("click",()=> this.eventDispatch("selectNode", station) );
      station.subscribe(({x,y,r})=>{
        rootComponent.attributes.top.value = y;
        rootComponent.attributes.left.value = x;
      });

      const unified = [...manifest.node.inputs.map(o=>{o.kind='input'; return o}), ...manifest.node.outputs.map(o=>{o.kind='output'; return o})];
      console.log('FF input', unified)

    for(const input of unified ){
      console.log('FF input', input)
      const id = [station.id, input.kind, input.id].join(':');
      const name = [input.kind, input.id].join(':');

        const portComponent = this.widgetEngine.registry.get(id);
        if(!portComponent) console.info('FF', [...this.widgetEngine.registry.keys()]);
        if(!portComponent) throw new Error(`Failed to locate component ${id} in component registry, does it have a valid id?`)

        const port = {
          id,
          name,
          stationId: station.id,
          portElement: portComponent.element,
          x: new Signal(0),
          y: new Signal(0),
        };

        // when station changes of moves, update port coordinates
        station.subscribe(()=>{
          console.warn('port.portElement.getCTM is inaccurate, UPGRADE THIS')
          const {e:x, f:y} = port.portElement.getCTM();
          const point = this.engine.clientToWorld(x,y);
          port.x.value = point.x;
          port.y.value = point.y+8;

        });

      this.portInstances.set(port.id, port);
      this.eventDispatch("portAdded", port);

    }

    this.eventDispatch("portsAdded", agent);

  }









  async instantiatePorts1(agent) {

    const {id} = agent;

    const station = this.stationInstances.get(id);
    //console.log(id, this.stationInstances, station)
    const manifest = this.agentManifests.get(station.agentType);
    // const agent = this.agentInstances.get(id);


    const portRadius = 5;
    const angleDistance = 25

    const leftHemisphere = [];
    const rightHemisphere = [];




    for(const portData of manifest.node.inputs){
      const id = [station.id, 'input', portData.id].join(':');
      const portName = ['input', portData.id].join(':');
      const angle = 0;
      leftHemisphere.push({id, portName, stationId:station.id, angle, portData});
    }
    for(const property of manifest.node.properties){
      for(const portData of property.ports){
        const id = [station.id, 'property', property.id, portData.id].join(':');
        const portName = ['property', property.id, portData.id].join(':');
        const angle = 0;
        leftHemisphere.push({id, portName, stationId:station.id, angle, portData});
      }
    }
    for(const portData of manifest.node.outputs){
      const id = [station.id, 'output', portData.id].join(':');
      const portName = ['output', portData.id].join(':');
      const angle = 0;
      rightHemisphere.push({id, portName, stationId:station.id, angle, portData});
    }


    // Assign Port Angles
    const leftHemisphereStart = 180 -  (((leftHemisphere.length-1)*angleDistance)/2);
    for(let i = 0; i<leftHemisphere.length;i++){
      leftHemisphere[i].angle = leftHemisphereStart + i*angleDistance;
    }

    const rightHemisphereStart =  0  - (((rightHemisphere.length-1)*angleDistance)/2);
    for(let i = 0; i<rightHemisphere.length;i++){
      rightHemisphere[i].angle = rightHemisphereStart + i*angleDistance;
    }



    for(const rawPort of [...leftHemisphere, ...rightHemisphere]){

      const portElement = document.createElementNS("http://www.w3.org/2000/svg", "circle");

      portElement.setAttribute("class", "station-port");
      portElement.setAttribute("data-port-id", rawPort.id);
      portElement.setAttribute("data-port-name", rawPort.portName);
      portElement.setAttribute("data-station-id", station.id);
      portElement.setAttribute("r", portRadius);

      const port = {
        id: rawPort.id,
        name: rawPort.portName,
        stationId: station.id,
        portElement,
        x: new Signal(0),
        y: new Signal(0),
        unsubscribe: new Set(),
      };

      //console.log('BBB portInstances.set', port.id, port)
      this.portInstances.set(port.id, port);

      // move port circle
      const unsubscribeCx = port.x.subscribe(v=>portElement.setAttribute("cx", v));
      const unsubscribeCy = port.y.subscribe(v=>portElement.setAttribute("cy", v));
      port.unsubscribe.add(unsubscribeCx);
      port.unsubscribe.add(unsubscribeCy);

      station.subscribe(({x,y,r})=>{
        const pos = this.placeCircleOnCircumference(rawPort.angle, x,y,r*1.3);
        port.x.value = pos.x;
        port.y.value = pos.y;
      });

      // listeners are automatically removed when portElement is .removed(); (in modern browsers)
      portElement.addEventListener("click",()=> this.eventDispatch("selectPort", port) );

      this.app.layers.ports.appendChild(portElement);
      this.eventDispatch("portAdded", port);

    }

    // this.eventDispatch('manifestAdded', manifest);
    this.eventDispatch("portsAdded", agent);

  }






  destroyPorts(stationId) {

    // Remove ports matching the condition (it is safe to delete items being iterated via forEach)
    this.portInstances.forEach((port, key) => {
        if (port.stationId == stationId) {
            port.portElement.remove();
            port.unsubscribe.forEach(stop=>stop())
            this.portInstances.delete(key);
        }
    });

  }


  placeCircleOnCircumference(angle, circleX, circleY, circleRadius) {

      // Convert the start angle from degrees to radians
      const angleInRadians = angle * (Math.PI / 180);

      // Calculate the x and y coordinates of the point on the circumference
      const x = circleX + circleRadius * Math.cos(angleInRadians);
      const y = circleY + circleRadius * Math.sin(angleInRadians);

     // Return the coordinates as an object for destructuring
      return { x, y };
  }

}
