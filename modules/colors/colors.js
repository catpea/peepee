export class ColorMath {
  static goldenRatio = 1.618033988749;
  static goldenAngle = 137.507764; // 360 / φ

  static clamp(value, min = 0, max = 255) {
    return Math.max(min, Math.min(max, value));
  }

  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  static rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1);
  }

  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  static hslToRgb(h, s, l) {
    h = h / 360;
    s = s / 100;
    l = l / 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  static fibonacci(n) {
    if (n <= 1) return n;
    let a = 0,
      b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }
}

export class ColorFilters {
  constructor() {
    this.startTime = Date.now();
    this.time = 0;
  }

  updateTime() {
    this.time = (Date.now() - this.startTime) * 0.001;
  }

  // ======================
  // SIMPLE FILTERS
  // ======================

  simpleWarm(r, g, b) {
    return {
      r: ColorMath.clamp(r + 15),
      g: ColorMath.clamp(g + 5),
      b: ColorMath.clamp(b - 10),
    };
  }

  simpleCool(r, g, b) {
    return {
      r: ColorMath.clamp(r - 10),
      g: ColorMath.clamp(g + 5),
      b: ColorMath.clamp(b + 15),
    };
  }

  simpleVintage(r, g, b) {
    return {
      r: ColorMath.clamp(r * 0.9 + 20),
      g: ColorMath.clamp(g * 0.85 + 15),
      b: ColorMath.clamp(b * 0.7 + 10),
    };
  }

  simpleNeon(r, g, b) {
    return {
      r: ColorMath.clamp(r * 1.2),
      g: ColorMath.clamp(g * 1.1),
      b: ColorMath.clamp(b * 1.15),
    };
  }

  simpleChromatic(r, g, b) {
    return {
      r: ColorMath.clamp(r + 15),
      g: g,
      b: ColorMath.clamp(b - 10),
    };
  }

  // ======================
  // NATURE - DARK ATMOSPHERES
  // ======================

  darkOceanDepths(baseColor, depth = 0.5) {
    this.updateTime();
    const pressure = Math.pow(depth, 2);
    const currentFlow = Math.sin(this.time * 0.3 + depth * 2) * 0.1 + 0.9;
    const bioLuminescence = Math.sin(this.time * 0.8) * 0.05 * (1 - depth);

    return {
      r: ColorMath.clamp(baseColor.r * (0.1 + pressure * 0.2) * currentFlow),
      g: ColorMath.clamp(baseColor.g * (0.3 + pressure * 0.1) * currentFlow + bioLuminescence * 30),
      b: ColorMath.clamp(baseColor.b * (0.8 - pressure * 0.3) * currentFlow + bioLuminescence * 80),
    };
  }

  nightLakeReflection(baseColor, stillness = 0.5) {
    this.updateTime();
    const ripple = Math.sin(this.time * 0.5 + stillness * 3) * (1 - stillness) * 0.15;
    const moonlight = Math.cos(this.time * 0.2) * 0.1 + 0.9;
    const reflection = 0.6 + ripple;

    return {
      r: ColorMath.clamp(baseColor.r * 0.4 * reflection * moonlight),
      g: ColorMath.clamp(baseColor.g * 0.5 * reflection * moonlight),
      b: ColorMath.clamp(baseColor.b * 0.9 * reflection * moonlight + 20),
    };
  }

  foxfire(baseColor, intensity = 0.5) {
    this.updateTime();
    const flicker = Math.sin(this.time * 4 + intensity * 2) * 0.3 + 0.7;
    const glow = Math.cos(this.time * 2.5) * 0.2 + 0.8;
    const phosphorescence = intensity * flicker * glow;

    return {
      r: ColorMath.clamp(baseColor.r * 0.2 + phosphorescence * 50),
      g: ColorMath.clamp(baseColor.g * 0.3 + phosphorescence * 150),
      b: ColorMath.clamp(baseColor.b * 0.1 + phosphorescence * 30),
    };
  }

