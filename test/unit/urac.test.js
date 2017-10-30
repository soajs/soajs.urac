"use strict";
var assert = require("assert");
var helper = require('../helper');

var urac = helper.requireModule('./lib/urac');

const sinon = require('sinon');
var Mongo = require("soajs").mongo;

describe("testing rules", function () {
	
	let mongoStub;
	let mongoObjectIdStub;
	
	let modelName = "mongo";
	
	let request = {
		soajs: {
			config: {
				errors: {
					"438": "error"
				}
			},
			registry: {
				coreDB: {}
			},
			inputmaskData: {
				tenantId: "1"
			},
			log: {
				error: function (err) {
					console.log(err);
				}
			}
		}
	};
	
	afterEach(function (done) {
		if (mongoStub) {
			mongoStub.restore();
		}
		if (mongoObjectIdStub) {
			mongoObjectIdStub.restore();
		}
		
		urac.clearMongo();
		
		done();
	});
	
	it("error on listEnvironment", function (done) {
		mongoStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, cb) => {
				return cb({
					code: 123,
					message: "error on first database call"
				});
			}
		);
		
		urac.init(modelName, function (error, libProduct) {
			libProduct.tenant.getUserAclInfo(request, function (error, result) {
				assert.equal(error.code, 437);
				done();
			});
		});
	});
	
	it("error on getTenant", function (done) {
		mongoStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, cb) => {
				return cb(null, {});
			}
		);
		
		urac.init(modelName, function (error, libProduct) {
			libProduct.tenant.getUserAclInfo(request, function (error, result) {
				assert.equal(error.code, 438);
				done();
			});
		});
	});
	
	it("error on listServices", function (done) {
		
		request.soajs.inputmaskData.tenantId = "551286bce603d7e01ab1688e";
		mongoObjectIdStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, conditions, cb) => {
				return cb(null, {});
			}
		);
		
		mongoStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, cb) => {
				if (collection === 'environment') {
					return cb(null, {});
				} else if (collection === 'tenants') {
					return cb(null, {});
				} else if (collection === 'services') {
					return cb({
						code: 400,
						message: "error on services call"
					});
				}
			}
		);
		
		urac.init(modelName, function (error, libProduct) {
			libProduct.tenant.getUserAclInfo(request, function (error, result) {
				assert.equal(error.code, 400);
				done();
			});
		});
	});
	
	it("error on getAndSetPackages", function (done) {
		
		request.soajs.inputmaskData.tenantId = "551286bce603d7e01ab1688e";
		mongoObjectIdStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, conditions, cb) => {
				if (collection === 'products') {
					return cb(null, {
						packages: []
					});
				} else {
					return cb(null, {
						applications: [
							{}
						]
					});
				}
			}
		);
		
		mongoStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, cb) => {
				if (collection === 'environment') {
					return cb(null, {});
				} else if (collection === 'tenants') {
					return cb(null, {});
				} else if (collection === 'services') {
					return cb(null, {});
				} else {
					return cb(null, {});
				}
			}
		);
		
		urac.init(modelName, function (error, libProduct) {
			libProduct.tenant.getUserAclInfo(request, function (error, result) {
				assert.equal(error.code, 461);
				done();
			});
		});
	});
	
});