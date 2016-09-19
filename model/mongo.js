"use strict";
var core = require("soajs");
var Mongo = core.mongo;

var usersCollection = 'users';

function checkForMongo(soajs, mongo) {
	if (soajs.inputmaskData.isOwner) {
		mongo = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.inputmaskData.tCode));
	}
	else {
		mongo = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
	}
}

module.exports = {
	"initConnection": function (soajs) {
		if (soajs.inputmaskData.isOwner) {
			soajs.mongoDb = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.inputmaskData.tCode));
		}
		else {
			soajs.mongoDb = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
		}
	},
	
	"closeConnection": function (soajs) {
		soajs.mongoDb.closeDb();
	},
	
	"validateId": function (soajs, id, cb) {
		var id1;
		try {
			id1 = soajs.mongoDb.ObjectId(id);
			return cb(null, id1);
		}
		catch (e) {
			soajs.log.error(e);
			return cb(e);
		}
	},
	
	"countEntries": function (soajs, combo, cb) {
		soajs.mongoDb.count(combo.collection, combo.condition || {}, cb);
	},
	
	"findEntries": function (soajs, combo, cb) {
		soajs.mongoDb.find(combo.collection, combo.condition || {}, combo.fields || null, combo.options || null, cb);
	},
	
	"findEntry": function (soajs, combo, cb) {
		soajs.mongoDb.findOne(combo.collection, combo.condition || {}, combo.fields || null, combo.options || null, cb);
	},
	
	"saveEntry": function (soajs, combo, cb) {
		soajs.mongoDb.save(combo.collection, combo.record, cb);
	},
	
	"insertEntry": function (soajs, combo, cb) {
		soajs.mongoDb.insert(combo.collection, combo.record, cb);
	},
	
	"removeEntry": function (soajs, condition, cb) {
		soajs.mongoDb.remove(usersCollection, condition, cb);
	},
	
	"updateEntry": function (soajs, combo, cb) {
		//combo.extraOptions = {'upsert': true}
		soajs.mongoDb.update(combo.collection, combo.condition, combo.updatedFields, combo.extraOptions || {}, cb);
	}
	
};