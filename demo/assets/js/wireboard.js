Wireboard.extend = function(prototypeProperties, staticProperties) {

	/**
	 * Does the prototype definition have constructor (is it a function)
	 *
	 * @type {Object} prototypeProperties
	 * @returns {Boolean}
	 */
	var hasConstructor = function(prototypeProperties) {
		return prototypeProperties && _.has(prototypeProperties, 'constructor');
	};

	/**
	 * Create the constructor
	 * @returns {Function}
	 */
	var createChildConstructor = function(prototypeProperties) {

		if (hasConstructor(prototypeProperties)) {
			return prototypeProperties.constructor;
		}

		return function() {
			// Create a constructor that calls the constructor on which the extend was called.
			return parent.apply(this, arguments);
		};
	};

	/**
	 * The parent is the object we're extending from. Probably the object
	 * that has set up Object.extend = Wireboard.extend;
	 *
	 * @type {Function|Wireboard.extend}
	 */
	var parent = this;

	/**
	 * The constructor function for the new subclass is either defined by you
	 * (the "constructor"property in your `extend` definition), or defaulted by
	 * us to simply call the parent's constructor.
	 */
	prototypeProperties = prototypeProperties || {};
	var ExtendedObject = createChildConstructor(prototypeProperties);

	/**
	 * Add static properties to the constructor function.
	 * They are set 'in' the constructor from both the parent
	 * and the staticProperties object.
	 */
	_.assign(ExtendedObject, parent, staticProperties);

	/**
	 * Set the prototype chain to inherit from parent, without calling
	 * parent's constructor function. If we sould wrap it, we'd have to do
	 * something like ExtendedObject.prototype = new parent() which would
	 * create a ghost parent object.
	 *
	 * @type {Function|Wireboard.extend}
	 */
	var ExtendWrapper = function() {
		this.constructor = ExtendedObject;
	};
	ExtendWrapper.prototype = parent.prototype;
	ExtendedObject.prototype = new ExtendWrapper();

	/**
	 * Define the child object and copy the prototypeProperties to its prototype.
	 */
	var child = ExtendedObject;
	_.assign(child.prototype, prototypeProperties);

	/**
	 * Set convenient properties so we can call something like this:
	 *
	 * myChild.__parent; // returns parent
	 */
	if ( ! child.prototype.__parent) {
		child.prototype.__parent = parent.prototype;
	}
	child.prototype.__static = _.assign({}, parent, staticProperties);
	return child;
};
;

Wireboard.Event = (function(undefined) {

	var Event = function() {
		this.initialize.apply(this, arguments);
	};

	/**
	 * Add the extend method to the view
	 */
	Event.extend = Wireboard.extend;

	/**
	 * Add base methods to event object
	 */
	Event.prototype = {

		/**
		 * @type {String}
		 * @private
		 */
		_type: '',

		/**
		 * Who dispatched the event?
		 *
		 * @type: {Wireboard.EventDispatcher}
		 * @private
		 */
		_target: null,

		/**
		 * @param {Object} data
		 * @param {String} [type]
		 */
		initialize: function(data, type) {

			// Get the type from the statics
			this._type = type || this.__static.TYPE;

			// Merge the data into the object
			_.extend(this, data);

			// Verify it has a type
			if (!this.getType()) {
				throw new Error('Cannot create an Event without passing it an event type.');
			}
		},

		/**
		 * @returns {String}
		 */
		getType: function() {
			return this._type;
		},

		/**
		 * @returns {Wireboard.EventDispatcher}
		 */
		getTarget: function() {
			return this.target;
		},

		/**
		 * @returns {String}
		 */
		toString: function() {
			return '[object Event]';
		}
	};

	return Event;

})();
;

