"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let joinSchema = require("../schemas/join.js");

describe("Testing add user API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it.skip("Success - will join", (done) => {
		let params = {
			body: {
				username: 'joiner',
				firstName: 'new',
				lastName: 'Join',
				email: 'join@new.com',
				password: 'SomePass',
			}
		};
		requester('/join', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data.hasOwnProperty('token'));
			assert.ok(body.data.hasOwnProperty('link'));
			let check = validator.validate(body, joinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - No data", (done) => {
		let params = {};
		requester('/join', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 172,
				message: 'Missing required field: username, password, firstName, lastName, email'
			}]);
			let check = validator.validate(body, joinSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});