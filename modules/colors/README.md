# 🎨 Color Library - Advanced Color Generation & Filtering

*Empowering creators to build beautiful, dynamic color experiences for the next generation of applications.*

## Overview

This comprehensive color library provides mathematically-driven color generation, atmospheric filtering effects, and seamless conversion utilities. Perfect for creating dynamic themes, game atmospheres, data visualizations, and immersive user interfaces.

## Features

- **🧮 Mathematical Color Harmonies** - Golden ratio, Fibonacci spirals, triadic schemes
- **🌊 Atmospheric Effects** - 50+ realistic environmental filters
- **🎮 Gaming Effects** - Sci-fi vision modes, energy fields, spectral effects
- **🌌 Cosmic Phenomena** - Deep space, nebulae, black holes, radiation
- **🔄 Seamless Integration** - Chain generators → filters → themes effortlessly

---

## Quick Start

```javascript
import { ColorMath, ColorFilters, ColorGenerators } from './color-library.js';

// Generate a theme, apply atmospheric filter, get final colors
const baseTheme = ColorGenerators.goldenRatioTheme(240); // Blue-based
const filter = new ColorFilters();
const atmosphericTheme = applyFilterToTheme(baseTheme, filter.cyberpunkNeon);

console.log(atmosphericTheme.primary); // "#ff6b9d" (neon-filtered blue)
```

---

## Core Classes

### 🧮 ColorMath
Static utility class for color conversions and mathematical operations.

```javascript
// Convert between color formats
const rgb = ColorMath.hexToRgb("#ff6b9d");     // {r: 255, g: 107, b: 157}
const hsl = ColorMath.rgbToHsl(255, 107, 157); // {h: 339, s: 100, l: 71}
const hex = ColorMath.rgbToHex(255, 107, 157); // "#ff6b9d"

// Mathematical constants
console.log(ColorMath.goldenRatio);  // 1.618033988749
console.log(ColorMath.goldenAngle);  // 137.507764°
```

### 🎨 ColorGenerators
Generate mathematically harmonious color themes.

```javascript
// Golden ratio harmony (aesthetically pleasing)
const goldenTheme = ColorGenerators.goldenRatioTheme(180, 70, 50);
/*
Returns: {
  name: "Golden φ 180°",
  colors: ["#1a4d4d", "#2d7a5c", "#40a66b", "#73d9a0", "#a6ffcc"],
  primary: "#40a66b",
  secondary: "#2d7a5c",
  accent: "#a6ffcc",
  background: "#1a4d4d",
  surface: "#73d9a0"
}
*/

// Triadic harmony (vibrant contrasts)
const triadicTheme = ColorGenerators.triadicHarmony(0); // Red-based
const analogousTheme = ColorGenerators.analogousGradient(270, 45); // Purple spread
const splitTheme = ColorGenerators.splitComplementary(120); // Green-based
const luminanceTheme = ColorGenerators.luminanceScaling(60, 80); // Yellow luminance
const fibonacciTheme = ColorGenerators.fibonacciSpiral(300, 2); // Magenta spiral
```

### 🌊 ColorFilters
Apply atmospheric and environmental effects to colors.

```javascript
const filter = new ColorFilters();
const baseColor = {r: 100, g: 150, b: 200}; // Light blue

// Nature atmospheres
const oceanColor = filter.darkOceanDepths(baseColor, 0.7);
const forestColor = filter.moonlessForest(baseColor, 0.5);
const caveColor = filter.deepCaveAmbient(baseColor, 0.8);

// Gaming effects
const termColor = filter.terminatorVision(baseColor, 0.6);
const thermalColor = filter.predatorThermal(baseColor, 0.4);
const nightVision = filter.nightVisionGoggles(baseColor, 0.8);

// Cosmic phenomena
const nebulaColor = filter.nebulaDust(baseColor, 0.5);
const blackHoleColor = filter.blackHoleAccretion(baseColor, 0.3);
const radiationColor = filter.cosmicRadiation(baseColor, 0.6);
```

---

## 🚀 Theme Generation Workflows

### Basic Theme Generation

