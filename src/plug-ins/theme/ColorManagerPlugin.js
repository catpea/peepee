import { Plugin } from 'plugin';

import { ColorMath, ColorFilters, ColorGenerators } from 'colors';

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

    this.colorFloors = [
      this.createTheme(0),
      this.createTheme(1),
      this.createTheme(2),
      this.createTheme(3),
    ];

    console.log('this.floor2', this.floor2)

    this.primaryColorTransform = (incomingColor) => {

      // const incomingTransformedColor = ColorFunctions.hexToRgb(incomingColor);
      // const transformedColor = this.colorFunctions.headcrabInfestation(incomingTransformedColor);
      // console.warn({incomingColor, incomingTransformedColor, transformedColor});

      // return ColorFunctions.rgboToHex(transformedColor);
      return incomingColor
    }

  }


   createTheme(floorInt) {
      const filter = new ColorFilters();

      const moodMap = [
        () => ColorGenerators.fibonacciSpiral(45, 3),
        () => ColorGenerators.luminanceScaling(220, 60),
        () => ColorGenerators.triadicHarmony(270),
        () => ColorGenerators.analogousGradient(120, 40),
      ];

      const filterMap = [
        (color) => filter.canopyFilter(color, 0.3),
        (color) => filter.mistEffect(color, 0.1),
        (color) => filter.cyberpunkNeon(color, 0.5),
        (color) => filter.iridescence(color, Math.random() * 10, 0.3),
      ];

      const baseTheme = moodMap[floorInt]();
      return this.applyFilterToTheme(baseTheme, filterMap[floorInt]);
    }

    applyFilterToTheme(theme, filterFunction, ...filterParams) {

      const filteredColors = theme.colors.map(hex => {
        const rgb = ColorMath.hexToRgb(hex);
        const filtered = filterFunction(rgb, ...filterParams);
        return ColorMath.rgbToHex(filtered.r, filtered.g, filtered.b);
      });

      return {
        ...theme,
        colors: filteredColors,

        background: filteredColors[0],
        secondary: filteredColors[1],
        primary: filteredColors[2],
        surface: filteredColors[3],
        accent: filteredColors[4],
      };
    }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }
}
