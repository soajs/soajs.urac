"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listUsersSchema = require("../../user/schemas/getUsers.js");
let editUserSchema = require("../schemas/editUser.js");

describe("Testing edit user API", () => {
	
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
		let params = {
			qs: {
				"keywords": "john",
				"limit": 10,
				"start": 0,
				"config": true
			}
		};
		requester('/admin/users', 'get', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.data.length > 0);
			users = body.data;
			users.forEach(user => {
				if (user.username === 'johnd') {
					selectedUser = user;
				}
			});
			let check = validator.validate(body, listUsersSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - will edit User", (done) => {
		let params = {
			body: {
				id: selectedUser._id,
				username: 'updated',
				firstName: 'nameU',
				lastName: 'lNameU',
				profile: {
					"Update": "Boston"
				},
				email: 'someNew@update.com',
				groups: ['AAAA'],
				status: 'active',
				password: 'SomePass',
				pin: {
					code: true,
					allowed: true
				}
			}
		};
		requester('/admin/user', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - will edit User - no Email", (done) => {
		let params = {
			body: {
				id: selectedUser._id,
				username: 'updated',
				firstName: 'nameUU',
				lastName: 'lNameU',
				profile: {
					"Update": "Boston"
				},
				groups: ['AAAA'],
				status: 'active',
				password: 'SomePass',
				pin: {
					code: true,
					allowed: true
				}
			}
		};
		requester('/admin/user', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not edit User - found", (done) => {
		let params = {
			body: {
				id: '5d63ce63617982b55a1c1800',
				username: 'johnd',
				firstName: 'Same',
				lastName: 'John',
				profile: {
					"Sam": "Boston"
				},
				email: 'john@localhost.com',
				groups: ['AAAA'],
				status: 'active',
				password: 'SomePass',
				pin: {
					code: true,
					allowed: true
				}
			}
		};
		requester('/admin/user', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			let check = validator.validate(body, editUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - edit user - No data", (done) => {
		let params = {
		};
		requester('/admin/user', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 172,
				message: 'Missing required field: id'
			}]);
			let check = validator.validate(body, editUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});