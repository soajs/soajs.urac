"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listUsersSchema = require("../schemas/getUsers.js");
let getUserSchema = require("../schemas/getUser.js");

describe("Testing get user API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    let users = [];
    let selectedUser;

    it("Success - by id will return all user records - no data", (done) => {
        let params = {
            qs: {
            }
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
            let check = validator.validate(body, listUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - by id will return user record", (done) => {
        let params = {
            "qs": {"id": selectedUser._id}
        };
        requester('/admin/user', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data);
	        assert.deepEqual(body.data.username, 'johnd');
            assert.deepEqual(body.data.firstName, 'John');
            assert.deepEqual(body.data.lastName, 'Doe');
            assert.deepEqual(body.data.email, 'john@localhost.com');
            let check = validator.validate(body, getUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will not return - no data", (done) => {
        let params = {
        };
        requester('/admin/user', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [ { code: 172, message: 'Missing required field: id' } ]);
            let check = validator.validate(body, getUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will return - not valid error", (done) => {
        let params = {
            "qs": {"id": "notFound"}
        };
        requester('/admin/user', 'get', params, (error, body) => {
            assert.ok(body);
            assert.deepEqual(body.errors.details, [ { code: 602,
                message: 'Model error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters' } ]);
            let check = validator.validate(body, getUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will return - not found error", (done) => {
        let params = {
            "qs": {"id": "5d63ce63617982b55a1c1800"}
        };
        requester('/admin/user', 'get', params, (error, body) => {
            assert.ok(body);
            assert.deepEqual(body.errors.details, [ { code: 520, message: 'Unable to find user.' } ]);
            let check = validator.validate(body, getUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});