'use strict';
var fs = require("fs");
var uuid = require('uuid');
var async = require("async");
var request = require("request");
var userCollectionName = "users";
var groupsCollectionName = "groups";

var utils = require("./utils.js");

var libProduct = {
    "model": null,

    /**
     * List all groups
     * @param {Request Object} req
     * @param {Callback Function} cb
     */
    "list": function (req, cb) {
        libProduct.model.initConnection(req.soajs);
        var condition = {"tenant.id":req.soajs.tenant.id.toString()};
        var combo = {
            collection: groupsCollectionName,
            condition: condition
        };
        libProduct.model.findEntries(req.soajs, combo, function (err, grpsRecords) {
            var data = {
                config: req.soajs.config, error: err || !grpsRecords, code: 415,
                model: libProduct.model
            };
            utils.checkIfError(req, cb, data, false, function () {
                libProduct.model.closeConnection(req.soajs);
                //if no records return empty array
                if (grpsRecords.length === 0) {
                    return cb(null, []);
                }

                return cb(null, grpsRecords);
            });
        });

    },

    /**
     * Add a new group
     * @param {Request Object} req
     * @param {Callback Function} cb
     */
    "add": function (req, cb) {
        libProduct.model.initConnection(req.soajs);
        var grpRecord = {
            "code": req.soajs.inputmaskData['code'],
            "name": req.soajs.inputmaskData['name'],
            "description": req.soajs.inputmaskData['description'],
            "config": req.soajs.inputmaskData['config']
        };
        var condition = {
            'code': grpRecord.code
        };
	    libProduct.model.validateId(req.soajs, req.soajs.tenant.id.toString(), function (err, id) {
		    if (err) {
			    libProduct.model.closeConnection(req.soajs);
			    return cb({"code": 611, "msg": req.soajs.config.errors[611]});
		    }
		    req.soajs.inputmaskData['tId'] = id;
		
		    grpRecord.tenant = {
			    "id": req.soajs.tenant.id.toString(),
			    "code": req.soajs.tenant.code
		    };
		    condition['tenant.id'] = grpRecord.tenant.id;
		    addGroup();
	    });

        function addGroup() {
            var combo = {
                collection: groupsCollectionName,
                condition: condition
            };
            libProduct.model.countEntries(req.soajs, combo, function (error, count) {
                var data = {
                    config: req.soajs.config, error: error, code: 400,
                    model: libProduct.model
                };
                utils.checkIfError(req, cb, data, true, function () {
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
                        utils.checkIfError(req, cb, data, false, function () {
                            return cb(null, result[0]);
                        });
                    });
                });
            });
        }
    },

    /**
     * Edit a group
     * @param {Request Object} req
     * @param {Callback Function} cb
     */
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
                }
            };
			
            if (req.soajs.inputmaskData.description){
	            s["$set"].description = req.soajs.inputmaskData.description;
            }
	        if (req.soajs.inputmaskData.name){
		        s["$set"].name = req.soajs.inputmaskData.name;
	        }
	        if (req.soajs.inputmaskData.config){
		        s["$set"].config = req.soajs.inputmaskData.config;
	        }
	        if (Object.keys(s["$set"]).length === 0){
		        return cb(null, true);
	        }
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
                var data = {
                    config: req.soajs.config, error: error, code: 418,
                    model: libProduct.model
                };
                utils.checkIfError(req, cb, data, false, function () {
                    return cb(null, true);
                });
            });

        });

    },

    /**
     * Delete a group record
     * @param {Request Object} req
     * @param {Callback Function} cb
     */
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
                var data = {
                    config: req.soajs.config, error: error || !record, code: 415,
                    model: libProduct.model
                };
                utils.checkIfError(req, cb, data, true, function () {

                    checkSAASSettings(record, () => {
                        if (!req.soajs.tenant.locked && record.locked) {
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
                            utils.checkIfError(req, cb, data, true, function () {
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

        function checkSAASSettings(groupRecord, callback) {
            if (!process.env.SOAJS_SAAS) {
                return callback();
            }
            //get the user tenant
            if (req.soajs.tenant.locked && groupRecord.tenant.code !== req.soajs.tenant.code) {
                let tenantServiceConfig = {};
                async.auto({
                    "switchTenant": (mCb) => {
                        libProduct.model.switchTenant(req.soajs, groupRecord.tenant.code, mCb);
                    },
                    "getTenantExtKey": (mCb) => {
                        utils.getTenantExtKey(req, mCb);
                    },
                    "extractServiceConfig": ["switchTenant", "getTenantExtKey", (info, mCb) => {
                        utils.extractServiceConfig(info, tenantServiceConfig, mCb);
                    }]
                }, (error) => {
                    let data = {
                        model: libProduct.model,
                        config: req.soajs.config, error: error, code: 400
                    };
                    utils.checkIfError(req, cb, data, true, function () {
                        if (!checkSAAS(groupRecord.code, tenantServiceConfig)) {
                            return cb({"code": 998, "msg": req.soajs.config.errors[998]});
                        }
                        else {
                            return callback();
                        }
                    });
                });
            }
            else {
                if (!checkSAAS(groupRecord.code, req.soajs.servicesConfig)) {
                    return cb({"code": 998, "msg": req.soajs.config.errors[998]});
                }
                else {
                    return callback();
                }
            }

            function checkSAAS(groupCode, tenantServiceConfig) {
                if (tenantServiceConfig) {
                    let serviceConfig = tenantServiceConfig.SOAJS_SAAS;

                    //if soajs_project is found in one of the applications configuration, then use ONLY that ext key
                    if (serviceConfig && serviceConfig[req.soajs.inputmaskData.soajs_project]) {
                        if (groupCode === req.soajs.inputmaskData.soajs_project) {
                            return false;
                        }
                    }
                }
                return true;
            }
        }
    },

    /**
     * Assign users to a group
     * @param {Request Object} req
     * @param {Callback Function} cb
     */
    "addUsers": function (req, cb) {
        libProduct.model.initConnection(req.soajs);
        // delete from all users
        var grp = req.soajs.tenant.code;
        var grpCondition = {
            'groups': grp
        };
        grpCondition['tenant.id'] = req.soajs.tenant.id.toString();

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
            var data = {
                config: req.soajs.config, error: err, code: 400,
                model: libProduct.model
            };
            utils.checkIfError(req, cb, data, true, function () {

                var users = req.soajs.inputmaskData['users'];
                if (users && users.length > 0) {
                    var conditionUsers = {
                        'username': {$in: users}
                    };
                    conditionUsers['tenant.id'] = req.soajs.tenant.id.toString();
                    
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
                        utils.checkIfError(req, cb, data, false, function () {
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

    },

    "addEnvironment": function (req, cb) {
        libProduct.model.initConnection(req.soajs);

        let env_s = 'config.allowedEnvironments.' + req.soajs.inputmaskData.env.toUpperCase();
        let s = {
            '$set': {
                [env_s]: {}
            }
        };
        let combo = {
            collection: groupsCollectionName,
            condition: {'code': {'$in': req.soajs.inputmaskData.groups}},
            updatedFields: s,
            extraOptions: {
                'upsert': false,
                'safe': true
            }
        };
        libProduct.model.updateEntry(req.soajs, combo, function (error) {
            libProduct.model.closeConnection(req.soajs);
            let data = {
                config: req.soajs.config, error: error, code: 400,
                model: libProduct.model
            };
            utils.checkIfError(req, cb, data, false, function () {
                return cb(null, true);
            });

        });
    },
	
	/**
	 * Get the group by id
	 * @param {Object} req
	 * @param {Function} cb
	 */
	"getGroup": function (req, cb) {
		libProduct.model.initConnection(req.soajs);
		libProduct.model.validateId(req.soajs, req.soajs.inputmaskData['id'], function (err, groupId) {
			if (err) {
				libProduct.model.closeConnection(req.soajs);
				return cb({"code": 417, "msg": req.soajs.config.errors[417]});
			}
			
			let combo = {
				collection: groupsCollectionName,
				condition: {'_id': groupId}
			};
			libProduct.model.findEntry(req.soajs, combo, function (err, grouprecord) {
				libProduct.model.closeConnection(req.soajs);
				if (err || !grouprecord) {
					libProduct.model.closeConnection(req.soajs);
					return cb({"code": 415, "msg": req.soajs.config.errors[415]});
				}
				// cannot change config of the locked user
				if (!req.soajs.tenant.locked && grouprecord.locked) {
					return cb({"code": 500, "msg": req.soajs.config.errors[500]});
				}
				return cb(null, grouprecord);
			});
		});
	},
};

module.exports = libProduct;