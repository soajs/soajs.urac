"use strict";
const assert = require('assert');
const requester = require('../../requester');
let core = require('soajs').core;
let validator = new core.validator.Validator();
let addUserSchema = require("../schemas/addUser.js");

//let clientKey = 'e267a49b84bfa1e95dffe1efd45e443f36d7dced1dc97e8c46ce1965bac78faaa0b6fe18d50efa5a9782838841cba9659fac52a77f8fa0a69eb0188eef4038c49ee17f191c1d280fde4d34580cc3e6d00a05a7c58b07a504f0302915bbe58c18';

describe("Testing add user API", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("Success - will add User", (done) => {
        let params = {
            body: {
                username: 'samouel',
                firstName: 'Sam',
                lastName: 'Add',
                profile: {
                    "Sam": "Lebanon"
                },
                email: 'sam@samouel.com',
                groups: ['AAAA'],
                status: 'active',
                password: 'SomePass',
                pin: {
                    code: true,
                    allowed: true
                }
            }
        };
        requester('/admin/user', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
	        assert.ok(body.data.hasOwnProperty('id'));
            let check = validator.validate(body, addUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
	
	it("Success - will add User", (done) => {
		let params = {
			headers: {
				//key: clientKey
			},
			body: {
				username: 'subclient',
				firstName: 'sub',
				lastName: 'client',
				profile: {
					"sub": "client"
				},
				email: 'ssub@client.com',
				groups: ['AAAA'],
				status: 'active',
				password: 'password',
				pin: {
					code: true,
					allowed: true
				}
			}
		};
		requester('/admin/user', 'post', params, (error, body) => {
			assert.ifError(error);
			assert.ok(body);
			assert.ok(body.data);
			assert.ok(body.data.hasOwnProperty('id'));
			let check = validator.validate(body, addUserSchema);
			assert.deepEqual(check.valid, true);
			assert.deepEqual(check.errors, []);
			done();
		});
	});

    it("Success - will add User pendingNew", (done) => {
        let params = {
            body: {
                username: 'pending',
                firstName: 'New',
                lastName: 'Add',
                profile: {
                    "Test": "America"
                },
                email: 'test@local.com',
                groups: ['AAAA'],
                status: 'pendingNew',
                pin: {
                    code: true,
                    allowed: true
                }
            }
        };
        requester('/admin/user', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.ok(body.data.hasOwnProperty('id'));
            let check = validator.validate(body, addUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Success - will add User pendingNew no pin", (done) => {
        let params = {
            body: {
                username: 'kamil',
                firstName: 'kam',
                lastName: 'ill',
                profile: {
                    "Test": "America"
                },
                email: 'kamil@local.com',
                groups: ['AAAA'],
                status: 'pendingNew',
            }
        };
        requester('/admin/user', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.ok(body.data.hasOwnProperty('id'));
            let check = validator.validate(body, addUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it.skip("Success - will add User pendingNew no pin - client tenant", (done) => {
        let params = {
            body: {
                username: 'kamil',
                firstName: 'kam',
                lastName: 'ill',
                profile: {
                    "Test": "America"
                },
                email: 'kamil@local.com',
                groups: ['CCCC'],
                status: 'pendingNew',
            },
            headers: {
                key: 'aa39b5490c4a4ed0e56d7ec1232a428f1c5b5dcabc0788ce563402e233386738fc3eb18234a486ce1667cf70bd0e8b08890a86126cf1aa8d38f84606d8a6346359a61678428343e01319e0b784bc7e2ca267bbaafccffcb6174206e8c83f2a25'
            }
        };
        requester('/admin/user', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.data);
            assert.ok(body.data.hasOwnProperty('id'));
            let check = validator.validate(body, addUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Fails - will not add User - found", (done) => {
        let params = {
            body: {
                username: 'johnd',
                firstName: 'Same',
                lastName: 'John',
                profile: {
                    "Sam": "Lebanon"
                },
                email: 'john@localhost.com',
                groups: ['AAAA'],
                status: 'active',
                password: 'SomePass',
                pin: {
                    code: true,
                    allowed: true
                }
            }
        };
        requester('/admin/user', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            // assert.deepEqual(body.errors ); //TODO: 402 Has undefined message
            let check = validator.validate(body, addUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });

    it("Fails - No data", (done) => {
        let params = {
        };
        requester('/admin/user', 'post', params, (error, body) => {
            assert.ifError(error);
            assert.ok(body);
            assert.ok(body.errors);
            assert.deepEqual(body.errors.details, [{
                code: 172,
                message: 'Missing required field: username, firstName, lastName, email'
            }]);
            let check = validator.validate(body, addUserSchema);
            assert.deepEqual(check.valid, true);
            assert.deepEqual(check.errors, []);
            done();
        });
    });
});