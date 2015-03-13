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
