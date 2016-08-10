'use strict';
var utils = require('soajs/lib/').utils;
var soajs = require('soajs');
var Mongo = soajs.mongo;

var uuid = require('node-uuid');
var Hasher = require("../hasher.js");

var userCollectionName = "users";
var tokenCollectionName = "tokens";
var groupsCollectionName = "groups";

function checkIfError(req, res, data, flag, cb) {
	if (data.error) {
		if (typeof (data.error) === 'object' && data.error.message) {
			req.soajs.log.error(data.error);
		}
		if (flag) {
			data.mongo.closeDb();
		}
		return res.jsonp(req.soajs.buildResponse({"code": data.code, "msg": data.config.errors[data.code]}));
	}
	else {
		return cb();
	}
}

function comparePwd(servicesConfig, pwd, cypher, config, cb) {
	var hashConfig = {
		"hashIterations": config.hashIterations,
		"seedLength": config.seedLength
	};
	if (servicesConfig && servicesConfig.hashIterations && servicesConfig.seedLength) {
		hashConfig = {
			"hashIterations": servicesConfig.hashIterations,
			"seedLength": servicesConfig.seedLength
		};
	}
	
	var hasher = new Hasher(hashConfig);
	
	if (servicesConfig.optionalAlgorithm && servicesConfig.optionalAlgorithm !== '') {
		var crypto = require("crypto");
		var hash = crypto.createHash(servicesConfig.optionalAlgorithm);
		pwd = hash.update(pwd).digest('hex');
	}
	
	hasher.compare(pwd, cypher, cb);
}

function encryptPwd(servicesConfig, pwd, config) {
	var hashConfig = {
		"hashIterations": config.hashIterations,
		"seedLength": config.seedLength
	};
	if (servicesConfig && servicesConfig.hashIterations && servicesConfig.seedLength) {
		hashConfig = {
			"hashIterations": servicesConfig.hashIterations,
			"seedLength": servicesConfig.seedLength
		};
	}
	
	var hasher = new Hasher(hashConfig);
	
	if (servicesConfig.optionalAlgorithm && servicesConfig.optionalAlgorithm !== '') {
		var crypto = require("crypto");
		var hash = crypto.createHash(servicesConfig.optionalAlgorithm);
		pwd = hash.update(pwd).digest('hex');
	}
	
	return hasher.hashSync(pwd);
}

function getRandomString(length, config) {
	function getLetter() {
		var start = process.hrtime()[1] % 2 === 0 ? 97 : 65;
		return String.fromCharCode(Math.floor((start + Math.random() * 26)));
	}
	
	function getNumber() {
		return String.fromCharCode(Math.floor((48 + Math.random() * 10)));
	}
	
	length = length || Math.ceil(Math.random() * config.maxStringLimit);
	var qs = '';
	
	while (length) {
		qs += process.hrtime()[1] % 2 === 0 ? getLetter() : getNumber();
		length--;
	}
	
	return qs.replace(/\s/g, '_');
}

function sendMail(apiName, req, data, cb) {
	var transportConfiguration = req.soajs.servicesConfig.mail.transport || null;
	var mailer = new (soajs.mail)(transportConfiguration);
	
	data.limit = req.soajs.servicesConfig.urac.tokenExpiryTTL / (3600 * 1000);
	
	var mailOptions = {
		'to': data.email,
		'from': req.soajs.servicesConfig.mail.from,
		'subject': req.soajs.servicesConfig.urac.mail[apiName].subject,
		'data': data
	};
	if (req.soajs.servicesConfig.urac.mail[apiName].content) {
		mailOptions.content = req.soajs.servicesConfig.urac.mail[apiName].content;
	} else {
		mailOptions.path = req.soajs.servicesConfig.urac.mail[apiName].path;
	}
	delete data.password;
	delete data._id;
	
	mailer.send(mailOptions, function (error) {
		if (error) {
			req.soajs.log.error(error);
		}
		return cb(null, true);
	});
}

function addTokenToLink(link, token) {
	link += (link.indexOf("?") === -1) ? '?token=' + token : "&token=" + token;
	return link;
}

