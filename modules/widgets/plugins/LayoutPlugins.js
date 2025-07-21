import { Signal, combineLatest } from 'signals';
import { Component } from "../core/Component.js";

// Group Component Plugin
export class GroupComponentPlugin {
  start() {}
  stop() {}
  createComponent(attributes, engine) {
    return new GroupComponent(attributes, engine);
  }
}

class GroupComponent extends Component {
  constructor(...a) {
    super(...a);
    const componentAttributes = {
      left: 0,
      top: 0,
      gap: 5,
      height: 100,

    };
    this.installAttributeSignals(componentAttributes, { override: false });
  }

  render(parentComponent, parentElement) {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.subscriptions.add(() => this.element.remove()); // destroy element on stop

    this.element.setAttribute("id", this.id);
    this.element.setAttribute("data-name", this.constructor.name);

    // Apply positioning from left, right, top, bottom attributes
    this.listenToAttributeSignals(["left", "top"], (left, top) => this.element.setAttribute("transform", `translate(${left}, ${top})`));

    // Render children
    this.children.forEach((child) => {
      child.render(this, this.element);
    });

    parentElement.appendChild(this.element);
    return this.element;
  }
}

// VGroup Component Plugin
export class VGroupComponentPlugin {
  start() {}
  stop() {}
  createComponent(attributes, engine) {
    return new VGroupComponent(attributes, engine);
  }
}

class VGroupComponent extends Component {
  constructor(...a) {
    super(...a);
    const componentAttributes = {
            left: 0,
      top: 0,
      gap: 4,
      height: 100,
    };
    this.installAttributeSignals(componentAttributes, { override: false });
  }
  render(parentComponent, parentElement) {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.subscriptions.add(() => this.element.remove()); // destroy element on stop
    this.listenToAttributeSignals(["left", "top"], (left, top) => this.element.setAttribute("transform", `translate(${left}, ${top})`));

    this.element.setAttribute("id", this.id);
    this.element.setAttribute("data-name", this.constructor.name);
    this.setAttributeSignal(this.element, "height");

    const gap = this.attributes.gap.value;
    let yOffset = 0;








        const allChildren = combineLatest(...this.children.map(child=>child.attributes.height));

        const sumOfAllGaps = combineLatest(allChildren, this.attributes.gap)
          .map(([ children, sizeOfGap])=>[children.length, sizeOfGap])
          .map(([ numberOfChildren, sizeOfGap])=>numberOfChildren*sizeOfGap)

        const sumOfAllHeights = allChildren
          .scan((total, current)=>total+current, 0);

        const totalHeight = combineLatest(sumOfAllHeights, sumOfAllGaps)
          .scan((total, current)=>total+current, 0);

        totalHeight.subscribe(value=>this.attributes.height.value = value);

          // .scan((a,v)=>a+v, 0);
          // .map(([allChildrenHeightsSum, gapSum])=>allChildrenHeightsSum+gapSum)
    // Layout children vertically

    // combineLatest(...this.children.map(child=>child.attributes.height))
    //   .subscribe(children=>{
    //     const heightSum = children.reduce((a,v)=>a+v, 0);
    //     const gapSum = children.length * this.attributes.gap.value
    //     const fullHeight = heightSum+gapSum;
    //     console.log('hhh fullHeight-master heightSum', heightSum);
    //     console.log('hhh fullHeight-master gapSum', gapSum);
    //     console.log('hhh fullHeight-master', fullHeight);

    //     // this.attributes.height.value = fullHeight;
    //   })

    this.children.forEach((child, index) => {
      child.render(this, this.element);
      //console.log(child)
      child.attributes.top.value = yOffset;
      yOffset += child.attributes.height.value + gap;
    });

    parentElement.appendChild(this.element);
    return this.element;
  }
}

// HGroup Component Plugin
export class HGroupComponentPlugin {
  start() {}
  stop() {}
  createComponent(attributes, engine) {
    return new HGroupComponent(attributes, engine);
  }
}

class HGroupComponent extends Component {
  constructor(...a) {
    super(...a);
    const componentAttributes = {
            left: 0,
      top: 0,
      gap: 4,
      height: 100,
    };
    this.installAttributeSignals(componentAttributes, { override: false });
  }
  render(parentComponent, parentElement) {
    this.element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.subscriptions.add(() => this.element.remove()); // destroy element on stop
    this.listenToAttributeSignals(["left", "top"], (left, top) => this.element.setAttribute("transform", `translate(${left}, ${top})`));

    this.element.setAttribute("id", this.id);
    this.element.setAttribute("data-name", this.constructor.name);

    const gap = this.attributes.gap.value;
    let xOffset = 0;

    // Layout children vertically

    this.children.forEach((child, index) => {
      child.render(this, this.element);
      child.attributes.left.value = xOffset;
      xOffset += child.attributes.width.value + gap;
    });

    parentElement.appendChild(this.element);
    return this.element;
  }

  // render(parent) {
  //     if (this.element) {
  //         this.element.remove();
  //     }
  //     this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  //     this.element.setAttribute('id', this.id);
  //     const gap = this.gap ? this.gap.value : parseFloat(this.attributes.gap || 5);
  //     let xOffset = 0;
  //     // Layout children horizontally
  //     this.children.forEach((child, index) => {
  //         const childGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  //         childGroup.setAttribute('transform', `translate(${xOffset}, 0)`);
  //         child.render(childGroup);
  //         this.element.appendChild(childGroup);
  //         // Calculate next position
  //         const childWidth = child.width ? child.width.value : Component.ElementWidth;
  //         xOffset += childWidth + gap;
  //     });
  //     parent.appendChild(this.element);
  //     return this.element;
  // }
}

// // Layout children vertically
// this.children.forEach((child, index) => {
//     const childGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
//     childGroup.setAttribute('transform', `translate(0, ${yOffset})`);

//     child.render(childGroup);
//     this.element.appendChild(childGroup);

//     // Calculate next position
//     const childHeight = child.height ? child.height.value : Component.ElementHeight;
//     yOffset += childHeight + gap;
// });