  moonlessForest(baseColor, density = 0.5) {
    this.updateTime();
    const shadow = Math.pow(density, 1.5);
    const whisper = Math.sin(this.time * 0.1 + density * 4) * 0.05 + 0.95;
    const mystery = Math.cos(this.time * 0.3) * 0.02 + 0.98;

    return {
      r: ColorMath.clamp(baseColor.r * (0.15 - shadow * 0.1) * whisper),
      g: ColorMath.clamp(baseColor.g * (0.25 - shadow * 0.05) * whisper * mystery),
      b: ColorMath.clamp(baseColor.b * (0.35 - shadow * 0.15) * mystery),
    };
  }

  deepCaveAmbient(baseColor, depth = 0.5) {
    this.updateTime();
    const echo = Math.sin(this.time * 0.2 + depth * 5) * 0.03 + 0.97;
    const minerals = Math.cos(this.time * 0.15) * 0.02 + 0.98;
    const dampness = 0.9 - depth * 0.3;

    return {
      r: ColorMath.clamp(baseColor.r * 0.1 * echo * dampness),
      g: ColorMath.clamp(baseColor.g * 0.2 * minerals * dampness),
      b: ColorMath.clamp(baseColor.b * 0.3 * echo * minerals),
    };
  }

  // ======================
  // GAMING - NIGHT EFFECTS
  // ======================

  terminatorVision(baseColor, scanline = 0.5) {
    this.updateTime();
    const scan = Math.sin(this.time * 8 + scanline * 10) * 0.2 + 0.8;
    const targeting = Math.cos(this.time * 12) * 0.1 + 0.9;
    const hud = Math.sin(this.time * 6) * 0.05 + 0.95;

    return {
      r: ColorMath.clamp(baseColor.r * 1.2 * scan * targeting),
      g: ColorMath.clamp(baseColor.g * 0.3 * hud),
      b: ColorMath.clamp(baseColor.b * 0.1 * scan),
    };
  }

  predatorThermal(baseColor, heatSignature = 0.5) {
    this.updateTime();
    const thermal = Math.sin(this.time * 3 + heatSignature * 5) * 0.3 + 0.7;
    const interference = Math.cos(this.time * 7) * 0.1 + 0.9;
    const signature = heatSignature * thermal;

    return {
      r: ColorMath.clamp(baseColor.r * 0.2 + signature * 200 * interference),
      g: ColorMath.clamp(baseColor.g * 0.1 + signature * 100),
      b: ColorMath.clamp(baseColor.b * 0.05 + signature * 50),
    };
  }

  nightVisionGoggles(baseColor, amplification = 0.5) {
    this.updateTime();
    const grain = Math.sin(this.time * 20) * 0.05 + 0.95;
    const boost = 1 + amplification * 2;
    const greenFilter = Math.cos(this.time * 0.5) * 0.1 + 0.9;

    return {
      r: ColorMath.clamp(baseColor.r * 0.1 * grain),
      g: ColorMath.clamp(baseColor.g * boost * greenFilter * grain),
      b: ColorMath.clamp(baseColor.b * 0.2 * grain),
    };
  }

  cyberpunkNeon(baseColor, voltage = 0.5) {
    this.updateTime();
    const flicker = Math.sin(this.time * 15 + voltage * 8) * 0.2 + 0.8;
    const buzz = Math.cos(this.time * 25) * 0.1 + 0.9;
    const neon = voltage * flicker * buzz;

    return {
      r: ColorMath.clamp(baseColor.r * 0.3 + neon * 150),
      g: ColorMath.clamp(baseColor.g * 0.2 + neon * 100),
      b: ColorMath.clamp(baseColor.b * 0.1 + neon * 200),
    };
  }

