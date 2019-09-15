"use strict";
const assert = require('assert');
const imported = require("../data/import.js");

describe("starting integration tests", () => {

    it("do import", (done) => {
        let rootPath = process.cwd();
        imported(rootPath + "/test/data/soajs_profile.js", rootPath + "/test/data/integration/", (err, msg) => {
            if (err)
                console.log(err);
            if (msg)
                console.log(msg);

            done();
        });
    });
});