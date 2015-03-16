(function() {

	'use strict';

	var Rectangle = Wireboard.View.extend({

		width: 0,
		height: 0,

		/**
		 * @param width
		 * @param height
		 */
		initialize: function(width, height) {
			this.width = width;
			this.height = height;

			this._disallowInvalidDimensions(width, height);
		},

		/**
		 * @returns {{width: *, height: *}}
		 */
		getDimensions: function() {
			return {width: this.width, height: this.height};
		},

		/**
		 * @returns {string}
		 */
		toString: function() {
			console.log(this);
			return '[object Rectangle (width: ' + this.width + ', height: ' + this.height + ')]';
		},

		/**
		 * @param width
		 * @param height
		 * @private
		 */
		_disallowInvalidDimensions: function(width, height) {
			var validDimension = function(value) {
				return typeof value === 'number' && value > 0;
			};

			if (!validDimension(width)) {
				throw new Error('Invalid width supplied: ' + width);
			}

			if (!validDimension(height)) {
				throw new Error('Invalid height supplied: ' + height);
			}
		}
	});

	var Cube = Rectangle.extend({

		_disallowInvalidDimensions: function(width, height) {
			this.__static.__parent._disallowInvalidDimensions(width, height);

			if (width !== height) {
				throw new Error('Cubes should have an equal width and height');
			}
		},

		toString: function() {
			return '[object Cube] > ' + this.__static.__parent.toString.apply(this);
		}
	});

	var TallRectangle = Rectangle.extend({

		_disallowInvalidDimensions: function(width, height) {
			this.__static.__parent._disallowInvalidDimensions(width, height);

			if (width <= height) {
				throw new Error('The rectangle is not tall');
			}
		},

		toString: function() {
			console.log(this);
			return '[object TallRectangle] > ' + this.__static.__parent.toString(this);
		}
	});

	var rectangle = new Rectangle(100, 200);
	var cube = new Cube(200, 200);
	var tall = new TallRectangle(500, 200);
	//console.log(rectangle.toString());
	//console.log(cube.toString());
	console.log(tall.toString());
})();