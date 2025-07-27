import { Plugin } from 'plugin';

import { Record } from './lib/Record.js';

export class RecordsManagerPlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.recordInstances = new Map()

  }

  init(app) {

    this.app = app;
    this.svg = this.app.svg;

    this.app.on('recordAdd', station => this.recordAdd(station) );
    this.app.on('recordRestore', raw => this.recordRestore(raw) );

    this.app.on('recordRemove', id => this.recordRemove(id) );

  }




  recordAdd(station) {
    const record = new Record({ id: station.id });
    this.recordInstances.set(record.id, record);
    this.eventDispatch('recordAdded', record);
    this.eventDispatch('recordCreated', record);
    record.subscribe(()=>this.eventDispatch('recordUpdated', record));
    return record;
  }

  recordRestore(raw) {
    const record = new Record(raw);
    this.recordInstances.set(record.id, record);
    this.eventDispatch('recordRestored', record);
    this.eventDispatch('recordCreated', record);
    record.subscribe(()=>this.eventDispatch('recordUpdated', record));
    return record;
  }

  recordRemove(id) {
    //console.log('recordRemove',id, this.recordInstances.has(id));
    if (!id) return console.warn("Attempted to remove a record without an id.");
    if (!this.recordInstances.has(id)) return console.warn(`No record found with id: ${id}`);

    const record = this.recordInstances.get(id);
    record.stop();

    this.recordInstances.delete(id);
    this.eventDispatch('recordRemoved', id);
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }
}
