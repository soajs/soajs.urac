"use strict";

const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../helper.js");
const BL = helper.requireModule('./bl/group.js');
const Model = helper.requireModule('./model/mongo/group.js');
const assert = require('assert');

describe("Unit test for: BL - group", function () {

    let soajs = {
        "meta": core.meta,
        "tenant": {
            "code": "TES0",
            "id": "5c0e74ba9acc3c5a84a51259"
        },
        "config": {
            "serviceName": "urac",
            "errors": {
                400: "Database connection error",
                402: "User account already exists.",
                403: "Unable to edit User.",
                404: "User Not Found!",
                405: "Unable to find User. Please try again.",
                410: "username taken, please choose another username",
                407: "Problem validating Request. Please try again.",
                411: "invalid user id provided",
                412: "invalid group id provided",
                413: "invalid token id provided",
                414: "Unable to add user.",
                415: "Unable to find group.",
                416: "Unable to create Group.",
                417: "Invalid group id provided",
                418: "Unable to find token.",
                419: "Unable to delete Group.",
                420: "Unable to delete token",
                421: "Unable to delete user",
                422: "Unable to edit user",
                423: "An id must be provided",
                428: "A username or an email must be provided.",
                429: "You already invited this user.",
                430: "Tenant not found for this user.",
                431: "Missing required field: either id or name",
                474: "Missing required field: either id or code",
                500: "This record in locked. You cannot modify or delete it",
                611: "Invalid tenant id provided",
            }
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
    let modelObj;

    it("Constructor - with tenant - open connection", function (done) {
        modelObj = new Model(soajs);
        done();
    });

    it('test - list with data', function (done) {
        BL.list(soajs, {"tId": "5c0e74ba9acc3c5a84a51259"}, modelObj, (error, records) => {
            assert.ok(records);
            done();
        });
    });

    // it('test - list without data', function (done) {
    //     BL.list(soajs, null, modelObj, (error, records) => {
    //         assert.ok(records);
    //         done();
    //     });
    // });
    // NOT WORKING!!

    it('test - find with id', function (done) {
        let inputmaskData = {
            gId: "5d3195a56175a96fb44ad0c9"
        };

        BL.findById(soajs, inputmaskData, modelObj, (error, record) => {
            assert.ok(record);
            assert.equal(record.name,"Owner Group");
            done();
        });
    });

    it('test - getGroup with id and code', function (done) {
        let inputmaskData = {
            gId: "5d3195a56175a96fb44ad0c9",
            gCode: "owner"
        };

        BL.getGroupByIdAndCode(soajs, inputmaskData, modelObj, (error, record) => {
            assert.ok(record);
            assert.equal(record.name,"Owner Group");
            done();
        });
    });

    // it('test - addGroup with data', function (done) {
    //     let inputmaskData = {
    //         gCode: "devop2test",
    //         locked: false,
    //         name: "Devop test Group",
    //         description: "this is the devop test group",
    //         config: {
    //             allowedPackages: {
    //                 DSBRD: [
    //                     "DSBRD_OWNER"
    //                 ]
    //             }
    //         },
    //         tenant: {
    //             id: "5c0e74ba9acc3c5a84a51259",
    //             code: "TES0"
    //         }
    //     };
    //
    //     BL.add(soajs, inputmaskData, modelObj, (error, record) => {
    //         assert.ok(record);
    //         done();
    //     });
    // });

    it('test - editGroup with data', function (done) {
        let inputmaskData = {
            gId: "5d3195a56175a96fb44ad0ca",
            gCode: "devop",
            locked: false,
            name: "Devop Group",
            description: "this is the devop efter edit group",
            config: {
                allowedPackages: {
                    DSBRD: [
                        "DSBRD_OWNER"
                    ]
                }
            },
            tenant: {
                id: "5c0e74ba9acc3c5a84a51259",
                code: "TES0"
            }
        };

        BL.editGroup(soajs, inputmaskData, modelObj, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it('test - delete with id', function (done) {
        let inputmaskData = {
            gId: "5d31e2ec32a2bb21d40de4f3"
        };

        BL.deleteGroup(soajs, inputmaskData, modelObj, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("Constructor - with tenant - close connection", function (done) {
        modelObj.closeConnection();
        done();
    });

});