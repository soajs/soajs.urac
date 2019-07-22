"use strict";

const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../../helper.js");
const Model = helper.requireModule('./model/mongo/token.js');
const assert = require('assert');

describe("Unit test for: model - token", function () {

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

    it("Constructor - open connection", function (done) {
        modelObj = new Model(soajs);
        done();
    });

    it("test - validateId", function (done) {
        modelObj.validateId({"id": ""}, (error, id) => {
            assert.equal(id, "");
            done();
        });
    });

    it("test - getTokens - Empty Object", function (done) {
        modelObj.getTokens({}, (error, records) => {
            assert.ok(records);
            done();
        });
    });

    it("test - getTokens - Null Object", function (done) {
        modelObj.getTokens(null, (error, records) => {
            assert.ok(records);
            done();
        });
    });

    it("test - getToken - Empty Object", function (done) {
        modelObj.getToken({}, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("test - getToken - Null Object", function (done) {
        modelObj.getToken(null, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("test - getToken - with data", function (done) {
        modelObj.getToken({ id: "" }, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("test - deleteToken - Empty Object", function (done) {
        modelObj.deleteToken({}, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("test - deleteToken - Null Object", function (done) {
        modelObj.deleteToken(null, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("test - deleteToken - with data", function (done) {
        modelObj.deleteToken({ id: "" }, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("test - countTokens - Empty Object", function (done) {
        modelObj.countTokens({}, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("test - countTokens - Null Object", function (done) {
        modelObj.countTokens(null, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("test - countTokens - with data", function (done) {
        modelObj.countTokens({ id: "" }, (error, record) => {
            assert.ok(record);
            done();
        });
    });

    it("Constructor - close connection", function (done) {
        modelObj.closeConnection();
        done();
    });

});