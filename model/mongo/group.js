"use strict";
const colName = "groups";
const userColName = "users";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function Group(soajs) {
    let __self = this;
    __self.soajs = soajs;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
        if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
            indexing[soajs.tenant.id] = true;

            __self.mongoCore.createIndex(colName, {'code': 1}, {unique: true}, function (err, result) {});
            __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {});

            __self.soajs.log.debug("Indexes for "+ soajs.tenant.id +" Updated!");
        }
    }
}

Group.prototype.validateId = function (cb) {
    let __self = this;
    try {
        if (process.env.SOAJS_TEST) {
            return cb(null, __self.soajs.inputmaskData.id);
        }
        __self.soajs.inputmaskData.id = __self.mongoCore.ObjectId(__self.soajs.inputmaskData.id);
        return ((cb) ? cb(null, __self.soajs.inputmaskData.id) : __self.soajs.inputmaskData.id);
    } catch (e) {
        return cb(e);
    }
};

/**
 * To add a group
 *
 * inputmaskData should have
 *      required (code, name, description)
 *      optional (config, tId, tCode)
 *
 * @param cb
 */
Group.prototype.addGroup = function (cb) {
    let __self = this;
    let record = {
        "code": __self.soajs.inputmaskData.code,
        "name": __self.soajs.inputmaskData.name,
        "description": __self.soajs.inputmaskData.description
    };
    if (__self.soajs.inputmaskData.config) {
        record.config = __self.soajs.inputmaskData.config
    }
    if (__self.soajs.inputmaskData.tId && __self.soajs.inputmaskData.code) {
        record.tenant = {
            "id": req.soajs.inputmaskData.tId,
            "code": req.soajs.inputmaskData.tCode
        };
    }
    __self.mongoCore.insert(colName, record, (err, record) => {
        if (err) {
            return cb(err);
        }
        return cb(null, record);
    });
};

/**
 * To get a group
 *
 * inputmaskData should have
 *      required (id)
 *      optional (code)
 *
 * @param cb
 */
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

/**
 * To get group(s)
 *
 * inputmaskData should have
 *      optional (tId)
 *
 * @param cb
 */
Group.prototype.getGroups = function (cb) {
    let __self = this;
    let condition = {};
    if (__self.soajs.inputmaskData.tId) {
        condition = {"tenant.id": __self.soajs.inputmaskData.tId};
    }
    __self.mongoCore.find(colName, condition, null, null, (err, records) => {
        if (err) {
            return cb(err);
        }
        return cb(null, records);
    });
};

/**
 * To edit a group
 *
 * inputmaskData should have
 *      required (id, name)
 *      optional (config, description)
 *
 * @param cb
 */
Group.prototype.editGroup = function (cb) {
    let __self = this;
    let s = {
        '$set': {
            'name': __self.soajs.inputmaskData.name
        }
    };
    if (__self.soajs.inputmaskData.description) {
        s['$set'].description = __self.soajs.inputmaskData.description;
    }
    if (__self.soajs.inputmaskData.config) {
        s['$set'].config = __self.soajs.inputmaskData.config;
    }
    let condition = {'_id': __self.soajs.inputmaskData.id};
    let extraOptions = {
        'upsert': false,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
        if (err) {
            return cb(err);
        }
        return cb(null, record);
    });
};

/**
 * To delete a group
 *
 * inputmaskData should have
 *      required (id)
 *
 * @param cb
 */
Group.prototype.deleteGroup = function (cb) {
    let __self = this;
    let condition = {'_id': __self.soajs.inputmaskData.id};
    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        if (err) {
            return cb(err);
        }
        if (record.locked) {
            //return error msg that this record is locked
            return cb({"code": 500, "msg": __self.soajs.config.errors[500]});
        }
        __self.mongoCore.remove(colName, condition, (err) => {
            if (err) {
                return cb(err);
            }
            if (record.tenant && record.tenant.id) {
                let condition = {"tenant.id": record.tenant.id};
                let extraOptions = {multi: true};
                let s = {"$pull": {groups: record.code}};
                __self.mongoCore.update(userColName, condition, s, extraOptions, (err, record) => {
                    return cb(null, record);
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
 * inputmaskData should have
 *      required (groups[code, code], allowedEnvironments[{product: "", package: ""}])
 *
 * @param cb
 */
Group.prototype.addAllowedEnvironments = function (cb) {
    let __self = this;
    let s = {
        '$set': {}
    };
    if (__self.soajs.inputmaskData.allowedEnvironments) {
        for (let i = 0; i < __self.soajs.inputmaskData.allowedEnvironments.length; i++) {
            let env = __self.soajs.inputmaskData.allowedEnvironments[i].toUpperCase();
            s['$set']['config.allowedEnvironments.' + env] = {};
        }
    }
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

/**
 * To add allowed package(s) to a group
 *
 * inputmaskData should have
 *      required (id, allowedPackages[{product: "", package: ""}])
 *
 * @param cb
 */
Group.prototype.addAllowedPackages = function (cb) {
    let __self = this;
    let s = {
        '$set': {}
    };
    if (__self.soajs.inputmaskData.allowedPackages) {
        for (let i = 0; i < __self.soajs.inputmaskData.allowedPackages.length; i++) {
            let prodPack = __self.soajs.inputmaskData.allowedPackages[i];
            s['$set']['config.allowedPackages.' + prodPack.product] = [prodPack.package];
        }
    }
    let condition = {'_id': __self.soajs.inputmaskData.id};
    let extraOptions = {
        'upsert': false,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
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