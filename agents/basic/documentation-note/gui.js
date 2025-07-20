class Creator {
  manifest;
  station;
  record;

  fortune = [
    "Your code will compile, but your coffee will not brew.",
    "A bug in your code is just a feature waiting to be discovered.",
    "You will find a semicolon in the most unexpected place.",
    "Debugging is like being the detective in a crime movie where you are also the murderer.",
    "Your next project will be 90% coding and 110% coffee.",
    "The array you seek is just a loop away.",
    "You will soon encounter a mysterious 'undefined' that will change your life.",
    "Remember: Every time you use 'var', a JavaScript developer loses their wings.",
    "Your future is as bright as your console.log statements.",
    "In the world of programming, the only constant is change... and your last commit message."
  ];
  fortuneIndex=-1;

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
            ${this.manifest.node.inputs.map((port) => `<Port id="${[this.station.id, "input", port.id].join(":")}" group="${this.station.id}" type="input" caption="${port.id}" width="180"/>`).join()}
            ${this.manifest.node.outputs.map((port) => `<Port id="${[this.station.id, "output", port.id].join(":")}" group="${this.station.id}" type="output" caption="${port.id}" width="180"/>`).join()}
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
function oneOf(list) {
  var min = 0;
  var max = list.length-1;
  var idx = Math.floor( Math.random() * (max - min + 1)) + min;
  return list[idx];
}
