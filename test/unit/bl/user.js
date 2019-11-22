"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/user.js');
const assert = require('assert');


describe("Unit test for: BL - user", () => {
	let soajs = {
		"tenant": {
			"code": "TES0",
			"id": "5c0e74ba9acc3c5a84a51259"
		},
		"log": {
			"error": (msg) => {
				console.log(msg);
			},
			"debug": (msg) => {
				console.log(msg);
			}
		}
	};
	
	before((done) => {
		
		BL.localConfig = helper.requireModule("config.js");
		
		done();
	});
	
	it("Get user", function (done) {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		MODEL.prototype.getUser = (data, cb) => {
			if (data && data.id && data.id === "error") {
				let error = new Error("User: getUser - mongo error.");
				return cb(error, null);
			} else if (data && data.id && data.id === "empty") {
				return cb(null, null);
			} else {
				return cb(null, data);
			}
		};
		BL.model = MODEL;
		
		BL.getUser(soajs, null, null, (error) => {
			assert.ok(error);
			
			BL.getUser(soajs, {"id": "error"}, null, (error) => {
				assert.ok(error);
				
				BL.getUser(soajs, {"id": "empty"}, null, (error) => {
					assert.ok(error);
					
					BL.getUser(soajs, {"id": "1221212121"}, null, (error, record) => {
						assert.ok(record);
						done();
					});
				});
			});
			
		});
	});
	it('Count User', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.checkUsername = (data, cb) => {
			if (data && data.username && data.username === "error") {
				let error = new Error("User: Count User - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, true);
			}
		};
		BL.model = MODEL;
		
		BL.countUser(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				username: 'Found',
				exclude_id: 'none'
			};
			BL.countUser(soajs, data, null, (err, result) => {
				assert.ok(result);
				assert.deepEqual(result, true);
				
				data.username = "error";
				BL.countUser(soajs, data, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 602);
					done();
				});
			});
		});
	});
	it('Count Users', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.countUsers = (data, cb) => {
			if (data && data.keywords && (data.keywords === "error" || Array.isArray(data.keywords))) {
				let error = new Error("User: Count Users - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, 1);
			}
		};
		BL.model = MODEL;
		
		BL.countUsers(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				keywords: "usernameToTest"
			};
			BL.countUsers(soajs, data, null, (err, result) => {
				assert.ok(result);
				assert.deepEqual(result, 1);
				
				data.keywords = "error";
				BL.countUsers(soajs, data, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 602);
					
					data.keywords = [];
					BL.countUsers(soajs, data, null, (error) => {
						assert.ok(error);
						assert.deepEqual(error.code, 602);
						done();
					});
				});
			});
		});
	});
	it('Get User by Username', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.getUserByUsername = (data, cb) => {
			if (data && data.username && data.username === "error") {
				let error = new Error("User: Count Users - mongo error.");
				return cb(error, null);
			} else if (data && data.username && data.username === "empty") {
				return cb(null, null);
			} else {
				return cb(null, {
					_id: "UserID",
					username: 'userTest',
					firstName: 'user',
					lastName: 'test',
					email: 'test@soajs.org',
					status: 'active',
					tenant: {code: 'TES0', id: '5c0e74ba9acc3c5a84a51259'},
					ts: 1569246037145,
					profile: {},
					groups: [],
					config: {}
				});
			}
		};
		BL.model = MODEL;
		
		BL.getUserByUsername(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				username: 'userTest'
			};
			
			BL.getUserByUsername(soajs, data, null, (err, record) => {
				assert.ok(record);
				assert.deepEqual(record.username, 'userTest');
				assert.deepEqual(record._id, 'UserID');
				assert.deepEqual(record.email, 'test@soajs.org');
				
				data.username = 'error';
				BL.getUserByUsername(soajs, data, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 602);
					
					data.username = 'empty';
					
					BL.getUserByUsername(soajs, data, null, (error) => {
						assert.ok(error);
						assert.deepEqual(error, {code: 520, msg: BL.localConfig.errors[520]});
						
						done();
					});
				});
			});
		});
	});
	it('Get Users', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.getUsers = (data, cb) => {
			if (data && data.keywords && (data.keywords === "error" || Array.isArray(data.keywords))) {
				let error = new Error("User: Get Users - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, []);
			}
		};
		BL.model = MODEL;
		
		BL.getUsers(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				"keywords": "usernameToTest",
				"limit": 10,
				"start": 0,
				"config": true
			};
			BL.getUsers(soajs, data, null, (err, result) => {
				assert.ok(result);
				assert.deepEqual(result, []);
				
				data.keywords = [];
				BL.getUsers(soajs, data, null, (error) => {
					assert.ok(error);
					assert.deepEqual(error.code, 602);
					
					data.keywords = "error";
					BL.getUsers(soajs, data, null, (error) => {
						assert.ok(error);
						assert.deepEqual(error.code, 602);
						done();
					});
				});
			});
		});
	});
	it('Get Users By Ids', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.getUsersByIds = (data, cb) => {
			if (data && data.ids && !(Array.isArray(data.ids))) {
				let error = new Error("User: An array of ids is required - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, []);
			}
		};
		BL.model = MODEL;
		
		BL.getUsersByIds(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				ids: ["id1", 'id2'],
				"limit": 10,
				"start": 0,
				"config": true
			};
			
			BL.getUsersByIds(soajs, data, null, (error, records) => {
				assert.ok(records);
				assert.deepEqual(records, []);
				
				data.ids = "ids";
				
				BL.getUsersByIds(soajs, data, null, (err) => {
					assert.ok(err);
					assert.deepEqual(err.code, 602);
					
					done();
				});
			});
		});
	});
	it('Clean Deleted Group', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.cleanDeletedGroup = (data, cb) => {
			if (data && data.groupCode && data.groupCode === "error") {
				let error = new Error("User: Clean Deleted Group - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, 2);
			}
		};
		BL.model = MODEL;
		
		BL.cleanDeletedGroup(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				groupCode: 'Group Code',
				tenant: {
					id: "Tenant ID",
					code: "Tenant Code",
				}
			};
			
			BL.cleanDeletedGroup(soajs, data, null, (error, result) => {
				assert.ok(result);
				assert.deepEqual(result, 2);
				
				data.groupCode = 'error';
				
				BL.cleanDeletedGroup(soajs, data, null, (err) => {
					assert.ok(err);
					assert.deepEqual(err.code, 602);
					
					done();
				});
			});
		});
	});//todo: check response
	it('Update Status and Update One Field', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.updateOneField = (data, cb) => {
			if (data && data.what && data.what === "error") {
				let error = new Error("User: Update One Field - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, true);
			}
		};
		BL.model = MODEL;
		
		BL.updateOneField(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				what: 'status',
				status: 'pending',
				id: 'userID'
			};
			
			BL.updateStatus(soajs, data, null, (error, result) => {
				assert.ok(result);
				assert.deepEqual(result, true);
				
				data.what = 'firstName';
				data.firstName = 'fadi';
				
				BL.updateOneField(soajs, data, null, (error, result) => {
					assert.ok(result);
					assert.deepEqual(result, true);
					
					let data = {
						what: 'status',
						status: 'pending',
						_id: 'userID'
					};
					
					BL.updateOneField(soajs, data, null, (error, result) => {
						assert.ok(result);
						assert.deepEqual(result, true);
						
						data.what = 'error';
						BL.updateOneField(soajs, data, null, (err) => {
							assert.ok(err);
							assert.deepEqual(err.code, 602);
							
							BL.updateStatus(soajs, null, null, (err, result) => {
								assert.ok(result);
								assert.deepEqual(result, true);
								
								done();
							});
						});
					});
				});
			});
		});
	});
	it('Edit User', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.edit = (data, cb) => {
			if (data && data.id && data.id === "error") {
				let error = new Error("User: Edit User - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, true);
			}
		};
		BL.model = MODEL;
		
		BL.edit(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				id: "userID",
				username: "USERname",
				firstName: "First",
				lastName: "Last",
				email: "f.l@local.com",
				profile: {"test": "test"},
				groups: ["test", "some"],
				status: "active",
			};
			BL.edit(soajs, data, null, (error, result) => {
				assert.ok(result);
				assert.deepEqual(result, true);
				
				data._id = 'userIDExt';
				BL.edit(soajs, data, null, (error, result) => {
					assert.ok(result);
					assert.deepEqual(result, true);
					
					data.id = 'error';
					BL.edit(soajs, data, null, (err) => {
						assert.ok(err);
						assert.deepEqual(err.code, 602);
						
						done();
					});
				});
			});
		});
	});
	it('Reset Users Password', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.updateOneField = (data, cb) => {
			if (data && data.password && data.password === "error") {
				let error = new Error("User: Reset Password - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, true);
			}
		};
		BL.model = MODEL;
		
		BL.resetPassword(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				id: 'userID',
				what: 'password',
				password: 'someNewOne'
			};
			
			BL.resetPassword(soajs, data, null, (error, result) => {
				assert.ok(result);
				assert.deepEqual(result, true);
				
				data._id = "userIDExternal";
				BL.resetPassword(soajs, data, null, (error, result) => {
					assert.ok(result);
					assert.deepEqual(result, true);
					
					done();
					
					//TODO: CHECK ERROR COVERAGE
					// data.password = 'error';
					// BL.resetPassword(soajs, data, null, (err) => {
					//     assert.ok(err);
					//     assert.deepEqual(err.code, 602);
					//
					//     done();
					// });
				});
			});
		});
	});
	it('un invite user', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.uninvite = (data, cb) => {
			if (data && data.user && data.user.id === 'error' && data.user.username === 'error') {
				let error = new Error("User: UnInvite User - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, true);
			}
		};
		BL.model = MODEL;
		
		BL.uninvite(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				user: {
					id: 'userID'
				},
				status: 'active',
				tenant: {
					id: 'tenant id',
					code: 'tenant code'
				}
			};
			
			BL.uninvite(soajs, data, null, (error, result) => {
				assert.ok(result);
				assert.deepEqual(result, true);
				
				let data = {
					user: {
						username: 'username'
					},
					status: 'active',
					tenant: {
						id: 'tenant id',
						code: 'tenant code'
					}
				};
				
				BL.uninvite(soajs, data, null, (error, result) => {
					assert.ok(result);
					assert.deepEqual(result, true);
					
					let data = {
						user: {
							username: 'username'
						},
						status: 'active',
						tenant: {
							id: 'tenant id',
							code: 'tenant code'
						}
					};
					
					BL.uninvite(soajs, data, null, (error, result) => {
						assert.ok(result);
						assert.deepEqual(result, true);
						
						data.user.id = 'error';
						data.user.username = 'error';
						
						BL.uninvite(soajs, data, null, (err) => {
							assert.ok(err);
							assert.deepEqual(err.code, 602);
							
							done();
						});
					});
				});
			});
		});
	});
	it('Edit Groups', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.editGroups = (data, cb) => {
			if (data && data.groups && data.user.id === 'error') {
				let error = new Error("User: Edit Groups - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, true);
			}
		};
		BL.model = MODEL;
		
		BL.editGroups(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				groups: ['Group1', "Group2"],
				user: {
					id: 'userID',
					username: 'userName',
					email: 'userEmail'
				},
				tenant: soajs.tenant,
			};
			
			BL.editGroups(soajs, data, null, (err, result) => {
				assert.ok(result);
				assert.deepEqual(result, true);
				
				data.user.id = 'error';
				
				BL.editGroups(soajs, data, null, (err) => {
					assert.ok(err);
					assert.deepEqual(err.code, 602);
					done();
				});
			});
		});
	});
	it('Add User', (done) => {
		function MODEL() {
			console.log("user model");
		}
		
		MODEL.prototype.closeConnection = () => {
		};
		
		MODEL.prototype.add = (data, cb) => {
			if (data && data.username && data.username === "error") {
				let error = new Error("User: Add User - mongo error.");
				return cb(error, null);
			} else {
				return cb(null, {
					username: 'usernameTest',
					firstName: 'user',
					lastName: 'name',
					email: 'testmail@soajs.org',
					status: 'active',
					tenant: {code: 'TES0', id: '5c0e74ba9acc3c5a84a51259'},
					ts: 1569316601637,
					profile: {
						'user': 'test'
					},
					groups: ['group1', 'groupOwner'],
					config: {},
					_id: "USERID"
				});
			}
		};
		BL.model = MODEL;
		
		BL.add(soajs, null, null, (error) => {
			assert.ok(error);
			assert.deepEqual(error, {
				code: 400,
				msg: BL.localConfig.errors[400]
			});
			
			let data = {
				username: 'usernameTest',
				firstName: 'user',
				lastName: 'name',
				email: 'testmail@soajs.org',
				password: 'password123',
				status: 'active',
				tenant: {code: 'TES0', id: '5c0e74ba9acc3c5a84a51259'},
				ts: 1569316601637,
				profile: {
					'user': 'test'
				},
				groups: ['group1', 'groupOwner'],
			};
			
			BL.add(soajs, data, null, (err, record) => {
				assert.ok(record);
				assert.deepEqual(record._id, "USERID");
				assert.deepEqual(record.firstName, "user");
				assert.deepEqual(record.tenant, {code: 'TES0', id: '5c0e74ba9acc3c5a84a51259'});
				assert.deepEqual(record.config, {});
				
				data = {
					username: 'usernameTest',
					firstName: 'user',
					lastName: 'name',
					email: 'testmail@soajs.org',
					status: 'active',
					tenant: {code: 'TES0', id: '5c0e74ba9acc3c5a84a51259'},
					ts: 1569316601637,
					profile: {
						'user': 'test'
					},
					groups: ['group1', 'groupOwner'],
				};
				
				BL.add(soajs, data, null, (err, record) => {
					assert.ok(record);
					assert.deepEqual(record._id, "USERID");
					assert.deepEqual(record.firstName, "user");
					assert.deepEqual(record.tenant, {code: 'TES0', id: '5c0e74ba9acc3c5a84a51259'});
					assert.deepEqual(record.config, {});
					
					data.username = 'error';
					BL.add(soajs, data, null, (err) => {
						assert.ok(err);
						assert.deepEqual(err.code, 602);
						
						done();
					});
				});
			});
		});
	});
});