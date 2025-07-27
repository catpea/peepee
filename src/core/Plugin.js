import {EventCorrelator} from 'events';

export class Plugin {

  // EVENTS //

  // this.featureRequest('ManifestManagerPlugin', 'agentManifests');
  featureRequest(pluginName, ...featureNames){
    const plugin = this.app.plugins.get(pluginName);
    if(!plugin) throw new Error('Plugin not found')
    for(const featureName of featureNames){
      const feature = plugin[featureName];
      if(!feature) throw new Error('Plugin feature not found')
      this[featureName] = feature;
    }
  }

  eventDispatch(...argv) {
    this.app.emit(...argv);
  }

  bus(eventName, eventHandler){
    const unsubscribe = this.app.on(eventName, eventHandler);
    this.app.garbage.add([this.pluginName, 'plug-in', `app.on(${eventName})` ], unsubscribe, `Listen to "${eventName}" on application bus`);
  }

  listenTo(element, eventName, eventHandler, options = false) {
    element.addEventListener(eventName, eventHandler, options);
    const unsubscribe = () => element.removeEventListener(eventName, eventHandler, options);
    this.app.garbage.add([this.pluginName, 'plug-in', `element-event` ], unsubscribe, `Listen to element event "${eventName}"`);
  }

  tuneIn(signal, callback) {
    if (!signal) throw new Error("Signal is missing");
    const unsubscribe = signal.subscribe(callback);
    this.app.garbage.add([this.pluginName, 'plug-in', `signal` ], unsubscribe, `Listen to signal change`);
  }

  // CSS

  linkStyleSheet(url) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }

  loadStyleSheet(url) {
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load CSS: ${response.statusText}`);
        return response.text();
      })
      .then((cssText) => {
        const style = document.createElement("style");
        style.textContent = cssText;
        document.head.appendChild(style);
      })
      .catch((error) => {
        console.error("Error loading stylesheet:", error);
      });
  }

  createStyle(cssText) {
    const style = document.createElement("style");
    style.textContent = cssText;
    document.head.appendChild(style);
  }

  //

  generateId() {
    const randomChars = (length = 8) => Array.from({ length }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join("");
    return `${randomChars()}-${randomChars(4)}-${randomChars(4)}-${randomChars(4)}-${randomChars(12)}`;
  }


}
