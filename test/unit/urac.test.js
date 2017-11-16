"use strict";
var assert = require("assert");
var helper = require('../helper');

var urac = helper.requireModule('./lib/urac');

const sinon = require('sinon');
var Mongo = require("soajs").mongo;

describe("testing rules", function () {
	
	let mongoStub;
	let mongoFindOneStub;
	
	let modelName = "mongo";
	
	let request = {
		soajs: {
			config: {
				errors: {
					"438": "error"
				}
			},
			registry: {
				coreDB: {
					provision: {
						"name": "core_provision",
						"prefix": '',
						"servers": [
							{
								"host": "127.0.0.1",
								"port": 27017
							}
						],
						"credentials": null,
						"URLParam": {
							"poolSize": 5,
							"autoReconnect": true
						}
					}
				}
			},
			inputmaskData: {
				tenantId: "57a2495612979c1655f0ed70"
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
		if (mongoFindOneStub) {
			mongoFindOneStub.restore();
		}
		
		urac.clearMongo();
		
		done();
	});
	
	it("error on listEnvironment", function (done) {
		mongoStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb({
						code: 123,
						message: "error on first database call"
					});
				}
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
		mongoStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, {});
				}
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
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, conditions, cb) => {
				return cb(null, {});
			}
		);
		
		mongoStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, cb) => {
				let lastParam = cb;
				if (!cb) {
					lastParam = condition;
				}
				
				if (collection === 'environment') {
					return lastParam(null, {});
				} else if (collection === 'tenants') {
					return lastParam(null, {});
				} else if (collection === 'services') {
					return lastParam({
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
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, conditions, cb) => {
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
		
		mongoStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, cb) => {
				let lastParam = cb;
				if (!cb) {
					lastParam = condition;
				}
				
				if (collection === 'environment') {
					return lastParam(null, {});
				} else if (collection === 'tenants') {
					return lastParam(null, {});
				} else if (collection === 'services') {
					return lastParam(null, {});
				} else {
					return lastParam(null, {});
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