  ghostlySpectral(baseColor, manifestation = 0.5) {
    this.updateTime();
    const phase = Math.sin(this.time * 1.5 + manifestation * 3) * 0.4 + 0.6;
    const ethereal = Math.cos(this.time * 2.2) * 0.3 + 0.7;
    const spectral = manifestation * phase * ethereal;

    return {
      r: ColorMath.clamp(baseColor.r * 0.4 * spectral),
      g: ColorMath.clamp(baseColor.g * 0.6 * spectral),
      b: ColorMath.clamp(baseColor.b * 0.9 * spectral + 40),
    };
  }

  // ======================
  // UNIVERSE - DEEP SPACE
  // ======================

  nebulaDust(baseColor, density = 0.5) {
    this.updateTime();
    const drift = Math.sin(this.time * 0.1 + density * 2) * 0.2 + 0.8;
    const stellar = Math.cos(this.time * 0.3) * 0.1 + 0.9;
    const cosmic = density * drift * stellar;

    return {
      r: ColorMath.clamp(baseColor.r * 0.6 * cosmic + 30),
      g: ColorMath.clamp(baseColor.g * 0.4 * cosmic + 10),
      b: ColorMath.clamp(baseColor.b * 0.8 * cosmic + 60),
    };
  }

  plutoAtmosphere(baseColor, altitude = 0.5) {
    this.updateTime();
    const methane = Math.sin(this.time * 0.2 + altitude * 3) * 0.1 + 0.9;
    const nitrogen = Math.cos(this.time * 0.15) * 0.05 + 0.95;
    const frozen = 0.3 - altitude * 0.2;

    return {
      r: ColorMath.clamp(baseColor.r * frozen * methane),
      g: ColorMath.clamp(baseColor.g * (frozen + 0.1) * nitrogen),
      b: ColorMath.clamp(baseColor.b * (frozen + 0.2) * methane * nitrogen),
    };
  }

  blackHoleAccretion(baseColor, eventHorizon = 0.5) {
    this.updateTime();
    const gravity = Math.pow(eventHorizon, 2);
    const redshift = Math.sin(this.time * 0.8 + eventHorizon * 4) * 0.3 + 0.7;
    const spacetime = Math.cos(this.time * 1.2) * 0.2 + 0.8;

    return {
      r: ColorMath.clamp(baseColor.r * (1 - gravity * 0.8) * redshift),
      g: ColorMath.clamp(baseColor.g * (1 - gravity * 0.9) * spacetime),
      b: ColorMath.clamp(baseColor.b * (1 - gravity * 0.7) * redshift * spacetime),
    };
  }

  voidCold(baseColor, emptiness = 0.5) {
    this.updateTime();
    const absolute = Math.pow(emptiness, 3);
    const quantum = Math.sin(this.time * 0.05) * 0.01 + 0.99;
    const void_ = absolute * quantum;

    return {
      r: ColorMath.clamp(baseColor.r * (0.05 + void_ * 0.1)),
      g: ColorMath.clamp(baseColor.g * (0.08 + void_ * 0.12)),
      b: ColorMath.clamp(baseColor.b * (0.12 + void_ * 0.15)),
    };
  }

  cosmicRadiation(baseColor, intensity = 0.5) {
    this.updateTime();
    const gamma = Math.sin(this.time * 5 + intensity * 6) * 0.3 + 0.7;
    const particle = Math.cos(this.time * 8) * 0.2 + 0.8;
    const radiation = intensity * gamma * particle;

    return {
      r: ColorMath.clamp(baseColor.r * 0.3 + radiation * 80),
      g: ColorMath.clamp(baseColor.g * 0.4 + radiation * 120),
      b: ColorMath.clamp(baseColor.b * 0.2 + radiation * 180),
    };
  }

  // ======================
  // ATMOSPHERIC EFFECTS
  // ======================

  atmosphericScatter(baseColor, scatterAmount = 0.3) {
    const r = baseColor.r * (1 - scatterAmount * 0.8);
    const g = baseColor.g * (1 - scatterAmount * 0.6);
    const b = baseColor.b * (1 - scatterAmount * 0.2);
    return {
      r: ColorMath.clamp(r),
      g: ColorMath.clamp(g),
      b: ColorMath.clamp(b),
    };
  }