```javascript
// 1. Choose a mathematical harmony
const baseTheme = ColorGenerators.goldenRatioTheme(210); // Ocean blue

// 2. Apply atmospheric filter
const filter = new ColorFilters();
const underwaterTheme = baseTheme.colors.map(hex => {
  const rgb = ColorMath.hexToRgb(hex);
  const filtered = filter.underwaterCaustics(rgb, 0.4);
  return ColorMath.rgbToHex(filtered.r, filtered.g, filtered.b);
});

console.log(underwaterTheme);
// ["#0d1a26", "#1a3d52", "#266080", "#4d99cc", "#80ccff"]
```

### Dynamic Animated Themes

```javascript
// Create time-based animated color themes
const filter = new ColorFilters();
const baseColor = {r: 128, g: 64, b: 192}; // Purple

function getAnimatedTheme() {
  return {
    primary: filter.cyberpunkNeon(baseColor, 0.8),
    accent: filter.bioluminescence(baseColor, 0.6),
    background: filter.voidCold(baseColor, 0.9)
  };
}

// Call every frame for smooth animation
setInterval(() => {
  const theme = getAnimatedTheme();
  // Apply theme to UI elements
}, 16); // 60fps
```

### Utility Function: Apply Filter to Entire Theme

```javascript
function applyFilterToTheme(theme, filterFunction, ...filterParams) {
  const filteredColors = theme.colors.map(hex => {
    const rgb = ColorMath.hexToRgb(hex);
    const filtered = filterFunction(rgb, ...filterParams);
    return ColorMath.rgbToHex(filtered.r, filtered.g, filtered.b);
  });

  return {
    ...theme,
    colors: filteredColors,
    primary: filteredColors[2],
    secondary: filteredColors[1],
    accent: filteredColors[4],
    background: filteredColors[0],
    surface: filteredColors[3]
  };
}

// Usage
const cyberpunkTheme = applyFilterToTheme(
  ColorGenerators.triadicHarmony(300),
  filter.cyberpunkNeon.bind(filter),
  0.7
);
```

---

## 🎯 Practical Examples

### 1. Dashboard Theme Generator

```javascript
function createDashboardTheme(mood = 'professional') {
  const filter = new ColorFilters();

  const moodMap = {
    professional: () => ColorGenerators.luminanceScaling(220, 60),
    creative: () => ColorGenerators.fibonacciSpiral(45, 3),
    gaming: () => ColorGenerators.triadicHarmony(270),
    nature: () => ColorGenerators.analogousGradient(120, 40)
  };

  const filterMap = {
    professional: (color) => filter.mistEffect(color, 0.1),
    creative: (color) => filter.iridescence(color, Math.random() * 10, 0.3),
    gaming: (color) => filter.cyberpunkNeon(color, 0.5),
    nature: (color) => filter.canopyFilter(color, 0.3)
  };

  const baseTheme = moodMap[mood]();
  return applyFilterToTheme(baseTheme, filterMap[mood]);
}

const professionalTheme = createDashboardTheme('professional');
const gamingTheme = createDashboardTheme('gaming');
```

### 2. Data Visualization Palette

```javascript
function createDataPalette(dataType, count = 8) {
  const filter = new ColorFilters();

  // Generate base colors using golden ratio for optimal distinction
  const colors = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * ColorMath.goldenAngle) % 360;
    const baseRgb = ColorMath.hslToRgb(hue, 70, 60);

    // Apply data-type specific filtering
    let finalColor;
    switch(dataType) {
      case 'financial':
        finalColor = filter.combine(baseRgb, 0.2); // Subtle orange overlay
        break;
      case 'scientific':
        finalColor = filter.cosmicRadiation(baseRgb, 0.3);
        break;
      case 'environmental':
        finalColor = filter.auroraTransform(baseRgb, i / count);
        break;
      default:
        finalColor = baseRgb;
    }

    colors.push(ColorMath.rgbToHex(finalColor.r, finalColor.g, finalColor.b));
  }

  return colors;
}

const financialPalette = createDataPalette('financial', 5);
const scientificPalette = createDataPalette('scientific', 10);
```

### 3. Game Environment Themes

