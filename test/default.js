
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert');



	var   CRUDEntity 	= require('../')
		, CRUDProperty 	= CRUDEntity.CRUDProperty
		, entity;



	describe('The CRUDEntity', function(){
		it('should not crash when instantiated', function() {
			entity = new CRUDEntity({name: 'event'});
		});		
	});
	


	describe('The CRUDProperty', function(){
		it('should not crash when instantiated', function() {
			new CRUDProperty({
				  name: 'event'
				, type: CRUDProperty.NUMBER
				, length: 32
			});
		});		
	});


	describe('The CRUDEntity', function(){
		it('should accept new properties', function() {
			entity.addProperty(new CRUDProperty({
				  name: 'event'
				, type: CRUDProperty.NUMBER
				, length: 32
			}));

			assert.equal(JSON.stringify(entity.properties), '{"event":{"name":"event","length":32,"type":"number"}}');
		});		


		it('should return properties', function() {
			var prop = entity.getProperty('event');
			assert.equal(JSON.stringify(prop), '{"name":"event","length":32,"type":"number"}');
		});


		it('should be able to tell if it has a specific property', function() {
			assert.equal(entity.hasProperty('event'), true)
			assert.equal(entity.hasProperty('nope'), false)
		});


		it('should correctly remove existing proerties', function() {
			entity.removeProperty('event');
			assert.equal(JSON.stringify(entity.properties), '{}');
		});
	});