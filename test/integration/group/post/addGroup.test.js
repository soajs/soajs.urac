"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let addGroupSchema = require("../schemas/addGroup.js");

describe("Testing get group API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - will add group record", (done) => {
        let params = {
            body: {
                "code": "FFFF",
                "name": "integration",
                "description": "integration description",
                "environments": ["dev", "test"],
                "packages": [{"product": "client", "packages": ["pack"]}]
            }
        };
        requester('/admin/group', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
	        let check = validator.validate(body, addGroupSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Fails - will not add group record - no record", (done) => {
        let params = {
        };
        requester('/admin/group', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            let check = validator.validate(body, addGroupSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});