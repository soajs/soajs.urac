"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listUsersSchema = require("../../user/schemas/getUsers.js");
let editUserSchema = require("../schemas/editUser.js");

describe("Testing edit user API", () => {
	
	before(function (done) {
		done();
	});
	
	afterEach((done) => {
		console.log("=======================================");
		done();
	});
	
	let users = [];
	let selectedUser;
	
	it("Success - will return all user records", (done) => {
		let params = {
		};
		requester('/admin/users', 'get', params, (error, body) => {
			assert.ok(body);
			assert.ok(body.data.length > 0);
			body.data.forEach(user => {
				if (user.username === 'kamil' || user.username === 'samouel') {
					users.push(user);
				}
			});
			let check = validator.validate(body, listUsersSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - will uninvite Users", (done) => {
		let params = {
			body: {
				users: [
					{
						user: {
							id: users[0]._id
						}
					},
					{
						user: {
							username: users[1].username
						}
					}
				],
			}
		};
		requester('/admin/users/uninvite', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			console.log(body.errors, 'eroa');
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - will not uninvite User - found", (done) => {
		let params = {
			body: {
				users: [
					{
						user: {id: '5d63ce63617982b55a1c1800'},
					}
				]
			}
		};
		requester('/admin/users/uninvite', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			let check = validator.validate(body, editUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Fails - uninvite user - No data", (done) => {
		let params = {
		};
		requester('/admin/users/uninvite', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.errors);
			assert.deepEqual(body.errors.details, [{
				code: 172,
				message: 'Missing required field: id'
			}]);
			let check = validator.validate(body, editUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
});