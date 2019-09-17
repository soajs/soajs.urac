"use strict";

describe("starting user integration tests", () => {

    before(function (done) {
        done();
    });

    afterEach((done) => {
        console.log("=======================================");
        done();
    });

    it("loading group integration tests", (done) => {
        // GET
        require("./get/getUser.js");

        done();
    });

});