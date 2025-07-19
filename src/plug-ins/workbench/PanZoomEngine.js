import { Signal } from 'signals';

// Main PanZoomEngine class
export class PanZoomEngine {

  debug = false;

  constructor(app, svgElement) {
    this.app = app;

    this.svg = svgElement;
    this.viewport = svgElement.querySelector("#viewport");

    // Reactive signals
    this.mousePosX = new Signal(0, {label: 'mousePosX'});
    this.mousePosY = new Signal(0, {label: 'mousePosY'});
    this.worldPosX = new Signal(0, {label: 'worldPosX'});
    this.worldPosY = new Signal(0, {label: 'worldPosY'});

    this.scale = new Signal(1, {label: 'scale'});
    this.panX = new Signal(0, {label: 'panX'});
    this.panY = new Signal(0, {label: 'panY'});

    this.tileSize = 40;


    // Plugin system
    this.plugins = [];

    this.isActive = true;
    this.activatingToolName = 'panZoom';
    //this.app.selectedTool.subscribe(selectedToolName=>this.isActive=selectedToolName==this.activatingToolName);

    this.isRunning = false;

    // Subscribe to signal changes
    this.panX.subscribe(() => this.updateTransform());
    this.panY.subscribe(() => this.updateTransform());
    this.scale.subscribe(() => this.updateTransform());

    // Configuration
    this.minScale = 0.1;
    this.maxScale = 10;
    this.zoomStep = 1.2;
    this.wheelSensitivity = 0.0015;
  }

  // Plugin management
  use(plugin) {
    plugin.engine = this;
    this.plugins.push(plugin);
    if (this.isRunning) {
      plugin.start();
    }
    return this;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.plugins.forEach((plugin) => plugin.start());
    return this;
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    this.plugins.forEach((plugin) => plugin.stop());
    return this;
  }

  // Transform management
  updateTransform() {
    const transform = `translate(${this.panX.value}, ${this.panY.value}) scale(${this.scale.value})`;
    this.viewport.setAttribute("transform", transform);
  }

  // Pan operations
  pan(x, y) {
    this.panX.value = x;
    this.panY.value = y;
  }

  panBy(deltaX, deltaY) {
    this.panX.value = this.panX.value + deltaX;
    this.panY.value = this.panY.value + deltaY;
  }

  // Zoom operations
  zoom(newScale) {
    this.scale.value = this.clampScale(newScale);
  }

  zoomBy(deltaScale) {
    this.zoom(this.scale.value * deltaScale);
  }

  zoomAt(newScale, x, y) {
    const oldScale = this.scale.value;
    const clampedScale = this.clampScale(newScale);
    const scaleFactor = clampedScale / oldScale;

    const svgPoint = this.clientToSVG(x, y);
    const dx = (svgPoint.x - this.panX.value) * (1 - scaleFactor);
    const dy = (svgPoint.y - this.panY.value) * (1 - scaleFactor);

    this.scale.value = clampedScale;
    this.panBy(dx, dy);
  }

  zoomAtBy(deltaScale, x, y) {
    this.zoomAt(this.scale.value * deltaScale, x, y);
  }

  zoomIn() {
    this.zoomBy(this.zoomStep);
  }

  zoomOut() {
    this.zoomBy(1 / this.zoomStep);
  }

  resetZoom() {
    this.pan(0, 0);
    this.zoom(1);
  }

  // Geometry helpers
  clampScale(scale) {
    return Math.max(this.minScale, Math.min(this.maxScale, scale));
  }

  calculateWheelDelta(event) {
    return Math.exp(-event.deltaY * this.wheelSensitivity);
  }

  clientToSVG(clientX, clientY) {
    const rect = this.svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * this.svg.viewBox.baseVal.width;
    const svgY = ((clientY - rect.top) / rect.height) * this.svg.viewBox.baseVal.height;
    return { x: svgX, y: svgY };
  }

  svgToWorld(svgX, svgY) {
    const worldX = (svgX - this.panX.value) / this.scale.value;
    const worldY = (svgY - this.panY.value) / this.scale.value;
    return { x: worldX, y: worldY };
  }

  worldToSVG(worldX, worldY) {
    const svgX = worldX * this.scale.value + this.panX.value;
    const svgY = worldY * this.scale.value + this.panY.value;
    return { x: svgX, y: svgY };
  }

  clientToWorld(clientX, clientY) {
    const svgPoint = this.clientToSVG(clientX, clientY);
    return this.svgToWorld(svgPoint.x, svgPoint.y);
  }

  getViewportBounds() {
    const vb = this.svg.viewBox.baseVal;
    const topLeft = this.svgToWorld(0, 0);
    const bottomRight = this.svgToWorld(vb.width, vb.height);
    return {
      left: topLeft.x,
      top: topLeft.y,
      right: bottomRight.x,
      bottom: bottomRight.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }

  // Called when viewBox changes - hook for coordinate system updates
  onViewBoxChanged(width, height) {
    // Update grid labels when viewport changes
    if (this.isRunning) {
      // Debounce rapid resize events
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        if(this.updateGridLabels) this.updateGridLabels();
      }, 100);
    }
  }



  normalizeAngle(angle) {
    return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }




    snapToGrid(x, y) {
          return {
              x: Math.round(x / this.tileSize) * this.tileSize,
              y: Math.round(y / this.tileSize) * this.tileSize
          };
      }











