"use strict";
const colName = "users";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function User(soajs, mongoCore) {
    let __self = this;
    __self.soajs = soajs;
    if (mongoCore)
        __self.mongoCore = mongoCore;

    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
        if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
            indexing[soajs.tenant.id] = true;

            //needed by deleteGroup @ groups to pull group from all users once deleted
            __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
            });

            __self.soajs.log.debug("Indexes for " + soajs.tenant.id + " Updated!");
        }
    }
}

/**
 * To get a user
 *
 * inputmaskData should have
 *      required (id)
 *
 * @param cb
 */
User.prototype.getUser = function (cb) {
    let __self = this;
    let condition = {};
    if (__self.soajs.inputmaskData.id) {
        condition = {'_id': __self.soajs.inputmaskData.id};

        __self.mongoCore.findOne(colName, condition, {socialId: 0, password: 0}, null, (err, record) => {
            if (err) {
                return cb(err);
            }
            return cb(null, record);
        });
    }
};

/**
 * To delete a group for all users of that tenant
 *
 * inputmaskData should have
 *      required (tId, groupCode)
 *
 * @param cb
 */
User.prototype.deleteGroup = function (cb) {
    let __self = this;
    if (__self.soajs.inputmaskData.tId) {
        let condition = {"tenant.id": __self.soajs.inputmaskData.tId};
        let extraOptions = {multi: true};
        let s = {"$pull": {groups: __self.soajs.inputmaskData.groupCode}};
        __self.mongoCore.update(colName, condition, s, extraOptions, (err, response) => {
            return cb(err, response);
        });
    }
};

User.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = User;