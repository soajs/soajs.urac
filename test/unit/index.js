"use strict";

const imported = require("../data/import.js");

const async = require("async");
const core = require("soajs");
const Mongo = core.mongo;

function createIndexes(cb) {
    const colName = "users";
    const config = {
        name: 'TES0_urac',
        prefix: '',
        servers: [{host: '127.0.0.1', port: 27017}],
        credentials: null,
        streaming: {},
        URLParam: {useUnifiedTopology: true}
    };
    const indexes = [
        {"col": colName, "i": {'tenant.id': 1}, "o": {}},
        {"col": colName, "i": {'username': 1, 'email': 1, 'status': 1}, "o": {}},
        {"col": colName, "i": {'_id': 1, 'status': 1}, "o": {}},
        {
            "col": colName, "i": {
                'username': 1,
                'email': 1,
                'firstName': 1,
                'lastName': 1,
                'tenant.id': 1
            }, "o": {}
        },
        {
            "col": colName, "i": {
                'username': 1,
                'email': 1,
                'firstName': 1,
                'lastName': 1,
                'config.allowedTenants.tenant.id': 1
            }, "o": {}
        },
        {"col": colName, "i": {"username": 1}, "o": {unique: true}},
        {"col": colName, "i": {"email": 1}, "o": {unique: true}},
        {"col": colName, "i": {'config.allowedTenants.tenant.id': 1}, "o": {}},
        {
            "col": colName, "i": {
                "config.allowedTenants.tenant.pin.code": 1,
                "config.allowedTenants.tenant.id": 1
            }, "o": {
                unique: true,
                partialFilterExpression: {
                    "config.allowedTenants.tenant.pin.code": {
                        "$exists": true
                    }
                }
            }
        },
        {
            "col": colName, "i": {
                "tenant.pin.code": 1,
                "tenant.id": 1
            }, "o": {
                unique: true,
                partialFilterExpression: {
                    "tenant.pin.code": {
                        "$exists": true
                    }
                }
            }
        }
    ];
    let mongoCore = new Mongo(config);
    async.eachSeries(
        indexes,
        (index, callback) => {
            mongoCore.createIndex(index.col, index.i, index.o, (err, res) => {
                console.log("Index: " + res + " created with error: " + err);
                callback();
            });
        },
        () => {
            cb();
        });
}

describe("Starting URAC Unit test", () => {


    before((done) => {
        console.log("Import unit test data ....");
        let rootPath = process.cwd();
        imported(rootPath + "/test/data/soajs_profile.js", rootPath + "/test/data/unit/", (err, msg) => {
            if (err) {
                console.log(err);
            }
            if (msg) {
                console.log(msg);
            }
            // Create user index to avoid race condition, we should do the same for groups
            createIndexes(done);
            // done();
        });
    });

    it("Testing all models", (done) => {

        require("./model/mongo/group.js");
        require("./model/mongo/user.js");
        require("./model/mongo/token.js");
        done();
    });

    it("Testing all bls", (done) => {

        require("./bl/group.js");
        require("./bl/user.js");
        require("./bl/token.js");
        require("./bl/index.js");
        require("./bl/lib/addUser-mainTenant.js");
        require("./bl/lib/addUser-subTenant.js");
        require("./bl/lib/join.test.js");
        require("./bl/lib/inviteUsers.test.js");
        require("./bl/lib/uninviteUsers.test.js");
        require("./bl/lib/editPin.test.js");

        done();
    });

    after((done) => {
        done();
    });
});