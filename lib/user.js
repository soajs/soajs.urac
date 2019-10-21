'use strict';
const async = require("async");
const uuid = require('uuid');
const userCollectionName = "users";
const tokenCollectionName = "tokens";
const utils = require("./utils.js");

function removePinFromResponse(record, cb) {
	if (record && record.config && record.config.allowedTenants && record.config.allowedTenants.length > 0) {
		record.config.allowedTenants.forEach((oneTenant) => {
			if (oneTenant && oneTenant.tenant && oneTenant.tenant.pin && oneTenant.tenant.pin.code) {
				oneTenant.tenant.pin.code = "****";
			}
		});
	}
	return cb();
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

function saveRecord(soajs, combo, pin, index, mainTenant, cb) {
    if (!cb && typeof mainTenant === "function") {
        cb = mainTenant;
        mainTenant = null;
    }
    let generatedPin = null;
	if (pin) {
		if (pin.code) {
			let pinCode = getPinCodeConfig(soajs);
			try {
				generatedPin = makePin(pinCode);
				if (mainTenant) {
                    combo.record.tenant.pin.code = generatedPin;
                    combo.record.tenant.pin.allowed = !!pin.allowed;
				}
				else {
                    combo.record.config.allowedTenants[index].tenant.pin.code = generatedPin;
                    combo.record.config.allowedTenants[index].tenant.pin.allowed = !!pin.allowed;
                }
			} catch (e) {
				return cb(e);
			}

		}
	}
	let modelFunction = "insertEntry";

    if (combo.record._id) {
        combo.condition = {"_id" : combo.record._id};
        combo.updatedFields = combo.record;
        modelFunction = "updateEntry";
	}
    libProduct.model[modelFunction](soajs, combo, function (err, record) {
        if (err) {
            if (err.message.indexOf("config.allowedTenants.tenant.pin.code") !== -1 || err.message.indexOf("tenant.pin.code") !== -1) {
                saveRecord(soajs, combo,  pin, index, mainTenant, cb);
            } else {
                return cb(err);
            }
        } else {
            return cb(null, generatedPin, record);
        }
    });
}

var libProduct = {
	"model": null,

	/**
	 * Return the number of users
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"countUsers": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		let condition = {"tenant.id": req.soajs.tenant.id.toString()};
		if (req.soajs.inputmaskData['keywords']) {
			var rePattern = new RegExp(req.soajs.inputmaskData['keywords'], 'i');
			condition['$or'] = [
				{"username": rePattern},
				{"email": rePattern},
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
			var data = {
				model: libProduct.model,
				config: req.soajs.config, error: err, code: 400
			};
			utils.checkIfError(req, cb, data, false, function () {
				return cb(null, {count: countUsers});
			});
		});
	},

	/**
	 * Return the users records
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"listUsers": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		let condition = {};
		let pagination = {};
		if (req.soajs.inputmaskData.limit) {
			pagination['skip'] = req.soajs.inputmaskData.start;
			pagination['limit'] = req.soajs.inputmaskData.limit;
			pagination.sort = {};
		}

		if (req.soajs.inputmaskData['keywords']) {
			var rePattern = new RegExp(req.soajs.inputmaskData['keywords'], 'i');
			condition['$or'] = [
				{"username": rePattern},
				{"email": rePattern},
				{"firstName": rePattern},
				{"lastName": rePattern}
			];
		}
		var fields = {'password': 0, 'config': 0, 'socialId': 0};
		if (req.soajs.inputmaskData['config']) {
			delete fields.config;
		}
		var combo = {
			collection: userCollectionName,
			condition: condition,
			fields: fields,
			options: pagination
		};
		libProduct.model.findEntries(req.soajs, combo, function (err, userRecords) {
			libProduct.model.closeConnection(req.soajs);
			var data = {
				model: libProduct.model,
				config: req.soajs.config, error: err || !userRecords, code: 400
			};
			utils.checkIfError(req, cb, data, false, function () {
				//if no records return empty array
				if (userRecords.length === 0) {
					return cb(null, []);
				}
				async.each(userRecords, removePinFromResponse, function () {
					return cb(null, userRecords);
				});
			});
		});
	},

	/**
	 * Return the users records by Id
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"listUsersById": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		let condition = {};
		var pagination = {};
		if (req.soajs.inputmaskData.limit) {
			pagination['skip'] = req.soajs.inputmaskData.start;
			pagination['limit'] = req.soajs.inputmaskData.limit;
			pagination.sort = {};
		}
		let ids = [];
		async.each(req.soajs.inputmaskData.uId, function (oneId, callback) {
			libProduct.model.validateId(req.soajs, oneId, function (err, id) {
				if (err) {
					//ignore
				} else {
					ids.push(id);
				}
				callback();
			});
		}, function () {
			if (ids.length === 0) {
				return cb(null, []);
			}
			condition._id = {
				"$in": ids
			};
			var fields = {'password': 0, 'config': 0, 'socialId': 0};
			if (req.soajs.inputmaskData['config']) {
				delete fields.config;
			}
			var combo = {
				collection: userCollectionName,
				condition: condition,
				fields: fields,
				options: pagination
			};
			libProduct.model.findEntries(req.soajs, combo, function (err, userRecords) {
				libProduct.model.closeConnection(req.soajs);
				var data = {
					model: libProduct.model,
					config: req.soajs.config, error: err || !userRecords, code: 400
				};
				utils.checkIfError(req, cb, data, false, function () {
					//if no records return empty array
					if (userRecords.length === 0) {
						return cb(null, []);
					}
					async.each(userRecords, removePinFromResponse, function () {
						return cb(null, userRecords);
					});
				});
			});
		});
	},

	/**
	 * Return one user record
	 * @param {Object} req
	 * @param {Function} cb
	 */
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
				var data = {
					model: libProduct.model,
					config: req.soajs.config, error: err || !userRecord, code: 405
				};
				utils.checkIfError(req, cb, data, false, function () {
					removePinFromResponse(userRecord, () => {
						return cb(null, userRecord);
					});
				});
			});
		});
	},

	/**
	 * Add a new user
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"addUser": function (req, cb) {
		/*
		if (req.soajs.tenant.type === "client" && req.soajs.tenant.main ){
			req.soajs.log.debug(req.soajs.tenant);
			req.soajs.log.error(`Tenant ${req.soajs.tenant.code} of type ${req.soajs.tenant.type} is not allowed to add a User`);
			return cb({"code": 431, "msg": req.soajs.config.errors[431]});
		}
		*/
		libProduct.model.initConnection(req.soajs);
		var condition = {
			$or: [
				{'username': req.soajs.inputmaskData['username']},
				{'email': req.soajs.inputmaskData['email']}
			]
		};

		utils.getTenantServiceConfig(req);
		checkSAASSettings(() => {
			var combo = {
				collection: userCollectionName,
				condition: condition
			};
			libProduct.model.findEntry(req.soajs, combo, function (err, record) {
				var data = {
					model: libProduct.model,
					config: req.soajs.config, error: err, code: 414
				};
				utils.checkIfError(req, cb, data, true, function () {
					//user exits
					//if(record && record.tenant.id === req.soajs.inputmaskData['tId'].toString()) {
					if (record) {
						req.soajs.log.error("user already exists");
						libProduct.model.closeConnection(req.soajs);
						return cb({"code": 402, "msg": req.soajs.config.errors[402]});
					}

					//hash the password
					var pwd = null;
					if (req.soajs.inputmaskData['status'] === 'active' && req.soajs.inputmaskData['password'] && req.soajs.inputmaskData['password'] !== '') {
						pwd = req.soajs.inputmaskData['password'];
					} else
						pwd = utils.getRandomString(12, req.soajs.config);

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
					/////
                    if (req.soajs.tenant.type === "client" && req.soajs.tenant.main ){
                        userRecord.tenant = {
                            "id": req.soajs.tenant.main.id,
                            "code": req.soajs.tenant.main.code
                        };
                        if (!userRecord.config.allowedTenants) {
                            userRecord.config.allowedTenants = [];
                        }
                        let allowedTenantObj = {
                            "tenant" : {
                                "id": req.soajs.tenant.id,
                                "code": req.soajs.tenant.code
                            }
                        };
                        if (req.soajs.inputmaskData['groups']) {
                            allowedTenantObj.groups = req.soajs.inputmaskData['groups'];
                        }
                        if (req.soajs.inputmaskData.pin) {
                            if (!allowedTenantObj.tenant.pin) {
                                allowedTenantObj.tenant.pin = {};
                            }
                            /*
                            if (req.soajs.inputmaskData.pin.code) {
                                let pinCode = getPinCodeConfig(req.soajs);
                                allowedTenantObj.tenant.pin.code = makePin(pinCode);
                                allowedTenantObj.tenant.pin.allowed = !!req.soajs.inputmaskData.pin.allowed;
                            }
                            */
                        }
                        userRecord.config.allowedTenants.push(allowedTenantObj);

                        doInsert(false);
                    }
                    else {
                        userRecord.tenant = {
                            "id": req.soajs.tenant.id,
                            "code": req.soajs.tenant.code
                        };

                        if (req.soajs.inputmaskData['groups']) {
                            userRecord.groups = req.soajs.inputmaskData['groups'];
                        }

                        if (req.soajs.inputmaskData.pin) {
                            if (!userRecord.tenant.pin) {
                                userRecord.tenant.pin = {};
                            }
                            /*
                            if (req.soajs.inputmaskData.pin.code) {
                                let pinCode = getPinCodeConfig(req.soajs);
                                userRecord.tenant.pin.code = makePin(pinCode);
                                userRecord.tenant.pin.allowed = !!req.soajs.inputmaskData.pin.allowed;
                            }
                            */
                        }

                        doInsert(true);
                    }
					/////
					/*
					userRecord.tenant = {
						"id": req.soajs.tenant.id.toString(),
						"code": req.soajs.tenant.code
					};
					if (req.soajs.inputmaskData.pin) {
						if (!userRecord.tenant.pin) {
							userRecord.tenant.pin = {};
						}
						if (req.soajs.inputmaskData.pin.code) {
							let pinCode = getPinCodeConfig(req.soajs);
							userRecord.tenant.pin.code = makePin(pinCode);
							userRecord.tenant.pin.allowed = !!req.soajs.inputmaskData.pin.allowed;
						}
					}

					doInsert();
					*/
					function doInsert(mainTenant) {
						var tokenExpiryTTL = 2 * 24 * 3600000;
						if (req.soajs.servicesConfig && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.tokenExpiryTTL) {
							tokenExpiryTTL = req.soajs.servicesConfig.urac.tokenExpiryTTL;
						}
						var combo = {
							collection: userCollectionName,
							record: userRecord
						};
						//add record in db
                        saveRecord(req.soajs, combo, req.soajs.inputmaskData.pin, 0, mainTenant, function (err, pin, userDbRecord) {

						//libProduct.model.insertEntry(req.soajs, combo, function (err, userDbRecord) {
							data.code = 400;
							data.error = err || !userDbRecord || !userDbRecord[0];
							utils.checkIfError(req, cb, data, true, function () {
								let objReturn = {
									id: userDbRecord[0]._id.toString()
								};

                                if (pin) {
                                    let data = userRecord; //JSON.parse(JSON.stringify(userDbRecord));
                                    data.pin = pin;
                                    data.tenant = req.soajs.tenant.id;
                                    utils.sendMail(req, 'invitePin', data, function (error) {
                                        if (error)
                                            req.soajs.log.info('No Mail was sent: ' + error);
                                    });
                                }

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
									utils.checkIfError(req, cb, data, false, function () {
                                        let data = userRecord;
                                        utils.sendMail(req, 'addUser', data, tokenRecord, function (error) {
                                        	if (error)
                                                req.soajs.log.info('No Mail was sent: ' + error);

                                        	//ADD email for pin
                                            // email for pin move to above is status = pendingNew
                                            // we need to send the pin email in anycase

                                            return cb(null, objReturn);
                                        });
                                        /*
										if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.addUser) {

											var data = userRecord;
											data.link = {
												addUser: utils.addTokenToLink(req.soajs.servicesConfig.urac.link.addUser, tokenRecord.token)
											};

											utils.sendMail(req, 'addUser', data, function (error) {
												return cb(null, objReturn);
											});
										} else {
											req.soajs.log.info('No Mail sent on add User');
											return cb(null, objReturn);
										}
										*/
									});
								});
							});
						});
					}
				});
			});
		});

		function checkSAASSettings(fCb) {
			//get the user tenant
			if (!process.env.SOAJS_SAAS) {
				return fCb();
			}
			if (req.soajs.tenant.locked && req.soajs.inputmaskData.tCode !== req.soajs.inputmaskData.tenantCode) {
				let tenantServiceConfig = {};
				async.auto({
					"switchTenant": (mCb) => {
						req.soajs.log.debug('switch Tenant');
						libProduct.model.switchTenant(req.soajs, req.soajs.inputmaskData.tCode, mCb);
					},
					"getTenantExtKey": (mCb) => {
						req.soajs.log.debug('getTenant ExtKey');
						utils.getTenantExtKey(req, mCb);
					},
					"extractServiceConfig": ["switchTenant", "getTenantExtKey", (info, mCb) => {
						req.soajs.log.debug('extract ServiceConfig');
						utils.extractServiceConfig(info, tenantServiceConfig, mCb);
					}]
				}, (error) => {
					let data = {
						model: libProduct.model,
						config: req.soajs.config,
						error: error,
						code: 400
					};
					utils.checkIfError(req, cb, data, true, function () {
						checkSAAS(tenantServiceConfig);
					});
				});
			} else {
				checkSAAS(req.soajs.servicesConfig);
			}

			function checkSAAS(mainServicesConfig) {
				if (mainServicesConfig) {
					let serviceConfig = mainServicesConfig.SOAJS_SAAS;
					if (serviceConfig && serviceConfig[req.soajs.inputmaskData.soajs_project]) {
						let valid = true;
						let limit = null;
						if (serviceConfig[req.soajs.inputmaskData.soajs_project]['SOAJS_SAAS_users']) {
							limit = serviceConfig[req.soajs.inputmaskData.soajs_project]['SOAJS_SAAS_users'].limit;
						}
						if (!limit) {
							return fCb();
						}
						req.soajs.log.debug("Detected SAAS Limit of:", limit);
						//count the users
						//if count > limit
						//fail
						let combo = {
							collection: userCollectionName,
							condition: {
								"tenant.code": req.soajs.inputmaskData.tCode
							}
						};
						libProduct.model.countEntries(req.soajs, combo, (error, count) => {
							let data = {
								model: libProduct.model,
								config: req.soajs.config, error: error, code: 400
							};
							utils.checkIfError(req, cb, data, true, function () {
								req.soajs.log.debug("User Count is:", count);
								if (count && count >= limit) {
									valid = false;
								}

								if (!valid) {
									return cb({"code": 999, "msg": req.soajs.config.errors[999]});
								} else return fCb();
							});
						});
					} else return fCb();
				} else {
					return fCb();
				}
			}
		}
	},

	/**
	 * Edit a user record
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"editUser": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		utils.updateUserRecord(req, libProduct.model, true, function (error) {
			if (error) {
				return cb({"code": error.code, "msg": error.msg});
			}
			return cb(null, true);
		});
	},

	/**
	 * Edit the user configuration
	 * @param {Object} req
	 * @param {Function} cb
	 */
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
				if (!req.soajs.tenant.locked && userRecord.locked) {
					return cb({"code": 500, "msg": req.soajs.config.errors[500]});
				}

				var configObj = req.soajs.inputmaskData['config'];
				if (typeof (userRecord.config) !== 'object') {
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

				var combo = {
					collection: userCollectionName,
					record: userRecord
				};
				//update record in the database
				libProduct.model.saveEntry(req.soajs, combo, function (err) {
					libProduct.model.closeConnection(req.soajs);
					var data = {
						model: libProduct.model,
						config: req.soajs.config, error: err, code: 407
					};
					utils.checkIfError(req, cb, data, false, function () {
						return cb(null, true);
					});
				});
			});
		});
	},

	/**
	 * Change the user status
	 * @param {Object} req
	 * @param {Function} cb
	 */
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
				var data = {
					model: libProduct.model,
					config: req.soajs.config, error: err || !userRecord, code: 405
				};
				utils.checkIfError(req, cb, data, true, function () {
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
						utils.checkIfError(req, cb, data, false, function () {
                            utils.sendMail(req, 'changeUserStatus', userRecord, function (error) {
                                if (error)
                                    req.soajs.log.info('No Mail was sent: ' + error);
                                return cb(null, true);
                            });
                            /*
							if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.changeUserStatus) {
								utils.sendMail(req, 'changeUserStatus', userRecord, function (error) {
									return cb(null, true);
								});
							} else {
								req.soajs.log.debug("No mail Sent");
								return cb(null, true);
							}
							*/
						});
					});
				});
			});
		});
	},

	/**
	 * Invite User
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"inviteUser": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		if (!req.soajs.inputmaskData.username && !req.soajs.inputmaskData.email) {
			return cb({"code": 428, "msg": req.soajs.config.errors[428]});
		}
		let combo = {
			collection: userCollectionName,
			condition: {
				"status": "active"
			}
		};
		if (req.soajs.inputmaskData.username) {
			combo.condition.username = req.soajs.inputmaskData.username;
		}
		if (req.soajs.inputmaskData.email) {
			combo.condition.email = req.soajs.inputmaskData.email;
		}
		//validate the user record
		libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
			if (err || !userRecord) {
				libProduct.model.closeConnection(req.soajs);
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			// cannot change config of the locked user
			if (!req.soajs.tenant.locked && userRecord.locked) {
				return cb({"code": 500, "msg": req.soajs.config.errors[500]});
			}
			if (!userRecord.config) {
				userRecord.config = {};
			}

			if (!userRecord.config.allowedTenants) {
				userRecord.config.allowedTenants = [];
			}

			let found = false;
			if (userRecord.config.allowedTenants.length > 0) {
				userRecord.config.allowedTenants.forEach((oneTenant) => {
					if (oneTenant.tenant && oneTenant.tenant.id && oneTenant.tenant.id === req.soajs.tenant.id.toString()) {
						found = true;
					}
				});
			}

			if (found) {
				return cb({"code": 429, "msg": req.soajs.config.errors[429]});
			}

			let obj = {
				"tenant": {
					id: req.soajs.tenant.id.toString(),
					code: req.soajs.tenant.code
				}
			};
			obj.tenant.pin = {};
			if (req.soajs.inputmaskData.groups) {
				obj.groups = req.soajs.inputmaskData.groups;
			}
			userRecord.config.allowedTenants.push(obj);

			let combo = {
				collection: userCollectionName,
				record: userRecord
			};
			//update record in the database
			saveRecord(req.soajs, combo, req.soajs.inputmaskData.pin, userRecord.config.allowedTenants.length - 1, function (err, pin) {
				libProduct.model.closeConnection(req.soajs);
				let data = {
					model: libProduct.model,
					config: req.soajs.config, error: err, code: 407
				};
				utils.checkIfError(req, cb, data, false, function () {
                    if (req.soajs.inputmaskData.pin && req.soajs.inputmaskData.pin.code) {
                        let data = JSON.parse(JSON.stringify(userRecord));
                        data.pin = pin;
                        data.tenant = req.soajs.tenant.code;
                        utils.sendMail(req, 'invitePin', data, function (error) {
                            if (error)
                                req.soajs.log.info('No Mail was sent: ' + error);
                            return cb(null, true);
                        });
                    }
                    else {
                        return cb(null, true);
                    }
                    /*
					if (req.soajs.inputmaskData.pin && req.soajs.inputmaskData.pin.code && req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.invitePin) {
						//send an email to the user
						let data = JSON.parse(JSON.stringify(userRecord));
						data.pin = pin;
						data.tenant = req.soajs.tenant.code;

						utils.sendMail(req, 'invitePin', data, function (error) {
							return cb(null, true);
						});
					} else {
						return cb(null, true);
					}
					*/
				});
			});
		});
	},

	/**
	 * Invite Users (bulk)
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"inviteUsers": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		let combo = {
			collection: userCollectionName,
			condition: {
				"status": "active"
			}
		};
		let updatedRecords = [];
		async.eachSeries(req.soajs.inputmaskData.users, function (oneUser, callback) {
			if (!oneUser.username && !oneUser.email) {
				return callback();
			}

			if (oneUser.username) {
				combo.condition.username = oneUser.username;
			}
			if (oneUser.email) {
				combo.condition.email = oneUser.email;
			}
			libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
				if (err) {
					return callback();
				}
				//return empty array if no uses was found
				if (!userRecord) {
					return callback();
				}


				if (!userRecord.config) {
					userRecord.config = {};
				}
				if (!userRecord.config.allowedTenants) {
					userRecord.config.allowedTenants = [];
				}

				let found = false;
				if (userRecord.config.allowedTenants.length > 0) {
					userRecord.config.allowedTenants.forEach((oneTenant) => {
						if (oneTenant.tenant && oneTenant.tenant.id && oneTenant.tenant.id === req.soajs.tenant.id.toString()) {
							found = true;
						}
					});
				}

				if (found) {
					return callback();
				}

				let obj = {
					"tenant": {
						id: req.soajs.tenant.id.toString(),
						code: req.soajs.tenant.code
					},
				};
				obj.tenant.pin = {};
				if (oneUser.groups) {
					obj.tenant.groups = oneUser.groups;
				}
				userRecord.config.allowedTenants.push(obj);

				let opts = {
					collection: userCollectionName,
					record: userRecord
				};
				//update record in the database
				saveRecord(req.soajs, opts, oneUser.pin, userRecord.config.allowedTenants.length - 1, function (err, pin) {
					if (err) {
						return callback(err);
					}
					updatedRecords.push({
						username: userRecord.username,
						email: userRecord.email
					});
                    if (oneUser.pin && oneUser.pin.code) {
                        let data = JSON.parse(JSON.stringify(userRecord));
                        data.pin = pin;
                        data.tenant = req.soajs.tenant.id;
                        utils.sendMail(req, 'invitePin', data, function (error) {
                        	if (error)
                            	req.soajs.log.info('No Mail was sent: ' + error);
                            return callback(null, true);
                        });
                    } else {
                        return callback(null, true);
                    }
					/*
					if (oneUser.pin && oneUser.pin.code && req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.invitePin) {
						//send an email to the user
						let data = JSON.parse(JSON.stringify(userRecord));
						data.pin = pin;
						data.tenant = req.soajs.tenant.id;
						utils.sendMail(req, 'invitePin', data, function (error) {
							return callback(null, true);
						});
					} else {
						return callback(null, true);
					}
					*/
				});
			});
		}, function (err) {
			if (err) {
				libProduct.model.closeConnection(req.soajs);
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			return cb(null, updatedRecords);
		});
	},

	"inviteUserByID": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		let combo = {
			collection: userCollectionName,
			condition: {
				"status": "active"
			}
		};
		//validate the user record
		libProduct.model.validateId(req.soajs, req.soajs.inputmaskData.uId, function (err, id) {
			if (err) {
				libProduct.model.closeConnection(req.soajs);
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			combo.condition._id = id;
			libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
				if (err || !userRecord) {
					libProduct.model.closeConnection(req.soajs);
					return cb({"code": 405, "msg": req.soajs.config.errors[405]});
				}
				// cannot change config of the locked user
				if (!req.soajs.tenant.locked && userRecord.locked) {
					return cb({"code": 500, "msg": req.soajs.config.errors[500]});
				}
				if (!userRecord.config) {
					userRecord.config = {};
				}

				if (!userRecord.config.allowedTenants) {
					userRecord.config.allowedTenants = [];
				}

				let found = false;
				if (userRecord.config.allowedTenants.length > 0) {
					userRecord.config.allowedTenants.forEach((oneTenant) => {
						if (oneTenant.tenant && oneTenant.tenant.id && oneTenant.tenant.id === req.soajs.tenant.id.toString()) {
							found = true;
						}
					});
				}

				if (found) {
					return cb({"code": 429, "msg": req.soajs.config.errors[429]});
				}

				let obj = {
					"tenant": {
						id: req.soajs.tenant.id.toString(),
						code: req.soajs.tenant.code
					},
				};
				obj.tenant.pin = {};
				if (req.soajs.inputmaskData.groups) {
					obj.groups = req.soajs.inputmaskData.groups;
				}
				userRecord.config.allowedTenants.push(obj);

				let combo = {
					collection: userCollectionName,
					record: userRecord
				};
				//update record in the database
				saveRecord(req.soajs, combo, req.soajs.inputmaskData.pin, userRecord.config.allowedTenants.length - 1, function (err, pin) {
					libProduct.model.closeConnection(req.soajs);
					let data = {
						model: libProduct.model,
						config: req.soajs.config, error: err, code: 407
					};
					utils.checkIfError(req, cb, data, false, function () {
                        if (req.soajs.inputmaskData.pin && req.soajs.inputmaskData.pin.code) {
                            let data = JSON.parse(JSON.stringify(userRecord));
                            data.pin = pin;
                            data.tenant = req.soajs.tenant.code;
                            utils.sendMail(req, 'invitePin', data, function (error) {
                                if (error)
                                    req.soajs.log.info('No Mail was sent: ' + error);
                                return cb(null, true);
                            });
                        } else {
                            return cb(null, true);
                        }
						/*
						if (req.soajs.inputmaskData.pin && req.soajs.inputmaskData.pin.code && req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.invitePin) {
							//send an email to the user
							let data = JSON.parse(JSON.stringify(userRecord));
							data.pin = pin;
							data.tenant = req.soajs.tenant.code;
							utils.sendMail(req, 'invitePin', data, function (error) {
								return cb(null, true);
							});
						} else {
							return cb(null, true);
						}
						*/
					});
				});
			});
		});
	},

	/**
	 * Un-invite User
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"unInviteUsers": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		if (!req.soajs.inputmaskData.username && !req.soajs.inputmaskData.email) {
			return cb({"code": 428, "msg": req.soajs.config.errors[428]});
		}
		let combo = {
			collection: userCollectionName,
			condition: {
				"status": "active"
			}
		};
		if (req.soajs.inputmaskData.username) {
			combo.condition.username = {
				"$in": req.soajs.inputmaskData.username
			};
		}
		if (req.soajs.inputmaskData.email) {
			combo.condition.email = {
				"$in": req.soajs.inputmaskData.email
			};
		}
		combo.updatedFields = {
			"$pull": {
				"config.allowedTenants": {"tenant.id": req.soajs.tenant.id.toString()}
			}
		};
		combo.extraOptions = {'multi': true};
		//validate the user record
		libProduct.model.updateEntry(req.soajs, combo, function (err, res) {
			libProduct.model.closeConnection(req.soajs);
			if (err) {
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			return cb(null, true);
		});
	},

	/**
	 * Un-invite User
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"unInviteUserByID": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		let combo = {
			collection: userCollectionName,
			condition: {
				"status": "active"
			}
		};
		libProduct.model.validateId(req.soajs, req.soajs.inputmaskData.uId, function (err, id) {
			if (err) {
				libProduct.model.closeConnection(req.soajs);
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			combo.condition._id = id;
			combo.updatedFields = {
				"$pull": {
					"config.allowedTenants": {"tenant.id": req.soajs.tenant.id.toString()}
				}
			};
			//validate the user record
			libProduct.model.updateEntry(req.soajs, combo, function (err, res) {
				libProduct.model.closeConnection(req.soajs);
				if (err) {
					return cb({"code": 405, "msg": req.soajs.config.errors[405]});
				}
				return cb(null, true);
			});
		});
	},
	/**
	 * Edit Pin Code
	 * @param {Object} req
	 * @param {Function} cb
	 */

	"addEditPinCode": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		if (!req.soajs.inputmaskData.username && !req.soajs.inputmaskData.email) {
			return cb({"code": 428, "msg": req.soajs.config.errors[428]});
		}
		let combo = {
			collection: userCollectionName,
			condition: {
				"status": "active"
			}
		};
		if (req.soajs.inputmaskData.username) {
			combo.condition.username = req.soajs.inputmaskData.username;
		}
		if (req.soajs.inputmaskData.email) {
			combo.condition.email = req.soajs.inputmaskData.email;
		}

		//validate the user record
		libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
			if (err || !userRecord) {
				libProduct.model.closeConnection(req.soajs);
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			// cannot change config of the locked user
			if (!req.soajs.tenant.locked && userRecord.locked) {
				return cb({"code": 500, "msg": req.soajs.config.errors[500]});
			}
			if (!userRecord.config || !userRecord.config.allowedTenants || userRecord.config.allowedTenants === 0) {
				return cb({"code": 430, "msg": req.soajs.config.errors[430]});
			}

			let allowedTenants = userRecord.config.allowedTenants;

			let index = allowedTenants.map(x => {
				return x.tenant.id;
			}).indexOf(req.soajs.tenant.id.toString());
			let pin;
			if (index === -1) {
				return cb({"code": 430, "msg": req.soajs.config.errors[430]});
			} else {
				if (!allowedTenants[index].tenant.pin) {
					allowedTenants[index].tenant.pin = {};
				}
				if (req.soajs.inputmaskData.pin) {
					if (req.soajs.inputmaskData.pin.code) {
						let pinCode = getPinCodeConfig(req.soajs);
						pin = makePin(pinCode);
						allowedTenants[index].tenant.pin.code = pin;
					}
					if (req.soajs.inputmaskData.pin.hasOwnProperty("allowed")) {
						allowedTenants[index].tenant.pin.allowed = req.soajs.inputmaskData.pin.allowed;
					}
				}
				if (req.soajs.inputmaskData.groups) {
					allowedTenants[index].groups = req.soajs.inputmaskData.groups;
				}
			}

			userRecord.config.allowedTenants = allowedTenants;

			let combo = {
				collection: userCollectionName,
				record: userRecord
			};
			//update record in the database
			saveRecord(req.soajs, combo, req.soajs.inputmaskData.pin, index, function (err, pin) {
				libProduct.model.closeConnection(req.soajs);
				let data = {
					model: libProduct.model,
					config: req.soajs.config, error: err, code: 407
				};
				utils.checkIfError(req, cb, data, false, function () {
                    if (req.soajs.inputmaskData.pin && req.soajs.inputmaskData.pin.code){
                        let data = JSON.parse(JSON.stringify(userRecord));
                        data.pin = pin;
                        utils.sendMail(req, 'pinCode', data, function (error) {
                        	if (error)
                            	req.soajs.log.info('No Mail was sent: ' + error);
                            return cb(null, true);
                        });
                    } else {
                        return cb(null, true);
                    }
                    /*
					if (req.soajs.inputmaskData.pin && req.soajs.inputmaskData.pin.code && req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.pinCode) {
						//send an email to the user
						let data = JSON.parse(JSON.stringify(userRecord));
						data.pin = pin;
						utils.sendMail(req, 'pinCode', data, function (error) {
							return cb(null, true);
						});
					} else {
						return cb(null, true);
					}
					*/
				});
			});
		});
	},

	/**
	 * Recover pin code of a user by mail
	 * @param {Object} req
	 * @param {Function} cb
	 */

	"recoverPinCode": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		if (!req.soajs.inputmaskData.username && !req.soajs.inputmaskData.email) {
			return cb({"code": 428, "msg": req.soajs.config.errors[428]});
		}
		let combo = {
			collection: userCollectionName,
			condition: {
				"status": "active"
			}
		};
		if (req.soajs.inputmaskData.username) {
			combo.condition.username = req.soajs.inputmaskData.username;
		}
		if (req.soajs.inputmaskData.email) {
			combo.condition.email = req.soajs.inputmaskData.email;
		}

		//validate the user record
		libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
			if (err || !userRecord) {
				libProduct.model.closeConnection(req.soajs);
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			// cannot change config of the locked user
			if (!req.soajs.tenant.locked && userRecord.locked) {
				return cb({"code": 500, "msg": req.soajs.config.errors[500]});
			}
			if (!userRecord.config || !userRecord.config.allowedTenants || userRecord.config.allowedTenants === 0) {
				return cb({"code": 430, "msg": req.soajs.config.errors[430]});
			}

			let allowedTenants = userRecord.config.allowedTenants;

			let index = allowedTenants.map(x => {
				return x.tenant.id;
			}).indexOf(req.soajs.tenant.id.toString());

			if (index === -1) {
				return cb({"code": 430, "msg": req.soajs.config.errors[430]});
			} else {
				if (allowedTenants[index] &&  allowedTenants[index].tenant &&  allowedTenants[index].tenant.pin &&  allowedTenants[index].tenant.pin.code) {
                    let data = JSON.parse(JSON.stringify(userRecord));
                    data.pin = allowedTenants[index].tenant.pin.code;
                    utils.sendMail(req, 'pinCode', data, function (error) {
                        if (error)
                            req.soajs.log.info('No Mail was sent: ' + error);
                        return cb(null, true);
                    });
                } else {
                    return cb(null, true);
                }
                /*
				if ( req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail  && req.soajs.servicesConfig.urac.mail.pinCode
				&&  allowedTenants[index] &&  allowedTenants[index].tenant &&  allowedTenants[index].tenant.pin &&  allowedTenants[index].tenant.pin.code) {
					//send an email to the user
					let data = JSON.parse(JSON.stringify(userRecord));
					data.pin = allowedTenants[index].tenant.pin.code;
					utils.sendMail(req, 'pinCode', data, function (error) {
						return cb(null, true);
					});
				} else {
					return cb(null, true);
				}
				*/
			}
		});
	},

	/**
	 * Invite User
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"deletePinCode": function (req, cb) {
		libProduct.model.initConnection(req.soajs);

		if (!req.soajs.inputmaskData.username && !req.soajs.inputmaskData.email) {
			return cb({"code": 428, "msg": req.soajs.config.errors[428]});
		}
		let combo = {
			collection: userCollectionName,
			condition: {
				"status": "active"
			}
		};
		if (req.soajs.inputmaskData.username) {
			combo.condition.username = req.soajs.inputmaskData.username;
		}
		if (req.soajs.inputmaskData.email) {
			combo.condition.email = req.soajs.inputmaskData.email;
		}

		//validate the user record
		libProduct.model.findEntry(req.soajs, combo, function (err, userRecord) {
			if (err || !userRecord) {
				libProduct.model.closeConnection(req.soajs);
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			// cannot change config of the locked user
			if (!req.soajs.tenant.locked && userRecord.locked) {
				return cb({"code": 500, "msg": req.soajs.config.errors[500]});
			}
			if (!userRecord.config || !userRecord.config.allowedTenants || userRecord.config.allowedTenants === 0) {
				return cb({"code": 430, "msg": req.soajs.config.errors[430]});
			}

			let allowedTenants = userRecord.config.allowedTenants;

			let index = allowedTenants.map(x => {
				return x.tenant.id;
			}).indexOf(req.soajs.tenant.id.toString());

			if (index === -1) {
				return cb({"code": 430, "msg": req.soajs.config.errors[430]});
			} else {
				if (allowedTenants[index].tenant.pin) {
					delete allowedTenants[index].tenant.pin;
				}
			}

			userRecord.config.allowedTenants = allowedTenants;

			let combo = {
				collection: userCollectionName,
				record: userRecord
			};
			//update record in the database
			libProduct.model.saveEntry(req.soajs, combo, function (err) {
				libProduct.model.closeConnection(req.soajs);
				let data = {
					model: libProduct.model,
					config: req.soajs.config, error: err, code: 407
				};
				utils.checkIfError(req, cb, data, false, function () {
					return cb(null, true);
				});
			});
		});
	},

	/**
	 * delete User
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"delete": function (req, cb) {
		libProduct.model.initConnection(req.soajs);

		libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['uId'], function (err, id) {
			if (err) {
				libProduct.model.closeConnection(req.soajs);
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			var combo = {
				collection: userCollectionName,
				condition: {'_id': id}
			};
			libProduct.model.findEntry(req.soajs, combo, function (error, record) {
				var data = {
					config: req.soajs.config, error: error || !record, code: 405,
					model: libProduct.model
				};
				utils.checkIfError(req, cb, data, true, function () {

					if (!req.soajs.tenant.locked && record.locked) {
						//return error msg that this record is locked
						libProduct.model.closeConnection(req.soajs);
						return cb({"code": 500, "msg": req.soajs.config.errors[500]});
					}
					var combo = {
						collection: userCollectionName,
						condition: {
							'_id': id,
							'locked': {$ne: true}
						}
					};
					libProduct.model.removeEntry(req.soajs, combo, function (error) {
						libProduct.model.closeConnection(req.soajs);
						data.code = 400;
						data.error = error;
						utils.checkIfError(req, cb, data, false, function () {
							return cb(null, true);
						});
					});
				});
			});
		});

	},
};

module.exports = libProduct;