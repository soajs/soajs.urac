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
	
	it.skip("Success - will change account email", (done) => {
		let params = {
			body: {
				id: selectedUser._id,
				email: 'new@new.new'
			}
		};
		requester('/account/email', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data.hasOwnProperty('token'));
			assert.ok(body.data.hasOwnProperty('link'));
			let check = validator.validate(body, accountEmailSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
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
			assert.deepEqual(body.errors.details, [ { code: 602,
				message:
					'Model error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters' } ]);
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
				message: 'Missing required field: id, email'
			}]);
			let check = validator.validate(body, accountEmailSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});