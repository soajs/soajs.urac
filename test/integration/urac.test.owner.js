"use strict";
var assert = require('assert');
var request = require("request");
var helper = require("../helper.js");
var soajs = require('soajs');
var urac;

var config = helper.requireModule('./config');
var errorCodes = config.errors;

var Mongo = soajs.mongo;
var dbConfig = require("./db.config.test.js");

var provisioningConfig = dbConfig();
provisioningConfig.name = "core_provision";

var uracConfig = dbConfig();
uracConfig.name = "temp_urac";
var mongo = new Mongo(uracConfig);

var extKey = 'aa39b5490c4a4ed0e56d7ec1232a428f771e8bb83cfcee16de14f735d0f5da587d5968ec4f785e38570902fd24e0b522b46cb171872d1ea038e88328e7d973ff47d9392f72b2d49566209eb88eb60aed8534a965cf30072c39565bd8d72f68ac';

function requester(apiName, method, params, cb) {
	var options = {
		uri: 'http://127.0.0.1:4000/urac/' + apiName,
		headers: {
			key: extKey,
			'Content-Type': 'application/json'
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

describe("Owner admin tests", function () {
	var uId;
	var gId;
	var tCode = 'temp';
	
	before(function (done) {
		mongo.dropCollection('users', function () {
			mongo.dropCollection('groups', function () {
				done();
			});
		});
	});
	
	afterEach(function (done) {
		console.log("======================================= ===================================");
		done();
	});
	
	describe("testing admin user API", function () {
		describe("testing add user API", function () {
			
			it("Fail - Active missing password", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					},
					form: {
						'firstName': 'john',
						'lastName': 'smith',
						'email': 'john.smith@soajs.org',
						'username': 'smith123',
						'status': 'active'
					}
				};
				
				requester('owner/admin/addUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.errors);
					assert.equal(body.errors.codes[0], 424);
					done();
				});
			});
			
			it("Fail - Pending with password", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					},
					form: {
						'firstName': 'john',
						'lastName': 'smith',
						'email': 'john.smith@soajs.org',
						'username': 'smith123',
						'password': 'password'
					}
				};
				
				requester('owner/admin/addUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.errors);
					assert.equal(body.errors.codes[0], 424);
					done();
				});
			});
			
			it("SUCCESS - will add user account", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					},
					form: {
						'firstName': 'john',
						'lastName': 'black',
						'email': 'john.black@soajs.org',
						'username': 'black_123',
						'config': {}
					}
				};
				
				requester('owner/admin/addUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					console.log(body);
					mongo.findOne("users", { 'username': 'black_123' }, function (error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						done();
					});
					
				});
			});
			
			it("SUCCESS - will add user account with password", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					},
					form: {
						'firstName': 'john',
						'lastName': 'smith',
						'email': 'john.smith@soajs.org',
						'username': 'smith123',
						'status': 'active',
						'password': 'password',
						'config': {}
					}
				};
				
				requester('owner/admin/addUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					// console.log(body);
					mongo.findOne("users", { 'username': 'smith123' }, function (error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						delete userRecord.password;
						delete userRecord.ts;
						uId = userRecord._id.toString();
						done();
					});
					
				});
			});
			
		});
		
		describe("testing edit user API", function () {
			
			it("SUCCESS - will update user account", function (done) {
				var params = {
					qs: {
						'uId': uId,
						'tCode': tCode
					},
					form: {
						'firstName': 'john-jack',
						'lastName': 'smith',
						'email': 'john.smith@soajs.org',
						'username': 'smith123',
						'status': 'active',
						'config': {}
					}
				};
				
				requester('owner/admin/editUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					done();
				});
			});
			
			it("SUCCESS - will update user config", function (done) {
				var params = {
					qs: {
						'uId': uId,
						'tCode': tCode
					},
					form: {
						'config': {
							'keys': {},
							'packages': {
								'TPROD_EX03': {
									'acl': {
										'example01': {}
									}
								}
							}
						}
					}
				};
				
				requester('owner/admin/editUserConfig', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					mongo.findOne("users", { 'username': 'smith123' }, function (error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						assert.deepEqual(userRecord.config.packages, {
							'TPROD_EX03': {
								'acl': {
									'example01': {}
								}
							}
						});
						done();
					});
					
				});
			});
			
			it("Fail - invalid id", function (done) {
				var params = {
					qs: {
						'uId': "581b6947f2eb001e4db64285",
						'tCode': tCode
					},
					form: {
						'config': {
							'keys': {},
							'packages': {
								'TPROD_EX03': {
									'acl': {
										'example01': {}
									}
								}
							}
						}
					}
				};
				
				requester('owner/admin/editUserConfig', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.equal(body.result, false);
					done();
					
				});
			});
		});
		
		describe("testing change user status API", function () {
			
			it("SUCCESS - will inactivate user", function (done) {
				var params = {
					qs: {
						'uId': uId,
						'tCode': tCode,
						'status': 'inactive'
					}
				};
				requester('owner/admin/changeUserStatus', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					// console.log(JSON.stringify(body));
					assert.ok(body.data);
					mongo.findOne('users', { '_id': mongo.ObjectId(uId) }, function (error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						assert.equal(userRecord.status, 'inactive');
						done();
					});
				});
			});
			
		});
		
		describe("testing admin get user API", function () {
			
			it("Success", function (done) {
				var params = {
					qs: {
						'uId': uId,
						'tCode': tCode
					}
				};
				requester('owner/admin/getUser', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					assert.equal(body.data._id, uId);
					done();
				});
			});
			
		});
		
		describe("testing list users API", function () {
			
			it("SUCCESS - will return user records", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					}
				};
				requester('owner/admin/listUsers', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					//console.log(JSON.stringify(body));
					assert.ok(body.data);
					assert.ok(body.data.length > 0);
					done();
				});
			});
			
			it("SUCCESS - search keywords", function (done) {
				var params = {
					qs: {
						'tCode': tCode,
						'keywords': 'john'
					}
				};
				requester('owner/admin/listUsers', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					//console.log(JSON.stringify(body));
					assert.ok(body.data);
					assert.ok(body.data.length > 0);
					done();
				});
			});
			
		});
		
		describe("testing count users API", function () {
			
			it("SUCCESS - will return user count", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					}
				};
				requester('owner/admin/users/count', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(body);
					done();
				});
			});
			
			it("SUCCESS - with keywords", function (done) {
				var params = {
					qs: {
						'tCode': tCode,
						'keywords': 'john'
					}
				};
				requester('owner/admin/users/count', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(body);
					done();
				});
			});
			
		});
	});
	
	describe("testing admin group API", function () {
		describe("testing add group API", function () {
			it("SUCCESS - will create new group", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					},
					form: {
						'code': 'gold',
						'name': 'Gold',
						'description': 'grp description'
					}
				};
				requester('owner/admin/group/add', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					
					mongo.findOne('groups', { 'code': 'gold' }, function (error, record) {
						assert.ifError(error);
						assert.ok(record);
						console.log(record);
						gId = record._id.toString();// will be used by other test cases
						done();
					});
				});
			});
		});
		
		describe("testing edit group API", function () {
			
			it("SUCCESS - will edit group", function (done) {
				var params = {
					qs: {
						'gId': gId,
						'tCode': tCode
					},
					form: {
						'name': 'gold name',
						'description': 'description update'
					}
				};
				requester('owner/admin/group/edit', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
				
			});
		});
		
		describe("testing assign users API", function () {
			
			it("SUCCESS - will map grp to users", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					},
					form: {
						'groupCode': 'gold',
						'users': ['smith123']
					}
				};
				requester('owner/admin/group/addUsers', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
			
		});
		
		describe("testing list groups API", function () {
			
			it("SUCCESS - will return grps records", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					}
				};
				requester('owner/admin/group/list', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					assert.ok(body.data.length > 0);
					done();
				});
			});
			
			it("Fail - Invalid model", function (done) {
				
				var params = {
					qs: {
						model: "memory",
						'tCode': tCode
					}
				};
				requester('owner/admin/group/list', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body.errors);
					assert.deepEqual(body.errors.details[0], { "code": 601, "message": errorCodes[601] });
					done();
				});
			});
			
		});
		
		describe("testing delete group API", function () {
			it("SUCCESS - will delete group gold", function (done) {
				var params = {
					qs: {
						'gId': gId,
						'tCode': tCode
					}
				};
				requester('owner/admin/group/delete', 'del', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
			
		});
	});
	
	describe("testing admin tokens API", function () {
		var tokenId;
		describe("testing list tokens API", function () {
			it("SUCCESS - will get all", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					}
				};
				requester('owner/admin/tokens/list', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					assert.ok(body.data.totalCount);
					tokenId = body.data.records[0]._id.toString();
					done();
				});
			});
			it("SUCCESS - will get next", function (done) {
				var params = {
					qs: {
						'tCode': tCode,
						'start': 10
					}
				};
				requester('owner/admin/tokens/list', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
		});
		
		describe("testing delete Token API", function () {
			
			it("Fail - wrong token id", function (done) {
				var params = {
					qs: {
						'tokenId': "123456789",
						'tCode': tCode
					}
				};
				requester('owner/admin/tokens/delete', 'del', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.deepEqual(body.errors.details[0], { "code": 426, "message": errorCodes[426] });
					done();
				});
			});
			
			it("SUCCESS - will delete token", function (done) {
				var params = {
					qs: {
						'tokenId': tokenId,
						'tCode': tCode
					}
				};
				requester('owner/admin/tokens/delete', 'del', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					// console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
			
			it("SUCCESS - will get none", function (done) {
				var params = {
					qs: {
						'tCode': tCode
					}
				};
				mongo.remove("tokens", {}, function (error) {
					assert.ifError(error);
					requester('owner/admin/tokens/list', 'get', params, function (error, body) {
						assert.ifError(error);
						assert.ok(body);
						// console.log(JSON.stringify(body));
						assert.ok(body.data);
						done();
					});
				});
				
			});
		});
		
	});

});