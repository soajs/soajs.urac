"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let validateChangeMail = require("../schemas/validateChangeMail");

describe("Testing validate change mail API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Success - will all return true (validateChangeMail)", (done) => {
		let params = {
			qs: {
				token: "19bef574-904c-4579-9cbf-2c9c42374ca"
			}
		};
		requester('/validate/changeEmail', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, validateChangeMail);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not return true (validateChangeMail) no data", (done) => {
		let params = {
		};
		requester('/validate/changeEmail', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [ { code: 172, message: 'Missing required field: token' } ]);
			let check = validator.validate(body, validateChangeMail);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});