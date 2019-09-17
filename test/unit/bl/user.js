"use strict";

const coreModules = require("soajs.core.modules");
const core = coreModules.core;
const helper = require("../../helper.js");
const BL = helper.requireModule('bl/user.js');
const assert = require('assert');


describe("Unit test for: BL - user", () => {
    let soajs = {
        "tenant": {
            "code": "TES0",
            "id": "5c0e74ba9acc3c5a84a51259"
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

    it("Get user", function (done) {
        function MODEL() {
            console.log("user model");
        }

        MODEL.prototype.closeConnection = () => {
        };
        MODEL.prototype.getUser = (data, cb) => {
            if (data && data.id && data.id === "error") {
                let error = new Error("User: getUser - mongo error.");
                return cb(error, null);
            }
            else if (data && data.id && data.id === "empty") {
                return cb(null, null);
            }
            else {
                return cb(null, data);
            }
        };
        BL.model = MODEL;

        BL.getUser(soajs, null, null, (error) => {
            assert.ok(error);

            BL.getUser(soajs, {"id": "error"}, null, (error) => {
                assert.ok(error);

                BL.getUser(soajs, {"id": "empty"}, null, (error) => {
                    assert.ok(error);

                    BL.getUser(soajs, {"id": "1221212121"}, null, (error, record) => {
                        assert.ok(record);
                        done();
                    });
                });
            });

        });
    });

});