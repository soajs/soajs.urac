"use strict";
var assert = require('assert');
var request = require("request");
var helper = require("../helper.js");

var soajs = require('soajs');
var urac;

var Mongo = soajs.mongo;
var dbConfig = require("./db.config.test.js");

var provisioningConfig = dbConfig();
provisioningConfig.name = "core_provision";
var mongoProvisioning = new Mongo(provisioningConfig);

var uracConfig = dbConfig();
uracConfig.name = "test_urac";
var mongo = new Mongo(uracConfig);

var extKey_noMail = 'aa39b5490c4a4ed0e56d7ec1232a428f7ad78ebb7347db3fc9875cb10c2bce39bbf8aabacf9e00420afb580b15698c04ce10d659d1972ebc53e76b6bbae0c113bee1e23062800bc830e4c329ca913fefebd1f1222295cf2eb5486224044b4d0c';
var extKey = 'aa39b5490c4a4ed0e56d7ec1232a428f771e8bb83cfcee16de14f735d0f5da587d5968ec4f785e38570902fd24e0b522b46cb171872d1ea038e88328e7d973ff47d9392f72b2d49566209eb88eb60aed8534a965cf30072c39565bd8d72f68ac';
var extKey3 = "aa39b5490c4a4ed0e56d7ec1232a428f1c5b5dcabc0788ce563402e233386738fc3eb18234a486ce1667cf70bd0e8b08890a86126cf1aa8d38f84606d8a6346359a61678428343e01319e0b784bc7e2ca267bbaafccffcb6174206e8c83f2a25";

function requester(apiName, method, params, cb) {
	var options = {
		uri: 'http://127.0.0.1:4000/urac/' + apiName,
		headers: {
			key: extKey,
			'Content-Type': 'application/json'
		},
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
		options.body = params.form;
	}
	
	if (params.qs) {
		options.qs = params.qs;
	}
	
	request[method](options, function (error, response, body) {
		assert.ifError(error);
		assert.ok(body);
		return cb(null, body);
	});
}

describe("simple urac tests", function () {
	var uId;
	
	afterEach(function (done) {
		console.log("=======================================");
		done();
	});
	
	
	describe("testing passport login API", function () {
		
		it("FAIL - Missing config", function (done) {
			var params = {
				headers: {
					key: extKey3
				}
			};
			
			requester('passport/login/google', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.deepEqual(body.errors.details[0], {
					"code": 399,
					"message": "Missing Service config. Contact system Admin"
				});
				done();
			});
		});
		
		it("SUCCESS - will redirect user", function (done) {
			var params = {
				qs: {}
			};
			requester('passport/login/google', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				done();
			});
		});

		it("SUCCESS - will login user", function (done) {
			var params = {
				qs: {
					oauth_token: "XnjHbgAAAAAAxq3dAAABWCr23O0",
					oauth_verifier:"CZ10nMKn8BSEYHpZZb8eQxUY3kuxGAR6"
				}
			};
			requester('passport/validate/twitter', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				done();
			});
		});

		it("Fail - Missing param", function (done) {
			var params = {
				qs: {
					oauth_verifier:"CZ10nMKn8BSEYHpZZb8eQxUY3kuxGAR6"
				}
			};
			requester('passport/validate/twitter', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				done();
			});
		});

		it("Fail - Code Already used", function (done) {
			var params = {
				qs: {
					code: "AQARgR1d6G3ISNzf3cet5espoQDGh_ADkU-n5J3VWGnydyGqdsgZYntKGe-7Ww3sFVWvXybCmiaW5tCXjRElzBI2hk7i75Oi9eNbPzC_W_PrjvmAh3q1rTpbCPCGO8bziT7kITp2rcPXVur3Gq7SHrPtcMp7gXfvB77Cbb9N1XCrmDWw_wKmZkWqjQlOF6Es-P8njD9hl9_MoCRH5-LRfUoM9N_2QBRAxmCn7UMlIxq0kajyDtpVcDW36hFIwMUt5ZYy1t9ClFhA3Y-y4s0kWzdz-pY55pMfdgm9vxU9Ku6gwZn1HfjAe0w1_2JGk3UXEflG0003hPwBe0kakKPwb-BZ#_=_"
				}
			};
			
			requester('passport/validate/facebook', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				done();
			});
		});

		it("Fail - wrong format", function (done) {
			var params = {
				qs: {
					code: "123"
				}
			};
			requester('passport/validate/facebook', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				done();
			});
		});

	});
	
	
});