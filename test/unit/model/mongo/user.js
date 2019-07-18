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
        "config": {"serviceName": "urac"},
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
    let users;
    let userOne;
    let userTwo;


    it("Constructor - with tenant - open connection", function (done) {
        modelObj = new Model(soajs);
        done();
    });

    it("test - getUsers", function (done) {
        modelObj.getUsers(null, (error, records) => {
            users = records;
            users.forEach(user => {
                if (user.locked) {
                    userOne = user;
                } else {
                    userTwo = user;
                }
            });
            assert.notEqual(records.length, 0);
            done();
        });
    });

    it("test - validateId", function (done) {
        modelObj.validateId({"id": userOne._id}, (error, id) => {
            assert.equal(id, userOne.id);
            done();
        });
    });

    it("test - countUsers", function (done) {
        modelObj.countUsers({"id": userOne._id, "username": "owner"}, (error, record) => {
            assert.equal(record, 1);
            done();
        });
    });

    it("test - getUser - ID", function (done) {
        modelObj.getUserById({"id": userOne._id}, (error, record) => {
            assert.equal(record.username, "owner");
            done();
        });
    });

    it("test - getUser - username", function (done) {
        modelObj.getUserByUsername({"username": "owner"}, (error, record) => {
            assert.equal(record.firstName, userOne.firstName);
            done();
        });
    });

    it("test - checkIfExists - username only", function (done) {
        modelObj.checkIfExists({"username": "owner"}, (error, record) => {
            assert.equal(record, 1);
            done();
        });
    });

    it("test - checkIfExists - email only", function (done) {
        modelObj.checkIfExists({"email": "fadi@localhost.com"}, (error, record) => {
            assert.equal(record, 1);
            done();
        });
    });

    it("test - checkIfExists - no username and email", function (done) {
        modelObj.checkIfExists(null, (error, record) => {
            assert.equal(record, null);
            done();
        });
    });

    it("test - getUsers", function (done) {
        modelObj.getUsers(null, (error, records) => {
            assert.notEqual(records.length, 0);
            done();
        });
    });

    it("test - editUser - no data", function (done) {
        modelObj.editUser(null, (error, records) => {
            assert.equal(records, null);
            done();
        });
    });

    it("test - addUser - with data", function (done) {
        modelObj.addUser({
            "username": "test2",
            "password": "Fadi",
            "firstName": "Fadi",
            "lastName": "Test",
            "email": "test2@localhost.com",
            "status": "active",
            "config": {},
            "locked": true,
            "groups": ["devop", "owner"],
            "ts": 1552747600152,
        }, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("test - editUser - with data", function (done) {
        modelObj.editUser({
            "id": userTwo._id,
            "username": "test2",
            "password": "Fadi2",
            "firstName": "Fadi",
            "lastName": "Test",
            "email": "test2@localhost.com",
            "status": "active",
            "config": {},
            "locked": false,
            "groups": ["devop"],
            "ts": 1552747600152,
        }, (error, record) => {
            assert.equal(record, 1);
            done();
        });
    });

    it("test - deleteUser - with locked user error", function (done) {
        modelObj.deleteUser({"id": userOne._id}, (error, result) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("cannot delete a locked record."));
            done();
        });
    });

    it("test - deleteUser - with not locked user", function (done) {
        modelObj.deleteUser({"id": userTwo._id}, (error, result) => {
            assert.ok(result);
            done();
        });
    });

    it("Constructor - with tenant - close connection", function (done) {
        modelObj.closeConnection();
        done();
    });

});