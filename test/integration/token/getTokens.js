"use strict";
const assert = require('assert');
const requester = require('../requester');

describe("Testing get tokens API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - GET /admin/tokens - inviteToJoin", (done) => {
        let params = {
            qs: {
                "service": "inviteToJoin"
            }
        };
        requester('/admin/tokens', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            done();
        });
    });

    it("Success - GET /admin/tokens - joinInvite", (done) => {
        let params = {
            qs: {
                "service": "joinInvite"
            }
        };
        requester('/admin/tokens', 'get', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            done();
        });
    });

});