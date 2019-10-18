"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let resetPasswordSchema = require("../schemas/resetPassword.js");

describe("Testing forgot password API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Success - will reset password", (done) => {
		let params = {
			body: {
				token: "f65e8358-ce1d-47ff-b478-82e10c93f70e",
				password: "NewPassword",
				confirmation: "NewPassword"
			}
		};
		requester('/password/reset', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			let check = validator.validate(body, resetPasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not reset password - wrong confirmation", (done) => {
		let params = {
			body: {
				token: "f9e3adbe-0bd5-456b-9bb5-a5067347858b",
				password: "NewPassword",
				confirmation: "notSame"
			}
		};
		requester('/password/reset', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [ { code: 522,
				message: 'The password and its confirmation do not match.' } ]);
			let check = validator.validate(body, resetPasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not reset password no data", (done) => {
		let params = {
		};
		requester('/password/reset', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [ { code: 172, message: 'Missing required field: token, password, confirmation' } ]);
			let check = validator.validate(body, resetPasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});