"use strict";
var core = require("soajs");
var Mongo = core.mongo;

module.exports = {
	/**
	 * Initialize the mongo connection
	 * @param {SOAJS Object} soajs
	 */
	"initConnection": function (soajs) {
		if (soajs.inputmaskData.isOwner) {
			soajs.mongoDb = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.inputmaskData.tenantCode));
		}
		else {
			soajs.mongoDb = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
		}
	},
	
	
	"switchTenant": function(soajs, tCode, cb){
		let condition = {
			"code": tCode
		};
		let coreMongo = new Mongo(soajs.registry.coreDB.provision);
		coreMongo.findOne("tenants", condition, (error, tenant) => {
			return cb(error, tenant);
		});
	},
	
	/**
	 * Close the mongo connection
	 * @param {SOAJS Object} soajs
	 */
	"closeConnection": function (soajs) {
		soajs.mongoDb.closeDb();
	},
	
	/**
	 * Validates the mongo object ID
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
	
	/**
	 * Return the number of entries
	 * @param {SOAJS Object} soajs
	 * @param {Object} combo
	 * @param {Callback Function} cb
	 */
	"countEntries": function (soajs, combo, cb) {
		soajs.mongoDb.count(combo.collection, combo.condition || {}, cb);
	},
	
	/**
	 * Find multiple entries based on a condition
	 * @param {SOAJS Object} soajs
	 * @param {Object} combo
	 * @param {Callback Function} cb
	 */
	"findEntries": function (soajs, combo, cb) {
		soajs.mongoDb.find(combo.collection, combo.condition || {}, combo.fields || null, combo.options || null, cb);
	},
	
	/**
	 * Find one entry based on a condition
	 * @param {SOAJS Object} soajs
	 * @param {Object} combo
	 * @param {Callback Function} cb
	 */
	"findEntry": function (soajs, combo, cb) {
		soajs.mongoDb.findOne(combo.collection, combo.condition || {}, combo.fields || null, combo.options || null, cb);
	},
	
	/**
	 * Save an entry in the database
	 * @param {SOAJS Object} soajs
	 * @param {Object} combo
	 * @param {Callback Function} cb
	 */
	"saveEntry": function (soajs, combo, cb) {
		soajs.mongoDb.save(combo.collection, combo.record, cb);
	},
	
	/**
	 * Insert a new entry in the database
	 * @param {SOAJS Object} soajs
	 * @param {Object} combo
	 * @param {Callback Function} cb
	 */
	"insertEntry": function (soajs, combo, cb) {
		soajs.mongoDb.insert(combo.collection, combo.record, cb);
	},
	
	/**
	 * Delete an entry from the database
	 * @param {SOAJS Object} soajs
	 * @param {Object} combo
	 * @param {Callback Function} cb
	 */
	"removeEntry": function (soajs, combo, cb) {
		soajs.mongoDb.remove(combo.collection, combo.condition, cb);
	},
	
	/**
	 * Update an entry in the database
	 * @param {SOAJS Object} soajs
	 * @param {Object} combo
	 * @param {Callback Function} cb
	 */
	"updateEntry": function (soajs, combo, cb) {
		//combo.extraOptions = {'upsert': true}
		soajs.mongoDb.update(combo.collection, combo.condition, combo.updatedFields, combo.extraOptions || {}, cb);
	}
	
};