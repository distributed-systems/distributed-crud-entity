!function() {

    var   Class             = require('ee-class')
        , log               = require('ee-log')
        , type              = require('ee-types')
        , EventEmitter      = require('ee-event-emitter')
        , CRUDMessage       = require('distributed-crud-message')
        , RequestMessage    = require('distributed-request-message');


    /*
     * Representation of a crud action which can be executed on a crud entity
     *
     */

    module.exports = new Class({
        inherits: EventEmitter

        // the name of this action
        , name: null

        // name of the entity the message resides on
        , entity: null

        // signature for errors
        , signature: null


        /**
         * action constructor
         *
         * @param <Object> option
         */
        , init: function(options) {

            if (!options) throw new Error('The CRUDAction contructor expexts an option object!');
            if (!type.object(options)) throw new Error('The options must be typeof object!');

            if (!type.string(options.name)) throw new Error('The action must have a name!');

            // store properties
            this.name = options.name;

            // initialize without entity
            this.removeEntity();
        }


        /**
         * stores a reference to the entity this action is implemented on
         *
         * @param <CRUDEntity> CRUDEntity
         */
        , setEntity: function(entity) {
            this.entity = entity;

            // signature used for error responses
            this.signature = entity.name+'/'+this.name;
        }


        /** 
         * remove the entity from the action
         */
        , removeEntity: function() {
            this.entity = null;

            // signature used for error responses
            this.signature = '--na--/'+this.name;
        }


        /**
         * executed the action, is called by the entity
         * 
         * @param <CRUDMessage> message object, must be a crudmessage 
         */
        , execute: function(message) {
            if (!message) log(new Error('Action «'+this.name+'» cannot be executed when no message is passed to it!'));
            else if (!message instanceof CRUDMessage) {
                // try to respond, else throw
                if (type.function(message.sendResponse)) message.sendResponse(RequestMessage.INVALID_MESSAGE_TYPE, 'The message passed to the CRUD action «'+this.signature+'» must be typeof CRUDMessage, got something else!');
                else log(new Error('The message passed to the action «'+this.signature+'» is of the wrong type!'));
            }

            // esecute the action
            else this._execute(message);
        }


        /**
         * the private method executes the action, 
         * the public method validates it
         * 
         * @param <CRUDMessage> message object, must be a crudmessage 
         */
        , _execute: function(message) {
            message.sendResponse(CRUDMessage.ACTION_NOT_IMPLEMENTED, 'The action «'+this.signature+'» was not implemented!')
        }


        /**
         * emit a message via the entity
         *
         * @param <DistributedMessage> 
         */
        , emitMessage: function(message) {
            if (!this.entity) throw new Error('The action «'+this.signature+'» cannot emit a message, the entity is not set!');
            this.entity.emitMessage(message);
        }
    });
}();
