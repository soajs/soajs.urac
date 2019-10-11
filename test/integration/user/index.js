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
        require("./get/getUser.test");
        require("./get/getUsers.test");
        require("./get/getUserByUsername.test");
        require("./get/countUsers.test");
        require("./get/checkUsername.test");
        require("./get/getUsersbyIds.test");

        //PUT
        require("./put/editAccount.test");
        require("./put/updateUserStatus.test");
        require("./put/editUser.test");
        require("./put/editUserGroups.test");

        //POST
        require("./post/addUser.test");

        done();
    });

});