import { Plugin } from 'plugin';

import { take } from 'utils';
// import { PersistentMap } from "./PersistentMap.js";

export class PalettePlugin extends Plugin {
  app;

  stations;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    //console.log(this.app.plugins)
    this.workbenchPlugin = this.app.plugins.get("WorkbenchPlugin");
    this.engine = this.workbenchPlugin.engine;

    this.uiContainerElement = document.querySelector("#ui-container > .start-side");
    const htmlContent = `
      <div class="palette rounded shadow">
        <div id="palette-list-toolbox" class="palette-body">
        </div>
      </div>
    `;
    const divElement = document.createElement("div");
    divElement.innerHTML = htmlContent;
    this.uiContainerElement.appendChild(divElement);
    this.toolListElement = divElement.querySelector("#palette-list-toolbox");

    if (!this.app.palette) this.app.palette = {};

    this.app.on("registerAgent", (agent) => {
      this.app.palette[this.generateId()] = agent;
      this.renderAgents();
    });

    this.app.emit("registerAgent", { icon: `bi-sticky`, type: "basic/documentation-note", });
    this.app.emit("registerAgent", { icon: `bi-broadcast`, type: "basic/simple-signal", });

    this.app.svg.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    });

    this.app.svg.addEventListener("drop", (e) => {
      e.preventDefault();
      const agentType = e.dataTransfer.getData("application/agent-type");
      const agentName = e.dataTransfer.getData("application/agent-name");
      const { x, y } = this.engine.clientToWorld(e.clientX, e.clientY);
      this.eventDispatch("stationAdd", { x, y, agentType });
    });

    this.loadStyleSheet(new URL("./style.css", import.meta.url).href);


    // const testList = 'palette plug person-arms-up airplane-engines alarm backpack bank bandaid beaker box2-heart brightness-high bug cake2 camera capsule cassette cloud cone cpu cup-hot postage speaker moon lightning lightbulb hospital fuel-pump flask-florence floppy eye'.split(' ');
    // for(const name of testList){
    //   this.app.emit('registerAgent', { icon:`bi-${name}`, type:'basic/pass-through' });
    // }

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  renderAgents() {
    // clear toolbox
    this.toolListElement.replaceChildren();

    for (const agentList of take(Object.entries(this.app.palette), 3)) {
      const row = document.createElement("div");
      row.classList.add("row");
      for (const [id, agent] of agentList) {
        const col = document.createElement("div");
        col.classList.add("col");
        // col.style.textAlign = 'center';
        const toolElement = this.renderTool(id, agent);
        col.appendChild(toolElement);
        row.appendChild(col);
      }
      this.toolListElement.appendChild(row);
    }
  } // renderTools

  renderTool(id, agent) {
    const agentButton = document.createElement("span");

    agentButton.classList.add("agent", "agent-sm");
    agentButton.setAttribute("id", id);

    agentButton.setAttribute("draggable", "true");
    agentButton.addEventListener("dragstart", (e) => {
      //console.log(e)
      e.dataTransfer.setData("text/plain", agent.type);
      e.dataTransfer.setData("application/agent-name", id);
      e.dataTransfer.setData("application/agent-type", agent.type);
      e.dataTransfer.effectAllowed = "copy";
    });

    const agentIcon = document.createElement("i");
    agentButton.classList.add("bi", agent.icon);
    agentButton.appendChild(agentIcon);
    return agentButton;
  }

} // class
