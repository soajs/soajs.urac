"use strict";
const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../../helper.js");
const Model = helper.requireModule('./model/mongo/group.js');
const assert = require('assert');

describe("Unit test for: model - group", function () {
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

    it("Constructor - with tenant - open connection", function (done) {
        modelObj = new Model(soajs);
        done();
    });

    it("test - validateId", function (done) {
        modelObj.validateId({"id": "5c8d0c505653de3985aa0ffe"}, (error, id) => {
            assert.equal(id, "5c8d0c505653de3985aa0ffe");
            done();
        });
    });

    it("test - getGroups - with no data", function (done) {
        modelObj.getGroups(null, (error, records) => {
            assert.ok(error);
            done();
        });
    });

    it("test - getGroups - with data", function (done) {
        modelObj.getGroups({"groups": ["owner"]}, (error, records) => {
            assert.equal(records[0].code, "owner");
            done();
        });
    });

    it("test - getGroups - with data & tId", function (done) {
        modelObj.getGroups({"groups": ["owner", "devop"], "tId": "5c0e74ba9acc3c5a84a51259"}, (error, records) => {
            assert.equal(records.length, 2);
            done();
        });
    });

    it("test - getGroups - with data & with wrong tId", function (done) {
        modelObj.getGroups({"groups": ["owner"], "tId": "5c0e74ba9acc3c5a84a51258"}, (error, records) => {
            assert.equal(records.length, 0);
            done();
        });
    });

    it("Constructor - with tenant - close connection", function (done) {
        modelObj.closeConnection();
        done();
    });

    it("Constructor - with tenant - close connection", function (done) {
        modelObj.closeConnection();
        done();
    });
});