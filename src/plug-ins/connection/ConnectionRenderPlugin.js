import { Plugin } from 'plugin';

import { rid, ReactiveSignal as Signal, namedCombineLatest, fromEvent } from "../../core/Signal.js";

export class ConnectionRenderPlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {

    this.app = app;
    this.svg = this.app.svg;
    this.layers = this.app.layers;

    this.workbenchPlugin = this.app.plugins.get('WorkbenchPlugin');
    this.engine = this.workbenchPlugin.engine;

    this.stationManager = app.plugins.get('StationManagerPlugin');
    this.stationInstances = this.stationManager.stationInstances;

    this.portManager = app.plugins.get('PortManagerPlugin');
    this.portInstances = this.portManager.portInstances;

    this.recordsManager = app.plugins.get('RecordsManagerPlugin');
    this.recordInstances = this.recordsManager.recordInstances;

    this.colorManagerPlugin = app.plugins.get('ColorManagerPlugin');
    this.primaryColorTransform = this.colorManagerPlugin.primaryColorTransform;

    this.database = app.plugins.get('DatabasePlugin');

    this.app.on("connectionAdded", (connection) => this.renderConnection(connection));
    this.app.on("connectionRestored", (connection) => this.renderConnection(connection));
    this.app.on("connectionRemoved", (id) => this.removeConnection(id));

    // this.app.on("stationRemoved", (id) => this.destroyPorts(id));

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  removeConnection(id) {
    const path = this.svg.querySelector(`.connection-path[data-connection-id="${id}"]`);
    const labels = this.svg.querySelectorAll(`.connection-label[data-connection-id="${id}"]`);

    if (path) path.remove();
    labels.forEach((el) => el.remove());
  }

  async renderConnection(connection) {

    const fromPort = this.portInstances.get(connection.fromPortId);
    const toPort   = this.portInstances.get(connection.toPortId);

    if (!fromPort) throw new Error(`fromPort not found in portInstances (${connection.fromPortId})`);
    if (!toPort) throw new Error(`toPort not found in portInstances (${connection.toPortId})`);


    let record = this.recordInstances.get(connection.id);
    if(!record){
      await this.app.until('recordAdded', connection.id);
      record = this.recordInstances.get(connection.id);
    }

    const pathId = `path-${connection.id}`;







    // Create path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    this.tuneIn(record.get('color', 'green'), v=>path.style.stroke =  this.primaryColorTransform(v) )

    path.setAttribute("id", pathId);
    path.setAttribute("class", "connection-path");
    path.setAttribute("data-connection-id", connection.id);

    const updatePath = () => {
      path.setAttribute("d", `M ${fromPort.x.value},${fromPort.y.value} L ${toPort.x.value},${toPort.y.value}`);
    };

    updatePath();

    // Create label elements
    const createDynamicLabel = (initial, anchor) => {
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("class", `connection-label connection-label-${anchor}`);
      text.setAttribute("data-connection-id", connection.id);
      text.setAttribute("text-anchor", anchor);
      const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
      textPath.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${pathId}`);
      textPath.textContent = initial;
      text.appendChild(textPath);
      return { text, textPath };
    };

    const { text: startText, textPath: startTP } = createDynamicLabel(connection.startLabel ?? "", "start");
    const { text: midText, textPath: midTP } = createDynamicLabel(connection.centerLabel ?? "", "middle");
    const { text: endText, textPath: endTP } = createDynamicLabel(connection.endLabel ?? "", "end");

    endText.style.textAnchor = "end";

    // Add to DOM
    this.layers.connections.appendChild(path);
    this.layers.labels.appendChild(startText);
    this.layers.labels.appendChild(midText);
    this.layers.labels.appendChild(endText);

    // Select connection
    this.listenTo(path, 'click', (e) => {
      e.stopPropagation();
      this.app.emit("selectConnection", connection);
    });

    const updateLabels = () => {
      requestAnimationFrame(() => {
        const totalLength = path.getTotalLength();
        const aestheticSidePadding = 18;
        startTP.setAttribute("startOffset", `${Math.max(0, aestheticSidePadding)}px`);
        midTP.setAttribute("startOffset", `50%`);
        endTP.setAttribute("startOffset", `${Math.max(0, totalLength - aestheticSidePadding)}px`);
      });
    };

    const updateAll = () => {
      updatePath();
      updateLabels();
    };

    // Subscribe position changes

    this.tuneIn(fromPort.x, updateAll);
    this.tuneIn(fromPort.y, updateAll);
    this.tuneIn(toPort.x, updateAll);
    this.tuneIn(toPort.y, updateAll);


    // Text updates
    // this.tuneIn(connection.signals.centerLabel, (text) => { midTP.textContent = text; updateLabels(); });
    // this.tuneIn(connection.signals.startLabel, (text) => { startTP.textContent = text; updateLabels(); });
    // this.tuneIn(connection.signals.endLabel, (text) => { endTP.textContent = text; updateLabels(); });




    this.tuneIn(record.get('centerLabel', ''), (text) => { midTP.textContent = text; updateLabels(); })
    this.tuneIn(record.get('startLabel', ''),  (text) => { startTP.textContent = text; updateLabels(); })
    this.tuneIn(record.get('endLabel', ''),    (text) => { endTP.textContent = text; updateLabels(); })


    // Initial offset position
    updateLabels();
  }
}
