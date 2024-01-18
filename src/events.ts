/**
 * OpenSeadragon inspired event system for reduction of dependencies and uniform event approach
 */

export type EventHandler = (event: object) => void;

export class EventSource {
    events: any;

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
    addOnceHandler(eventName, handler, userData, times, priority) {
        const self = this;
        times = times || 1;
        let count = 0;
        const onceHandler = function(event) {
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
    addHandler ( eventName, handler, userData, priority ) {
        let events = this.events[ eventName ];
        if ( !events ) {
            this.events[ eventName ] = events = [];
        }
        if ( handler && EventSource.isFunction( handler ) ) {
            let index = events.length,
                event = { handler: handler, userData: userData || null, priority: priority || 0 };
            events[ index ] = event;
            while ( index > 0 && events[ index - 1 ].priority < events[ index ].priority ) {
                events[ index ] = events[ index - 1 ];
                events[ index - 1 ] = event;
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
    removeHandler ( eventName, handler ) {
        const events = this.events[ eventName ],
            handlers = [];
        if ( !events ) {
            return;
        }
        if ( Array.isArray( events ) ) {
            for ( let i = 0; i < events.length; i++ ) {
                if ( events[i].handler !== handler ) {
                    handlers.push( events[ i ] );
                }
            }
            this.events[ eventName ] = handlers;
        }
    }

    /**
     * Get the amount of handlers registered for a given event.
     * @param {String} eventName - Name of event to inspect.
     * @returns {number} amount of events
     */
    numberOfHandlers (eventName) {
        const events = this.events[ eventName ];
        if ( !events ) {
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
    removeAllHandlers( eventName ) {
        if ( eventName ){
            this.events[ eventName ] = [];
        } else{
            for ( const eventType in this.events ) {
                this.events[ eventType ] = [];
            }
        }
    }

    /**
     * Get a function which iterates the list of all handlers registered for a given event, calling the handler for each.
     * @function
     * @param {String} eventName - Name of event to get handlers for.
     */
    getHandler ( eventName) {
        let events = this.events[ eventName ];
        if ( !events || !events.length ) {
            return null;
        }
        events = events.length === 1 ?
            [ events[ 0 ] ] :
            Array.apply( null, events );
        return function ( source, args ) {
            let i,
                length = events.length;
            for ( i = 0; i < length; i++ ) {
                if ( events[ i ] ) {
                    args.eventSource = source;
                    args.userData = events[ i ].userData;
                    events[ i ].handler( args );
                }
            }
        };
    }

    /**
     * Trigger an event, optionally passing additional information.
     * @function
     * @param {String} eventName - Name of event to register.
     * @param {Object} eventArgs - Event-specific data.
     */
    raiseEvent( eventName, eventArgs ) {
        const handler = this.getHandler( eventName );
        if ( handler ) {
            return handler( this, eventArgs || {} );
        }
        return undefined;
    }

    static class2type = {
        '[object Boolean]':       'boolean',
        '[object Number]':        'number',
        '[object String]':        'string',
        '[object Function]':      'function',
        '[object AsyncFunction]': 'function',
        '[object Promise]':       'promise',
        '[object Array]':         'array',
        '[object Date]':          'date',
        '[object RegExp]':        'regexp',
        '[object Object]':        'object'
    };

    /**
     * Taken from jQuery 1.6.1
     * @function isFunction
     * @memberof OpenSeadragon
     * @see {@link http://www.jquery.com/ jQuery}
     */
    static isFunction( obj ) {
        return this.type(obj) === "function";
    };

    /**
     * Taken from jQuery 1.6.1
     * @function type
     * @memberof OpenSeadragon
     * @see {@link http://www.jquery.com/ jQuery}
     */
    static type( obj ) {
        return ( obj === null ) || ( obj === undefined ) ?
            String( obj ) :
            this.class2type[ String.toString.call(obj) ] || "object";
    };
}
