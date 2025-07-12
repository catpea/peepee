import { Signal } from "signals";
import { Resizable } from "elements";

import { BaseComponent } from "../core/BaseComponent.js";

export class PortComponentPlugin {
  start() {}
  stop() {}
  createComponent(attributes, engine) {
    return new PortComponent(attributes, engine);
  }
}

class PortComponent extends BaseComponent {
  constructor(...a) {
    super(...a);

    const componentAttributes = {
      caption: "Port",

      left: -16,
      top: 0,

      width: 16,
      height: 16,

      fontSize: 10,
      gap: 10,
      rx: 2,

      textAlign: "center",

      socketRadius: 4,

      // computed
      captionTextX: 0,
      captionTextY: 0,
      portSocketY:0,
      portCaptionWidth: null,
    };

    this.installAttributeSignals(componentAttributes, { override: false });


  }

  render(parent) {

    this.element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.element.setAttribute("id", this.id);
    this.element.classList.add('port');

    // Apply positioning from left, right, top, bottom attributes
    this.subscriptions.add(() => this.element.remove()); // destroy element on stop
    this.listenToAttributeSignals(["left", "top"], (left, top) => this.element.setAttribute("transform", `translate(${left}, ${top})`));

    // Port background
    const portBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    portBg.classList.add('port-bg');
    this.setAttributeSignal(portBg, "width");
    this.setAttributeSignal(portBg, "height");
    this.setAttributeSignal(portBg, "rx");
    this.element.appendChild(portBg);

    // Port Socket
    const portSocket = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.subscriptions.add(() => portSocket.remove()); // destroy element on stop

    portSocket.classList.add('port-socket');
    portSocket.classList.add('station-port');

    // this.setAttributeSignal(portSocket, "cx", "left");
    this.setAttributeSignal(portSocket, "cy", "portSocketY");

    this.listenToAttributeSignals(["socketRadius", "height"], ( socketRadius, height ) =>
       this.attributes.portSocketY.value =  height/2
    );

    this.setAttributeSignal(portSocket, "r", "socketRadius");
    this.element.appendChild(portSocket);






    // Port text
    const portCaption = document.createElementNS("http://www.w3.org/2000/svg", "text");
    this.attributes.portCaptionWidth = new Resizable(portCaption);
    portCaption.classList.add('port-caption');
    portCaption.setAttribute("text-anchor", "middle");
    this.setAttributeSignal(portCaption, "x", "captionTextX");
    this.setAttributeSignal(portCaption, "y", "captionTextY");
    this.listenToAttributeSignals(["textAlign", "width"], (textAlign, width) => (this.attributes.captionTextX.value = textAlign === "center" ? width / 2 : 1));
    this.listenToAttributeSignals(["height", "fontSize"], (height, fontSize) => (this.attributes.captionTextY.value = height / 2 + fontSize / 3));
    this.setAttributeSignal(portCaption, "font-size", "fontSize");
    this.listenToAttributeSignals("caption", (caption) => (portCaption.textContent = caption));
    this.element.appendChild(portCaption);

    // Measure the width of the port caption and update the component's width attribute
    // WARNING: portCaptionWidth is a ResizeObserver in a Signal API: new Resizable(portCaption);
    // when element resizes, this function will run, and it resizez when it is inserted into dom or text changes
    this.listenToAttributeSignals(['caption', 'gap', 'portCaptionWidth'], (caption, gap, {width}) => this.attributes.width.value = gap + width + gap);

    // Add hover effects
    this.element.addEventListener("mouseenter", () => {
      portBg.classList.add('hover');
    });

    this.element.addEventListener("mouseleave", () => {
      portBg.classList.remove('hover');
    });

    this.element.addEventListener("mousedown", () => {
      portBg.classList.add('active');
    });

    this.element.addEventListener("mouseup", () => {
        portBg.classList.remove('active');
    });

    parent.appendChild(this.element);
    return this.element;
  }
}
