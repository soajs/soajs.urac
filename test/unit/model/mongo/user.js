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

    it("Get user - error", function (done) {
        modelObj.getUserByUsername(null, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("Get user - with username", function (done) {
        let data = {
            "username": "tony"
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("Get user - with email", function (done) {
        let data = {
            "username": "tony@localhost.com"
        };

        modelObj.getUserByUsername(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.username, "tony");
            done();
        });
    });

    it("Get user - with email and status", function (done) {
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


    it("Get user - with email and status as array", function (done) {
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

    it("validateId - error", function (done) {
        modelObj.validateId(null, (error, id) => {
            assert.ok(error);
            done();
        });
    });

    it("validateId - error invalid id", function (done) {
        modelObj.validateId("121212", (error, id) => {
            assert.ok(error);
            let index = error.message.indexOf("12 bytes or a string of 24 hex characters");
            assert.ok(index > 0);
            done();
        });
    });

    it("validateId - with id", function (done) {
        modelObj.validateId("5cfb05c22ac09278709d0141", (error, id) => {
            assert.ok(id);
            done();
        });
    });

    it("Constructor - with tenant - close connection", function (done) {
        modelObj.closeConnection();
        done();
    });
});