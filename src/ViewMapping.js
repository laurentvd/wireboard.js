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
