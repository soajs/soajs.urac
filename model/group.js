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

Group.prototype.getGroups = function (cb) {
    let __self = this;
    let condition = {};
    if (__self.soajs.inputmaskData.id) {
        condition = {"tenant.id": __self.soajs.inputmaskData.tId};
    }
    __self.mongoCore.find(colName, condition, null, null, (err, records) => {
        if (err) {
            return cb(err);
        }
        return cb(null, records);
    });
};

Group.prototype.addEnvironment = function (cb) {
    let __self = this;
    let env_s = 'config.allowedEnvironments.' + __self.soajs.inputmaskData.env.toUpperCase();
    let s = {
        '$set': {
            [env_s]: {}
        }
    };
    let condition = {'code': {'$in': __self.soajs.inputmaskData.groups}};
    let extraOptions = {
        'upsert': false,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, records) => {
        if (err) {
            return cb(err);
        }
        return cb(null, records);
    });
};

Group.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = Group;