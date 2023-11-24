"use strict";
const assert = require('assert');
const requester = require('../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let joinSchema = require("../index/schemas/join.js");

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
                "username": 'joininvitecode1',
                "email": "tony1@hage.com",
                "phone": "9999999998",
                "firstName": "tony",
                "lastName": "hage",
                "password": 'SomePass',
                "code": "107811"
            }
        };
        requester('/join/invite', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            let check = validator.validate(body, joinSchema);
            assert.deepStrictEqual(check.valid, true);
            assert.deepStrictEqual(check.errors, []);

            let params = {
                qs: {
                    "username": 'joininvitecode1',
                    "confirmation": "phone"
                }
            };
            requester('/resend/code', 'get', params, (error, body) => {
                assert.ifError(error);
                assert.ok(body);
                assert.ok(body.data);
                done();
            });
        });
    });
});