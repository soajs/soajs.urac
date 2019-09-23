"use strict";

const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../helper.js");
const BL = helper.requireModule('bl/user.js');
const assert = require('assert');


describe("Unit test for: BL - user", () => {
    let soajs = {
        "tenant": {
            "code": "TES0",
            "id": "5c0e74ba9acc3c5a84a51259"
        },
        "log": {
            "error": (msg) => {
                console.log(msg);
            },
            "debug": (msg) => {
                console.log(msg);
            }
        }
    };

    before((done) => {

        BL.localConfig = helper.requireModule("config.js");

        done();
    });

    it("Get user", function (done) {
        function MODEL() {
            console.log("user model");
        }

        MODEL.prototype.closeConnection = () => {
        };
        MODEL.prototype.getUser = (data, cb) => {
            if (data && data.id && data.id === "error") {
                let error = new Error("User: getUser - mongo error.");
                return cb(error, null);
            } else if (data && data.id && data.id === "empty") {
                return cb(null, null);
            } else {
                return cb(null, data);
            }
        };
        BL.model = MODEL;

        BL.getUser(soajs, null, null, (error) => {
            assert.ok(error);

            BL.getUser(soajs, {"id": "error"}, null, (error) => {
                assert.ok(error);

                BL.getUser(soajs, {"id": "empty"}, null, (error) => {
                    assert.ok(error);

                    BL.getUser(soajs, {"id": "1221212121"}, null, (error, record) => {
                        assert.ok(record);
                        done();
                    });
                });
            });

        });
    });
    it('Count User', (done) => {
        function MODEL() {
            console.log("user model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.checkUsername = (data, cb) => {
            if (data && data.username && data.username === "error") {
                let error = new Error("User: Count User - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, true);
            }
        };
        BL.model = MODEL;

        BL.countUser(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                username: 'Found',
                exclude_id: 'none'
            };
            BL.countUser(soajs, data, null, (err, result) => {
                assert.ok(result);
                assert.deepEqual(result, true);

                data.username = "error";
                BL.countUser(soajs, data, null, (error) => {
                    assert.ok(error);
                    assert.deepEqual(error.code, 602);
                    done();
                });
            });
        });
    });
    it('Count Users', (done) => {
        function MODEL() {
            console.log("user model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.countUsers = (data, cb) => {
            if (data && data.keywords && data.keywords === "error") {
                let error = new Error("User: Count Users - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, 1);
            }
        };
        BL.model = MODEL;

        BL.countUsers(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                keywords: ["usernameToTest"]
            };
            BL.countUsers(soajs, data, null, (err, result) => {
                assert.ok(result);
                assert.deepEqual(result, 1);

                data.keywords = "error";
                BL.countUsers(soajs, data, null, (error) => {
                    assert.ok(error);
                    assert.deepEqual(error.code, 602);
                    done();
                });
            });
        });
    });
    it('Get User by Username', (done) => {
        function MODEL() {
            console.log("user model");
        }

        MODEL.prototype.closeConnection = () => {
        };

        MODEL.prototype.getUserByUsername = (data, cb) => {
            if (data && data.username && data.username === "error") {
                let error = new Error("User: Count Users - mongo error.");
                return cb(error, null);
            } else if (data && data.username && data.username === "empty") {
                return cb(null, null);
            } else {
                return cb(null, { _id: "UserID",
                    username: 'userTest',
                    firstName: 'user',
                    lastName: 'test',
                    email: 'test@soajs.org',
                    status: 'active',
                    tenant: { code: 'TES0', id: '5c0e74ba9acc3c5a84a51259' },
                    ts: 1569246037145,
                    profile: {},
                    groups: [],
                    config: {} });
            }
        };
        BL.model = MODEL;

        BL.getUserByUsername(soajs, null, null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, {
                code: 400,
                msg: BL.localConfig.errors[400]
            });

            let data = {
                username: 'userTest'
            };

            BL.getUserByUsername(soajs, data, null, (err, record) => {
                assert.ok(record);
                assert.deepEqual(record.username, 'userTest');
                assert.deepEqual(record._id, 'UserID');
                assert.deepEqual(record.email, 'test@soajs.org');

                data.username = 'error';
                BL.getUserByUsername(soajs, data, null, (error) => {
                    assert.ok(error);
                    assert.deepEqual(error.code, 602);

                    data.username = 'empty';

                    BL.getUserByUsername(soajs, data, null, (error) => {
                        assert.ok(error);
                        assert.deepEqual(error, {code: 520, msg: BL.localConfig.errors[520]});

                        done();
                    });
                });
            });
        });
    });

});