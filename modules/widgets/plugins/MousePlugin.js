import { Signal } from 'signals';

/**
 * Mouse interaction plugin
 */
export class MouseInteractionPlugin {
    constructor() {
        this.engine = null;
        this.isDragging = new Signal(false);
        this.mousePosition = new Signal({ x: 0, y: 0 });
    }

    start() {
        this.engine.svg.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.engine.svg.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.engine.svg.addEventListener('mouseup', this.onMouseUp.bind(this));
    }

    stop() {
        this.engine.svg.removeEventListener('mousedown', this.onMouseDown);
        this.engine.svg.removeEventListener('mousemove', this.onMouseMove);
        this.engine.svg.removeEventListener('mouseup', this.onMouseUp);
    }

    onMouseDown(event) {
        this.isDragging.value = true;
    }

    onMouseMove(event) {
        const rect = this.engine.svg.getBoundingClientRect();
        this.mousePosition.value = {
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100
        };
    }

    onMouseUp(event) {
        this.isDragging.value = false;
    }
}
