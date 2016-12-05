'use strict';
var soajsCore = require('soajs');
var Hasher = soajsCore.hasher;
var userCollectionName = "users";
var groupsCollectionName = "groups";

var utils = {
	"sendMail": function (apiName, req, data, cb) {
		var servicesConfig = req.soajs.servicesConfig;
		var transportConfiguration = servicesConfig.mail.transport || null;
		var mailer = new (soajsCore.mail)(transportConfiguration);
		data.limit = servicesConfig.urac.tokenExpiryTTL / (3600 * 1000);
		
		var mailOptions = {
			'to': data.email,
			'from': servicesConfig.mail.from,
			'subject': servicesConfig.urac.mail[apiName].subject,
			'data': data
		};
		if (servicesConfig.urac.mail[apiName].content) {
			mailOptions.content = servicesConfig.urac.mail[apiName].content;
		} else {
			mailOptions.path = servicesConfig.urac.mail[apiName].path;
		}
		delete data.password;
		delete data._id;
		
		mailer.send(mailOptions, function (error) {
			if (error) {
				req.soajs.log.error(error);
			}
			return cb(null, true);
		});
	},
	"getTenantServiceConfig": function (req) {
		var servicesConfig = req.soajs.servicesConfig;
		if (req.soajs.inputmaskData.tCode) {
			if (Object.hasOwnProperty.call(servicesConfig, 'tenantCodes')) {
				if (Object.hasOwnProperty.call(servicesConfig.tenantCodes, req.soajs.inputmaskData.tCode)) {
					if (servicesConfig.tenantCodes[req.soajs.inputmaskData.tCode].urac) {
						servicesConfig.urac = servicesConfig.tenantCodes[req.soajs.inputmaskData.tCode].urac;
					}
					if (servicesConfig.tenantCodes[req.soajs.inputmaskData.tCode].mail) {
						servicesConfig.mail = servicesConfig.tenantCodes[req.soajs.inputmaskData.tCode].mail;
					}
				}
			}
		}
	},
	"getRandomString": function (length, config) {
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
	},
	"addTokenToLink": function (link, token) {
		link += (link.indexOf("?") === -1) ? '?token=' + token : "&token=" + token;
		return link;
	},
	"updateUserRecord": function (req, libProduct, complete, cb) {
		//check if user account is there
		libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['uId'], function (e, userId) {
			if (e) {
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
				
				if (complete && userRecord.locked) {
					return cb({"code": 500, "msg": req.soajs.config.errors[500]});
				}
				if (req.soajs.inputmaskData['groups'] && Array.isArray(req.soajs.inputmaskData['groups']) && req.soajs.inputmaskData['groups'].length > 0) {
					var condition = {
						"code": {"$in": req.soajs.inputmaskData['groups']}
					};
					if (userRecord.tenant && userRecord.tenant.id) {
						if (!Object.hasOwnProperty.call(req.soajs.inputmaskData, 'tCode')) {
							condition["tenant.id"] = userRecord.tenant.id;
						}
					}
					var combo1 = {
						collection: groupsCollectionName,
						condition: condition
					};
					// check that the groups exist
					libProduct.model.findEntries(req.soajs, combo1, function (err, groups) {
						if (err || !groups || groups.length === 0) {
							return cb({'code': 415, 'msg': req.soajs.config.errors[415]});
						}
						resumeEdit(userRecord, userId);
					});
				}
				else {
					resumeEdit(userRecord, userId);
				}
				
			});
		});
		
		function resumeEdit(userRecord, userId) {
			//check if username is taken by another account
			var condition = {
				'_id': {'$ne': userId},
				'username': req.soajs.inputmaskData['username']
			};
			//if(complete) {
			//	condition['tenant.id'] = userRecord.tenant.id;
			//}
			var combo = {
				collection: userCollectionName,
				condition: condition
			};
			libProduct.model.countEntries(req.soajs, combo, function (err, count) {
				if (err) {
					libProduct.model.closeConnection(req.soajs);
					return cb({"code": 407, "msg": req.soajs.config.errors[407]});
				}
				
				//if count > 0 then this username is taken by another account, return error
				if (count > 0) {
					libProduct.model.closeConnection(req.soajs);
					return cb({"code": 410, "msg": req.soajs.config.errors[410]});
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
						userRecord.password = utils.encryptPwd(req.soajs.servicesConfig.urac, req.soajs.inputmaskData['password'], req.soajs.config);
					}
				}
				
				if (req.soajs.inputmaskData['profile']) {
					userRecord.profile = req.soajs.inputmaskData['profile'];
				}
				var combo = {
					collection: userCollectionName,
					record: userRecord
				};
				//update record in the database
				libProduct.model.saveEntry(req.soajs, combo, function (err) {
					libProduct.model.closeConnection(req.soajs);
					if (err) {
						return cb({"code": 407, "msg": req.soajs.config.errors[407]});
					}
					return cb(null, true);
				});
			});
		}
	},
	"encryptPwd": function (servicesConfig, pwd, config) {
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
		
		Hasher.init(hashConfig);
		if (servicesConfig && servicesConfig.optionalAlgorithm && servicesConfig.optionalAlgorithm !== '') {
			var crypto = require("crypto");
			var hash = crypto.createHash(servicesConfig.optionalAlgorithm);
			pwd = hash.update(pwd).digest('hex');
		}
		
		return Hasher.hash(pwd);
	},
	"comparePwd": function (servicesConfig, pwd, cypher, config, cb) {
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

		Hasher.init(hashConfig);
		if (servicesConfig && servicesConfig.optionalAlgorithm && servicesConfig.optionalAlgorithm !== '') {
			var crypto = require("crypto");
			var hash = crypto.createHash(servicesConfig.optionalAlgorithm);
			pwd = hash.update(pwd).digest('hex');
		}
		
		Hasher.compare(pwd, cypher, cb);
	}
};

module.exports = utils;