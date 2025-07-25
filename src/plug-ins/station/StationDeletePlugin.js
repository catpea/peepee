import { Plugin } from 'plugin';

export class StationDeletePlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    this.stationManager = app.plugins.get('StationManagerPlugin');
    this.stationInstances = this.stationManager.stationInstances;

   this.app.emit('registerTool', {name:'delete',   data:{id:'delete-tool',   icon:'bi-trash', iconSelected:'bi-trash-fill', description:'delete item' }});

   // DELETE
   this.app.on('selectNode', station => (this.app.selectedTool.value == 'delete') && this.stationRemove(station.id));
   this.app.on('stationRemove', id => this.stationRemove(id) );

   console.warn('TODO: delete connections leading to the station first!')

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }



  stationRemove(id) {
    //console.log('stationRemove',id, this.stationInstances.has(id));
    if (!id) return console.warn("Attempted to remove a station without an id.");
    if (!this.stationInstances.has(id)) return console.warn(`No station found with id: ${id}`);


    this.eventDispatch('deselectAll');

    this.stationInstances.delete(id);
    this.eventDispatch('stationRemoved', id);
  }

}