  sunsetGradient(baseColor, elevation = 0.5) {
    const sunsetFactor = Math.sin(elevation * Math.PI);
    const orangeShift = sunsetFactor * 0.8;
    const redShift = sunsetFactor * 0.6;

    return {
      r: ColorMath.clamp(baseColor.r + orangeShift * 100 + redShift * 50),
      g: ColorMath.clamp(baseColor.g + orangeShift * 60 - redShift * 30),
      b: ColorMath.clamp(baseColor.b - orangeShift * 80 - redShift * 100),
    };
  }

  mistEffect(baseColor, density = 0.4) {
    const mistFactor = 1 - density;
    const whiteBlend = density * 0.7;

    return {
      r: ColorMath.clamp(baseColor.r * mistFactor + 255 * whiteBlend),
      g: ColorMath.clamp(baseColor.g * mistFactor + 255 * whiteBlend),
      b: ColorMath.clamp(baseColor.b * mistFactor + 255 * whiteBlend),
    };
  }

  // ======================
  // OPTICAL PHENOMENA
  // ======================

  chromaticAberration(baseColor, intensity = 0.1) {
    return {
      r: ColorMath.clamp(baseColor.r + intensity * 50),
      g: baseColor.g,
      b: ColorMath.clamp(baseColor.b - intensity * 30),
    };
  }

  iridescence(baseColor, angle = 0, intensity = 0.8) {
    this.updateTime();
    const shimmer = Math.sin(angle + this.time * 2) * intensity;
    const hueShift = shimmer * 60;

    // Convert to HSL-like manipulation
    const max = Math.max(baseColor.r, baseColor.g, baseColor.b);
    const min = Math.min(baseColor.r, baseColor.g, baseColor.b);
    const delta = max - min;

    if (delta === 0) return baseColor;

    let h = 0;
    if (max === baseColor.r) h = ((baseColor.g - baseColor.b) / delta) % 6;
    else if (max === baseColor.g) h = (baseColor.b - baseColor.r) / delta + 2;
    else h = (baseColor.r - baseColor.g) / delta + 4;

    h = (h * 60 + hueShift) % 360;
    if (h < 0) h += 360;

    const l = (max + min) / 2 / 255;
    const s = delta === 0 ? 0 : delta / (255 - Math.abs(2 * l * 255 - 255));

    return ColorMath.hslToRgb(h, s * 100, l * 100);
  }

  oilSlick(baseColor, thickness = 0.5) {
    this.updateTime();
    const interference = Math.sin(thickness * 10 + this.time * 3) * 0.5 + 0.5;
    const hueShift = interference * 180 + 180;

    return ColorMath.hslToRgb(hueShift, 80 + interference * 20, 30 + interference * 40);
  }

  soapBubble(baseColor, surfaceAngle = 0) {
    this.updateTime();
    const t = this.time * 0.5 + surfaceAngle;
    const r = Math.sin(t) * 0.5 + 0.5;
    const g = Math.sin(t + 2.094) * 0.5 + 0.5; // 2π/3
    const b = Math.sin(t + 4.188) * 0.5 + 0.5; // 4π/3

    return {
      r: ColorMath.clamp(r * 255 * 0.8 + baseColor.r * 0.2),
      g: ColorMath.clamp(g * 255 * 0.8 + baseColor.g * 0.2),
      b: ColorMath.clamp(b * 255 * 0.8 + baseColor.b * 0.2),
    };
  }

  prismDispersion(wavelength) {
    let r = 0,
      g = 0,
      b = 0;

    if (wavelength >= 380 && wavelength <= 440) {
      r = -(wavelength - 440) / (440 - 380);
      b = 1.0;
    } else if (wavelength >= 440 && wavelength <= 490) {
      g = (wavelength - 440) / (490 - 440);
      b = 1.0;
    } else if (wavelength >= 490 && wavelength <= 510) {
      g = 1.0;
      b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength <= 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1.0;
    } else if (wavelength >= 580 && wavelength <= 645) {
      r = 1.0;
      g = -(wavelength - 645) / (645 - 580);
    } else if (wavelength >= 645 && wavelength <= 750) {
      r = 1.0;
    }

    return {
      r: ColorMath.clamp(r * 255),
      g: ColorMath.clamp(g * 255),
      b: ColorMath.clamp(b * 255),
    };
  }

