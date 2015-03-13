Wireboard.CommandMap = (function(undefined) {

    'use strict';

    var CommandMap = function() {
        this.initialize.apply(this, arguments);
    };

    CommandMap.prototype = {

        /**
         * Use event types as key and value is array containing
         * commands that are executed when that event occurs.
         *
         * @type {Object}
         */
        mappings: {},

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
        injector: null,

        /**
         * @param {injector.Injector} injector
         */
        initialize: function(injector) {
            this.injector = injector;

            this.injector.injectInto(this);
            this.dispatcher.addGlobalListener(_.bind(this._onEvent, this));
        },

        /**
         *
         * @param {String} eventType
         * @param {Wireboard.Command} CommandClass
         * @return {Wireboard.CommandMap}
         */
        map: function(eventType, CommandClass) {

            if (this.mappings[eventType] === undefined) {
                this.mappings[eventType] = [];
            }

            this.mappings[eventType].push(CommandClass);
            return this;
        },

        /**
         * @param {Wireboard.Event} event
         * @private
         */
        _onEvent: function(event) {
            var type = event.getType();
            if (this.mappings[type] === undefined) {
                return;
            }

            // Execute the command(s) that match the event type
            var commandMap = this;
            _.each(this.mappings[type], function(CommandClass) {
                commandMap._executeCommand(CommandClass, event);
            });
        },

        /**
         * @param {Wireboard.Command|Function} CommandClass
         * @param {Wireboard.Event} event
         * @private
         */
        _executeCommand: function(CommandClass, event) {
            var command = new CommandClass(event);

            // Inject into the command
            this.injector.injectInto(command);

            command.execute();
        },

        /**
         * @returns {String}
         */
        toString: function() {
            return '[object CommandMap]';
        }
    };

    return CommandMap;

})();
