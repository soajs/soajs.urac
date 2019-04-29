"use strict";
const assert = require('assert');
const request = require("request");
const soajs = require('soajs');

const Mongo = soajs.mongo;
const dbConfig = require("./db.config.test.js");

const sessionConfig = dbConfig();
sessionConfig.name = "core_session";
const mongoSession = new Mongo(sessionConfig);

const uracConfig = dbConfig();
uracConfig.name = "test_urac";
const extKey = 'aa39b5490c4a4ed0e56d7ec1232a428f771e8bb83cfcee16de14f735d0f5da587d5968ec4f785e38570902fd24e0b522b46cb171872d1ea038e88328e7d973ff47d9392f72b2d49566209eb88eb60aed8534a965cf30072c39565bd8d72f68ac';


function requester(apiName, method, params, cb) {
	var options = {
		uri: 'http://127.0.0.1:4000/urac/' + apiName,
		headers: {
			key: extKey
		},
		method: method.toUpperCase(),
		json: true
	};
	
	if (params.headers) {
		for (var h in params.headers) {
			if (Object.hasOwnProperty.call(params.headers, h)) {
				options.headers[h] = params.headers[h];
			}
			else {
			}
		}
	}
	if (params.form) {
		options.form = params.form;
	}
	if (params.qs) {
		options.qs = params.qs;
	}
	if (params.body) {
		options.body = params.body;
	}
	if (method === 'delete') {
		request.del(options, function (error, response, body) {
			assert.ifError(error);
			assert.ok(body);
			return cb(null, body);
		});
	}
	else {
		request[method](options, function (error, response, body) {
			assert.ifError(error);
			assert.ok(body);
			return cb(null, body);
		});
	}
}

let params = {};
describe("urac group tests", function () {
	before(function (done) {
		mongoSession.dropDatabase(function () {
			console.log('starting tests ....');
			setTimeout(function () {
				done();
			}, 500);
		});
	});
	
	afterEach(function (done) {
		console.log("=======================================");
		done();
	});
	
	describe("testing product API", function () {
		it("call api /product/list", function (done) {
			
			requester('product/list/', 'get', params, function (error, body) {
				done();
			});
		});
		it("call api /product/console/list", function (done) {
			
			requester('product/console/list/', 'get', params, function (error, body) {
				done();
			});
		});
		it("call api /product", function (done) {
			
			requester('product/', 'get', params, function (error, body) {
				done();
			});
		});
		it("call api /product/purge", function (done) {
			params =  {
				qs: {
					id: 1
				}
			};
			requester('product/purge/', 'get', params, function (error, body) {
				done();
			});
		});
		it("call api /product/packages/list", function (done) {
			params =  {
				qs: {
					id: 1
				}
			};
			requester('product/packages/list/', 'get', params, function (error, body) {
				done();
			});
		});
		it("call api /product/package", function (done) {
			params =  {
				qs: {
					packageCode: 1,
					productCode: 1
				}
			};
			requester('product/package/', 'get', params, function (error, body) {
				done();
			});
		});
		it("call api /product", function (done) {
			params = {
				form :{
					code: "code",
					name: "code"
				}
			};
			requester('product/', 'post', params, function (error, body) {
				done();
			});
		});
		it("call api /product/package", function (done) {
			params = {
				qs: {
					id: "code",
				},
				form :{
					code: "code",
					name: "code",
					_TTL: "6"
				}
			};
			requester('product/package', 'post', params, function (error, body) {
				done();
			});
		});
		it("call api /product/console/package", function (done) {
			params = {
				qs: {
					id: "code",
				},
				form :{
					code: "code",
					name: "code",
					_TTL: "6"
				}
			};
			requester('product/console/package/', 'post', params, function (error, body) {
				done();
			});
		});
		it("call api /product", function (done) {
			params = {
				qs :{
					id: "code"
				},
				form: {
					name: "code",
					
				}
			};
			requester('product/', 'put', params, function (error, body) {
				done();
			});
		});
		it("call api /product/package", function (done) {
			
			params = {
				qs :{
					id: "code",
					code: "code"
				},
				form: {
					name: "code",
					_TTL: "6",
					
				}
			};
			requester('product/package', 'put', params, function (error, body) {
				done();
			});
		});
		it("call api /product/scope", function (done) {
			params = {
				qs :{
					id: "code"
				},
				body :{
					scope: {
						"dahb": {}
					}
				}
			};
			requester('product/scope', 'put', params, function (error, body) {
				done();
			});
		});
		it("call api /product", function (done) {
			params = {
				qs :{
					id: "code"
				}
			};
			requester('product/', 'delete', params, function (error, body) {
				done();
			});
		});
		it("call api /product/package", function (done) {
			params = {
				qs :{
					id: "code",
					code: "code"
				}
			};
			requester('product/package', 'delete', params, function (error, body) {
				done();
			});
		});
	});
});