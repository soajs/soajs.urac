"use strict";
const assert = require('assert');
const requester = require('../../requester');

describe("Testing last seen API", () => {

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    let users;
    let selectedUser;


    //TODO: Nothing gets updated since status is already active, we should create a new user and update its status
    it("Success - set last seen on the logged in user", (done) => {


        requester('/user/last/seen', 'post', {}, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.deepEqual(body.data, true);

            requester('/user/me', 'get', {}, (error, body) => {
                assert.ok(body);
                assert.ok(body.data.lastSeen)
                done();
            });
        });
    });
});