Wireboard.EventDispatcher = (function() {

	'strict mode';

	/**
	 * @constructor
	 */
	var EventDispatcher = function() {
		this.initialize.apply(this, arguments);
	};

	// Eventdispatcher can be extended
	EventDispatcher.extend = Wireboard.extend;

	/**
	 * @type {{constructor: Function, apply: Function, addEventListener: Function, hasEventListener: Function, removeEventListener: Function, dispatchEvent: Function}}
	 */
	EventDispatcher.prototype = {

		/**
		 * @type {Function}
		 */
		//constructor: EventDispatcher,

		/**
		 * @type {Object}
		 */
		eventListeners: null,

		/**
		 * Non-event listeners. Will be triggered for EVERY event that is dispatched.
		 *
		 * @type {Array}
		 */
		globalListeners: null,
		
		/**
		 * Should it log
		 */
		log: false,

		/**
		 *
		 */
		initialize: function() {
			this.eventListeners = {};
			this.globalListeners = [];
		},

		/**
		 * Add a listener based on the type
		 *
		 * @param {String} type
		 * @param {Function} listener
		 */
		addEventListener: function(type, listener) {

			var listeners = this.eventListeners;
			if (listeners[type] === undefined) {
				listeners[type] = [];
			}

			if (_.indexOf(listeners[type], listener) === -1) {
				listeners[type].push(listener);
			}
		},

		/**
		 * Check if it has the supplied listener on that type
		 *
		 * @param {String} type
		 * @param {Function} listener
		 */
		hasEventListener: function(type, listener) {

			if (this.eventListeners === undefined) return false;

			var listeners = this.eventListeners;
			if (listeners[type] !== undefined && _.indexOf(listeners[type], listener) !== -1) {
				return true;
			}
			return false;
		},

		/**
		 * Remove a listener based on the type and the listener
		 *
		 * @param {String} type
		 * @param {Function} listener
		 */
		removeEventListener: function(type, listener) {

			if (this.eventListeners === undefined) return;

			var listeners = this.eventListeners;
			var listenerArray = listeners[type];

			if (listenerArray !== undefined) {
				var index = _.indexOf(listenerArray, listener);
				if (index !== -1) {
					listenerArray.splice(index, 1);
				}
			}
		},

		/**
		 * Dispatch the supplied event
		 * @param {Object} event
		 */
		dispatchEvent: function(event) {
			if (this.log) {
				this._logEvent(event);
			}

			if (this.eventListeners === undefined) return;

			var listeners = this.eventListeners;
			var listenerArray = listeners[event.getType()];

			if (listenerArray === undefined) {
				return;
			}

			// Set the target on the event
			event._target = this;

			var array = [];
			var length = listenerArray.length;

			for (var i = 0; i < length; i++) {
				array[i] = listenerArray[i];
			}

			// Invoke all listeners
			for (i = 0; i < length; i++) {
				if (typeof array[i].call === 'undefined') {
					throw new Error('Event handler function undefined or not a function for event ' + event.getType());
				}
				array[i].call(this, event);
			}

			var globalLength = this.globalListeners.length;
			for (i = 0; i < globalLength; i++) {
				this.globalListeners[i].call(this, event);
			}
		},

		/**
		 * @param {Function} listener
		 */
		addGlobalListener: function(listener) {
			this.globalListeners.push(listener);
		},

		/**
		 * @param {Function} listener
		 */
		removeGlobalListener: function(listener) {
			this.globalListeners = _.without(this.globalListeners, listener);
		},

		/**
		 * @param {Wireboard.Event} event
		 * @private
		 */
		_logEvent: function(event) {
			var now = new Date();
			var timestamp = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + '.' + now.getMilliseconds();
			console.log('[' + timestamp + '] ' + event.getType());
		},

		/**
		 * @returns {String}
		 */
		toString: function() {
			return '[object EventDispatcher]';
		}
	};
	return EventDispatcher;
})();
;

Wireboard.Command = (function(undefined) {

    var Command = function() {
        this.initialize.apply(this, arguments);
    };

    Command.prototype = {

        /**
         * @type {Wireboard.EventDispatcher}
         */
        dispatcher: 'inject',

        /**
         * The event that triggered this command
         *
         * @type {Wireboard.Event}
         */
        event: null,

        /**
         * @type {Wireboard.Context}
         */
        context: 'inject',

        /**
         * @param {Wireboard.Event} [event]
         */
        initialize: function(event) {
            this.event = event;
        },

        /**
         *
         * @param {String} eventType
         * @param {Wireboard.Command} CommandClass
         */
        execute: function() {
            throw new Error('Command should override the execute method.');
        },

        /**
         * @param {Wireboard.Event} event
         */
        dispatch: function(event) {
            this.dispatcher.dispatchEvent(event);
        },

        /**
         * @returns {String}
         */
        toString: function() {
            return '[object Command]';
        }
    };

    return Command;

})();
;

