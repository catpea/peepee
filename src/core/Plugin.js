export class Plugin {
  eventDispatch(...argv) {
    // console.info('eventDispatch:', this.constructor.name, ...argv,);
    this.app.emit(...argv);
  }

  listenTo(element, event, callback, options = false) {
    element.addEventListener(event, callback, options);
    const unsubscribe = () => element.removeEventListener(event, callback, options);
    this.subscriptions.add(unsubscribe);
  }

  tuneIn(signal, callback) {
    if (!signal) throw new Error("Signal is missing");
    const unsubscribe = signal.subscribe(callback);
    this.subscriptions.add(unsubscribe);
  }

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
}
