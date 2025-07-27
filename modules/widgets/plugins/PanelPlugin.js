import { Component } from '../core/Component.js';
import { Signal, combineLatest } from 'signals';

export class PanelComponentPlugin {

    start() {
        //console.log('Panel plugin started');
    }

    stop() {
        //console.log('Panel plugin stopped');
    }

    createComponent(attributes, engine) {
        return new PanelComponent(attributes, engine);
    }

}

class PanelComponent extends Component {



  constructor(...a){
    super(...a);

    const componentAttributes = {

      caption: 'Panel',

      left: 0,
      top: 0,

      bottom: 0,

      width: 320,
      height: 200,

      fontSize: 10,

      gap:4,
      rx:2,

      // strokeWidth: 0.5,

      // Floor 0 - Darks
      // stroke: '#dee2e6',
      // fill: 'url(#widgetPanelGradient)',
      filter: 'url(#widgetPanelDropShadow)',
      // titleFill: '#6c757d',
      // textFill: '#eeeeee',
      titleHeight: 24,
      textAlign: 'natural',


      // titleIconBgFill: 'darkblue',

      // computed
      titleIconHeight: 0,
      titleIconWidth: 0,
      titleIconX: 0,
      titleIconY: 0,
      titleTextX: 0,
      titleTextY: 0,
    }

    this.installAttributeSignals(componentAttributes, {override:false})

  }



    render(parentComponent, parentElement) {


        this.clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        const clipPathId = 'clip-'+this.id;
        this.clipPath.setAttribute('id', clipPathId);
        this.subscriptions.add(()=>this.clipPath.remove()) // destroy element on stop
        this.engine.defs.appendChild(this.clipPath);
        const panelShape = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        panelShape.setAttribute('fill', '#000');
        this.setAttributeSignal(panelShape, 'width');
        this.setAttributeSignal(panelShape, 'height');
        this.setAttributeSignal(panelShape, 'rx');
        this.clipPath.appendChild(panelShape)
        // Primary Container
        this.element = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.element.setAttribute('id', this.id);
        this.element.setAttribute('class', 'panel');
        this.element.setAttribute('data-name', this.constructor.name);
        // this.element.setAttribute('clip-path', `url(#${clipPathId})`);
        this.subscriptions.add(()=>this.element.remove()) // destroy element on stop
        this.listenToAttributeSignals(['left', 'top'],(left, top)=>this.element.setAttribute('transform', `translate(${left}, ${top})`));

        // Panel Background
        const panelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        panelBg.setAttribute('class', 'panel-bg');
        panelBg.setAttribute('clip-path', `url(#${clipPathId})`);

        this.setAttributeSignal(panelBg, 'width');
        this.setAttributeSignal(panelBg, 'height');
        // this.setAttributeSignal(panelBg, 'rx');
        // this.setAttributeSignal(panelBg, 'stroke-width', 'strokeWidth');
        // this.setAttributeSignal(panelBg, 'stroke');
        // this.setAttributeSignal(panelBg, 'fill');
        // this.setAttributeSignal(panelBg, 'filter');
        this.element.appendChild(panelBg);

        // Panel Title
        const panelTitleBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        this.dragHandle = panelTitleBg;

        panelTitleBg.setAttribute('class', 'panel-title-bg');
        panelTitleBg.setAttribute('clip-path', `url(#${clipPathId})`);
        this.setAttributeSignal(panelTitleBg, 'width');
        this.setAttributeSignal(panelTitleBg, 'height', 'titleHeight');
        // this.setAttributeSignal(titleBar, 'rx');
        // this.setAttributeSignal(panelTitleBg, 'fill', 'titleFill');
        this.element.appendChild(panelTitleBg);


        // Panel Icon Bg
        const panelIconBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        panelIconBg.setAttribute('class', 'panel-icon-bg');
        panelIconBg.setAttribute('clip-path', `url(#${clipPathId})`);
        this.setAttributeSignal(panelIconBg, 'height', 'titleIconHeight');
        this.setAttributeSignal(panelIconBg, 'width', 'titleIconWidth');
        this.listenToAttributeSignals('titleHeight', titleHeight => { this.attributes.titleIconHeight.value = titleHeight; this.attributes.titleIconWidth.value = titleHeight; });
        this.element.appendChild(panelIconBg);

        // Panel Icon
        const panelIcon = document.createElementNS('http://www.w3.org/2000/svg', 'use');
        panelIcon.setAttribute('class', 'panel-icon');
        this.setAttributeSignal(panelIcon, 'x', 'titleIconX');
        this.setAttributeSignal(panelIcon, 'y', 'titleIconY');
        this.listenToAttributeSignals('titleHeight', titleHeight => { this.attributes.titleIconX.value = (titleHeight/2)-(16/2) });
        this.listenToAttributeSignals('titleHeight', titleHeight => { this.attributes.titleIconY.value = (titleHeight/2)-(16/2) });


        panelIcon.setAttribute('href', '#bi-chevron-down');
        panelIcon.setAttribute('fill', 'blue');
        this.element.appendChild(panelIcon);


        // Panel Title Text
        const panelTitleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        panelTitleText.setAttribute('class', 'panel-caption');
        this.setAttributeSignal(panelTitleText, 'x', 'titleTextX');
        this.setAttributeSignal(panelTitleText, 'y', 'titleTextY');
        this.listenToAttributeSignals(['textAlign', 'width', 'gap', 'titleHeight'], (textAlign, width, gap, titleHeight) => this.attributes.titleTextX.value = (textAlign==='center'?(width/2):1) + gap + titleHeight );
        this.listenToAttributeSignals(['titleHeight', 'fontSize'], (titleHeight, fontSize) => this.attributes.titleTextY.value = titleHeight / 2 + fontSize / 3);
        this.setAttributeSignal(panelTitleText, 'font-size', 'fontSize');
        // this.setAttributeSignal(panelTitleText, 'fill', 'textFill');
        this.listenToAttributeSignals('caption', caption => panelTitleText.textContent = caption);
        this.element.appendChild(panelTitleText);

        // Content area
        const contentArea = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.listenToAttributeSignals('titleHeight', titleHeight => contentArea.setAttribute('transform', `translate(0, ${titleHeight})`));
        this.element.appendChild(contentArea);

        // Render children

        this.children.forEach(child => {
            child.render(this, contentArea);
        });


      combineLatest(...this.children.map(child=>child.attributes.height), ...this.children.map(child=>child.attributes.top))
      .subscribe(children=>{
        const childrenHeightSum = children.reduce((a,v)=>a+v, 0);
        const gapSum = children.length  * this.attributes.gap.value
        const fullHeight = this.attributes.titleHeight.value+childrenHeightSum
        this.attributes.height.value = fullHeight;
      })

        parentElement.appendChild(this.element);
        return this.element;
    }
}
