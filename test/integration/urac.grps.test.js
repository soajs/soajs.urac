"use strict";
var assert = require('assert');
var request = require("request");
var helper = require("../helper.js");
var soajs = require('soajs');
var urac;

var Mongo = soajs.mongo;
var dbConfig = require("./db.config.test.js");

var sessionConfig = dbConfig();
sessionConfig.name = "core_session";
var mongoSession = new Mongo(sessionConfig);

var uracConfig = dbConfig();
uracConfig.name = "test_urac";
var mongo = new Mongo(uracConfig);


var extKey = 'aa39b5490c4a4ed0e56d7ec1232a428f771e8bb83cfcee16de14f735d0f5da587d5968ec4f785e38570902fd24e0b522b46cb171872d1ea038e88328e7d973ff47d9392f72b2d49566209eb88eb60aed8534a965cf30072c39565bd8d72f68ac';

function requester(apiName, method, params, cb) {
	var options = {
		uri: 'http://127.0.0.1:4000/urac/' + apiName,
		headers: {
			key: extKey
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
		options.form = params.form;
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

var gId = '';
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
	
	it("Testing login user2 and get groups", function (done) {
		var params = {
			form: {
				"username": 'user2',
				"password": '123456'
			}
		};
		requester('login', 'post', params, function (error, body) {
			assert.ifError(error);
			assert.ok(body);
			console.log(JSON.stringify(body));
			assert.ok(body.data);
			done();
		});
	});
	
	describe("testing groups API", function () {
		
		describe("testing create group API", function () {
			it("SUCCESS - will create new group", function (done) {
				var params = {
					form: {
						'code': 'gold',
						'name': 'Gold',
						'description': 'grp description',
						'tId': '10d2cb5fc04ce51e06000001',
						'tCode': 'test'
					}
				};
				requester('admin/group/add', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					
					mongo.findOne('groups', {'code': 'gold'}, function (error, record) {
						assert.ifError(error);
						assert.ok(record);
						console.log(record);
						gId = record._id.toString();// will be used by other test cases
						done();
					});
				});
			});
			
			it("FAIL - invalid tenant id", function (done) {
				var params = {
					form: {
						'code': 'gold',
						'name': 'gold',
						'description': 'grp description',
						'tId': '10d2cbc6000001',
						'tCode': 'test'
					}
				};
				requester('admin/group/add', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.deepEqual(body.errors.details[0], {
						"code": 611,
						"message": "Invalid tenant id provided"
					});
					done();
				});
			});
			
			it("FAIL - will NOT create group - code exists", function (done) {
				var params = {
					form: {
						'code': 'gold',
						'name': 'gold',
						'description': 'grp description',
						'tId': '10d2cb5fc04ce51e06000001',
						'tCode': 'test'
					}
				};
				requester('admin/group/add', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.deepEqual(body.errors.details[0], {
						"code": 421,
						"message": "Group code already exists. Choose another"
					});
					done();
				});
			});
			
			it("SUCCESS - will create new group - silver", function (done) {
				var params = {
					form: {
						'code': 'silver',
						'name': 'Silver Group',
						'description': 'grp description',
						'tId': '10d2cb5fc04ce51e06000001',
						'tCode': 'test'
					}
				};
				requester('admin/group/add', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					done();
				});
			});
			
		});
		
		describe("testing edit group API", function () {
			it("FAIL - will NOT edit group - Invalid id", function (done) {
				var params = {
					qs: {'gId': '5645'},
					form: {
						'name': 'gold 2',
						'description': 'description 2'
					}
				};
				requester('admin/group/edit', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.deepEqual(body.errors.details[0], {"code": 417, "message": "Invalid group id provided"});
					done();
				});
			});
			
			it("SUCCESS - will edit group", function (done) {
				var params = {
					qs: {
						'gId': gId
					},
					form: {
						'name': 'gold name',
						'description': 'description update'
					}
				};
				requester('admin/group/edit', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
				
			});
			
		});
		
		describe("testing mapping", function () {
			var uId = '';
			it("SUCCESS - will map grp to users", function (done) {
				var params = {
					form: {
						'groupCode': 'bronze',
						'users': ['user1', 'user4'],
						'tId': '10d2cb5fc04ce51e06000001'
					}
				};
				requester('admin/group/addUsers', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
			it("SUCCESS - will map grp to users - empty array", function (done) {
				var params = {
					form: {
						'groupCode': 'silver',
						'users': [],
						'tId': '10d2cb5fc04ce51e06000001'
					}
				};
				requester('admin/group/addUsers', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
			it("SUCCESS - will update user account", function (done) {
				mongo.findOne("users", {'username': 'user1'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					console.log('userRecord');
					console.log(userRecord);
					uId = userRecord._id.toString();
					var params = {
						qs: {'uId': uId},
						form: {
							'firstName': 'david',
							'lastName': 'smith',
							"email": "user1@domain.com",
							'username': 'user1',
							'status': 'active',
							"groups": ['silver', 'gold', 'bronze']
						}
					};
					
					requester('admin/editUser', 'post', params, function (error, body) {
						assert.ifError(error);
						assert.ok(body);
						assert.ok(body.data);
						console.log(JSON.stringify(body));
						mongo.findOne("users", {'username': 'user1'}, function (error, userRecord) {
							assert.ifError(error);
							assert.ok(userRecord);
							assert.deepEqual(userRecord.groups, ['silver', 'gold', 'bronze']);
							done();
						});
					});
					
				});
				
			});
			it("SUCCESS - will update user account - no groups", function (done) {
				var params = {
					qs: {'uId': uId},
					form: {
						'firstName': 'david',
						'lastName': 'smith',
						"email": "user1@domain.com",
						'username': 'user1',
						'status': 'active',
						"groups": [],
						'tId': '10d2cb5fc04ce51e06000001'
					}
				};
				requester('admin/editUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					console.log(JSON.stringify(body));
					mongo.findOne("users", {'username': 'user1'}, function (error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						assert.deepEqual(userRecord.groups, []);
						done();
					});
				});
			});
			it("SUCCESS - will add user account - with groups", function (done) {
				var params = {
					form: {
						'firstName': 'user5',
						'lastName': 'user5',
						"email": "user5@domain.com",
						'username': 'user5',
						'status': 'active',
						"groups": ['gold'],
						'tId': '10d2cb5fc04ce51e06000001',
						'tCode': 'test',
						'password': '123',
						'confirmation': '123'
					}
				};
				requester('admin/addUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					console.log(JSON.stringify(body));
					mongo.findOne("users", {'username': 'user5'}, function (error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						console.log(userRecord);
						assert.deepEqual(userRecord.groups, ['gold']);
						done();
					});
				});
			});
			it("SUCCESS - will login user with no config obj", function (done) {
				var params = {
					form: {
						"username": 'user1',
						"password": '123456'
					}
				};
				requester('login', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
			it("SUCCESS - will login user 3 with no grps arr", function (done) {
				var params = {
					form: {
						"username": 'user3',
						"password": '654321'
					}
				};
				requester('login', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
		});
		
		describe("testing delete group API", function () {
			it("FAIL - will not delete group", function (done) {
				var params = {
					qs: {'gId': 'gfdg56'}
				};
				requester('admin/group/delete', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.deepEqual(body.errors.details[0], {"code": 417, "message": "Invalid group id provided"});
					done();
				});
			});
			it("SUCCESS - will delete group gold", function (done) {
				var params = {
					qs: {
						'gId': gId
					}
				};
				requester('admin/group/delete', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
			it("FAIL - will not delete locked group", function (done) {
				mongo.findOne('groups', {'name': 'administrator'}, function (error, record) {
					assert.ifError(error);
					assert.ok(record);
					//console.log(record);						
					var Id = record._id.toString();
					var params = {
						qs: {'gId': Id}
					};
					requester('admin/group/delete', 'get', params, function (error, body) {
						assert.ifError(error);
						assert.ok(body);
						console.log(JSON.stringify(body));
						assert.deepEqual(body.errors.details[0], {
							"code": 500,
							"message": "This record in locked. You cannot modify or delete it"
						});
						done();
					});
					
				});
				
			});
			
		});
		
		describe("testing list group API", function () {
			it("SUCCESS - will return all grps records", function (done) {
				var params = {};
				requester('admin/group/list', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					assert.ok(body.data.length > 0);
					done();
				});
			});
			
			it("SUCCESS - will return grps records for tenant", function (done) {
				var params = {
					qs: {
						'tId': '10d2cb5fc04ce51e06000001'
					}
				};
				requester('admin/group/list', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					assert.ok(body.data.length > 0);
					done();
				});
			});
			
			it("SUCCESS - will return All records", function (done) {
				var params = {};
				requester('admin/all', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					assert.ok(body.data.users);
					assert.ok(body.data.users.length > 0);
					assert.ok(body.data.groups);
					assert.ok(body.data.groups.length > 0);
					done();
				});
			});
			
			it("SUCCESS - will return empty records", function (done) {
				mongo.dropCollection('groups', function () {
					var params = {};
					requester('admin/group/list', 'get', params, function (error, body) {
						assert.ifError(error);
						assert.ok(body);
						console.log(JSON.stringify(body));
						assert.ok(body.data);
						assert.equal(body.data.length, 0);
						done();
					});
				});
			});
		});
	});
	
});