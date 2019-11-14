"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let validateJoinSchema = require("../schemas/validateJoin.js");

describe("Testing validate join API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Success - will all return true (validated) - active", (done) => {
		let params = {
			qs: {
				token: "f65e8358-ce1d-47cb-b478-82e10c93f70e"
			}
		};
		requester('/validate/join', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			let check = validator.validate(body, validateJoinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - will all return true (validated) - not active", (done) => {
		let params = {
			qs: {
				token: "cddd0c76-7708-4c93-90ac-61258a4b199f"
			}
		};
		requester('/validate/join', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			let check = validator.validate(body, validateJoinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not return true no data", (done) => {
		let params = {
		};
		requester('/validate/join', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [ { code: 172, message: 'Missing required field: token' } ]);
			let check = validator.validate(body, validateJoinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});