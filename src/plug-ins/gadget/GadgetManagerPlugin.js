import { Plugin } from 'plugin';

// a Gadget is the user interface of a node
// here we keep track of functions that create SVG elements for specific agentTypes

export class GadgetManagerPlugin extends Plugin {
  app;
  subscriptions;
  gadgetRegistry;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.gadgetRegistry = new Map();
  }

  init(app) {
    this.app = app;

    //TODO: this requires a queue too many are piling up at the same time
    this.app.on("manifestAdded", (manifest) => this.instantiateGadget(manifest));
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }


  async instantiateGadget(manifest){
    if(!this.gadgetRegistry.has(manifest.id)){
      const gadget = await this.fetchGadget('agents', manifest.id, manifest.files.gui);
      this.gadgetRegistry.set(manifest.id, gadget);
    }
    this.eventDispatch('gadgetAdded', this.gadgetRegistry.get(manifest.id));
  }
  async fetchGadget(agentRoot, basePath, fileName = "gui.js") {
    const pathnames = window.location.pathname.split('/').filter(o=>o);
    const url = '/'+ [...pathnames, agentRoot, basePath, fileName].join('/');
    try {
      const { main } = await import(url);
      console.info(url, main)
      return main;
    } catch (error) {
      console.error("There was a problem with the import operation:", error);
    }
  }

}
