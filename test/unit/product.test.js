"use strict";
var assert = require("assert");
var helper = require('../helper');

var product = helper.requireModule('./lib/product');
var model = helper.requireModule('./model/product');
var config = helper.requireModule('./config');

const sinon = require('sinon');
var Mongo = require("soajs").mongo;

describe("testing product", function () {
	
	let mongoStubIndex;
	let mongoFindOneStub;
	let mongoFindStub;
	let mongoRemoveStub;
	let mongoValidateStub;
	
	
	let soajs = {
		config: config,
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
			debug: function (err) {
				console.log(err);
			},
			error: function (err) {
				console.log(err);
			}
		}
	};
	
	afterEach(function (done) {
		if (mongoStubIndex) {
			mongoStubIndex.restore();
		}
		if (mongoFindOneStub) {
			mongoFindOneStub.restore();
		}
		
		if (mongoFindStub) {
			mongoFindStub.restore();
		}
		if (mongoValidateStub) {
			mongoValidateStub.restore();
		}
		if (mongoRemoveStub) {
			mongoRemoveStub.restore();
		}
		
		done();
	});
	
	it("list product fail", function (done) {
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, stubCb) => {
				return stubCb(111);
			}
		);
		
		product.listConsole(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("list product", function (done) {
		mongoFindStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		product.list(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("list product", function (done) {
		mongoFindStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		product.listConsole(soajs, model, function (error, result) {
			done();
		});
	});
	
	
	
	it("delete product fail 1", function (done) {
		mongoRemoveStub = sinon.stub(Mongo.prototype, 'remove').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
	
		product.delete(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("delete product fail 2", function (done) {
		mongoRemoveStub = sinon.stub(Mongo.prototype, 'remove').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		soajs.inputmaskData.id = "weqweqweqw";
		product.delete(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("delete product success 1", function (done) {
		mongoRemoveStub = sinon.stub(Mongo.prototype, 'remove').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		delete soajs.inputmaskData.id;
		soajs.inputmaskData.code = 23;
		soajs.tenant = {
			application: {
				product : 23
			}
		};
		product.delete(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("delete product success 2", function (done) {
		mongoRemoveStub = sinon.stub(Mongo.prototype, 'remove').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		delete soajs.inputmaskData.code;
		soajs.inputmaskData.id = "57a2495612979c1655f0ed70";
		product.delete(soajs, model, function (error, result) {
			done();
		});
	});
	
});