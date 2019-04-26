'use strict';
var async = require("async");

function checkReturnError(soajs, mainCb, data, cb) {
	if (data.error) {
		if (typeof (data.error) === 'object' && (data.error.message || data.error.msg)) {
			soajs.log.error(data.error);
		}
		return mainCb({"code": data.code, "msg": data.config.errors[data.code]});
	} else {
		if (cb) {
			return cb();
		}
	}
}

let product = {
	"list": (soajs, productM, cb) => {
		let product = new productM(soajs);
		product.listProducts((error, records) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: error, code: 412}, function () {
				return cb(null, records);
			});
		});
	},
	
	"listConsole": (soajs, productM, cb) => {
		let product = new productM(soajs);
		product.listConsoleProducts((error, records) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: error, code: 412}, function () {
				return cb(null, records);
			});
		});
	},
	
	"delete": (soajs, productM, cb) => {
		let product = new productM(soajs);
		var errorData = {};
		if (!soajs.inputmaskData.id && !soajs.inputmaskData.code) {
			return cb({"code": 470, "msg": soajs.config.errors[470]});
		}
		if (soajs.inputmaskData.code) {
			deleteProduct(cb);
		} else {
			product.validateId((err) => {
				errorData = {
					config: soajs.config,
					error: err,
					code: 409
				};
				checkReturnError(soajs, cb, errorData, function () {
					deleteProduct(cb);
				});
			});
		}
		
		function deleteProduct(cb) {
			product.getProduct((error, productRecord) => {
				errorData.error = error;
				errorData.code = 414;
				checkReturnError(soajs, cb, errorData, function () {
						errorData.error = !productRecord;
						errorData.code = soajs.inputmaskData.id ? 409 : 468; // invalid id / code
						checkReturnError(soajs, cb, errorData, function () {
							errorData.error = soajs.tenant.application.product === productRecord.code;
							errorData.code = 466;
							checkReturnError(soajs, cb, errorData, function () {
								errorData.error = !soajs.tenant.locked && productRecord && productRecord.locked;
								errorData.code = 501;
								checkReturnError(soajs, cb, errorData, function () {
									product.deleteProduct((error) => {
										errorData.error = error;
										errorData.code = 414;
										checkReturnError(soajs, cb, errorData, function () {
											return cb(null, "product delete successful");
										});
									});
								});
							});
						});
					}
				);
			});
		}
	},
	
	//
	// 	"add": (config, soajs, res, cb) => {
	// 		var opts = {};
	// 		opts.collection = colName;
	// 		var record = {
	// 			"code": soajs.inputmaskData.code.toUpperCase(),
	// 			"name": soajs.inputmaskData.name,
	// 			"description": soajs.inputmaskData.description,
	// 			"scope": {
	// 				"acl": {}
	// 			},
	// 			"packages": []
	// 		};
	// 		opts.conditions = {'code': record.code};
	// 		BL.model.countEntries(soajs, opts, function (error, count) {
	// 			checkReturnError(soajs, cb, {config: config, error: error, code: 410}, function () {
	// 				checkReturnError(soajs, cb, {
	// 					config: config,
	// 					error: count > 0,
	// 					code: 413
	// 				}, function () {
	// 					opts = {};
	// 					opts.collection = colName;
	// 					opts.record = record;
	// 					BL.model.insertEntry(soajs, opts, function (err, productRecord) {
	// 						checkReturnError(soajs, cb, {
	// 							config: config,
	// 							error: err,
	// 							code: 410
	// 						}, function () {
	// 							return cb(null, productRecord[0]._id);
	// 						});
	// 					});
	// 				});
	// 			});
	// 		});
	//
	// 	},
	//
	// 	"update": (config, soajs, res, cb) => {
	// 		var opts = {};
	// 		validateId(soajs, function (err) {
	// 			checkReturnError(soajs, cb, {config: config, error: err, code: 409}, function () {
	// 				var s = {
	// 					'$set': {
	// 						'description': soajs.inputmaskData.description,
	// 						'name': soajs.inputmaskData.name
	// 					}
	// 				};
	// 				checkCanEdit(soajs, function (err) {
	// 					checkReturnError(soajs, cb, {
	// 						config: config,
	// 						error: err,
	// 						code: err
	// 					}, function () {
	// 						opts.collection = colName;
	// 						opts.conditions = {'_id': soajs.inputmaskData.id};
	// 						opts.fields = s;
	// 						opts.options = {'upsert': false, 'safe': true};
	// 						BL.model.updateEntry(soajs, opts, function (err, data) {
	// 							checkReturnError(soajs, cb, {
	// 								config: config,
	// 								error: err,
	// 								code: 411
	// 							}, function () {
	// 								return cb(null, "product update successful");
	// 							});
	// 						});
	// 					});
	// 				});
	// 			});
	// 		});
	// 	},
	//
	// 	"updateScope": (config, soajs, res, productModel, cb) => {
	// 		var opts = {};
	// 		validateId(soajs, function (err) {
	// 			checkReturnError(soajs, cb, {config: config, error: err, code: 409}, function () {
	// 				productModel.sanitize(soajs.inputmaskData.scope, function () {
	// 					var s = {
	// 						'$set': {
	// 							'scope': {
	// 								acl: soajs.inputmaskData.scope
	// 							}
	// 						}
	// 					};
	// 					opts.collection = colName;
	// 					opts.conditions = {'_id': soajs.inputmaskData.id};
	// 					opts.fields = s;
	// 					opts.options = {'upsert': false, 'safe': true};
	// 					productModel.updateEntry(soajs, BL.model, opts, function (err) {
	// 						checkReturnError(soajs, cb, {
	// 							config: config,
	// 							error: err,
	// 							code: 411
	// 						}, function () {
	// 							return cb(null, "product scope update successful");
	// 						});
	// 					});
	// 				});
	// 			});
	// 		});
	// 	},
	//
	// 	"get": (config, soajs, res, productModel, cb) => {
	// 		var opts = {
	// 			collection: colName
	// 		};
	// 		if (soajs.inputmaskData.id) {
	// 			validateId(soajs, function (err) {
	// 				checkReturnError(soajs, cb, {
	// 					config: config,
	// 					error: err,
	// 					code: 409
	// 				}, function () {
	// 					opts.conditions = {"_id": soajs.inputmaskData.id};
	// 					getData();
	// 				});
	// 			});
	// 		} else if (soajs.inputmaskData.productCode) {
	// 			opts.conditions = {"code": soajs.inputmaskData.productCode};
	// 			getData();
	// 		} else {
	// 			return cb({"code": 409, "msg": config.errors[409]});
	// 		}
	//
	// 		function getData() {
	// 			productModel.findEntry(soajs, BL.model, opts, function (err, data) {
	// 				checkReturnError(soajs, cb, {
	// 					config: config,
	// 					error: err,
	// 					code: 412
	// 				}, function () {
	// 					return cb(null, data);
	// 				});
	// 			});
	// 		}
	// 	},
	//
	// 	"deletePackage": (config, soajs, res, cb) => {
	// 		var opts = {};
	// 		validateId(soajs, function (err) {
	// 			checkReturnError(soajs, cb, {config: config, error: err, code: 409}, function () {
	// 				soajs.inputmaskData.code = soajs.inputmaskData.code.toUpperCase();
	// 				checkCanEdit(soajs, function (err) {
	// 					checkReturnError(soajs, cb, {
	// 						config: config,
	// 						error: err,
	// 						code: err
	// 					}, function () {
	// 						opts.collection = colName;
	// 						opts.conditions = {"_id": soajs.inputmaskData.id};
	// 						BL.model.findEntry(soajs, opts, function (error, productRecord) {
	// 							checkReturnError(soajs, cb, {
	// 								config: config,
	// 								error: error,
	// 								code: 419
	// 							}, function () {
	// 								//prevent operator from deleting the packge he is currently using, reply with error
	// 								checkReturnError(soajs, cb, {
	// 									config: config,
	// 									error: productRecord.code + '_' + soajs.inputmaskData.code === soajs.tenant.application.package,
	// 									code: 467
	// 								}, function () {
	// 									var found = false;
	// 									for (var i = 0; i < productRecord.packages.length; i++) {
	// 										if (productRecord.packages[i].code === productRecord.code + '_' + soajs.inputmaskData.code) {
	// 											productRecord.packages.splice(i, 1);
	// 											found = true;
	// 											break;
	// 										}
	// 									}
	// 									checkReturnError(soajs, cb, {
	// 										config: config,
	// 										error: !found,
	// 										code: 419
	// 									}, function () {
	// 										opts = {};
	// 										opts.collection = colName;
	// 										opts.record = productRecord;
	// 										BL.model.saveEntry(soajs, opts, function (error) {
	// 											checkReturnError(soajs, cb, {
	// 												config: config,
	// 												error: error,
	// 												code: 419
	// 											}, function () {
	// 												return cb(null, "product package delete successful");
	// 											});
	// 										});
	// 									});
	// 								});
	// 							});
	// 						});
	// 					});
	// 				});
	// 			});
	// 		});
	// 	},
	//
	// 	"getPackage": (config, soajs, res, cb) => {
	// 		var opts = {};
	// 		opts.collection = colName;
	// 		opts.conditions = {"code": soajs.inputmaskData.productCode};
	// 		BL.model.findEntry(soajs, opts, function (err, product) {
	// 			checkReturnError(soajs, cb, {
	// 				config: config,
	// 				error: err || !product,
	// 				code: 460
	// 			}, function () {
	// 				var pck = {};
	// 				var found = false;
	// 				for (var i = 0; i < product.packages.length; i++) {
	// 					if (product.packages[i].code === soajs.inputmaskData.packageCode) {
	// 						pck = product.packages[i];
	// 						found = true;
	// 						break;
	// 					}
	// 				}
	// 				checkReturnError(soajs, cb, {
	// 					config: config,
	// 					error: !found,
	// 					code: 461
	// 				}, function () {
	// 					return cb(null, pck);
	// 				});
	// 			});
	// 		});
	// 	},
	//
	// 	"listPackage": (config, soajs, res, cb) => {
	// 		var opts = {};
	// 		validateId(soajs, function (err) {
	// 			checkReturnError(soajs, cb, {config: config, error: err, code: 409}, function () {
	// 				opts.collection = colName;
	// 				opts.conditions = {"_id": soajs.inputmaskData.id};
	// 				BL.model.findEntry(soajs, opts, function (err, productRecords) {
	// 					checkReturnError(soajs, cb, {
	// 						config: config,
	// 						error: err,
	// 						code: 417
	// 					}, function () {
	// 						return cb(null, productRecords.packages);
	// 					});
	// 				});
	// 			});
	// 		});
	// 	},
	//
	// 	"addPackage": (config, soajs, res, cb) => {
	// 		var opts = {};
	// 		validateId(soajs, function (err) {
	// 			checkReturnError(soajs, cb, {config: config, error: err, code: 409}, function () {
	// 				soajs.inputmaskData.code = soajs.inputmaskData.code.toUpperCase();
	// 				checkCanEdit(soajs, function (err) {
	// 					checkReturnError(soajs, cb, {
	// 						config: config,
	// 						error: err,
	// 						code: err
	// 					}, function () {
	// 						opts.collection = colName;
	// 						opts.conditions = {'_id': soajs.inputmaskData.id};
	// 						soajs.log.warn(opts);
	// 						BL.model.findEntry(soajs, opts, function (error, productRecord) {
	// 							checkReturnError(soajs, cb, {
	// 								config: config,
	// 								error: error || !productRecord,
	// 								code: 415
	// 							}, function () {
	// 								var prefix = productRecord.code + '_';
	// 								for (var i = 0; i < productRecord.packages.length; i++) {
	// 									if (productRecord.packages[i].code === prefix + soajs.inputmaskData.code) {
	// 										return cb({"code": 418, "msg": config.errors[418]});
	// 									}
	// 								}
	// 								opts = {};
	// 								opts.collection = envName;
	// 								opts.fields = {"code": 1};
	//
	// 								opts.conditions = {};
	// 								if (!productRecord.locked) {
	// 									opts.conditions = {
	// 										code: {$ne: process.env.SOAJS_ENV.toUpperCase()}
	// 									};
	// 									delete soajs.inputmaskData.acl[process.env.SOAJS_ENV.toLowerCase()];
	// 								}
	// 								BL.model.findEntries(soajs, opts, function (error, environments) {
	// 									checkReturnError(soajs, cb, {
	// 										config: config,
	// 										error: error || !environments,
	// 										code: 402
	// 									}, function () {
	// 										if (JSON.stringify(soajs.inputmaskData.acl) !== "{}") {
	// 											var status = false;
	// 											var postedEnvs = Object.keys(soajs.inputmaskData.acl);
	// 											for (var i = 0; i < environments.length; i++) {
	// 												if (postedEnvs.indexOf(environments[i].code.toLowerCase()) !== -1) {
	// 													status = true;
	// 													break;
	// 												}
	// 											}
	//
	// 											if (!status) {
	// 												return cb({"code": 405, "msg": config.errors[405]});
	// 											}
	// 										}
	//
	// 										var newPackage = {
	// 											"code": prefix + soajs.inputmaskData.code,
	// 											"name": soajs.inputmaskData.name,
	// 											"description": soajs.inputmaskData.description,
	// 											"acl": soajs.inputmaskData.acl,
	// 											"_TTL": soajs.inputmaskData._TTL * 3600 * 1000
	// 										};
	// 										productRecord.packages.push(newPackage);
	//
	// 										opts = {};
	// 										opts.collection = colName;
	// 										opts.record = productRecord;
	// 										BL.model.saveEntry(soajs, opts, function (error) {
	// 											checkReturnError(soajs, cb, {
	// 												config: config,
	// 												error: error,
	// 												code: 415
	// 											}, function () {
	// 												return cb(null, "product package add successful");
	// 											});
	// 										});
	// 									});
	// 								});
	// 							});
	// 						});
	// 					});
	// 				});
	// 			});
	// 		});
	// 	},
	//
	// 	"updatePackage": (config, soajs, res, cb) => {
	// 		var opts = {};
	// 		validateId(soajs, function (err) {
	// 			checkReturnError(soajs, cb, {config: config, error: err, code: 409}, function () {
	// 				soajs.inputmaskData.code = soajs.inputmaskData.code.toUpperCase();
	// 				checkCanEdit(soajs, function (err) {
	// 					checkReturnError(soajs, cb, {config: config, error: err, code: err}, function () {
	// 						opts.collection = colName;
	// 						opts.conditions = {'_id': soajs.inputmaskData.id};
	// 						BL.model.findEntry(soajs, opts, function (error, productRecord) {
	// 							checkReturnError(soajs, cb, {
	// 								config: config,
	// 								error: error || !productRecord,
	// 								code: 416
	// 							}, function () {
	// 								opts = {};
	// 								opts.collection = envName;
	// 								opts.fields = {"code": 1};
	// 								opts.conditions = {};
	// 								if (!productRecord.locked) {
	// 									opts.conditions = {
	// 										code: {$ne: process.env.SOAJS_ENV.toUpperCase()}
	// 									};
	// 									delete soajs.inputmaskData.acl[process.env.SOAJS_ENV.toLowerCase()];
	// 								}
	// 								BL.model.findEntries(soajs, opts, function (error, environments) {
	// 									checkReturnError(soajs, cb, {
	// 										config: config,
	// 										error: error || !environments,
	// 										code: 402
	// 									}, function () {
	// 										var status = false;
	// 										var postedEnvs = Object.keys(soajs.inputmaskData.acl);
	// 										if (postedEnvs.length === 0) {
	// 											status = true;
	// 										} else {
	// 											for (var i = 0; i < environments.length; i++) {
	// 												if (postedEnvs.indexOf(environments[i].code.toLowerCase()) !== -1) {
	// 													status = true;
	// 													break;
	// 												}
	// 											}
	// 										}
	//
	// 										if (!status) {
	// 											return cb({
	// 												"code": 405, "msg": config.errors[405]
	// 											});
	// 										}
	//
	// 										var prefix = productRecord.code + '_';
	//
	// 										var found = false;
	// 										for (var i = 0; i < productRecord.packages.length; i++) {
	// 											if (productRecord.packages[i].code === prefix + soajs.inputmaskData.code) {
	// 												productRecord.packages[i].name = soajs.inputmaskData.name;
	// 												productRecord.packages[i].description = soajs.inputmaskData.description;
	// 												productRecord.packages[i]._TTL = soajs.inputmaskData._TTL * 3600 * 1000;
	// 												productRecord.packages[i].acl = soajs.inputmaskData.acl;
	// 												found = true;
	// 												break;
	// 											}
	// 										}
	//
	// 										if (!found) {
	// 											return cb({
	// 												"code": 416, "msg": config.errors[416]
	// 											});
	// 										}
	// 										opts = {};
	// 										opts.collection = colName;
	// 										opts.record = productRecord;
	// 										BL.model.saveEntry(soajs, opts, function (error) {
	// 											checkReturnError(soajs, cb, {
	// 												config: config,
	// 												error: error,
	// 												code: 416
	// 											}, function () {
	// 												return cb(null, "product package update successful");
	// 											});
	// 										});
	// 									});
	//
	// 								});
	// 							});
	// 						});
	// 					});
	// 				});
	// 			});
	// 		});
	// 	},
	//
	// 	"purgeProduct": (config, soajs, res, cb) => {
	// 		var opts = {};
	// 		validateId(soajs, function (err) {
	// 			checkReturnError(soajs, cb, {config: config, error: err, code: 409}, function () {
	// 				opts.collection = colName;
	// 				opts.conditions = {'_id': soajs.inputmaskData.id};
	// 				BL.model.findEntry(soajs, opts, function (error, productRecord) {
	// 					checkReturnError(soajs, cb, {
	// 						config: config,
	// 						error: error || !productRecord,
	// 						code: 416
	// 					}, function () {
	// 						productRecord.scope = {
	// 							acl: {}
	// 						};
	// 						for (var i = 0; i < productRecord.packages.length; i++) {
	// 							productRecord.packages[i].acl = {};
	// 						}
	// 						opts = {};
	// 						opts.collection = colName;
	// 						opts.record = productRecord;
	// 						BL.model.saveEntry(soajs, opts, function (error) {
	// 							checkReturnError(soajs, cb, {
	// 								config: config,
	// 								error: error,
	// 								code: 416
	// 							}, function () {
	// 								return cb(null, "product purged and updated successful");
	// 							});
	// 						});
	// 					});
	// 				});
	// 			});
	// 		});
	// 	}
};


module.exports = product;