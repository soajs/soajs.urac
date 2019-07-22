"use strict";

const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../../helper.js");
const Model = helper.requireModule('./model/mongo/group.js');
const assert = require('assert');

describe("Unit test for: model - group", function () {

    //invite users: pin code with index and indexing on the same pin code !!!test!!!

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

    let groups, groupOne, groupTwo;

    it("Constructor - with tenant - open connection", function (done) {
        modelObj = new Model(soajs);
        done();
    });

    it("test - getGroups - with no data", function (done) {
        modelObj.getGroups(null, (error, records) => {
            assert.ok(records);
            done();
        });
    });

    it("test - getGroups", function (done) {
        modelObj.getGroups(null, (error, records) => {
            groups = records;
            groups.forEach(group => {
                if (group.code === 'owner') {
                    groupOne = group;
                } else if (group.code === 'devop') {
                    groupTwo = group;
                }
            });
            assert.notEqual(records.length, 0);
            done();
        });
    });

    it("test - validateId", function (done) {
        modelObj.validateId({"id": groupOne._id}, (error, id) => {
            assert.equal(id, groupOne._id);
            done();
        });
    });

    // it("test - addGroup - with data", function (done) {
    //     modelObj.addGroup({
    //         locked: false,
    //         code: "test3",
    //         name: "test Group",
    //         owner: false,
    //         description: "this is the test group",
    //         config: {},
    //         tenant: {
    //             id: "5c0e74ba9acc3c5a84a51259",
    //             code: "TES0"
    //         }
    //     }, (error, record) => {
    //         assert.ok(record);
    //         done();
    //     });
    // });

    it("test - addGroup", function (done) {
        modelObj.addGroup(null, (error, record) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("code, name, and description are required."));
            done();
        });
    });

    it("test - addGroup - no description", function (done) {
        modelObj.addGroup({
            locked: true,
            code: "test",
            name: "test Group",
            owner: false,
            config: {},
            tenant: {
                id: "5c0e74ba9acc3c5a84a51259",
                code: "TES0"
            }
        }, (error, record) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("code, name, and description are required."));
            done();
        });
    });

    it("test - getGroup - no data", function (done) {
        modelObj.getGroup(null, (error) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("must provide either id or code."));
            done();
        });
    });

    it("test - getGroup - only id", function (done) {
        modelObj.getGroup({"id": groupOne._id}, (error, record) => {
            assert.ok(record);
            assert.equal(record.code, "owner");
            done();
        });
    });

    it("test - getGroup - only code", function (done) {
        modelObj.getGroup({"code": "devop"}, (error, record) => {
            assert.ok(record);
            assert.equal(record.name, groupTwo.name);
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

    it("test - editGrroup - with data", function (done) {
        let validId = modelObj.validateId({"id": "5d31acd5daf9a61c99963814"} , (error, record) => {
            return record;
        });
        modelObj.editGroup({
            id: validId,
            locked: true,
            code: "test2",
            name: "test2 Group",
            owner: true,
            config: {},
            tenant: {
                id: "5c0e74ba9acc3c5a84a51259",
                code: "TES0"
            }
        }, (error, record) => {
            assert.ok(record);
            // console.log(record);
            done();
        });
    });

    it('test - deleteGroup - no data', function (done) {
        modelObj.deleteGroup(null, (error, record) => {
           assert.ok(error);
           assert.deepEqual(error, new Error("id is required."));
           done();
        });
    });

    it('test - deleteGroup - with data - locked record', function (done) {
        let validId = modelObj.validateId({"id": "5d31acd5daf9a61c99963814"} , (error, record) => {
            return record;
        });
        modelObj.deleteGroup({"id": validId}, (error, record) => {
            assert.ok(error);
            assert.deepEqual(error, new Error("cannot delete a locked record."));
            done();
        });
    });

    // it('test - deleteGroup - with data - not locked record', function (done) {
    //     let validId = modelObj.validateId({"id": "5d31b1edd40e641d13c6225b"} , (error, record) => {
    //         return record;
    //     });
    //     modelObj.deleteGroup({"id": validId}, (error, record) => {
    //         console.log(record);
    //         assert.ok(record);
    //         done();
    //     });
    // });

    it("Constructor - with tenant - close connection", function (done) {
        modelObj.closeConnection();
        done();
    });

});