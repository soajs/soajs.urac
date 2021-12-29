"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listUsersSchema = require("../../user/schemas/getUsers.js");
let editPinSchema = require("../schemas/userPin.js");

let Mongo = require("soajs.core.modules").mongo;

let tenantKey = '3d90163cf9d6b3076ad26aa5ed58556348069258e5c6c941ee0f18448b570ad1c5c790e2d2a1989680c55f4904e2005ff5f8e71606e4aa641e67882f4210ebbc5460ff305dcb36e6ec2a2299cf0448ef60b9e38f41950ec251c1cf41f05f3ce9';
let clientKey = 'e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18';

describe("Testing edit user pin API", () => {

	before(function (done) {
		done();
	});

	afterEach((done) => {
		console.log("=======================================");
		done();
	});

	let users = [];
	let selectedUser;
	let selectedUserClient;

	it("Success - will return all user records", (done) => {
		let params = {};
		requester('/admin/users', 'get', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.data.length > 0);
			users = body.data;
			users.forEach(user => {
				if (user.username === 'change') {
					selectedUser = user;
				}
			});
			let check = validator.validate(body, listUsersSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will return all user records - client", (done) => {
		let params = {
			headers: {
				key: tenantKey
			}
		};
		requester('/admin/users', 'get', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.data.length > 0);
			users = body.data;
			users.forEach(user => {
				if (user.username === 'client') {
					selectedUserClient = user;
				}
			});
			let check = validator.validate(body, listUsersSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it('adds registry configuration ', (done) => {
		let profile = require('../../../data/soajs_profile');

		let mongoConnection = new Mongo(profile);

		let condition = {
			name: 'pinConfiguration'
		};
		let e = {
			"$set": {
				name: "pinConfiguration",
				locked: false,
				plugged: true,
				shared: false,
				value: {
					charLength: 5,
					characters: "0123456789"
				},
				created: "DASHBOARD",
				author: "owner"
			}
		};

		mongoConnection.updateOne("custom_registry", condition, e, {'upsert': true}, () => {
			mongoConnection.closeDb();

			let params = {
				uri: 'http://127.0.0.1:5001'
			};

			requester('/reloadRegistry', 'get', params, () => {
				let params = {
					body: {
						user: {id: selectedUser._id},
						pin: {
							reset: true,
							allowed: true
						}
					}
				};
				requester('/admin/user/pin', 'put', params, (error, body) => {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					assert.deepEqual(body.data, true);
					let check = validator.validate(body, editPinSchema);
					assert.deepEqual(check.valid, true);
					assert.deepEqual(check.errors, []);
					done();
				});
			});
		});
	});

	it('adds tenant service config', (done) => {
		let profile = require('../../../data/soajs_profile');
		let mongoConnection = new Mongo(profile);

		let appId = mongoConnection.ObjectId("30d2cb5fc04ce51e06000002");

		let condition = {
			'$and': [
				{"code": 'test'},
				{"applications.appId": appId},
				{"applications.keys.key": "695d3456de70fddc9e1e60a6d85b97d3"}
			]
		};

		let e = {
			$set: {
				"applications.$[].keys.$[].config.dashboard.urac.pinConfiguration": {
						charLength: 5,
						characters: "0123456789"
				}
			}
		};

		mongoConnection.updateOne("tenants", condition, e, {'upsert': false}, () => {
			mongoConnection.closeDb();

			let params = {
				uri: 'http://127.0.0.1:5001'
			};

			requester('/loadProvision', 'get', params, () => {
				let params = {
					body: {
						user: {id: selectedUser._id},
						pin: {
							reset: true,
							allowed: true
						}
					}
				};
				requester('/admin/user/pin', 'put', params, (error, body) => {
					assert.ifError(error);
					assert.ok(body);
					assert.ok(body.data);
					assert.deepEqual(body.data, true);
					let check = validator.validate(body, editPinSchema);
					assert.deepEqual(check.valid, true);
					assert.deepEqual(check.errors, []);
					done();
				});
			});
		});
	});

	it("Success - will edit User pin - reset and allowed true", (done) => {
		let params = {
			body: {
				user: {id: selectedUser._id},
				pin: {
					reset: true,
					allowed: true
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - reset and allowed true - username", (done) => {
		let params = {
			body: {
				user: {username: selectedUser.username},
				pin: {
					reset: true,
					allowed: true
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - reset and allowed false", (done) => {
		let params = {
			body: {
				user: {id: selectedUser._id},
				pin: {
					reset: false,
					allowed: false
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - reset and allowed false - email", (done) => {
		let params = {
			body: {
				user: {email: selectedUser.email},
				pin: {
					reset: false,
					allowed: true
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - reset true allowed false", (done) => {
		let params = {
			body: {
				user: {id: selectedUser._id},
				pin: {
					reset: true,
					allowed: false
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - reset false allowed true", (done) => {
		let params = {
			body: {
				user: {id: selectedUser._id},
				pin: {
					reset: false,
					allowed: true
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - reset and allowed true - client", (done) => {
		let params = {
			headers: {
				key: clientKey
			},
			body: {
				user: {id: selectedUserClient._id},
				pin: {
					reset: true,
					allowed: true
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - reset false allowed true - client", (done) => {
		let params = {
			headers: {
				key: clientKey
			},
			body: {
				user: {id: selectedUserClient._id},
				pin: {
					reset: false,
					allowed: false
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - reset true allowed false - client", (done) => {
		let params = {
			headers: {
				key: clientKey
			},
			body: {
				user: {id: selectedUserClient._id},
				pin: {
					reset: true,
					allowed: false
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - reset and allowed false - client", (done) => {
		let params = {
			headers: {
				key: clientKey
			},
			body: {
				user: {id: selectedUserClient._id},
				pin: {
					reset: false,
					allowed: true
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - delete - client", (done) => {
		let params = {
			headers: {
				key: clientKey
			},
			body: {
				user: {id: selectedUserClient._id},
				pin: {
					delete: true
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will edit User pin - delete", (done) => {
		let params = {
			body: {
				user: {id: selectedUser._id},
				pin: {
					delete: true
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Fails - will not edit User pin - not found", (done) => {
		let params = {
			body: {
				id: '5d63ce63617982b55a1c1800',
				pin: {
					code: true,
					allowed: true
				}
			}
		};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Fails - edit user pin - No data", (done) => {
		let params = {};
		requester('/admin/user/pin', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 172,
				message: 'Missing required field: pin, user'
			}]);
			let check = validator.validate(body, editPinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});
