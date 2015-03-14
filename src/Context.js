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
            return '[object Wireboard.Context]';
        }
    };

    return Context;

})();
