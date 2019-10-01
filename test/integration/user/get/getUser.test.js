"use strict";
const assert = require('assert');
const requester = require('../../requester');


describe("Testing get user API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - by id will return user record", (done) => {
        let params = {
            "qs": {"id": "5c8d0c505653de3985aa0ffd"}
        };
        requester('/admin/user', 'get', params, (error, body) => {
            console.log(error);
            console.log(body);
            done();
        });
    });



    it("Success - will return inputmask error", (done) => {
        let params = {
        };
        requester('/admin/user', 'get', params, (error, body) => {
            console.log(error);
            console.log(body);
            done();
        });
    });

    it("Success - will return not found error", (done) => {
        let params = {
            "qs": {"id": "5cfb05c22ac09278709d0141"}
        };
        requester('/admin/user', 'get', params, (error, body) => {
            console.log(error);
            console.log(body);
            done();
        });
    });
});