Wireboard.CommandMap = (function(undefined) {

    'use strict';

    var CommandMap = function() {
        this.initialize.apply(this, arguments);
    };

    CommandMap.prototype = {

        /**
         * Use event types as key and value is array containing
         * commands that are executed when that event occurs.
         *
         * @type {Object}
         */
        mappings: {},

        /**
         * @type {Wireboard.EventDispatcher}
         */
        dispatcher: 'inject',

        /**
         * @type {Wireboard.Context}
         */
        context: 'inject',

        /**
         * @type {injector.Injector}
         */
        injector: null,

        /**
         * @param {injector.Injector} injector
         */
        initialize: function(injector) {
            this.injector = injector;

            this.injector.injectInto(this);
            this.dispatcher.addGlobalListener(_.bind(this._onEvent, this));
        },

        /**
         *
         * @param {String} eventType
         * @param {Wireboard.Command} CommandClass
         * @return {Wireboard.CommandMap}
         */
        map: function(eventType, CommandClass) {

            if (this.mappings[eventType] === undefined) {
                this.mappings[eventType] = [];
            }

            this.mappings[eventType].push(CommandClass);
            return this;
        },

        /**
         * @param {Wireboard.Event} event
         * @private
         */
        _onEvent: function(event) {
            var type = event.getType();
            if (this.mappings[type] === undefined) {
                return;
            }

            // Execute the command(s) that match the event type
            var commandMap = this;
            _.each(this.mappings[type], function(CommandClass) {
                commandMap._executeCommand(CommandClass, event);
            });
        },

        /**
         * @param {Wireboard.Command|Function} CommandClass
         * @param {Wireboard.Event} event
         * @private
         */
        _executeCommand: function(CommandClass, event) {
            var command = new CommandClass(event);

            // Inject into the command
            this.injector.injectInto(command);

            command.execute();
        },

        /**
         * @returns {String}
         */
        toString: function() {
            return '[object CommandMap]';
        }
    };

    return CommandMap;

})();
;

Wireboard.View = (function(undefined) {

	/**
	 * Basic view implementation
	 *
	 * @param {Object} options
	 * @constructor
	 */
	var View = function (options) {
		options = options || {};

		// Setup things before the initialize is called
		if (options.injector) {
			options.injector.injectInto(this);
		} else if (Wireboard.instances.injector) {
			Wireboard.instances.injector.injectInto(this);
		}

		if (options.el) {
			this.setEl(options.el);
		}

		// Manually call initialize on the event dispatcher
		Wireboard.EventDispatcher.prototype.initialize.apply(this);

		// Use initialize.apply because we cannot simply call it due to variadic arguments.
		this.initialize.apply(this, arguments);
	};

	/**
	 * Add the extend method to the view
	 */
	View.extend = Wireboard.extend;

	/**
	 * Add base View methods to the prototype
	 */
	View.prototype = _.extend({

		/**
		 * @type {Wireboard.EventDispatcher}
		 */
		dispatcher: 'inject',

		/**
		 * @type {Node}
		 */
		el: null,

		/**
		 * @type {jQuery}
		 */
		$el: null,

		/**
		 * Override initialize if needed
		 */
		initialize: function () { },

		/**
		 * Return the precompiled template
		 *
		 * @param {String} templateName
		 * @param {Object} data
		 * @returns {Function}
		 */
		template: function (templateName, data) {
			var templateFunction = Wireboard.Views.Templates['./assets/templates/' + templateName + '.html'];
			if (!templateFunction)
			{
				throw 'Could not load template ' + templateName;
			}
			return templateFunction(data);
		},

		/**
		 * @param {Node} el
		 * @return {Wireboard.View}
		 */
		setEl: function(el) {
			this.el = el;
			this.$el = $(el);
			return this;
		},

		/**
		 * @returns {String}
		 */
		toString: function() {
			return '[object View]';
		}

	}, Wireboard.EventDispatcher.prototype);

	return View;

})();
;

