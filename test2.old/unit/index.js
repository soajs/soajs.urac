"use strict";

describe("Starting URAC Unit test", () => {

    before((done) => {
        done();
    });

    it ("Testing all models", (done) => {

        require("./model/mongo/group.js");
        require("./model/mongo/user.js");
        done();
    });

    after((done) => {
        done();
    });
});