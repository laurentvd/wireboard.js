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
