"use strict";
let colName = "products";
const productsCollectionName = 'products';
const core = require("soajs");
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
		__self.soajs.inputmaskData.id = __self.mongoCore.ObjectId(__self.soajs.inputmaskData.id);
		return ((cb) ? cb(null, __self.soajs.inputmaskData.id) : __self.soajs.inputmaskData.id);
	} catch (e) {
		return cb(e);
	}
};

Product.prototype.listConsoleProducts = function (cb) {
	let __self = this;
	let condition = {
		code: __self.soajs.config.console.product
	};
	__self.mongoCore.find(colName, condition, null, null, cb);
};

Product.prototype.listProducts = function (cb) {
	let __self = this;
	
	let condition = {
			code: {$ne: __self.soajs.config.console.product}
	};
	
	__self.mongoCore.find(colName, condition, null, null, cb);
};

Product.prototype.getProduct = function (cb) {
	let __self = this;
	let condition = {};
	if (__self.soajs.inputmaskData.id) {
		condition = {'_id': __self.soajs.inputmaskData.id};
	} else if (__self.soajs.inputmaskData.code) {
		condition = {'code': __self.soajs.inputmaskData.code};
	}
	__self.mongoCore.find(colName, condition, null, null, cb);
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

module.exports = Product;