  // ======================
  // CELESTIAL EFFECTS
  // ======================

  sunlightTransform(baseColor, timeOfDay = 0.5) {
    // 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset, 1 = midnight
    const sunAngle = Math.sin(timeOfDay * Math.PI * 2);
    const warmth = Math.max(0, sunAngle);
    const coolness = Math.max(0, -sunAngle);

    return {
      r: ColorMath.clamp(baseColor.r + warmth * 50 - coolness * 30),
      g: ColorMath.clamp(baseColor.g + warmth * 30 - coolness * 10),
      b: ColorMath.clamp(baseColor.b - warmth * 30 + coolness * 50),
    };
  }

  moonlightTransform(baseColor, phase = 0.5) {
    const moonIntensity = Math.sin(phase * Math.PI);
    const silverShift = moonIntensity * 0.3;

    return {
      r: ColorMath.clamp(baseColor.r * (0.4 + silverShift)),
      g: ColorMath.clamp(baseColor.g * (0.5 + silverShift)),
      b: ColorMath.clamp(baseColor.b * (0.8 + silverShift)),
    };
  }

  starlight(baseColor, twinkle = true) {
    this.updateTime();
    const sparkle = twinkle ? Math.sin(this.time * 8) * 0.3 + 0.7 : 1;
    const cosmic = 0.1 + sparkle * 0.2;

    return {
      r: ColorMath.clamp(baseColor.r * cosmic + 40),
      g: ColorMath.clamp(baseColor.g * cosmic + 60),
      b: ColorMath.clamp(baseColor.b * cosmic + 100),
    };
  }

  // ======================
  // BIOLOGICAL EFFECTS
  // ======================

  bioluminescence(baseColor, glowIntensity = 0.5) {
    this.updateTime();
    const pulse = Math.sin(this.time * 2) * glowIntensity + 1;

    return {
      r: ColorMath.clamp(baseColor.r * pulse * 0.3),
      g: ColorMath.clamp(baseColor.g * pulse * 1.2),
      b: ColorMath.clamp(baseColor.b * pulse * 0.8),
    };
  }

  butterflyWing(baseColor, scale = 0.5) {
    this.updateTime();
    const iridescent = this.iridescence(baseColor, scale * 10, 0.6);
    const metallic = Math.sin(this.time + scale * 5) * 0.3 + 0.7;

    return {
      r: ColorMath.clamp(iridescent.r * metallic),
      g: ColorMath.clamp(iridescent.g * metallic),
      b: ColorMath.clamp(iridescent.b * metallic),
    };
  }

  firefly(baseColor, energy = 1.0) {
    this.updateTime();
    const flicker = Math.random() < 0.95 ? 1 : 0.3;
    const glow = Math.sin(this.time * 3) * 0.4 + 0.6;

    return {
      r: ColorMath.clamp(255 * energy * flicker * glow),
      g: ColorMath.clamp(255 * energy * flicker * glow * 0.8),
      b: ColorMath.clamp(50 * energy * flicker * glow),
    };
  }

  // ======================
  // AQUATIC EFFECTS
  // ======================

  underwaterCaustics(baseColor, depth = 0.5) {
    this.updateTime();
    const wave1 = Math.sin(this.time * 0.7 + depth * 3) * 0.3;
    const wave2 = Math.cos(this.time * 1.1 + depth * 2) * 0.2;
    const causticEffect = (wave1 + wave2) * 0.5 + 1;

    return {
      r: ColorMath.clamp(baseColor.r * (1 - depth * 0.7)),
      g: ColorMath.clamp(baseColor.g * (1 - depth * 0.4) * causticEffect),
      b: ColorMath.clamp(baseColor.b * causticEffect),
    };
  }

