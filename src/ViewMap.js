Wireboard.ViewMap = (function(undefined) {

    var ViewMap = function () {
        this.initialize.apply(this, arguments);
    };

    ViewMap.prototype = {

        /**
         * @type {Wireboard.ViewMapping[]}
         */
        mappings: [],

        /**
         * @type {Wireboard.EventDispatcher}
         */
        dispatcher: 'inject',

        /**
         * @type {Wireboard.Context}
         */
        context: 'inject',

        /**
         * @type {injector.Injector}
         */
        injector: 'inject',

        /**
         * @param {Wireboard.EventDispatcher} dispatcher
         * @param {Wireboard.Context} context
         */
        initialize: function(injector) {
            //this.injector = injector;
            injector.injectInto(this);
        },

        /**
         * @param {String} selector
         * @param {Wireboard.View} ViewClass
         * @param {Wireboard.ViewMediator} [ViewMediatorClass]
         * @return {Wireboard.ViewMapping}
         */
        map: function (selector, ViewClass, ViewMediatorClass) {
            if (!ViewClass) {
                throw new Error('The supplied view for selector ' + selector + ' is undefined.');
            }
            var mapping = new Wireboard.ViewMapping(selector, ViewClass, ViewMediatorClass);
            this.injector.injectInto(mapping);
            this.mappings.push(mapping);
            return mapping;
        },

        /**
         * Build all registered mappings
         *
         * @return {Wireboard.ViewMap}
         */
        build: function() {
            _.invoke(this.mappings, 'build');
            return this;
        },

        /**
         * Destroy all views created by it's mappings. It does not however,
         * remove the mappings themselves.
         *
         * @return {Wireboard.ViewMap}
         */
        destroy: function() {
            _.invoke(this.mappings, 'destroy');
            return this;
        },

        /**
         * @returns {Wireboard.ViewMapping[]}
         */
        getMappings: function() {
            return this.mappings;
        },

        /**
         * @returns {String}
         */
        toString: function() {
            return '[object Wireboard.ViewMap]';
        }
    };

    return ViewMap;

})();
