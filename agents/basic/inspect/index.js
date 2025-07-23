import { EventEmitter } from "events";

export default class InspectAgent extends EventEmitter {
  id;
  constructor({id, manifest, record}){
    super()
    this.id = id;
    this.manifest = manifest;
    this.record = record;
  }

  async start(){
    console.log('Start', this.constructor.name)

    this.on('input', data => console.info('Inspect got input', data) )
    this.on('input', data => this.record.set('content', data))
    this.on('input', data => this.emit('output', data))


  }
  async stop(){
    console.log('Stop', this.constructor.name)
  }
}
