"use strict";
const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../../helper.js");
const Model = helper.requireModule('./model/mongo/user.js');
const assert = require('assert');

describe("Unit test for: model - user", function () {
    let soajs = {
        "meta": core.meta,
        "tenant": {
            "code": "TES0",
            "id": "5c0e74ba9acc3c5a84a51259"
        },
        "registry": {
            "tenantMetaDB": {
                "urac": {
                    "prefix": "",
                    "cluster": "test_cluster",
                    "name": "#TENANT_NAME#_urac",
                    "servers": [
                        {
                            "host": "127.0.0.1",
                            "port": 27017
                        }
                    ],
                    "credentials": null,
                    "streaming": {
                        "batchSize": 1000
                    },
                    "URLParam": {
                        "bufferMaxEntries": 0
                    },
                    "timeConnected": 1552747598093
                }
            }
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
    let modelObj = null;

    it("Constructor - with tenant - open connection", function (done) {
        let localConfig = helper.requireModule("config.js");
        modelObj = new Model(soajs, localConfig, null);
        done();
    });

    it("Get UserByUsername - error", function (done) {
        modelObj.getUserByUsername(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("getUserByUsername- with username", function (done) {
        let data = {
            "username": "tony"
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUserByUsername - with email", function (done) {
        let data = {
            "username": "tony@localhost.com"
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUserByUsername - with email and status", function (done) {
        let data = {
            "username": "tony@localhost.com",
            "status": "active"
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUserByUsername - with email and status as array", function (done) {
        let data = {
            "username": "tony@localhost.com",
            "status": ["active", "pendingNew"]
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUser - error", function (done) {
        modelObj.getUser(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("getUser - with id", function (done) {
        let data = {
            "id": "5d7fee0876186d9ab9b36492"
        };

        modelObj.getUser(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUser - with id and status", function (done) {
        let data = {
            "id": "5d7fee0876186d9ab9b36492",
            "status": "active"
        };

        modelObj.getUser(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUser - with id and status as well as keeping password", function (done) {
        let data = {
            "id": "5d7fee0876186d9ab9b36492",
            "status": "active",
            "keep": {"pwd":1}
        };

        modelObj.getUser(data, (error, record) => {
            assert.ok(record);
            assert.ok(record.password);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("getUser - with invalid id", function (done) {
        let data = {
            "id": "1212121"
        };

        modelObj.getUser(data, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("getUsers - with keywords", function (done) {
        let data = {
            "keywords": "ony",
            "limit": 10,
            "start": 0,
            "config": true
        };

        modelObj.getUsers(data, (error, records) => {
            assert.ok(records);
            done();
        });
    });

    it("getUsersByIds - error", function (done) {
        modelObj.getUsersByIds(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("getUsersByIds - invalid ids", function (done) {
        let data = {
            "ids": ["12121212"],
            "limit": 10,
            "start": 0,
            "config": true
        };
        modelObj.getUsersByIds(data, (error, records) => {
            assert.equal(records.length, 0);
            done();
        });
    });

    it("getUsersByIds", function (done) {
        let data = {
            "ids": ["5d7fee0876186d9ab9b36492"],
            "limit": 10,
            "start": 0,
            "config": true
        };

        modelObj.getUsersByIds(data, (error, records) => {
            assert.ok(records);
            done();
        });
    });

    it("checkUsername - error", function (done) {
        modelObj.checkUsername(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("checkUsername - with username", function (done) {
        let data = {
            "username": "tony"
        };

        modelObj.checkUsername(data, (error, count) => {
            assert.ok(count);
            assert.equal(count, 1);
            done();
        });
    });

    it("checkUsername - with username and exclude_id", function (done) {
        modelObj.validateId("5d7fee0876186d9ab9b36492", (error, _id) => {
            let data = {
                "username": "tony",
                "exclude_id": _id
            };
            modelObj.checkUsername(data, (error, count) => {
                assert.equal(count, 0);
                done();
            });
        });
    });

    it("countUsers - with keywords", function (done) {
        let data = {
            "keywords": "ony"
        };

        modelObj.countUsers(data, (error, count) => {
            assert.ok(count);
            assert.equal(count, 1);
            done();
        });
    });

    it("add - error", function (done) {
        modelObj.add(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("add", function (done) {
        let data = {
            "username": "test",
            "firstName": "unit",
            "lastName": "test",
            "email": "test@soajs.org",

            "password": "password",
            "status": "active",

            "tenant": {
                "code": "TES0",
                "id": "5c0e74ba9acc3c5a84a51259"
            }
        };
        modelObj.add(data, (error, record) => {
            assert.ok(record);
            assert.ok(record._id);
            done();
        });
    });

    it("add - error duplicate", function (done) {
        let data = {
            "username": "test",
            "firstName": "unit",
            "lastName": "test",
            "email": "test@soajs.org",

            "password": "password",
            "status": "active",

            "tenant": {
                "code": "TES0",
                "id": "5c0e74ba9acc3c5a84a51259"
            }
        };
        modelObj.add(data, (error, record) => {
            assert.ok(error);
            let index = error.message.indexOf("duplicate key");
            assert.ok(index > 0);
            done();
        });
    });




    it("validateId - error", function (done) {
        modelObj.validateId(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("validateId - error invalid id", function (done) {
        modelObj.validateId("121212", (error,) => {
            assert.ok(error);
            let index = error.message.indexOf("12 bytes or a string of 24 hex characters");
            assert.ok(index > 0);
            done();
        });
    });

    it("validateId - with id", function (done) {
        modelObj.validateId("5cfb05c22ac09278709d0141", (error, _id) => {
            assert.ok(_id);
            done();
        });
    });

    it("Constructor - with tenant - close connection", function (done) {
        modelObj.closeConnection();
        done();
    });
});