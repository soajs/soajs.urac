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

    let AAAA_group_id = null;

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
            "allowedEnvironments": ["dev", "prod"],
            "allowedPackages": [{product: "DSBRD", package: "DSBRD_DEVOP"},
                {product: "DSBRD", package: "DSBRD_CATAL"}, {product: "RERES", package: "WAITER"}],
            "tId": "5c0e74ba9acc3c5a84a51259",
            "tCode": "TES0"
        };
        modelObj.add(data, (error, record) => {
            assert.ok(record);
            AAAA_group_id = record._id.toString();
            assert.equal(record.code, 'AAAA');
            done();
        });
    });
    it("Add group - with same data to test index", function (done) {
        let data = {
            "code": "AAAA",
            "name": "Unit test",
            "description": "Added by unit test.",
            "tId": "5c0e74ba9acc3c5a84a51259",
            "tCode": "TES0"
        };
        modelObj.add(data, (error, record) => {
            assert.ok(error);
            let index = error.message.indexOf("duplicate key");
            assert.ok(index > 0);
            done();
        });
    });

    it("Get groups", function (done) {
        modelObj.getGroups(null, (error, records) => {
            assert.ok(records);
            assert.ok(Array.isArray(records));
            done();
        });
    });

    it("Get group - error", function (done) {
        modelObj.getGroup(null, (error, records) => {
            assert.ok(error);
            done();
        });
    });

    it("Get group - with code", function (done) {
        let data = {
            "code": "AAAA"
        };

        modelObj.getGroup(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.code, "AAAA");
            done();
        });
    });

    it("Get group - with id", function (done) {
        let data = {
            "id": "5cfb05c22ac09278709d0141"
        };

        modelObj.getGroup(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.code, "BBBB");
            done();
        });
    });

    it("Get group - with invalid id", function (done) {
        let data = {
            "id": "121212121"
        };

        modelObj.getGroup(data, (error, record) => {
            assert.ok(error);
            done();
        });
    });

    it("Edit group - error", function (done) {
        modelObj.edit(null, (error, record) => {
            assert.ok(error);
            done();
        });
    });

    it("Edit group - with id but no data", function (done) {
        let data = {
            "id": AAAA_group_id
        };
        modelObj.edit(data, (error, record) => {
            assert.ok(error);
            done();
        });
    });

    it("Edit group - with id and data", function (done) {
        let data = {
            "id": AAAA_group_id,
            "name": "test case",
            "description": "modified by unit test",
            "allowedEnvironments": ["test", "stg"],
            "allowedPackages": [{product: "hage", package: "spiro"},
                {product: "hage", package: "farid"}, {product: "soajs", package: "console"}]
        };
        modelObj.edit(data, (error, record) => {
            assert.ok(record);
            assert.equal(record, 1);
            done();
        });
    });

    it("Edit group - with invalid id and data", function (done) {
        let data = {
            "id": "121212",
            "name": "test case",
            "description": "modified by unit test",
            "allowedEnvironments": ["test", "stg"],
            "allowedPackages": [{product: "hage", package: "spiro"},
                {product: "hage", package: "farid"}, {product: "soajs", package: "console"}]
        };
        modelObj.edit(data, (error, record) => {
            assert.ok(error);
            done();
        });
    });

    it("Delete group - error", function (done) {
        modelObj.delete(null, (error, record) => {
            assert.ok(error);
            done();
        });
    });

    it("Delete group - with id", function (done) {
        let data = {
            "id": "5cfb05c22ac09278709d0141"
        };
        modelObj.delete(data, (error, record) => {
            assert.ok(record);
            assert.equal(record.code, "BBBB");
            done();
        });
    });

    it("Delete group - with invalid id", function (done) {
        let data = {
            "id": "12121212"
        };
        modelObj.delete(data, (error, record) => {
            assert.ok(error);
            done();
        });
    });

    it("Delete group - with id not found", function (done) {
        let data = {
            "id": "5d7e702727ef1b3178f5077e"
        };
        modelObj.delete(data, (error, record) => {
            assert.ok(error);
            done();
        });
    });

    it("Delete group - with id but locked record", function (done) {
        let data = {
            "id": "5d7e5d9127ef1b3178f5077d"
        };
        modelObj.delete(data, (error, record) => {
            assert.ok(error);
            let index = error.message.indexOf("locked");
            assert.ok(index > 0);
            done();
        });
    });

    it("updateEnvironments - error", function (done) {
        modelObj.updateEnvironments(null, (error, record) => {
            assert.ok(error);
            done();
        });
    });

    it("updateEnvironments - with data", function (done) {
        let data = {
            "allowedEnvironments": ["test", "stg"],
            "groups": ["CCCC", "AAAA"]
        };
        modelObj.updateEnvironments(data, (error, record) => {
            assert.ok(record);
            assert.equal(record, 2);
            done();
        });
    });

    it("updatePackages - error", function (done) {
        modelObj.updatePackages(null, (error, record) => {
            assert.ok(error);
            done();
        });
    });

    it("updatePackages - with data", function (done) {
        let data = {
            "allowedPackages": [{product: "hage", package: "antoine"},
                {product: "hage", package: "mathieu"}, {product: "soajs", package: "gateway"}],
            "groups": ["CCCC", "AAAA"]
        };
        modelObj.updatePackages(data, (error, record) => {
            assert.ok(record);
            assert.equal(record, 2);
            done();
        });
    });

    it("validateId - error", function (done) {
        modelObj.validateId(null, (error, id) => {
            assert.ok(error);
            done();
        });
    });

    it("validateId - error", function (done) {
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
})
;