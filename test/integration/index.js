"use strict";
const imported = require("../data/import.js");
let helper = require("../helper.js");

describe("starting integration tests", () => {

    let controller, service;

    before((done) => {
        let rootPath = process.cwd();
        imported(rootPath + "/test/data/soajs_profile.js", rootPath + "/test/data/integration/", (err, msg) => {
            if (err) {
                console.log(err);
            }
            if (msg) {
                console.log(msg);
            }
            console.log("Starting Controller ...");
            controller = require("soajs.controller/_index.js");
            controller.runService(() => {
                console.log("Starting URAC ...");
                service = helper.requireModule('./_index.js');
                service.runService(() => {
                    setTimeout(function () {
                        done();
                    }, 5000);
                });
            });
        });
    });

    it("loading tests", (done) => {
        require("./group/index.js");
        require("./user/index.js");
        require("./index/index.js");
        require("./token/getTokens.js");
        require("./resendCode/index.js");
        done();
    });

});