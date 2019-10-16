"use strict";

const imported = require("../data/import.js");

describe("Starting URAC Unit test", () => {


    before((done) => {
        console.log ("Import unit test data ....");
        let rootPath = process.cwd();
        imported(rootPath + "/test/data/soajs_profile.js", rootPath + "/test/data/unit/", (err, msg) => {
            if (err) {
                console.log(err);
            }
            if (msg) {
                console.log(msg);
            }

            done();
        });
    });

    it ("Testing all models", (done) => {

        require("./model/mongo/group.js");
        require("./model/mongo/user.js");
        require("./model/mongo/token.js");
        done();
    });

    it ("Testing all bls", (done) => {

        require("./bl/group.js");
        require("./bl/user.js");
        require("./bl/token.js");
        require("./bl/index.js");
        require("./bl/lib/addUser-mainTenant.js");
        require("./bl/lib/addUser-subTenant.js");
        
	    // require("./bl/lib/editPin.test.js");
	    
        done();
    });

    after((done) => {
        done();
    });
});