import { IconPackPlugin } from "./plugins/IconPackPlugin.js";
import { PanelComponentPlugin } from "./plugins/PanelPlugin.js";
import { PortComponentPlugin } from "./plugins/PortPlugin.js";
import { ButtonComponentPlugin } from "./plugins/ButtonPlugin.js";
import { TextComponentPlugin } from "./plugins/TextPlugin.js";
import { GroupComponentPlugin, VGroupComponentPlugin, HGroupComponentPlugin } from "./plugins/LayoutPlugins.js";
// import { LabelComponentPlugin } from './plugins/LabelPlugin.js';
import { MouseInteractionPlugin } from "./plugins/MousePlugin.js";

import { Engine } from "./core/Engine.js";

export class Widgets {
  constructor(svg) {
    this.engine = new Engine(svg);
    this.#setup();
    this.engine.start();
  }

  #setup() {

    this.engine.loadStyleSheet(new URL("./style.css", import.meta.url).href)

    this.engine.use(new IconPackPlugin());

    // Register component plugins
    this.engine.registerComponentPlugin("Panel", new PanelComponentPlugin());
    this.engine.registerComponentPlugin("Group", new GroupComponentPlugin());
    this.engine.registerComponentPlugin("VGroup", new VGroupComponentPlugin());
    this.engine.registerComponentPlugin("HGroup", new HGroupComponentPlugin());
    this.engine.registerComponentPlugin("Port", new PortComponentPlugin());
    this.engine.registerComponentPlugin("Button", new ButtonComponentPlugin());
    this.engine.registerComponentPlugin("Text", new TextComponentPlugin());
    // this.widgetEngine.registerComponentPlugin('Label', new LabelComponentPlugin());

    // Register interaction plugins
    const mousePlugin = new MouseInteractionPlugin();
    this.engine.use(mousePlugin);

    // const example = `
    //     <Panel caption="Basic Example55555" left="500" top="500" width="320" height="200" horizontalCenter="0" verticalCenter="0">
    //       <Group left="10" top="10">
    //         <VGroup gap="5">
    //           <Port name="input"/>
    //           <Button caption="Click Me" />
    //           <Button caption="Or Me" />
    //         </VGroup>
    //       </Group>
    //     </Panel>
    //   `;

    // <Label caption="Hello World!" />

    // this.widgetEngine.loadXML(test1);
  }

  start(){
    // NOOP: started at the constructor
  }
  stop(){
    this.engine.stop();
  }


  // PUBLIC API
  append(...a){
    return this.engine.append(...a)
  }
  get registry(){
    return this.engine.registry;
  }

}
