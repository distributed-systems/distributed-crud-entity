!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , type          = require('ee-types')
        , EventEmitter  = require('ee-event-emitter')
        , CRUDProperty  = require('./CRUDProperty')
        , CRUDMessage   = require('distributed-crud-message');



    module.exports = new Class({
        inherits: EventEmitter

        // the name of this entity
        , name: null

        // actions avialable on this entity, constructor will iinitilaize this
        , actions: null


        /**
         * constructor
         *
         * @param <Object> options
         */
        , init: function(options) {

            // setup storage
            this.properties = {};
            this.mappings = {};
            this.references = {};
            this.belongsTos = {};

            this.actions = {};

            if (!options) throw new Error('The CRUDEntity contructor expexts an option object!');
            if (!type.object(options)) throw new Error('The options must be typeof object!');

            if (!type.string(options.name)) throw new Error('the entity must have a name passed to the constructor via the options object');

            if (options.properties) {
                if (!type.array(options.properties)) throw new Error('The options property «properties» must be typeof array!');
                else options.properties.forEach(this.addProperty.bind(this));
            }
        }






        /**
         * execute an action onthis entity
         */
        , executeAction: function(message) {
            if (!message) log(new Error('Action on entity«'+this.name+'» cannot be executed when no message is passed to it!'));
            else if (!message instanceof CRUDMessage) {
                // try to respond, else throw
                if (type.function(message.sendResponse)) message.sendResponse(RequestMessage.INVALID_MESSAGE_TYPE, 'The message passed to the CRUD entity «'+this.name+'» must be typeof CRUDMessage, got something else!');
                else log(new Error('The message passed to the entity «'+this.name+'» is of the wrong type!'));
            }
            else {
                // looks good, check if the action was registered on this entity
                if (this.actions[message.action]) this.actions[message.action].execute(message);
                else message.sendResponse(CRUDMessage.ACTION_NOT_IMPLEMENTED);
            }
        }


        
        /**
         * add a mapping definition
         *
         * @param <Object> definition
         */
        , addMapping: function(definition) {
            if (!type.object(definition)) throw new Error('When adding a mapping a definition object must be passed as parameter 0');
            if (!type.string(definition.name)) throw new Error('The mapping definition must contain the name of the mapping!');
            if (!type.string(definition.ourProperty)) throw new Error('The mapping definition must contain the name of our property (ourProperty)!');
            if (this.mappings[definition.name]) throw new Error('Cannot add the mapping with the name «'+definition.name+'». Mapping exists already!');

            // if the mapping table is defined a specific st of properties must be defined
            if (definition.mapping) {
                if (!type.object(definition.mapping)) throw new Error('Cannot add mapping. A mapping key was defined which must be typeof object - «'+type(definition.mapping)+'» given!');
                if (!type.string(definition.mapping.entity)) throw new Error('The mapping definition must contain the entity key!');
                if (!type.string(definition.mapping.ourProperty)) throw new Error('The mapping definition must contain the ourProperty key!');
                if (!type.string(definition.mapping.theirProperty)) throw new Error('The mapping definition must contain the theirProperty key!');
                if (!type.string(definition.theirProperty)) throw new Error('The mapping definition must contain the theirProperty key!');
            }

            // the entites have almost always the same name as the underlying entity
            if (!definition.entity) definition.entity = definition.name;

            // store
            this.mappings[definition.name] = definition;
        }


        /**
         * remove a mapping
         *
         * @param <String> name
         *
         * @returns <Object> mapping definition
         */
        , removeMapping: function(name) {
            var definition;

            if (!this.mappings[name]) throw new Error('Cannot remove the «'+name+'» mapping. The mapping does not exist on this entity!');

            // cache
            definition = this.mappings[name];

            // remove
            delete this.mappings[name];

            return definition;
        }


        /**
         * get mapping
         *
         * @param <String> name
         *
         * @returns <Object> mapping definition
         */
        , getMapping: function(name) {
            if (!this.mappings[name]) throw new Error('Cannot return the «'+name+'» mapping. The mapping does not exist on this entity!');
            return this.mappings[name];
        }


        /**
         * checks if a mapping exists
         *
         * @param <String> name
         *
         * @returns <Boolean>          
         */
        , hasMapping: function(name) {
            return !!this.mappings[name];
        }


        /**
         * add a reference definition
         *
         * @param <Object> definition
         */
        , addReference: function(definition) {
            if (!type.object(definition)) throw new Error('When adding a reference a definition object must be passed as parameter 0');
            if (!type.string(definition.name)) throw new Error('The reference definition must contain the name of the reference!');
            if (!type.string(definition.ourProperty)) throw new Error('The reference definition must contain the name of our property (ourProperty)!');
            if (this.references[definition.name]) throw new Error('Cannot add the reference with the name «'+definition.name+'». Reference exists already!');

            // store
            this.references[definition.name] = definition;
        }


        /**
         * remove a reference
         *
         * @param <String> name
         *
         * @returns <Object> reference definition
         */
        , removeReference: function(name) {
            var definition;

            if (!this.references[name]) throw new Error('Cannot remove the «'+name+'» reference. The reference does not exist on this entity!');

            // cache
            definition = this.references[name];

            // remove
            delete this.references[name];

            return definition;
        }


        /**
         * get reference
         *
         * @param <String> name
         *
         * @returns <Object> reference definition
         */
        , getReference: function(name) {
            if (!this.references[name]) throw new Error('Cannot return the «'+name+'» reference. The reference does not exist on this entity!');
            return this.references[name];
        }


        /**
         * checks if a reference exists
         *
         * @param <String> name
         *
         * @returns <Boolean>          
         */
        , hasReference: function(name) {
            return !!this.references[name];
        }


 
        /**
         * add a belongs to relation definition
         *
         * @param <Object> definition
         */
        , addBelongsTo: function(definition) {
            if (!type.object(definition)) throw new Error('When adding a belongs to relation a definition object must be passed as parameter 0');
            if (!type.string(definition.name)) throw new Error('The belongs to relation definition must contain the name of the belongs to relation!');
            if (!type.string(definition.ourProperty)) throw new Error('The belongs to relation definition must contain the name of our property (ourProperty)!');
            if (this.belongsTos[definition.name]) throw new Error('Cannot add the belongs to relation with the name «'+definition.name+'». Belongs to relation exists already!');

            // store
            this.belongsTos[definition.name] = definition;
        }


        /**
         * remove a belongs to relation
         *
         * @param <String> name
         *
         * @returns <Object> belongs to definition
         */
        , removeBelongsTo: function(name) {
            var definition;

            if (!this.belongsTos[name]) throw new Error('Cannot remove the «'+name+'» belongs to definition. The belongs to relation does not exist on this entity!');

            // cache
            definition = this.belongsTos[name];

            // remove
            delete this.belongsTos[name];

            return definition;
        }


        /**
         * get belongs to relation definition
         *
         * @param <String> name
         *
         * @returns <Object> belongs to definition
         */
        , getBelongsTo: function(name) {
            if (!this.belongsTos[name])throw new Error('Cannot return the «'+name+'» belongs to definition. The belongs to relation does not exist on this entity!');
            return this.belongsTos[name];
        }


        /**
         * checks if a belongs to relation exists
         *
         * @param <String> name
         *
         * @returns <Boolean>          
         */
        , hasBelongsTo: function(name) {
            return !!this.belongsTos[name];
        }



        /**
         * set an action controller on this entity
         *
         * @param <CRUDAction> CRUDAction instance
         */
        , setAction: function(crudAction) {
            if (!crudAction) throw new Error('Cannot set action, missing the action insatnce (parameter 0)');
            if (!crudAction instanceof CRUDAction) throw new Error('Cannot set action, the action instance must inherit from the CRUDAction class!');
            if (this.actions[crudAction.name]) throw new Error('Cannot set action «'+crudAction.name+'», the action exists already!');

            // tell the action implementation about the entity
            crudAction.setEntity(this);

            // store
            this.actions[crudAction.name] = crudAction;
        }


        /**
         * remove an action
         *
         * @param <String> action name
         *
         * @returns <CRUDAction> CRUDAction instance
         */
        , removeAction: function(name) {
            var action;

            if (!this.actions[name]) throw new Error('Cannot remove the «'+name+'» action. The action does not exist on this entity!');

            // cache
            action = this.actions[name];

            // remove entity
            action.removeEntity();

            // remove
            delete this.actions[name];

            return action;
        }


        /**
         * get action
         *
         * @param <String> action name
         *
         * @returns <CRUDAction> CRUDAction instance
         */
        , getAction: function(name) {
             if (!this.actions[name]) throw new Error('Cannot return the «'+name+'» action. The action does not exist on this entity!');
             return this.actions[name];
        }


        /**
         * check if an action exists
         *
         * @param <String> action name
         *
         * @returns <Boolean> 
         */
        , hasAction: function(name) {
            return !!this.actions[name];
        }




        /**
         * set up a porperty
         *
         * @param <CRUDProperty> property object
         */
        , addProperty: function(property) {
            if (!property instanceof CRUDProperty) throw new Error('Properties must be defined using the CRUDProperty class');
            if (this.properties[property.name]) throw new Error('Cannot store property «'+property.name+'», the property was already defined before!');

            // store definition
            this.properties[property.name] = property;
        }


        /**
         * remove an existing property
         *
         * @param <String> name
         *
         * @returns <CRUDProperty> property object
         */
        , removeProperty: function(propertyName) {
            var property;

            if (!this.properties[propertyName]) throw new Error('Cannot remove the property «'+propertyName+'», it doesnt exist on the entity «'+this.name+'»!');

            // cache
            property = this.properties[propertyName];

            // delete
            delete this.properties[propertyName];

            return property;
        }


        /**
         * checks if there is a property with a given name
         *
         * @param <String> name
         *
         * @returns <Boolean>
         */
        , hasProperty: function(propertyName) {
            return !!this.properties[propertyName];
        }


        /**
         * returns the property
         *
         * @param <String> name
         *
         * @returns <CRUDProperty> property object
         */
        , getProperty: function(propertyName) {
            if (!this.properties[propertyName]) throw new Error('Cannot return the property «'+propertyName+'», it doesnt exist on the entity «'+this.name+'»!');

            return this.properties[propertyName];
        }
    });
}();
