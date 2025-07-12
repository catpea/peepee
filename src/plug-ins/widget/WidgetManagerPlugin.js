import { WidgetEngine } from './core/WidgetEngine.js';
import { IconPackPlugin } from './plugins/IconPackPlugin.js';
import { PanelComponentPlugin } from './plugins/PanelPlugin.js';
import { PortComponentPlugin } from './plugins/PortPlugin.js';
import { ButtonComponentPlugin } from './plugins/ButtonPlugin.js';
import { GroupComponentPlugin, VGroupComponentPlugin, HGroupComponentPlugin } from './plugins/LayoutPlugins.js';
// import { LabelComponentPlugin } from './plugins/LabelPlugin.js';
import { MouseInteractionPlugin } from './plugins/MousePlugin.js';


import { Plugin } from 'plugin';

export class WidgetManagerPlugin extends Plugin {
  app;
  subscriptions;
  constructor() {
    super();
    this.subscriptions = new Set();
  }

  init(app) {
    this.app = app;
    this.svg = this.app.svg;

    this.colorManagerPlugin = app.plugins.get('ColorManagerPlugin');
    this.colorFloors = this.colorManagerPlugin.colorFloors;

    this.widgetEngine = new WidgetEngine(this.svg);
    this.setupPlugins();
    this.widgetEngine.start();

    console.dir( this.colorFloors );

    const colors = {
      primary: this.colorFloors[0].primary,
      secondary: this.colorFloors[0].secondary,
      surface: this.colorFloors[0].surface,
      body: this.colorFloors[0].background,

      interactive: this.colorFloors[0].interactive,
      elevated: this.colorFloors[0].elevated,
      subtle: this.colorFloors[0].subtle,
      text: this.colorFloors[0].text,
      border: this.colorFloors[0].border,
    }

        // ${Object.entries(colors).map(([name, value])=>`--${name}-color: ${value};`).join('\n')}
    const cssText = `

      :root {

        --elevated-color:   color-mix(in srgb, var(--base02) 70%, var(--cyan) 30%);
        --surface-color:  color-mix(in srgb, var(--base02) 90%, var(--cyan) 10%);
        --subtle-color: color-mix(in srgb, var(--base02) 85%, var(--cyan) 15%);
      }

      /*
      [data-theme="dark"] {
        --primary-color: #3b82f6;
        --secondary-color: #94a3b8;
        --surface-color: #1e293b;
        --text-color: #f1f5f9;
        --border-color: #334155;
      }
      */


      .port {

      .port-bg {
          fill: var(--surface-color);
          stroke: var(--base02);
        }

      .port-socket {
          fill: var(--cyan);
          stroke: var(--base1);
          stroke-width: 1px;
        }

        .port-caption {
          fill: var(--base01);
        }
      }

      .button {
        cursor: pointer;


        .button-caption {
          fill: var(--base01);
        }

        .button-bg {
          fill: var(--base03);
          stroke: var(--base02);

          &.hover {
            fill: color-mix(in srgb, var(--base02) 99%, var(--cyan) 1%);
          }

          &.active {
            fill: color-mix(in srgb, var(--base02) 95%, var(--violet) 5%);
          }

        }


      }

      .panel {
          stroke-width: 0;

        .panel-bg {
          fill: var(--surface-color);
        }

        .panel-title-bg {
          fill: var(--subtle-color)
        }

        .panel-icon-bg {

          fill: var(--elevated-color);
        }

        .panel-icon {
          fill: var(--text);
        }

        .panel-caption {
          fill: var(--text);
          font-weight: 600;
        }


      }









    `;
    this.createStyle(cssText);

    // this.loadStyleSheet(new URL("./style.css", import.meta.url).href);
  }

   setupPlugins() {

     this.widgetEngine.use(new IconPackPlugin());

        // Register component plugins
        this.widgetEngine.registerComponentPlugin('Panel', new PanelComponentPlugin());
        this.widgetEngine.registerComponentPlugin('Group', new GroupComponentPlugin());
        this.widgetEngine.registerComponentPlugin('VGroup', new VGroupComponentPlugin());
        this.widgetEngine.registerComponentPlugin('HGroup', new HGroupComponentPlugin());
        this.widgetEngine.registerComponentPlugin('Port', new PortComponentPlugin());
        this.widgetEngine.registerComponentPlugin('Button', new ButtonComponentPlugin());
        // this.widgetEngine.registerComponentPlugin('Label', new LabelComponentPlugin());

        // Register interaction plugins
        const mousePlugin = new MouseInteractionPlugin();
        this.widgetEngine.use(mousePlugin);





      const test1 = `
        <Panel caption="Basic Example" left="500" top="500" width="320" height="200" horizontalCenter="0" verticalCenter="0">
          <Group left="10" top="10">
            <VGroup gap="5">
              <Port name="input"/>
              <Button caption="Click Me" />
              <Button caption="Or Me" />
            </VGroup>
          </Group>
        </Panel>
      `;

              // <Label caption="Hello World!" />

     // this.widgetEngine.loadXML(test1);


    }

    start() {
        this.widgetEngine.start();
        console.log('FFF App started with components:', Array.from(this.widgetEngine.componentPlugins.keys()));
    }



    clear() {
        this.widgetEngine.clear();
    }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }
}
