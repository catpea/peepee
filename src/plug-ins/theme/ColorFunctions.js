/**
 * ColorFunctions - A comprehensive collection of nature and sci-fi inspired color transformations
 * Based on real-world light phenomena and fictional energy effects
 */
export class ColorFunctions {
  constructor() {
    this.time = 0;
    this.animationId = null;
    this.startTime = Date.now();
  }

  // Utility methods
  static clamp(value, min = 0, max = 255) {
    return Math.max(min, Math.min(max, value));
  }

  static hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
  }

  // ======================
  // UTILITY METHODS
  // ======================

  getAllEffects() {
    return [
      'darkOceanDepths', 'nightLakeReflection', 'foxfire', 'moonlessForest', 'deepCaveAmbient', 'terminatorVision', 'predatorThermal', 'nightVisionGoggles', 'cyberpunkNeon', 'ghostlySpectral', 'nebulaDust', 'plutoAtmosphere', 'blackHoleAccretion', 'voidCold', 'cosmicRadiation',
      'atmosphericScatter', 'sunsetGradient', 'mistEffect', 'chromaticAberration', 'iridescence', 'oilSlick', 'soapBubble', 'prismDispersion', 'sunlightTransform', 'moonlightTransform', 'starlight', 'bioluminescence', 'butterflyWing', 'firefly', 'underwaterCaustics', 'deepSeaGlow', 'auroraTransform', 'lightning', 'canopyFilter', 'xenCrystal', 'gravityGun', 'combine', 'headcrabInfestation', 'lambdaCore', 'portalEnergy', 'radioactive',
    ];
  }

  getRandomEffect() {
    const effects = this.getAllEffects();
    return effects[Math.floor(Math.random() * effects.length)];
  }

  applyEffect(effectName, baseColor, ...params) {
    if (typeof this[effectName] === "function") {
      return this[effectName](baseColor, ...params);
    }
    return baseColor;
  }

  // Chain multiple effects
  chain(baseColor, ...effectsWithParams) {
    return effectsWithParams.reduce((color, effect) => {
      if (typeof effect === "string") {
        return this.applyEffect(effect, color);
      } else if (Array.isArray(effect)) {
        const [effectName, ...params] = effect;
        return this.applyEffect(effectName, color, ...params);
      }
      return color;
    }, baseColor);
  }

  // Convert RGB to hex
  static rgboToHex(rgb) {
    const { r, g, b } = rgb;
    return ColorFunctions.rgbToHex(r, g, b);
  }
  static rgbToHex(r, g, b) {


    //console.info(r, g, b)
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  // Convert hex to RGB
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : {r:0,g:0,b:0};
  }
}
