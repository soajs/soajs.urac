"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

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
        soajs.log.debug("Group: Indexes for " + soajs.tenant.id + " Updated!");
    }
}

/**
 * To get all group(s)
 *
 * @param data
 *
 * @param cb
 */
Group.prototype.getGroups = function (data, cb) {
    let __self = this;
    let condition = {};
    __self.mongoCore.find(colName, condition, null, null, (err, records) => {
        return cb(err, records);
    });
};

/**
 * To get a group
 *
 * @param data
 *  should have:
 *      required (id or code)
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
    } else {
        if (data.code) {
            condition = {'code': data.code};
        }

        __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
            return cb(err, record);
        });
    }
};

/**
 * To add a group
 *
 * @param data
 *  should have:
 *      required (code, name, description)
 *      optional (environments, packages, tId, tCode)
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
    if (data.tId && data.tCode) {
        record.tenant = {
            "id": data.tId,
            "code": data.tCode
        };
    }
    record.config = {
        "allowedEnvironments": {},
        "allowedPackages": {}
    };
    if (data.environments) {
        for (let i = 0; i < data.environments.length; i++) {
            let env = data.environments[i].toUpperCase();
            record.config.allowedEnvironments[env] = {};
        }
    }
    if (data.packages) {
        for (let i = 0; i < data.packages.length; i++) {
            let prodPack = data.packages[i];
            if (record.config.allowedPackages[prodPack.product] && Array.isArray(record.config.allowedPackages[prodPack.product])) {
                record.config.allowedPackages[prodPack.product].push(prodPack.package);
            }
            else {
                record.config.allowedPackages[prodPack.product] = [prodPack.package];
            }
        }
    }
    __self.mongoCore.insert(colName, record, (err, record) => {
        if (record && Array.isArray(record))
            record = record [0];
        return cb(err, record);
    });
};

/**
 * To edit a group
 *
 * @param data
 *  should have:
 *      required (id, name)
 *      optional (environments, packages, description)
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
        if (data.environments) {
            for (let i = 0; i < data.environments.length; i++) {
                let env = data.environments[i].toUpperCase();
                s['$set']['config.allowedEnvironments.' + env] = {};
            }
        }
        if (data.packages) {
            for (let i = 0; i < data.packages.length; i++) {
                let prodPack = data.packages[i];
                if (s['$set']['config.allowedPackages.' + prodPack.product] && Array.isArray(s['$set']['config.allowedPackages.' + prodPack.product])) {
                    s['$set']['config.allowedPackages.' + prodPack.product].push(prodPack.package);
                }
                else {
                    s['$set']['config.allowedPackages.' + prodPack.product] = [prodPack.package];
                }
            }
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
            if (!record) {
                let error = new Error("Group: cannot delete record. Not found.");
                return cb(error, null);
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
 *      required (groups[code, code], environments[env, env])
 *
 * @param cb
 */
Group.prototype.updateEnvironments = function (data, cb) {
    let __self = this;
    if (!data || !(data.environments && Array.isArray(data.environments)) || !data.groups) {
        let error = new Error("Group: environments and groups are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {}
    };
    if (data.environments) {
        for (let i = 0; i < data.environments.length; i++) {
            let env = data.environments[i].toUpperCase();
            s['$set']['config.allowedEnvironments.' + env] = {};
        }
    }
    let condition = {'code': {'$in': data.groups}};
    let extraOptions = {
        'upsert': false,
        'safe': true,
        'multi': true
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
 *      required (groups[code, code], packages[{product: "", package: ""}])
 *
 * @param cb
 */
Group.prototype.updatePackages = function (data, cb) {
    let __self = this;
    if (!data || !(data.packages && Array.isArray(data.packages)) || !data.groups) {
        let error = new Error("Group: packages and groups are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {}
    };
    if (data.packages) {
        for (let i = 0; i < data.packages.length; i++) {
            let prodPack = data.packages[i];
            if (s['$set']['config.allowedPackages.' + prodPack.product] && Array.isArray(s['$set']['config.allowedPackages.' + prodPack.product])) {
                s['$set']['config.allowedPackages.' + prodPack.product].push(prodPack.package);
            }
            else {
                s['$set']['config.allowedPackages.' + prodPack.product] = [prodPack.package];
            }
        }
    }
    let condition = {'code': {'$in': data.groups}};
    let extraOptions = {
        'upsert': false,
        'safe': true,
        'multi': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
        return cb(err, record);
    });
};

/**
 * To delete environment(s) from a group
 *
 * @param data
 *  should have:
 *      required (code or id, environments["", ""])
 *
 * @param cb
 */
Group.prototype.deleteEnvironments = function (data, cb) {
    let __self = this;
    if (!data || !(data.id || data.code) || !(data.environments && Array.isArray(data.environments))) {
        let error = new Error("Group: id or code in addition to environment(s) are required.");
        return cb(error, null);
    }
    let remove = (condition) => {
        let us = {
            '$unset': {}
        };

        for (let i = 0; i < data.environments.length; i++) {
            let env = data.environments[i];
            us['$unset']['config.allowedEnvironments.' + env] = 1;
        }
        let extraOptions = {
            'upsert': false,
            'safe': true,
            'multi': true
        };
        __self.mongoCore.update(colName, condition, us, extraOptions, (err, record) => {
            return cb(err, record);
        });
    };
    if (data.id) {
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            let condition = {'_id': _id};
            remove(condition);
        });
    }
    else {
        let condition = {'code': data.code};
        remove(condition);
    }
};

/**
 * To delete product(s) from a group
 *
 * @param data
 *  should have:
 *      required (code or id, products["", ""])
 *
 * @param cb
 */
Group.prototype.deleteProducts = function (data, cb) {
    let __self = this;
    if (!data || !(data.id || data.code) || !(data.products && Array.isArray(data.products))) {
        let error = new Error("Group: id or code in addition to products are required.");
        return cb(error, null);
    }
    let remove = (condition) => {
        let us = {
            '$unset': {}
        };

        for (let i = 0; i < data.products.length; i++) {
            let prod = data.products[i];
            us['$unset']['config.allowedPackages.' + prod] = 1;
        }
        let extraOptions = {
            'upsert': false,
            'safe': true,
            'multi': true
        };
        __self.mongoCore.update(colName, condition, us, extraOptions, (err, record) => {
            return cb(err, record);
        });
    };
    if (data.id) {
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            let condition = {'_id': _id};
            remove(condition);

        });
    } else {
        let condition = {'code': data.code};
        remove(condition);
    }
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