"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let getUsersSchema = require("../schemas/getUsers");
let editUserSchema = require("../schemas/editUserGroups");

describe.skip("Testing edit User Groups API", () => {

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
            assert.deepEqual(body.data, 1);
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
                    'Model error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
            }]);
            let check = validator.validate(body, editUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});