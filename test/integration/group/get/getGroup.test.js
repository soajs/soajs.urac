"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let getGroupSchema = require("../schemas/getGroup.js");

describe("Testing get group API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    let groups;
    let selectedGroup;

    it("Success - will all return group records", (done) => {
        let params = {};
        requester('/admin/groups', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data.length > 0);
            groups = body.data;
            groups.forEach(group => {
                if (group.code === 'AAAA'){
                    selectedGroup = group;
                }
            });
            done();
        });
    });

    it("Success - by id will return group record", (done) => {
        let params = {
            "qs": {"id": selectedGroup._id}
        };
        requester('/admin/group', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            let check = validator.validate(body, getGroupSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - by code will return group record", (done) => {
        let params = {
            "qs": {"code": selectedGroup.code}
        };
        requester('/admin/group', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            let check = validator.validate(body, getGroupSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - by code will not return group record", (done) => {
        let params = {
            "qs": {"code": "owner"}
        };
        requester('/admin/group', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.deepEqual(body.errors.details, [ { code: 420, message: 'Unable to find group.' } ]);
            done();
        });
    });

    it("Fails - will return inputmask error", (done) => {
        let params = {
        };
        requester('/admin/group', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.deepEqual(body.errors.details, [ { code: 602, message: 'Model error: Group: must provide either id or code.' } ]);
            done();
        });
    });

    it("Fails - will return not found error", (done) => {
        let params = {
            "qs": {"id": "5cfb05c22ac09278709d0141"}
        };
        requester('/admin/group', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.deepEqual(body.errors.details, [ { code: 420, message: 'Unable to find group.' } ]);
            done();
        });
    });

    it("Fails - will return not found error", (done) => {
        let params = {
            "qs": {"id": "notValid"}
        };
        requester('/admin/group', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.deepEqual(body.errors.details, [ { code: 602,
                message:
                    'Model error: Argument passed in must be a single String of 12 bytes or a string of 24 hex characters' } ]);
            done();
        });
    });
});