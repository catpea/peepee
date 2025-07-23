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
    const contentId = generateId();

    const content = `
      <Panel caption="${this.manifest.name}" width="200" height="200" gap="5">
          <VGroup left="10" top="10" bottom="10" gap="5">
            ${this.manifest.node.inputs.map((port) => `<Port id="${[this.station.id, "input", port.id].join(":")}" group="${this.station.id}" type="input" name="${port.id}" width="180"/>`).join()}
            ${this.manifest.node.outputs.map((port) => `<Port id="${[this.station.id, "output", port.id].join(":")}" group="${this.station.id}" type="output" name="${port.id}" width="180"/>`).join()}
            <Text id="${contentId}" content="" width="180"></Text>
          </VGroup>
      </Panel>
    `;
    const properties = {
      content: contentId
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

function generateId() {
  const randomChars = (length = 8) => Array.from({ length }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
  return `${randomChars()}-${randomChars(4)}-${randomChars(4)}-${randomChars(4)}-${randomChars(12)}`;
}
