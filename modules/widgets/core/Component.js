import { Signal } from 'signals';

/**
 * Base class for all components
 */
export class Component  {

  // Constants
  static ElementWidth = 128;
  static ElementHeight = 32;
  static FontSize = 10;
  static ContainerWidth = 320;
  static ContainerHeight = 200;

    constructor(attributes = {}, engine) {

      this.id = attributes.id??'comp-' + Math.random().toString(36).substr(2, 9);

      this.engine = engine;

      this.subscriptions = new Set();

      this.element = null;

      this.attributes = {};
      //console.info('EEE', attributes)
      this.installAttributeSignals(attributes);

      this.children = [];


    }

    parseValue(value) {
        if (typeof value === 'string') {
            if (value.includes('%')) {
                return { value: parseFloat(value), unit: '%' };
            }
            if (!isNaN(value)) {
                return parseFloat(value);
            }
        }
        return value;
    }

    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }

    // onPropertyChange(propertyName) {
    //     // Re-render when reactive properties change
    //     if (this.element && this.element.parentNode) {
    //         this.render(this.element.parentNode);
    //     }
    // }

    render(parentComponent, parentElement) {
        //console.warn('Override in subclasses');
        return null;
    }

    layout(containerWidth, containerHeight) {
        // Override in subclasses
        this.children.forEach(child => {
            child.layout(containerWidth, containerHeight);
        });
    }

    query(path=['some-name', 'another-name'], lookupFn=(child,currentValue)=>child.name.value==currentValue) {
        return path.reduce(
          (accumulator, currentValue) => accumulator.children.find((child,currentValue)=>lookupFn(child,currentValue)),
          this.children,
        );
    }

  installAttributeSignals(rawAttributes, {override}={override:true}){

    for(const [attributeName, attributeValue] of Object.entries(rawAttributes)){
      //console.info('EEE', {attributeName, attributeValue})
      if(this.attributes[attributeName]){
        // update value
        if(override){
         this.attributes[attributeName].value = attributeValue;
        }else{
          //console.log('EEE Skipped assigning', attributeName, attributeValue)
        }
      }else{
        // add missing signal
        this.attributes[attributeName] = new Signal(attributeValue);
      }
    }
  }

  // listenToAttributeSignals(input, fn){
  //   let names;
  //   if(typeof input === 'string'){
  //    names = [input];
  //   }else if(Array.isArray(input)){
  //     names = input;
  //   }else{
  //     throw new Error('Only array or string is supported as input')
  //   }
  //   for(const name of names){
  //     if(typeof name !== 'string') throw new Error('Attribute name must be a string.')
  //     const subscription = this.attributes[name].subscribe(()=>fn(...names.map(name=>this.attributes[name].value)));
  //     this.subscriptions.add(subscription); // cleared on stop
  //   }
  // } // listenToAttributeSignals

  /**
   * Listens to attribute signals and executes a callback function when any of the specified attributes change
   * @param {string|string[]} input - Single attribute name or array of attribute names to listen to
   * @param {Function} fn - Callback function to execute when attributes change
   * @throws {TypeError} When input type is invalid or callback is not a function
   * @throws {Error} When attribute names are invalid or attributes don't exist
   */
  listenToAttributeSignals(input, fn) {
      // Validate callback function first
      if (typeof fn !== 'function') {
          throw new TypeError('Callback must be a function, received: ' + typeof fn);
      }

      // Validate and normalize input to array
      let names;
      if (typeof input === 'string') {
          if (input.trim() === '') {
              throw new Error('Attribute name cannot be empty or whitespace-only');
          }
          names = [input.trim()];
      } else if (Array.isArray(input)) {
          if (input.length === 0) {
              throw new Error('Attribute names array cannot be empty');
          }
          names = input;
      } else {
          throw new TypeError(
              `Invalid input type: expected string or array, received: ${typeof input}. ` +
              'Please provide either a single attribute name as a string or an array of attribute names.'
          );
      }

      // Validate this.attributes exists
      if (!this.attributes || typeof this.attributes !== 'object') {
          throw new Error('Attributes object is not properly initialized. Ensure this.attributes is defined.');
      }

      // Validate this.subscriptions exists
      if (!this.subscriptions || typeof this.subscriptions.add !== 'function') {
          throw new Error('Subscriptions manager is not properly initialized. Ensure this.subscriptions has an add() method.');
      }

      // Validate all attribute names and their existence
      for (const [index, name] of names.entries()) {
          if (typeof name !== 'string') {
              throw new TypeError(
                  `Attribute name at index ${index} must be a string, received: ${typeof name}. ` +
                  'All attribute names must be strings.'
              );
          }

          if (name.trim() === '') {
              throw new Error(`Attribute name at index ${index} cannot be empty or whitespace-only`);
          }

          const trimmedName = name.trim();
          if (!this.attributes.hasOwnProperty(trimmedName)) {
              throw new Error(
                  `Attribute "${trimmedName}" does not exist. ` +
                  `Available attributes: [${Object.keys(this.attributes).join(', ')}]`
              );
          }

          if (!this.attributes[trimmedName] || typeof this.attributes[trimmedName].subscribe !== 'function') {
              throw new Error(
                  `Attribute "${trimmedName}" is not a valid signal object. ` +
                  'Expected an object with a subscribe() method.'
              );
          }
      }

      // Normalize names by trimming whitespace
      const normalizedNames = names.map(name => name.trim());

      // Set up subscriptions for each attribute
      try {
          for (const name of normalizedNames) {
              const subscription = this.attributes[name].subscribe(() => {
                  try {
                      // Get current values and execute callback
                      const currentValues = normalizedNames.map(attrName => {
                          const attr = this.attributes[attrName];
                          return attr?.value;
                      });
                      fn(...currentValues);
                  } catch (callbackError) {
                      console.error(`Error in attribute signal callback for [${normalizedNames.join(', ')}]:`, callbackError);
                      // Re-throw to allow proper error handling by the caller
                      throw new Error(`Callback execution failed: ${callbackError.message}`);
                  }
              });

              this.subscriptions.add(subscription);
          }
      } catch (subscriptionError) {
          throw new Error(
              `Failed to set up attribute subscriptions for [${normalizedNames.join(', ')}]: ${subscriptionError.message}`
          );
      }
  }

  setAttributeSignal(element, attributeName, signalName){
    signalName ??= attributeName;
    this.listenToAttributeSignals(signalName, v=>element.setAttribute(attributeName, v));
  }

}
