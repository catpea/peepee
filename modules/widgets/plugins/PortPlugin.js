import { Signal } from "signals";
import { Resizable } from "elements";

import { Component } from "../core/Component.js";

export class PortComponentPlugin {
  start() {}
  stop() {}
  createComponent(attributes, engine) {
    return new PortComponent(attributes, engine);
  }
}

class PortComponent extends Component {
  constructor(...a) {
    super(...a);

    const componentAttributes = {
      caption: "Port",
      name: "port",

      offset: 10,
      type: 'input',

      left: 0,
      top: 0,

      width: 16,
      height: 16,

      fontSize: 10,
      gap: 5,
      rx: 2,

      textAlign: "center",

      socketRadius: 4,

      // computed
      captionTextX: 0,
      captionTextY: 0,
      portSocketY:0,
      portSocketX: null,
      portCaptionWidth: null,
      portSocketXCTM:0,
      portSocketYCTM:0,
    };

    this.installAttributeSignals(componentAttributes, { override: false });


  }

  render(parentComponent, parentElement) {

    this.element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.element.setAttribute("id", this.id);
    this.element.classList.add('port');

    // Apply positioning from left, right, top, bottom attributes
    this.subscriptions.add(() => this.element.remove()); // destroy element on stop
    this.listenToAttributeSignals(["left", "top"], (left, top) => this.element.setAttribute("transform", `translate(${left}, ${top})`));

    // const positionX = parentComponent.attributes.width
    //   ?.combineLatest( this.attributes.offset, this.attributes.type )
    //   .map((parentWidth, offset, type)=>type=='input'?0-offset:parentWidth+offset);
    // positionX?.subscribe(x=>console.info('XXX positionX', x))



    // Port background
    const portBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    portBg.classList.add('port-bg');
    this.setAttributeSignal(portBg, "width");
    this.setAttributeSignal(portBg, "height");
    this.setAttributeSignal(portBg, "rx");
    this.element.appendChild(portBg);

    // Port Socket
    const portSocket = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.portSocket = portSocket;
    this.subscriptions.add(() => portSocket.remove()); // destroy element on stop

    this.attributes.portSocketX = this.attributes.width.combineLatest(this.attributes.offset,this.attributes.type).map(([width, offset, type])=>type=='input'?0-offset:width+offset);

    portSocket.classList.add('port-socket');
    portSocket.classList.add('station-port');
    this.setAttributeSignal(portSocket, "cy", "portSocketY");
    this.setAttributeSignal(portSocket, "cx", "portSocketX");
    this.listenToAttributeSignals(["socketRadius", "height"], ( socketRadius, height ) => this.attributes.portSocketY.value =  height/2 );
    this.setAttributeSignal(portSocket, "r", "socketRadius");

    portSocket.setAttribute("data-port-id", [this.attributes.group, this.attributes.type, this.attributes.id].join(':'));
    // portSocket.setAttribute("data-port-name", [this.attributes.type, this.attributes.id].join(':'));
    portSocket.setAttribute("data-station-id", this.attributes.group);

    this.listenToAttributeSignals([ "id" ], ( id ) => portSocket.setAttribute("data-port-id", id ));
    this.listenToAttributeSignals([ "name" ], ( name ) => portSocket.setAttribute("data-port-name", name ));
    // this.listenToAttributeSignals([ "type", "id" ], ( type, id ) => portSocket.setAttribute("data-port-name", [ type, id ].join(':')));
    this.listenToAttributeSignals([ "group" ], ( group ) => portSocket.setAttribute("data-station-id", group ));

    this.element.appendChild(portSocket);

      // .map(( [parentWidth, offset, type] ) => ({ parentWidth, offset, type }) );
      // positionX?.subscribe(x=>console.info('XXX positionX', x))




      // const { e: x, f: y } = port.portElement.getCTM();
      // const point = this.engine.clientToWorld(x, y);
      // port.x.value = point.x;
      // port.y.value = point.y + 8;



    //   this.attributes.portSocketX.combineLatest(this.attributes.portSocketY).subscribe(()=>{
    //     // when values change
    //     const { e: x, f: y } = portSocket.getCTM();
    //     this.attributes.portSocketXCTM.value = x;
    //     this.attributes.portSocketYCTM.value = y;

    //   })





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
    this.listenToAttributeSignals("name", (name) => (portCaption.textContent = name));
    this.element.appendChild(portCaption);

    // Measure the width of the port caption and update the component's width attribute
    // WARNING: portCaptionWidth is a ResizeObserver in a Signal API: new Resizable(portCaption);
    // when element resizes, this function will run, and it resizez when it is inserted into dom or text changes
    // this.listenToAttributeSignals(['caption', 'gap', 'portCaptionWidth'], (caption, gap, {width}) => this.attributes.width.value = gap + width + gap);



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

    parentElement.appendChild(this.element);
    return this.element;
  }
}
