import { Signal } from 'signals';
import { id } from 'elements';

export class Station {

  // this allows for this[name] access
  #signalStorage = {};

  #defaults = {
    x:0,
    y:0,
    r:32,
    label: 'Untitled',


    agentType: 'basic/pass-through',

  };

  #acceptable = [
    'id','x','y','r','label','agentType'
  ];

  #serializable = [
    'id','x','y','r','label','agentType'
  ]

  constructor(configure) {
    const enriched = Object.assign({}, this.#defaults, configure );
    const picked = this.#pick(this.#acceptable, enriched);
    this.setup(picked);
  }

  // reusable creator used by deserializer and constructor
  setup(options){

    this.#signalStorage.id = new Signal(options.id??id());
    this.#signalStorage.agentType = new Signal(options.agentType);
    this.#signalStorage.label = new Signal(options.label);

    this.#signalStorage.x = new Signal(options.x);
    this.#signalStorage.y = new Signal(options.y);
    this.#signalStorage.r = new Signal(options.r);

  }

  entries(){
    return this.#serializable.map(key=>[key, this.get(key)])
  }

  deserialize(data){
    const picked = this.#pick(this.#acceptable, data);
    this.setup(picked);
  }

  serialize(){
    const picked = this.#pick(this.#serializable, this);
    return picked
  }

  // Ease Of Access

  get id(){ return this.#signalStorage.id.value; } // hidden, unless asked

  get agentType(){ return this.#signalStorage.agentType.value; }
  set agentType(v){ this.#signalStorage.agentType.value = v; }

  get x(){ return this.#signalStorage.x.value; }
  set x(v){ this.#signalStorage.x.value = v; }

  get y(){ return this.#signalStorage.y.value; }
  set y(v){ this.#signalStorage.y.value = v; }

  get r(){ return this.#signalStorage.r.value; }
  set r(v){ this.#signalStorage.r.value = v; }

  get label(){ return this.#signalStorage.label.value; }
  set label(v){ this.#signalStorage.label.value = v; }

  get signals(){ return this.#signalStorage; } // station5.signals access

  get(name){
    return this.#signalStorage[name].value;
  }

  set(name, value){
    this.#signalStorage[name].value = value;
  }

  // Subscription Tools

  // signal(name, subscriber){ // station6('x', fn)
  //   return this.#signalStorage[name].subscribe(subscriber);
  // }


  connect(){
    const response =  this.#signalStorage.id.combineLatest(...this.#acceptable.filter(o=>o!=='id').map(name=>this.#signalStorage[name]))
    //response.subscribe(console.warn)
    return response;


  }



  // Helper & Utility Functions
  #pick(keys, data){
    const entries = (data.entries?data.entries():Object.entries(data));
    const cleared = entries.filter(([k,v])=>keys.includes(k));
    return Object.fromEntries(cleared);
  }

}
