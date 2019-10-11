"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let getUsersSchema = require("../schemas/getUsers.js");

describe("Testing get users by ids API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    let users = [];

    it("Success - will return all user records - no data", (done) => {
        let params = {
            qs: {}
        };
        requester('/admin/users', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data.length > 0);
            users = body.data;
            done();
        });
    });

    it("Success - by ids will return user records", (done) => {
        let params = {
            qs: {
                ids: [users[0]._id],
                limit: 10,
                start: 0,
                config: true
            }
        };

        requester('/admin/users/ids', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data);
            let check = validator.validate(body, getUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });


    it("Error - will no data", (done) => {
        let params = {
            qs: {}
        };
        requester('/admin/users/ids', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [{code: 172, message: 'Missing required field: ids'}]);
            let check = validator.validate(body, getUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});