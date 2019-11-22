"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let countUsersSchema = require("../schemas/countUsers.js");

describe("Testing count users API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - will count all user records - keywords", (done) => {
        let params = {
            qs: {
                "keywords": "john"
            }
        };
        requester('/admin/users/count', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.deepEqual(body.data, 1);
            let check = validator.validate(body, countUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will not count - not found", (done) => {
        let params = {
            qs: {
                "keywords": "notfound"
            }
        };
        requester('/admin/users/count', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.deepEqual(body.data, 0);
            let check = validator.validate(body, countUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - will count all - no data", (done) => {
        let params = {
            qs: {
            }
        };
        requester('/admin/users/count', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.deepEqual(body.data, 4);
            let check = validator.validate(body, countUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});