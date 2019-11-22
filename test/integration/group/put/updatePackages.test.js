"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let getGroupsSchema = require("../schemas/getGroups");
let updatePackagesSchema = require("../schemas/updatePackages");

describe("Testing Update Packages API", () => {
	
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
				if (group.code === 'FFFF') {
					selectedGroup = group;
				}
			});
			let check = validator.validate(body, getGroupsSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - will update Packages - CODES", (done) => {
		let params = {
			body: {
				"groups": {
					codes: [selectedGroup.code]
				},
				"packages": [{product: "client", packages: ["client_DEVOP", "client_SOME"]}],
			}
		};
		requester('/admin/groups/packages', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, updatePackagesSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - will update Packages - IDS", (done) => {
		let params = {
			body: {
				"groups": {
					ids: [selectedGroup._id]
				},
				"packages": [{product: "client", packages: ["client_DEVOP", "client_SOME", "client_SOMEID"]}],
			}
		};
		requester('/admin/groups/packages', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, updatePackagesSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not eupdate Packages - No data", (done) => {
		let params = {};
		requester('/admin/groups/packages', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{ code: 172, message: 'Missing required field: packages, groups' }]);
			let check = validator.validate(body, updatePackagesSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Error - will not update Packages  - Not valid", (done) => {
		let params = {
			body: {
				groups: [],
				packages: []
			}
		};
		requester('/admin/groups/packages', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			let check = validator.validate(body, updatePackagesSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});