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
        require("./get/getGroups.test.js");
        require("./get/getGroup.test.js");

        //POST
        require("./post/addGroup.test.js");

        //PUT
        require("./put/editGroup.test.js");

        done();
    });

});