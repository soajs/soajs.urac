"use strict";
const colName = "groups";
const core = require("soajs");
const Mongo = core.mongo;
const User = require("./user.js");

let indexing = {};

function Group(soajs, mongoCore) {
    let __self = this;
    if (mongoCore)
        __self.mongoCore = mongoCore;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
        if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
            indexing[soajs.tenant.id] = true;

            __self.mongoCore.createIndex(colName, {'code': 1}, {unique: true}, function (err, result) {
            });
            __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
            });
            soajs.log.debug("Indexes for " + soajs.tenant.id + " Updated!");
        }
    }
}


/**
 * To validate and convert an id to mongodb objectID
 *
 * @param data
 *  should have:
 *      required (id)
 *
 * @param cb
 */
Group.prototype.validateId = function (data, cb) {
    let __self = this;
    try {
        data.id = __self.mongoCore.ObjectId(data.id);
        return cb(null, data.id);
    } catch (e) {
        return cb(e);
    }
};

/**
 * To add a group
 *
 * @param data
 *  should have:
 *      required (code, name, description)
 *      optional (config, tId, tCode)
 *
 * @param cb
 */
Group.prototype.addGroup = function (data, cb) {
    let __self = this;
    if (!data || !data.code || !data.name || !data.description) {
        let error = new Error("code, name, and description are required.");
        return cb(error, null);
    }
    let record = {
        "code": data.code,
        "name": data.name,
        "description": data.description
    };
    if (data.config) {
        record.config = data.config
    }
    if (data.tId && data.code) {
        record.tenant = {
            "id": data.tId,
            "code": data.tCode
        };
    }
    __self.mongoCore.insert(colName, record, (err, record) => {
        return cb(err, record);
    });
};

/**
 * To get a group
 *
 * @param data
 *  should have:
 *      required (id)
 *      optional (code)
 *
 * @param cb
 */
Group.prototype.getGroup = function (data, cb) {
    let __self = this;
    if (!data || !(data.id || data.code)) {
        let error = new Error("must provide either id or code.");
        return cb(error, null);
    }
    let condition = {};
    if (data.id) {
        condition = {'_id': data.id};
    } else if (data.code) {
        condition = {'code': data.code};
    }
    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        return cb(err, record);
    });
};

/**
 * To get group(s)
 *
 * @param data
 *  should have:
 *      optional (tId)
 *
 * @param cb
 */
Group.prototype.getGroups = function (data, cb) {
    let __self = this;
    let condition = {};
    if (data && data.tId) {
        condition = {"tenant.id": data.tId};
    }
    __self.mongoCore.find(colName, condition, null, null, (err, records) => {
        return cb(err, records);
    });
};

/**
 * To edit a group
 *
 * @param data
 *  should have:
 *      required (id, name)
 *      optional (config, description)
 *
 * @param cb
 */
Group.prototype.editGroup = function (data, cb) {
    let __self = this;
    if (!data || !data.name || !data.id) {
        let error = new Error("name and id are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {
            'name': data.name
        }
    };
    if (data.description) {
        s['$set'].description = data.description;
    }
    if (data.config) {
        s['$set'].config = data.config;
    }
    let condition = {'_id': data.id};
    let extraOptions = {
        'upsert': false,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
        return cb(err, record);
    });
};

/**
 * To delete a group
 *
 * @param data
 *  should have:
 *      required (id)
 *
 * @param cb
 */
Group.prototype.deleteGroup = function (data, cb) {
    let __self = this;
    if (!data || !data.id) {
        let error = new Error("id is required.");
        return cb(error, null);
    }
    let condition = {'_id': data.id};
    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        if (err) {
            return cb(err);
        }
        if (record.locked) {
            //return error msg that this record is locked
            let error = new Error("cannot delete a locked record.");
            return cb(error, null);
        }
        __self.mongoCore.remove(colName, condition, (err) => {
            if (err) {
                return cb(err);
            }
            if (record.tenant && record.tenant.id) {
                let userData = {
                    "tId": record.tenant.id,
                    "groupCode": record.code
                };
                let user = new User(soajs, __self.mongoCore);
                user.deleteGroup(userData, (error) => {
                    return cb(error, record);
                });
            }
            else
                return cb(null, record);
        });
    });
};

/**
 * To add allowed environment(s) to a group
 *
 * @param data
 *  should have:
 *      required (groups[code, code], allowedEnvironments[{product: "", package: ""}])
 *
 * @param cb
 */
Group.prototype.addAllowedEnvironments = function (data, cb) {
    let __self = this;
    if (!data || !data.allowedEnvironments || !data.groups) {
        let error = new Error("allowedEnvironments and groups are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {}
    };
    if (data.allowedEnvironments) {
        for (let i = 0; i < data.allowedEnvironments.length; i++) {
            let env = data.allowedEnvironments[i].toUpperCase();
            s['$set']['config.allowedEnvironments.' + env] = {};
        }
    }
    let condition = {'code': {'$in': data.groups}};
    let extraOptions = {
        'upsert': false,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, records) => {
        return cb(err, records);
    });
};

/**
 * To add allowed package(s) to a group
 *
 * @param data
 *  should have:
 *      required (id, allowedPackages[{product: "", package: ""}])
 *
 * @param cb
 */
Group.prototype.addAllowedPackages = function (data, cb) {
    let __self = this;
    if (!data || !data.allowedPackages || !data.id) {
        let error = new Error("allowedPackages and id are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {}
    };
    if (data.allowedPackages) {
        for (let i = 0; i < data.allowedPackages.length; i++) {
            let prodPack = data.allowedPackages[i];
            s['$set']['config.allowedPackages.' + prodPack.product] = [prodPack.package];
        }
    }
    let condition = {'_id': data.id};
    let extraOptions = {
        'upsert': false,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
        return cb(err, record);
    });
};

Group.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = Group;