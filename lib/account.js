'use strict';
var fs = require("fs");
var uuid = require('uuid');
var userCollectionName = "users";
var tokenCollectionName = "tokens";

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
	
	/**
	 * Modifies the profile info of the user
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
	"editProfile": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		utils.updateUserRecord(req, libProduct, false, function (error) {
			if (error) {
				return cb({"code": error.code, "msg": error.msg});
			}
			return cb(null, true);
		});
	},
	
	/**
	 * Change the user email
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
	
	/**
	 * Change the user password
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
	
	/**
	 * Return the user record
	 * @param {Request Object} req
	 * @param {Callback Function} cb
	 */
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
	
};

module.exports = libProduct;