"use strict";
const colName = "users";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function User(soajs) {
    let __self = this;
    __self.soajs = soajs;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
        if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
            indexing[soajs.tenant.id] = true;

            //needed by deleteGroup @ groups to pull group from all users once deleted
            __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {});

            __self.soajs.log.debug("Indexes for "+ soajs.tenant.id +" Updated!");
        }
    }
}

User.prototype.closeConnection = function (cb) {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = User;