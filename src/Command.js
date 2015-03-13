Wireboard.Command = (function(undefined) {

    var Command = function() {
        this.initialize.apply(this, arguments);
    };

    Command.prototype = {

        /**
         * @type {Wireboard.EventDispatcher}
         */
        dispatcher: 'inject',

        /**
         * The event that triggered this command
         *
         * @type {Wireboard.Event}
         */
        event: null,

        /**
         * @type {Wireboard.Context}
         */
        context: 'inject',

        /**
         * @param {Wireboard.Event} [event]
         */
        initialize: function(event) {
            this.event = event;
        },

        /**
         *
         * @param {String} eventType
         * @param {Wireboard.Command} CommandClass
         */
        execute: function() {
            throw new Error('Command should override the execute method.');
        },

        /**
         * @param {Wireboard.Event} event
         */
        dispatch: function(event) {
            this.dispatcher.dispatchEvent(event);
        },

        /**
         * @returns {String}
         */
        toString: function() {
            return '[object Command]';
        }
    };

    return Command;

})();
