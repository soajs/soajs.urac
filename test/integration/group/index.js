"use strict";

describe("starting group integration tests", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("loading group integration tests", (done) => {
        // GET
        require("./get/getGroups.js");
        require("./get/getGroup.js");

        done();
    });

});