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
			return '[object Wireboard.EventDispatcher]';
		}
	};
	return EventDispatcher;
})();