Wireboard.ViewMap = (function(undefined) {

    var ViewMap = function () {
        this.initialize.apply(this, arguments);
    };

    ViewMap.prototype = {

        /**
         * @type {Wireboard.ViewMapping[]}
         */
        mappings: [],

        /**
         * @type {Wireboard.EventDispatcher}
         */
        dispatcher: 'inject',

        /**
         * @type {Wireboard.Context}
         */
        context: 'inject',

        /**
         * @type {injector.Injector}
         */
        injector: 'inject',

        /**
         * @param {Wireboard.EventDispatcher} dispatcher
         * @param {Wireboard.Context} context
         */
        initialize: function(injector) {
            //this.injector = injector;
            injector.injectInto(this);
        },

        /**
         * @param {String} selector
         * @param {Wireboard.View} ViewClass
         * @param {Wireboard.ViewMediator} [ViewMediatorClass]
         * @return {Wireboard.ViewMapping}
         */
        map: function (selector, ViewClass, ViewMediatorClass) {
            if (!ViewClass) {
                throw new Error('The supplied view for selector ' + selector + ' is undefined.');
            }
            var mapping = new Wireboard.ViewMapping(selector, ViewClass, ViewMediatorClass);
            this.injector.injectInto(mapping);
            this.mappings.push(mapping);
            return mapping;
        },

        /**
         * Build all registered mappings
         *
         * @return {Wireboard.ViewMap}
         */
        build: function() {
            _.invoke(this.mappings, 'build');
            return this;
        },

        /**
         * Destroy all views created by it's mappings. It does not however,
         * remove the mappings themselves.
         *
         * @return {Wireboard.ViewMap}
         */
        destroy: function() {
            _.invoke(this.mappings, 'destroy');
            return this;
        },

        /**
         * @returns {Wireboard.ViewMapping[]}
         */
        getMappings: function() {
            return this.mappings;
        },

        /**
         * @returns {String}
         */
        toString: function() {
            return '[object ViewMap]';
        }
    };

    return ViewMap;

})();
;

Wireboard.ViewMapping = (function(undefined) {

	var ViewMapping = function() {
		this.initialize.apply(this, arguments);
	};

	ViewMapping.prototype = {

		/**
		 * Context wide injector
		 *
		 * @type {injector.Injector}
		 */
		injector: 'inject',

		/**
		 * Mapping specific injector
		 *
		 * @type {injector.Injector}
		 */
		viewInjector: null,

		/**
		 * @type {String}
		 */
		selector: '',

		/**
		 * @type {Array}
		 */
		builtElements: [],

		/**
		 * @type {Wireboard.View|Function}
		 */
		ViewClass: null,

		/**
		 * @type {Wireboard.ViewMediator|Function}
		 */
		ViewMediatorClass: null,

		/**
		 * @type {Wireboard.View[]}
		 */
		views: [],

		/**
		 * @type {Wireboard.ViewMediator[]}
		 */
		mediators: [],

		/**
		 * @param {String} selector
		 * @param {Wireboard.View} ViewClass
		 * @param {Wireboard.ViewMediator} ViewMediatorClass
		 */
		initialize: function(selector, ViewClass, ViewMediatorClass) {
			this.selector = selector;
			this.ViewClass = ViewClass;
			this.ViewMediatorClass = ViewMediatorClass;
		},

		/**
		 * @param {String|Object} objectOrName
		 * @param {*} [value]
		 * @return {Wireboard.ViewMap}
		 */
		inject: function(objectOrName, value) {
			if (!this.viewInjector) {
				this.viewInjector = this.injector.createChildInjector();
			}
			//
			//if (typeof objectOrName === 'object') {
			//	_.merge(this.injections, objectOrName);
			//	return this;
			//}
			this.viewInjector.map(objectOrName).toValue(value);
			return this;
		},

		/**
		 * Run the mapping, creating the view if necessary
		 * @return {Wireboard.ViewMap}
		 */
		build: function() {
			var $el = $(this.selector);
			if (!$el.length) {
				return this;
			}

			// Add to built
			var built = this.builtElements;

			// Create the views
			var mapping = this;
			var create = function(index, el) {
				if (_.contains(built, el)) {
					return;
				}

				built.push(el);
				mapping._createView(el);
			};
			$el.each(create);
			return this;
		},

		/**
		 * Destroy all views that may have been created by this mapping.
		 * @return {Wireboard.ViewMap}
		 */
		destroy: function() {

			// Destruct all views
			var map = this;
			var destroy = function(view) {
				map._destroyView(view);
			};
			_.each(this.views, destroy);
			this.views = [];
			return this;
		},

		/**
		 *
		 * @param {Node} el
		 * @private
		 */
		_createView: function(el) {
			var view = new this.ViewClass({
				el: el,
				injector: this.injector
			});
			this.views.push(view);

			// Inject view mapping specific dependencies into the view
			//if (this.viewInjector) {
			//	this.viewInjector.injectInto(view);
			//}

			// Create the mediator if one is provided
			if (this.ViewMediatorClass) {
				var mediator = new this.ViewMediatorClass(view);

				// Inject global injector mappings
				this.injector.injectInto(mediator);

				mediator.register();
				this.mediators.push(mediator);
			}
		},

		/**
		 * @param view
		 * @private
		 */
		_destroyView: function(view) {

			// If it has a destroy method, call that
			if (view.destroy) {
				view.destroy();
				return;
			}

			// Otherwise, just remove it from the dom
			if (view.el.parentNode) {
				view.el.parentNode.removeChild(view.el);
			}
		},

		/**
		 * @returns {String}
		 */
		toString: function() {
			return '[object ViewMapping]';
		}
	};

	return ViewMapping;

})();
;

