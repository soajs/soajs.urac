"use strict";

const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../helper.js");
const BL = helper.requireModule('bl/group.js');
const assert = require('assert');


describe("Unit test for: BL - group", () => {
    let soajs = {
        "meta": core.meta,
        "tenant": {
            id: "5c0e74ba9acc3c5a84a51251",
            code: "TES1"
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

    before((done) => {
        BL.model = helper.requireModule("model/mongo/group.js");
        BL.localConfig = helper.requireModule("config.js");
        done();
    });

    it("Get groups", function (done) {
        BL.getGroups(soajs, null, null, (error, records) => {
            assert.ok(records);
            assert.ok(Array.isArray(records));
            done();
        });
    });
    it("Get group - error", function (done) {
        BL.getGroup(soajs, null, null, (error) => {
            assert.ok(error);
            done();
        });
    });
    it("Get group - success", function (done) {
        let data = {
            "id": "5cfb05c22ac09278709d0141",
            "code": "BBBB"
        };
        BL.getGroup(soajs, data, null, (error, record) => {
            assert.ok(record);
            assert.equal(record.code, 'BBBB');
            done();
        });
    });
    it("Get group - success - not found", function (done) {
        let data = {
            "code": "CCCC"
        };
        BL.getGroup(soajs, data, null, (error) => {
            assert.ok(error);
            done();
        });
    });

});