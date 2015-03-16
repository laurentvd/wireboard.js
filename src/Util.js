(function(Wireboard, undefined) {

	var utils = {

		/**
		 * @param {Object} target
		 * @returns {*}
		 */
		assign: function(target) {
			if (arguments.length <= 1) {
				return target;
			}
			Object.assign.apply(target, arguments);
			return target;
		},

		/**
		 * @param {Array} items
		 * @param {String|Function} method
		 * @returns {void}
		 */
		invoke: function(items, method) {
			var args = slice.call(arguments, 2);
			var isFunction = typeof method === 'function';

			items.forEach(function(item) {
				var func = isFunction ? method : value[method];
				return func === null ? func : func.apply(item, args);
			});
		},

		/**
		 * @param {Object} obj
		 * @param {String} key
		 * @returns {Boolean}
		 */
		has: function(obj, key) {
			return obj !== null && hasOwnProperty.call(obj, key);
		}
	};

	// Merge the utils into the Wireboard namespace
	utils.assign(Wireboard, utils);

})(Wireboard);