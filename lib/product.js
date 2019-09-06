'use strict';

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

function makeId(length) {
	let result = '';
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

function calculateCode(codes, length) {
	let code = makeId(length);
	if (codes.indexOf(code) !== -1) {
		calculateCode(codes, length);
	}
	else {
		return code;
	}
}

function checkCanEdit(soajs, product, console, cb) {
	product.getProduct(function (error, record) {
		if (error) {
			return cb(600);
		}
		if (!record){
			return cb(null, record);
		}
		if (console) {
			if (record.code === soajs.config.console.product) {
				return cb(null, record);
			} else {
				return cb(null, {});
			}
		} else {
			if (soajs.tenant.locked) {
				if (record.code !== soajs.config.console.product) {
					return cb(null, record);
				} else {
					return cb(null, {});
				}
			} else {
				if (record && record.locked) {
					return cb(500);
				} else {
					if (record.code !== soajs.config.console.product) {
						return cb(null, record);
					} else {
						return cb(null, {});
					}
				}
			}
		}
	});
}

let product = {
	"list": (soajs, product, cb) => {
		product.listProducts((error, records) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: error, code: 460}, function () {
				return cb(null, records);
			});
		});
	},
	
	"listConsole": (soajs, product, cb) => {
		product.getConsoleProducts((error, record) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: error, code: 460}, function () {
				return cb(null, record);
			});
		});
	},
	
	"get": (soajs, product, cb) => {
		if (soajs.inputmaskData.id) {
			product.validateId((err) => {
				checkReturnError(soajs, cb, {
					config: soajs.config,
					error: err,
					code: 426
				}, function () {
					getData();
				});
			});
		} else if (soajs.inputmaskData.productCode) {
			getData();
		} else {
			return cb({"code": 426, "msg": soajs.config.errors[426]});
		}
		
		function getData() {
			product.getProduct((err, data) => {
				checkReturnError(soajs, cb, {
					config: soajs.config,
					error: err,
					code: 460
				}, function () {
					return cb(null, data);
				});
			});
		}
	},
	
	"getPackage": (soajs, product, cb) => {
		product.getProduct((err, product) => {
			checkReturnError(soajs, cb, {
				config: soajs.config,
				error: err || !product,
				code: 460
			}, function () {
				let pck = {};
				let found = false;
				let prefix = product.code + '_';
				for (let i = 0; i < product.packages.length; i++) {
					if (product.packages[i].code === prefix + soajs.inputmaskData.packageCode) {
						pck = product.packages[i];
						found = true;
						break;
					}
				}
				checkReturnError(soajs, cb, {
					config: soajs.config,
					error: !found,
					code: 461
				}, function () {
					return cb(null, pck);
				});
			});
		});
	},
	
	"listPackage": (soajs, product, cb) => {
		product.validateId((err) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: err, code: 426}, function () {
				product.getProduct((err, productRecords) => {
					checkReturnError(soajs, cb, {
						config: soajs.config,
						error: err || !productRecords,
						code: 461
					}, function () {
						return cb(null, productRecords.packages);
					});
				});
			});
		});
	},
	
	"add": (soajs, product, cb) => {
		let record = {
			"code": soajs.inputmaskData.code ? soajs.inputmaskData.code.toUpperCase() : null,
			"name": soajs.inputmaskData.name,
			"description": soajs.inputmaskData.description,
			"scope": {
				"acl": {}
			},
			"packages": []
		};
		
		product.listProducts((error, products) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: error, code: 410}, function () {
				//if code is not supplied, create one
				let codes = [];
				products.forEach((oneProduct)=>{
					codes.push(oneProduct.code);
				});
				let found = false;
				if (!record.code){
					record.code = calculateCode(codes, 5);
				}
				else {
					if (codes.indexOf(record.code) === -1) {
						found = true;
					}
				}
				checkReturnError(soajs, cb, {
					config: soajs.config,
					error: found,
					code: 468
				}, function () {
					product.insertProduct(record, (err, productRecord) => {
						checkReturnError(soajs, cb, {
							config: soajs.config,
							error: err,
							code: 469
						}, function () {
							return cb(null, productRecord[0]._id);
						});
					});
				});
			});
		});
	},
	
	"addConsolePackage": (soajs, product, cb) => {
		product.validateId((err) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: err, code: 426}, function () {
				soajs.inputmaskData.code = soajs.inputmaskData.code.toUpperCase();
				checkCanEdit(soajs, product, true, function (err, productRecord) {
					checkReturnError(soajs, cb, {
						config: soajs.config,
						error: err || !productRecord,
						code: err ? err : 470
					}, function () {
						let prefix = productRecord.code + '_';
						for (let i = 0; i < productRecord.packages.length; i++) {
							if (productRecord.packages[i].code === prefix + soajs.inputmaskData.code) {
								return cb({"code": 471, "msg": soajs.config.errors[471]});
							}
						}
						if (!productRecord.locked) {
							delete soajs.inputmaskData.acl[process.env.SOAJS_ENV.toLowerCase()];
						}
						
						product.listEnvironments(productRecord, function (error, env) {
							let environments = [];
							if (env) {
								environments = env;
							}
							checkReturnError(soajs, cb, {
								config: soajs.config,
								error: error || environments.length > 0,
								code: 437
							}, function () {
								if (JSON.stringify(soajs.inputmaskData.acl) !== "{}") {
									let status = false;
									let postedEnvs = Object.keys(soajs.inputmaskData.acl);
									for (let i = 0; i < environments.length; i++) {
										if (postedEnvs.indexOf(environments[i].code.toLowerCase()) !== -1) {
											status = true;
											break;
										}
									}
									
									if (!status) {
										return cb({"code": 426, "msg": soajs.config.errors[426]});
									}
								}
								
								let newPackage = {
									"code": prefix + soajs.inputmaskData.code,
									"name": soajs.inputmaskData.name,
									"description": soajs.inputmaskData.description,
									"acl": soajs.inputmaskData.acl,
									"_TTL": soajs.inputmaskData._TTL * 3600 * 1000
								};
								productRecord.packages.push(newPackage);
								
								product.saveProduct(productRecord, function (error) {
									checkReturnError(soajs, cb, {
										config: soajs.config,
										error: error,
										code: 470
									}, function () {
										return cb(null, "product package add successful");
									});
								});
							});
						});
					});
				});
			});
		});
	},
	
	"addPackage": (soajs, product, cb) => {
		product.validateId((err) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: err, code: 426}, function () {
				if(soajs.inputmaskData.code){
					soajs.inputmaskData.code = soajs.inputmaskData.code.toUpperCase();
				}
				checkCanEdit(soajs, product, false, function (err, productRecord) {
					checkReturnError(soajs, cb, {
						config: soajs.config,
						error: soajs.inputmaskData.code && (err || !productRecord) ,
						code: err ? err : 470
					}, function () {
						if (!soajs.inputmaskData.acl) {
							soajs.inputmaskData.acl = {};
						}
						let prefix = productRecord.code + '_';
						if (soajs.inputmaskData.code){
							for (let i = 0; i < productRecord.packages.length; i++) {
								if (productRecord.packages[i].code === prefix + soajs.inputmaskData.code) {
									return cb({"code": 471, "msg": soajs.config.errors[471]});
								}
							}
						}
						
						if (!soajs.inputmaskData.code){
							let codes = [];
							productRecord.packages.forEach((onePackage)=>{
								codes.push(onePackage.code);
							});
							soajs.inputmaskData.code = calculateCode(codes, 5);
						}
						if (!productRecord.locked) {
							delete soajs.inputmaskData.acl[process.env.SOAJS_ENV.toLowerCase()];
						}
						product.listEnvironments(productRecord, function (error, env) {
							let environments = [];
							if (env) {
								environments = env;
							}
							checkReturnError(soajs, cb, {
								config: soajs.config,
								error: error || environments.length === 0,
								code: 437
							}, function () {
								if (JSON.stringify(soajs.inputmaskData.acl) !== "{}") {
									let status = false;
									let postedEnvs = Object.keys(soajs.inputmaskData.acl);
									for (let i = 0; i < environments.length; i++) {
										if (postedEnvs.indexOf(environments[i].code.toLowerCase()) !== -1) {
											status = true;
											break;
										}
									}
									
									if (!status) {
										return cb({"code": 426, "msg": soajs.config.errors[426]});
									}
								}
								
								let newPackage = {
									"code": prefix + soajs.inputmaskData.code,
									"name": soajs.inputmaskData.name,
									"description": soajs.inputmaskData.description,
									"acl": soajs.inputmaskData.acl,
									"_TTL": soajs.inputmaskData._TTL * 3600 * 1000
								};
								productRecord.packages.push(newPackage);
								
								product.saveProduct(productRecord, function (error) {
									checkReturnError(soajs, cb, {
										config: soajs.config,
										error: error,
										code: 470
									}, function () {
										return cb(null, newPackage.code);
									});
								});
							});
						});
					});
				});
			});
		});
	},
	
	"update": (soajs, product, cb) => {
		product.validateId((err) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: err, code: 426}, function () {
				checkCanEdit(soajs, product, false, function (err, productRecord) {
					checkReturnError(soajs, cb, {
						config: soajs.config,
						error: err || !productRecord,
						code: err ? err : 472
					}, function () {
						product.updateProduct((err) => {
							checkReturnError(soajs, cb, {
								config: soajs.config,
								error: err,
								code: 472
							}, function () {
								return cb(null, "Product update successful");
							});
						});
					});
				});
			});
		});
	},
	
	"updateScope": (soajs, product, cb) => {
		product.validateId((err) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: err, code: 426}, function () {
				checkCanEdit(soajs, product, false, function (err, productRecord) {
					checkReturnError(soajs, cb, {
						config: soajs.config,
						error: err || !productRecord,
						code: err ? err : 472
					}, function () {
						product.sanitize(() => {
							product.updateProduct((err) => {
								checkReturnError(soajs, cb, {
									config: soajs.config,
									error: err,
									code: 472
								}, function () {
									return cb(null, "Product Scope updated successful");
								});
							});
						});
					});
				});
			});
		});
	},
	
	"updatePackage": (soajs, product, cb) => {
		product.validateId((err) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: err, code: 426}, function () {
				soajs.inputmaskData.code = soajs.inputmaskData.code.toUpperCase();
				checkCanEdit(soajs, product, false, function (err, productRecord) {
					checkReturnError(soajs, cb, {
						config: soajs.config,
						error: err || !productRecord,
						code: err ? err : 473
					}, function () {
						if (!productRecord.locked) {
							delete soajs.inputmaskData.acl[process.env.SOAJS_ENV.toLowerCase()];
						}
						product.listEnvironments(productRecord, function (error, env) {
							let environments = [];
							if (env) {
								environments = env;
							}
							checkReturnError(soajs, cb, {
								config: soajs.config,
								error: error || environments.length === 0,
								code: 437
							}, function () {
								let status = false;
								let postedEnvs = Object.keys(soajs.inputmaskData.acl);
								if (postedEnvs.length === 0) {
									status = true;
								} else {
									for (let i = 0; i < environments.length; i++) {
										if (postedEnvs.indexOf(environments[i].code.toLowerCase()) !== -1) {
											status = true;
											break;
										}
									}
								}
								
								if (!status) {
									return cb({
										"code": 471, "msg": soajs.config.errors[471]
									});
								}
								
								let prefix = productRecord.code + '_';
								
								let found = false;
								for (let i = 0; i < productRecord.packages.length; i++) {
									if (productRecord.packages[i].code === prefix + soajs.inputmaskData.code) {
										productRecord.packages[i].name = soajs.inputmaskData.name;
										productRecord.packages[i].description = soajs.inputmaskData.description;
										productRecord.packages[i]._TTL = soajs.inputmaskData._TTL * 3600 * 1000;
										productRecord.packages[i].acl = soajs.inputmaskData.acl;
										found = true;
										break;
									}
								}
								
								if (!found) {
									return cb({
										"code": 461, "msg": soajs.config.errors[461]
									});
								}
								
								product.saveProduct(productRecord, function (error) {
									checkReturnError(soajs, cb, {
										config: soajs.config,
										error: error,
										code: 473
									}, function () {
										return cb(null, "product package updated successful");
									});
								});
							});
						});
					});
				});
			});
		});
	},
	
	"purgeProduct": (soajs, product, cb) => {
		product.validateId((err) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: err, code: 426}, () => {
				product.getProduct((error, productRecord) => {
					checkReturnError(soajs, cb, {
						config: soajs.config,
						error: error || !productRecord,
						code: 472
					}, function () {
						productRecord.scope = {
							acl: {}
						};
						for (let i = 0; i < productRecord.packages.length; i++) {
							productRecord.packages[i].acl = {};
						}
						product.saveProduct(productRecord, (error) => {
							checkReturnError(soajs, cb, {
								config: soajs.config,
								error: error,
								code: 472
							}, function () {
								return cb(null, "product purged and updated successful");
							});
						});
					});
				});
			});
		});
	},
	
	"delete": (soajs, product, cb) => {
		let errorData = {};
		if (!soajs.inputmaskData.id && !soajs.inputmaskData.code) {
			return cb({"code": 474, "msg": soajs.config.errors[474]});
		}
		if (soajs.inputmaskData.code) {
			deleteProduct(cb);
		} else {
			product.validateId((err) => {
				errorData = {
					config: soajs.config,
					error: err,
					code: 426
				};
				checkReturnError(soajs, cb, errorData, function () {
					deleteProduct(cb);
				});
			});
		}
		
		function deleteProduct(cb) {
			product.getProduct((error, productRecord) => {
				errorData.error = error;
				errorData.config = soajs.config;
				errorData.code = 475;
				checkReturnError(soajs, cb, errorData, function () {
						errorData.error = !productRecord;
						errorData.code = soajs.inputmaskData.id ? 475 : 477; // invalid id / code
						checkReturnError(soajs, cb, errorData, function () {
							errorData.error = soajs.tenant.application.product === productRecord.code;
							errorData.code = 466;
							checkReturnError(soajs, cb, errorData, function () {
								errorData.error = !soajs.tenant.locked && productRecord && productRecord.locked;
								errorData.code = 500;
								checkReturnError(soajs, cb, errorData, function () {
									product.deleteProduct((error) => {
										errorData.error = error;
										errorData.code = 475;
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
	
	"deletePackage": (soajs, product, cb) => {
		product.validateId((err) => {
			checkReturnError(soajs, cb, {config: soajs.config, error: err, code: 426}, function () {
				soajs.inputmaskData.code = soajs.inputmaskData.code.toUpperCase();
				checkCanEdit(soajs, product, false, function (err, productRecord) {
					checkReturnError(soajs, cb, {
						config: soajs.config,
						error: err || !productRecord,
						code: err ? err : 460
					}, function () {
						//prevent operator from deleting the packge he is currently using, reply with error
						checkReturnError(soajs, cb, {
							config: soajs.config,
							error: productRecord.code + '_' + soajs.inputmaskData.code === soajs.tenant.application.package,
							code: 467
						}, function () {
							let found = false;
							for (let i = 0; i < productRecord.packages.length; i++) {
								if (productRecord.packages[i].code === productRecord.code + '_' + soajs.inputmaskData.code) {
									productRecord.packages.splice(i, 1);
									found = true;
									break;
								}
							}
							checkReturnError(soajs, cb, {
								config: soajs.config,
								error: !found,
								code: 461
							}, function () {
								product.saveProduct(productRecord, function (error) {
									checkReturnError(soajs, cb, {
										config: soajs.config,
										error: error,
										code: 476
									}, function () {
										return cb(null, "product package deleted successful");
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

module.exports = product;