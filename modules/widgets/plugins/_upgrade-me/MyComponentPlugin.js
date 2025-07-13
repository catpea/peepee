import { BaseComponent } from '../core/BaseComponent.js';

export class MyComponentComponentPlugin {
    start() {
        //console.log('MyComponent plugin started');
    }

    stop() {
        //console.log('MyComponent plugin stopped');
    }

    createComponent(attributes, engine) {
        return new MyComponentComponent(attributes, engine);
    }
}

class MyComponentComponent extends BaseComponent {
    render(parentComponent, parentElement) {
        if (this.element) {
            this.element.remove();
        }

        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.element.setAttribute('id', this.id);

        // TODO: Implement your component rendering here
        // Example:
        // const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        // rect.setAttribute('width', this.width?.value || 10);
        // rect.setAttribute('height', this.height?.value || 10);
        // this.element.appendChild(rect);

        parentElement.appendChild(this.element);
        return this.element;
    }
}