  deepSeaGlow(baseColor, depth = 0.8) {
    const pressure = Math.min(1, depth);
    const abyssal = 1 - pressure;

    return {
      r: ColorMath.clamp(baseColor.r * abyssal * 0.1),
      g: ColorMath.clamp(baseColor.g * abyssal * 0.3),
      b: ColorMath.clamp(baseColor.b * (0.5 + abyssal * 0.5)),
    };
  }

  // ======================
  // NATURAL PHENOMENA
  // ======================

  auroraTransform(baseColor, altitude = 0.5) {
    this.updateTime();
    const dance = Math.sin(this.time * 0.5 + altitude * 2) * 0.5 + 0.5;
    const greenIntensity = Math.sin(altitude * Math.PI) * 0.8 * dance;
    const purpleIntensity = Math.cos(altitude * Math.PI * 0.7) * 0.6 * dance;

    return {
      r: ColorMath.clamp(baseColor.r + purpleIntensity * 100),
      g: ColorMath.clamp(baseColor.g + greenIntensity * 150),
      b: ColorMath.clamp(baseColor.b + (greenIntensity + purpleIntensity) * 80),
    };
  }

  lightning(baseColor, intensity = 1.0) {
    this.updateTime();
    const strike = Math.random() < 0.05 ? 1 : 0;
    const afterglow = Math.max(0, Math.sin(this.time * 10) * 0.3);
    const flash = strike + afterglow;

    return {
      r: ColorMath.clamp(baseColor.r + flash * 200 * intensity),
      g: ColorMath.clamp(baseColor.g + flash * 220 * intensity),
      b: ColorMath.clamp(baseColor.b + flash * 255 * intensity),
    };
  }

  canopyFilter(baseColor, density = 0.6) {
    const greenShift = Math.random() * 0.3 + 0.2;
    const dappling = Math.sin(Math.random() * Math.PI * 2) * 0.4 + 0.6;

    return {
      r: ColorMath.clamp(baseColor.r * (1 - density * 0.7) * dappling),
      g: ColorMath.clamp(baseColor.g * (1 + greenShift) * dappling),
      b: ColorMath.clamp(baseColor.b * (1 - density * 0.5) * dappling),
    };
  }

  // ======================
  // SCI-FI GAME EFFECTS
  // ======================

  xenCrystal(baseColor, resonance = 0.5) {
    this.updateTime();
    const harmonic = Math.sin(this.time * 4 + resonance * 6) * 0.4 + 0.6;
    const energy = Math.cos(this.time * 2.3) * 0.3 + 0.7;

    return {
      r: ColorMath.clamp(baseColor.r * 0.2 + 100 * harmonic),
      g: ColorMath.clamp(baseColor.g * 0.8 + 150 * energy),
      b: ColorMath.clamp(baseColor.b * 1.2 + 200 * harmonic),
    };
  }

  gravityGun(baseColor, charge = 0.5) {
    this.updateTime();
    const field = Math.sin(this.time * 6) * charge * 0.5 + charge;
    const distortion = Math.cos(this.time * 8) * 0.2 + 0.8;

    return {
      r: ColorMath.clamp(baseColor.r * (1 - field * 0.5) + field * 50),
      g: ColorMath.clamp(baseColor.g * distortion + field * 100),
      b: ColorMath.clamp(baseColor.b * (1 + field * 0.8) + field * 150),
    };
  }

  combine(baseColor, suppression = 0.7) {
    const dystopian = 1 - suppression;
    const orangeOverlay = suppression * 0.6;

    return {
      r: ColorMath.clamp(baseColor.r * dystopian + 255 * orangeOverlay),
      g: ColorMath.clamp(baseColor.g * dystopian + 120 * orangeOverlay),
      b: ColorMath.clamp(baseColor.b * dystopian + 0 * orangeOverlay),
    };
  }

