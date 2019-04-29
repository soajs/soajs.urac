"use strict";
var assert = require("assert");
var helper = require('../helper');

var product = helper.requireModule('./lib/product');
var modelP = helper.requireModule('./model/product');
var config = helper.requireModule('./config');

const sinon = require('sinon');
var Mongo = require("soajs").mongo;
let dD = require('./schemas/product.js');
describe("testing product", function () {
	
	let mongoStubIndex;
	let mongoFindOneStub;
	let mongoFindStub;
	let mongoRemoveStub;
	let mongoValidateStub;
	let mongoInsertObject;
	let mongoCountStub;
	let mongoFindEnvStub;
	let mongoUpdateStub;
	let mongoSaveStub;
	
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
		if (mongoInsertObject) {
			mongoInsertObject.restore();
		}
		if (mongoCountStub) {
			mongoCountStub.restore();
		}
		if (mongoFindEnvStub) {
			mongoFindEnvStub.restore();
		}
		if (mongoUpdateStub) {
			mongoUpdateStub.restore();
		}
		if (mongoSaveStub) {
			mongoSaveStub.restore();
		}
		
		done();
	});
	
	it("list product fail", function (done) {
		mongoFindStub = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, stubCb) => {
				return stubCb(true);
			}
		);
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				return stubCb(true);
			}
		);
		let model = new modelP(soajs);
		product.listConsole(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("list product", function (done) {
		let opts = dD();
		mongoFindStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, [opts.product]);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		let model = new modelP(soajs);
		product.list(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("list console product", function (done) {
		let opts = dD();
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.consoleProduct);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		let model = new modelP(soajs);
		product.listConsole(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("get product", function (done) {
		let opts = dD();
		soajs.inputmaskData.id = opts.product._id;
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		let model = new modelP(soajs);
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		product.get(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("get package not found", function (done) {
		let opts = dD();
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.package = "notfound";
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		let model = new modelP(soajs);
		product.getPackage(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("get package", function (done) {
		let opts = dD();
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.packageCode = opts.product.packages[0].code;
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		let model = new modelP(soajs);
		product.getPackage(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("list package", function (done) {
		let opts = dD();
		soajs.inputmaskData.id = opts.product._id;
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		let model = new modelP(soajs);
		product.listPackage(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("add product", function (done) {
		soajs.inputmaskData = {
			"code": "test",
			"name": "name",
			"description": "description"
		};
		
		mongoInsertObject = sinon.stub(Mongo.prototype, 'insert').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, [{_id: 1}]);
				}
			}
		);
		
		mongoCountStub = sinon.stub(Mongo.prototype, 'count').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, 0);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		let model = new modelP(soajs);
		product.add(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("add package", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.code = "test";
		soajs.inputmaskData.id = opts.consoleProduct._id;
		soajs.inputmaskData.name = "testpp";
		soajs.inputmaskData.description = "342342";
		soajs.inputmaskData.acl = {
			"dev" :{}
		};
		soajs.inputmaskData._TTL = 12;
		
		mongoSaveStub = sinon.stub(Mongo.prototype, 'save').callsFake((collection, record, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.consoleProduct);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoFindEnvStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, [{code: "dev"}]);
				}
			}
		);
		let model = new modelP(soajs);
		product.addConsolePackage(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("add console package", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.code = "test";
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.name = "testpp";
		soajs.inputmaskData.description = "342342";
		soajs.inputmaskData.acl = {
			"manual" :{}
		};
		soajs.inputmaskData._TTL = 12;
		soajs.tenant = {};
		mongoFindStub = sinon.stub(Mongo.prototype, 'save').callsFake((collection, record, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoFindEnvStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, [{code: "manual"}]);
				}
			}
		);
		let model = new modelP(soajs);
		product.addPackage(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("update product", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.name = "testpp";
		soajs.inputmaskData.description = "342342";
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoUpdateStub = sinon.stub(Mongo.prototype, 'update').callsFake((collection, condition, fields, options, versioning, stubCb) => {
				if (stubCb) {
					return stubCb(null, [{code: "dev"}]);
				}
			}
		);
		let model = new modelP(soajs);
		product.update(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("update scope", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.name = "testpp";
		soajs.inputmaskData.description = "342342";
		soajs.inputmaskData.scope = opts.consoleProduct.scope.acl;
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoUpdateStub = sinon.stub(Mongo.prototype, 'update').callsFake((collection, condition, fields, options, versioning, stubCb) => {
				if (stubCb) {
					return stubCb(null, [{code: "dev"}]);
				}
			}
		);
		let model = new modelP(soajs);
		product.updateScope(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("update package fail 1", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.name = "testpp";
		soajs.inputmaskData.description = "342342";
		soajs.inputmaskData.acl = opts.consoleProduct.scope;
		soajs.inputmaskData.code = "test";
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoSaveStub = sinon.stub(Mongo.prototype, 'save').callsFake((collection, condition, fields, options, versioning, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		mongoFindEnvStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, [{code: "dev"}]);
				}
			}
		);
		let model = new modelP(soajs);
		product.updatePackage(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("update package 1", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.name = "FABIO";
		soajs.inputmaskData.description = "342342";
		soajs.inputmaskData.acl = {dev: ""};
		soajs.inputmaskData.code = "FABIO";
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoSaveStub = sinon.stub(Mongo.prototype, 'save').callsFake((collection, record, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		mongoFindEnvStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, [{code: "dev"}]);
				}
			}
		);
		let model = new modelP(soajs);
		product.updatePackage(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("update package 2", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.name = "FABIO";
		soajs.inputmaskData.description = "342342";
		soajs.inputmaskData.acl = {manual: ""};
		soajs.inputmaskData.code = "FABIO";
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoSaveStub = sinon.stub(Mongo.prototype, 'save').callsFake((collection, condition, fields, options, versioning, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		mongoFindEnvStub = sinon.stub(Mongo.prototype, 'find').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, [{code: "dev"}]);
				}
			}
		);
		let model = new modelP(soajs);
		product.updatePackage(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("purge product", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.name = "FABIO";
		soajs.inputmaskData.description = "342342";
		soajs.inputmaskData.code = "FABIO";
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoStubIndex = sinon.stub(Mongo.prototype, 'createIndex').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		
		mongoSaveStub = sinon.stub(Mongo.prototype, 'save').callsFake((collection, record, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		let model = new modelP(soajs);
		product.purgeProduct(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("delete product fail 1", function (done) {
		soajs.inputmaskData ={};
		mongoRemoveStub = sinon.stub(Mongo.prototype, 'remove').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		let model = new modelP(soajs);
		product.delete(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("delete product success 1", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.id = opts.product._id;
		mongoRemoveStub = sinon.stub(Mongo.prototype, 'remove').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		delete soajs.inputmaskData.id;
		soajs.inputmaskData.code = 23;
		soajs.tenant = {
			application: {
				product: 23
			}
		};
		
		let model = new modelP(soajs);
		product.delete(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("delete product success 2", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.id = opts.product._id;
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoRemoveStub = sinon.stub(Mongo.prototype, 'remove').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		delete soajs.inputmaskData.code;
		soajs.inputmaskData.id = "57a2495612979c1655f0ed70";
		let model = new modelP(soajs);
		product.delete(soajs, model, function (error, result) {
			done();
		});
	});
	
	it("delete Package", function (done) {
		let opts = dD();
		soajs.inputmaskData ={};
		soajs.inputmaskData.id = opts.product._id;
		soajs.inputmaskData.code = "fabio";
		
		mongoFindOneStub = sinon.stub(Mongo.prototype, 'findOne').callsFake((collection, condition, fields, options, stubCb) => {
				if (stubCb) {
					return stubCb(null, opts.product);
				}
			}
		);
		
		mongoSaveStub = sinon.stub(Mongo.prototype, 'save').callsFake((collection, condition, stubCb) => {
				if (stubCb) {
					return stubCb(null, true);
				}
			}
		);
		soajs.inputmaskData.id = "57a2495612979c1655f0ed70";
		let model = new modelP(soajs);
		product.deletePackage(soajs, model, function (error, result) {
			done();
		});
	});
});