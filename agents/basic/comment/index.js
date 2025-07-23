import { EventEmitter } from "events";

export default class NoteAgent extends EventEmitter {
  id;

  constructor({id, manifest, record}){
    super()
    this.id = id;
    this.manifest = manifest;
    this.record = record;
  }

  async start(){


  this.record.subscribe((name, value)=>{
    // console.info('NoteAgent record.subscribe', name, value)
    if( name== 'content') this.emit('output', value)
  });

    console.log('Start', this.manifest.id, this.manifest.description)
  }

  async stop(){
    console.log('Stop', this.constructor.name)
  }

}
