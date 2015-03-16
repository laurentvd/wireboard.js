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
		} else if (Wireboard.instances && Wireboard.instances.injector) {
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
	View.prototype = Wireboard.assign({}, Wireboard.EventDispatcher.prototype, {

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
			return '[object Wireboard.View]';
		}

	});

	return View;

})();
