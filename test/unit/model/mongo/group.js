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
                    "streaming": {},
                    "URLParam": {
                        "useUnifiedTopology": true
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
        let localConfig = helper.requireModule("config.js");
        modelObj = new Model(soajs, localConfig, null);
        done();
    });

    it("Add group - error", function (done) {
        modelObj.add(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: code, name, and description are required."));
            done();
        });
    });

    it("Add group - with data", function (done) {
        let data = {
            "code": "AAAA",
            "name": "Unit test",
            "description": "Added by unit test.",
            "environments": ["dev", "prod"],
            "packages": [
                {product: "DSBRD", packages: ["DSBRD_DEVOP", "DSBRD_CATAL"]},
                {product: "RERES", packages: ["WAITER"]}
            ],
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
        modelObj.add(data, (error) => {
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
        modelObj.getGroup(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: must provide either id or code."));
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

        modelObj.getGroup(data, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("Edit group - error", function (done) {
        modelObj.edit(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: name and id are required."));
            done();
        });
    });

    it("Edit group - with id but no data", function (done) {
        let data = {
            "id": AAAA_group_id
        };
        modelObj.edit(data, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: name and id are required."));
            done();
        });
    });

    it("Edit group - with id and data", function (done) {
        let data = {
            "id": AAAA_group_id,
            "name": "test case",
            "description": "modified by unit test",
            "environments": ["test", "stg"],
            "packages": [{product: "hage", packages: ["farid", "spiro"]}, {product: "soajs", packages: ["console"]}]
        };
        modelObj.edit(data, (error, record) => {
            assert.ok(record);
            assert.equal(record, 1);
            done();
        });
    });

    it("Fails - Edit group - with invalid id and data", function (done) {
        let data = {
            "id": "121212",
            "name": "test case",
            "description": "modified by unit test",
            "environments": ["test", "stg"],
            "packages": [
                {product: "hage", packages: ["farid"]}, {product: "soajs", packages: ["console"]}]
        };
        modelObj.edit(data, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("Fails - deleteProducts - null data", (done) => {
        modelObj.deleteProducts(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: id or code in addition to products are required."));
            done();
        });
    });

    it("Fails - deleteProducts - empty data", (done) => {
        modelObj.deleteProducts({}, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: id or code in addition to products are required."));
            done();
        });
    });

    it("Fails - deleteProducts - no products", (done) => {
        modelObj.deleteProducts({
            id: "someid"
        }, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: id or code in addition to products are required."));
            done();
        });
    });

    it("Fails - deleteProducts - products not array", (done) => {
        modelObj.deleteProducts({
            id: "someid",
            products: {}
        }, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: id or code in addition to products are required."));
            done();
        });
    });

    it('Success - deleteProducts - Data - code', (done) => {
        let data = {
            code: 'CCCC',
            products: ['DSBRD']
        };

        modelObj.deleteProducts(data, (err, result) => {
            assert.ok(result);
            assert.deepEqual(result, 1);
            done();
        });
    });

    it('Success - deleteProducts - Data - id', (done) => {
        let data = {
            code: 'BBBB',
            products: ['DSBRD']
        };

        modelObj.getGroup(data, (err, record) => {
            assert.deepEqual(record.code, 'BBBB');

            data.id = record._id;
            modelObj.deleteProducts(data, (err, result) => {
                assert.ok(result);
                assert.deepEqual(result, 1);
                done();
            });
        });
    });

    it('Fails - deleteProducts - Data - no valid id', (done) => {
        let data = {
            id: '123123',
            products: ['DSBRD']
        };
        modelObj.deleteProducts(data, (err) => {
            assert.ok(err);
            done();
        });
    });

    it("Fails - deleteEnvironments - null data", (done) => {
        modelObj.deleteEnvironments(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: id or code in addition to environment(s) are required."));
            done();
        });
    });

    it("Fails - deleteEnvironments - empty data", (done) => {
        modelObj.deleteEnvironments({}, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: id or code in addition to environment(s) are required."));
            done();
        });
    });

    it("Fails - deleteEnvironments - no environments", (done) => {
        modelObj.deleteEnvironments({
            id: "someid"
        }, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: id or code in addition to environment(s) are required."));
            done();
        });
    });

    it("Fails - deleteEnvironments - environments not array", (done) => {
        modelObj.deleteEnvironments({
            id: "someid",
            environments: {}
        }, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: id or code in addition to environment(s) are required."));
            done();
        });
    });

    it('Success - deleteEnvironments - Data - id', (done) => {
        let data = {
            code: 'BBBB',
            environments: ['DEV']
        };

        modelObj.getGroup(data, (err, record) => {
            assert.deepEqual(record.code, 'BBBB');

            data.id = record._id;
            modelObj.deleteEnvironments(data, (err, result) => {
                assert.ok(result);
                assert.deepEqual(result, 1);
                done();
            });
        });
    });

    it('Success - deleteEnvironments - Data - code', (done) => {
        let data = {
            code: 'CCCC',
            environments: ['DEV']
        };

        modelObj.deleteEnvironments(data, (err, result) => {
            assert.ok(result);
            assert.deepEqual(result, 1);
            done();
        });
    });

    it('Fails - deleteEnvironments - Data - no valid id', (done) => {
        let data = {
            id: '123123',
            environments: ['DEV']
        };
        modelObj.deleteEnvironments(data, (err) => {
            assert.ok(err);
            done();
        });
    });

    it("Delete group - error", function (done) {
        modelObj.delete(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: id is required."));
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
        modelObj.delete(data, (error) => {
            assert.ok(error);
            done();
        });
    });

    it("Delete group - with id not found", function (done) {
        let data = {
            "id": "5d7e702727ef1b3178f5077e"
        };
        modelObj.delete(data, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: cannot delete record. Not found."));
            done();
        });
    });

    it("Delete group - with id but locked record", function (done) {
        let data = {
            "id": "5d7e5d9127ef1b3178f5077d"
        };
        modelObj.delete(data, (error) => {
            assert.ok(error);
            let index = error.message.indexOf("locked");
            assert.ok(index > 0);
            done();
        });
    });

    let groupC, groupA;

    it("Get groups", function (done) {
        modelObj.getGroups(null, (error, records) => {
            assert.ok(records);
            assert.ok(Array.isArray(records));
            records.forEach(record => {
                if (record.code === 'CCCC') {
                    groupC = record;
                } else if (record.code === 'AAAA') {
                    groupA = record;
                }
            });
            done();
        });
    });

    it("updateEnvironments - error", function (done) {
        modelObj.updateEnvironments(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: environments and group codes or ids are required."));
            done();
        });
    });

    it("updateEnvironments - with data - CODES", function (done) {
        let data = {
            "environments": ["test", "stg"],
            "groups": {
                "codes": ["CCCC", "AAAA"]
            }
        };
        modelObj.updateEnvironments(data, (error, record) => {
            assert.ok(record);
            assert.equal(record, 1);
            done();
        });
    });

    it("updateEnvironments - with data - CODES", function (done) {
        let data = {
            "environments": ["testid", "devoping"],
            "groups": {
                "ids": [groupC._id, groupA._id]
            }
        };
        modelObj.updateEnvironments(data, (error, record) => {
            assert.ok(record);
            assert.equal(record, 2);
            done();
        });
    });

    it("updatePackages - error", function (done) {
        modelObj.updatePackages(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: packages and group codes or ids are required."));
            done();
        });
    });

    it("updatePackages - with data - CODES", function (done) {
        let data = {
            "packages": [{product: "hage", packages: ["mathieu", "antoine"]}, {
                product: "soajs",
                packages: ["gateway"]
            }],
            "groups": {
                codes: ["CCCC", "AAAA"]
            }
        };
        modelObj.updatePackages(data, (error, record) => {
            assert.ok(record);
            assert.equal(record, 2);
            done();
        });
    });

    it("updatePackages - with data - IDS", function (done) {
        let data = {
            "packages": [{product: "hage", packages: ["something", "cal"]}, {product: "soajs", packages: ["gateway"]}],
            "groups": {
                ids: [groupA._id, groupC._id]
            }
        };
        modelObj.updatePackages(data, (error, record) => {
            assert.ok(record);
            assert.equal(record, 2);
            done();
        });
    });

    it("validateId - error", function (done) {
        modelObj.validateId(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("Group: must provide an id."));
            done();
        });
    });

    it("validateId - error invalid id", function (done) {
        modelObj.validateId("121212", (error) => {
            assert.ok(error);
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