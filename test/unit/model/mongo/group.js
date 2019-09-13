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
        modelObj = new Model(soajs, {"serviceName": "urac"}, null);
        done();
    });

    it("Add group - error", function (done) {
        modelObj.add(null, (error, record) => {
            assert.ok(error);
            done();
        });
    });
    it("Add group - with data", function (done) {
        let data = {
            "code": "AAAA",
            "name": "Unit test",
            "description": "Added by unit test.",
            "config": {
                "allowedPackages": {
                    "DSBRD": ["DSBRD_DEVOP"]
                },
                "allowedEnvironments": {
                    "DEV": {}
                }
            },
            "tId": "5c0e74ba9acc3c5a84a51259",
            "tCode": "TES0"
        };
        modelObj.add(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.code, 'AAAA');
            done();
        });
    });
    it("Add group - with same data to test index", function (done) {
        let data = {
            "code": "AAAA",
            "name": "Unit test",
            "description": "Added by unit test.",
            "config": {
                "allowedPackages": {
                    "DSBRD": ["DSBRD_DEVOP"]
                },
                "allowedEnvironments": {
                    "DEV": {}
                }
            },
            "tId": "5c0e74ba9acc3c5a84a51259",
            "tCode": "TES0"
        };
        modelObj.add(data, (error, record) => {
            console.log(error)
            assert.ok(error);
            done();
        });
    });


    it("Constructor - with tenant - close connection", function (done) {
        modelObj.closeConnection();
        done();
    });
});