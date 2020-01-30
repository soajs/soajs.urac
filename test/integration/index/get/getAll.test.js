"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listAllSchema = require("../schemas/getAll.js");

let stExtKey = 'e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18';

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
	
	it("Success - will all return all group and user records - client", (done) => {
		let params = {
			headers: {
				//key: stExtKey
			}
		};
		requester('/admin/all', 'get', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data.users);
			assert.ok(body.data.groups);
			let check = validator.validate(body, listAllSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});