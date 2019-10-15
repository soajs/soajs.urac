"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let getGroupsSchema = require("../schemas/getGroups");
let updateEnvironmentsSchema = require("../schemas/updateEnvironments");

describe("Testing Update environments API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	let groups;
	let selectedGroup;
	
	it("Success - by id will return all group records - no data", (done) => {
		let params = {
			qs: {}
		};
		requester('/admin/groups', 'get', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.data.length > 0);
			groups = body.data;
			groups.forEach(group => {
				if (group.code === 'FFFF' || group.code === 'AAAA') {
					selectedGroup = group;
				}
			});
			let check = validator.validate(body, getGroupsSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - will update environments", (done) => {
		let params = {
			body: {
				"groups": [groups[0].code, groups[1].code],
				"environments": ["dev", "devop"],
			}
		};
		requester('/admin/groups/environments', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, 2);
			let check = validator.validate(body, updateEnvironmentsSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not eupdate environments - No data", (done) => {
		let params = {};
		requester('/admin/groups/environments', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{ code: 172, message: 'Missing required field: environments, groups' }]);
			let check = validator.validate(body, updateEnvironmentsSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Error - will not update environments  - Not valid", (done) => {
		let params = {
			body: {
				groups: [],
				environments: []
			}
		};
		requester('/admin/groups/environments', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			let check = validator.validate(body, updateEnvironmentsSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});