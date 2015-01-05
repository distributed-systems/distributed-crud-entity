!function() {

    var   Class         = require('ee-class')
        , log           = require('ee-log')
        , type          = require('ee-types');



    var types = [
          'string'
        , 'number'
        , 'boolean'
        , 'time'
        , 'date'
        , 'datetime'
    ];



    var CRUDProperty = module.exports = new Class({

        // the name of this property
          name: null

        // nullable, default false
        , nullable: false

        // has default value (maybe filled by a rdbms)
        , hasDefaultValue: false

        // set a default value
        , defaultValue: undefined

        // unique, is this property unqiue over all instances 
        // of the entity it belongs to
        , unique: false
        
        // the type of the property, not optional
        , type: null

        // length, bit or byte, or unit length of the 
        // property (depends on the type)
        , length: null




        /**
         * configures the property using the opütions object passed
         * to the constructor
         *
         * @param <Object> options with name, type & length, 
         *                 optional: nullable, hasDefaultValue. defaultValue, unique
         */
        , init: function(options) {

            // basic validation
            if (!options || !type.object(options)) throw new Error('Properties must be configured via the options object of the contructor. Object not ound!');
            if (!type.string(options.name) || !options.name.length) throw new Error('A property must have a name!');
            if (!type.string(options.type) || !options.type.length) throw new Error('A property must have a type!');

            // name
            this.name = options.name;

            // set nullable if it has some true value
            if (options.nullable) this.nullable = true;

            // set unique if it has some true value
            if (options.unique) this.unique = true;

            // set hasDefaultValue if it has some true value
            if (options.hasDefaultValue) this.hasDefaultValue = true;

            // set defaultValue if it is defined
            if (!type.undefined(options.defaultValue)) this.defaultValue = options,defaultValue;    

            // set type
            this._setType(options.type, options.length);
        }

  

        /**
         * set the properties type
         *
         * @param <String> type
         */
        , _setType: function(typeId, length) {
            if (this.type !== null) throw new Error('Cannot set the type twice!');
            if (types.indexOf(typeId) === -1) throw new Error('Invalid type «'+typeId+'», valid types are «'+types.join(', ')+'»!');

            switch (typeId) {
                case 'string':
                case 'number':
                    if (!type.number(length)) throw new Error('The type «'+typeId+'» for the property «'+this.name+'» requires a length.');
                    this.length = length;
                    break;

                case 'boolean': 
                case 'time': 
                case 'date': 
                case 'datetime':
                    // nothing to do here
                    break;

                default: 
                    throw new Error('Failed to determine if the type requires a length property, please call +41 77 425 44 88 or just file an issue ;)');
            }

            // lets store it
            this.type = typeId;
        }
    });



    
    // apply types to constructor
    types.forEach(function(typeId) {
        module.exports[typeId.toUpperCase()] = typeId;
    });
}();
