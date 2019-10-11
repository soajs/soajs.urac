"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let checkUsernameSchema = require("../schemas/checkUsername.js");

describe("Testing checkusername API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - will checkusername - username", (done) => {
        let params = {
            qs: {
                "username": "johnd"
            }
        };
        requester('/checkUsername', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.deepEqual(body.data, true);
            let check = validator.validate(body, checkUsernameSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - will not checkusername - not found", (done) => {
        let params = {
            qs: {
                "username": "notfound"
            }
        };
        requester('/checkUsername', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.deepEqual(body.data, 0);
            let check = validator.validate(body, checkUsernameSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - will not checkusername - no data", (done) => {
        let params = {
            qs: {
            }
        };
        requester('/checkUsername', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            let check = validator.validate(body, checkUsernameSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});