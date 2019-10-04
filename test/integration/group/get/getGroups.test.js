"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let listGroupsSchema = require("../schemas/getGroups.js");

describe("Testing get groups API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - will all return group records", (done) => {
        let params = {};
        requester('/admin/groups', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            console.log('bouday', body.data);
            assert.ok(body.data.length > 0);
            let check = validator.validate(body, listGroupsSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

});