"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let joinSchema = require("../schemas/join.js");

describe("Testing /join/invite API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - /join/invite", (done) => {
        let params = {
            body: {
                "username": 'joininvitecode',
                "email": "tony@hage.com",
                "phone": "9999999999",
                "firstName": "tony",
                "lastName": "hage",
                "password": 'SomePass',
                "code": "107810"
            }
        };
        requester('/join/invite', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            let check = validator.validate(body, joinSchema);
            assert.deepStrictEqual(check.valid, true);
            assert.deepStrictEqual(check.errors, []);
            done();
        });
    });

    it.skip("Fails - wrong email or phone", (done) => {
        let params = {
            body: {
                "username": 'joininvitecode',
                "email": "0000@hage.com",
                "phone": "0000000000",
                "firstName": "tony",
                "lastName": "hage",
                "password": 'SomePass',
                "code": "107810"
            }
        };
        requester('/join/invite', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.strictEqual(body.errors.codes[0], 537);
            let check = validator.validate(body, joinSchema);
            assert.deepStrictEqual(check.valid, true);
            assert.deepStrictEqual(check.errors, []);
            done();
        });
    });

    it("Fails - wrong code", (done) => {
        let params = {
            body: {
                "username": 'joininvitecode',
                "email": "tony@hage.com",
                "phone": "9999999999",
                "firstName": "tony",
                "lastName": "hage",
                "password": 'SomePass',
                "code": "000000"
            }
        };
        requester('/join/invite', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.strictEqual(body.errors.codes[0], 600);
            let check = validator.validate(body, joinSchema);
            assert.deepStrictEqual(check.valid, true);
            assert.deepStrictEqual(check.errors, []);
            done();
        });
    });
});