import { Signal } from "signals";

/**
 * Icon pack plugin
 * usage: <use href="#bi-chevron-down" x="20" y="20" fill="blue" />
 */
export class IconPackPlugin {
  icons = [{ id: "bi-chevron-down", "fill-rule": "evenodd", d: "M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" }];
  constructor() {
    this.engine = null;
  }

  start() {
    //console.log('FFF IconPackPlugin start');

    for (const iconDefinition of this.icons) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      for (const [attributeName, attributeValue] of Object.entries(iconDefinition)) {
        path.setAttribute(attributeName, attributeValue);
      }
      this.engine.defs.appendChild(path);
    }
  }

  stop() {}
}