function updateUserRecord(req, mongo, config, complete, cb) {
	//check if user account is there
	var userId;
	try {
		userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
	} catch (e) {
		mongo.closeDb();
		return cb({"code": 411, "msg": config.errors[411]});
	}
	
	mongo.findOne(userCollectionName, {'_id': userId}, function (err, userRecord) {
		if (err || !userRecord) {
			mongo.closeDb();
			return cb({"code": 405, "msg": config.errors[405]});
		}
		
		if (complete && userRecord.locked) {
			return cb({"code": 500, "msg": config.errors[500]});
		}
		if (req.soajs.inputmaskData['groups'] && Array.isArray(req.soajs.inputmaskData['groups']) && req.soajs.inputmaskData['groups'].length > 0) {
			var condition = {
				"code": {"$in": req.soajs.inputmaskData['groups']}
			};
			if (userRecord.tenant && userRecord.tenant.id) {
				condition["tenant.id"] = userRecord.tenant.id
			}
			// check that the groups exist
			mongo.find(groupsCollectionName, condition, function (err, groups) {
				if (err || !groups || groups.length === 0) {
					return cb({'code': 415, 'msg': config.errors[415]});
				}
				resumeEdit(userRecord);
			});
		}
		else {
			resumeEdit(userRecord);
		}
		
	});
	
	function resumeEdit(userRecord) {
		//check if username is taken by another account
		var condition = {
			'_id': {'$ne': userId},
			'username': req.soajs.inputmaskData['username']
		};
		//if(complete) {
		//	condition['tenant.id'] = userRecord.tenant.id;
		//}
		mongo.count(userCollectionName, condition, function (err, count) {
			if (err) {
				mongo.closeDb();
				return cb({"code": 407, "msg": config.errors[407]});
			}
			
			//if count > 0 then this username is taken by another account, return error
			if (count > 0) {
				mongo.closeDb();
				return cb({"code": 410, "msg": config.errors[410]});
			}
			
			//update record entries
			userRecord.username = req.soajs.inputmaskData['username'];
			userRecord.firstName = req.soajs.inputmaskData['firstName'];
			userRecord.lastName = req.soajs.inputmaskData['lastName'];
			
			if (complete) {
				userRecord.email = req.soajs.inputmaskData['email'];
				// cannot change status or groups of the locked user
				if (!userRecord.locked) {
					if (req.soajs.inputmaskData['config']) {
						var configObj = req.soajs.inputmaskData['config'];
						if (typeof(userRecord.config) !== 'object') {
							userRecord.config = {};
						}
						if (configObj.packages) {
							userRecord.config.packages = configObj.packages;
						}
					}
					
					userRecord.status = req.soajs.inputmaskData['status'];
					if (req.soajs.inputmaskData['groups']) {
						userRecord.groups = req.soajs.inputmaskData['groups'];
					} else {
						userRecord.groups = [];
					}
				}
				
				if (req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
					userRecord.password = encryptPwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['password'], config);
				}
			}
			
			if (req.soajs.inputmaskData['profile']) {
				userRecord.profile = req.soajs.inputmaskData['profile'];
			}
			
			//update record in the database
			mongo.save(userCollectionName, userRecord, function (err) {
				mongo.closeDb();
				if (err) {
					return cb({"code": 407, "msg": config.errors[407]});
				}
				return cb(null, true);
			});
		});
	}
}

function updateUserAclRecord(req, mongo, config, cb) {
	//check if user account is there
	var userId;
	try {
		userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
	} catch (e) {
		mongo.closeDb();
		return cb({"code": 411, "msg": config.errors[411]});
	}
	
	mongo.findOne(userCollectionName, {'_id': userId}, function (err, userRecord) {
		if (err || !userRecord) {
			mongo.closeDb();
			return cb({"code": 405, "msg": config.errors[405]});
		}
		// cannot change config of the locked user
		if (userRecord.locked) {
			return cb({"code": 500, "msg": config.errors[500]});
		}
		
		var configObj = req.soajs.inputmaskData['config'];
		if (typeof(userRecord.config) !== 'object') {
			userRecord.config = {};
		}
		if (configObj.packages) {
			userRecord.config.packages = configObj.packages;
		}
		//update record in the database
		mongo.save(userCollectionName, userRecord, function (err) {
			mongo.closeDb();
			if (err) {
				return cb({"code": 407, "msg": config.errors[407]});
			}
			return cb(null, true);
		});
		
	});
}

