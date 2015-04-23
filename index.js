'use strict';
var uuid = require('node-uuid');

var soajs = require('soajs');
var utils = require('soajs/lib/').utils;
var Mongo = soajs.mongo;

var config = require('./config.js');
var Hasher = require("./hasher.js");

var userCollectionName = "users";
var tokenCollectionName = "tokens";
var groupsCollectionName = "groups";
var lodash = require('lodash');

var service = new soajs.server.service({
	"oauth": false,
	"session": true,
	"security": true,
	"multitenant": true,
	"acl": true,
	"config": config
});

service.init(function() {
	function login(req, cb) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		var criteria = {'username': req.soajs.inputmaskData['username'], 'status': 'active'};
		var pattern = req.soajs.validator.SchemaPatterns.email;
		if(pattern.test(req.soajs.inputmaskData['username'])) {
			delete criteria.username;
			criteria.email = req.soajs.inputmaskData['username'];
		}

		mongo.findOne(userCollectionName, criteria, function(err, record) {
			if(record) {
				var hasher = new Hasher({

					"hashIterations": req.soajs.servicesConfig.urac.hashIterations || config.hashIterations,
					"seedLength": req.soajs.servicesConfig.urac.seedLength || config.seedLength
				});
				hasher.compare(req.soajs.inputmaskData.password, record.password, function(err, response) {
					if(err || !response) {
						return cb(400);
					}
					delete record.password;
					return cb(null, record);
				});
			} else {
				return cb(401);
			}
		});
	}

	function sendMail(apiName, req, data, cb) {
		var transportConfiguration = req.soajs.servicesConfig.mail.transport || null;
		var mailer = new (soajs.mail)(transportConfiguration);

		data.limit = req.soajs.servicesConfig.urac.tokenExpiryTTL / 3600;

		var mailOptions = {
			'to': data.email,
			'from': req.soajs.servicesConfig.mail.from,
			'subject': req.soajs.servicesConfig.urac.mail[apiName].subject,
			'data': data
		};
		if(req.soajs.servicesConfig.urac.mail[apiName].content) {
			mailOptions.content = req.soajs.servicesConfig.urac.mail[apiName].content;
		} else {
			mailOptions.path = req.soajs.servicesConfig.urac.mail[apiName].path;
		}
		delete data.password;
		delete data._id;

		mailer.send(mailOptions, cb);
	}

	function addTokenToLink(link, token) {
		link += (link.indexOf("?") === -1) ? '?token=' + token : "&token=" + token;
		return link;
	}

	service.post("/login", function(req, res) {
		login(req, function(err, record) {
			if(err) {
				return res.jsonp(req.soajs.buildResponse({"code": err, "msg": config.errors[err]}));
			} else {
				var cloneRecord = utils.cloneObj(record);
				req.soajs.session.setURAC(cloneRecord, function(err) {
					if(err) {
						return res.jsonp(req.soajs.buildResponse({"code": 401, "msg": config.errors[401]}));
					}

					if(record.config && record.config.packages) {
						delete record.config.packages;
					}
					if(record.config && record.config.keys) {
						delete record.config.keys;
					}
					return res.jsonp(req.soajs.buildResponse(null, record));
				});
			}
		});
	});

	service.get("/logout", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		var criteria = {'username': req.soajs.inputmaskData['username'], 'status': 'active'};
		var pattern = req.soajs.validator.SchemaPatterns.email;
		if(pattern.test(req.soajs.inputmaskData['username'])) {
			delete criteria.username;
			criteria.email = req.soajs.inputmaskData['username'];
		}
		mongo.findOne(userCollectionName, criteria, function(err, record) {
			if(err) {
				return res.jsonp(req.soajs.buildResponse({"code": 404, "msg": config.errors[404]}));
			}

			if(!record) {
				return res.jsonp(req.soajs.buildResponse({"code": 404, "msg": config.errors[404]}));
			}

			req.soajs.session.clearURAC(function(err) {
				if(err) {
					return res.jsonp(req.soajs.buildResponse({"code": 404, "msg": config.errors[404]}));
				}

				return res.jsonp(req.soajs.buildResponse(null, true));
			});
		});
	});

	service.get("/forgotPassword", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		mongo.findOne(userCollectionName, {
			'username': req.soajs.inputmaskData['username'],
			'email': req.soajs.inputmaskData['email'],
			'status': 'active'
		}, function(err, userRecord) {

			if(err) {
				return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
			}

			if(!userRecord) {
				return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
			}

			var tokenRecord = {
				'username': userRecord.username,
				'token': uuid.v4(),
				'expires': new Date(new Date().getTime() + req.soajs.servicesConfig.urac.tokenExpiryTTL),
				'status': 'active',
				'ts': new Date().getTime(),
				'service': 'forgotPassword'
			};

			mongo.update(tokenCollectionName, {
				'username': userRecord.username,
				'service': 'forgotPassword',
				'status': 'active'
			}, {'$set': {'status': 'invalid'}}, function(err) {
				if(err) {
					return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
				}

				mongo.insert(tokenCollectionName, tokenRecord, function(err) {

					if(err) {
						return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
					}

					if(req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.forgotPassword) {
						//send an email to the user
						var data = userRecord;
						data.link = {
							forgotPassword: addTokenToLink(req.soajs.servicesConfig.urac.link.forgotPassword, tokenRecord.token)
						};

						sendMail('forgotPassword', req, data, function(error) {
							if(error) {
								req.soajs.log.error(error);
							}
							return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
						});
					} else {
						return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
					}
				});
			});
		});
	});

	service.post("/resetPassword", function(req, res) {
		//validate that the password and its confirmation match
		if(req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}

		var hasher = new Hasher({
			"hashIterations": req.soajs.servicesConfig.urac.hashIterations || config.hashIterations,
			"seedLength": req.soajs.servicesConfig.urac.seedLength || config.seedLength
		});
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		//get token
		mongo.findOne(tokenCollectionName, {
			'token': req.soajs.inputmaskData['token'],
			'service': {'$in': ['forgotPassword', 'addUser']},
			status: 'active'
		}, function(err, tokenRecord) {
			if(err || !tokenRecord) {
				return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
			}

			//check if token expired
			if(new Date(tokenRecord.expires).getTime() < new Date().getTime()) {
				return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
			}

			//get user record
			mongo.findOne(userCollectionName, {'username': tokenRecord.username}, function(error, userRecord) {
				if(error || !userRecord) {
					return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
				}

				//update token status
				tokenRecord.status = 'used';

				//hash the password and update user record status
				userRecord.status = 'active';
				userRecord.password = hasher.hashSync(req.soajs.inputmaskData['password']);

				//save token in database
				mongo.save(tokenCollectionName, tokenRecord, function(err) {
					if(err) {
						return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
					}

					//save user record in database
					mongo.save(userCollectionName, userRecord, function(err) {
						if(err) {
							return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
						}

						return res.jsonp(req.soajs.buildResponse(null, true));
					});
				});
			});
		});
	});

	service.post("/join", function(req, res) {
		var requireValidation = req.soajs.servicesConfig.urac.validateJoin;

		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		mongo.findOne(userCollectionName, {$or: [{'username': req.soajs.inputmaskData['username']}, {'email': req.soajs.inputmaskData['email']}]}, function(err, record) {
			if(err) {
				return res.jsonp(req.soajs.buildResponse({"code": 403, "msg": config.errors[403]}));
			}

			//user exits
			if(record) {
				return res.jsonp(req.soajs.buildResponse({"code": 402, "msg": config.errors[402]}));
			}

			//add user
			var hasher = new Hasher({
				"hashIterations": req.soajs.servicesConfig.urac.hashIterations || config.hashIterations,
				"seedLength": req.soajs.servicesConfig.urac.seedLength || config.seedLength
			});
			//hash the password

			var userRecord = {
				"username": req.soajs.inputmaskData['username'],
				"password": hasher.hashSync(req.soajs.inputmaskData['password']), //encrypt the password
				"firstName": req.soajs.inputmaskData['firstName'],
				"lastName": req.soajs.inputmaskData['lastName'],
				"email": req.soajs.inputmaskData['email'],
				'status': (requireValidation) ? 'pendingJoin' : 'active',
				'ts': new Date().getTime(),
				'groups': [],
				'profile': {},
				'config': {
					'packages': {},
					'keys': {}
				}
			};
			//add record in db
			mongo.insert(userCollectionName, userRecord, function(err, record) {
				if(err || !record) {
					return res.jsonp(req.soajs.buildResponse({"code": 403, "msg": config.errors[403]}));
				}

				//no validation needed stop and return
				if(requireValidation && req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.join) {
					var tokenRecord = {
						'username': userRecord.username,
						'token': uuid.v4(),
						'expires': new Date(new Date().getTime() + req.soajs.servicesConfig.urac.tokenExpiryTTL),
						'status': 'active',
						'ts': new Date().getTime(),
						'service': 'join'
					};
					mongo.insert(tokenCollectionName, tokenRecord, function(err) {
						if(err) {
							return res.jsonp(req.soajs.buildResponse({"code": 403, "msg": config.errors[403]}));
						}

						//send an email to the user
						var data = userRecord;
						data.link = {
							join: addTokenToLink(req.soajs.servicesConfig.urac.link.join, tokenRecord.token)
						};
						sendMail('join', req, data, function(error) {
							if(error) {
								req.soajs.log.error(error);
							}
							return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
						});
					});
				} else {
					return res.jsonp(req.soajs.buildResponse(null, true));
				}
			});
		});
	});

	service.get("/join/validate", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));

		//get token
		mongo.findOne(tokenCollectionName, {
			'token': req.soajs.inputmaskData['token'],
			'service': 'join',
			status: 'active'
		}, function(err, tokenRecord) {
			if(err || !tokenRecord) {
				return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
			}

			//check if token expired
			if(new Date(tokenRecord.expires).getTime() < new Date().getTime()) {
				return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
			}

			//get user record
			mongo.findOne(userCollectionName, {
				'username': tokenRecord.username,
				'status': 'pendingJoin'
			}, function(error, userRecord) {
				if(error || !userRecord) {
					return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
				}

				//update token status
				tokenRecord.status = 'used';
				userRecord.status = 'active';

				//save token in database
				mongo.save(tokenCollectionName, tokenRecord, function(err) {
					if(err) {
						return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
					}

					//save user record in database
					mongo.save(userCollectionName, userRecord, function(err) {
						if(err) {
							return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
						}

						return res.jsonp(req.soajs.buildResponse(null, true));
					});
				});
			});
		});
	});

	service.get("/account/getUser", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		mongo.findOne(userCollectionName, {
			'username': req.soajs.inputmaskData['username'],
			'status': 'active'
		}, function(err, record) {
			if(err || !record) {
				return res.jsonp(req.soajs.buildResponse({"code": 405, "msg": config.errors[405]}));
			}

			delete record.password;
			return res.jsonp(req.soajs.buildResponse(null, record));
		});
	});

	service.post("/account/changePassword", function(req, res) {

		//validate that the password and its confirmation match
		if(req.soajs.inputmaskData['password'] !== req.soajs.inputmaskData['confirmation']) {
			return res.jsonp(req.soajs.buildResponse({"code": 408, "msg": config.errors[408]}));
		}

		//check if user account is there
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		var userId;
		try {
			userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
		} catch(e) {
			return res.jsonp(req.soajs.buildResponse({"code": 411, "msg": config.errors[411]}));
		}

		mongo.findOne(userCollectionName, {'_id': userId}, function(err, userRecord) {
			if(err || !userRecord) {
				return res.jsonp(req.soajs.buildResponse({"code": 405, "msg": config.errors[405]}));
			}

			//check if old password matches db record
			var hasher = new Hasher({
				"hashIterations": req.soajs.servicesConfig.urac.hashIterations || config.hashIterations,
				"seedLength": req.soajs.servicesConfig.urac.seedLength || config.seedLength
			});
			hasher.compare(req.soajs.inputmaskData['oldPassword'], userRecord.password, function(err, response) {
				if(err || !response) {
					req.soajs.log.error(err);
					return res.jsonp(req.soajs.buildResponse({"code": 409, "msg": config.errors[409]}));
				} else {
					//hash new password, update record and save
					userRecord.password = hasher.hashSync(req.soajs.inputmaskData['password']);
					mongo.save(userCollectionName, userRecord, function(err) {
						if(err) {
							return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
						}

						return res.jsonp(req.soajs.buildResponse(null, true));
					});
				}
			});
		});
	});

	service.post("/account/changeEmail", function(req, res) {

		//check if user account is there
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		var userId;
		try {
			userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
		} catch(e) {
			return res.jsonp(req.soajs.buildResponse({"code": 411, "msg": config.errors[411]}));
		}
		mongo.findOne(userCollectionName, {'_id': userId}, function(err, userRecord) {
			if(err || !userRecord) {
				return res.jsonp(req.soajs.buildResponse({"code": 405, "msg": config.errors[405]}));
			}

			if(userRecord.email === req.soajs.inputmaskData['email']) {
				return res.jsonp(req.soajs.buildResponse({"code": 412, "msg": config.errors[412]}));
			}

			//create new token
			var tokenRecord = {
				'username': userRecord.username,
				'token': uuid.v4(),
				'expires': new Date(new Date().getTime() + req.soajs.servicesConfig.urac.tokenExpiryTTL),
				'status': 'active',
				'ts': new Date().getTime(),
				'service': 'changeEmail',
				'email': req.soajs.inputmaskData['email']
			};

			//set the old tokens to invalid
			mongo.update(tokenCollectionName, {
				'username': userRecord.username,
				'service': 'changeEmail',
				'status': 'active'
			}, {'$set': {'status': 'invalid'}}, function(err) {
				if(err) {
					return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
				}

				//insert newly created token
				mongo.insert(tokenCollectionName, tokenRecord, function(err) {
					if(err) {
						return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
					}

					//email notification
					if(req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.changeEmail) {
						//send an email to the user
						var data = JSON.parse(JSON.stringify(userRecord));
						data.email = req.soajs.inputmaskData['email'];
						data.link = {
							changeEmail: addTokenToLink(req.soajs.servicesConfig.urac.link.changeEmail, tokenRecord.token)
						};

						sendMail('changeEmail', req, data, function(error) {
							if(error) {
								req.soajs.log.error(error);
							}
							return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
						});
					} else {
						return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
					}
				});
			});
		});
	});

	service.get("/changeEmail/validate", function(req, res) {
		//check if user account is there
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		mongo.findOne(tokenCollectionName, {
			'token': req.soajs.inputmaskData['token'],
			'service': 'changeEmail',
			status: 'active'
		}, function(err, tokenRecord) {
			if(err || !tokenRecord) {
				return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
			}

			//check if token expired
			if(new Date(tokenRecord.expires).getTime() < new Date().getTime()) {
				return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
			}

			//get user record
			mongo.findOne(userCollectionName, {'username': tokenRecord.username}, function(error, userRecord) {
				if(error || !userRecord) {
					return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
				}

				//update token status
				tokenRecord.status = 'used';

				//update user record email
				userRecord.email = tokenRecord.email;

				//save token in database
				mongo.save(tokenCollectionName, tokenRecord, function(err) {
					if(err) {
						return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
					}

					//save user record in database
					mongo.save(userCollectionName, userRecord, function(err) {
						if(err) {
							return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
						}

						return res.jsonp(req.soajs.buildResponse(null, true));
					});
				});
			});
		});
	});

	service.get("/admin/listUsers", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		mongo.find(userCollectionName, {}, {}, function(err, userRecords) {
			if(err || !userRecords) {
				return res.jsonp(req.soajs.buildResponse({"code": 405, "msg": config.errors[405]}));
			}

			//if no records return empty array
			if(userRecords.length === 0) {
				return res.jsonp(req.soajs.buildResponse(null, []));
			}

			//loop in records and remove the passwords
			userRecords.forEach(function(oneUserRecord) {
				delete oneUserRecord.password;
			});

			return res.jsonp(req.soajs.buildResponse(null, userRecords));
		});
	});

	service.get("/admin/getUser", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		var userId;
		try {
			userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
		} catch(e) {
			return res.jsonp(req.soajs.buildResponse({"code": 411, "msg": config.errors[411]}));
		}

		mongo.findOne(userCollectionName,{'_id': userId}, function(err, userRecord) {
			if(err || !userRecord) {
				return res.jsonp(req.soajs.buildResponse({"code": 405, "msg": config.errors[405]}));
			}
			delete userRecord.password;
			return res.jsonp(req.soajs.buildResponse(null, userRecord));
		});
	});

	function getRandomString(length) {
		function getLetter() {
			var start = process.hrtime()[1] % 2 === 0 ? 97 : 65;
			return String.fromCharCode(Math.floor((start + Math.random() * 26)));
		}

		function getNumber() {
			return String.fromCharCode(Math.floor((48 + Math.random() * 10)));
		}

		length = length || Math.ceil(Math.random() * config.maxStringLimit);
		var qs = '';

		while(length) {
			qs += process.hrtime()[1] % 2 === 0 ? getLetter() : getNumber();
			length--;
		}

		return qs.replace(/\s/g, '_');
	}

	service.post("/admin/addUser", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		mongo.findOne(userCollectionName, {'username': req.soajs.inputmaskData['username']}, function(err, record) {
			if(err) {
				return res.jsonp(req.soajs.buildResponse({"code": 414, "msg": config.errors[414]}));
			}

			//user exits
			if(record) {
				return res.jsonp(req.soajs.buildResponse({"code": 402, "msg": config.errors[402]}));
			}

			//add user
			var hasher = new Hasher({
				"hashIterations": req.soajs.servicesConfig.urac.hashIterations || config.hashIterations,
				"seedLength": req.soajs.servicesConfig.urac.seedLength || config.seedLength
			});
			//hash the password

			var userRecord = {
				"username": req.soajs.inputmaskData['username'],
				"password": hasher.hashSync(getRandomString(12)), //encrypt a random password
				"firstName": req.soajs.inputmaskData['firstName'],
				"lastName": req.soajs.inputmaskData['lastName'],
				"email": req.soajs.inputmaskData['email'],
				'status': 'pendingNew',
				"config":{},
				'ts': new Date().getTime()
			};
			if(req.soajs.inputmaskData['profile']) {
				try {
					userRecord.profile = JSON.parse(req.soajs.inputmaskData['profile']);
				}
				catch(e) {
					return res.jsonp(req.soajs.buildResponse({"code": 413, "msg": config.errors[413]}));
				}
			}
			if(req.soajs.inputmaskData['groups']) {
				userRecord.groups = req.soajs.inputmaskData['groups'];
			}
			//add record in db
			mongo.insert(userCollectionName, userRecord, function(err) {
				if(err) {
					return res.jsonp(req.soajs.buildResponse({"code": 403, "msg": config.errors[403]}));
				}

				//create notification email
				var tokenRecord = {
					'username': userRecord.username,
					'token': uuid.v4(),
					'expires': new Date(new Date().getTime() + req.soajs.servicesConfig.urac.tokenExpiryTTL),
					'status': 'active',
					'ts': new Date().getTime(),
					'service': 'addUser'
				};
				mongo.insert(tokenCollectionName, tokenRecord, function(err) {
					if(err) {
						return res.jsonp(req.soajs.buildResponse({"code": 403, "msg": config.errors[403]}));
					}

					if(req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.addUser) {

						var data = userRecord;
						data.link = {
							addUser: addTokenToLink(req.soajs.servicesConfig.urac.link.addUser, tokenRecord.token)
						};

						sendMail('addUser', req, data, function(error) {
							if(error) {
								req.soajs.log.error(error);
							}
							return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
						});
					} else {
						return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
					}
				});
			});
		});
	});

	service.get("/admin/changeUserStatus", function(req, res) {
		//check if user account is there
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		var userId;
		try {
			userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
		} catch(e) {
			return res.jsonp(req.soajs.buildResponse({"code": 411, "msg": config.errors[411]}));
		}

		//get user database record
		var criteria = {
			'_id': userId, 'locked': {$ne: true}
		};
		/* $ne selects the documents where the value of the field is not equal (i.e. !=) to the specified value.
		 * This includes documents that do not contain the field. */
		mongo.findOne(userCollectionName, criteria, function(err, userRecord) {
			if(err || !userRecord) {
				return res.jsonp(req.soajs.buildResponse({"code": 405, "msg": config.errors[405]}));
			}
			//update record entries
			userRecord.status = req.soajs.inputmaskData['status'];

			//update record in the database
			mongo.save(userCollectionName, userRecord, function(err) {
				if(err) {
					return res.jsonp(req.soajs.buildResponse({"code": 407, "msg": config.errors[407]}));
				}

				if(req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.changeUserStatus) {
					sendMail('changeUserStatus', req, userRecord, function(error) {
						if(error) {
							req.soajs.log.error(error);
						}
						return res.jsonp(req.soajs.buildResponse(null, true));
					});
				} else {
					return res.jsonp(req.soajs.buildResponse(null, true));
				}
			});
		});
	});

	function updateUserRecord(req, complete, cb) {
		//check if user account is there
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		var userId;
		try {
			userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
		} catch(e) {
			return cb({"code": 411, "msg": config.errors[411]});
		}
		mongo.findOne(userCollectionName, {'_id': userId}, function(err, userRecord) {
			if(err || !userRecord) {
				return cb({"code": 405, "msg": config.errors[405]});
			}

			//check if username is taken by another account
			mongo.count(userCollectionName, {
				'_id': {'$ne': userId},
				'username': req.soajs.inputmaskData['username']
			}, function(err, count) {
				if(err) {
					return cb({"code": 407, "msg": config.errors[407]});
				}

				//if count > 0 then this username is taken by another account, return error
				if(count > 0) {
					return cb({"code": 410, "msg": config.errors[410]});
				}

				//update record entries
				userRecord.username = req.soajs.inputmaskData['username'];
				userRecord.firstName = req.soajs.inputmaskData['firstName'];
				userRecord.lastName = req.soajs.inputmaskData['lastName'];
				//console.log(req.soajs.inputmaskData);

				if(complete) {
					userRecord.email = req.soajs.inputmaskData['email'];
					// cannot change status or groups of the locked user
					if(!userRecord.locked)
					{
						if( req.soajs.inputmaskData['config'] )
						{
							var configObj = req.soajs.inputmaskData['config'];
							if( typeof(userRecord.config) !=='object')
							{
								userRecord.config={};
							}
							if(configObj.packages)
							{
								userRecord.config.packages = configObj.packages;
							}
						}

						userRecord.status = req.soajs.inputmaskData['status'];
						if(req.soajs.inputmaskData['groups']) {
							userRecord.groups = req.soajs.inputmaskData['groups'];
						} else {
							userRecord.groups = [];
						}
					}
				}

				if(req.soajs.inputmaskData['profile']) {
					try {
						userRecord.profile = JSON.parse(req.soajs.inputmaskData['profile']);
					}
					catch(e) {
						return cb( {"code": 413, "msg": config.errors[413]} );
					}
				}

				//update record in the database
				mongo.save(userCollectionName, userRecord, function(err) {
					if(err) {
						return cb({"code": 407, "msg": config.errors[407]});
					}
					return cb(null, true);
				});
			});
		});
	}

	service.post("/account/editProfile", function(req, res) {
		updateUserRecord(req, false, function(error) {
			if(error) {
				return res.jsonp(req.soajs.buildResponse({"code": error.code, "msg": error.msg}));
			}
			return res.jsonp(req.soajs.buildResponse(null, true));
		});
	});

	service.post("/admin/editUser", function(req, res) {
		updateUserRecord(req, true, function(error) {
			if(error) {
				return res.jsonp(req.soajs.buildResponse({"code": error.code, "msg": error.msg}));
			}
			return res.jsonp(req.soajs.buildResponse(null, true));
		});
	});

	service.get("/admin/group/list", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		mongo.find(groupsCollectionName, {}, {}, function(err, grpsRecords) {
			if(err || !grpsRecords) {
				return res.jsonp(req.soajs.buildResponse({"code": 415, "msg": config.errors[405]}));
			}

			//if no records return empty array
			if(grpsRecords.length === 0) {
				return res.jsonp(req.soajs.buildResponse(null, []));
			}

			return res.jsonp(req.soajs.buildResponse(null, grpsRecords));
		});
	});

	service.post("/admin/group/add", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));

		var grpRecord = {
			"code": req.soajs.inputmaskData['code'],
			"name": req.soajs.inputmaskData['name'],
			"description": req.soajs.inputmaskData['description']
		};

		mongo.count(groupsCollectionName, {'code': grpRecord.code}, function(error, count) {
			if(error) {
				return res.jsonp(req.soajs.buildResponse({"code": 600, "msg": config.errors[600]}));
			}

			if(count > 0) {
				return res.jsonp(req.soajs.buildResponse({"code": 421, "msg": config.errors[421]}));
			}

			mongo.insert(groupsCollectionName, grpRecord, function(err) {
				if(err) {
					return res.jsonp(req.soajs.buildResponse({"code": 416, "msg": config.errors[416]}));
				}
				return res.jsonp(req.soajs.buildResponse(null, true));
			});
		});

	});

	service.post("/admin/group/edit", function(req, res) {
		//check if grp record is there
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		var groupId;
		try {
			groupId = mongo.ObjectId(req.soajs.inputmaskData['gId']);
		} catch(e) {
			return res.jsonp(req.soajs.buildResponse({"code": 417, "msg": config.errors[417]}));
		}

		var s = {
			'$set': {
				'description': req.soajs.inputmaskData.description,
				'name': req.soajs.inputmaskData.name
			}
		};
		mongo.update(groupsCollectionName, {'_id': groupId}, s, {'upsert': false, 'safe': true}, function(error) {
			if(error) {
				return res.jsonp(req.soajs.buildResponse({"code": 418, "msg": config.errors[418]}));
			}
			return res.jsonp(req.soajs.buildResponse(null, true));
		});
	});

	service.get("/admin/group/delete", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));
		var groupId;
		try {
			groupId = mongo.ObjectId(req.soajs.inputmaskData['gId']);
		} catch(e) {
			return res.jsonp(req.soajs.buildResponse({"code": 417, "msg": config.errors[417]}));
		}

		mongo.findOne(groupsCollectionName, {'_id': groupId}, function(error, record) {
			if(error || !record) {
				return res.jsonp(req.soajs.buildResponse({"code": 415, "msg": config.errors[415]}));
			}

			if(record.locked && record.locked === true) {
				//console.log( record ) ;
				//return error msg that this record is locked
				return res.jsonp(req.soajs.buildResponse({"code": 500, "msg": config.errors[500]}));
			}
			var grpCode = record.code;
			mongo.remove(groupsCollectionName, {'_id': groupId, 'locked': {$ne: true}}, function(error) {
				if(error) {
					return res.jsonp(req.soajs.buildResponse({"code": 419, "msg": config.errors[419]}));
				}

				mongo.update(userCollectionName, {groups: grpCode}, {$pull: {groups: grpCode}}, {multi: true}, function(err) {
					if(err) {
						return res.jsonp(req.soajs.buildResponse({"code": 600, "msg": config.errors[600]}));
					}

					return res.jsonp(req.soajs.buildResponse(null, true));
				});
			});
		});
	});

// add multiple Users To Group
	service.post("/admin/group/addUsers", function(req, res) {
		var mongo = new Mongo(req.soajs.meta.tenantDB(req.soajs.registry.tenantMetaDB, config.serviceName, req.soajs.tenant.code));

		// delete from all users
		var grp = req.soajs.inputmaskData['code'];
		mongo.update(userCollectionName, {groups: grp}, {$pull: {groups: grp}}, {multi: true}, function(err) {
			if(err) {
				return res.jsonp(req.soajs.buildResponse({"code": 600, "msg": config.errors[600]}));
			}

			var users = req.soajs.inputmaskData['users'];
			if(users && users.length > 0) {
				mongo.update(userCollectionName, {'username': {$in: users}}, {$push: {groups: grp}}, function(err) {
					if(err) {
						return res.jsonp(req.soajs.buildResponse({"code": 600, "msg": config.errors[600]}));
					}

					return res.jsonp(req.soajs.buildResponse(null, true));
				});
			}
			else {
				return res.jsonp(req.soajs.buildResponse(null, true));
			}
		});

	});

	service.start();
});