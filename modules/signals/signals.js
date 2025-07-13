export class Base {

  identity; // user controller arbitrary value

  name = "Signal";
  #id;
  #value;
  #test;
  #same;
  #subscribers;
  #disposables;
  #children;

  // NOTE: Re: test=v=>!v==undefined... null and undefined are considered equal when using the loose equality operator

  constructor(value, options) {
    this.#id = id();

    const defaults = {
      parent: null,
      same: (a, b) => a == b,
      test: (v) => v !== undefined
    }

    const config = Object.assign({}, defaults, options)

    this.#value = value;
    this.#test = config.test;
    this.#same = config.same;
    this.#subscribers = new Set();
    this.#disposables = new Set();
    this.#children = new Set();
  }

  get id() { return this.#id; }

  test() {
    return this.#test(this.#value);
  }
  // if passes the internal test return value, if not return undefined
  getTested() {
    return this.#test(this.#value)?this.#value:undefined;
  }

  get() {
    return this.value;
  }

  set(v) {
    this.value = v;
  }



  get value() {
    return this.#value;
  }

  set value(newValue) {
    if (this.#same(this.#value, newValue)) return;
    this.#value = newValue;
    this.notify();
  }

  subscribe(subscriber) {
    if (this.#test(this.#value)) subscriber(this.#value);
    this.#subscribers.add(subscriber);
    return () => this.#subscribers.delete(subscriber);
  }

  notify() {
    for (const subscriber of this.#subscribers) subscriber(this.#value);
  }

  terminate(){

    // destroy subscribers
    this.#subscribers.clear();

    // execute and clear disposables
    this.#disposables.forEach((disposable) => disposable());
    this.#disposables.clear();

    // terminate all children;
    this.#children.forEach((child) => child.terminate());
    this.#children.clear();
  }

  // all kinds of disposables can be added/related to a signal
  addDisposable(disposable){
    if(Array.isArray(disposable)){
      disposable.forEach(element=>this.#disposables.add(element))
    }else{
      this.#disposables.add(disposable);
    }
  }

  // complex trees can be created
  addChild(signal){
    this.#children.add(signal);
  }

}


export class Signal extends Base {


  map(predicate) {

    const operatorName = "map";

    // start a blank signal, with options that explain operation name and set the parent
    const responseSignal = new Signal(undefined, {name: operatorName, parent:this});

    // register a child, this is for .terminate() operation to easily clear entire cascades of signals
    this.addChild(responseSignal);

    // when we change, or initialisation can run: finally assign a value to the response signal:
    // note how the predicate is used here, this wisely notifies subscribers if value is changed
    const subscription = this.subscribe((value) =>  responseSignal.value = predicate(value)  );

    // the subscription to the parent is added to the response signal disposables and is cleared on terminate
    // terminating the response signal will unsubscribe it from us (the parent)
    responseSignal.addDisposable(subscription); // when terminate is called on signal all subscriptions are cleared

    // we return a signal,
    return responseSignal;

  }

  filter(predicate) {

    const operatorName = "filter";

    // start a blank signal, with options that explain operation name and set the parent
    const responseSignal = new Signal(undefined, {name: operatorName, parent:this});

    // register a child, this is for .terminate() operation to easily clear entire cascades of signals
    this.addChild(responseSignal);

    // when we change, or initialisation can run: we check filter, and finally assign a value to the response signal:
    // note how the predicate is used here, this wisely notifies subscribers if value is changed
    const subscription = this.subscribe((value) =>  predicate(value)?responseSignal.value=value:null );

    // the subscription to the parent is added to the response signal disposables and is cleared on terminate
    // terminating the response signal will unsubscribe it from us (the parent)
    responseSignal.addDisposable(subscription); // when terminate is called on signal all subscriptions are cleared

    // we return a signal,
    return responseSignal;

  }

  // uses an array, ex: const xySignal = coordinateXSignal.combineLatest(coordinateYSignal); xySignal.subscribe((x,y)=>console.log({x,y}))
  combineLatest(...signals){

    const operatorName = "combineLatest";

    // start a blank signal, with options that explain operation name and set the parent
    const responseSignal = new Signal(undefined, { name: operatorName, parent: this });

    // register a child, this is for .terminate() operation to easily clear entire cascades of signals
    this.addChild(responseSignal);

    const updateCombinedValue = () => {

      // gather up all the values
      const values = [ this.getTested(), ...signals.map(signal => signal.getTested()) ];

      // if all pass their #test on non empty assign to the response signal
      if (values.every(value => value !== undefined)) responseSignal.value = values;

    };

    // subscribe to everything
    const subscriptions = [this, ...signals].map(signal => signal.subscribe(updateCombinedValue) );

    // make sure the cleanup works
    responseSignal.addDisposable(subscriptions);

    // return the new signal
    return responseSignal;
  }





  // iterateValues() {
  // }

  // debounce() {
  // }

  // distinctUntilChanged() {
  // }

  // scan() {
  // }

  // delay() {
  // }

  // throttle() {
  // }

  // withLatestFrom() {
  // }

  // merge() {
  // }

  // log() {
  // }



}

/**

  Signals Usage Example:

  const positionX = Signal
  .combineLatestNamed({ parentWidth:parent.width, offset:this.attributes.offset, type:this.attributes.type })
  .map(({parentWidth, offset, type})=>{ type=='input'?0-offset:parentWidth+offset});

**/

// Utility Functions
function id() {
  const alphabet = 'abcdefghijklmnop'; // 16 characters (base16)
  let id = '';
  for (let i = 0; i < 32; i++) {
    // Generate a random number between 0 and 15
    const randomIndex = Math.floor(Math.random() * 16);
    id += alphabet[randomIndex];
  }
  return id;
}
