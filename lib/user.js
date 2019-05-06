'use strict';
var async = require("async");
var fs = require("fs");
var uuid = require('uuid');
var request = require("request");
var userCollectionName = "users";
var tokenCollectionName = "tokens";

var utils = require("./utils.js");

var libProduct = {
    "model": null,

    /**
     * Return the number of users
     * @param {Request Object} req
     * @param {Callback Function} cb
     */
    "countUsers": function (req, cb) {
        libProduct.model.initConnection(req.soajs);
        var condition = {};
        if (req.soajs.inputmaskData['tId']) {
            condition = {"tenant.id": req.soajs.inputmaskData['tId']};
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
     * @param {Request Object} req
     * @param {Callback Function} cb
     */
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
                {"username": rePattern},
                {"email": rePattern},
                {"firstName": rePattern},
                {"lastName": rePattern}
            ];
        }
        var fields = {'password': 0, 'config': 0, 'socialId': 0};
        if (req.soajs.inputmaskData['config']){
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
                return cb(null, userRecords);
            });
        });
    },

    /**
     * Return one user record
     * @param {Request Object} req
     * @param {Callback Function} cb
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
                    // delete userRecord.password;
                    return cb(null, userRecord);
                });
            });
        });
    },

    /**
     * Add a new user
     * @param {Request Object} req
     * @param {Callback Function} cb
     */
    "addUser": function (req, cb) {
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
                    }
                    else
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
                            if (req.soajs.inputmaskData.pin){
	                            userRecord.tenant.pin = req.soajs.inputmaskData.pin;
                            }
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
                            utils.checkIfError(req, cb, data, true, function () {
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
                                        if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.addUser) {

                                            var data = userRecord;
                                            data.link = {
                                                addUser: utils.addTokenToLink(req.soajs.servicesConfig.urac.link.addUser, tokenRecord.token)
                                            };

                                            utils.sendMail(req, 'addUser', data, function (error) {
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
            }
            else {
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
                                }
                                else return fCb();
                            });
                        });
                    }
                    else return fCb();
                }
                else {
                    return fCb();
                }
            }
        }
    },

    /**
     * Edit a user record
     * @param {Request Object} req
     * @param {Callback Function} cb
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
     * @param {Request Object} req
     * @param {Callback Function} cb
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
     * @param {Request Object} req
     * @param {Callback Function} cb
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
                            if (req.soajs.servicesConfig.mail && req.soajs.servicesConfig.urac && req.soajs.servicesConfig.urac.mail && req.soajs.servicesConfig.urac.mail.changeUserStatus) {
                                utils.sendMail(req, 'changeUserStatus', userRecord, function (error) {
                                    return cb(null, true);
                                });
                            }
                            else {
                                req.soajs.log.debug("No mail Sent");
                                return cb(null, true);
                            }
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
					if (oneTenant.tenant && oneTenant.tenant.id
						&& oneTenant.tenant.id === req.soajs.inputmaskData.tenantId) {
						found = true;
					}
				});
			}
			
			if (found) {
				return cb({"code": 429, "msg": req.soajs.config.errors[429]});
			}
			
			let obj = {
				"tenant": {
					id: req.soajs.inputmaskData.tenantId,
					code: req.soajs.inputmaskData.tenantCode
				},
			};
			if (req.soajs.inputmaskData.pin) {
				obj.tenant.pin = req.soajs.inputmaskData.pin;
			}
			if (req.soajs.inputmaskData.groups) {
				obj.groups = req.soajs.inputmaskData.groups;
			}
			userRecord.config.allowedTenants.push(obj);
			
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
				"config.allowedTenants": {"tenant.id": req.soajs.inputmaskData.tenantId}
			}
		};
		combo.extraOptions = {'multi': true};
		//validate the user record
		libProduct.model.updateEntry(req.soajs, combo, function (err, res) {
			libProduct.model.closeConnection(req.soajs);
			if (err) {
				return cb({"code": 405, "msg": req.soajs.config.errors[405]});
			}
			return cb(null, res);
		});
	},
	/**
	 * Invite User
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
			}).indexOf(req.soajs.inputmaskData.tenantId);
			
			if (index === -1) {
				return cb({"code": 430, "msg": req.soajs.config.errors[430]});
			} else {
				if (!allowedTenants[index].tenant.pin) {
					allowedTenants[index].tenant.pin = {};
				}
				if (req.soajs.inputmaskData.pin) {
					allowedTenants[index].tenant.pin.code = req.soajs.inputmaskData.pin.code;
					if (req.soajs.inputmaskData.pin.hasOwnProperty("allowed")) {
						allowedTenants[index].tenant.pin.allowed = req.soajs.inputmaskData.pin.allowed;
					}
				}
				if (req.soajs.inputmaskData.groups){
					allowedTenants[index].groups = req.soajs.inputmaskData.groups;
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
			}).indexOf(req.soajs.inputmaskData.tenantId);
			
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
	}
};

module.exports = libProduct;