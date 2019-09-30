"use strict";

const helper = require("../../helper.js");
const BL = helper.requireModule('bl/index.js');
const assert = require('assert');


describe("Unit test for: BL - index", () => {
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
});