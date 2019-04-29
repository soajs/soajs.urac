"use strict";
let colName = "products";
let envColName = "environment";
const productsCollectionName = 'products';
const core = require("soajs");
const async = require("async");
const soajsLib = require("soajs.core.libs");
const Mongo = core.mongo;

let firstRun = true;

function Product(soajs) {
	function errorLogger(error) {
		if (error) {
			return __self.soajs.log.error(error);
		}
	}
	
	let __self = this;
	__self.soajs = soajs;
	if (!__self.mongoCore) {
		__self.mongoCore = new Mongo(__self.soajs.registry.coreDB.provision);
		if (firstRun) {
			//products
			__self.mongoCore.createIndex(productsCollectionName, {code: 1, "packages.code": 1}, errorLogger);
			__self.soajs.log.debug("Indexes Updated!");
			firstRun = false;
		}
	}
}

Product.prototype.validateId = function (cb) {
	let __self = this;
	try {
		if (process.env.SOAJS_TEST){
			return cb(null, __self.soajs.inputmaskData.id);
		}
		__self.soajs.inputmaskData.id = __self.mongoCore.ObjectId(__self.soajs.inputmaskData.id);
		return ((cb) ? cb(null, __self.soajs.inputmaskData.id) : __self.soajs.inputmaskData.id);
	} catch (e) {
		return cb(e);
	}
};

Product.prototype.getConsoleProducts = function (cb) {
	let __self = this;
	let condition = {
		code: __self.soajs.config.console.product
	};
	__self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
		if (err) {
			return cb(err);
		}
		__self.unsanitize(record, cb);
	});
};

Product.prototype.listProducts = function (cb) {
	let __self = this;
	
	let condition = {
			code: {$ne: __self.soajs.config.console.product}
	};
	
	__self.mongoCore.find(colName, condition, null, null, (err, records) => {
		if (err) {
			return cb(err);
		}
		if (records.length === 0) {
			return cb(null, records);
		}
		async.map(records, function (record, callback) {
			__self.unsanitize(record, callback);
		}, cb);
	});
};

Product.prototype.getProduct = function (cb) {
	let __self = this;
	let condition = {};
	if (__self.soajs.inputmaskData.id) {
		condition = {'_id': __self.soajs.inputmaskData.id};
	} else if (__self.soajs.inputmaskData.code) {
		condition = {'code': __self.soajs.inputmaskData.code};
	}
	else if (__self.soajs.inputmaskData.productCode) {
		condition = {'code': __self.soajs.inputmaskData.productCode};
	}
	__self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
		if (err) {
			return cb(err);
		}
		__self.unsanitize(record, cb);
	});
};

Product.prototype.countProducts = function (cb) {
	let __self = this;
	let condition = {};
	if (__self.soajs.inputmaskData.code) {
		condition = {'code': __self.soajs.inputmaskData.code};
	}
	__self.mongoCore.count(colName, condition, cb);
};

Product.prototype.insertProduct = function (record, cb) {
	let __self = this;
	__self.mongoCore.insert(colName, record, cb);
};

Product.prototype.saveProduct = function (record, cb) {
	let __self = this;
	__self.mongoCore.save(colName, record, cb);
};

Product.prototype.deleteProduct = function (cb) {
	let __self = this;
	let condition = {};
	if (__self.soajs.inputmaskData.id) {
		condition = {'_id': __self.soajs.inputmaskData.id};
	} else if (__self.soajs.inputmaskData.code) {
		condition = {'code': __self.soajs.inputmaskData.code};
	}
	__self.mongoCore.remove(colName, condition, cb);
};

Product.prototype.updateProduct = function (cb) {
	let __self = this;
	let condition = {};
	if (__self.soajs.inputmaskData.id) {
		condition = {'_id': __self.soajs.inputmaskData.id};
	}
	let fields ={
		'$set': {
			'description': __self.soajs.inputmaskData.description,
			'name': __self.soajs.inputmaskData.name
		}
	};
	let options  = {'upsert': false, 'safe': true};
	
	__self.mongoCore.update(colName, condition, fields, options, false, cb);
};

Product.prototype.listEnvironments = function (productRecord, cb) {
	let __self = this;
	let condition = {};
	let fields = {"code": 1};
	if (!productRecord.locked) {
		condition = {
			code: {$ne: process.env.SOAJS_ENV.toUpperCase()}
		};
	}
	__self.mongoCore.find(envColName, condition,fields, null, cb);
};

Product.prototype.sanitize = function (cb) {
	let __self = this;
	async.eachOf(__self.soajs.inputmaskData.scope, function (env, envKey, call) {
		async.eachOf(env, function (service, serviceKey, callback) {
			let sanitizedVersion = {};
			Object.keys(service).forEach(function (key) {
				sanitizedVersion[soajsLib.version.sanitize(key)] = service[key];
				delete service[key];
			});
			__self.soajs.inputmaskData.scope[envKey][serviceKey] = sanitizedVersion;
			callback();
		}, call);
	}, cb);
};

Product.prototype.unsanitize = function (record, cb) {
	if (record && record.scope && record.scope.acl && Object.keys(record.scope.acl > 0)) {
		let scope = record.scope.acl;
		unsanitize(scope, () => {
			record.scope.acl = scope;
			return cb(null, record);
		});
	} else {
		return cb(null, record);
	}
	
	function unsanitize(acl, cb) {
		async.eachOf(acl, function (env, envKey, call) {
			async.eachOf(env, function (service, serviceKey, callback) {
				let sanitizedVersion = {};
				Object.keys(service).forEach(function (key) {
					sanitizedVersion[soajsLib.version.unsanitize(key)] = service[key];
					delete service[key];
				});
				acl[envKey][serviceKey] = sanitizedVersion;
				callback();
			}, call);
		}, cb);
	}
};
Product.prototype.closeConnection = function (cb) {
	let __self = this;
	
	__self.mongoCore.closeDb();
};

module.exports = Product;
