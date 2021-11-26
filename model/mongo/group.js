"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

const colName = "groups";
const core = require("soajs");
const Mongo = core.mongo;
const async = require("async");

let indexing = {};

function Group(soajs, localConfig, mongoCore) {
    let __self = this;
    __self.keepConnectionAlive = false;
    if (soajs.log && soajs.log.error) {
        __self.log = soajs.log.error;
    } else {
        __self.log = (log) => {
            console.log(log);
        };
    }
    if (mongoCore) {
        __self.mongoCore = mongoCore;
        __self.mongoCoreExternal = true;
    }
    if (soajs.tenant && soajs.tenant.id) {
        __self.tenantId = soajs.tenant.id;
    }
    if (!__self.mongoCore) {
        let tCode = soajs.tenant.code;
        let masterCode = get(["registry", "custom", "urac", "value", "masterCode"], soajs);
        if (masterCode) {
            tCode = masterCode;
        } else {
            let dbCodes = get(["registry", "custom", "urac", "value", "dbCodes"], soajs);
            if (dbCodes) {
                for (let c in dbCodes) {
                    if (dbCodes.hasOwnProperty(c)) {
                        if (dbCodes[c].includes(tCode)) {
                            tCode = c;
                            break;
                        }
                    }
                }
            }
        }
        __self.mongoCoreExternal = false;
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, localConfig.serviceName, tCode));

        __self.indexCount = 0;
        __self.counter = 0;
        if (indexing && soajs && soajs.tenant && tCode && !indexing[tCode]) {
            indexing[tCode] = true;

            let indexes = [
                {"col": colName, "i": {'code': 1, 'tenant.id': 1}, "o": {unique: true}}
            ];
            __self.indexCount = indexes.length;
            indexing._len = indexes.length;

            for (let i = 0; i < indexes.length; i++) {
                __self.mongoCore.createIndex(indexes[i].col, indexes[i].i, indexes[i].o, (err, index) => {
                    soajs.log.debug("Index: " + index + " created with error: " + err);
                    __self.counter++;
                });
            }

            soajs.log.debug("Group: Indexes for " + tCode + " Updated!");
        }
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
    if (!data) {
        data = {};
    }
    let condition = {
        "tenant.id": data.tenantId || __self.tenantId
    };
    __self.mongoCore.find(colName, condition, null, (err, records) => {
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
    let condition = {
        "tenant.id": __self.tenantId
    };

    if (data.id) {
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            condition._id = _id;
            __self.mongoCore.findOne(colName, condition, null, (err, record) => {
                return cb(err, record);
            });
        });
    } else {
        if (data.code) {
            condition.code = data.code;
        }

        __self.mongoCore.findOne(colName, condition, null, (err, record) => {
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
            record.config.allowedPackages[prodPack.product] = prodPack.packages;
        }
    }
    __self.mongoCore.insertOne(colName, record, {}, (err, record) => {
        if (record && Array.isArray(record)) {
            record = record [0];
        }
        return cb(err, record);
    });
};

