"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let forgotPasswordSchema = require("../schemas/forgotPassword.js");

describe("Testing forgot password API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Success - will forgot password send link and email", (done) => {
		let params = {
			qs: {
				username: "johnd"
			}
		};
		requester('/password/forgot', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			console.log(body.data.link, 'link flag')
			assert.ok(body.data.hasOwnProperty('token'));
			assert.ok(body.data.hasOwnProperty('link'));
			let check = validator.validate(body, forgotPasswordSchema);
			console.log(check, 'flag')
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will forgot password send link and email no data", (done) => {
		let params = {
		};
		requester('/password/forgot', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [ { code: 172, message: 'Missing required field: username' } ]);
			let check = validator.validate(body, forgotPasswordSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});