Wireboard.ViewMediator = (function(undefined) {

	var ViewMediator = function() {
		this.initialize.apply(this, arguments);
	};

	ViewMediator.extend = Wireboard.extend;

	ViewMediator.prototype = {

		/**
		 * @type {Wireboard.View}
		 */
		view: 'inject',

		/**
		 * @type {Wireboard.EventDispatcher}
		 */
		dispatcher: 'inject',

		/**
		 * @type {Wireboard.Context}
		 */
		context: 'inject',

		/**
		 * @param {Wireboard.View} view
		 * @param {Object} [injections]
		 */
		initialize: function(view) {
			this.view = view;
		},

		/**
		 * Add a listener based on the type
		 *
		 * @param {String} type
		 * @param {Function} listener
		 */
		addEventListener: function(type, listener) {
			this.dispatcher.addEventListener(type, listener);
		},

		/**
		 * Remove a listener based on the type and the listener
		 *
		 * @param {String} type
		 * @param {Function} listener
		 */
		removeEventListener: function(type, listener) {
            this.dispatcher.removeEventListener(type, listener);
		},

		/**
		 *
		 */
		register: function() {
			throw new Error('Register function not defined on ViewMediator ' + this);
		},

		/**
		 * @returns {String}
		 */
		toString: function() {
			return '[object ViewMediator]';
		}

	};

	return ViewMediator;

})();
;

Wireboard.Context = (function(undefined) {

    var Context = function() {
        this.initialize.apply(this, arguments);
    };

    /**
     * @type {Boolean}
     */
    Context.GLOBAL_INJECTOR = true;

    // Context can be extended
    Context.extend = Wireboard.extend;

    Context.prototype = {

        /**
         * @type {Wireboard.EventDispatcher}
         */
        dispatcher: null,

        /**
         * @type {injector.Injector}
         */
        injector: null,

        /**
         * @type {Wireboard.ViewMap}
         */
        views: null,

        /**
         * @type {Wireboard.CommandMap}
         */
        commands: null,

        /**
         *
         */
        initialize: function() {
            this._constructDependencies();
            this.startup();
        },

        /**
         * Hook for the extending context
         */
        startup: function() {
        },

        /**
         * @return {Wireboard.Context}
         */
        start: function() {
            this.views.build();
            return this;
        },

        /**
         * @return {Wireboard.Context}
         */
        destroy: function() {
            this.views.destroy();
            return this;
        },

        /**
         *
         * @private
         */
        _constructDependencies: function() {

            // Main components
            this.dispatcher = new Wireboard.EventDispatcher();

            // Create the injector
            this.injector = this._getInjector();

            // Create the mappers
            this.views = new Wireboard.ViewMap(this.injector);
            this.commands = new Wireboard.CommandMap(this.injector);
        },

        /**
         * @return {injector.Injector}
         * @private
         */
        _getInjector: function() {

            // Return if we have a global injector
            if (Wireboard.instances.injector) {
                return Wireboard.instances.injector;
            }

            // Create the injector for this context
            var injector = new window.injector.Injector();
            injector.map('dispatcher').toValue(this.dispatcher);
            injector.map('context').toValue(this);

            // By default, the injector works globally for the whole page.
            if (Context.GLOBAL_INJECTOR) {
                Wireboard.instances.injector = injector;
            }

            return injector;
        },

        /**
         * @returns {String}
         */
        toString: function() {
            return '[object Context]';
        }
    };

    return Context;

})();
