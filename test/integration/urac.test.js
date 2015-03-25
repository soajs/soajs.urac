"use strict";
var assert = require('assert');
var request = require("request");
var helper = require("../helper.js");
var shell = require('shelljs');

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


describe("importing sample data", function() {
	it("do import", function(done) {
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

describe("simple urac tests", function() {
	var uId;

	afterEach(function(done) {
		console.log("=======================================");
		done();
	});

	describe("testing join API with validation", function() {
		var token;
		var tokenEliane;
		it("FAIL - missing param", function(done) {
			var params = {
				form: {
					"username": 'mike123',
					"password": 'password',
					//"firstName": 'mike',
					//"lastName": 'hajj',
					"email": 'mike@hajj.com'
				}
			};

			requester('join', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.errors);
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: firstName, lastName"});
				console.log(JSON.stringify(body));
				done();
			});
		});

		it("SUCCESS - will join user", function(done) {
			var params = {
				form: {
					"username": 'mike123',
					"password": 'password',
					"firstName": 'mike',
					"lastName": 'hajj',
					"email": 'john.doe@simplifycreation.com'
				}
			};

			requester('join', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				token = body.data;

				setTimeout(function() {
					mongo.findOne('users', {'username': 'mike123', status: 'pendingJoin'}, function(error, record) {
						assert.ifError(error);
						console.log(JSON.stringify(record));
						assert.ok(record);
						done();
					});
				}, 500);
			});
		});
		it("SUCCESS - will join another user", function(done) {
			var params = {
				form: {
					"username": 'eliane2',
					"password": 'password',
					"firstName": 'eliane 2',
					"lastName": 'nassif 2',
					"email": 'eliane2@simplifycreation.com'
				}
			};

			requester('join', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				tokenEliane = body.data;
				//update token record to expire
				mongo.findOne('tokens', {'token': tokenEliane}, function(err, tokenRecord) {
					if(err || !tokenRecord) {
					}
					var t = new Date(1426087819320);
					
					tokenRecord.expires = t;
					console.log(tokenRecord);
					mongo.save('tokens', tokenRecord, function(err) {
						console.log(tokenRecord);
					});
				});

				mongo.findOne('users', {'username': 'eliane2', status: 'pendingJoin'}, function(error, record) {
					assert.ifError(error);
					console.log(JSON.stringify(record));
					assert.ok(record);
					done();
				});

			});
		});

		it("FAIL - user exists", function(done) {
			var params = {
				form: {
					"username": 'mike123',
					"password": 'password',
					"firstName": 'mike',
					"lastName": 'hajj',
					"email": 'mike@hajj.com'
				}
			};

			requester('join', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.errors);
				assert.deepEqual(body.errors.details[0], {"code": 402, "message": "User account already exists."});
				console.log(JSON.stringify(body));
				done();
			});
		});

		it("FAIL - missing validation params", function(done) {
			var params = {
				qs: {}
			};

			requester('join/validate', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.errors);
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: token"});
				console.log(JSON.stringify(body));
				done();
			});
		});

		it("SUCCESS - will validate join user", function(done) {
			var params = {
				qs: {
					"token": token
				}
			};

			requester('join/validate', 'get', params, function(error, body) {
				assert.ifError(error);
				console.log(JSON.stringify(body));
				assert.ok(body);
				assert.ok(body.data);
				//assert.deepEqual(body.errors.details[0], {"code": 302, "message": "Missing required field: token"});
				done();
			});
		});
		
		it("Fail - will not validate join user", function(done) {
			var params = {
				qs: {
					"token": tokenEliane
				}
			};

			requester('join/validate', 'get', params, function(error, body) {
				assert.ifError(error);
				console.log(JSON.stringify(body));
				assert.ok(body);
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});
		
	});

	describe("testing join API without validation", function() {
		it("change service tenant configuration, set validate to false", function(done) {

			var options = {
				uri: 'http://localhost:5001/loadProvision',
				headers: {
					key: extKey
				}
			};

			mongoProvisioning.findOne('tenants', {'applications.keys.extKeys.extKey': extKey}, function(error, provisioning) {
				assert.ifError(error);
				provisioning.applications[0].keys[0].config.dev.urac.validateJoin = false;

				mongoProvisioning.save('tenants', provisioning, function(error) {
					assert.ifError(error);
					request.get(options, function(error, response, body) {
						assert.ifError(error);
						assert.ok(body);
						done();
					});
				});
			});
		});

		it("drop the collection and join the user again without validation", function(done) {
			var params = {
				form: {
					"username": 'mike123',
					"password": 'password',
					"firstName": 'mike',
					"lastName": 'hajj',
					"email": 'john.doe@simplifycreation.com'
				}
			};

			mongo.dropCollection('users', function() {
				mongo.dropCollection('tokens', function() {

					requester('join', 'post', params, function(error, body) {
						assert.ifError(error);
						assert.ok(body);
						assert.ok(body.data);
						console.log(body);

						mongo.findOne('users', {'username': 'mike123', 'status': 'active'}, function(error, record) {
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

	describe("testing login API", function() {
		it("FAIL - missing params", function(done) {
			var params = {
				form: {
					"username": 'mike123'
					//"password": 'password'
				}
			};

			requester('login', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: password"});
				console.log(JSON.stringify(body));
				done();
			});
		});

		it("FAIL - user not found", function(done) {
			var params = {
				form: {
					"username": 'unknownuser',
					"password": 'password'
				}
			};

			requester('login', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 401, "message": "Unable to log in the user. User not found."});
				done();
			});
		});

		it("FAIL - wrong login password", function(done) {
			var params = {
				form: {
					"username": 'mike123',
					"password": 'paword12'
				}
			};

			requester('login', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 400, "message": "Problem with the provided password."});
				done();
			});
		});

		it("SUCCESS - will login user", function(done) {
			var params = {
				form: {
					"username": 'mike123',
					"password": 'password'
				}
			};

			requester('login', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				done();
			});
		});

		it("SUCCESS - will login user with email instead of username", function(done) {
			var params = {
				form: {
					"username": 'john.doe@simplifycreation.com',
					"password": 'password'
				}
			};

			requester('login', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				done();
			});
		});
	});

	describe("testing logout API", function() {
		it("FAIL - missing params", function(done) {
			var params = {
				qs: {
					//"username": 'mike123'
				}
			};

			requester('logout', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: username"});
				done();
			});
		});

		it("FAIL - user not found", function(done) {
			var params = {
				qs: {
					"username": 'unknown'
				}
			};

			requester('logout', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 404, "message": "Unable to logout the user. User not found."});
				done();
			});
		});

		it("SUCCESS - will logout user", function(done) {
			var params = {
				qs: {
					"username": 'mike123'
				}
			};

			requester('logout', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				done();
			});
		});

		it("SUCCESS - will logout user using email instead of username", function(done) {
			var params1 = {
				form: {
					"username": 'john.doe@simplifycreation.com',
					"password": 'password'
				}
			};

			requester('login', 'post', params1, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);

				var params2 = {
					qs: {
						"username": 'john.doe@simplifycreation.com'
					}
				};
				requester('logout', 'get', params2, function(error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.ok(body.data);
					done();
				});
			});
		});
	});

	describe("testing add user API", function() {
		var myNewToken;
		var elianeAdd_Token;
		it("FAIL - missing parameters", function(done) {
			var params = {
				form: {
					'firstName': 'mike',
					'lastName': 'hajj',
					'email': 'john.doe@simplifycreation.com'
				}
			};
			requester('admin/addUser', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: username"});
				done();
			});
		});
		
		it("SUCCESS - will add user", function(done) {
			var params = {
				form: {
					'username': 'mikehajj',
					'firstName': 'mike',
					'lastName': 'hajj',
					'email': 'john.doe@simplifycreation.com'
				}
			};
			requester('admin/addUser', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				myNewToken = body.data;
				mongo.findOne("users", {'username': 'mikehajj'}, function(error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					assert.equal(userRecord.status, 'pendingNew');
					mongo.findOne('tokens', {'username': 'mikehajj'}, function(error, tokenRecord) {
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

		it("SUCCESS - will add user with profile - no mail ", function(done) {
			var params = {
				headers: {
					'key': extKey_noMail
				},
				form: {
					'username': 'eliane',
					'firstName': 'eliane',
					'lastName': 'nassif',
					'email': 'nassif.eliane@gmail.com',
					'profile': '{"gender":"female"}'
				}
			};
			requester('admin/addUser', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				elianeAdd_Token = body.data;
				mongo.findOne("users", {'username': 'eliane'}, function(error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					assert.equal(userRecord.status, 'pendingNew');
					mongo.findOne('tokens', {'username': 'eliane'}, function(error, tokenRecord) {
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
		it("SUCCESS - will validate second user and set a password", function(done) {
			var params = {
				headers: {
					'key': extKey_noMail
				},
				qs: {
					"token": elianeAdd_Token
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};

			requester('resetPassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				mongo.findOne('tokens', {'username': 'eliane', 'service': 'addUser'}, function(error, tokenRecord) {
					assert.ifError(error);
					assert.ok(tokenRecord);
					console.log(tokenRecord);
					assert.equal(tokenRecord.status, 'used');
					assert.equal(tokenRecord.service, 'addUser');

					mongo.findOne('users', {'username': 'eliane'}, function(error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						console.log(userRecord);
						assert.equal(userRecord.status, 'active');
						done();
					});
				});
			});
		});
		
		it("FAIL - will try add user invalid JSON profile", function(done) {
			var params = {
				form: {
					'username': 'eliane1',
					'firstName': 'eliane',
					'lastName': 'nassif',
					'email': 'nassif.eliane@gmail.com',
					'profile': '{"gender":"female"'
				}
			};
			requester('admin/addUser', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 413, "message": "Invalid profile field provided. Profile should be a stringified object."});
				done();
			});
		});

		it("SUCCESS - will validate add user and set a password", function(done) {
			var params = {
				qs: {
					"token": myNewToken
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};

			requester('resetPassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				mongo.findOne('tokens', {'username': 'mikehajj', 'service': 'addUser'}, function(error, tokenRecord) {
					assert.ifError(error);
					assert.ok(tokenRecord);
					console.log(tokenRecord);
					assert.equal(tokenRecord.status, 'used');
					assert.equal(tokenRecord.service, 'addUser');

					mongo.findOne('users', {'username': 'mikehajj'}, function(error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						console.log(userRecord);
						assert.equal(userRecord.status, 'active');
						done();
					});
				});
			});
		});
		
		it("FAIL - username exists for another account", function(done) {
			var params = {
				form: {
					'username': 'mike123',
					'firstName': 'mike',
					'lastName': 'hajj',
					'email': 'john.doe@simplifycreation.com'
				}
			};
			requester('admin/addUser', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 402, "message": "User account already exists."});
				done();
			});
		});
		
	});

	describe("testing forgotPassword and resetPassword API", function() {
		var token;
		var fp_tokenEliane;
		it("FAIL - forgotPassword missing params", function(done) {
			var params = {
				qs: {
					"username": 'mike123'
				}
			};

			requester('forgotPassword', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: email"});
				done();
			});
		});

		it("FAIL - forgotPassword invalid user", function(done) {
			var params = {
				qs: {
					"username": 'invaliduser',
					'email': 'john.doe@simplifycreation.com'
				}
			};

			requester('forgotPassword', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});

		it("SUCCESS - forgotPassword - forgot password request - no mail", function(done) {
			var params = {
				headers: {
					'key': extKey_noMail
				},
				qs: {
					"username": 'eliane',
					'email': 'nassif.eliane@gmail.com'
				}
			};

			requester('forgotPassword', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				fp_tokenEliane = body.data;
				mongo.findOne('tokens', {'token': fp_tokenEliane}, function(err, tokenRecord) {
					if(err || !tokenRecord) {
					}
					var t = new Date(1426087819320);
					
					tokenRecord.expires = t;
					console.log(tokenRecord);
					mongo.save('tokens', tokenRecord, function(err) {
						console.log(tokenRecord);
					});
				});
				
				done();
			});
		});

		it("SUCCESS - forgotPassword should start forgot password request", function(done) {
			var params = {
				qs: {
					"username": 'mike123',
					'email': 'john.doe@simplifycreation.com'
				}
			};

			requester('forgotPassword', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				token = body.data;
				done();
			});
		});

		it("SUCCESS - forgotPassword should redo forgot password request", function(done) {
			var params = {
				qs: {
					"username": 'mike123',
					'email': 'john.doe@simplifycreation.com'
				}
			};

			requester('forgotPassword', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				token = body.data;
				mongo.find('tokens', {'username': 'mike123'}, {'sort': {'ts': 1}}, function(error, records) {
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


		it("FAIL - resetPassword missing params", function(done) {
			var params = {
				qs: {
					"token": token
				},
				form: {"password": "newPassword"}
			};

			requester('resetPassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: confirmation"});
				done();
			});
		});

		it("FAIL - resetPassword passsword mismatch", function(done) {
			var params = {
				qs: {
					"token": token
				},
				form: {
					"password": "newPassword",
					"confirmation": "password"
				}
			};

			requester('resetPassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 408, "message": "The password and its confirmation do not match"});
				done();
			});
		});

		it("FAIL - resetPassword invalid token", function(done) {
			var params = {
				qs: {
					"token": "invalidTokenProvided"
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};

			requester('resetPassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});
		
		it("FAIL - resetPassword token expired", function(done) {
			var params = {
				qs: {
					"token": fp_tokenEliane
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};

			requester('resetPassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});
		
		it("SUCCESS - resetPassword will reset the password", function(done) {
			var params = {
				qs: {
					"token": token
				},
				form: {
					"password": "newPassword",
					"confirmation": "newPassword"
				}
			};

			requester('resetPassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				token = body.data;
				mongo.find('tokens', {'username': 'mike123'}, {'sort': {'ts': 1}}, function(error, records) {
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

	describe("testing getUser API", function() {
		it("FAIL - missing params", function(done) {
			var params = {
				qs: {}
			};

			requester('account/getUser', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: username"});
				done();
			});
		});

		it("FAIL - invalid account", function(done) {
			var params = {
				qs: {
					"username": 'invalid'
				}
			};

			requester('account/getUser', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 405, "message": "Unable to find User. Please try again."});
				done();
			});
		});

		it("SUCCESS - returns user record", function(done) {
			var params = {
				qs: {
					"username": 'mike123'
				}
			};

			requester('account/getUser', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				delete body.data.password;
				delete body.data.ts;
				delete body.data._id;
				assert.deepEqual(body.data, {
					"username": "mike123",
					"firstName": "mike",
					"lastName": "hajj",
					"email": "john.doe@simplifycreation.com",
					"status": "active",
					"groups": [],
					'profile': {},
					'config': {
						'packages': {},
						'keys': {}
					}
				});
				done();
			});
		});
	});

	describe("testing change password API", function() {
		it("FAIL - missing parameters", function(done) {
			var params = {
				qs: {},
				form: {
					'oldPassword': 'myPassword',
					'password': 'myPassword',
					'confirmation': 'myPassword'
				}
			};

			requester('account/changePassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: uId"});
				done();
			});
		});

		it("FAIL - password mismatch", function(done) {
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

			requester('account/changePassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 408, "message": "The password and its confirmation do not match"});
				done();
			});
		});

		it("FAIL - invalid user id", function(done) {
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

			requester('account/changePassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 411, "message": "invalid user id provided"});
				done();
			});
		});

		it("FAIL - invalid user account", function(done) {
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

			requester('account/changePassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 405, "message": "Unable to find User. Please try again."});
				done();
			});
		});

		it("FAIL - old password mismatch", function(done) {
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

			requester('account/changePassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 409, "message": "Invalid old password provided"});
				done();
			});
		});

		it("SUCCESS - will update user password", function(done) {
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

			requester('account/changePassword', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				done();
			});
		});
	});

	describe("testing change email API", function() {
		var newToken;
		var changeEmailToken;
		it("FAIL - missing params", function(done) {
			var params = {
				form: {
					'email': 'john.doe@simplifycreation.com'
				}
			};
			requester('account/changeEmail', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: uId"});
				done();
			});
		});

		it("FAIL - invalid user provided", function(done) {
			var params = {
				qs: {
					'uId': 'aaaabbbbccccdddd'
				},
				form: {
					'email': 'john.doe@simplifycreation.com'
				}
			};
			requester('account/changeEmail', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 411, "message": "invalid user id provided"});
				done();
			});
		});

		it("FAIL - same email provided", function(done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'email': 'john.doe@simplifycreation.com'
				}
			};
			requester('account/changeEmail', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 412, "message": "You have provided the same existing email address"});
				done();
			});
		});

		it("SUCCESS - change email request created", function(done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'email': 'mike2.hajj2@gmail.com'
				}
			};
			requester('account/changeEmail', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				console.log(JSON.stringify(body));
				mongo.findOne('tokens', {'username': 'mike123', 'service': 'changeEmail', 'status': 'active'}, function(error, token) {
					assert.ifError(error);
					assert.ok(token);
					assert.equal(token.email, params.form.email);
					assert.equal(token.status, 'active');
				});
				done();
			});
		});

		it("SUCCESS - change email request again", function(done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'email': 'mike2.hajj2@gmail.com'
				}
			};
			requester('account/changeEmail', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				console.log(JSON.stringify(body));
				newToken = body.data;
				mongo.find('tokens', {'username': 'mike123', 'service': 'changeEmail'}, {'sort': {'ts': 1}}, function(error, tokens) {
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



		it("FAIL - do change email fail, missing params", function(done) {
			var params = {
				qs: {}
			};
			requester('changeEmail/validate', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: token"});
				done();
			});
		});

		it("FAIL - do change email fail, invalid token", function(done) {
			var params = {
				qs: {
					'token': 'aaaabbbbccccdddd'
				}
			};
			requester('changeEmail/validate', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});

		it("SUCCESS - do change email verified", function(done) {
			var params = {
				qs: {
					'token': newToken
				}
			};
			requester('changeEmail/validate', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				console.log(JSON.stringify(body));
				mongo.find('tokens', {'username': 'mike123', 'service': 'changeEmail'}, {'sort': {'ts': 1}}, function(error, tokens) {
					assert.ifError(error);
					assert.ok(tokens);
					assert.equal(tokens.length, 2);
					assert.equal(tokens[0].status, 'invalid');
					assert.equal(tokens[1].status, 'used');
					mongo.findOne('users', {'username': 'mike123'}, function(error, userRecord) {
						assert.ifError(error);
						assert.ok(userRecord);
						assert.equal(userRecord.email, tokens[1].email);
						done();
					});
				});
			});
		});


		it("SUCCESS - change email request created - no mail sent", function(done) {
			var params = {
				headers: {
					'key': extKey_noMail
				},
				qs: {
					'uId': uId
				},
				form: {
					'email': 'mike2.hajj2@simplifycreation.com'
				}
			};
			requester('account/changeEmail', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(body);
				assert.ok(body.data);
				changeEmailToken = body.data;

				mongo.findOne('tokens', {'token': changeEmailToken}, function(error, tokenRecord) {
					assert.ifError(error);
					assert.ok(tokenRecord);
					// expire
					assert.equal(tokenRecord.email, params.form.email);
					assert.equal(tokenRecord.status, 'active');
					var t = new Date(1426087819320);
					
					tokenRecord.expires = t;
					mongo.save('tokens', tokenRecord, function(err) {
						console.log(tokenRecord);
					});
					
				});
				done();
			});
		});
		
		it("FAIL - do change email fail - expired token", function(done) {
			var params = {
				qs: {
					'token': changeEmailToken
				}
			};
			requester('changeEmail/validate', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 406, "message": "Invalid or token has expired."});
				done();
			});
		});
		
		it('SUCCESS - manual reset of user email address to receive notifications from remaining APIs tests', function(done) {
			mongo.findOne('users', {'username': 'mike123'}, function(error, userRecord) {
				assert.ifError(error);
				assert.ok(userRecord);
				userRecord.email = "john.doe@simplifycreation.com";
				mongo.save('users', userRecord, function(error) {
					assert.ifError(error);
					done();
				});
			});
		});
	});

	describe("testing edit profile API", function() {
		it("FAIL - missing parameters", function(done) {
			var params = {
				qs: {},
				form: {
					'username': 'mike1234',
					'firstName': 'mike2',
					'lastName': 'hajj2'
				}
			};
			requester('account/editProfile', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: uId"});
				done();
			});
		});

		it("FAIL - invalid user account", function(done) {
			var params = {
				qs: {
					'uId': 'aaabbbcccddd'
				},
				form: {
					'username': 'mike123',
					'firstName': 'mike2',
					'lastName': 'hajj2'
				}
			};

			requester('account/editProfile', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 405, "message": "Unable to find User. Please try again."});
				done();
			});
		});

		it("FAIL - username exists for another acount", function(done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'username': 'user2',
					'firstName': 'mike2',
					'lastName': 'hajj2'
				}
			};
			var secondUserRecord = {
				"username": "user2",
				"password": "someEncryptedPassword",
				"firstName": "user",
				"lastName": "two",
				"email": "user@two.com",
				"status": "active",
				"ts": new Date().getTime()
			};
			mongo.insert('users', secondUserRecord, function(error) {
				assert.ifError(error);
				requester('account/editProfile', 'post', params, function(error, body) {
					assert.ifError(error);
					assert.ok(body);
					console.log(JSON.stringify(body));
					assert.deepEqual(body.errors.details[0], {"code": 410, "message": "username taken, please choose another username"});
					done();
				});
			});
		});

		it("SUCCESS - will update user profile", function(done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'username': 'mike456',
					'firstName': 'mike2',
					'lastName': 'hajj2',
					'profile': '{"age":30}'
				}
			};
			requester('account/editProfile', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				done();
			});
		});

		it("FAIL - will update user profile - invalid JSON", function(done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'username': 'mike456',
					'firstName': 'mike2',
					'lastName': 'hajj2',
					'profile': '{"age":30'
				}
			};
			requester('account/editProfile', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 413, "message": "Invalid profile field provided. Profile should be a stringified object."});
				done();
			});
		});


	});

	describe("testing edit user API", function() {
		it("FAIL - missing params", function(done) {
			var params = {
				form: {
					'firstName': 'mike',
					'lastName': 'hajj',
					'email': 'john.doe@simplifycreation.com',
					'username': 'mikehajj',
					'status': 'active'
				}
			};
			requester('admin/editUser', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: uId"});
				done();
			});
		});

		it("FAIL - invalid user account", function(done) {
			var params = {
				qs: {
					'uId': 'aaaabbbbccccdddd'
				},
				form: {
					'firstName': 'mike',
					'lastName': 'hajj',
					'email': 'john.doe@simplifycreation.com',
					'username': 'mikehajj',
					'status': 'active'
				}
			};
			requester('admin/editUser', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 411, "message": "invalid user id provided"});
				done();
			});
		});

		it("FAIL - username exists for another account", function(done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'firstName': 'mike',
					'lastName': 'hajj',
					'email': 'john.doe@simplifycreation.com',
					'username': 'mikehajj',
					'status': 'active'
				}
			};
			requester('admin/editUser', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 410, "message": "username taken, please choose another username"});
				done();
			});
		});

		it("SUCCESS - will update user account", function(done) {
			var params = {
				qs: {
					'uId': uId
				},
				form: {
					'firstName': 'mike',
					'lastName': 'hajj',
					'email': 'john.doe@simplifycreation.com',
					'username': 'mike123',
					'status': 'active'
				}
			};
			requester('admin/editUser', 'post', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				assert.ok(body.data);
				console.log(JSON.stringify(body));
				mongo.findOne("users", {'username': 'mike123'}, function(error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					delete userRecord.password;
					delete userRecord.ts;
					userRecord._id = userRecord._id.toString();
					assert.deepEqual(userRecord, {
						'firstName': 'mike',
						'lastName': 'hajj',
						'email': 'john.doe@simplifycreation.com',
						'username': 'mike123',
						'status': 'active',
						'_id': uId,
						'groups': [],
						'profile': {
							"age": 30
						},
						'config': {
							'packages': {},
							'keys': {}
						}
					});
					done();
				});
			});
		});
	});

	describe("testing change user status API", function() {
		it("FAIL - missing parameters", function(done) {
			var params = {
				qs: {
					'uId': uId
				}
			};
			requester('admin/changeUserStatus', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 172, "message": "Missing required field: status"});
				done();
			});
		});

		it("FAIL - invalid user account", function(done) {
			var params = {
				qs: {
					'uId': 'abcdabcdabcd',
					'status': 'active'
				}
			};
			requester('admin/changeUserStatus', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.deepEqual(body.errors.details[0], {"code": 405, "message": "Unable to find User. Please try again."});
				done();
			});
		});

		it("FAIL - will approve user", function(done) {
			var params = {
				qs: {
					'uId': uId,
					'status': 'pending'//invalid status
				}
			};
			requester('admin/changeUserStatus', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.equal(body.errors.details[0].code, '173');
				assert.equal(body.errors.details[0].message, "Validation failed for field: status -> The parameter 'status' is not one of enum values: active,inactive");
				done();
			});
		});

		it("SUCCESS - will approve user", function(done) {
			var params = {
				qs: {
					'uId': uId,
					'status': 'active'
				}
			};
			requester('admin/changeUserStatus', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				mongo.findOne('users', {'_id': mongo.ObjectId(uId)}, function(error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					assert.equal(userRecord.status, 'active');
					done();
				});
			});
		});

		it("SUCCESS - will inactivate user", function(done) {
			var params = {
				qs: {
					'uId': uId,
					'status': 'inactive'
				}
			};
			requester('admin/changeUserStatus', 'get', params, function(error, body) {
				assert.ifError(error);
				assert.ok(body);
				console.log(JSON.stringify(body));
				assert.ok(body.data);
				mongo.findOne('users', {'_id': mongo.ObjectId(uId)}, function(error, userRecord) {
					assert.ifError(error);
					assert.ok(userRecord);
					assert.equal(userRecord.status, 'inactive');
					done();
				});
			});
		});

		it("SUCCESS - will activate user - no mail", function(done) {
			var params = {
				headers: {
					'key': extKey_noMail
				},
				qs: {
					'uId': uId,
					'status': 'active'
				}
			};
			requester('admin/changeUserStatus', 'get', params, function(error, body) {
				assert.ifError(error);
				console.log(JSON.stringify(body));
				assert.ok(body);
				assert.ok(body.data);
				done();
			});
		});

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

		it("SUCCESS - will return empty array", function(done) {
			mongo.dropCollection('users', function() {
				var params = {};
				requester('admin/listUsers', 'get', params, function(error, body) {
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

		it("SUCCESS - will create group", function(done) {});
		
		it("SUCCESS - will edit group", function(done) {});
	});
});