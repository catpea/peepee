import { Plugin } from 'plugin';

import { Connection } from './lib/Connection.js';

export class ConnectionCreatePlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;

    this.connectionManager = app.plugins.get('ConnectionManagerPlugin');
    this.connectionInstances = this.connectionManager.connectionInstances;



    this.app.on("connectionAdd", (raw) => this.connectionAdd(raw));
    this.app.on("connectionRestore", (deserialized) => this.connectionRestore(deserialized));
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  async connectionAdd(raw) {
    const connection = new Connection(raw);
    this.connectionInstances.set(connection.id, connection);
    this.eventDispatch("connectionAdded", connection);
    return connection;
  }

  async connectionRestore(options) {
    const connection = new Connection(options);
    this.connectionInstances.set(connection.id, connection);
    this.eventDispatch("connectionRestored", connection);
    return connection;
  }

}
