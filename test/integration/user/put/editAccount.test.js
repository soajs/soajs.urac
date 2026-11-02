"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let editAccountSchema = require("../schemas/editAccount.js");
let listUsersSchema = require("../schemas/getUsers.js");

describe("Testing edit account API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    let users;
    let selectedUser;
    // user of the requester access token
    let ownerId = "5c8d0c505653de3985aa0ffd";

    it("Success - by id will return all user records - no data", (done) => {
        let params = {
            qs: {
            }
        };
        requester('/admin/users', 'get', params, (error, body) => {
            assert.ok(body);
            assert.ok(body.data.length > 0);
            users = body.data;
            users.forEach(user => {
                if (user.username === 'johnd') {
                    selectedUser = user;
                }
            });
            let check = validator.validate(body, listUsersSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - by id will edit account info", (done) => {
        let params = {
            body: {
                id: ownerId,
                firstName: 'John',
                lastName: 'Does',
                profile: {
                    "john": "Europe"
                }
            }
        };
        requester('/account', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.deepEqual(body.data, true);
            let check = validator.validate(body, editAccountSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - no id will edit the signed in user ln only", (done) => {
        let params = {
            body: {
                ln: 'fr'
            }
        };
        requester('/account', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.deepEqual(body.data, true);
            let check = validator.validate(body, editAccountSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Fails - another user id", (done) => {
        let params = {
            body: {
                id: selectedUser._id,
                phone: '+15551234567'
            }
        };
        requester('/account', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [ { code: 540, message: 'The id does not match the signed in user.' } ]);
            let check = validator.validate(body, editAccountSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Fails - No data", (done) => {
        let params = {
        };
        requester('/account', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [ { code: 602, message: 'Model error: User: nothing to update.' } ]);
            let check = validator.validate(body, editAccountSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Error - Not valid", (done) => {
        let params = {
            body: {
                id: 'notvalid'
            }
        };
        requester('/account', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [ { code: 540, message: 'The id does not match the signed in user.' } ]);
            let check = validator.validate(body, editAccountSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});