// SVG explicitOriginalTarget polyfill


  getExplicitOriginalTarget(event) {
  // Firefox native support
  if (event.explicitOriginalTarget) {
    return event.explicitOriginalTarget;
  }

  // Polyfill for other browsers
  const target = event.target;

  // If target is already a graphic element, return it
  if (isGraphicElement(target)) {
    return target;
  }

  // Use elementFromPoint as fallback
  const point = getEventPoint(event);
  if (point) {
    const elementAtPoint = document.elementFromPoint(point.x, point.y);
    if (elementAtPoint && isGraphicElement(elementAtPoint)) {
      return elementAtPoint;
    }
  }

  // Last resort: traverse up from target to find graphic element
  let current = target;
  while (current && current !== document) {
    if (isGraphicElement(current)) {
      return current;
    }
    current = current.parentNode;
  }

  return target; // Fallback to original target
}





  isGraphicElement(element) {
  if (!element || !element.tagName) return false;

  const graphicElements = [
    'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline',
    'rect', 'text', 'tspan', 'textPath', 'image', 'use'
  ];

  return graphicElements.includes(element.tagName.toLowerCase());
}





  getEventPoint(event) {
  // Try to get coordinates from the event
  if (event.clientX !== undefined && event.clientY !== undefined) {
    return { x: event.clientX, y: event.clientY };
  }

  // Handle touch events
  if (event.touches && event.touches.length > 0) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  // Handle changed touches for touchend
  if (event.changedTouches && event.changedTouches.length > 0) {
    return { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
  }

  return null;
}




// Enhanced version that handles nested SVG and shadow DOM
  getExplicitOriginalTargetAdvanced(event) {
  if (event.explicitOriginalTarget) {
    return event.explicitOriginalTarget;
  }

  const point = getEventPoint(event);
  if (!point) return event.target;

  // Get all elements at the point (including those in shadow DOM)
  const elementsAtPoint = document.elementsFromPoint(point.x, point.y);

  // Find the first graphic element
  for (const element of elementsAtPoint) {
    if (isGraphicElement(element)) {
      return element;
    }
  }

  return event.target;
}

// Usage example:
  handleSVGClick(event) {
  const actualTarget = getExplicitOriginalTarget(event);
  //console.log('Clicked element:', actualTarget);
  //console.log('Element type:', actualTarget.tagName);

  // You can now work with the actual graphic element
  if (actualTarget.tagName === 'circle') {
    //console.log('Circle radius:', actualTarget.getAttribute('r'));
  }
}

//USAGE  Add event listener
//document.addEventListener('click', function(event) {
  // Only handle clicks on SVG elements
  //if (event.target.closest('svg')) {
    //handleSVGClick(event);
//  }
//});

// Alternative: More robust version using intersection with bounding boxes
  getExplicitOriginalTargetByBounds(event) {
  if (event.explicitOriginalTarget) {
    return event.explicitOriginalTarget;
  }

  const point = getEventPoint(event);
  if (!point) return event.target;

  const svg = event.target.closest('svg');
  if (!svg) return event.target;

  // Convert screen coordinates to SVG coordinates
  const svgPoint = screenToSVGPoint(svg, point.x, point.y);

  // Find all graphic elements and check which one contains the point
  const graphicElements = svg.querySelectorAll('circle, ellipse, line, path, polygon, polyline, rect, text, tspan, textPath, image, use');

  for (const element of graphicElements) {
    if (elementContainsPoint(element, svgPoint)) {
      return element;
    }
  }

  return event.target;
}

  screenToSVGPoint(svg, screenX, screenY) {
  const point = svg.createSVGPoint();
  point.x = screenX;
  point.y = screenY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

  elementContainsPoint(element, point) {
  try {
    // For basic shapes, check bounding box
    const bbox = element.getBBox();
    if (point.x >= bbox.x && point.x <= bbox.x + bbox.width &&
        point.y >= bbox.y && point.y <= bbox.y + bbox.height) {

      // For paths, do more precise hit testing if available
      if (element.tagName === 'path' && element.isPointInFill) {
        return element.isPointInFill(point);
      }

      return true;
    }
  } catch (e) {
    // getBBox might fail for some elements
    return false;
  }

  return false;
}


  placeCircleOnCircumference(angle, circleX, circleY, circleRadius) {
    // Convert the start angle from degrees to radians
    const angleInRadians = angle * (Math.PI / 180);

    // Calculate the x and y coordinates of the point on the circumference
    const x = circleX + circleRadius * Math.cos(angleInRadians);
    const y = circleY + circleRadius * Math.sin(angleInRadians);

    // Return the coordinates as an object for destructuring
    return { x, y };
  }








}
