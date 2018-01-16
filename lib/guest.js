'use strict';
var soajsUtils = require("soajs").utils;
var fs = require("fs");
var uuid = require('uuid');
var userCollectionName = "users";
var tokenCollectionName = "tokens";

var utils = require("./utils.js");

var libProduct = {
	"model": null,

	/**
	 * Creates the login through passport
	 * @param {Request Object} req
	 * @param {Object} record
	 * @param {Callback Function} cb
	 */
	"customLogin": function (req, record, cb) {
		var mode = req.soajs.inputmaskData.strategy;
		delete record.password;

		var returnRecord = soajsUtils.cloneObj(record);
		returnRecord.socialLogin = {};
		returnRecord.socialLogin = record.socialId[mode];
		returnRecord.socialLogin.strategy = mode;

		delete returnRecord.socialId;

		if (returnRecord.config && returnRecord.config.packages) {
			delete returnRecord.config.packages;
		}
		if (returnRecord.config && returnRecord.config.keys) {
			delete returnRecord.config.keys;
		}
		returnRecord._id = record._id;
		return cb(null, returnRecord);
	},
	/**
	 * Check if the username exists
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
			var data = {
				model: libProduct.model,
				error: err, code: 600, config: req.soajs.config
			};
			utils.checkIfError(req, cb, data, false, function () {
				var status = (userRecord > 0);
				return cb(null, status);
			});
		});
	},

	/**
	 * Create a new user
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
			var data = {
				model: libProduct.model,
				config: req.soajs.config, error: err, code: 400
			};
			utils.checkIfError(req, cb, data, true, function () {
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
					utils.checkIfError(req, cb, data, true, function () {
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
								utils.checkIfError(req, cb, data, false, function () {
									//send an email to the user
									var data = userRecord;
									data.link = {
										join: utils.addTokenToLink(req.soajs.servicesConfig.urac.link.join, tokenRecord.token)
									};
									utils.sendMail(req, 'join', data, function (error) {
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

	/**
	 * Sends an email to retrieve the password
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
				return cb({"code": 403, "msg": req.soajs.config.errors[403]});
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
					model: libProduct.model,
					config: req.soajs.config, error: err, code: 407
				};
				utils.checkIfError(req, cb, data, true, function () {
					var combo2 = {
						collection: tokenCollectionName,
						record: tokenRecord
					};
					libProduct.model.insertEntry(req.soajs, combo2, function (err) {
						libProduct.model.closeConnection(req.soajs);
						data.error = err;
						utils.checkIfError(req, cb, data, false, function () {
							if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.forgotPassword) {
								//send an email to the user
								var data = userRecord;
								data.link = {
									forgotPassword: utils.addTokenToLink(req.soajs.servicesConfig.urac.link.forgotPassword, tokenRecord.token)
								};

								utils.sendMail(req, 'forgotPassword', data, function () {
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

	/**
	 * Set a new password
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
					var data = {
						config: req.soajs.config, error: error || !userRecord, code: 406,
						model: libProduct.model
					};
					utils.checkIfError(req, cb, data, true, function () {
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
							utils.checkIfError(req, cb, data, true, function () {
								var combo1 = {
									collection: userCollectionName,
									record: userRecord
								};
								//save user record in database
								libProduct.model.saveEntry(req.soajs, combo1, function (err) {
									libProduct.model.closeConnection(req.soajs);
									data.error = err;
									utils.checkIfError(req, cb, data, false, function () {
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

	/**
	 * Validates the user email
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
			var data = {
				model: libProduct.model,
				config: req.soajs.config, error: err || !tokenRecord, code: 406
			};
			utils.checkIfError(req, cb, data, true, function () {
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
						utils.checkIfError(req, cb, data, true, function () {
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
								utils.checkIfError(req, cb, data, false, function () {
									var combo = {
										collection: userCollectionName,
										record: userRecord
									};
									//save user record in database
									libProduct.model.saveEntry(req.soajs, combo, function (err) {
										libProduct.model.closeConnection(req.soajs);
										data.error = err;
										utils.checkIfError(req, cb, data, false, function () {
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

	/**
	 * Validates a new email for the user
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
					var data = {
						model: libProduct.model,
						config: req.soajs.config, error: error || !userRecord, code: 406
					};
					utils.checkIfError(req, cb, data, true, function () {
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
							utils.checkIfError(req, cb, data, true, function () {
								var combo2 = {
									collection: userCollectionName,
									record: userRecord
								};
								//save user record in database
								libProduct.model.saveEntry(req.soajs, combo2, function (err) {
									libProduct.model.closeConnection(req.soajs);
									data.error = err;
									utils.checkIfError(req, cb, data, false, function () {
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
};

module.exports = libProduct;