Group.prototype.add_multiple = function (data, cb) {
    let __self = this;
    if (!data || !Array.isArray(data) || data.length === 0) {
        let error = new Error("Group: Array of groups is required.");
        return cb(error, null);
    }

    __self.mongoCore.insertMany(colName, data, {}, (err, record) => {
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
            s.$set.description = data.description;
        }
        if (data.environments) {
            for (let i = 0; i < data.environments.length; i++) {
                let env = data.environments[i].toUpperCase();
                s.$set['config.allowedEnvironments.' + env] = {};
            }
        }
        if (data.packages) {
            for (let i = 0; i < data.packages.length; i++) {
                let prodPack = data.packages[i];
                s.$set['config.allowedPackages.' + prodPack.product] = prodPack.packages;
            }
        }
        let condition = {
            '_id': _id,
            "tenant.id": __self.tenantId
        };
        let extraOptions = {
            'upsert': false
        };
        __self.mongoCore.updateOne(colName, condition, s, extraOptions, (err, result) => {
            if (err) {
                return cb(err);
            } else {
                if (result && result.nModified) {
                    result = result.nModified;
                } else {
                    if (result && result.ok && result.upserted && Array.isArray(result.upserted)) {
                        result = result.upserted.length;
                    } else {
                        result = 0;
                    }
                }
                return cb(err, result);
            }
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
        let condition = {
            '_id': _id,
            "tenant.id": __self.tenantId
        };
        __self.mongoCore.findOne(colName, condition, null, (err, record) => {
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
            __self.mongoCore.deleteOne(colName, condition, null, (err) => {
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
    if (!data || !(data.environments && Array.isArray(data.environments)) || (!data.groups && !(data.groups.ids || data.groups.codes))) {
        let error = new Error("Group: environments and group codes or ids are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {}
    };
    if (data.environments) {
        for (let i = 0; i < data.environments.length; i++) {
            let env = data.environments[i].toUpperCase();
            s.$set['config.allowedEnvironments.' + env] = {};
        }
    }

    let _ids = [];

    if (data.groups.codes) {
        let condition = {
            'code': {'$in': data.groups.codes},
            "tenant.id": __self.tenantId
        };
        let extraOptions = {
            'upsert': false
        };
        __self.mongoCore.updateMany(colName, condition, s, extraOptions, (err, result) => {
            if (err) {
                return cb(err);
            } else {
                if (result && result.nModified) {
                    result = result.nModified;
                } else {
                    result = 0;
                }
                return cb(err, result);
            }
        });
    } else if (data.groups.ids) {
        async.each(data.groups.ids, function (id, callback) {
            __self.validateId(id, function (err, _id) {
                if (err) {
                    //ignore
                } else {
                    _ids.push(_id);
                }
                callback();
            });
        }, function () {
            if (_ids.length === 0) {
                return cb(null, []);
            }
            let condition = {
                '_id': {'$in': _ids},
                "tenant.id": __self.tenantId
            };
            let extraOptions = {
                'upsert': false
            };
            __self.mongoCore.updateMany(colName, condition, s, extraOptions, (err, result) => {
                if (err) {
                    return cb(err);
                } else {
                    if (result && result.nModified) {
                        result = result.nModified;
                    } else {
                        result = 0;
                    }
                    return cb(err, result);
                }
            });
        });
    }
};

/**
 * To add allowed package(s) to groups
 *
 * @param data
 *  should have:
 *      required (groups[code, code], packages[{product: "", packages: ["", ""]}])
 *
 * @param cb
 */
Group.prototype.updatePackages = function (data, cb) {
    let __self = this;
    if (!data || !(data.packages && Array.isArray(data.packages)) || (!data.groups && !(data.groups.ids || data.groups.codes))) {
        let error = new Error("Group: packages and group codes or ids are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {}
    };
    if (data.packages) {
        for (let i = 0; i < data.packages.length; i++) {
            let prodPack = data.packages[i];
            s.$set['config.allowedPackages.' + prodPack.product] = prodPack.packages;
        }
    }
    let _ids = [];

    if (data.groups.codes) {
        let condition = {
            'code': {'$in': data.groups.codes},
            "tenant.id": __self.tenantId
        };
        let extraOptions = {
            'upsert': false
        };
        __self.mongoCore.updateMany(colName, condition, s, extraOptions, (err, result) => {
            if (err) {
                return cb(err);
            } else {
                if (result && result.nModified) {
                    result = result.nModified;
                } else {
                    result = 0;
                }
                return cb(err, result);
            }
        });
    } else if (data.groups.ids) {
        async.each(data.groups.ids, function (id, callback) {
            __self.validateId(id, function (err, _id) {
                if (err) {
                    //ignore
                } else {
                    _ids.push(_id);
                }
                callback();
            });
        }, function () {
            if (_ids.length === 0) {
                return cb(null, []);
            }
            let condition = {
                '_id': {'$in': _ids},
                "tenant.id": __self.tenantId
            };
            let extraOptions = {
                'upsert': false
            };
            __self.mongoCore.updateMany(colName, condition, s, extraOptions, (err, result) => {
                if (err) {
                    return cb(err);
                } else {
                    if (result && result.nModified) {
                        result = result.nModified;
                    } else {
                        result = 0;
                    }
                    return cb(err, result);
                }
            });
        });
    }
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
            us.$unset['config.allowedEnvironments.' + env] = 1;
        }
        let extraOptions = {
            'upsert': false
        };
        __self.mongoCore.updateMany(colName, condition, us, extraOptions, (err, result) => {
            if (err) {
                return cb(err);
            } else {
                if (result && result.nModified) {
                    result = result.nModified;
                } else {
                    result = 0;
                }
                return cb(err, result);
            }
        });
    };
    if (data.id) {
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            let condition = {
                '_id': _id,
                "tenant.id": __self.tenantId
            };
            remove(condition);
        });
    } else {
        let condition = {
            'code': data.code,
            "tenant.id": __self.tenantId
        };
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
            us.$unset['config.allowedPackages.' + prod] = 1;
        }
        let extraOptions = {
            'upsert': false
        };
        __self.mongoCore.updateMany(colName, condition, us, extraOptions, (err, result) => {
            if (err) {
                return cb(err);
            } else {
                if (result && result.nModified) {
                    result = result.nModified;
                } else {
                    result = 0;
                }
                return cb(err, result);
            }
        });
    };
    if (data.id) {
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            let condition = {
                '_id': _id,
                "tenant.id": __self.tenantId
            };
            remove(condition);

        });
    } else {
        let condition = {
            'code': data.code,
            "tenant.id": __self.tenantId
        };
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
        __self.log(e.message);
        return cb(new Error("A valid ID is required"), null);
    }
};

Group.prototype.closeConnection = function (count) {
    let __self = this;
    count = count || 1;
    if (!__self.mongoCoreExternal) {
        if (__self.mongoCore) {
            if (__self.counter >= __self.indexCount || count > indexing._len) {
                if (!__self.keepConnectionAlive) {
                    __self.mongoCore.closeDb();
                }
            } else {
                count++;
                __self.closeConnection(count);
            }
        }
    }
};

module.exports = Group;
