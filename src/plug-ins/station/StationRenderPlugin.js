import { Plugin } from 'plugin';

export class StationRenderPlugin extends Plugin {
  app;
  stations;
  subscriptions;

  constructor() {
    super();

    this.subscriptions = new Set();
    this.stations = new Map();
  }

  init(app) {
    this.app = app;
    this.svg = app.svg;

    this.recordsManager = app.plugins.get('RecordsManagerPlugin');
    this.recordInstances = this.recordsManager.recordInstances;


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
    this.app.layers.stations.querySelector(`g.station[data-station-id='${id}']`).remove();
  }

  renderStation( station ) {

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "station");
    group.setAttribute("data-station-id", station.id);

    // this.renderStationLabel(station);
    this.renderStationMarker(station, group);
    // this.renderStationPorts(station, group);

    this.app.layers.stations.appendChild(group);
  }
  renderStationLabel(station){

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "label-text station-label");
    label.setAttribute("x", station.x.value);
    label.setAttribute("y", station.y.value - 20);
    label.textContent = station.label.value;

    label.addEventListener("dblclick", () => {
      const newLabel = prompt("Enter station name:", station.label.value);
      if (newLabel !== null) {
        station.label.value = newLabel;
      }
    });

    station.label.subscribe((newLabel) => {
      label.textContent = newLabel;
    });

    this.app.layers.labels.appendChild(label);

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
    circle.setAttribute("r", station.r);
    circle.addEventListener("click",()=> this.eventDispatch("selectNode", station) );
    group.appendChild(circle);

    this.listenTo(station, 'x', (x) => {
      circle.setAttribute("cx", x);
      // label.setAttribute("x", x);
    });

    this.listenTo(station, 'y', (y) => {
      circle.setAttribute("cy", y);
      // label.setAttribute("y", y - 23);
    });

    this.tuneIn(record.get('strokeColor', 'var(--base01)'), v=>circle.style.stroke = v)
    this.tuneIn(record.get('fillColor', 'var(--base03)'), v=>circle.style.fill = v)


  }

  renderStationPorts(station, group){

    if(agent.ports){
      // Render in-ports
      let inStartAngle = 270;
      const inAngleStep = -36;
      for(const [index, {id, type, format}] of Object.entries(agent.ports.filter(port=>port.type=='in'))){
        const {x, y} = this.getPortCircleCoordinates({ r: station.r.value, x: station.x.value, y: station.y.value, angle:inStartAngle });
        const port = this.renderPort({id, r:station.r.value/2, x, y});
        group.appendChild(port);
        inStartAngle+=inAngleStep;
      }

      // Render out-ports
      let outStartAngle = 90;
      const outAngleStep = 36;
      for(const {id, type, format} of Object.entries(agent.ports.filter(port=>port.type=='out'))){
        const {x, y} = this.getPortCircleCoordinates({ r: station.r.value, x: station.x.value, y: station.y.value, angle:outStartAngle });
        const port = this.renderPort({id, r:station.r.value/2, x, y});
        group.appendChild(port);
        outStartAngle+=outAngleStep;
      }
    }


  }

}

/*
# USAGE
  this.stationManager = app.plugins.get('StationManager');
  this.stationManager.createStation({id:1, x:10, y:10, r:10})


*/
