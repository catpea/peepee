import { BaseComponent } from '../core/BaseComponent.js';

export class LabelComponentPlugin {
    start() {}
    stop() {}
    createComponent(attributes, engine) {
        return new LabelComponent(attributes, engine);
    }
}

class LabelComponent extends BaseComponent {
    render(parentComponent, parentElement) {
        if (this.element) {
            this.element.remove();
        }

        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.element.setAttribute('id', this.id);

        const width = this.width ? this.width.value : parseFloat(this.attributes.width || BaseComponent.ElementWidth);
        const height = this.height ? this.height.value : parseFloat(this.attributes.height || BaseComponent.ElementHeight);
        const fontSize = this.fontSize ? this.fontSize.value : parseFloat(this.attributes.fontSize || BaseComponent.FontSize);
        const color = this.color ? this.color.value : this.attributes.color || '#333';

        // Optional background
        if (this.attributes.background !== 'false') {
            const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            bg.setAttribute('width', width);
            bg.setAttribute('height', height);
            bg.setAttribute('rx', '0.5');
            bg.setAttribute('fill', 'url(#labelGradient)');
            bg.setAttribute('stroke', '#28a745');
            bg.setAttribute('stroke-width', '0.2');
            this.element.appendChild(bg);
        }

        // Label text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', this.attributes.textAlign === 'center' ? width / 2 : 1);
        text.setAttribute('y', height / 2 + fontSize / 3);
        text.setAttribute('text-anchor', this.attributes.textAlign === 'center' ? 'middle' : 'start');
        text.setAttribute('font-size', fontSize);
        text.setAttribute('fill', color);
        text.setAttribute('font-weight', this.attributes.fontWeight || 'normal');
        text.textContent = this.text ? this.text.value : this.attributes.text || this.attributes.label || 'Label';
        this.element.appendChild(text);

        parentElement.appendChild(this.element);
        return this.element;
    }
}
