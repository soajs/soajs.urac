"use strict";
const colName = "users";
const core = require("soajs");
const Mongo = core.mongo;

function User(soajs) {
    let __self = this;
    __self.soajs = soajs;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(__self.soajs.registry.coreDB.provision);
    }
}

User.prototype.closeConnection = function (cb) {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = User;