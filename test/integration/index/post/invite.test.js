"use strict";
const assert = require('assert');
const requester = require('../../requester');

describe("Testing /invite API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - invite to join", (done) => {
        let params = {
            body: {
                username: 'invitetojoin',
                firstName: 'invite',
                lastName: 'user',
                email: 'invite@user.com',
                phone: '1234567890'
            }
        };
        requester('/invite', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            done();
        });
    });
});