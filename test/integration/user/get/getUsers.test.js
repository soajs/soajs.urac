"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listUsersSchema = require("../schemas/getUsers.js");

describe("Testing get users API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - by id will return all user records - keywords", (done) => {
        let params = {
            qs: {
                "keywords": "john",
                "limit": 10,
                "start": 0,
                "config": true
            }
        };
        requester('/admin/users', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data.length > 0);
            assert.deepEqual(body.data[0]._id, '5c8d0c505653de3985aa0ffd');
            let check = validator.validate(body, listUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - by id will return all user records - no data", (done) => {
        let params = {
            qs: {
            }
        };
        requester('/admin/users', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data.length > 0);
            let check = validator.validate(body, listUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will not found", (done) => {
        let params = {
            qs: {
                "keywords": "notfound",
                "limit": 10,
                "start": 0,
                "config": true
            }
        };
        requester('/admin/users', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data.length === 0);
            let check = validator.validate(body, listUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});