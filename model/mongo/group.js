"use strict";
const colName = "groups";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function Group(soajs, localConfig, mongoCore) {
    let __self = this;
    if (mongoCore) {
        __self.mongoCore = mongoCore;
        __self.mongoCoreExternal = true;
    }
    if (!__self.mongoCore) {
        __self.mongoCoreExternal = false;
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, localConfig.serviceName, soajs.tenant.code));
    }
    if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
        indexing[soajs.tenant.id] = true;

        __self.mongoCore.createIndex(colName, {'code': 1}, {unique: true}, function (err, result) {
        });
        __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
        });
        soajs.log.debug("Group: Indexes for " + soajs.tenant.id + " Updated!");
    }
}

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
        let error = new Error("Group: must provide either id or code.");
        return cb(error, null);
    }
    let condition = {};

    if (data.id) {
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            condition = {'_id': _id};
            __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
                return cb(err, record);
            });
        });
    } else if (data.code) {
        condition = {'code': data.code};
    }
    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        return cb(err, record);
    });
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
Group.prototype.add = function (data, cb) {
    let __self = this;
    if (!data || !data.code || !data.name || !data.description) {
        let error = new Error("Group: code, name, and description are required.");
        return cb(error, null);
    }
    let record = {
        "code": data.code,
        "name": data.name,
        "description": data.description
    };
    if (data.config) {
        record.config = data.config;
    }
    if (data.tId && data.tCode) {
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
 * To edit a group
 *
 * @param data
 *  should have:
 *      required (id, name)
 *      optional (config, description)
 *
 * @param cb
 */
Group.prototype.edit = function (data, cb) {
    let __self = this;
    if (!data || !data.name || !data.id) {
        let error = new Error("Group: name and id are required.");
        return cb(error, null);
    }
    __self.validateId(data.id, (err, _id) => {
        if (err) {
            return cb(err, null);
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
        let condition = {'_id': _id};
        let extraOptions = {
            'upsert': false,
            'safe': true
        };
        __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
            return cb(err, record);
        });
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
Group.prototype.delete = function (data, cb) {
    let __self = this;
    if (!data || !data.id) {
        let error = new Error("Group: id is required.");
        return cb(error, null);
    }
    __self.validateId(data.id, (err, _id) => {
        if (err) {
            return cb(err, null);
        }
        let condition = {'_id': _id};
        __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
            if (err) {
                return cb(err);
            }
            if (record.locked) {
                //return error msg that this record is locked
                let error = new Error("Group: cannot delete a locked record.");
                return cb(error, null);
            }
            __self.mongoCore.remove(colName, condition, (err) => {
                return cb(err, record);
            });
        });
    });
};

/**
 * To add allowed environment(s) to groups
 *
 * @param data
 *  should have:
 *      required (groups[code, code], allowedEnvironments[env, env])
 *
 * @param cb
 */
Group.prototype.addAllowedEnvironments = function (data, cb) {
    let __self = this;
    if (!data || !data.allowedEnvironments || !data.groups) {
        let error = new Error("Group: allowedEnvironments and groups are required.");
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
 * To add allowed package(s) to groups
 *
 * @param data
 *  should have:
 *      required (groups[code, code], allowedPackages[{product: "", package: ""}])
 *
 * @param cb
 */
Group.prototype.addAllowedPackages = function (data, cb) {
    let __self = this;
    if (!data || !data.allowedPackages || !data.groups) {
        let error = new Error("Group: allowedPackages and groups are required.");
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
    let condition = {'code': {'$in': data.groups}};
    let extraOptions = {
        'upsert': false,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
        return cb(err, record);
    });
};


Group.prototype.validateId = function (id, cb) {
    let __self = this;

    if (!id) {
        let error = new Error("Group: must provide an id.");
        return cb(error, null);
    }

    try {
        id = __self.mongoCore.ObjectId(id);
        return cb(null, id);
    } catch (e) {
        return cb(e, null);
    }
};

Group.prototype.closeConnection = function () {
    let __self = this;

    if (!__self.mongoCoreExternal)
        __self.mongoCore.closeDb();
};

module.exports = Group;