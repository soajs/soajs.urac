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
var mongoProvisioning = new Mongo(provisioningConfig);

//var sessionConfig = dbConfig();
//sessionConfig.name = "core_session";

var uracConfig = dbConfig();
uracConfig.name = "test_urac";
var mongo = new Mongo(uracConfig);

var nock = require("nock");
const sinon = require('sinon');

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
	
	var u4 = '22d2cb5fc04ce51e06000001';
	
	describe.skip("testing getUserAclInfo", function () {
		it("Success", function (done) {
			var params = {
				qs: {
					"tenantId" : "551286bce603d7e01ab1688e"
				}
			};
			requester('tenant/getUserAclInfo', 'get', params, function (error, body) {
				console.log(JSON.stringify(body,null,2));
				assert.equal(body.result, true);
				assert.ok(body.data);
				done();
			});
		});
	});
	
	describe.skip("testing list tenant", function () {
		it("Success - with type client", function (done) {
			var params = {
				qs: {
					"type": "client"
				}
			};
			requester('tenant/list', 'get', params, function (error, body) {
				assert.equal(body.result, true);
				assert.ok(body.data);
				body.data.forEach(function (tenant) {
					assert.deepEqual(tenant.type, "client");
				});
				done();
			});
		});
		
		it("Success - with type and negate", function (done) {
			var params = {
				qs: {
					"type": "client",
					"negate": true
				}
			};
			requester('tenant/list', 'get', params, function (error, body) {
				assert.equal(body.result, true);
				assert.ok(body.data);
				done();
			});
		});
		
		it("Success", function (done) {
			var params = {
				qs: {}
			};
			requester('tenant/list', 'get', params, function (error, body) {
				assert.equal(body.result, true);
				assert.ok(body.data);
				done();
			});
		});
	});
	
	describe("testing openam login", function () {
		it("fail - login with an invalid token", function (done) {
			var params = {
				form: {
					"token": "123"
				}
			};
			
			requester('openam/login', 'post', params, function (error, body) {
				assert.ok(body.errors);
				done();
			});
		});
		
		it("fail - generateSaveAccessRefreshToken failed", function (done) {
			
			var coreModules = require("soajs.core.modules");
			var provision = coreModules.provision;
			var serviceStub = sinon.stub(provision, 'generateSaveAccessRefreshToken').callsFake((req, data, cb) =>
				{
					var error = {
						code : 123,
						message : 'Error in generateSaveAccessRefreshToken'
					};
					return cb(error);
				}
			);
			
			var mockedReply = {
				attributes : [
					{ name: 'sAMAccountName', values: [ 'etienz' ] },
					{ name: 'mail', values: [ 'mail@mail.com' ] },
					{ name: 'givenname', values: [ 'etienne' ] },
					{ name: 'sn', values: [ 'daher' ] }
				]
			};
			nock('https://test.com')
				.post('/openam/identity/json/attributes')
				.query(true) // any params sent
				.reply(200, mockedReply);
			
			var params = {
				form: {
					"token": "123"
				}
			};
			
			requester('openam/login', 'post', params, function (error, body) {
				serviceStub.restore();
				assert.deepEqual(body.errors.details[0].code,499);
				done();
			});
		});
		
		it("Success - logged in successfully", function (done) {
			var mockedReply = {
				attributes : [
					{ name: 'sAMAccountName', values: [ 'etienz' ] },
					{ name: 'mail', values: [ 'mail@mail.com' ] },
					{ name: 'givenname', values: [ 'etienne' ] },
					{ name: 'sn', values: [ 'daher' ] }
				]
			};
			nock('https://test.com')
				.post('/openam/identity/json/attributes')
				.query(true) // any params sent
				.reply(200, mockedReply);
			
			var params = {
				form: {
					"token": "any token will do, server mocked"
				}
			};
			
			requester('openam/login', 'post', params, function (error, body) {
				assert.deepEqual(body.data.lastName,'daher');
				assert.ok(body.data.accessTokens.access_token);
				done();
			});
		});
	});
	
	describe("testing ldap login API", function () {
		
		var serverConfig = {
			host: '127.0.0.1',
			port: 10389,
			baseDN: 'ou=users,ou=system',
			adminUser: 'uid=admin, ou=system',
			adminPassword: 'secret'
		};
		
		it("fail - login with a missing configuration error", function (done) {
			
			var params = {
				form: {
					"username": "owner",
					"password": "password"
				},
				headers: {
					key: extKey3
				}
			};
			
			var ldapServer = require('./extras/ldapServer');
			ldapServer.startServer(serverConfig, function (server) {
				requester('ldap/login', 'post', params, function (error, body) {
					assert.deepEqual(body.errors.details[0].code,706);
					ldapServer.killServer(server);
					done();
				});
			});
		});
		
		it("success - login with the correct credentials", function (done) {
			
			var params = {
				form: {
					"username": "owner",
					"password": "password"
				},
				headers: {
					'Content-Type': 'application/json',
					key: extKey
				}
			};
			
			var ldapServer = require('./extras/ldapServer');
			ldapServer.startServer(serverConfig, function (server) {
				requester('ldap/login', 'post', params, function (error, body) {
					console.log(JSON.stringify(body, null, 2));
					assert.ok(body.data);
					ldapServer.killServer(server);
					done();
				});
			});
		});
		
		
	});
	
	describe("testing locked accounts", function () {
		
		it("FAIL - editUserConfig", function (done) {
			var params = {
				qs: {
					'uId': u4
				},
				form: {
					'config': {
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
			requester('admin/editUserConfig', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				// 
				// assert.equal(body.errors.details[0].code, 500);
				done();
			});
		});
		
		it("FAIL - editUser", function (done) {
			var params = {
				qs: {
					'uId': u4
				},
				form: {
					"username": "user4",
					"firstName": "user",
					"lastName": "four4",
					"email": "user4@domain.com",
					"status": "active",
					"profile": {},
					"config": {
						"packages": {},
						"keys": {}
					}
				}
			};
			
			requester('admin/editUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				// 
				// assert.equal(body.errors.details[0].code, 500);
				done();
				
			});
		});
		
	});
	
	describe("testing edit user Config API", function () {
		
		it("FAIL - invalid user account", function (done) {
			var params = {
				qs: {
					'uId': 'aaaabbbbccccdddd'
				},
				form: {
					'config': {}
				}
			};
			requester('admin/editUserConfig', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 411, "message": "invalid user id provided"});
				done();
			});
		});
		
		var u1 = '54ee1a511856706c23639308';
		
		it("SUCCESS - will update user1 config", function (done) {
			var params = {
				qs: {
					'uId': u1
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
			
			requester('admin/editUserConfig', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				mongo.findOne("users", {'username': 'user1'}, function (error, userRecord) {
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
		
	});
	
	describe("testing check Username Exists", function () {
		
		it("SUCCESS - user exists", function (done) {
			var params = {
				qs: {
					"username": 'user1'
				}
			};
			
			requester('checkUsername', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.equal(body.data, true);
				done();
			});
		});
		
		it("SUCCESS - user doesn't exist", function (done) {
			var params = {
				qs: {
					"username": 'invalidusername'
				}
			};
			
			requester('checkUsername', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(!body.data);
				done();
			});
		});
	});
	
	describe("testing join API with validation", function () {
		var token;
		var tokenlisa;
		it("FAIL - missing param", function (done) {
			var params = {
				form: {
					"username": 'john123',
					"password": 'password',
					"email": 'john@soajs.org'
				}
			};
			
			requester('join', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.errors);
				assert.deepEqual(body.errors.details[0], {
					"code": 172,
					"message": "Missing required field: firstName, lastName"
				});
				
				done();
			});
		});
		
		it("SUCCESS - will join user", function (done) {
			var params = {
				form: {
					"username": 'john123',
					"password": 'password',
					"firstName": 'john',
					"lastName": 'doe',
					"email": 'john.doe@soajs.org'
				}
			};
			
			requester('join', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(body);
				assert.ok(body.data);
				token = body.data.token;
				setTimeout(function () {
					mongo.findOne('users', {'username': 'john123', status: 'pendingJoin'}, function (error, record) {
						assert.ifError(error);
						console.log(JSON.stringify(record));
						assert.ok(record);
						done();
					});
				}, 100);
			});
		});
		
		it("SUCCESS - will join another user", function (done) {
			var params = {
				form: {
					"username": 'lisa2',
					"password": 'password',
					"firstName": 'lisa 2',
					"lastName": 'smith green',
					"email": 'lisa2@soajs.org'
				}
			};
			
			requester('join', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				tokenlisa = body.data.token;
				//update token record to expire
				mongo.findOne('tokens', {'token': tokenlisa}, function (err, tokenRecord) {
					if (err || !tokenRecord) {
					}
					var t = new Date(1426087819320);
					tokenRecord.expires = t;
					console.log(tokenRecord);
					mongo.save('tokens', tokenRecord, function (err) {
						//console.log(tokenRecord);
					});
				});
				
				mongo.findOne('users', {'username': 'lisa2', status: 'pendingJoin'}, function (error, record) {
					assert.ifError(error);
					console.log(JSON.stringify(record));
					assert.ok(record);
					done();
				});
				
			});
		});
		
		it("FAIL - user exists", function (done) {
			var params = {
				form: {
					"username": 'john123',
					"password": 'password',
					"firstName": 'john',
					"lastName": 'doe',
					"email": 'john@soajs.org'
				}
			};
			
			requester('join', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.errors);
				assert.deepEqual(body.errors.details[0], {"code": 402, "message": "User account already exists."});
				
				done();
			});
		});
		
		it("FAIL - missing validation params", function (done) {
			var params = {
				qs: {}
			};
			
			requester('join/validate', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.errors);
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: token"});
				
				done();
			});
		});
		
		it("SUCCESS - will validate join user", function (done) {
			var params = {
				qs: {
					"token": token
				}
			};
			
			requester('join/validate', 'get', params, function (error, body) {
				assert.ifError(error);
				
				assert.ok(body);
				assert.ok(body.data);
				//assert.deepEqual(body.errors.details[0], {"code": 302, "message": "Missing required field: token"});
				done();
			});
		});
		
		it("Fail - will not validate join user", function (done) {
			var params = {
				qs: {
					"token": tokenlisa
				}
			};
			
			requester('join/validate', 'get', params, function (error, body) {
				assert.ifError(error);
				
				assert.ok(body);
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});
		
	});
	
	describe("testing join API without validation", function () {
		it("change service tenant configuration, set validate to false", function (done) {
			var options = {
				uri: 'http://localhost:5000/loadProvision',
				headers: {
					key: extKey
				}
			};
			
			mongoProvisioning.findOne('tenants', {'applications.keys.extKeys.extKey': extKey}, function (error, provisioning) {
				assert.ifError(error);
				provisioning.applications[0].keys[0].config.dev.urac.validateJoin = false;
				
				mongoProvisioning.save('tenants', provisioning, function (error) {
					assert.ifError(error);
					request.get(options, function (error, response, body) {
						assert.ifError(error);
						assert.ok(body);
						done();
					});
				});
			});
		});
		
		it("drop the collection and join the user again without validation", function (done) {
			var params = {
				form: {
					"username": 'john123',
					"password": 'password',
					"firstName": 'john',
					"lastName": 'doe',
					"email": 'john.doe@soajs.org'
				}
			};
			
			mongo.remove('users', {}, function () {
				mongo.remove('tokens', {}, function () {
					
					requester('join', 'post', params, function (error, body) {
						assert.ifError(error);
						assert.ok(body);
						assert.ok(body.data);
						console.log(body);
						
						mongo.findOne('users', {'username': 'john123', 'status': 'active'}, function (error, record) {
							assert.ifError(error);
							assert.ok(record);
							console.log(record);
							uId = record._id.toString();// will be used by other test cases
							done();
						});
					});
				});
			});
		});
	});
	
	describe("testing add user API", function () {
		var myNewToken;
		var lisaAdd_Token;
		it("FAIL - missing parameters", function (done) {
			var params = {
				form: {
					'firstName': 'john',
					'lastName': 'doe',
					'email': 'john.doe.1@soajs.org'
				}
			};
			requester('admin/addUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {
					"code": 172,
					"message": "Missing required field: username, tId, tCode"
				});
				done();
			});
		});
		
		it("FAIL - invalid tId", function (done) {
			var params = {
				form: {
					'username': 'johndoe1',
					'firstName': 'john1',
					'lastName': 'doe1',
					'email': 'john.doe1@soajs.org',
					'tId': 'invalidTID',
					'tCode': 'test'
				}
			};
			requester('admin/addUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 611, "message": "Invalid tenant id provided"});
				done();
			});
		});
		
		it("SUCCESS - will add user", function (done) {
			var params = {
				form: {
					'username': 'john_smith',
					'firstName': 'john',
					'lastName': 'smith',
					'email': 'john.smith@soajs.org',
					'tId': '10d2cb5fc04ce51e06000001',
					'tCode': 'test'
				}
			};
			
			requester('admin/addUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				myNewToken = body.data.token;
				mongo.findOne("users", {'username': 'john_smith'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					assert.equal(userRecord.status, 'pendingNew');
					mongo.findOne('tokens', {'userId': userRecord._id.toString()}, function (error, tokenRecord) {
						assert.ifError(error);
						assert.ok(tokenRecord);
						console.log(tokenRecord);
						assert.equal(tokenRecord.status, 'active');
						assert.equal(tokenRecord.service, 'addUser');
						done();
					});
				});
			});
		});
		
		it("SUCCESS - will add user with profile - no mail ", function (done) {
			var params = {
				headers: {
					'key': extKey_noMail
				},
				form: {
					'username': 'lisa',
					'firstName': 'lisa',
					'lastName': 'smith',
					'email': 'lisa.smith@soajs.org',
					'profile': {"gender": "female", "age": 25},
					'tId': '10d2cb5fc04ce51e06000001',
					'tCode': 'test'
				}
			};
			requester('admin/addUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				lisaAdd_Token = body.data.token;
				mongo.findOne("users", {'username': 'lisa'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					assert.equal(userRecord.status, 'pendingNew');
					mongo.findOne('tokens', {'userId': userRecord._id.toString()}, function (error, tokenRecord) {
						assert.ifError(error);
						assert.ok(tokenRecord);
						console.log(tokenRecord);
						assert.equal(tokenRecord.status, 'active');
						assert.equal(tokenRecord.service, 'addUser');
						done();
					});
				});
			});
		});
		
		it("SUCCESS - will validate second user and set a password", function (done) {
			var params = {
				headers: {
					'key': extKey_noMail
				},
				qs: {
					"token": lisaAdd_Token
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};
			
			requester('resetPassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				mongo.findOne('users', {'username': 'lisa'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					console.log(userRecord);
					assert.equal(userRecord.status, 'active');
					
					mongo.findOne('tokens', {
						'userId': userRecord._id.toString(),
						'service': 'addUser'
					}, function (error, tokenRecord) {
						assert.ifError(error);
						assert.ok(tokenRecord);
						console.log(tokenRecord);
						assert.equal(tokenRecord.status, 'used');
						assert.equal(tokenRecord.service, 'addUser');
						done();
					});
				});
			});
		});
		
		it("SUCCESS - will validate add user and set a password", function (done) {
			var params = {
				qs: {
					"token": myNewToken
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};
			
			requester('resetPassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				mongo.findOne('users', {'username': 'john_smith'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					console.log(userRecord);
					assert.equal(userRecord.status, 'active');
					mongo.findOne('tokens', {
						'userId': userRecord._id.toString(),
						'service': 'addUser'
					}, function (error, tokenRecord) {
						assert.ifError(error);
						assert.ok(tokenRecord);
						console.log(tokenRecord);
						assert.equal(tokenRecord.status, 'used');
						assert.equal(tokenRecord.service, 'addUser');
						done();
					});
				});
			});
		});
		
		it("SUCCESS - will add user with a password", function (done) {
			var params = {
				headers: {
					key: extKey3
				},
				form: {
					'username': 'activeuser',
					'firstName': 'john',
					'lastName': 'doe',
					'email': 'john.black@soajs.org',
					'tId': '10d2cb5fc04ce51e06000001',
					'tCode': 'test',
					'status': 'active',
					'password': '123',
					'confirmation': '123'
				}
			};
			
			requester('admin/addUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				mongo.findOne("users", {'username': 'activeuser'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					assert.equal(userRecord.status, 'active');
					mongo.findOne('tokens', {'userId': userRecord._id.toString()}, function (error, tokenRecord) {
						assert.ifError(error);
						assert.ok(!tokenRecord);
						done();
					});
				});
			});
		});
		
		it("FAIL - will not add user with a pending status and password", function (done) {
			var params = {
				form: {
					'username': 'activeuser',
					'firstName': 'john',
					'lastName': 'doe',
					'email': 'john.doe@soajs.org',
					'tId': '10d2cb5fc04ce51e06000001',
					'tCode': 'test',
					'status': 'active'
				}
			};
			
			requester('admin/addUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.errors);
				assert.equal(body.errors.codes[0], 424);
				done();
			});
		});
		
		it("FAIL - will not add user with a pending status and password", function (done) {
			var params = {
				form: {
					'username': 'activeuser',
					'firstName': 'john',
					'lastName': 'doe',
					'email': 'john.doe@soajs.org',
					'tId': '10d2cb5fc04ce51e06000001',
					'tCode': 'test',
					'password': '123',
					'confirmation': '123'
				}
			};
			
			requester('admin/addUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.errors);
				assert.equal(body.errors.codes[0], 424);
				done();
			});
		});
		
		it("FAIL - will not add user with a password and confirmation mismatch", function (done) {
			var params = {
				form: {
					'username': 'activeuser',
					'firstName': 'john',
					'lastName': 'doe',
					'email': 'john.doe@soajs.org',
					'tId': '10d2cb5fc04ce51e06000001',
					'tCode': 'test',
					'status': 'active',
					'password': '123',
					'confirmation': '456'
				}
			};
			
			requester('admin/addUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.errors);
				assert.equal(body.errors.codes[0], 408);
				done();
			});
		});
		
		it("FAIL - username exists for another account", function (done) {
			var params = {
				form: {
					'username': 'john123',
					'firstName': 'john',
					'lastName': 'doe',
					'email': 'john.doe@soajs.org',
					'tId': '10d2cb5fc04ce51e06000001',
					'tCode': 'test'
				}
			};
			requester('admin/addUser', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 402, "message": "User account already exists."});
				done();
			});
		});
		
	});
	
	describe("testing forgotPassword and resetPassword API", function () {
		var token;
		var fp_tokenlisa;
		it("FAIL - forgotPassword missing params", function (done) {
			var params = {
				qs: {}
			};
			
			requester('forgotPassword', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: username"});
				done();
			});
		});
		
		it("FAIL - forgotPassword invalid user", function (done) {
			var params = {
				qs: {
					"username": 'invaliduser'
				}
			};
			
			requester('forgotPassword', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 403, "message": "User Not Found!"});
				done();
			});
		});
		
		it("SUCCESS - forgotPassword - forgot password request - no mail", function (done) {
			var params = {
				headers: {
					'key': extKey_noMail
				},
				qs: {
					"username": 'lisa'
				}
			};
			
			requester('forgotPassword', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				fp_tokenlisa = body.data;
				
				mongo.findOne('tokens', {'token': fp_tokenlisa}, function (err, tokenRecord) {
					if (err || !tokenRecord) {
					}
					var t = new Date(1426087819320);
					
					tokenRecord.expires = t;
					mongo.save('tokens', tokenRecord, function (err) {
						console.log(tokenRecord);
						done();
					});
				});
				
			});
		});
		
		it("SUCCESS - forgotPassword should start forgot password request", function (done) {
			var params = {
				qs: {
					"username": 'john123'
				}
			};
			
			requester('forgotPassword', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				token = body.data;
				done();
			});
		});
		
		it("SUCCESS - forgotPassword should redo forgot password request", function (done) {
			var params = {
				qs: {
					"username": 'john.doe@soajs.org'
				}
			};
			
			requester('forgotPassword', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				token = body.data;
				mongo.findOne('users', {'username': 'john123'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					mongo.find('tokens', {'userId': userRecord._id.toString()}, {'sort': {'ts': 1}}, function (error, records) {
						assert.ifError(error);
						assert.ok(records);
						console.log(records);
						assert.equal(records.length, 2);
						assert.equal(records[0].status, 'invalid');
						assert.equal(records[1].status, 'active');
						done();
					});
				});
			});
		});
		
		
		it("FAIL - resetPassword missing params", function (done) {
			var params = {
				qs: {
					"token": token
				},
				form: {"password": "newPassword"}
			};
			
			requester('resetPassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {
					"code": 172,
					"message": "Missing required field: confirmation"
				});
				done();
			});
		});
		
		it("FAIL - resetPassword passsword mismatch", function (done) {
			var params = {
				qs: {
					"token": token
				},
				form: {
					"password": "newPassword",
					"confirmation": "password"
				}
			};
			
			requester('resetPassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {
					"code": 408,
					"message": "The password and its confirmation do not match"
				});
				done();
			});
		});
		
		it("FAIL - resetPassword invalid token", function (done) {
			var params = {
				qs: {
					"token": "invalidTokenProvided"
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};
			
			requester('resetPassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});
		
		it("FAIL - resetPassword token expired", function (done) {
			var params = {
				qs: {
					"token": fp_tokenlisa
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};
			
			requester('resetPassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});
		
		it("SUCCESS - resetPassword will reset the password", function (done) {
			var params = {
				qs: {
					"token": token
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};
			
			requester('resetPassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				token = body.data;
				mongo.findOne('users', {'username': 'john123'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					mongo.find('tokens', {'userId': userRecord._id.toString()}, {'sort': {'ts': 1}}, function (error, records) {
						assert.ifError(error);
						assert.ok(records);
						console.log(records);
						assert.equal(records.length, 2);
						assert.equal(records[0].status, 'invalid');
						assert.equal(records[1].status, 'used');
						done();
					});
				});
			});
		});
	});
	
	describe("testing account getUser API", function () {
		it("FAIL - missing params", function (done) {
			var params = {
				qs: {}
			};
			requester('account/getUser', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: username"});
				done();
			});
		});
		
		it("FAIL - invalid account", function (done) {
			var params = {
				qs: {
					"username": 'invalid'
				}
			};
			requester('account/getUser', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {
					"code": 405,
					"message": "Unable to find User. Please try again."
				});
				done();
			});
		});
		
		it("SUCCESS - returns user record by username", function (done) {
			var params = {
				qs: {
					"username": 'john123'
				}
			};
			requester('account/getUser', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				delete body.data.password;
				delete body.data.ts;
				delete body.data._id;
				assert.deepEqual(body.data, {
					"username": "john123",
					"firstName": "john",
					"lastName": "doe",
					"email": "john.doe@soajs.org",
					"status": "active",
					"groups": [],
					'profile': {},
					'config': {
						'packages': {},
						'keys': {}
					},
					'tenant': {
						'id': '10d2cb5fc04ce51e06000001',
						'code': 'test'
					}
				});
				done();
			});
		});

		it("SUCCESS - returns user record by email", function (done) {
			var params = {
				qs: {
					"username": 'john.doe@soajs.org'
				}
			};
			requester('account/getUser', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				delete body.data.password;
				delete body.data.ts;
				delete body.data._id;
				assert.deepEqual(body.data, {
					"username": "john123",
					"firstName": "john",
					"lastName": "doe",
					"email": "john.doe@soajs.org",
					"status": "active",
					"groups": [],
					'profile': {},
					'config': {
						'packages': {},
						'keys': {}
					},
					'tenant': {
						'id': '10d2cb5fc04ce51e06000001',
						'code': 'test'
					}
				});
				done();
			});
		});
	});
	
	describe("testing change password API", function () {
		it("FAIL - missing parameters", function (done) {
			var params = {
				qs: {},
				form: {
					'oldPassword': 'myPassword',
					'password': 'myPassword',
					'confirmation': 'myPassword'
				}
			};
			requester('account/changePassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: uId"});
				done();
			});
		});
		
		it("FAIL - password mismatch", function (done) {
			var params = {
				qs: {
					uId: 'something'
				},
				form: {
					'oldPassword': 'myPassword',
					'password': 'myPassword',
					'confirmation': 'somethingElse'
				}
			};
			
			requester('account/changePassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {
					"code": 408,
					"message": "The password and its confirmation do not match"
				});
				done();
			});
		});
		
		it("FAIL changePassword - invalid user id", function (done) {
			var params = {
				qs: {
					uId: 'something'
				},
				form: {
					'oldPassword': 'myPassword',
					'password': 'myPassword',
					'confirmation': 'myPassword'
				}
			};
			
			requester('account/changePassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 411, "message": "invalid user id provided"});
				done();
			});
		});
		
		it("FAIL - invalid user account", function (done) {
			var params = {
				qs: {
					uId: 'aaabbbcccddd'
				},
				form: {
					'oldPassword': 'myPassword',
					'password': 'myPassword',
					'confirmation': 'myPassword'
				}
			};
			
			requester('account/changePassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {
					"code": 405,
					"message": "Unable to find User. Please try again."
				});
				done();
			});
		});
		
		it("FAIL - old password mismatch", function (done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'oldPassword': 'myPassword',
					'password': 'myPassword',
					'confirmation': 'myPassword'
				}
			};
			
			requester('account/changePassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 409, "message": "Invalid old password provided"});
				done();
			});
		});
		
		it("SUCCESS - will update user password", function (done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'oldPassword': 'newPassword',
					'password': 'myPassword',
					'confirmation': 'myPassword'
				}
			};
			
			requester('account/changePassword', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				done();
			});
		});
	});
	
	describe("testing change email API", function () {
		var newToken;
		var changeEmailToken;
		it("FAIL - missing params", function (done) {
			var params = {
				form: {
					'email': 'john1.doe@soajs.org'
				}
			};
			requester('account/changeEmail', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: uId"});
				done();
			});
		});
		
		it("FAIL - invalid user provided", function (done) {
			var params = {
				qs: {
					'uId': 'aaaccdddd'
				},
				form: {
					'email': 'john1.doe@soajs.org'
				}
			};
			requester('account/changeEmail', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 411, "message": "invalid user id provided"});
				done();
			});
		});
		
		it("FAIL - same email provided", function (done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'email': 'john.doe@soajs.org'
				}
			};
			requester('account/changeEmail', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {
					"code": 412,
					"message": "You have provided the same existing email address"
				});
				done();
			});
		});
		
		it("Fail - email already exists", function (done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'email': 'john.black@soajs.org'
				}
			};
			requester('account/changeEmail', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 402, "message": errorCodes[402]});
				done();
			});
		});
		
		it("SUCCESS - change email request created", function (done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'email': 'doe.john@soajs.org'
				}
			};
			requester('account/changeEmail', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				
				mongo.findOne('users', {"username": "john123"}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					
					mongo.findOne('tokens', {
						'userId': userRecord._id.toString(),
						'service': 'changeEmail',
						'status': 'active'
					}, function (error, token) {
						assert.ifError(error);
						assert.ok(token);
						assert.equal(token.email, params.form.email);
						assert.equal(token.status, 'active');
						done();
					});
				});
			});
		});
		
		it("SUCCESS - change email request again", function (done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'email': 'doe.john@soajs.org'
				}
			};
			requester('account/changeEmail', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				
				newToken = body.data;
				mongo.findOne('users', {"username": "john123"}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					
					mongo.find('tokens', {
						'userId': userRecord._id.toString(),
						'service': 'changeEmail'
					}, {'sort': {'ts': 1}}, function (error, tokens) {
						assert.ifError(error);
						assert.ok(tokens);
						assert.equal(tokens.length, 2);
						assert.equal(tokens[0].status, 'invalid');
						assert.equal(tokens[0].email, params.form.email);
						assert.equal(tokens[1].status, 'active');
						assert.equal(tokens[1].email, params.form.email);
						done();
					});
				});
			});
		});
		
		it("FAIL - do change email fail, missing params", function (done) {
			var params = {
				qs: {}
			};
			requester('changeEmail/validate', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: token"});
				done();
			});
		});
		
		it("FAIL - do change email fail, invalid token", function (done) {
			var params = {
				qs: {
					'token': 'aaaa1ccdddd'
				}
			};
			requester('changeEmail/validate', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});
		
		it("SUCCESS - do change email verified", function (done) {
			var params = {
				qs: {
					'token': newToken
				}
			};
			requester('changeEmail/validate', 'get', params, function (error, body) {
				assert.ifError(error);
				
				assert.ok(body);
				assert.ok(body.data);
				mongo.findOne('users', {'username': 'john123'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					
					mongo.find('tokens', {
						'userId': userRecord._id.toString(),
						'service': 'changeEmail'
					}, {'sort': {'ts': 1}}, function (error, tokens) {
						assert.ifError(error);
						assert.ok(tokens);
						assert.equal(tokens.length, 2);
						assert.equal(tokens[0].status, 'invalid');
						assert.equal(tokens[1].status, 'used');
						assert.equal(userRecord.email, tokens[1].email);
						done();
					});
				});
			});
		});
		
		it("SUCCESS - change email request created - no mail sent", function (done) {
			var params = {
				headers: {
					'key': extKey_noMail
				},
				qs: {
					'uId': uId
				},
				form: {
					'email': 'doe.john.123@soajs.org'
				}
			};
			requester('account/changeEmail', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				changeEmailToken = body.data;
				mongo.findOne('tokens', {'token': changeEmailToken}, function (error, tokenRecord) {
					assert.ifError(error);
					assert.ok(tokenRecord);
					// expire
					assert.equal(tokenRecord.email, params.form.email);
					assert.equal(tokenRecord.status, 'active');
					var t = new Date(1426087819320);
					tokenRecord.expires = t;
					mongo.save('tokens', tokenRecord, function (err) {
						assert.ifError(err);
						console.log(tokenRecord);
						done();
					});
				});
			});
		});
		
		it("FAIL - do change email fail - expired token", function (done) {
			var params = {
				qs: {
					'token': changeEmailToken
				}
			};
			requester('changeEmail/validate', 'get', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});
		
		it('SUCCESS - manual reset of user email address to receive notifications from remaining APIs tests', function (done) {
			mongo.findOne('users', {'username': 'john123'}, function (error, userRecord) {
				assert.ifError(error);
				assert.ok(userRecord);
				userRecord.email = "john.doe@soajs.org";
				mongo.save('users', userRecord, function (error) {
					assert.ifError(error);
					done();
				});
			});
		});
	});
	
	describe("testing edit profile API", function () {
		it("FAIL - missing parameters", function (done) {
			var params = {
				qs: {},
				form: {
					'username': 'john1234',
					'firstName': 'john 2',
					'lastName': 'doe 2'
				}
			};
			requester('account/editProfile', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: uId"});
				done();
			});
		});
		
		it("FAIL - invalid user account", function (done) {
			var params = {
				qs: {
					'uId': 'aaabbbcccddd'
				},
				form: {
					'username': 'john123',
					'firstName': 'john2',
					'lastName': 'doe2'
				}
			};
			
			requester('account/editProfile', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.deepEqual(body.errors.details[0], {
					"code": 405,
					"message": "Unable to find User. Please try again."
				});
				done();
			});
		});
		
		it("FAIL - username exists for another account", function (done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'username': 'user2',
					'firstName': 'john2',
					'lastName': 'doe2'
				}
			};
			var secondUserRecord = {
				"username": "user2",
				"password": "someEncryptedPassword",
				"firstName": "user",
				"lastName": "two",
				"email": "user@soajs.org",
				"status": "active",
				"ts": new Date().getTime(),
				"tenant": {
					"id": "10d2cb5fc04ce51e06000001",
					"code": "test"
				}
			};
			mongo.insert('users', secondUserRecord, function (error) {
				assert.ifError(error);
				requester('account/editProfile', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.deepEqual(body.errors.details[0], {
						"code": 410,
						"message": "username taken, please choose another username"
					});
					done();
				});
			});
		});
		
		it("SUCCESS - will update user profile", function (done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'username': 'john456',
					'firstName': 'john2',
					'lastName': 'doe2',
					'profile': {"age": 30}
				}
			};
			requester('account/editProfile', 'post', params, function (error, body) {
				assert.ifError(error);
				assert.ok(body);
				
				assert.ok(body.data);
				done();
			});
		});
		
	});
	
	describe("testing admin API", function () {
		describe("testing edit user API", function () {
			it("FAIL - missing params", function (done) {
				var params = {
					form: {
						'firstName': 'john',
						'lastName': 'doe',
						'email': 'john.doe@soajs.org',
						'username': 'johndoe',
						'status': 'active'
					}
				};
				requester('admin/editUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: uId"});
					done();
				});
			});
			
			it("FAIL - invalid user account", function (done) {
				var params = {
					qs: {
						'uId': 'aaaabbbbccccdddd'
					},
					form: {
						'firstName': 'john',
						'lastName': 'doe',
						'email': 'john.doe@soajs.org',
						'username': 'johndoe',
						'status': 'active'
					}
				};
				requester('admin/editUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.deepEqual(body.errors.details[0], {"code": 411, "message": "invalid user id provided"});
					done();
				});
			});
			
			it("FAIL - username exists for another account", function (done) {
				var params = {
					qs: {
						'uId': uId
					},
					form: {
						'firstName': 'john',
						'lastName': 'doe',
						'email': 'john.doe@soajs.org',
						'username': 'activeuser',
						'status': 'active'
					}
				};
				requester('admin/editUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.deepEqual(body.errors.details[0], {
						"code": 410,
						"message": "username taken, please choose another username"
					});
					done();
				});
			});
			
			it("SUCCESS - will update user account - john123", function (done) {
				var params = {
					qs: {
						'uId': uId
					},
					form: {
						'firstName': 'john',
						'lastName': 'doe',
						'email': 'john.doe@soajs.org',
						'username': 'john123',
						'status': 'active',
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
				
				requester('admin/editUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					
					
					mongo.findOne("users", {'username': 'john123'}, function (error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						delete userRecord.password;
						delete userRecord.ts;
						userRecord._id = userRecord._id.toString();
						assert.deepEqual(userRecord, {
							'firstName': 'john',
							'lastName': 'doe',
							'email': 'john.doe@soajs.org',
							'username': 'john123',
							'status': 'active',
							'_id': uId,
							'groups': [],
							'profile': {
								"age": 30
							},
							'config': {
								'packages': {
									'TPROD_EX03': {
										'acl': {
											'example01': {}
										}
									}
								},
								'keys': {}
							},
							'tenant': {
								'id': '10d2cb5fc04ce51e06000001',
								'code': 'test'
							}
						});
						done();
					});
					
					
				});
			});
			
			it("SUCCESS - will update user account user2", function (done) {
				mongo.findOne("users", {'username': 'user2'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					delete userRecord.password;
					var id2 = userRecord._id.toString();
					console.log(userRecord);
					var params = {
						qs: {
							'uId': id2
						},
						form: {
							"firstName": "user",
							"lastName": "two",
							'username': 'user2',
							"email": "user@soajs.org",
							'status': 'active',
							"profile": {
								"sex": "male"
							},
							"password": "123",
							"confirmation": "123",
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
					requester('admin/editUser', 'post', params, function (error, body) {
						assert.ifError(error);
						assert.ok(body);
						assert.ok(body.data);
						
						mongo.findOne("users", {'username': 'user2'}, function (error, record) {
							assert.ok(record);
							delete record.password;
							delete record.ts;
							delete record.groups;
							delete record.tenant;
							console.log(record);
							delete record._id;
							assert.deepEqual(record.config, {
								'keys':{},
								'packages': {
									'TPROD_EX03': {
										'acl': {
											'example01': {}
										}
									}
								}
							});
							delete record.config;
							assert.deepEqual(record, {
								'username': 'user2',
								"firstName": "user",
								"lastName": "two",
								"email": "user@soajs.org",
								'status': 'active',
								"profile": {
									"sex": "male"
								}
							});
							done();
						});
					});
				});
			});
			
			it("FAIL - password and its confirmation do not match", function (done) {
				mongo.findOne("users", {'username': 'user2'}, function (error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					delete userRecord.password;
					var id2 = userRecord._id.toString();
					var params = {
						qs: {
							'uId': id2
						},
						form: {
							"firstName": "user",
							"lastName": "two",
							'username': 'user2',
							"email": "user@soajs.org",
							'status': 'active',
							"profile": {
								"sex": "male"
							},
							"password": "123",
							"confirmation": "456",
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
					requester('admin/editUser', 'post', params, function (error, body) {
						assert.ifError(error);
						assert.ok(body);
						assert.ok(body.errors);
						assert.deepEqual(body.errors.codes[0], 408);
						done();
					});
				});
			});
		});
		
		describe("testing change user status API", function () {
			it("FAIL - missing parameters", function (done) {
				var params = {
					qs: {
						'uId': uId
					}
				};
				requester('admin/changeUserStatus', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.deepEqual(body.errors.details[0], {
						"code": 172,
						"message": "Missing required field: status"
					});
					done();
				});
			});
			
			it("FAIL - invalid user account", function (done) {
				var params = {
					qs: {
						'uId': 'dfds',
						'status': 'active'
					}
				};
				requester('admin/changeUserStatus', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.deepEqual(body.errors.details[0], {"code": 411, "message": "invalid user id provided"});
					done();
				});
			});
			
			it("FAIL - will approve user", function (done) {
				var params = {
					qs: {
						'uId': uId,
						'status': 'pending'//invalid status
					}
				};
				requester('admin/changeUserStatus', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.equal(body.errors.details[0].code, '173');
					assert.equal(body.errors.details[0].message, "Validation failed for field: status -> The parameter 'status' failed due to: instance is not one of enum values: active,inactive");
					done();
				});
			});
			
			it("SUCCESS - will approve user", function (done) {
				var params = {
					qs: {
						'uId': uId,
						'status': 'active'
					}
				};
				requester('admin/changeUserStatus', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.ok(body.data);
					mongo.findOne('users', {'_id': mongo.ObjectId(uId)}, function (error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						assert.equal(userRecord.status, 'active');
						done();
					});
				});
			});
			
			it("SUCCESS - will inactivate user", function (done) {
				var params = {
					qs: {
						'uId': uId,
						'status': 'inactive'
					}
				};
				requester('admin/changeUserStatus', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.ok(body.data);
					mongo.findOne('users', {'_id': mongo.ObjectId(uId)}, function (error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						assert.equal(userRecord.status, 'inactive');
						done();
					});
				});
			});
			
			it("SUCCESS - will activate user - no mail", function (done) {
				var params = {
					headers: {
						'key': extKey_noMail
					},
					qs: {
						'uId': uId,
						'status': 'active'
					}
				};
				requester('admin/changeUserStatus', 'get', params, function (error, body) {
					assert.ifError(error);
					
					assert.ok(body);
					assert.ok(body.data);
					done();
				});
			});
			
		});
		
		describe("testing admin get user API", function () {
			it("Fail - missing param", function (done) {
				var params = {
					qs: {}
				};
				requester('admin/getUser', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: uId"});
					done();
				});
			});
			
			it("Fail - invalid id", function (done) {
				var params = {
					qs: {
						'uId': '32434324'
					}
				};
				requester('admin/getUser', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.deepEqual(body.errors.details[0], {"code": 411, "message": "invalid user id provided"});
					done();
				});
			});
			
			it("Success - get user", function (done) {
				var params = {
					qs: {
						'uId': uId
					}
				};
				requester('admin/getUser', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.ok(body.data);
					assert.equal(body.data._id, uId);
					done();
				});
			});
			
		});
		
		describe("testing count users API", function () {
			
			it("SUCCESS - will return user count", function (done) {
				var params = {};
				requester('admin/users/count', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(body);
					done();
				});
			});
			
			it("SUCCESS - search keywords", function (done) {
				var params = {
					qs: {
						keywords: 'smith'
					}
				};
				requester('admin/users/count', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					done();
				});
			});
			
		});
		
		describe("testing invite user API", function () {
			
			it("SUCCESS - will invite user", function (done) {
				var params = {
					'qs': {
						username: "john_smith",
						email: "john.smith@soajs.org",
					},
					form: {
						tenantId: "tenantId",
						tenantCode: "tenantCode",
						groups: ["owner"],
						pin: {
							code: "1234",
							allowed: true
						}
					}
				};
				requester('admin/inviteUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					done();
				});
			});
			
			it("fail - no user or email", function (done) {
				var params = {
					form: {
						tenantId: "tenantId",
						tenantCode: "tenantCode",
						groups: ["owner"],
						pin: {
							code: "1234",
							allowed: true
						}
					}
				};
				requester('admin/inviteUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
			
			it("fail - no user", function (done) {
				var params = {
					'qs': {
						username: "john_smithsdsd",
					},
					form: {
						tenantId: "tenantId",
						tenantCode: "tenantCode",
						groups: ["owner"],
						pin: {
							code: "1234",
							allowed: true
						}
					}
				};
				requester('admin/inviteUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
			
			it("fail - already added", function (done) {
				var params = {
					'qs': {
						username: "john_smith",
					},
					form: {
						tenantId: "tenantId",
						tenantCode: "tenantCode",
						groups: ["owner"],
						pin: {
							code: "1234",
							allowed: true
						}
					}
				};
				requester('admin/inviteUser', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
			
		});
		
		describe("testing add pin to user API", function () {
			
			it("SUCCESS - will add pin to  records", function (done) {
				var params = {
					'qs': {
						username: "john_smith",
						email: "john.smith@soajs.org",
						
					},
					form: {
						tenantId: "tenantId",
						groups: ["owner2"],
						pin: {
							code: "12343",
							allowed: true
						}
					}
				};
				requester('admin/pinConfig', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					done();
				});
			});
			it("fail - no user or email", function (done) {
				var params = {
					form: {
						tenantId: "tenantId",
						groups: ["owner"],
						pin: {
							code: "1234",
							allowed: true
						}
					}
				};
				requester('admin/pinConfig', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
			
			it("fail - no user record", function (done) {
				var params = {
					'qs': {
						username: "john_smitsh",
					},
					form: {
						tenantId: "tenantId",
						groups: ["owner"],
						pin: {
							code: "1234",
							allowed: true
						}
					}
				};
				requester('admin/pinConfig', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
			
			it("fail - no tenant", function (done) {
				var params = {
					'qs': {
						username: "john_smith",
					},
					form: {
						tenantId: "tenantIdsd",
						groups: ["owner"],
						pin: {
							code: "1234",
							allowed: true
						}
					}
				};
				requester('admin/pinConfig', 'post', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
		});
		
		describe("testing delete pin from user API", function () {
			
			it("SUCCESS - will return user records", function (done) {
				var params = {
					'qs': {
						username: "john_smith",
						email: "john.smith@soajs.org",
						tenantId: "tenantId",
					}
				};
				requester('admin/pinConfig', 'delete', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					done();
				});
			});
			
			it("fail - no user", function (done) {
				var params = {
					'qs': {
						username: "john_smithsdfsf",
						tenantId: "tenantId",
					}
				};
				requester('admin/pinConfig', 'delete', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
			
			it("fail - no user or email", function (done) {
				var params = {
					'qs': {
						tenantId: "tenantId",
					}
				};
				requester('admin/pinConfig', 'delete', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
			
			it("fail - no user or email", function (done) {
				var params = {
					'qs': {
						username: "john_smith",
						tenantId: "tenantIdsd",
					}
				};
				requester('admin/pinConfig', 'delete', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
		});
		
		describe("testing un-invite user API", function () {
			
			it("SUCCESS - will un-invite user", function (done) {
				var params = {
					'form': {
						username: ["john_smith"],
					},
					'qs': {
						tenantId: "tenantId"
					}
				};
				requester('admin/unInviteUsers', 'put', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					done();
				});
			});
			
			it("SUCCESS - will un-invite user", function (done) {
				var params = {
					'form': {
						email: ["john.smith@soajs.org"],
					},
					'qs': {
						tenantId: "tenantId"
					}
				};
				requester('admin/unInviteUsers', 'put', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					done();
				});
			});
			it("fail - no user", function (done) {
				var params = {
					'qs': {
						tenantId: "tenantId"
					}
				};
				requester('admin/unInviteUsers', 'put', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					done();
				});
			});
		});
		
		describe("testing list users API", function () {
			
			it("SUCCESS - will return user records", function (done) {
				var params = {};
				requester('admin/listUsers', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.ok(body.data);
					assert.ok(body.data.length > 0);
					done();
				});
			});
			
			it("SUCCESS - search keywords", function (done) {
				var params = {
					qs: {
						keywords: 'smith'
					}
				};
				requester('admin/listUsers', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.ok(body.data);
					assert.ok(body.data.length > 0);
					done();
				});
			});
			
			it("SUCCESS - will return user records", function (done) {
				var params = {qs: {'tId': '10d2cb5fc04ce51e06000001'}};
				requester('admin/listUsers', 'get', params, function (error, body) {
					assert.ifError(error);
					assert.ok(body);
					
					assert.ok(body.data);
					assert.ok(body.data.length > 0);
					done();
				});
			});
			
			it("SUCCESS - will return empty array", function (done) {
				mongo.dropCollection('users', function () {
					var params = {};
					requester('admin/listUsers', 'get', params, function (error, body) {
						assert.ifError(error);
						assert.ok(body);
						
						assert.ok(body.data);
						assert.equal(body.data.length, 0);
						done();
					});
				});
			});
		});
	});
	
});