  headcrabInfestation(baseColor, corruption = 0.4) {
    this.updateTime();
    const pulse = Math.sin(this.time * 3) * corruption * 0.3 + corruption;
    const decay = 1 - corruption * 0.5;

    return {
      r: ColorMath.clamp(baseColor.r * decay + pulse * 150),
      g: ColorMath.clamp(baseColor.g * decay + pulse * 80),
      b: ColorMath.clamp(baseColor.b * decay + pulse * 40),
    };
  }

  lambdaCore(baseColor, stability = 0.8) {
    this.updateTime();
    const quantum = Math.sin(this.time * 5) * (1 - stability) * 0.5 + stability;
    const resonance = Math.cos(this.time * 3.7) * 0.3 + 0.7;

    return {
      r: ColorMath.clamp(baseColor.r * quantum + 255 * (1 - stability) * resonance),
      g: ColorMath.clamp(baseColor.g * quantum + 180 * (1 - stability) * resonance),
      b: ColorMath.clamp(baseColor.b * quantum + 50 * (1 - stability) * resonance),
    };
  }

  // ======================
  // ADDITIONAL SCI-FI EFFECTS
  // ======================

  portalEnergy(baseColor, instability = 0.3) {
    this.updateTime();
    const vortex = Math.sin(this.time * 8 + instability * 10) * instability + (1 - instability);
    const dimensional = Math.cos(this.time * 6) * 0.4 + 0.6;

    return {
      r: ColorMath.clamp(baseColor.r * vortex * 0.3 + 255 * dimensional * instability),
      g: ColorMath.clamp(baseColor.g * vortex * 0.1 + 100 * dimensional * instability),
      b: ColorMath.clamp(baseColor.b * vortex + 255 * dimensional),
    };
  }

  radioactive(baseColor, decay = 0.5) {
    this.updateTime();
    const geiger = Math.random() < 0.1 ? 1.5 : 1;
    const contamination = Math.sin(this.time * 2) * decay * 0.3 + decay;

    return {
      r: ColorMath.clamp(baseColor.r * (1 - contamination * 0.5)),
      g: ColorMath.clamp(baseColor.g * (1 + contamination * 0.8) * geiger),
      b: ColorMath.clamp(baseColor.b * (1 - contamination * 0.7)),
    };
  }
}

export class ColorGenerators {
  static goldenRatioTheme(baseHue, baseSaturation = 70, baseLightness = 50) {
    const colors = [];
    const lightnesses = [20, 35, 50, 65, 80];

    for (let i = 0; i < 5; i++) {
      const hue = (baseHue + i * ColorMath.goldenAngle) % 360;
      const saturation = baseSaturation + ((i * 10) % 40);
      const lightness = lightnesses[i];

      const rgb = ColorMath.hslToRgb(hue, saturation, lightness);
      colors.push(ColorMath.rgbToHex(rgb.r, rgb.g, rgb.b));
    }

    return {
      name: `Golden φ ${Math.round(baseHue)}°`,
      colors: colors,
      primary: colors[2],
      secondary: colors[1],
      accent: colors[4],
      background: colors[0],
      surface: colors[3],
    };
  }

  static triadicHarmony(baseHue, intensity = 0.7) {
    const hues = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
    const colors = [];

    hues.forEach((hue, i) => {
      const saturation = 60 + i * 15;
      const lightness = 30 + i * 25;

      const rgb = ColorMath.hslToRgb(hue, saturation, lightness);
      colors.push(ColorMath.rgbToHex(rgb.r, rgb.g, rgb.b));
    });

    // Add lighter and darker variants
    const mainHue = hues[0];
    const lightRgb = ColorMath.hslToRgb(mainHue, 40, 85);
    const darkRgb = ColorMath.hslToRgb(mainHue, 80, 15);

    colors.push(ColorMath.rgbToHex(lightRgb.r, lightRgb.g, lightRgb.b));
    colors.push(ColorMath.rgbToHex(darkRgb.r, darkRgb.g, darkRgb.b));

    return {
      name: `Triadic ${Math.round(baseHue)}°`,
      colors: colors,
      primary: colors[0],
      secondary: colors[1],
      accent: colors[2],
      background: colors[4],
      surface: colors[3],
    };
  }

