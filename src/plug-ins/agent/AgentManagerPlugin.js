import { Plugin } from "plugin";

export class AgentManagerPlugin extends Plugin {
  app;
  subscriptions;

  agentInstances;

  constructor() {
    super();
    this.agentInstances = new Map();
  }

  init(app) {
    this.app = app;

    this.featureRequest('ManifestManagerPlugin', 'agentManifests');
    this.featureRequest('RecordsManagerPlugin', 'recordInstances');
    this.featureRequest('StationManagerPlugin', 'stationInstances');

    this.bus("stationCreated", (station) => this.instantiateStationAgent(station));
    this.bus("stationRemoved", (id) => this.destroyAgent(id));

    this.bus("connectionCreated", (connection) => this.instantiateConnectionAgent(connection));
    this.bus("connectionRemoved", (id) => this.destroyAgent(id));

  }

  stop() {
    this.app.garbage.free([this.pluginName]);
  }

  async instantiateStationAgent({ id, agentType }) {

        // signals
    let record = this.recordInstances.get(id);
    // if(!record){
    //   await this.app.until('recordAdded', id);
    //   record = this.recordInstances.get(id);
    // }

    const station = this.stationInstances.get(id);

    let manifest =  this.agentManifests.get(agentType)  ;
    // if (!manifest) {
    //   // console.log('this.manifestManager', this.manifestManager)
    //   // this.manifestManager.instantiateManifest({ agentType });
    //   manifest = await this.app.until("manifestAdded", agentType);
    // }

    const configuration = {
      id,
      agentType,
      record,
      manifest,
    };

    const Agent = await this.fetchClass("agents", agentType, manifest.files.main);
    const agent = new Agent(configuration);

    this.agentInstances.set(configuration.id, agent);
    this.eventDispatch("stationAgentAdded", agent);

    await agent.start();
    this.eventDispatch("stationAgentStarted", agent);

  }
  async instantiateConnectionAgent(connection) {
    console.warn('instantiateConnectionAgent', connection);

    if (connection.fromId) connection.fromEmitter = this.agentInstances.get(connection.fromId);
    if (connection.toId) connection.toEmitter = this.agentInstances.get(connection.toId);
    if (connection.fromPortName && connection.toPortName) connection.mapping = [{ fromEvent: connection.fromPortName, toEvent: connection.toPortName, transformer: (data) => data }];

    let manifest = this.agentManifests.has(connection.agentType) ? this.agentManifests.get(connection.agentType) : null;

    if (!manifest) {
      this.manifestManager.instantiateManifest(connection);
      manifest = await this.app.until("manifestAdded", connection.agentType);
    }

    // load main file as specified in manifest
    const Agent = await this.fetchClass("agents", connection.agentType, manifest.files.main);

    const agent = new Agent(connection);

    this.agentInstances.set(connection.id, agent);
    this.eventDispatch("connectionAgentAdded", agent);

    await agent.start();
    this.eventDispatch("connectionAgentStarted", agent);
  }

  async destroyAgent(id) {
    const agent = this.agentInstances.get(id);

    await agent.stop();
    this.eventDispatch("agentStopped", agent);

    this.agentInstances.delete(id);
    this.eventDispatch("agentRemoved", agent);

  }

  async fetchClass(agentRoot, basePath, fileName = "index.js") {
    // const url = [window.location.origin, agentRoot, basePath, fileName].join('/');
    const pathnames = window.location.pathname.split("/").filter((o) => o);
    const url = "/" + [...pathnames, agentRoot, basePath, fileName].join("/");
    try {
      // Dynamically import the module
      const module = await import(url);
      return module.default; // Return the default export (assumed to be a class)
    } catch (error) {
      console.error("Error loading module:", error);
      throw error; // Rethrow the error for further handling if needed
    }
  }
}
