"use strict";
const assert = require('assert');
const requester = require('../../requester');


describe("Testing get group API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - by id will return group record", (done) => {
        let params = {
            "qs": {"id": "5c8d0c505653de3985aa0ffe"}
        };
        requester('/admin/group', 'get', params, (error, body) => {
            console.log(error);
            console.log(body);
            done();
        });
    });

    it("Success - by code will return group record", (done) => {
        let params = {
            "qs": {"code": "owner"}
        };
        requester('/admin/group', 'get', params, (error, body) => {
            console.log(error);
            console.log(body);
            done();
        });
    });

    it("Success - will return inputmask error", (done) => {
        let params = {
        };
        requester('/admin/group', 'get', params, (error, body) => {
            console.log(error);
            console.log(body);
            done();
        });
    });

    it("Success - will return not found error", (done) => {
        let params = {
            "qs": {"id": "5cfb05c22ac09278709d0141"}
        };
        requester('/admin/group', 'get', params, (error, body) => {
            console.log(error);
            console.log(body);
            done();
        });
    });
});