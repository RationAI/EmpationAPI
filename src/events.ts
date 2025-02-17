/**
 * OpenSeadragon inspired event system for reduction of dependencies and uniform event approach
 */

export type EventHandler = (event: any) => void;

export class EventSource {
  events: { [key: string]: any } = {};

  /**
   * Add an event handler to be triggered only once (or a given number of times)
   * for a given event. It is not removable with removeHandler().
   * @function
   * @param {String} eventName - Name of event to register.
   * @param {EventHandler} handler - Function to call when event
   * is triggered.
   * @param {Object} [userData=null] - Arbitrary object to be passed unchanged
   * to the handler.
   * @param {Number} [times=1] - The number of times to handle the event
   * before removing it.
   * @param {Number} [priority=0] - Handler priority. By default, all priorities are 0. Higher number = priority.
   */
  addOnceHandler(
    eventName: string,
    handler: EventHandler,
    userData: object,
    times: number,
    priority: number,
  ) {
    const self = this;
    times = times || 1;
    let count = 0;
    const onceHandler = function (event: object) {
      count++;
      if (count === times) {
        self.removeHandler(eventName, onceHandler);
      }
      return handler(event);
    };
    this.addHandler(eventName, onceHandler, userData, priority);
  }

  /**
   * Add an event handler for a given event.
   * @function
   * @param {String} eventName - Name of event to register.
   * @param {EventHandler} handler - Function to call when event is triggered.
   * @param {Object} [userData=null] - Arbitrary object to be passed unchanged to the handler.
   * @param {Number} [priority=0] - Handler priority. By default, all priorities are 0. Higher number = priority.
   */
  addHandler(
    eventName: string,
    handler: EventHandler,
    userData: object | null = null,
    priority: number = 0,
  ) {
    let events = this.events[eventName];
    if (!events) {
      this.events[eventName] = events = [];
    }
    if (handler && EventSource.isFunction(handler)) {
      let index = events.length,
        event = {
          handler: handler,
          userData: userData || null,
          priority: priority || 0,
        };
      events[index] = event;
      while (index > 0 && events[index - 1].priority < events[index].priority) {
        events[index] = events[index - 1];
        events[index - 1] = event;
        index--;
      }
    }
  }

  /**
   * Remove a specific event handler for a given event.
   * @function
   * @param {String} eventName - Name of event for which the handler is to be removed.
   * @param {EventHandler} handler - Function to be removed.
   */
  removeHandler(eventName: string, handler: EventHandler) {
    const events = this.events[eventName],
      handlers: EventHandler[] = [];
    if (!events) {
      return;
    }
    if (Array.isArray(events)) {
      for (let i = 0; i < events.length; i++) {
        if (events[i].handler !== handler) {
          handlers.push(events[i]);
        }
      }
      this.events[eventName] = handlers;
    }
  }

  /**
   * Get the amount of handlers registered for a given event.
   * @param {String} eventName - Name of event to inspect.
   * @returns {number} amount of events
   */
  numberOfHandlers(eventName: string) {
    const events = this.events[eventName];
    if (!events) {
      return 0;
    }
    return events.length;
  }

  /**
   * Remove all event handlers for a given event type. If no type is given all
   * event handlers for every event type are removed.
   * @function
   * @param {String} eventName - Name of event for which all handlers are to be removed.
   */
  removeAllHandlers(eventName: string) {
    if (eventName) {
      this.events[eventName] = [];
    } else {
      for (const eventType in this.events) {
        this.events[eventType] = [];
      }
    }
  }

  /**
   * Get a function which iterates the list of all handlers registered for a given event, calling the handler for each.
   * @function
   * @param {String} eventName - Name of event to get handlers for.
   */
  getHandler(eventName: string) {
    let events = this.events[eventName];
    if (!events || !events.length) {
      return null;
    }
    events = events.length === 1 ? [events[0]] : Array.apply(null, events);
    return function (source: any, args: any) {
      let i,
        length = events.length;
      for (i = 0; i < length; i++) {
        if (events[i]) {
          args.eventSource = source;
          args.userData = events[i].userData;
          events[i].handler(args);
        }
      }
    };
  }

  /**
   * Get a function which iterates the list of all handlers registered for a given event,
   * calling the handler for each and awaiting async ones.
   * @function
   * @param {String} eventName - Name of event to get handlers for.
   */
  getAwaitingHandler(eventName: string) {
    let events = this.events[eventName];
    if (!events || !events.length) {
      return null;
    }
    events = events.length === 1 ? [events[0]] : Array.apply(null, events);

    return function (source: any, args: Record<string, any>) {
      // We return a promise that gets resolved after all the events finish.
      // Returning loop result is not correct, loop promises chain dynamically
      // and outer code could process finishing logics in the middle of event loop.
      return new Promise((resolve) => {
        const length = events.length;
        function loop(index: number) {
          if (index >= length || !events[index]) {
            resolve('Resolved!');
            return null;
          }
          args.eventSource = source;
          args.userData = events[index].userData;
          let result = events[index].handler(args);
          result =
            !result || EventSource.type(result) !== 'promise'
              ? Promise.resolve()
              : result;
          return result.then(() => loop(index + 1));
        }
        loop(0);
      });
    };
  }

  /**
   * Trigger an event, optionally passing additional information.
   * @function
   * @param {String} eventName - Name of event to register.
   * @param {Object} eventArgs - Event-specific data.
   */
  raiseEvent(eventName: string, eventArgs?: any) {
    const handler = this.getHandler(eventName);
    if (handler) {
      return handler(this, eventArgs || {});
    }
    return undefined;
  }

  /**
   * Trigger an event, optionally passing additional information.
   * This events awaits every asynchronous or promise-returning function.
   * @param {String} eventName - Name of event to register.
   * @param {Object} eventArgs - Event-specific data.
   * @return {Promise|undefined} - Promise resolved upon the event completion.
   */
  raiseEventAwaiting(eventName: string, eventArgs: Record<string, any>) {
    //uncomment if you want to get a log of all events
    //$.console.log( "Awaiting event fired:", eventName );

    const awaitingHandler = this.getAwaitingHandler(eventName);
    if (awaitingHandler) {
      return awaitingHandler(this, eventArgs || {});
    }
    return Promise.resolve('No handler for this event registered.');
  }

  static class2type = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object AsyncFunction]': 'function',
    '[object Promise]': 'promise',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regexp',
    '[object Object]': 'object',
  };

  /**
   * Taken from jQuery 1.6.1
   * @function isFunction
   * @memberof OpenSeadragon
   * @see {@link http://www.jquery.com/ jQuery}
   */
  static isFunction(obj: object) {
    return this.type(obj) === 'function';
  }

  /**
   * Taken from jQuery 1.6.1
   * @function type
   * @memberof OpenSeadragon
   * @see {@link http://www.jquery.com/ jQuery}
   */
  static type(obj: object) {
    return obj === null || obj === undefined
      ? String(obj)
      : this.class2type[obj.toString() as keyof typeof this.class2type] ||
          (typeof obj === 'function' ? 'function' : 'object');
  }
}
