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
    return `
    <Panel caption="Basic Example" width="200" height="200">
      <Group left="10" top="10">
        <VGroup gap="5">
          ${this.manifest.node.inputs.map((port) => `<Port id="${[this.station.id, "input", port.id].join(":")}" group="${this.station.id}" type="input" caption="${port.id}" width="180"/>`).join()}
          ${this.manifest.node.outputs.map((port) => `<Port id="${[this.station.id, "output", port.id].join(":")}" group="${this.station.id}" type="output" caption="${port.id}" width="180"/>`).join()}
        </VGroup>
      </Group>
    </Panel>
  `
  }
}

export function main({ manifest, station, record }) {

  const creator = new Creator({ manifest, station, record });

  return creator.create();

}
