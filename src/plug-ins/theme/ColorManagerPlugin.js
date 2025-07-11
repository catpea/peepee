import { Plugin } from 'plugin';

import { ColorFunctions } from './ColorFunctions.js';

export class ColorManagerPlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();
    this.connectionInstances = new Map()
  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;

    this.colorFunctions = new ColorFunctions();

    this.primaryColorTransform = (incomingColor) => {

      const incomingTransformedColor = ColorFunctions.hexToRgb(incomingColor);
      const transformedColor = this.colorFunctions.headcrabInfestation(incomingTransformedColor);
      console.warn({incomingColor, incomingTransformedColor, transformedColor});

      return ColorFunctions.rgboToHex(transformedColor);
    }

  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }
}
