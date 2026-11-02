"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listUsersSchema = require("../../user/schemas/getUsers.js");
let accountEmailSchema = require("../schemas/accountEmail.js");

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
	// user of the requester access token
	let ownerId = "5c8d0c505653de3985aa0ffd";

	it("Success - will return all user records", (done) => {
		let params = {
		};
		requester('/admin/users', 'get', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.data.length > 0);
			users = body.data;
			users.forEach(user => {
				if (user.username === 'samouel') {
					selectedUser = user;
				}
			});
			let check = validator.validate(body, listUsersSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - will change account email", (done) => {
		let params = {
			body: {
				id: ownerId,
				email: 'new@new.new'
			}
		};
		requester('/account/email', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			// assert.ok(body.data.hasOwnProperty('token'));
			// assert.ok(body.data.hasOwnProperty('link'));
			let check = validator.validate(body, accountEmailSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Success - no id changes the signed in user email", (done) => {
		let params = {
			body: {
				email: 'new2@new.new'
			}
		};
		requester('/account/email', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			let check = validator.validate(body, accountEmailSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Fails - will not change account email - another user id", (done) => {
		let params = {
			body: {
				id: selectedUser._id,
				email: 'new@new.new'
			}
		};
		requester('/account/email', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 540,
				message: 'The id does not match the signed in user.'
			}]);
			let check = validator.validate(body, accountEmailSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Fails - will not send an email change code - another user id", (done) => {
		let params = {
			body: {
				id: selectedUser._id,
				email: 'new@new.new'
			}
		};
		requester('/account/email/code', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 540,
				message: 'The id does not match the signed in user.'
			}]);
			done();
		});
	});

	it("Fails - will not change account phone - another user id", (done) => {
		let params = {
			body: {
				id: selectedUser._id,
				phone: '+15551234567'
			}
		};
		requester('/account/phone', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 540,
				message: 'The id does not match the signed in user.'
			}]);
			done();
		});
	});

	it("Fails - will not change account email - not found", (done) => {
		let params = {
			body: {
				id: '5d63ce63617982b55a1c1800',
				email: 'new@new.new'
			}
		};
		requester('/account/email', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 540,
				message: 'The id does not match the signed in user.'
			}]);
			let check = validator.validate(body, accountEmailSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Fails - will not change account email - invalid id", (done) => {
		let params = {
			body: {
				id: 'notValid',
				email: 'new@new.new'
			}
		};
		requester('/account/email', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 540,
				message: 'The id does not match the signed in user.'
			}]);
			let check = validator.validate(body, accountEmailSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

	it("Fails - will not change account email - No data", (done) => {
		let params = {
		};
		requester('/account/email', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 172,
				message: 'Missing required field: email'
			}]);
			let check = validator.validate(body, accountEmailSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});
