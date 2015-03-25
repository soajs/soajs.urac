"use strict";
var assert = require('assert');
var request = require("request");
var helper = require("../helper.js");
// var shell = require('shelljs');

var soajs = require('soajs');
var controller = require("soajs.controller");
var urac;

var Mongo = soajs.mongo;
var dbConfig = require("./db.config.test.js");

var provisioningConfig = dbConfig();
provisioningConfig.name = "core_provision";
var mongoProvisioning = new Mongo(provisioningConfig);

var sessionConfig = dbConfig();
sessionConfig.name = "core_session";
var mongoSession = new Mongo(sessionConfig);

var uracConfig = dbConfig();
uracConfig.name = "test_urac";
var mongo = new Mongo(uracConfig);

var sampleData = require("soajs.mongodb.data/modules/urac");

var extKey_noMail = 'aa39b5490c4a4ed0e56d7ec1232a428f7ad78ebb7347db3fc9875cb10c2bce39bbf8aabacf9e00420afb580b15698c04ce10d659d1972ebc53e76b6bbae0c113bee1e23062800bc830e4c329ca913fefebd1f1222295cf2eb5486224044b4d0c';
var extKey = 'aa39b5490c4a4ed0e56d7ec1232a428f771e8bb83cfcee16de14f735d0f5da587d5968ec4f785e38570902fd24e0b522b46cb171872d1ea038e88328e7d973ff47d9392f72b2d49566209eb88eb60aed8534a965cf30072c39565bd8d72f68ac';

function requester(apiName, method, params, cb) {
	var options = {
		uri: 'http://localhost:4000/urac/' + apiName,
		headers: {
			key: extKey
		},
		json: true
	};

	if(params.headers) {
		for(var h in params.headers) {
			if(params.headers.hasOwnProperty(h)) {
				options.headers[h] = params.headers[h];
			}
			else {

			}
		}
	}

	if(params.form) {
		options.form = params.form;
	}

	if(params.qs) {
		options.qs = params.qs;
	}

	request[method](options, function(error, response, body) {
		assert.ifError(error);
		assert.ok(body);
		return cb(null, body);
	});
}

/*
describe("importing sample data", function() {
	it.skip("do import", function(done) {
		shell.pushd(sampleData.dir);
		shell.exec("chmod +x " + sampleData.shell, function(code) {
			assert.equal(code, 0);
			shell.exec(sampleData.shell, function(code) {
				assert.equal(code, 0);
				shell.popd();
				done();
			});
		});
	});

	after(function(done) {
		setTimeout(function() {
			console.log('test data imported.');
			urac = helper.requireModule('./index');
			mongoSession.dropDatabase(function() {
				mongo.dropDatabase(function() {
					console.log('starting tests ....');
					done();
				});
			});
		}, 1000);
	});
});
*/

describe.only("urac group tests", function() {
	before(function(done) {
		setTimeout(function() {			
			urac = helper.requireModule('./index');
			done();
		}, 1500);
	});
	
	afterEach(function(done) {
		console.log("=======================================");
		done();
	});

	describe("testing list users API", function() {
		it("SUCCESS - will return user records", function(done) {
			var params = {};
			requester('admin/listUsers', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				assert.ok(body.data.length > 0);
				done();
			});
		});

	});
	
	describe("testing groups API", function() {
		var gId = '';
		it("SUCCESS - will return grps records", function(done) {
			var params = {};
			requester('admin/listGroups', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				assert.ok(body.data.length > 0);
				done();
			});
		});

		it("SUCCESS - will create group", function(done) {
			var params = {
				form: {
					'name': 'gold',
					'description': 'grp description'
				}
			};
			mongo.dropCollection('groups', function() {
				requester('admin/addGroup', 'post', params, function(error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					
					mongo.findOne('groups', {'name': 'gold'}, function(error, record) {
						assert.ifError(error);
						assert.ok(record);
						console.log(record);
						//assert.equal(record.name , 'gold');
						gId = record._id.toString();// will be used by other test cases
						done();
					});
				});			
			
			});
			
			
		});
		
		it("FAIL - will NOT edit group", function(done) {
			var params = {
				qs: {
					'gId': '5645'
				},
				form: {
					'name': 'gold 2',
					'description': 'description 2 '
				}
			};
			
			requester('admin/editGroup', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 417, "message": "Invalid group id provided"});		
				done();
			});
		
		});
		it("SUCCESS - will edit group", function(done) {
			var params = {
				qs: {
					'gId': gId
				},
				form: {
					'name': 'gold 2',
					'description': 'description 2 '
				}
			};
			
			requester('admin/editGroup', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);				
				done();
			});
		
		});
		
		it("FAIL - will not delete group", function(done) {
			var params = {
				qs: {
					'gId': 'gfdgfdg56'
				}
			};			
			requester('admin/deleteGroup', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 417, "message": "Invalid group id provided"});				
				done();
			});
		
		});
		it("SUCCESS - will delete group", function(done) {
			var params = {
				qs: {
					'gId': gId
				}
			};
			
			requester('admin/deleteGroup', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);				
				done();
			});
		
		});
	});
});