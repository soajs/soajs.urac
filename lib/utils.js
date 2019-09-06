'use strict';
var fs = require('fs');
var path = require("path");
var request = require("request");

var soajsCore = require('soajs');
var Hasher = soajsCore.hasher;
var userCollectionName = "users";
var groupsCollectionName = "groups";

var utils = {
	"checkIfError": function (req, mainCb, data, flag, cb) {
		if (data.error) {
			if (typeof (data.error) === 'object' && data.error.message) {
				req.soajs.log.error(data.error);
			}
			if (flag) {
				data.model.closeConnection(req.soajs);
			}
			return mainCb({ "code": data.code, "msg": req.soajs.config.errors[data.code] });
		}
		else {
			return cb();
		}
	},
	
	/**
	 * Send an email
	 * @param {Request Object} req
	 * @param {String} apiName
	 * @param {Object} data
	 * @param {Callback Function} cb
	 */
	"sendMail": function (req, apiName, data, tokenRecord, cb) {
		if (!cb && typeof tokenRecord === "function") {
			cb = tokenRecord;
            tokenRecord = null;
		}
        let mailConf = null;
        if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.mail.transport && req.soajs.servicesConfig.mail.from) {
            mailConf = req.soajs.servicesConfig.mail;
        }
        else if (req.soajs.registry && req.soajs.registry.custom && req.soajs.registry.custom.mail && req.soajs.registry.custom.mail.value) {
            mailConf = req.soajs.registry.custom.mail.value;
		}
        let transportConfiguration = null;
        let from = "";
		if (mailConf) {
            transportConfiguration = req.soajs.servicesConfig.mail.transport;
            from = req.soajs.servicesConfig.mail.from;

			let uracConf = null;
            if (req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail[apiName]) {
                uracConf = req.soajs.servicesConfig.urac;
            }
            else if (req.soajs.registry && req.soajs.registry.custom && req.soajs.registry.custom.urac && req.soajs.registry.custom.urac.value) {
                uracConf = req.soajs.registry.custom.urac.value;
			}
			if (uracConf) {
				if (uracConf.link && uracConf.link[apiName] && tokenRecord){
                    data.link = {
                        [apiName]: utils.addTokenToLink(uracConf.link[apiName], tokenRecord.token)
                    };
				}
                let mailer = new (soajsCore.mail)(transportConfiguration);
                data.limit = uracConf.tokenExpiryTTL / (3600 * 1000);
                if (data.ts) {
                    let ts = new Date();
                    data.ts = ts.toString();
                }
                let mailOptions = {
                    'to': data.email,
                    'from': from,
                    'subject': uracConf.mail[apiName].subject,
                    'data': data
                };
                if (uracConf.mail[apiName] && uracConf.mail[apiName].content) {
                    mailOptions.content = uracConf.mail[apiName].content;
                } else {
                    mailOptions.path = path.normalize(__dirname + "/../mail/urac/" + apiName + ".tmpl");

                    if (fs.existsSync(uracConf.mail[apiName].path)) {
                        mailOptions.path = uracConf.mail[apiName].path;
                    }
                }

                delete data.password;
                delete data._id;

                if (process.env.SOAJS_TEST) {
                    return cb(null, true);
                }

                mailer.send(mailOptions, function (error) {
                    if (error) {
                        req.soajs.log.error(error);
                    }
                    return cb(null, true);
                });
			}
			else {
                let error = new Error("URAC mail configuration is missing! for: " + apiName);
                return cb(error, false);
			}
        }
        else {
            let error = new Error("Mail configuration is missing! for: " + apiName);
            return cb(error, false);
        }
		/*
		var servicesConfig = req.soajs.servicesConfig;
		var transportConfiguration = servicesConfig.mail.transport || null;
		req.soajs.log.debug(transportConfiguration);
		var mailer = new (soajsCore.mail)(transportConfiguration);
		data.limit = servicesConfig.urac.tokenExpiryTTL / (3600 * 1000);
		if (data.ts) {
			var ts = new Date();
			data.ts = ts.toString();
		}
		var mailOptions = {
			'to': data.email,
			'from': from,
			'subject': servicesConfig.urac.mail[apiName].subject,
			'data': data
		};
		if (servicesConfig.urac.mail[apiName] && servicesConfig.urac.mail[apiName].content) {
			mailOptions.content = servicesConfig.urac.mail[apiName].content;
		} else {
			mailOptions.path = path.normalize(__dirname + "/../mail/urac/" + apiName + ".tmpl");
			
			if (fs.existsSync(servicesConfig.urac.mail[apiName].path)) {
				mailOptions.path = servicesConfig.urac.mail[apiName].path;
			}
		}
		delete data.password;
		delete data._id;
		
		if (process.env.SOAJS_TEST) {
			return cb(null, true);
		}
		
		mailer.send(mailOptions, function (error) {
			if (error) {
				req.soajs.log.error(error);
			}
			return cb(null, true);
		});
		*/
	},
	
	/**
	 * Return the tenant Services Config
	 * @param {Request Object} req
	 */
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
	
	/**
	 * Generate a random string
	 * @param {Number} length
	 * @param {object} config
	 */
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
	
	/**
	 * Append the token value to a URL link
	 * @param {String} link
	 * @param {String} token
	 */
	"addTokenToLink": function (link, token) {
		link += (link.indexOf("?") === -1) ? '?token=' + token : "&token=" + token;
		return link;
	},
	
	/**
	 * Update the user record in the database
	 * @param {Request Object} req
	 * @param {Model Object} model
	 * @param {Boolean} complete
	 * @param {Callback Function} cb
	 */
	"updateUserRecord": function (req, model, complete, cb) {
		//check if user account is there
		model.validateId(req.soajs, req.soajs.inputmaskData['uId'], function (e, userId) {
			if (e) {
				model.closeConnection(req.soajs);
				return cb({ "code": 411, "msg": req.soajs.config.errors[411] });
			}
			var combo = {
				collection: userCollectionName,
				condition: { '_id': userId }
			};
			model.findEntry(req.soajs, combo, function (err, userRecord) {
				if (err || !userRecord) {
					model.closeConnection(req.soajs);
					return cb({ "code": 405, "msg": req.soajs.config.errors[405] });
				}
				
				if (!req.soajs.tenant.locked && complete && userRecord.locked) {
					return cb({ "code": 500, "msg": req.soajs.config.errors[500] });
				}
				if (req.soajs.inputmaskData['groups'] && Array.isArray(req.soajs.inputmaskData['groups']) && req.soajs.inputmaskData['groups'].length > 0) {
					var condition = {
						"code": { "$in": req.soajs.inputmaskData['groups'] }
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
					model.findEntries(req.soajs, combo1, function (err, groups) {
						if (err || !groups || groups.length === 0) {
							return cb({ 'code': 415, 'msg': req.soajs.config.errors[415] });
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
				'_id': { '$ne': userId },
				'username': req.soajs.inputmaskData['username']
			};
			//if(complete) {
			//	condition['tenant.id'] = userRecord.tenant.id;
			//}
			var combo = {
				collection: userCollectionName,
				condition: condition
			};
			model.countEntries(req.soajs, combo, function (err, count) {
				if (err) {
					model.closeConnection(req.soajs);
					return cb({ "code": 407, "msg": req.soajs.config.errors[407] });
				}
				
				//if count > 0 then this username is taken by another account, return error
				if (count > 0) {
					model.closeConnection(req.soajs);
					return cb({ "code": 410, "msg": req.soajs.config.errors[410] });
				}
				
				//update record entries
				userRecord.username = req.soajs.inputmaskData['username'];
				userRecord.firstName = req.soajs.inputmaskData['firstName'];
				userRecord.lastName = req.soajs.inputmaskData['lastName'];
				
				if (complete) {
					userRecord.email = req.soajs.inputmaskData['email'];
					// cannot change status or groups or config of the locked user
					if (!userRecord.locked) {
						if (req.soajs.inputmaskData['config']) {
							var configObj = req.soajs.inputmaskData['config'];
							if (typeof(userRecord.config) !== 'object') {
								userRecord.config = {};
							}
							if (configObj.packages) {
								userRecord.config.packages = configObj.packages;
							}
                            if (configObj.keys) {
                                userRecord.config.keys = configObj.keys;
                            }
                            if (configObj.allowedTenants) {
                                userRecord.config.allowedTenants = configObj.allowedTenants;
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
					if (req.soajs.inputmaskData.pin){
						if (!userRecord.tenant.pin){
							userRecord.tenant.pin = {};
						}
						if (req.soajs.inputmaskData.pin.code){
							let pinCode = getPinCodeConfig(req.soajs);
							userRecord.tenant.pin.code = makePin(pinCode);
						}
						if (req.soajs.inputmaskData.pin.hasOwnProperty('allowed')){
							userRecord.tenant.pin.allowed = req.soajs.inputmaskData.pin.allowed;
						}
					}
				}
				
				function getPinCodeConfig(soajs) {
					//service Config
					if (soajs.servicesConfig && soajs.servicesConfig.urac && soajs.servicesConfig.urac.pinConfiguration && soajs.servicesConfig.urac.pinConfiguration.charLength && soajs.servicesConfig.pinConfiguration.pin.characters) {
						return soajs.servicesConfig.pinConfiguration.pin;
					}
					//custom registry
					else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.pinConfiguration && soajs.registry.custom.pinConfiguration.value && soajs.registry.custom.pinConfiguration.value.charLength && soajs.registry.custom.pinConfiguration.value.characters) {
						return soajs.registry.custom.pinConfiguration.value;
					}
					
					//default
					else {
						return soajs.config.pinConfiguration;
					}
				}
				
				function makePin(pinCode) {
					let result = '';
					let charactersLength = pinCode.characters.length;
					for (let i = 0; i < pinCode.charLength; i++) {
						result += pinCode.characters.charAt(Math.floor(Math.random() * charactersLength));
					}
					return result;
				}
				
				if (req.soajs.inputmaskData['profile']) {
					userRecord.profile = req.soajs.inputmaskData['profile'];
				}
				var combo = {
					collection: userCollectionName,
					record: userRecord
				};
				//update record in the database
				model.saveEntry(req.soajs, combo, function (err) {
					model.closeConnection(req.soajs);
					if (err) {
						return cb({ "code": 407, "msg": req.soajs.config.errors[407] });
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
	
	/**
	 *
	 * @param {Object} servicesConfig
	 * @param {String} pwd
	 * @param {String} cypher
	 * @param {Object} config
	 * @param {Callback Function} cb
	 */
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
	},
	
	"getTenantExtKey": function (req, mCb) {
		req.soajs.awareness.getHost('controller', function (host) {
			let options = {
				"uri": 'http://' + host + ':' + req.soajs.registry.services.controller.port + "/key/permission/get",
				"headers": {
					'Content-Type': 'application/json',
					'accept': 'application/json',
					'connection': 'keep-alive',
					'key': req.headers.key,
					'soajsauth': req.headers.soajsauth
				},
				"qs": {
					"soajs_project": req.soajs.inputmaskData.soajs_project,
					"access_token": req.query.access_token
				},
				"json": true
			};
			request.post(options, (error, response, body) => {
				return mCb(error, body);
			});
		});
	},
	
	"extractServiceConfig": function (info, tenantServiceConfig, mCb) {
		info.switchTenant.applications.forEach((oneApp) => {
			oneApp.keys.forEach((oneKey) => {
				oneKey.extKeys.forEach((oneExtKey) => {
					if (oneExtKey.extKey === info.getTenantExtKey.extKey) {
						let tempServiceConfig = oneKey.config[process.env.SOAJS_ENV.toLowerCase()];
						if (tempServiceConfig.commonFields) {
							for (let i in tempServiceConfig.commonFields) {
                                if (tempServiceConfig.commonFields.hasOwnProperty(i)) {
                                    //if servicesConfig already has an entry, entry overrides commonFields
                                    if (!tenantServiceConfig[i]) {
                                        tenantServiceConfig[i] = tempServiceConfig.commonFields[i];
                                    }
                                }
                            }
						}
						
						if (tempServiceConfig["urac"]) {
							tenantServiceConfig["urac"] = tempServiceConfig["urac"];
						}
					}
				});
			});
		});
		return mCb();
	}
};

module.exports = utils;