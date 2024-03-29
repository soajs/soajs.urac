"use strict";
const assert = require('assert');
const requester = require('../../requester');

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
			done();
		});
	});
});