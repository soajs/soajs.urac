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
    let tokens = [];
    let selectedToken;

    it("Constructor - with tenant - open connection", (done) => {
        let localConfig = helper.requireModule("config.js");
        modelObj = new Model(soajs, localConfig, null);
        done();
    });

    it('Success - list tokens', (done) => {
        modelObj.list(null, (err, records) => {
            assert.ok(records);
            tokens = records;
            tokens.forEach(token => {
                if (token.userId === '5c8d0c505653de3985aa0ffd') {
                    selectedToken = token;
                }
            });
            done();
        });
    });

    it('Success - get token - Data', (done) => {
        let data = {
            "token": selectedToken.token,
            "service": "addUser",
            "status": "active"
        };
        modelObj.get(data, (err, record) => {
            assert.ok(record);
            assert.deepEqual(record.userId, '5c8d0c505653de3985aa0ffd');
            assert.deepEqual(record.username, 'johnd');
            done();
        });
    });

    it.skip('Success - get token - Data - Multiple services', (done) => {
        let data = {
            "token": selectedToken.token,
            "services": ["addUser", "changeEmail"],
            "status": "active"
        };
        modelObj.get(data, (err, record) => {
            assert.ok(record);
            assert.deepEqual(record.userId, '5c8d0c505653de3985aa0ffd');
            assert.deepEqual(record.username, 'owner');
            done();
        });
    });

    it('Fails - get token - Null Data', (done) => {
        modelObj.get(null, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: token, and what service(s) are required."));
            done();
        });
    });

    it('Fails - get token - empty Data', (done) => {
        modelObj.get({}, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: token, and what service(s) are required."));
            done();
        });
    });

    it('Fails - get token - Data no service', (done) => {
        let data = {
            token: "token"
        };
        modelObj.get(data, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: token, and what service(s) are required."));
            done();
        });
    });

    it('Fails - get token - Data services not array', (done) => {
        let data = {
            token: "token",
            services: {}
        };
        modelObj.get(data, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: token, and what service(s) are required."));
            done();
        });
    });

    it('Fails - updateStatus - Null Data', (done) => {
        modelObj.updateStatus(null, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: status and token are required."));
            done();
        });
    });

    it('Fails - updateStatus - empty Data', (done) => {
        modelObj.updateStatus({}, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: status and token are required."));
            done();
        });
    });

    it('Fails - updateStatus - Data no status', (done) => {
        let data = {
            token: "f65e8358-ce1d-47cb-b478-82e10c93f70e"
        };
        modelObj.updateStatus(data, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: status and token are required."));
            done();
        });
    });

    it('Fails - updateStatus - No record', (done) => {
        let data = {
            token: "f65e8358-ce1d-47cb-c390-82e10c93f70e",
            status: "pending"
        };
        modelObj.updateStatus(data, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: status for token [f65e8358-ce1d-47cb-c390-82e10c93f70e] was not update."));
            done();
        });
    });

    it('Success - updateStatus - Data', (done) => {
        let data = {
            token: selectedToken.token,
            status: 'pending',
        };
        modelObj.updateStatus(data, (err, result) => {
            assert.ok(result);
            assert.deepEqual(result, 1);
            done();
        });
    });

    it('Fails - add token - Null Data', (done) => {
        modelObj.add(null, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: tokenExpiryTTL, userId, username, and what service are required."));
            done();
        });
    });

    it('Fails - add token - empty Data', (done) => {
        modelObj.add({}, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: tokenExpiryTTL, userId, username, and what service are required."));
            done();
        });
    });

    it('Fails - add token - Data no username', (done) => {
        let data = {
            userId: "someID"
        };
        modelObj.add(data, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: tokenExpiryTTL, userId, username, and what service are required."));
            done();
        });
    });

    it('Fails - add token - Data no service', (done) => {
        let data = {
            userId: "someID",
            username: 'username'
        };
        modelObj.add(data, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: tokenExpiryTTL, userId, username, and what service are required."));
            done();
        });
    });

    it('Fails - add token - Data no tokenExpiryTTL', (done) => {
        let data = {
            userId: "someID",
            username: 'username',
            service: "service",
        };
        modelObj.add(data, (err) => {
            assert.ok(err);
            assert.deepEqual(err, new Error("Token: tokenExpiryTTL, userId, username, and what service are required."));
            done();
        });
    });

    it('Success - add token - Data', (done) => {
        let data = {
            userId: "5d7fee0876186d9ab9b36492",
            username: 'tony',
            service: "changeEmail",
            tokenExpiryTTL: '12'
        };
        modelObj.add(data, (err, record) => {
            assert.ok(record);
            assert.deepEqual(record.ttl, '12');
            done();
        });
    });

    it("Constructor - with tenant - close connection", (done) => {
        modelObj.closeConnection();
        done();
    });
});