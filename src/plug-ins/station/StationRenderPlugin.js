import { Plugin } from 'plugin';

export class StationRenderPlugin extends Plugin {
  app;
  stations;
  subscriptions;

  constructor() {
    super();

    this.subscriptions = new Set();
    this.stationRendererScrap = new Map();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    this.recordsManager = app.plugins.get('RecordsManagerPlugin');
    this.recordInstances = this.recordsManager.recordInstances;

    this.widgetManagerPlugin = app.plugins.get('WidgetManagerPlugin');
    this.widgetEngine = this.widgetManagerPlugin.widgetEngine;

    this.app.on('stationAdded', station => this.renderStation(station) );
    this.app.on('stationRestored', station => this.renderStation(station) );
    this.app.on('stationRemoved', id => this.removeStation(id));

    this.app.emit('registerTool', {name:'move',  data:{id:'move-tool',  icon:'bi-arrows-move', iconSelected:'bi-arrows-move', description:'move items' }});


  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }



  listenTo(source, name, fn){

    if(source.signal){
      const subscription = source.signal(name, fn);
      this.subscriptions.add(subscription);
    }else if(source.subscribe){
      const subscription = source.subscribe(fn);
      this.subscriptions.add(subscription);
    }else if(source.on){
      const subscription = this.app.on(name, fn);
      this.subscriptions.add(subscription);
    }
  }


  removeStation( id ) {
    this.app.layers.widgets.querySelector(`g.panel[data-station-id='${id}']`).remove();
    this.stationRendererScrap.get(id).forEach(destructible=>destructible())
  }

  renderStation( station ) {
     this.stationRendererScrap.set(station.id, new Set());

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "station");
    group.setAttribute("data-station-id", station.id);
    this.renderStationMarker(station, group);
    this.app.layers.stations.appendChild(group);

  }

  async renderStationMarker( station, group ) {

    let record = this.recordInstances.get(station.id);
    if(!record){
      await this.app.until('recordAdded', station.id);
      record = this.recordInstances.get(station.id);
    }

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "station-circle");
    circle.setAttribute("data-station-id", station.id);
    circle.setAttribute("cx", station.x);
    circle.setAttribute("cy", station.y);
    circle.setAttribute("r", 2);
    circle.addEventListener("click",()=> this.eventDispatch("selectNode", station) );
    group.appendChild(circle);

    const subscription = station.connect().subscribe(([id, x, y, r, label, agentType]) => {
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
    });


    this.stationRendererScrap.get(station.id).add(subscription);


  }


}
