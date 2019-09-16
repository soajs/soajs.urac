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

        BL.localConfig = helper.requireModule("config.js");

        done();
    });

    it("Get groups", function (done) {
        function MODEL() {
            console.log("group model");
        }

        MODEL.prototype.closeConnection = () => {
        };
        MODEL.prototype.getGroups = (data, cb) => {
            if (data && data.error) {
                let error = new Error("Group: getGroups - mongo error.");
                return cb(error, null);
            }
            else {
                return cb(null, []);
            }
        };
        BL.model = MODEL;

        BL.getGroups(soajs, null, null, (error, records) => {
            assert.ok(records);
            assert.ok(Array.isArray(records));

            BL.getGroups(soajs, {"error": 1}, null, (error) => {
                assert.ok(error);
                done();
            });

        });
    });
    it("Get group ", function (done) {
        function MODEL() {
            console.log("group model");
        }

        MODEL.prototype.closeConnection = () => {
        };
        MODEL.prototype.getGroup = (data, cb) => {
            if (data && data.code === "CCCC") {
                return cb(null, null);
            }
            else if (data && data.code === "AAAA") {
                let error = new Error("Group: getGroup - mongo error.");
                return cb(error, null);
            } else {
                return cb(null, {"code": "BBBB"});
            }
        };
        BL.model = MODEL;

        BL.getGroup(soajs, null, null, (error) => {
            assert.ok(error);

            let data = {
                "id": "5cfb05c22ac09278709d0141",
                "code": "BBBB"
            };
            BL.getGroup(soajs, data, null, (error, record) => {
                assert.ok(record);
                assert.equal(record.code, 'BBBB');

                let data = {
                    "code": "CCCC"
                };
                BL.getGroup(soajs, data, null, (error) => {
                    assert.ok(error);

                    let data = {
                        "code": "AAAA"
                    };
                    BL.getGroup(soajs, data, null, (error) => {
                        assert.ok(error);
                        done();
                    });
                });
            });

        });
    });


});