"use strict";
const assert = require('assert');
const requester = require('../../requester');


describe("Testing get groups API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - will return group record", (done) => {
        let params = {};
        requester('/admin/groups', 'get', params, (error, body) => {
            console.log(error);
            console.log(body);
            done();
        });
    });

});