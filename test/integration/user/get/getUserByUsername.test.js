"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let getUserByUsername = require("../schemas/getUserByUsername.js");

describe("Testing get user by username API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - by username will return user record", (done) => {
        let params = {
            qs: {
                "username": "johnd"
            }
        };
        requester('/user', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data);
            let check = validator.validate(body, getUserByUsername);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - by email will return user record", (done) => {
        let params = {
            qs: {
                "username": "john@localhost.com"
            }
        };
        requester('/user', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data);
            let check = validator.validate(body, getUserByUsername);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will not found", (done) => {
        let params = {
            qs: {
                "username": "notfound"
            }
        };
        requester('/user', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.errors);
            let check = validator.validate(body, getUserByUsername);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will no username", (done) => {
        let params = {
            qs: {
                name: 'error'
            }
        };
        requester('/user', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.errors);
            let check = validator.validate(body, getUserByUsername);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will no data", (done) => {
        let params = {
            qs: {
            }
        };
        requester('/user', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.errors);
            let check = validator.validate(body, getUserByUsername);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});