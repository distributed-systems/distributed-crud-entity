!function() {

    var   Class             = require('ee-class')
        , log               = require('ee-log')
        , type              = require('ee-types')
        , CRUDAction        = require('./CRUDAction')
        , Promise           = (Promise || require('es6-promise').Promise)
        , CRUDMessage       = require('distributed-crud-message')
        , RequestMessage    = require('distributed-request-message');


    /*
     * Crud List Action
     */

    module.exports = new Class({
        inherits: CRUDAction



        /**
         * action constructor
         *
         * @param <Object> option
         */
        , init: function init(options) {
            if (!options) options = {};

            options.name = 'list';

            init.super.call(this, options);
        }



        /**
         * gets subselected entities
         *
         * @param <CRUDMessage> message
         * @param <Array> rows that was loaded by this entitys
         */
        , loadSubSelectedEntities: function(message, rows) {
            // check if there is anything subselected
            var messages = message.getMessageForSubSelected();

            // set filters on each message, 
            // send each message, 
            // map the results of each message
            return Promise.all(messages.map(function(message) {
                // set the filter on each message
                this.setMappedEntityFilter(message, rows, this.mappings[message.resource]);
            }.bind(this)))

            .then(function() {
                // send the message, map it on the rows
                return Promise.all(messages.map(function(message) {                   
                    this.loadMappedEntites(message, rows, this.mappings[message.resource]);
                }.bind(this)));
            }.bind(this));
        }



        /**
         * sets the filters on the outgoing message for a mapped entity
         */
        , setMappedEntityFilter: function(message, rows, mappingDefinition) {
            return new Promise(function(resolve, reject) {
                if (!mappingDefinition) reject(new Error('Failed to load the mapping definition for a mapping!'));
                else {
                    if (mappingDefinition.mapping) {
                        // we may set a very specific filter (the mapping is defined on our side)
                        // this means we have to load the mapping data on our entity, and filter the remote 
                        // entity by its ids
                        return this.loadMappingFilterData(rows, mappingDefinition).then(function(filter) {
                            message.filter[mappingDefinition.theirProperty] = CRUDMessage.filters.in(filter.filterKeys);
                            message.temp.mapping = filter.mapping;
                            resolve();
                        }.bind(this)).catch(reject);
                    }
                    else {
                        // we don't have the info and cannot set a specific filter (the mapping should be defined on their side)
                        // we set a filter for our id on the message, the mapping needs to be selected, alse we wont be able
                        // to map it on to our records «theirEntity..ourEntity»
                        throw new Error('Crap, didn\'t implement that :(');
                        //message.loadMapping(this.entity.name);
                    }
                }
            }.bind(this));
        }



        /**
         * loads the keys for the other entity when loading a mapping
         *
         * @param <Array> rows, our entity data
         * @param <Object> the mappings definition. must contain the mapping key!
         *
         * @returns <Object> list of objects to filter the remote entity with. must contain
         *                   the keys to filter for and a mapping between our and their keys
         *                   {filterKeys: [1,2,3], mapping: {1: [{id:23}, {id:24}], 2: [{id:23}], 3:[{id:23}]}} -> get items 1,2,3,
         *                   map them to our record 23 & 24
         */
        , loadMappingFilterData: function(rows, mappingDefinition) {
            return Promise.reject(new Error('Failed to load the mapping data, the method was not implemented!'));
        }



        /**
         * gets subselected mapped entites
         *
         * @param <CRUDMessage> message to send
         * @param <Array> rows that was loaded by this entity
         * @param <Object> definition of all mappings to be loaded
         */
        , loadMappedEntites: function(message, rows, mappingDefinition) {
            return message.send(this).then(function(response) {
                if (response.status === CRUDMessage.OK) {
                    return this.applyMappedEntites(rows, request, response, mappingDefinition);
                }
                else return Promise.reject();
            }.bind(this));
        }




        /**
         * map the mapped rows onto the entity
         *
         * @apram <Array> my entities rows
         * @param <Array> the fetched (mapped) rows
         * @param <Object> mapping definition
         *
         * @returns <Promise>
         */
        , applyMappedEntites: function(rows, request, response, mappingDefinition) {
            var   mappings          = request.temp.mapping
                , theirProperty     = mappingDefinition.theirProperty
                , ourProperty       = mappingDefinition.ourProperty;

            // we stored the mapping on the request
            if (type.array(response.content)) {

                // loop through all of theri records
                response.content.forEach(function(record) {
                    // do we have a mapping saved for it?
                    if (mappings[record[theirProperty]]) {

                        // apply their records to ours
                        mappings[record[theirProperty]].forEach(function(ourRecord) {
                            if (!ourRecord[ourProperty]) ourRecord[ourProperty] = [];
                            ourRecord[ourProperty].push(record);
                        });
                    }
                }.bind(this));
            } 

            // nothing async (yet) here...
            return Promise.resolve();
        }
    });
}();
