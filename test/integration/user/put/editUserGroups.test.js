"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let getUsersSchema = require("../schemas/getUsers");
let editUserSchema = require("../schemas/editUserGroups");

let clientKey = 'e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18';

describe("Testing edit User Groups API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    let users;
    let selectedUser;

    it("Success - by id will return all group records - no data", (done) => {
        let params = {
            qs: {}
        };
        requester('/admin/users', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data.length > 0);
            users = body.data;
            users.forEach(user => {
                if (user.username === 'johnd') {
                    selectedUser = user;
                }
            });
            let check = validator.validate(body, getUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - by id will edit User Groups", (done) => {
        let params = {
            body: {
                user: {
                    id: selectedUser._id,
                },
                groups: ['dev', 'test', 'devop']
            }
        };
        requester('/admin/user/groups', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.deepEqual(body.data, true);
            let check = validator.validate(body, editUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
	
	it("Success - by username will edit User Groups - client", (done) => {
		let params = {
			headers: {
				key: clientKey
			},
			body: {
				user: {
					username: 'client',
				},
				groups: ['dev2', 'test1', 'devop2']
			}
		};
		requester('/admin/user/groups', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
	it("Success - by username will edit User Groups - Empty array - client", (done) => {
		let params = {
			headers: {
				key: clientKey
			},
			body: {
				user: {
					username: 'client',
				},
				groups: []
			}
		};
		requester('/admin/user/groups', 'put', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.deepEqual(body.data, true);
			let check = validator.validate(body, editUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});
	
    it("Fails - will not edit User Groups - No data", (done) => {
        let params = {};
        requester('/admin/user/groups', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [{code: 172, message: 'Missing required field: groups, user'}]);
            let check = validator.validate(body, editUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will not edit User Groups  - Not valid", (done) => {
        let params = {
            body: {
                user: {
                    id: 'notvalid',
                },
                groups: ['dev', 'test', 'devop']
            }
        };
        requester('/admin/user/groups', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [{
                code: 602,
                message:
                    'Model error: A valid ID is required'
            }]);
            let check = validator.validate(body, editUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});