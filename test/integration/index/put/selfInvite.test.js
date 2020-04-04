"use strict";
const assert = require('assert');
const requester = require('../../requester');

let stExtKey = 'e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18';

describe("Testing self invite user API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - will invite user - from access token", (done) => {
        let params = {
            body: {
                pin: {
                    allowed: true,
                    code: true
                },
                groups: ['dev'],
                tenant: {
                    id: "5d9321f8b40e09438afbd0e3",
                    code: "client"
                }
            }
        };
        requester('/admin/user/self/invite', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data.id);
            assert.ok(body.data.tenant);
            done();
        });
    });

    it("Fail - will not invite Users already invited", (done) => {
        let params = {
            body: {
                pin: {
                    allowed: true,
                    code: true
                },
                groups: ['dev'],
                tenant: {
                    id: "5d9321f8b40e09438afbd0e3",
                    code: "client"
                }
            }
        };
        requester('/admin/user/self/invite', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [{
                code: 529,
                message: 'User has already been invited.'
            }]);
            done();
        });
    });

    it("Fail - Only works for Main tenant", (done) => {
        let params = {
            headers: {
                key: stExtKey
            },
            body: {
                pin: {
                    allowed: true,
                    code: true
                },
                groups: ['dev'],
                tenant: {
                    id: "5d9321f8b40e09438afbd0e3",
                    code: "client"
                }
            }
        };
        requester('/admin/user/self/invite', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [{
                code: 535,
                message: 'Sub tenant cannot self invite a user.'
            }]);
            done();
        });
    });

    it("Fail - will not invite User - Missing required field", (done) => {
        let params = {
            body: {}
        };
        requester('/admin/user/self/invite', 'put', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [{
                code: 172,
                message: 'Missing required field: tenant'
            }]);
            done();
        });
    });
});