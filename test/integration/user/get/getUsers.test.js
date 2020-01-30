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

    it("Success - will return all user records - keywords", (done) => {
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
            let id_array = [];
            for (let i = 0; i < body.data.length; i++) {
                id_array.push(body.data[i]._id);
            }
            assert.deepEqual(id_array.includes('5e330606c5a59210a8152628'), true);
            let check = validator.validate(body, listUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - will return all user records - no data", (done) => {
        let params = {
            qs: {}
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