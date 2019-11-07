"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listUsersSchema = require("../../user/schemas/getUsers.js");
let editPinSchema = require("../schemas/userPin.js");

let Mongo = require("soajs.core.modules").mongo;

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
		
		mongoConnection.update("custom_registry", condition, e, {'upsert': true}, () => {
			mongoConnection.closeDb();
			
			let params = {
				uri: 'http://127.0.0.1:5000'
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
		
		mongoConnection.update("tenants", condition, e, {'upsert': false}, () => {
			mongoConnection.closeDb();
			
			let params = {
				uri: 'http://127.0.0.1:5000'
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
	
	it("Success - will edit User pin - reset", (done) => {
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