  static analogousGradient(baseHue, spread = 30) {
    const colors = [];
    const hueRange = spread;

    for (let i = 0; i < 5; i++) {
      const hue = (baseHue + ((i - 2) * hueRange) / 4) % 360;
      const saturation = 50 + i * 10;
      const lightness = 25 + i * 15;

      const rgb = ColorMath.hslToRgb(hue, saturation, lightness);
      colors.push(ColorMath.rgbToHex(rgb.r, rgb.g, rgb.b));
    }

    return {
      name: `Analogous ${Math.round(baseHue)}°`,
      colors: colors,
      primary: colors[2],
      secondary: colors[1],
      accent: colors[4],
      background: colors[0],
      surface: colors[3],
    };
  }

  static splitComplementary(baseHue) {
    const complementary = (baseHue + 180) % 360;
    const hues = [baseHue, (complementary - 30 + 360) % 360, (complementary + 30) % 360];

    const colors = [];

    hues.forEach((hue, i) => {
      const saturation = 60 + i * 10;
      const lightness = 35 + i * 20;

      const rgb = ColorMath.hslToRgb(hue, saturation, lightness);
      colors.push(ColorMath.rgbToHex(rgb.r, rgb.g, rgb.b));
    });

    // Add neutral variants
    const neutralRgb1 = ColorMath.hslToRgb(baseHue, 20, 90);
    const neutralRgb2 = ColorMath.hslToRgb(baseHue, 40, 10);

    colors.push(ColorMath.rgbToHex(neutralRgb1.r, neutralRgb1.g, neutralRgb1.b));
    colors.push(ColorMath.rgbToHex(neutralRgb2.r, neutralRgb2.g, neutralRgb2.b));

    return {
      name: `Split Comp ${Math.round(baseHue)}°`,
      colors: colors,
      primary: colors[0],
      secondary: colors[1],
      accent: colors[2],
      background: colors[4],
      surface: colors[3],
    };
  }

  static luminanceScaling(baseHue, baseSaturation = 70) {
    const colors = [];
    const luminanceSteps = [0.05, 0.2, 0.4, 0.7, 0.9];

    luminanceSteps.forEach((luminance, i) => {
      // Convert luminance to perceived lightness
      const lightness = Math.sqrt(luminance) * 100;
      const saturation = baseSaturation * (1 - luminance * 0.3);

      const rgb = ColorMath.hslToRgb(baseHue, saturation, lightness);
      colors.push(ColorMath.rgbToHex(rgb.r, rgb.g, rgb.b));
    });

    return {
      name: `Luminance ${Math.round(baseHue)}°`,
      colors: colors,
      primary: colors[2],
      secondary: colors[1],
      accent: colors[3],
      background: colors[0],
      surface: colors[4],
    };
  }

  static fibonacciSpiral(baseHue, turns = 3) {
    const colors = [];

    for (let i = 0; i < 5; i++) {
      const fibRatio = ColorMath.fibonacci(i + 3) / ColorMath.fibonacci(i + 4);
      const hue = (baseHue + i * 360 * fibRatio * turns) % 360;
      const saturation = 50 + fibRatio * 40;
      const lightness = 30 + i * 15;

      const rgb = ColorMath.hslToRgb(hue, saturation, lightness);
      colors.push(ColorMath.rgbToHex(rgb.r, rgb.g, rgb.b));
    }

    return {
      name: `Fibonacci ${Math.round(baseHue)}°`,
      colors: colors,
      primary: colors[2],
      secondary: colors[1],
      accent: colors[4],
      background: colors[0],
      surface: colors[3],
    };
  }
}
