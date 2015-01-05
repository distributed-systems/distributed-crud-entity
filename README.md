# distributed-crud-entity

description

## installation



## build status

[![Build Status](https://travis-ci.org/eventEmitter/distributed-crud-entity.png?branch=master)](https://travis-ci.org/eventEmitter/distributed-crud-entity)


## usage


	var entity = new CRUDEntity({
		  name: 'event'
		, properties : [new CRUDEntity({
			  name: 'id'
			, nullable: false
			, type: CRUDEntity.NUMBER
			, length: 32
			, hasDefualtValue: true
			, defaultValue: 5
			, unique: true
		})]
	});


	// required for controlled updates & deletes
	entity.defineUniquePropertySet('id_event', 'id_venue');
	entity.defineUniquePropertySet('id');


	entity.addMapping({
		  name: 'image'
		, ourProperty: 'id'
		, mapping: {
			  entity: 'event_image'
			, ourProperty: 'id_event'
			, theirProperty: 'id_image'
		}
		, entity: 'image'
		, theirProperty: 'id'
	});

	// returns the mapping definition
	entity.getMapping(name);

	// remove an exisitng mapping
	entity.removeMapping(name);


	entity.addBelongsTo({
		  name: 'festival'
		, ourProprety: 'id'
		, theirProperty: 'id_event'
		, entity: 'festival'
	});

	entity.addReference({
		  name: 'venue'
		, ourProperty: 'id_venue'
		, theirProperty: 'id'
		, entity: 'venue'
	});


	entity.addProperty(desc);
	entity.enableAction(CRUDEntity.UPDATE, CRUDEntity.create);
	entity.enableAllActions();


	// add a midldeware that is called before an action is executed
	entity.useBefore(new Middleware());

	// add a middleware that is executed after an action was executed
	entity.useAfter(new Middleware());


	CDRUDService.acddEntity(entity);

