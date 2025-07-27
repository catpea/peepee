import { fromBus, correlateEvents, correlateSignals } from "signals";

import { Plugin } from 'plugin';

export class EventCorrelatorPlugin extends Plugin {
  app;

  constructor() {
    super();
  }

   init(app) {
    this.app = app;

    this.satisfied = [];

    setTimeout(()=>{

      this.featureRequest('DatabasePlugin',  'stations');
      this.featureRequest('DatabasePlugin',  'connections');

      const stations = [...this.stations.values()].map(o=>o.id);
      const connections = [...this.connections.values()].map(o=>o.id);

      console.info('satisfied STATIONS', this.satisfied)
      console.info('KNOWN STATIONS', stations)
      console.info('KNOWN CONNECTIONS', connections)

      for(const connection of connections){
        if(!this.satisfied.includes(connection)) console.error('UNSATISFIED CONNECTION (why didn\'t connectionCorrelation/linkReady fire twice)', connection)
      }

    },1_111)


    // FOR STATION

    const stationInstanceCorrelation = correlateEvents(this.app,
      { alias:'station', name:'stationCreated', correlationField:'id' },
      { alias:'record',  name:'recordCreated', correlationField:'id' },
    );

    const stationClassCorrelation = correlateEvents(this.app,
      { alias:'manifest', name:'manifestAdded', correlationField:'id' },
      { alias:'gadget', name:'gadgetAdded', correlationField:'id' },
    );

    const nodeCorrelation = correlateSignals(
      { signal: stationInstanceCorrelation, correlationField: 'station.agentType', },
      { signal: stationClassCorrelation, correlationField: 'manifest.id', },
    );
    nodeCorrelation.toEvent(this.app, 'nodeReady');

    // FOR CONNECTION

    const connectionInstanceCorrelation = correlateEvents(this.app,
      { alias:'connection', name:'connectionCreated', correlationField:'id' },
      // { alias:'record',  name:'recordCreated', correlationField:'id' },
    );
    const connectionClassCorrelation = correlateEvents(this.app,
      { alias:'manifest', name:'manifestAdded', correlationField:'id' },
    );
    const connectionCorrelation = correlateSignals(
      { signal: connectionInstanceCorrelation, correlationField: 'connection.agentType', },
      { signal: connectionClassCorrelation, correlationField: 'manifest.id', },
    );

    // const connectionCorrelation = correlateSignals(
    //   { signal: fromBus(this.app, 'connectionCreated'), correlationField: 'agentType', },
    //   { signal: fromBus(this.app, 'manifestAdded'), correlationField: 'id', },
    // );
    this.app.on('linkReady', data=>{
      this.satisfied.push(data.connection.id)
      console.info(`linkReady connectionCorrelation for ${data.connection.id} between:`, data.connection.agentType, data.manifest.id)
      // console.dir(data)
    })
    connectionCorrelation.toEvent(this.app, 'linkReady');

    return new Promise(resolve=>setTimeout(()=>resolve(), 1))

  }

  stop() {
    console.error('TODO: cleanup correlator')
  }

} // class
