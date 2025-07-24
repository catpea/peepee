import { Plugin } from 'plugin';

import { installShowOpenFilePicker } from './window/showOpenFilePicker.js';
import { installShowSaveFilePicker } from './window/showSaveFilePicker.js';

export class PolyfillManagerPlugin extends Plugin {
  app;
  subscriptions;

  constructor() {
    super();
    this.subscriptions = new Set();

    installShowOpenFilePicker();
    installShowSaveFilePicker();

  }

  init(app) {
    this.app = app;
  }

  stop() {
    for (const unsubscribe of this.subscriptions) unsubscribe();
    this.subscriptions.clear();
  }

} // class
