import { Widgets } from 'widgets';

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

    this.widgets = new Widgets(this.svg);
    this.subscriptions.add(()=>this.widgets.stop());

  }

  start() {
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }
}
