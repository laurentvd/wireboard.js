Wireboard.extend = function(prototypeProperties, staticProperties) {

	/**
	 * Does the prototype definition have constructor (is it a function)
	 *
	 * @type {Object} prototypeProperties
	 * @returns {Boolean}
	 */
	var hasConstructor = function(prototypeProperties) {
		return prototypeProperties && Wireboard.has(prototypeProperties, 'constructor');
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
	Object.assign(ExtendedObject, parent, staticProperties);

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
	Object.assign(child.prototype, prototypeProperties);

	/**
	 * Set convenient properties so we can call something like this:
	 *
	 * myChild.__parent; // returns parent
	 */
	if ( ! child.prototype.__parent) {
		child.prototype.__parent = parent.prototype;
	}
	child.prototype.__static = Object.assign({}, parent, staticProperties);

	/* TEMPORARY TEST */
	child.prototype.__static.__parent = parent.prototype;
	return child;
};
