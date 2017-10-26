'use strict';
var fs = require("fs");
var uuid = require('uuid');
var userCollectionName = "users";
var groupsCollectionName = "groups";

var guest = require("./guest.js");
var account = require("./account.js");
var user = require("./user.js");
var group = require("./group.js");
var token = require("./token.js");

var utils = require("./utils.js");

var Mongo = require("soajs").mongo;
var mongoCore = null;

var soajs = require("soajs");
var Auth = soajs.authorization;

function checkIfTenantIsDBTN(req, cb) {
	if (!mongoCore) {
		mongoCore = new Mongo(req.soajs.registry.coreDB.provision);
	}
	
	if (!req.soajs.inputmaskData) {
		req.soajs.inputmaskData = {};
	}
	req.soajs.inputmaskData.isOwner = true;
	req.soajs.inputmaskData.tCode = 'DBTN';
	
	mongoCore.findOne('tenants', { 'locked': true }, { applications: 0 }, function (error, tenant) {
		if (!error) {
			req.soajs.inputmaskData.tCode = tenant.code;
		}
		return cb(error, true);
	});
}

var libProduct = {
	"model": null,
	
	"guest": guest,
	
	"account": account,
	
	"admin": {
		/**
		 * List all the users and groups
		 * @param {Request Object} req
		 * @param {Callback Function} cb
		 */
		"listAll": function (req, cb) {
			checkIfTenantIsDBTN(req, function (error) {
				var data = {
					config: req.soajs.config,
					error: error,
					code: 405
				};
				utils.checkIfError(req, cb, data, false, function () {
					var combo = {
						collection: userCollectionName,
						condition: {},
						fields: {
							'password': 0, 'socialId': 0
						}
					};
					libProduct.model.initConnection(req.soajs);
					libProduct.model.findEntries(req.soajs, combo, function (err, userRecords) {
						data = {
							config: req.soajs.config,
							error: err,
							code: 405
						};
						utils.checkIfError(req, cb, data, false, function () {
							var combo = {
								collection: groupsCollectionName,
								condition: {}
							};
							libProduct.model.findEntries(req.soajs, combo, function (err, grpRecords) {
								libProduct.model.closeConnection(req.soajs);
								data.code = 415;
								data.error = err;
								utils.checkIfError(req, cb, data, false, function () {
									return cb(null, {
										'users': userRecords,
										'groups': grpRecords
									});
								});
							});
						});
					});
				});
			});
		},
		
		"user": {
			"countUsers": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.countUsers(req, cb);
					});
				});
			},
			
			"listUsers": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.listUsers(req, cb);
					});
				});
			},
			
			"getUser": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.getUser(req, cb);
					});
				});
			},
			
			"addUser": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.addUser(req, cb);
					});
				});
			},
			
			"editUser": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.editUser(req, cb);
					});
				});
			},
			
			"editConfig": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.editConfig(req, cb);
					});
				});
			},
			
			"changeStatus": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						user.changeStatus(req, cb);
					});
				});
			}
		},
		
		"group": {
			"list": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.list(req, cb);
					});
				});
			},
			
			"add": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.add(req, cb);
					});
				});
			},
			
			"edit": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.edit(req, cb);
					});
				});
			},
			
			"delete": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.delete(req, cb);
					});
				});
			},
			
			"addUsers": function (req, cb) {
				checkIfTenantIsDBTN(req, function (error) {
					var data = {
						config: req.soajs.config,
						error: error,
						code: 405
					};
					utils.checkIfError(req, cb, data, false, function () {
						group.addUsers(req, cb);
					});
				});
			}
		},
		
		"tokens": token
	},
	
	"owner": {
		"user": user,
		
		"group": group,
		
		"tokens": token
	},
	
	"tenant" : {
		"list" : function (req, cb) {
			let config = req.soajs.config;
			
			var opts = {
				collection: "tenants"
			};
			
			if (req.soajs.inputmaskData.type) {
				if (Object.hasOwnProperty.call(req.soajs.inputmaskData, "negate") && req.soajs.inputmaskData.negate === true) {
					opts.conditions = {'type': {$ne: req.soajs.inputmaskData.type}};
				}
				else {
					opts.conditions = {'type': req.soajs.inputmaskData.type};
				}
			}
			
			opts.options = {"sort": {"name": 1}};
			
			if (!mongoCore) {
				mongoCore = new Mongo(req.soajs.registry.coreDB.provision);
			}
			
			mongoCore.find(opts.collection, opts.conditions, opts.options, function (err, records) {
				utils.checkIfError(req, cb, {config: config, error: err, code: 422}, false, function () {
					//generate oauth authorization if needed.
					records.forEach(function (oneTenant) {
						if (oneTenant.oauth && oneTenant.oauth.secret && oneTenant.oauth.secret !== '') {
							oneTenant.oauth.authorization = Auth.generate(oneTenant._id, oneTenant.oauth.secret);
						}
						else {
							oneTenant.oauth.authorization = "No Authorization Enabled, update tenant and set an 'oAuth Secret' to enable token generation.";
						}
					});
					return cb(null, records);
				});
			});
		}
	}
};

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
				
				account.model = require(filePath);
				guest.model = require(filePath);
				user.model = require(filePath);
				group.model = require(filePath);
				token.model = require(filePath);
				
				libProduct.model = require(filePath);
				return cb(null, libProduct);
			});
		}
	}
};