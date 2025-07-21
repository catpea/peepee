import { EventEmitter } from "events";

export default class PassThroughAgent extends EventEmitter {
  id;
  constructor({id}){
    super()
    this.id = id;
  }
  async start(){
    console.log('AGENT START', this.constructor.name)


  }
  async stop(){
    console.log('AGENT STOP', this)
  }
}
