'use strict';
var soajsUtils = require('soajs/lib/').utils;
var fs = require("fs");

var uuid = require('uuid');

var userCollectionName = "users";
var tokenCollectionName = "tokens";
var groupsCollectionName = "groups";

function checkIfError(req, mainCb, data, flag, cb) {
	if (data.error) {
		if (typeof (data.error) === 'object' && data.error.message) {
			req.soajs.log.error(data.error);
		}
		if (flag) {
			libProduct.model.closeConnection(req.soajs);
		}
		return mainCb({"code": data.code, "msg": req.soajs.config.errors[data.code]});
	}
	else {
		return cb();
	}
}

var utils = require("./utils.js");

var libProduct = {
	"model": null,
	
	"guest": {
		"customLogin": function (req, cb) {
			var user = req.soajs.inputmaskData.user;
			var mode = req.soajs.inputmaskData.strategy;
			var filePath = __dirname + "/../drivers/" + mode + ".js";
			var driver = require(filePath);
			
			driver.mapProfile(user, function (error, profile) {
				libProduct.model.initConnection(req.soajs);
				var userRecord = {
					"username": profile.username,
					"password": profile.password,
					"firstName": profile.firstName,
					"lastName": profile.lastName,
					"email": profile.email,
					'status': 'active',
					'ts': new Date().getTime(),
					'groups': [],
					'config': {
						'packages': {},
						'keys': {}
					},
					'profile': {},
					"socialId": {}
				};
				
				userRecord.socialId[mode] = {
					ts: new Date().getTime(),
					"id": user.profile.id
				};
				
				var condition = {
					$or: []
				};
				if (userRecord.email) {
					condition["$or"].push({'email': userRecord.email});
				}
				var c = {};
				c['socialId.' + mode + '.id'] = user.profile.id;
				condition["$or"].push(c);
				
				var combo = {
					collection: userCollectionName,
					condition: condition
				};
				
				function setSession(record) {
					delete record.password;
					var returnRecord = JSON.parse(JSON.stringify(record));
					record.socialLogin = {};
					record.socialLogin = record.socialId[mode];
					record.socialLogin.strategy = mode;
					delete record.socialId;
					delete returnRecord.socialId;
					delete returnRecord.socialLogin;
					if (req.soajs.session) {
						req.soajs.session.setURAC(record, function (err) {
							return cb(null, record);
						});
					}
					else {
						return cb(null, record);
					}
				}
				
				libProduct.model.findEntry(req.soajs, combo, function (err, record) {
					if (err) {
						req.soajs.log.error(err);
						return cb({"code": 400, "msg": req.soajs.config.errors[400]});
					}
					
					if (record) {
						// update record
						if (!record.socialId) {
							record.socialId = {};
						}
						if (!record.socialId[mode]) {
							record.socialId[mode] = {
								ts: new Date().getTime()
							};
						}
						
						record.socialId[mode].id = user.profile.id;
						record.socialId[mode].accessToken = user.accessToken;
						if (user.refreshToken) { // first time application authorized
							record.socialId[mode].refreshToken = user.refreshToken;
						}
						
						var comboUpdate = {
							collection: userCollectionName,
							record: record
						};
						libProduct.model.saveEntry(req.soajs, comboUpdate, function (err, ret) {
							libProduct.model.closeConnection(req.soajs);
							if (err) {
								req.soajs.log.error(err);
							}
							setSession(record);
						});
					}
					else {
						userRecord.socialId[mode].accessToken = user.accessToken;
						if (user.refreshToken) { // first time application authorized
							userRecord.socialId[mode].refreshToken = user.refreshToken;
						}
						
						var comboInsert = {
							collection: userCollectionName,
							record: userRecord
						};
						libProduct.model.insertEntry(req.soajs, comboInsert, function (err, results) {
							libProduct.model.closeConnection(req.soajs);
							var data = {config: req.soajs.config, error: err, code: 400};
							checkIfError(req, cb, data, false, function () {
								setSession(results[0]);
							});
						});
					}
				});
				
			});
		},
		"login": function (req, cb) {
			var myDriver = require("soajs.urac.driver");
			var data = {
				'username': req.soajs.inputmaskData['username'],
				'password': req.soajs.inputmaskData['password']
			};
			myDriver.login(req.soajs, data, function (err, record) {
				if (err) {
					return cb({"code": err, "msg": req.soajs.config.errors[err]});
				}
				
				var cloneRecord = soajsUtils.cloneObj(record);
				req.soajs.session.setURAC(cloneRecord, function (err) {
					var data = {error: err, code: 401};
					checkIfError(req, cb, data, false, function () {
						if (record.config && record.config.packages) {
							delete record.config.packages;
						}
						if (record.config && record.config.keys) {
							delete record.config.keys;
						}
						return cb(null, record);
					});
					
				});
			});
		},
		"checkUsername": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			var combo = {
				collection: userCollectionName,
				condition: {
					'username': req.soajs.inputmaskData['username']
				}
			};
			libProduct.model.countEntries(req.soajs, combo, function (err, userRecord) {
				libProduct.model.closeConnection(req.soajs);
				var data = {error: err, code: 600, config: req.soajs.config};
				checkIfError(req, cb, data, false, function () {
					var status = (userRecord > 0);
					return cb(null, status);
				});
			});
		},
		
		"join": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
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
			var combo = {
				collection: userCollectionName,
				condition: cond
			};
			
			libProduct.model.findEntry(req.soajs, combo, function (err, record) {
				var data = {config: req.soajs.config, error: err, code: 400};
				checkIfError(req, cb, data, true, function () {
					//user exits
					if (record) {
						libProduct.model.closeConnection(req.soajs);
						return cb({"code": 402, "msg": req.soajs.config.errors[402]});
					}
					
					var userRecord = {
						"username": req.soajs.inputmaskData['username'],
						"password": utils.encryptPwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['password'], req.soajs.config), //encrypt the password
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
					var combo = {
						collection: userCollectionName,
						record: userRecord
					};
					//add record in db
					libProduct.model.insertEntry(req.soajs, combo, function (err, record) {
						data.error = err || !record;
						data.code = 400;
						checkIfError(req, cb, data, true, function () {
							//no validation needed stop and return
							var returnObj = {
								id: record[0]._id.toString()
							};
							if (requireValidation && req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.join) {
								var tokenExpiryTTL = 2 * 24 * 3600000;
								if (req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.tokenExpiryTTL) {
									tokenExpiryTTL = req.soajs.servicesConfig.urac.tokenExpiryTTL;
								}
								var tokenRecord = {
									'userId': record[0]._id.toString(),
									'token': uuid.v4(),
									'expires': new Date(new Date().getTime() + tokenExpiryTTL),
									'status': 'active',
									'ts': new Date().getTime(),
									'service': 'join',
									'username': record[0].username
								};
								var combo = {
									collection: tokenCollectionName,
									record: tokenRecord
								};
								libProduct.model.insertEntry(req.soajs, combo, function (err) {
									libProduct.model.closeConnection(req.soajs);
									data.error = err;
									checkIfError(req, cb, data, false, function () {
										//send an email to the user
										var data = userRecord;
										data.link = {
											join: utils.addTokenToLink(req.soajs.servicesConfig.urac.link.join, tokenRecord.token)
										};
										utils.sendMail('join', req, data, function (error) {
											returnObj.token = tokenRecord.token;
											return cb(null, returnObj);
										});
									});
								});
							}
							else {
								libProduct.model.closeConnection(req.soajs);
								return cb(null, returnObj);
							}
						});
					});
				});
			});
		},
		
		"forgotPassword": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			var combo = {
				collection: userCollectionName,
				condition: {
					'$or': [
						{'username': req.soajs.inputmaskData['username']},
						{'email': req.soajs.inputmaskData['username']}
					],
					'status': 'active'
				}
			};
			libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
				if (err || !userRecord) {
					libProduct.model.closeConnection(req.soajs);
					return cb({"code": 406, "msg": req.soajs.config.errors[406]});
				}
				
				var tokenExpiryTTL = 2 * 24 * 3600000;
				if (req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.tokenExpiryTTL) {
					tokenExpiryTTL = req.soajs.servicesConfig.urac.tokenExpiryTTL;
				}
				var tokenRecord = {
					'userId': userRecord._id.toString(),
					'token': uuid.v4(),
					'expires': new Date(new Date().getTime() + tokenExpiryTTL),
					'status': 'active',
					'ts': new Date().getTime(),
					'service': 'forgotPassword',
					'username': userRecord.username
				};
				
				var combo1 = {
					collection: tokenCollectionName,
					condition: {
						'userId': tokenRecord.userId,
						'service': 'forgotPassword',
						'status': 'active'
					},
					updatedFields: {
						'$set': {'status': 'invalid'}
					}
				};
				
				libProduct.model.updateEntry(req.soajs, combo1, function (err) {
					var data = {
						config: req.soajs.config, error: err, code: 407
					};
					checkIfError(req, cb, data, true, function () {
						var combo2 = {
							collection: tokenCollectionName,
							record: tokenRecord
						};
						libProduct.model.insertEntry(req.soajs, combo2, function (err) {
							libProduct.model.closeConnection(req.soajs);
							data.error = err;
							checkIfError(req, cb, data, false, function () {
								if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.forgotPassword) {
									//send an email to the user
									var data = userRecord;
									data.link = {
										forgotPassword: utils.addTokenToLink(req.soajs.servicesConfig.urac.link.forgotPassword, tokenRecord.token)
									};
									
									utils.sendMail('forgotPassword', req, data, function () {
										return cb(null, tokenRecord.token);
									});
								}
								else {
									return cb(null, tokenRecord.token);
								}
							});
						});
					});
				});
			});
		},
		
		"resetPassword": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			//get token
			var combo = {
				collection: tokenCollectionName,
				condition: {
					'token': req.soajs.inputmaskData['token'],
					'service': {'$in': ['forgotPassword', 'addUser']},
					'status': 'active'
				}
			};
			libProduct.model.findEntry(req.soajs, combo, function (err, tokenRecord) {
				if (err || !tokenRecord) {
					libProduct.model.closeConnection(req.soajs);
					return cb({"code": 406, "msg": req.soajs.config.errors[406]});
				}
				
				//check if token expired
				if (new Date(tokenRecord.expires).getTime() < new Date().getTime()) {
					libProduct.model.closeConnection(req.soajs);
					return cb({"code": 406, "msg": req.soajs.config.errors[406]});
				}
				libProduct.model.validateId(req.soajs, tokenRecord.userId, function (err, id) {
					var combo = {
						collection: userCollectionName,
						condition: {'_id': id}
					};
					//get user record
					libProduct.model.findEntry(req.soajs, combo, function (error, userRecord) {
						var data = {config: req.soajs.config, error: error || !userRecord, code: 406};
						checkIfError(req, cb, data, true, function () {
							//update token status
							tokenRecord.status = 'used';
							//hash the password and update user record status
							userRecord.status = 'active';
							userRecord.password = utils.encryptPwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['password'], req.soajs.config);
							
							var combo = {
								collection: tokenCollectionName,
								record: tokenRecord
							};
							//save token in database
							libProduct.model.saveEntry(req.soajs, combo, function (err) {
								data.error = err;
								data.code = 407;
								checkIfError(req, cb, data, true, function () {
									var combo1 = {
										collection: userCollectionName,
										record: userRecord
									};
									//save user record in database
									libProduct.model.saveEntry(req.soajs, combo1, function (err) {
										libProduct.model.closeConnection(req.soajs);
										data.error = err;
										checkIfError(req, cb, data, false, function () {
											return cb(null, true);
										});
									});
								});
							});
						});
					});
				});
				
			});
		},
		
		"joinValidate": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			//get token
			var token = {
				'token': req.soajs.inputmaskData['token'],
				'service': 'join',
				'status': 'active'
			};
			var combo = {
				collection: tokenCollectionName,
				condition: token
			};
			libProduct.model.findEntry(req.soajs, combo, function (err, tokenRecord) {
				var data = {config: req.soajs.config, error: err || !tokenRecord, code: 406};
				checkIfError(req, cb, data, true, function () {
					//check if token expired
					if (new Date(tokenRecord.expires).getTime() < new Date().getTime()) {
						libProduct.model.closeConnection(req.soajs);
						return cb({"code": 406, "msg": req.soajs.config.errors[406]});
					}
					libProduct.model.validateId(req.soajs, tokenRecord.userId, function (e, userId) {
						var combo = {
							collection: userCollectionName,
							condition: {
								'_id': userId,
								'status': 'pendingJoin'
							}
						};
						//get user record
						libProduct.model.findEntry(req.soajs, combo, function (error, userRecord) {
							data.error = error || !userRecord;
							checkIfError(req, cb, data, true, function () {
								//update token status
								tokenRecord.status = 'used';
								userRecord.status = 'active';
								var combo = {
									collection: tokenCollectionName,
									record: tokenRecord
								};
								//save token in database
								libProduct.model.saveEntry(req.soajs, combo, function (err) {
									data.error = err;
									data.code = 407;
									checkIfError(req, cb, data, false, function () {
										var combo = {
											collection: userCollectionName,
											record: userRecord
										};
										//save user record in database
										libProduct.model.saveEntry(req.soajs, combo, function (err) {
											libProduct.model.closeConnection(req.soajs);
											data.error = err;
											checkIfError(req, cb, data, false, function () {
												return cb(null, true);
											});
										});
									});
								});
							});
						});
					});
				});
			});
		},
		
		"changeEmailValidate": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			var token = {
				'token': req.soajs.inputmaskData['token'],
				'service': 'changeEmail',
				'status': 'active'
			};
			var combo = {
				collection: tokenCollectionName,
				condition: token
			};
			libProduct.model.findEntry(req.soajs, combo, function (err, tokenRecord) {
				if (err || !tokenRecord) {
					libProduct.model.closeConnection(req.soajs);
					req.soajs.log.error('Invalid Token');
					return cb({"code": 406, "msg": req.soajs.config.errors[406]});
				}
				
				//check if token expired
				if (new Date(tokenRecord.expires).getTime() < new Date().getTime()) {
					libProduct.model.closeConnection(req.soajs);
					req.soajs.log.error('Expired Token');
					return cb({"code": 406, "msg": req.soajs.config.errors[406]});
				}
				libProduct.model.validateId(req.soajs, tokenRecord.userId, function (err, userId) {
					var combo = {
						collection: userCollectionName,
						condition: {'_id': userId}
					};
					//get user record
					libProduct.model.findEntry(req.soajs, combo, function (error, userRecord) {
						var data = {config: req.soajs.config, error: error || !userRecord, code: 406};
						checkIfError(req, cb, data, true, function () {
							//update token status
							tokenRecord.status = 'used';
							
							//update user record email
							userRecord.email = tokenRecord.email;
							var combo1 = {
								collection: tokenCollectionName,
								record: tokenRecord
							};
							//save token in database
							libProduct.model.saveEntry(req.soajs, combo1, function (err) {
								data.error = err;
								data.code = 407;
								checkIfError(req, cb, data, true, function () {
									var combo2 = {
										collection: userCollectionName,
										record: userRecord
									};
									//save user record in database
									libProduct.model.saveEntry(req.soajs, combo2, function (err) {
										libProduct.model.closeConnection(req.soajs);
										data.error = err;
										checkIfError(req, cb, data, false, function () {
											return cb(null, true);
										});
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
		"editProfile": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			utils.updateUserRecord(req, libProduct, false, function (error) {
				if (error) {
					return cb({"code": error.code, "msg": error.msg});
				}
				return cb(null, true);
			});
		},
		"changeEmail": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			
			function updateToken(userRecord) {
				var tokenExpiryTTL = 2 * 24 * 3600000; // 2days
				if (req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.tokenExpiryTTL) {
					tokenExpiryTTL = req.soajs.servicesConfig.urac.tokenExpiryTTL;
				}
				//create new token
				var tokenRecord = {
					'userId': userRecord._id.toString(),
					'token': uuid.v4(),
					'expires': new Date(new Date().getTime() + tokenExpiryTTL),
					'status': 'active',
					'ts': new Date().getTime(),
					'service': 'changeEmail',
					'email': req.soajs.inputmaskData['email'],
					'username': userRecord.username
				};
				var combo = {
					collection: tokenCollectionName,
					condition: {
						'userId': tokenRecord.userId,
						'service': 'changeEmail',
						'status': 'active'
					},
					updatedFields: {'$set': {'status': 'invalid'}}
				};
				//set the old tokens to invalid
				libProduct.model.updateEntry(req.soajs, combo, function (err) {
					var data = {config: req.soajs.config};
					data.error = err;
					data.code = 407;
					checkIfError(req, cb, data, true, function () {
						var combo = {
							collection: tokenCollectionName,
							record: tokenRecord
						};
						//insert newly created token
						libProduct.model.insertEntry(req.soajs, combo, function (err) {
							libProduct.model.closeConnection(req.soajs);
							data.error = err;
							checkIfError(req, cb, data, false, function () {
								
								//email notification
								if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.changeEmail) {
									//send an email to the user
									var data = JSON.parse(JSON.stringify(userRecord));
									data.email = req.soajs.inputmaskData['email'];
									data.link = {
										changeEmail: utils.addTokenToLink(req.soajs.servicesConfig.urac.link.changeEmail, tokenRecord.token)
									};
									
									utils.sendMail('changeEmail', req, data, function (error) {
										return cb(null, tokenRecord.token);
									});
								}
								else {
									return cb(null, tokenRecord.token);
								}
							});
						});
					});
				});
				
			}
			
			//check if user account is there
			libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['uId'], function (err, userId) {
				if (err) {
					libProduct.model.closeConnection(req.soajs);
					return cb({"code": 411, "msg": req.soajs.config.errors[411]});
				}
				var combo = {
					collection: userCollectionName,
					condition: {'_id': userId}
				};
				libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
					var data = {config: req.soajs.config, error: err, code: 405};
					checkIfError(req, cb, data, true, function () {
						if (userRecord.email === req.soajs.inputmaskData['email']) {
							libProduct.model.closeConnection(req.soajs);
							return cb({"code": 412, "msg": req.soajs.config.errors[412]});
						}
						
						// check unique email
						var combo1 = {
							collection: userCollectionName,
							condition: {
								"_id": {"$ne": userRecord._id},
								'email': req.soajs.inputmaskData['email']
							}
						};
						libProduct.model.findEntry(req.soajs, combo1, function (err, otherRecord) {
							if (otherRecord) {
								libProduct.model.closeConnection(req.soajs);
								return cb({"code": 402, "msg": req.soajs.config.errors[402]});
							}
							updateToken(userRecord);
						});
					});
				});
			});
		},
		"changePassword": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			//check if user account is there
			libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['uId'], function (err, userId) {
				if (err) {
					libProduct.model.closeConnection(req.soajs);
					return cb({"code": 411, "msg": req.soajs.config.errors[411]});
				}
				var combo = {
					collection: userCollectionName,
					condition: {'_id': userId}
				};
				libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
					if (err || !userRecord) {
						libProduct.model.closeConnection(req.soajs);
						return cb({"code": 405, "msg": req.soajs.config.errors[405]});
					}
					
					utils.comparePwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['oldPassword'], userRecord.password, req.soajs.config, function (err, response) {
						if (err || !response) {
							req.soajs.log.error(err);
							libProduct.model.closeConnection(req.soajs);
							return cb({"code": 409, "msg": req.soajs.config.errors[409]});
						}
						else {
							//hash new password, update record and save
							userRecord.password = utils.encryptPwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['password'], req.soajs.config);
							var combo = {
								collection: userCollectionName,
								record: userRecord
							};
							libProduct.model.saveEntry(req.soajs, combo, function (err) {
								libProduct.model.closeConnection(req.soajs);
								var data = {config: req.soajs.config, error: err, code: 407};
								checkIfError(req, cb, data, false, function () {
									return cb(null, true);
								});
							});
						}
					});
				});
			});
		},
		"getUser": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			var combo = {
				collection: userCollectionName,
				condition: {
					'username': req.soajs.inputmaskData['username'],
					'status': 'active'
				}
			};
			libProduct.model.findEntry(req.soajs, combo, function (err, record) {
				libProduct.model.closeConnection(req.soajs);
				var data = {config: req.soajs.config, error: err, code: 405};
				checkIfError(req, cb, data, false, function () {
					if (!record) {
						req.soajs.log.error('Record not found for username: ' + req.soajs.inputmaskData['username']);
						return cb({"code": 405, "msg": req.soajs.config.errors[405]});
					}
					delete record.password;
					delete record.socialId;
					return cb(null, record);
				});
			});
		}
	},
	"admin": {
		"listAll": function (req, cb) {
			libProduct.model.initConnection(req.soajs);
			var combo = {
				collection: userCollectionName,
				condition: {},
				fields: {'password': 0, 'socialId': 0}
			};
			
			libProduct.model.findEntries(req.soajs, combo, function (err, userRecords) {
				var data = {config: req.soajs.config, error: err, code: 405};
				checkIfError(req, cb, data, false, function () {
					var combo = {
						collection: groupsCollectionName,
						condition: {}
					};
					libProduct.model.findEntries(req.soajs, combo, function (err, grpRecords) {
						libProduct.model.closeConnection(req.soajs);
						data.code = 415;
						data.error = err;
						checkIfError(req, cb, data, false, function () {
							return cb(null, {
								'users': userRecords,
								'groups': grpRecords
							});
						});
					});
				});
			});
		},
		"user": {
			"countUsers": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				var condition = {};
				if (req.soajs.inputmaskData['tId']) {
					condition = {"tenant.id": req.soajs.inputmaskData['tId']};
				}
				if (req.soajs.inputmaskData['keywords']) {
					var rePattern = new RegExp(req.soajs.inputmaskData['keywords'], 'i');
					condition['$or'] = [
						{"email": rePattern},
						{"username": rePattern},
						{"firstName": rePattern},
						{"lastName": rePattern}
					];
				}
				var combo = {
					collection: userCollectionName,
					condition: condition
				};
				libProduct.model.countEntries(req.soajs, combo, function (err, countUsers) {
					libProduct.model.closeConnection(req.soajs);
					var data = {config: req.soajs.config, error: err, code: 400};
					checkIfError(req, cb, data, false, function () {
						return cb(null, {count: countUsers});
					});
				});
			},
			"listUsers": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				var condition = {};
				if (req.soajs.inputmaskData['tId']) {
					condition = {"tenant.id": req.soajs.inputmaskData['tId']};
				}
				var pagination = {};
				if (req.soajs.inputmaskData.limit) {
					pagination['skip'] = req.soajs.inputmaskData.start;
					pagination['limit'] = req.soajs.inputmaskData.limit;
					pagination.sort = {};
				}
				
				if (req.soajs.inputmaskData['keywords']) {
					var rePattern = new RegExp(req.soajs.inputmaskData['keywords'], 'i');
					condition['$or'] = [
						{"email": rePattern},
						{"username": rePattern},
						{"firstName": rePattern},
						{"lastName": rePattern}
					];
				}
				var fields = {'password': 0, 'config': 0, 'socialId': 0};
				var combo = {
					collection: userCollectionName,
					condition: condition,
					fields: fields,
					options: pagination
				};
				libProduct.model.findEntries(req.soajs, combo, function (err, userRecords) {
					libProduct.model.closeConnection(req.soajs);
					var data = {config: req.soajs.config, error: err || !userRecords, code: 400};
					checkIfError(req, cb, data, false, function () {
						//if no records return empty array
						if (userRecords.length === 0) {
							return cb(null, []);
						}
						return cb(null, userRecords);
					});
				});
			},
			"getUser": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				
				libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['uId'], function (err, userId) {
					if (err) {
						libProduct.model.closeConnection(req.soajs);
						return cb({"code": 411, "msg": req.soajs.config.errors[411]});
					}
					var combo = {
						collection: userCollectionName,
						condition: {'_id': userId},
						fields: {
							socialId: 0, password: 0
						}
					};
					libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
						libProduct.model.closeConnection(req.soajs);
						var data = {config: req.soajs.config, error: err || !userRecord, code: 405};
						checkIfError(req, cb, data, false, function () {
							// delete userRecord.password;
							return cb(null, userRecord);
						});
					});
				});
			},
			"addUser": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				var condition = {
					$or: [
						{'username': req.soajs.inputmaskData['username']},
						{'email': req.soajs.inputmaskData['email']}
					]
				};
				utils.getTenantServiceConfig(req);
				var combo = {
					collection: userCollectionName,
					condition: condition
				};
				libProduct.model.findEntry(req.soajs, combo, function (err, record) {
					var data = {config: req.soajs.config, error: err, code: 414};
					checkIfError(req, cb, data, true, function () {
						//user exits
						//if(record && record.tenant.id === req.soajs.inputmaskData['tId'].toString()) {
						if (record) {
							libProduct.model.closeConnection(req.soajs);
							return cb({"code": 402, "msg": req.soajs.config.errors[402]});
						}
						
						//hash the password
						var pwd = utils.getRandomString(12, req.soajs.config);
						if (req.soajs.inputmaskData['status'] === 'active' && req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
							pwd = req.soajs.inputmaskData['password'];
						}
						pwd = utils.encryptPwd(req.soajs.servicesConfig.urac, pwd, req.soajs.config);
						
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
						if (req.soajs.inputmaskData['profile']) {
							userRecord.profile = req.soajs.inputmaskData['profile'];
						}
						if (req.soajs.inputmaskData['groups']) {
							userRecord.groups = req.soajs.inputmaskData['groups'];
						}
						if (req.soajs.inputmaskData['tId']) {
							libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['tId'], function (e, tId) {
								if (e) {
									req.soajs.log.error(e);
									libProduct.model.closeConnection(req.soajs);
									return cb({"code": 611, "msg": req.soajs.config.errors[611]});
								}
								//req.soajs.inputmaskData['tId'] = tId;
								userRecord.tenant = {
									"id": tId.toString(),
									"code": req.soajs.inputmaskData['tCode']
								};
								doInsert();
							});
						}
						else {
							doInsert();
						}
						
						function doInsert() {
							var tokenExpiryTTL = 2 * 24 * 3600000;
							if (req.soajs.servicesConfig && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.tokenExpiryTTL) {
								tokenExpiryTTL = req.soajs.servicesConfig.urac.tokenExpiryTTL;
							}
							var combo = {
								collection: userCollectionName,
								record: userRecord
							};
							//add record in db
							libProduct.model.insertEntry(req.soajs, combo, function (err, userDbRecord) {
								data.code = 400;
								data.error = err;
								var objReturn = {
									id: userDbRecord[0]._id.toString()
								};
								checkIfError(req, cb, data, true, function () {
									if (userDbRecord[0].status !== 'pendingNew') {
										libProduct.model.closeConnection(req.soajs);
										return cb(null, objReturn);
									}
									
									//create notification email
									var tokenRecord = {
										'userId': userDbRecord[0]._id.toString(),
										'token': uuid.v4(),
										'expires': new Date(new Date().getTime() + tokenExpiryTTL),
										'status': 'active',
										'ts': new Date().getTime(),
										'service': 'addUser',
										'username': userDbRecord[0].username
									};
									var combo = {
										collection: tokenCollectionName,
										record: tokenRecord
									};
									libProduct.model.insertEntry(req.soajs, combo, function (err) {
										libProduct.model.closeConnection(req.soajs);
										data.error = err;
										objReturn.token = tokenRecord.token;
										checkIfError(req, cb, data, false, function () {
											if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.addUser) {
												
												var data = userRecord;
												data.link = {
													addUser: utils.addTokenToLink(req.soajs.servicesConfig.urac.link.addUser, tokenRecord.token)
												};
												
												utils.sendMail('addUser', req, data, function (error) {
													return cb(null, objReturn);
												});
											}
											else {
												req.soajs.log.info('No Mail sent on add User');
												return cb(null, objReturn);
											}
										});
									});
								});
							});
						}
					});
				});
			},
			"editUser": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				utils.updateUserRecord(req, libProduct, true, function (error) {
					if (error) {
						return cb({"code": error.code, "msg": error.msg});
					}
					return cb(null, true);
				});
			},
			"editConfig": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['uId'], function (err, userId) {
					if (err) {
						libProduct.model.closeConnection(req.soajs);
						return cb({"code": 411, "msg": req.soajs.config.errors[411]});
					}
					
					var combo = {
						collection: userCollectionName,
						condition: {'_id': userId}
					};
					libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
						if (err || !userRecord) {
							libProduct.model.closeConnection(req.soajs);
							return cb({"code": 405, "msg": req.soajs.config.errors[405]});
						}
						// cannot change config of the locked user
						if (userRecord.locked) {
							return cb({"code": 500, "msg": req.soajs.config.errors[500]});
						}
						
						var configObj = req.soajs.inputmaskData['config'];
						if (typeof(userRecord.config) !== 'object') {
							userRecord.config = {};
						}
						if (configObj.packages) {
							userRecord.config.packages = configObj.packages;
						}
						var combo = {
							collection: userCollectionName,
							record: userRecord
						};
						//update record in the database
						libProduct.model.saveEntry(req.soajs, combo, function (err) {
							libProduct.model.closeConnection(req.soajs);
							var data = {config: req.soajs.config, error: err, code: 407};
							checkIfError(req, cb, data, false, function () {
								return cb(null, true);
							});
						});
					});
				});
			},
			"changeStatus": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				//check if user account is there
				libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['uId'], function (err, userId) {
					if (err) {
						libProduct.model.closeConnection(req.soajs);
						return cb({"code": 411, "msg": req.soajs.config.errors[411]});
					}
					utils.getTenantServiceConfig(req);
					//get user database record
					var criteria = {
						'_id': userId,
						'locked': {$ne: true}
					};
					var combo = {
						collection: userCollectionName,
						condition: criteria
					};
					/* $ne selects the documents where the value of the field is not equal (i.e. !=) to the specified value.
					 * This includes documents that do not contain the field. */
					libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
						var data = {config: req.soajs.config, error: err || !userRecord, code: 405};
						checkIfError(req, cb, data, true, function () {
							//update record entries
							userRecord.status = req.soajs.inputmaskData['status'];
							var combo1 = {
								collection: userCollectionName,
								record: userRecord
							};
							//update record in the database
							libProduct.model.saveEntry(req.soajs, combo1, function (err) {
								libProduct.model.closeConnection(req.soajs);
								data.code = 407;
								data.error = err;
								checkIfError(req, cb, data, false, function () {
									if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.changeUserStatus) {
										utils.sendMail('changeUserStatus', req, userRecord, function (error) {
											return cb(null, true);
										});
									}
									else {
										return cb(null, true);
									}
								});
							});
						});
					});
				});
			}
		},
		"group": {
			"list": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				
				var condition = {};
				if (req.soajs.inputmaskData['tId']) {
					condition = {"tenant.id": req.soajs.inputmaskData['tId']};
				}
				var combo = {
					collection: groupsCollectionName,
					condition: condition
				};
				libProduct.model.findEntries(req.soajs, combo, function (err, grpsRecords) {
					var data = {config: req.soajs.config, error: err || !grpsRecords, code: 415};
					checkIfError(req, cb, data, false, function () {
						
						libProduct.model.closeConnection(req.soajs);
						//if no records return empty array
						if (grpsRecords.length === 0) {
							return cb(null, []);
						}
						
						return cb(null, grpsRecords);
					});
				});
				
			},
			"add": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				var grpRecord = {
					"code": req.soajs.inputmaskData['code'],
					"name": req.soajs.inputmaskData['name'],
					"description": req.soajs.inputmaskData['description']
				};
				
				var condition = {
					'code': grpRecord.code
				};
				if (req.soajs.inputmaskData['tId']) {
					libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['tId'], function (err, id) {
						if (err) {
							libProduct.model.closeConnection(req.soajs);
							return cb({"code": 611, "msg": req.soajs.config.errors[611]});
						}
						req.soajs.inputmaskData['tId'] = id;
						
						grpRecord.tenant = {
							"id": req.soajs.inputmaskData['tId'].toString(),
							"code": req.soajs.inputmaskData['tCode']
						};
						condition['tenant.id'] = grpRecord.tenant.id;
						addGroup();
					});
				}
				else {
					addGroup();
				}
				
				function addGroup() {
					var combo = {
						collection: groupsCollectionName,
						condition: condition
					};
					libProduct.model.countEntries(req.soajs, combo, function (error, count) {
						var data = {config: req.soajs.config, error: error, code: 400};
						checkIfError(req, cb, data, true, function () {
							if (count > 0) {
								libProduct.model.closeConnection(req.soajs);
								return cb({"code": 421, "msg": req.soajs.config.errors[421]});
							}
							var combo = {
								collection: groupsCollectionName,
								record: grpRecord
							};
							libProduct.model.insertEntry(req.soajs, combo, function (err, result) {
								data.code = 416;
								data.error = err;
								checkIfError(req, cb, data, false, function () {
									return cb(null, true);
								});
							});
							
						});
					});
				}
				
			},
			"edit": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				//check if grp record is there
				var groupId;
				
				libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['gId'], function (err, id) {
					if (err) {
						libProduct.model.closeConnection(req.soajs);
						return cb({
							"code": 417,
							"msg": req.soajs.config.errors[417]
						});
					}
					groupId = id;
					var s = {
						'$set': {
							'description': req.soajs.inputmaskData.description,
							'name': req.soajs.inputmaskData.name
						}
					};
					
					var combo = {
						collection: groupsCollectionName,
						condition: {'_id': groupId},
						updatedFields: s,
						extraOptions: {
							'upsert': false,
							'safe': true
						}
					};
					
					libProduct.model.updateEntry(req.soajs, combo, function (error) {
						libProduct.model.closeConnection(req.soajs);
						var data = {config: req.soajs.config, error: error, code: 418};
						checkIfError(req, cb, data, false, function () {
							return cb(null, true);
						});
					});
					
				});
				
			},
			"delete": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				var groupId;
				
				libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['gId'], function (err, id) {
					if (err) {
						libProduct.model.closeConnection(req.soajs);
						return cb({"code": 417, "msg": req.soajs.config.errors[417]});
					}
					groupId = id;
					var combo = {
						collection: groupsCollectionName,
						condition: {'_id': groupId}
					};
					libProduct.model.findEntry(req.soajs, combo, function (error, record) {
						var data = {config: req.soajs.config, error: error || !record, code: 415};
						checkIfError(req, cb, data, true, function () {
							if (record.locked && record.locked === true) {
								//return error msg that this record is locked
								libProduct.model.closeConnection(req.soajs);
								return cb({"code": 500, "msg": req.soajs.config.errors[500]});
							}
							var grpCode = record.code;
							var combo = {
								collection: groupsCollectionName,
								condition: {
									'_id': groupId,
									'locked': {$ne: true}
								}
							};
							libProduct.model.removeEntry(req.soajs, combo, function (error) {
								data.code = 419;
								data.error = error;
								checkIfError(req, cb, data, true, function () {
									var userCond = {
										"groups": grpCode
									};
									if (record.tenant && record.tenant.id) {
										userCond["tenant.id"] = record.tenant.id;
									}
									var combo = {
										collection: userCollectionName,
										condition: userCond,
										updatedFields: {"$pull": {groups: grpCode}},
										extraOptions: {multi: true}
									};
									
									libProduct.model.updateEntry(req.soajs, combo, function (err) {
										libProduct.model.closeConnection(req.soajs);
										data.code = 400;
										data.error = err;
										checkIfError(req, cb, data, false, function () {
											return cb(null, true);
										});
									});
								});
							});
						});
					});
				});
				
			},
			"addUsers": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				// delete from all users
				var grp = req.soajs.inputmaskData['code'];
				var grpCondition = {
					'groups': grp
				};
				if (req.soajs.inputmaskData['tId']) {
					grpCondition['tenant.id'] = req.soajs.inputmaskData['tId'];
				}
				
				var combo = {
					collection: userCollectionName,
					condition: grpCondition,
					updatedFields: {
						"$pull": {groups: grp}
					},
					extraOptions: {
						multi: true
					}
				};
				libProduct.model.updateEntry(req.soajs, combo, function (err) {
					var data = {config: req.soajs.config, error: err, code: 400};
					checkIfError(req, cb, data, true, function () {
						
						var users = req.soajs.inputmaskData['users'];
						if (users && users.length > 0) {
							var conditionUsers = {
								'username': {$in: users}
							};
							if (req.soajs.inputmaskData['tId']) {
								conditionUsers['tenant.id'] = req.soajs.inputmaskData['tId'];
							}
							var combo = {
								collection: userCollectionName,
								condition: conditionUsers,
								updatedFields: {
									$push: {groups: grp}
								},
								extraOptions: {
									multi: true
								}
							};
							
							libProduct.model.updateEntry(req.soajs, combo, function (err) {
								libProduct.model.closeConnection(req.soajs);
								data.error = err;
								checkIfError(req, cb, data, false, function () {
									return cb(null, true);
								});
							});
						}
						else {
							libProduct.model.closeConnection(req.soajs);
							return cb(null, true);
						}
					});
				});
				
			}
		},
		"tokens": {
			"list": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				
				var condition = {};
				var combo = {
					collection: tokenCollectionName,
					condition: condition
				};
				
				var returnObj = {
					records: []
				};
				
				function getRecords() {
					var pagination = {};
					// add pagination
					pagination['skip'] = req.soajs.inputmaskData.start;
					pagination['limit'] = req.soajs.inputmaskData.limit;
					combo.options = pagination;
					
					libProduct.model.findEntries(req.soajs, combo, function (err, records) {
						var data = {error: err || !records, code: 425};
						checkIfError(req, cb, data, false, function () {
							libProduct.model.closeConnection(req.soajs);
							returnObj.records = records;
							return cb(null, returnObj);
						});
					});
				}
				
				if (req.soajs.inputmaskData.start === 0) {
					libProduct.model.countEntries(req.soajs, combo, function (err, count) {
						var data = {error: err, code: 400};
						checkIfError(req, cb, data, false, function () {
							//if no records return empty array
							if (count === 0) {
								returnObj.totalCount = 0;
								return cb(null, returnObj);
							}
							returnObj.totalCount = count;
							getRecords();
						});
					});
				}
				else {
					getRecords();
				}
				
			},
			"delete": function (req, cb) {
				libProduct.model.initConnection(req.soajs);
				
				libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['tokenId'], function (err, tokenId) {
					if (err) {
						libProduct.model.closeConnection(req.soajs);
						return cb({
							"code": 426,
							"msg": req.soajs.config.errors[426]
						});
					}
					var combo = {
						collection: tokenCollectionName,
						condition: {'_id': tokenId}
					};
					libProduct.model.findEntry(req.soajs, combo, function (error, record) {
						var data = {config: req.soajs.config, error: error || !record, code: 425};
						checkIfError(req, cb, data, true, function () {
							
							libProduct.model.removeEntry(req.soajs, combo, function (error) {
								libProduct.model.closeConnection(req.soajs);
								data.code = 400;
								data.error = error;
								checkIfError(req, cb, data, false, function () {
									return cb(null, true);
								});
							});
						});
					});
				});
				
			}
		}
	}
};

//module.exports = libProduct;

module.exports = {
	"init": function (modelName, cb) {
		var modelPath = __dirname + "/../model/" + modelName + ".js";
		return requireModel(modelPath, cb);
		
		/**
		 * checks if model file exists, requires it and returns it.
		 * @param filePath
		 * @param cb
		 */
		function requireModel(filePath, cb) {
			//check if file exist. if not return error
			fs.exists(filePath, function (exists) {
				if (!exists) {
					return cb(new Error("Requested Model Not Found!"));
				}
				
				libProduct.model = require(filePath);
				return cb(null, libProduct);
			});
		}
	}
};