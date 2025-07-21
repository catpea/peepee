import { generateId } from '../../api.js';

class Creator {
  manifest;
  station;
  record;

  constructor({ manifest, station, record }){
    this.manifest = manifest;
    this.station = station;
    this.record = record;
  }

  create(){
    // const contentId = generateId();

    const content = `
      <Panel caption="${this.manifest.name}" width="200" height="200" gap="5">
          <VGroup left="10" top="10" bottom="10" gap="5">
            ${this.manifest.node.inputs.map((port) => `<Port id="${[this.station.id, "input", port.id].join(":")}" group="${this.station.id}" type="input" caption="${port.id}" width="180"/>`).join()}
            ${this.manifest.node.outputs.map((port) => `<Port id="${[this.station.id, "output", port.id].join(":")}" group="${this.station.id}" type="output" caption="${port.id}" width="180"/>`).join()}
          </VGroup>
      </Panel>
    `;
    const properties = {
      // content: contentId
    };
    return {
      content,
      properties
    };
  }
}

export function main({ app, manifest, station, record }) {
  const creator = new Creator({ app, manifest, station, record });
  return creator.create();
}
