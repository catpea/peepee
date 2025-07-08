import { Plugin } from 'plugin';
import { EventAggregator } from 'events';
import { PersistentMap } from './PersistentMap.js';

export class DatabasePlugin extends Plugin {
  app;

  stations;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;

    this.portManager = app.plugins.get('PortManagerPlugin');
    this.portInstances = this.portManager.portInstances;

    this.startRestore()
    // this.app.on('startRestore', ()=>this.startRestore())
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

  startRestore(){

    //NOTICE: station gets {id, type} | metadata loads based on type | propertyKeys become available | recordStorage can now be pulled by key

    // keys for records are found in agent manifest files
    const records = new PersistentMap(null, {prefix: 'pishposh-records', onRestored:db=>db.forEach((v,k)=>this.app.emit('recordRestore', v))});
    this.records = records;
    this.app.on('recordAdded', data => this.records.set(data.id, data.serialize()));
    this.app.on('recordUpdated', data => this.records.set(data.id, data.serialize()));
    this.app.on('recordRemoved', id => this.records.delete(id));

    this.stations = new PersistentMap(null, {prefix: 'pishposh-stations', onRestored: async stations=>{
      for(const [id, station] of stations){
        //console.log('station', station)
        if(!this.records.ready) await records.once('ready');
        if(!records.has(id)) records.set(id, {});
        this.app.emit('stationRestore', station);
      }
    }});

    this.app.on('stationAdded', data => this.stations.set(data.id, data.serialize()));
    this.app.on('stationUpdated', data => this.stations.set(data.id, data.serialize()));
    this.app.on('stationRemoved', id => this.stations.delete(id));

    this.app.on('stationAdded', data => records.set(data.id, {}));
    this.app.on('stationRemoved', id => records.delete(id));

    const aggregator = new EventAggregator();
    aggregator.define('connectionReady', {
      events: [
        {
          eventType: 'portAdded',
          filter: (data, context) => data.id === context.fromPortId,
          alias: 'fromPort'
        },
        {
          eventType: 'portAdded',
          filter: (data, context) => data.id === context.toPortId,
          alias: 'toPort'
        }
      ],
      onComplete: (data) => this.app.emit('connectionRestore', data.initialData)
    });

    const restoreConnection = (connection) =>  aggregator.start('connectionReady', connection.id, connection);
    this.app.on('portAdded', port => aggregator.emit('portAdded', port)); // drive data into the aggreaagator

    this.connections = new PersistentMap(null, {
      prefix: 'pishposh-connections',
      onRestored: db => db.forEach(restoreConnection)
    });

    this.app.on('connectionAdded',   data => this.connections.set(data.id, data.serialize()));
    this.app.on('connectionUpdated', data => this.connections.set(data.id, data.serialize()));
    this.app.on('connectionRemoved', id => this.connections.delete(id));

    this.app.on('connectionAdded', data => records.set(data.id, {}));
    this.app.on('connectionRemoved', id => records.delete(id));









} // start restore



}
