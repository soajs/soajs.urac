"use strict";
var assert = require("assert");
var helper = require('../helper');

var urac = helper.requireModule('./lib/urac');

const sinon = require('sinon');
var Mongo = require("soajs").mongo;

describe("testing rules", function () {
	
	let mongoStub;
	
	afterEach(function (done) {
		if (mongoStub) {
			mongoStub.restore();
		}
		
		done();
	});
	
	it("test", function (done) {
		
		let modelName = "mongo";
		
		mongoStub = sinon.stub(Mongo, 'constructor', (input, cb) => {
				return cb({
					error: false
				});
			}
		);
		
		// mongoStub = sinon.stub("Mongo");
		// mongoStub.prototype.test = sinon.stub().returns({
		// 	find : function (){
		// 		return {};
		// 	}
		// });
		
		let request = {
			soajs: {
				config: {},
				registry: {
					coreDB : {}
				}
			}
		};
		
		urac.init(modelName, function (error, libProduct) {
			libProduct.tenant.getUserAclInfo(request, function (error, result) {
				console.log(result);
				done();
			});
		});
		
	});
	
});