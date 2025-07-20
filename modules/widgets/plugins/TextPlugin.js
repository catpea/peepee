import { encodeXmlEntities } from "utils";
import { Signal } from "signals";
import { Resizable } from "elements";

import { Component } from "../core/Component.js";

export class TextComponentPlugin {
  start() {}
  stop() {}
  createComponent(attributes, engine) {
    return new TextComponent(attributes, engine);
  }
}

class TextComponent extends Component {
  constructor(...a) {
    super(...a);

    const componentAttributes = {
      caption: "Button",
      // content: "Hello",

      left: 0,
      top: 0,

      width: 138,
      height: 24,
      fontSize: 10,
      rx: 2,

      textAlign: "center",

      // computed
      captionTextX: 0,
      captionTextY: 0,
      buttonCaptionWidth: null,
    };

    this.installAttributeSignals(componentAttributes, { override: false });


  }

  render(parentComponent, parentElement) {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.element.setAttribute("id", this.id);
    this.element.classList.add('text');

    // Apply positioning from left, right, top, bottom attributes
    this.subscriptions.add(() => this.element.remove()); // destroy element on stop
    this.listenToAttributeSignals(["left", "top"], (left, top) => this.element.setAttribute("transform", `translate(${left}, ${top})`));

    // Button background
    const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    foreignObject.classList.add('foreign-object-bg');
    this.setAttributeSignal(foreignObject, "width");
    this.setAttributeSignal(foreignObject, "height");
    this.element.appendChild(foreignObject);

    const divElement = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
    divElement.classList.add('content');
    this.setAttributeSignal(divElement, "width");

    foreignObject.appendChild(divElement);
    this.attributes.content.subscribe(v=>{
      divElement.textContent = encodeXmlEntities(v);
      this.attributes.height.value = divElement.offsetHeight;
    });

    parentElement.appendChild(this.element);
    return this.element;
  }
}
