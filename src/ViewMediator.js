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
			return '[object Wireboard.ViewMediator]';
		}

	};

	return ViewMediator;

})();
