"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let joinSchema = require("../schemas/join.js");

describe("Testing /join API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - will join", (done) => {
        let params = {
            body: {
                username: 'joiner',
                firstName: 'new',
                lastName: 'Join',
                email: 'join@new.com',
                password: 'SomePass'
            }
        };
        requester('/join', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            let check = validator.validate(body, joinSchema);
            assert.deepStrictEqual(check.valid, true);
            assert.deepStrictEqual(check.errors, []);
            done();
        });
    });

    it("Success - will join with membership", (done) => {
        let params = {
            body: {
                username: 'joiner2',
                firstName: 'new2',
                lastName: 'Join2',
                email: 'join2@new.com',
                password: 'SomePass',
                membership: "basic"
            }
        };
        requester('/join', 'post', params, (error, body) => {
            console.log(body);
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            let check = validator.validate(body, joinSchema);
            assert.deepStrictEqual(check.valid, true);
            assert.deepStrictEqual(check.errors, []);
            done();
        });
    });

    it("Fails - No data", (done) => {
        let params = {};
        requester('/join', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepStrictEqual(body.errors.details, [{
                code: 172,
                message: 'Missing required field: password, firstName, lastName, email'
            }]);
            let check = validator.validate(body, joinSchema);
            assert.deepStrictEqual(check.valid, true);
            assert.deepStrictEqual(check.errors, []);
            done();
        });
    });
});