var libProduct = {
	"guest": {
		"login": function (config, mongo, req, res) {
			function login(req, cb) {
				var criteria = {'username': req.soajs.inputmaskData['username'], 'status': 'active'};
				var pattern = req.soajs.validator.SchemaPatterns.email;
				if (pattern.test(req.soajs.inputmaskData['username'])) {
					delete criteria.username;
					criteria.email = req.soajs.inputmaskData['username'];
				}
				
				mongo.findOne(userCollectionName, criteria, function (err, record) {
					if (record) {
						comparePwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData.password, record.password, config, function (err, response) {
							if (err || !response) {
								mongo.closeDb();
								return cb(400);
							}
							delete record.password;
							//Get Groups config
							if (record.groups && Array.isArray(record.groups) && record.groups.length > 0) {
								var grpCriteria = {
									"code": {"$in": record.groups}
								};
								if (record.tenant) {
									grpCriteria.tenant = record.tenant;
								}
								mongo.find(groupsCollectionName, grpCriteria, function (err, groups) {
									mongo.closeDb();
									record.groupsConfig = null;
									if (err) {
										req.soajs.log.error(err);
									}
									else {
										record.groupsConfig = groups;
									}
									return cb(null, record);
								});
							}
							else {
								mongo.closeDb();
								return cb(null, record);
							}
						});
					}
					else {
						mongo.closeDb();
						return cb(401);
					}
				});
			}
			
			login(req, function (err, record) {
				if (err) {
					return res.jsonp(req.soajs.buildResponse({"code": err, "msg": config.errors[err]}));
				} else {
					var cloneRecord = utils.cloneObj(record);
					req.soajs.session.setURAC(cloneRecord, function (err) {
						var data = {config: config, error: err, code: 401};
						checkIfError(req, res, data, false, function () {
							if (record.config && record.config.packages) {
								delete record.config.packages;
							}
							if (record.config && record.config.keys) {
								delete record.config.keys;
							}
							return res.jsonp(req.soajs.buildResponse(null, record));
						});
						
					});
				}
			});
		},
		"checkUsername": function (config, mongo, req, res) {
			mongo.count(userCollectionName, {'username': req.soajs.inputmaskData['username']}, function (err, userRecord) {
				mongo.closeDb();
				checkIfError(req, res, {
					error: err,
					code: 600,
					config: config
				}, false, function () {
					var status = (userRecord > 0);
					return res.jsonp(req.soajs.buildResponse(null, status));
				});
			});
		},
		"join": function (config, mongo, req, res) {
			var requireValidation = true;
			if (req.soajs.servicesConfig.urac) {
				if (Object.hasOwnProperty.call(req.soajs.servicesConfig.urac, 'validateJoin')) {
					requireValidation = req.soajs.servicesConfig.urac.validateJoin;
				}
			}
			var cond = {
				$or: [
					{'username': req.soajs.inputmaskData['username']},
					{'email': req.soajs.inputmaskData['email']}
				]
			};
			mongo.findOne(userCollectionName, cond, function (err, record) {
				var data = {config: config, error: err, code: 403, mongo: mongo};
				checkIfError(req, res, data, true, function () {
					//user exits
					if (record) {
						mongo.closeDb();
						return res.jsonp(req.soajs.buildResponse({"code": 402, "msg": config.errors[402]}));
					}
					
					var userRecord = {
						"username": req.soajs.inputmaskData['username'],
						"password": encryptPwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['password'], config), //encrypt the password
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
						},
						"tenant": {
							"id": req.soajs.tenant.id.toString(),
							"code": req.soajs.tenant.code
						}
					};
					//add record in db
					mongo.insert(userCollectionName, userRecord, function (err, record) {
						data.error = err || !record;
						data.code = 403;
						checkIfError(req, res, data, true, function () {
							//no validation needed stop and return
							if (requireValidation && req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.join) {
								var tokenRecord = {
									'userId': record[0]._id.toString(),
									'token': uuid.v4(),
									'expires': new Date(new Date().getTime() + req.soajs.servicesConfig.urac.tokenExpiryTTL),
									'status': 'active',
									'ts': new Date().getTime(),
									'service': 'join'
								};
								mongo.insert(tokenCollectionName, tokenRecord, function (err) {
									mongo.closeDb();
									data.error = err;
									checkIfError(req, res, data, false, function () {
										//send an email to the user
										var data = userRecord;
										data.link = {
											join: addTokenToLink(req.soajs.servicesConfig.urac.link.join, tokenRecord.token)
										};
										sendMail('join', req, data, function (error) {
											return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
										});
									});
								});
							}
							else {
								mongo.closeDb();
								return res.jsonp(req.soajs.buildResponse(null, true));
							}
						});
					});
				});
			});
		},
		"forgotPassword": function (config, mongo, req, res) {
			mongo.findOne(userCollectionName, {
				'$or': [
					{'username': req.soajs.inputmaskData['username']},
					{'email': req.soajs.inputmaskData['username']}
				],
				'status': 'active'
			}, function (err, userRecord) {
				if (err || !userRecord) {
					mongo.closeDb();
					return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
				}
				
				var tokenRecord = {
					'userId': userRecord._id.toString(),
					'token': uuid.v4(),
					'expires': new Date(new Date().getTime() + req.soajs.servicesConfig.urac.tokenExpiryTTL),
					'status': 'active',
					'ts': new Date().getTime(),
					'service': 'forgotPassword'
				};
				
				mongo.update(tokenCollectionName, {
					'userId': tokenRecord.userId,
					'service': 'forgotPassword',
					'status': 'active'
				}, {'$set': {'status': 'invalid'}}, function (err) {
					var data = {config: config, error: err, code: 407, mongo: mongo};
					checkIfError(req, res, data, true, function () {
						mongo.insert(tokenCollectionName, tokenRecord, function (err) {
							mongo.closeDb();
							data.error = err;
							checkIfError(req, res, data, false, function () {
								if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.forgotPassword) {
									//send an email to the user
									var data = userRecord;
									data.link = {
										forgotPassword: addTokenToLink(req.soajs.servicesConfig.urac.link.forgotPassword, tokenRecord.token)
									};
									
									sendMail('forgotPassword', req, data, function () {
										return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
									});
								} else {
									return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
								}
							});
						});
					});
				});
			});
		},
		"resetPassword": function (config, mongo, req, res) {
			//get token
			mongo.findOne(tokenCollectionName, {
				'token': req.soajs.inputmaskData['token'],
				'service': {'$in': ['forgotPassword', 'addUser']},
				status: 'active'
			}, function (err, tokenRecord) {
				if (err || !tokenRecord) {
					mongo.closeDb();
					return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
				}
				
				//check if token expired
				if (new Date(tokenRecord.expires).getTime() < new Date().getTime()) {
					mongo.closeDb();
					return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
				}
				
				//get user record
				mongo.findOne(userCollectionName, {'_id': mongo.ObjectId(tokenRecord.userId)}, function (error, userRecord) {
					var data = {config: config, error: error || !userRecord, code: 406, mongo: mongo};
					checkIfError(req, res, data, true, function () {
						//update token status
						tokenRecord.status = 'used';
						
						//hash the password and update user record status
						userRecord.status = 'active';
						userRecord.password = encryptPwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['password'], config);
						
						//save token in database
						mongo.save(tokenCollectionName, tokenRecord, function (err) {
							data.error = err;
							data.code = 407;
							checkIfError(req, res, data, true, function () {
								//save user record in database
								mongo.save(userCollectionName, userRecord, function (err) {
									mongo.closeDb();
									data.error = err;
									checkIfError(req, res, data, true, function () {
										return res.jsonp(req.soajs.buildResponse(null, true));
									});
								});
							});
						});
					});
				});
			});
		},
		"joinValidate": function (config, mongo, req, res) {
			//get token
			var token = {
				'token': req.soajs.inputmaskData['token'],
				'service': 'join',
				'status': 'active'
			};
			mongo.findOne(tokenCollectionName, token, function (err, tokenRecord) {
				var data = {config: config, error: err || !tokenRecord, code: 406, mongo: mongo};
				checkIfError(req, res, data, true, function () {
					//check if token expired
					if (new Date(tokenRecord.expires).getTime() < new Date().getTime()) {
						mongo.closeDb();
						return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
					}

					//get user record
					mongo.findOne(userCollectionName, {
						'_id': mongo.ObjectId(tokenRecord.userId),
						'status': 'pendingJoin'
					}, function (error, userRecord) {
						data.error = error || !userRecord;
						checkIfError(req, res, data, true, function () {
							//update token status
							tokenRecord.status = 'used';
							userRecord.status = 'active';

							//save token in database
							mongo.save(tokenCollectionName, tokenRecord, function (err) {
								data.error = err;
								data.code = 407;
								checkIfError(req, res, data, false, function () {
									//save user record in database
									mongo.save(userCollectionName, userRecord, function (err) {
										mongo.closeDb();
										data.error = err;
										checkIfError(req, res, data, false, function () {
											return res.jsonp(req.soajs.buildResponse(null, true));
										});
									});
								});
							});
						});
					});
				});
			});
		},
		"changeEmailValidate": function (config, mongo, req, res) {
			var token = {
				'token': req.soajs.inputmaskData['token'],
				'service': 'changeEmail',
				'status': 'active'
			};
			mongo.findOne(tokenCollectionName, token, function (err, tokenRecord) {
				if (err || !tokenRecord) {
					mongo.closeDb();
					req.soajs.log.error('Invalid Token');
					return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
				}

				//check if token expired
				if (new Date(tokenRecord.expires).getTime() < new Date().getTime()) {
					mongo.closeDb();
					return res.jsonp(req.soajs.buildResponse({"code": 406, "msg": config.errors[406]}));
				}

				//get user record
				mongo.findOne(userCollectionName, {'_id': mongo.ObjectId(tokenRecord.userId)}, function (error, userRecord) {
					var data = {config: config, error: error || !userRecord, code: 406, mongo: mongo};
					checkIfError(req, res, data, true, function () {
						//update token status
						tokenRecord.status = 'used';

						//update user record email
						userRecord.email = tokenRecord.email;

						//save token in database
						mongo.save(tokenCollectionName, tokenRecord, function (err) {
							data.error = err;
							data.code = 407;
							checkIfError(req, res, data, true, function () {

								//save user record in database
								mongo.save(userCollectionName, userRecord, function (err) {
									mongo.closeDb();
									data.error = err;
									checkIfError(req, res, data, false, function () {
										return res.jsonp(req.soajs.buildResponse(null, true));
									});
								});
							});
						});
					});
				});
			});
		}
	},
	"account": {
		"editProfile": function (config, mongo, req, res) {
			updateUserRecord(req, mongo, config, false, function (error) {
				if (error) {
					return res.jsonp(req.soajs.buildResponse({"code": error.code, "msg": error.msg}));
				}
				return res.jsonp(req.soajs.buildResponse(null, true));
			});
		},
		"changeEmail": function (config, mongo, req, res) {
			//check if user account is there
			var userId;
			try {
				userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
			} catch (e) {
				mongo.closeDb();
				return res.jsonp(req.soajs.buildResponse({"code": 411, "msg": config.errors[411]}));
			}
			mongo.findOne(userCollectionName, {'_id': userId}, function (err, userRecord) {
				var data = {config: config, error: err, code: 405, mongo: mongo};
				checkIfError(req, res, data, true, function () {
					if (userRecord.email === req.soajs.inputmaskData['email']) {
						mongo.closeDb();
						return res.jsonp(req.soajs.buildResponse({"code": 412, "msg": config.errors[412]}));
					}
					
					//create new token
					var tokenRecord = {
						'userId': userRecord._id.toString(),
						'token': uuid.v4(),
						'expires': new Date(new Date().getTime() + req.soajs.servicesConfig.urac.tokenExpiryTTL),
						'status': 'active',
						'ts': new Date().getTime(),
						'service': 'changeEmail',
						'email': req.soajs.inputmaskData['email']
					};
					
					//set the old tokens to invalid
					mongo.update(tokenCollectionName, {
						'userId': tokenRecord.userId,
						'service': 'changeEmail',
						'status': 'active'
					}, {'$set': {'status': 'invalid'}}, function (err) {
						data.error = err;
						data.code = 407;
						checkIfError(req, res, data, true, function () {
							
							//insert newly created token
							mongo.insert(tokenCollectionName, tokenRecord, function (err) {
								mongo.closeDb();
								data.error = err;
								checkIfError(req, res, data, false, function () {
									
									//email notification
									if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.changeEmail) {
										//send an email to the user
										var data = JSON.parse(JSON.stringify(userRecord));
										data.email = req.soajs.inputmaskData['email'];
										data.link = {
											changeEmail: addTokenToLink(req.soajs.servicesConfig.urac.link.changeEmail, tokenRecord.token)
										};
										
										sendMail('changeEmail', req, data, function (error) {
											return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
										});
									} else {
										return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
									}
								});
							});
						});
					});
				});
			});
		},
		"changePassword": function (config, mongo, req, res) {
			//check if user account is there
			var userId;
			try {
				userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
			} catch (e) {
				mongo.closeDb();
				return res.jsonp(req.soajs.buildResponse({"code": 411, "msg": config.errors[411]}));
			}
			
			mongo.findOne(userCollectionName, {'_id': userId}, function (err, userRecord) {
				if (err || !userRecord) {
					mongo.closeDb();
					return res.jsonp(req.soajs.buildResponse({"code": 405, "msg": config.errors[405]}));
				}
				
				comparePwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['oldPassword'], userRecord.password, config, function (err, response) {
					if (err || !response) {
						req.soajs.log.error(err);
						mongo.closeDb();
						return res.jsonp(req.soajs.buildResponse({"code": 409, "msg": config.errors[409]}));
					} else {
						//hash new password, update record and save
						userRecord.password = encryptPwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['password'], config);
						mongo.save(userCollectionName, userRecord, function (err) {
							mongo.closeDb();
							var data = {config: config, error: err, code: 407};
							checkIfError(req, res, data, false, function () {
								return res.jsonp(req.soajs.buildResponse(null, true));
							});
						});
					}
				});
			});
		},
		"getUser": function (config, mongo, req, res) {
			mongo.findOne(userCollectionName, {
				'username': req.soajs.inputmaskData['username'],
				'status': 'active'
			}, function (err, record) {
				mongo.closeDb();
				var data = {config: config, error: err, code: 405, mongo: mongo};
				checkIfError(req, res, data, false, function () {
					if (!record) {
						req.soajs.log.error('Record not found for username: ' + req.soajs.inputmaskData['username']);
						return res.jsonp(req.soajs.buildResponse({"code": 405, "msg": config.errors[405]}));
					}
					delete record.password;
					return res.jsonp(req.soajs.buildResponse(null, record));
				});
			});
		}
	},
	"admin": {
		"listAll": function (config, mongo, req, res) {
			mongo.find(userCollectionName, {}, {'password': 0}, function (err, userRecords) {
				var data = {config: config, error: err, code: 405, mongo: mongo};
				checkIfError(req, res, data, false, function () {
					mongo.find(groupsCollectionName, {}, {}, function (err, grpRecords) {
						mongo.closeDb();
						data.code = 415;
						data.error = err;
						checkIfError(req, res, data, false, function () {
							return res.jsonp(req.soajs.buildResponse(null, {
								'users': userRecords,
								'groups': grpRecords
							}));
						});
					});
				});
			});
		},
		"listUsers": function (config, mongo, req, res) {
			var condition = {};
			if (req.soajs.inputmaskData['tId']) {
				condition = {"tenant.id": req.soajs.inputmaskData['tId']};
			}
			
			var fields = {'password': 0};
			mongo.find(userCollectionName, condition, fields, function (err, userRecords) {
				mongo.closeDb();
				var data = {config: config, error: err || !userRecords, code: 406, mongo: mongo};
				checkIfError(req, res, data, false, function () {
					//if no records return empty array
					if (userRecords.length === 0) {
						return res.jsonp(req.soajs.buildResponse(null, []));
					}
					
					return res.jsonp(req.soajs.buildResponse(null, userRecords));
				});
			});
		},
		"getUser": function (config, mongo, req, res) {
			var userId;
			try {
				userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
			} catch (e) {
				return res.jsonp(req.soajs.buildResponse({"code": 411, "msg": config.errors[411]}));
			}
			mongo.findOne(userCollectionName, {'_id': userId}, function (err, userRecord) {
				mongo.closeDb();
				var data = {config: config, error: err || !userRecord, code: 405};
				checkIfError(req, res, data, false, function () {
					delete userRecord.password;
					return res.jsonp(req.soajs.buildResponse(null, userRecord));
				});
			});
		},
		"addUser": function (config, mongo, req, res) {
			var condition = {'username': req.soajs.inputmaskData['username']};
			
			mongo.findOne(userCollectionName, condition, function (err, record) {
				var data = {config: config, error: err, code: 414, mongo: mongo};
				checkIfError(req, res, data, true, function () {
					//user exits
					//if(record && record.tenant.id === req.soajs.inputmaskData['tId'].toString()) {
					if (record) {
						mongo.closeDb();
						return res.jsonp(req.soajs.buildResponse({"code": 402, "msg": config.errors[402]}));
					}
					
					//hash the password
					var pwd = getRandomString(12, config);
					if (req.soajs.inputmaskData['status'] === 'active' && req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
						pwd = req.soajs.inputmaskData['password'];
					}
					pwd = encryptPwd(req.soajs.servicesConfig.urac, pwd, config);
					
					var userRecord = {
						"username": req.soajs.inputmaskData['username'],
						"password": pwd,
						"firstName": req.soajs.inputmaskData['firstName'],
						"lastName": req.soajs.inputmaskData['lastName'],
						"email": req.soajs.inputmaskData['email'],
						'status': req.soajs.inputmaskData['status'],
						"config": {},
						'ts': new Date().getTime()
					};
					
					if (req.soajs.inputmaskData['tId']) {
						try {
							req.soajs.inputmaskData['tId'] = mongo.ObjectId(req.soajs.inputmaskData['tId']);
						} catch (e) {
							req.soajs.log.error(e);
							mongo.closeDb();
							return res.jsonp(req.soajs.buildResponse({"code": 611, "msg": config.errors[611]}));
						}
						
						userRecord.tenant = {
							"id": req.soajs.inputmaskData['tId'].toString(),
							"code": req.soajs.inputmaskData['tCode']
						};
					}
					if (req.soajs.inputmaskData['profile']) {
						userRecord.profile = req.soajs.inputmaskData['profile'];
					}
					if (req.soajs.inputmaskData['groups']) {
						userRecord.groups = req.soajs.inputmaskData['groups'];
					}
					//add record in db
					mongo.insert(userCollectionName, userRecord, function (err, userDbRecord) {
						data.code = 403;
						data.error = err;
						checkIfError(req, res, data, true, function () {
							if (userDbRecord[0].status !== 'pendingNew') {
								mongo.closeDb();
								return res.jsonp(req.soajs.buildResponse(null, true));
							}
							
							//create notification email
							var tokenRecord = {
								'userId': userDbRecord[0]._id.toString(),
								'token': uuid.v4(),
								'expires': new Date(new Date().getTime() + req.soajs.servicesConfig.urac.tokenExpiryTTL),
								'status': 'active',
								'ts': new Date().getTime(),
								'service': 'addUser'
							};
							mongo.insert(tokenCollectionName, tokenRecord, function (err) {
								mongo.closeDb();
								data.error = err;
								checkIfError(req, res, data, false, function () {
									if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.addUser) {
										
										var data = userRecord;
										data.link = {
											addUser: addTokenToLink(req.soajs.servicesConfig.urac.link.addUser, tokenRecord.token)
										};
										
										sendMail('addUser', req, data, function (error) {
											return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
										});
									}
									else {
										return res.jsonp(req.soajs.buildResponse(null, tokenRecord.token));
									}
								});
							});
						});
					});
				});
			});
		},
		"editUser": function (config, mongo, req, res) {
			updateUserRecord(req, mongo, config, true, function (error) {
				if (error) {
					return res.jsonp(req.soajs.buildResponse({"code": error.code, "msg": error.msg}));
				}
				return res.jsonp(req.soajs.buildResponse(null, true));
			});
		},
		"editUserConfig": function (config, mongo, req, res) {
			updateUserAclRecord(req, mongo, config, function (error) {
				if (error) {
					return res.jsonp(req.soajs.buildResponse({"code": error.code, "msg": error.msg}));
				}
				return res.jsonp(req.soajs.buildResponse(null, true));
			});
		},
		"changeUserStatus": function (config, mongo, req, res) {
			//check if user account is there
			var userId;
			try {
				userId = mongo.ObjectId(req.soajs.inputmaskData['uId']);
			} catch (e) {
				mongo.closeDb();
				return res.jsonp(req.soajs.buildResponse({"code": 411, "msg": config.errors[411]}));
			}
			
			//get user database record
			var criteria = {
				'_id': userId, 'locked': {$ne: true}
			};
			/* $ne selects the documents where the value of the field is not equal (i.e. !=) to the specified value.
			 * This includes documents that do not contain the field. */
			mongo.findOne(userCollectionName, criteria, function (err, userRecord) {
				var data = {config: config, error: err || !userRecord, code: 405, mongo: mongo};
				checkIfError(req, res, data, true, function () {
					
					//update record entries
					userRecord.status = req.soajs.inputmaskData['status'];
					
					//update record in the database
					mongo.save(userCollectionName, userRecord, function (err) {
						mongo.closeDb();
						data.code = 407;
						data.error = err;
						checkIfError(req, res, data, false, function () {
							if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.changeUserStatus) {
								sendMail('changeUserStatus', req, userRecord, function (error) {
									return res.jsonp(req.soajs.buildResponse(null, true));
								});
							} else {
								return res.jsonp(req.soajs.buildResponse(null, true));
							}
						});
					});
				});
			});
		},
		"group": {
			"list": function (config, mongo, req, res) {
				var condition = {};
				if (req.soajs.inputmaskData['tId']) {
					condition = {"tenant.id": req.soajs.inputmaskData['tId']};
				}
				mongo.find(groupsCollectionName, condition, {}, function (err, grpsRecords) {
					mongo.closeDb();
					var data = {config: config, error: err || !grpsRecords, code: 415, mongo: mongo};
					checkIfError(req, res, data, false, function () {
						
						//if no records return empty array
						if (grpsRecords.length === 0) {
							return res.jsonp(req.soajs.buildResponse(null, []));
						}
						
						return res.jsonp(req.soajs.buildResponse(null, grpsRecords));
					});
				});
			},
			"add": function (config, mongo, req, res) {
				var grpRecord = {
					"code": req.soajs.inputmaskData['code'],
					"name": req.soajs.inputmaskData['name'],
					"description": req.soajs.inputmaskData['description']
				};
				
				var condition = {
					'code': grpRecord.code
				};
				if (req.soajs.inputmaskData['tId']) {
					try {
						req.soajs.inputmaskData['tId'] = mongo.ObjectId(req.soajs.inputmaskData['tId']);
					} catch (e) {
						mongo.closeDb();
						return res.jsonp(req.soajs.buildResponse({"code": 611, "msg": config.errors[611]}));
					}
					
					grpRecord.tenant = {
						"id": req.soajs.inputmaskData['tId'].toString(),
						"code": req.soajs.inputmaskData['tCode']
					};
					condition['tenant.id'] = grpRecord.tenant.id;
				}
				mongo.count(groupsCollectionName, condition, function (error, count) {
					var data = {config: config, error: error, code: 600, mongo: mongo};
					checkIfError(req, res, data, true, function () {
						if (count > 0) {
							mongo.closeDb();
							return res.jsonp(req.soajs.buildResponse({"code": 421, "msg": config.errors[421]}));
						}
						
						mongo.insert(groupsCollectionName, grpRecord, function (err) {
							mongo.closeDb();
							data.code = 416;
							data.error = err;
							checkIfError(req, res, data, false, function () {
								return res.jsonp(req.soajs.buildResponse(null, true));
							});
						});
					});
				});
			},
			"edit": function (config, mongo, req, res) {
				//check if grp record is there
				var groupId;
				try {
					groupId = mongo.ObjectId(req.soajs.inputmaskData['gId']);
				} catch (e) {
					mongo.closeDb();
					return res.jsonp(req.soajs.buildResponse({"code": 417, "msg": config.errors[417]}));
				}
				
				var s = {
					'$set': {
						'description': req.soajs.inputmaskData.description,
						'name': req.soajs.inputmaskData.name
					}
				};
				mongo.update(groupsCollectionName, {'_id': groupId}, s, {
					'upsert': false,
					'safe': true
				}, function (error) {
					mongo.closeDb();
					var data = {config: config, error: error, code: 418};
					checkIfError(req, res, data, false, function () {
						return res.jsonp(req.soajs.buildResponse(null, true));
					});
				});
			},
			"delete": function (config, mongo, req, res) {
				var groupId;
				try {
					groupId = mongo.ObjectId(req.soajs.inputmaskData['gId']);
				} catch (e) {
					mongo.closeDb();
					return res.jsonp(req.soajs.buildResponse({"code": 417, "msg": config.errors[417]}));
				}
				
				mongo.findOne(groupsCollectionName, {'_id': groupId}, function (error, record) {
					var data = {config: config, error: error || !record, code: 415, mongo: mongo};
					checkIfError(req, res, data, true, function () {
						if (record.locked && record.locked === true) {
							//return error msg that this record is locked
							mongo.closeDb();
							return res.jsonp(req.soajs.buildResponse({"code": 500, "msg": config.errors[500]}));
						}
						var grpCode = record.code;
						mongo.remove(groupsCollectionName, {'_id': groupId, 'locked': {$ne: true}}, function (error) {
							data.code = 419;
							data.error = error;
							checkIfError(req, res, data, true, function () {
								var userCond = {
									"groups": grpCode
								};
								if (record.tenant && record.tenant.id) {
									userCond["tenant.id"] = record.tenant.id
								}
								mongo.update(userCollectionName, userCond, {$pull: {groups: grpCode}}, {multi: true}, function (err) {
									mongo.closeDb();
									data.code = 600;
									data.error = err;
									checkIfError(req, res, data, false, function () {
										return res.jsonp(req.soajs.buildResponse(null, true));
									});
								});
							});
						});
					});
				});
			},
			"addUsers": function (config, mongo, req, res) {
				// delete from all users
				var grp = req.soajs.inputmaskData['code'];
				var grpCondition = {
					'groups': grp
				};
				if (req.soajs.inputmaskData['tId']) {
					grpCondition['tenant.id'] = req.soajs.inputmaskData['tId'];
				}
				mongo.update(userCollectionName, grpCondition, {$pull: {groups: grp}}, {multi: true}, function (err) {
					var data = {config: config, error: err, code: 600, mongo: mongo};
					checkIfError(req, res, data, true, function () {
						
						var users = req.soajs.inputmaskData['users'];
						if (users && users.length > 0) {
							var conditionUsers = {
								'username': {$in: users}
							};
							if (req.soajs.inputmaskData['tId']) {
								conditionUsers['tenant.id'] = req.soajs.inputmaskData['tId'];
							}
							mongo.update(userCollectionName, conditionUsers, {$push: {groups: grp}}, {multi: true}, function (err) {
								mongo.closeDb();
								data.error = err;
								checkIfError(req, res, data, false, function () {
									return res.jsonp(req.soajs.buildResponse(null, true));
								});
							});
						}
						else {
							mongo.closeDb();
							return res.jsonp(req.soajs.buildResponse(null, true));
						}
					});
				});
			}
		}
	}
	
};

module.exports = libProduct;