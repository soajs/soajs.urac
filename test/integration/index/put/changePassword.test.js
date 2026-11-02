"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listUsersSchema = require("../../user/schemas/getUsers.js");
let changePasswordSchema = require("../schemas/changePassword.js");

describe("Testing check password API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	let users = [];
	let selectedUser;
	// user of the requester access token
	let ownerId = "5c8d0c505653de3985aa0ffd";
	
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
	
	it("Success - will change password", (done) => {
		let params = {
			body: {
				id: ownerId,
				oldPassword: "password",
				password: "NewPass",
				confirmation: "NewPass",
			}
		};
		requester('/account/password', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, changePasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not change password - old password is wrong", (done) => {
		let params = {
			body: {
				id: ownerId,
				oldPassword: "123",
				password: "NewPass",
				confirmation: "NewPass",
			}
		};
		requester('/account/password', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 523,
				message: 'The provided current password is not correct.'
			}]);
			let check = validator.validate(body, changePasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not change password - password not same as confirmation", (done) => {
		let params = {
			body: {
				id: ownerId,
				oldPassword: "NewPass",
				password: "NewPass",
				confirmation: "NewPass2",
			}
		};
		requester('/account/password', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 522,
				message: 'The password and its confirmation do not match.'
			}]);
			let check = validator.validate(body, changePasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not change password - another user id", (done) => {
		let params = {
			body: {
				id: selectedUser._id,
				oldPassword: "password",
				password: "NewPass",
				confirmation: "NewPass",
			}
		};
		requester('/account/password', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 540,
				message: 'The id does not match the signed in user.'
			}]);
			let check = validator.validate(body, changePasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Fails - will not change password - not found", (done) => {
		let params = {
			body: {
				id: '5d63ce63617982b55a1c1800',
				oldPassword: "oldPass",
				password: "NewPass",
				confirmation: "NewPass",
			}
		};
		requester('/account/password', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 540,
				message: 'The id does not match the signed in user.'
			}]);
			let check = validator.validate(body, changePasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not change password - invalid id", (done) => {
		let params = {
			body: {
				id: 'notValid',
				oldPassword: "oldPass",
				password: "NewPass",
				confirmation: "NewPass",
			}
		};
		requester('/account/password', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 540,
				message: 'The id does not match the signed in user.'
			}]);
			let check = validator.validate(body, changePasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not change password - No data", (done) => {
		let params = {};
		requester('/account/password', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 172,
				message: 'Missing required field: oldPassword, password, confirmation'
			}]);
			let check = validator.validate(body, changePasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - no id changes the signed in user password back", (done) => {
		let params = {
			body: {
				oldPassword: "NewPass",
				password: "password",
				confirmation: "password",
			}
		};
		requester('/account/password', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, changePasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});