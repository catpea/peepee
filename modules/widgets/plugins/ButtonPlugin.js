import { Signal } from "signals";
import { Resizable } from "elements";

import { Component } from "../core/Component.js";

export class ButtonComponentPlugin {
  start() {}
  stop() {}
  createComponent(attributes, engine) {
    return new ButtonComponent(attributes, engine);
  }
}

class ButtonComponent extends Component {
  constructor(...a) {
    super(...a);

    const componentAttributes = {
      caption: "Button",

      left: 0,
      top: 0,

      width: 138,
      height: 24,
      fontSize: 10,
      gap: 10,
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
    this.element.classList.add('button');

    // Apply positioning from left, right, top, bottom attributes
    this.subscriptions.add(() => this.element.remove()); // destroy element on stop
    this.listenToAttributeSignals(["left", "top"], (left, top) => this.element.setAttribute("transform", `translate(${left}, ${top})`));

    // Button background
    const buttonBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    buttonBg.classList.add('button-bg');
    this.setAttributeSignal(buttonBg, "width");
    this.setAttributeSignal(buttonBg, "height");
    this.setAttributeSignal(buttonBg, "rx");
    this.element.appendChild(buttonBg);

    // Button text
    const buttonCaption = document.createElementNS("http://www.w3.org/2000/svg", "text");
    this.attributes.buttonCaptionWidth = new Resizable(buttonCaption);
    buttonCaption.classList.add('button-caption');
    buttonCaption.setAttribute("text-anchor", "middle");
    this.setAttributeSignal(buttonCaption, "x", "captionTextX");
    this.setAttributeSignal(buttonCaption, "y", "captionTextY");
    this.listenToAttributeSignals(["textAlign", "width"], (textAlign, width) => (this.attributes.captionTextX.value = textAlign === "center" ? width / 2 : 1));
    this.listenToAttributeSignals(["height", "fontSize"], (height, fontSize) => (this.attributes.captionTextY.value = height / 2 + fontSize / 3));
    this.setAttributeSignal(buttonCaption, "font-size", "fontSize");
    this.listenToAttributeSignals("caption", (caption) => (buttonCaption.textContent = caption));
    this.element.appendChild(buttonCaption);

    // Measure the width of the button caption and update the component's width attribute
    // WARNING: buttonCaptionWidth is a ResizeObserver in a Signal API: new Resizable(buttonCaption);
    // when element resizes, this function will run, and it resizez when it is inserted into dom or text changes
    this.listenToAttributeSignals(['caption', 'gap', 'buttonCaptionWidth'], (caption, gap, {width}) => this.attributes.width.value = gap + width + gap);

    // Add hover effects
    this.element.addEventListener("mouseenter", () => {
      buttonBg.classList.add('hover');
    });

    this.element.addEventListener("mouseleave", () => {
      buttonBg.classList.remove('hover');
    });

    this.element.addEventListener("mousedown", () => {
      buttonBg.classList.add('active');
    });

    this.element.addEventListener("mouseup", () => {
        buttonBg.classList.remove('active');
    });

    parentElement.appendChild(this.element);
    return this.element;
  }
}
