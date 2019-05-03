"use strict";
const colName = "groups";
const core = require("soajs");
const Mongo = core.mongo;

function Group(soajs) {
    let __self = this;
    __self.soajs = soajs;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(__self.soajs.registry.coreDB.provision);
    }
}
Group.prototype.getGroup = function (cb) {
    let __self = this;
    let condition = {};
    if (__self.soajs.inputmaskData.id) {
        condition = {'_id': __self.soajs.inputmaskData.id};
    } else if (__self.soajs.inputmaskData.code) {
        condition = {'code': __self.soajs.inputmaskData.code};
    }
    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        if (err) {
            return cb(err);
        }
        return cb(null, record);
    });
};

Group.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = Group;