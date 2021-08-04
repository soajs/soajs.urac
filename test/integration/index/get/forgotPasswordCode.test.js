"use strict";
const assert = require('assert');
const requester = require('../../requester');

describe("Testing forgot password code API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Success - forgot password with code", (done) => {
		let params = {
			qs: {
				username: "johnd"
			}
		};
		requester('/password/forgot/code', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			done();
		});
	});
	
	it("Fails - forgot password with code", (done) => {
		let params = {
		};
		requester('/password/forgot/code', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepStrictEqual(body.errors.details, [ { code: 172, message: 'Missing required field: username' } ]);
			done();
		});
	});
});