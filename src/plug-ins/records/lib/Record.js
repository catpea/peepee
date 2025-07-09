import { Signal } from 'signals';

export class Record {
  #subscribers = new Set();
  #subscriptions = new Set();
  #data = new Map();

  constructor(raw){
    for(const [key, value] of Object.entries(raw)){
      this.set(key, value);
    }
  }

  get id(){
    return this.value('id');
  }

  // create signal and monitor changes
  // all signals go through here
  #createSignal(name){ // name is for notification
    const signal = new Signal();
    const subscription = signal.subscribe(v=>this.notify(name, v));
    this.#subscriptions.add(subscription)
    return signal;
  }

  // return signal it self not value, value is secondary
  get(name, defaultValue){
    if( (defaultValue!==undefined) && (!this.#data.has(name)) ) this.set(name, defaultValue);
    return this.#data.get(name);
  }
  // return value
  value(name){
    const dataSignal = this.#data.get(name);
    return dataSignal.value;
  }

  has(name){
    return this.#data.has(name);
  }

  #ensureSignal(name){
    if(!this.#data.has(name)) this.#data.set(name, this.#createSignal(name));
  }

  set(name, value){
    this.#ensureSignal(name);
    const dataSignal = this.#data.get(name);
    dataSignal.value = value;
    return dataSignal;
  }

  serialize(){
    return Object.fromEntries( Array.from(this.#data).map(([key, signal]) => [key, signal.value]));
  }

  stop() {
    for (const unsubscribe of this.#subscriptions) unsubscribe();
    this.#subscriptions.clear();
    this.#subscribers.clear();
    this.#data.clear();
  }

  // Subbscribe to get notified when any of the signals change.
  subscribe(subscriber){
    // notification only when any signal values change
    this.#subscribers.add(subscriber);
    return () => this.#subscribers.delete(subscriber);
  }

  // notify all subscribers
  notify(...args) {
    for (const subscriber of this.#subscribers) subscriber(...args);
  }

}
