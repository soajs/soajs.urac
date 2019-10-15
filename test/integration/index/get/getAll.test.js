"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listAllSchema = require("../schemas/getAll.js");

describe("Testing get All API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	it("Success - will all return all group and user records", (done) => {
		let params = {};
		requester('/admin/all', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data.users);
			assert.ok(body.data.groups);
			assert.ok(body.data.users.length > 0);
			assert.ok(body.data.groups.length > 0);
			let check = validator.validate(body, listAllSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});