```javascript
function createEnvironmentTheme(environment, timeOfDay = 0.5) {
  const filter = new ColorFilters();
  const baseTheme = ColorGenerators.analogousGradient(200, 60); // Blue-green base

  const environmentFilters = {
    ocean: (color) => filter.darkOceanDepths(color, timeOfDay),
    forest: (color) => filter.moonlessForest(color, 1 - timeOfDay),
    space: (color) => filter.nebulaDust(color, 0.6),
    cave: (color) => filter.deepCaveAmbient(color, 0.8),
    alien: (color) => filter.xenCrystal(color, timeOfDay)
  };

  // Apply time-of-day lighting
  const dayNightFilter = (color) => {
    if (timeOfDay > 0.7) return filter.sunlightTransform(color, timeOfDay);
    if (timeOfDay < 0.3) return filter.moonlightTransform(color, timeOfDay);
    return color;
  };

  // Chain filters: environment → time of day
  return applyFilterToTheme(baseTheme, (color) => {
    const envFiltered = environmentFilters[environment](color);
    return dayNightFilter(envFiltered);
  });
}

const oceanSunsetTheme = createEnvironmentTheme('ocean', 0.8);
const alienNightTheme = createEnvironmentTheme('alien', 0.2);
```

---

## 🎨 Filter Categories

### 🌿 Nature & Atmosphere
- `darkOceanDepths` - Deep sea pressure and bioluminescence
- `nightLakeReflection` - Moonlit water with ripples
- `foxfire` - Mystical forest phosphorescence
- `moonlessForest` - Dense woodland shadows
- `deepCaveAmbient` - Underground mineral atmospheres

### 🎮 Gaming & Sci-Fi
- `terminatorVision` - Red HUD overlay with scanlines
- `predatorThermal` - Heat signature visualization
- `cyberpunkNeon` - Electric neon glow effects
- `gravityGun` - Energy field distortions
- `portalEnergy` - Dimensional instability effects

### 🌌 Cosmic & Space
- `nebulaDust` - Interstellar gas clouds
- `blackHoleAccretion` - Gravitational redshift
- `cosmicRadiation` - High-energy particle effects
- `voidCold` - Absolute zero temperatures
- `starlight` - Distant stellar illumination

### 🔬 Optical & Physics
- `iridescence` - Surface interference patterns
- `chromaticAberration` - Lens distortion effects
- `prismDispersion` - Wavelength-based color splitting
- `atmosphericScatter` - Rayleigh scattering simulation

---

## 💡 Pro Tips

1. **Chain Multiple Filters**: Apply multiple atmospheric effects for complex moods
   ```javascript
   let color = filter.darkOceanDepths(baseColor, 0.6);
   color = filter.bioluminescence(color, 0.3);
   color = filter.mistEffect(color, 0.1);
   ```

2. **Animate with Time**: Many filters use internal timing for natural animation
   ```javascript
   // Filters automatically animate when called repeatedly
   const animatedColor = filter.firefly(baseColor, 0.8);
   ```

3. **Mathematical Harmony**: Use golden ratio themes for naturally pleasing results
   ```javascript
   const perfectTheme = ColorGenerators.goldenRatioTheme(hue);
   ```

4. **Luminance Consistency**: Use luminance scaling for accessibility-friendly themes
   ```javascript
   const accessibleTheme = ColorGenerators.luminanceScaling(180, 70);
   ```

---

## 🌟 Building the Future

This library represents the democratization of advanced color science - putting professional-grade tools into the hands of every creator. Whether you're building the next breakthrough app or teaching others to code, these colors will help your creations stand out and inspire.

**Together, we're not just writing code - we're painting the digital future.** 🚀

---

## API Reference

### ColorMath Static Methods
- `clamp(value, min?, max?)` - Constrain value to range
- `hexToRgb(hex)` - Convert hex string to RGB object
- `rgbToHex(r, g, b)` - Convert RGB values to hex string
- `rgbToHsl(r, g, b)` - Convert RGB to HSL object
- `hslToRgb(h, s, l)` - Convert HSL to RGB object
- `fibonacci(n)` - Calculate nth Fibonacci number

### ColorGenerators Static Methods
- `goldenRatioTheme(baseHue, saturation?, lightness?)` - Golden ratio harmony
- `triadicHarmony(baseHue, intensity?)` - 120° hue spacing
- `analogousGradient(baseHue, spread?)` - Adjacent hue range
- `splitComplementary(baseHue)` - Split complement scheme
- `luminanceScaling(baseHue, saturation?)` - Perceptual lightness steps
- `fibonacciSpiral(baseHue, turns?)` - Fibonacci-based hue distribution

### ColorFilters Instance Methods
*50+ atmospheric filters organized by category - see full list in source code*

---

*Made with ❤️ for creators building tomorrow's applications*
