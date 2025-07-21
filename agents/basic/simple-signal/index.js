import { EventEmitter } from "events";

export default class SimpleSignalAgent extends EventEmitter {

  id;
  constructor({id}){
    super()
    this.id = id;
  }




  async start(){
    console.log('Start', this.constructor.name)
  }
  async stop(){
    console.log('Stop', this.constructor.name)
  }
}
