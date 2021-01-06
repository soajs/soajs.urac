"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

const async = require("async");
const colName = "users";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function User(soajs, localConfig, mongoCore) {
    let __self = this;
    if (__self.log) {
        __self.log = soajs.log;
    } else {
        __self.log = (log) => {
            console.log(log);
        };
    }
    if (mongoCore) {
        __self.mongoCore = mongoCore;
        __self.mongoCoreExternal = true;
    }
    if (!__self.mongoCore) {
        __self.mongoCoreExternal = false;
        let tCode = soajs.tenant.code;
        if (soajs.tenant.main && soajs.tenant.main.code) {
            tCode = soajs.tenant.main.code;
        }
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
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, localConfig.serviceName, tCode));

        __self.indexCount = 0;
        __self.counter = 0;
        if (indexing && tCode && !indexing[tCode]) {
            indexing[tCode] = true;

            let indexes = [
                {"col": colName, "i": {'tenant.id': 1}, "o": {}},
                {"col": colName, "i": {'username': 1, 'email': 1, 'status': 1}, "o": {}},
                {"col": colName, "i": {'_id': 1, 'status': 1}, "o": {}},
                {
                    "col": colName, "i": {
                        'username': 1,
                        'email': 1,
                        'firstName': 1,
                        'lastName': 1,
                        'tenant.id': 1
                    }, "o": {}
                },
                {
                    "col": colName, "i": {
                        'username': 1,
                        'email': 1,
                        'firstName': 1,
                        'lastName': 1,
                        'config.allowedTenants.tenant.id': 1
                    }, "o": {}
                },
                {"col": colName, "i": {"username": 1}, "o": {unique: true}},
                {"col": colName, "i": {"email": 1}, "o": {unique: true}},
                {"col": colName, "i": {'config.allowedTenants.tenant.id': 1}, "o": {}},
                {
                    "col": colName, "i": {
                        "config.allowedTenants.tenant.pin.code": 1,
                        "config.allowedTenants.tenant.id": 1
                    }, "o": {
                        unique: true,
                        partialFilterExpression: {
                            "config.allowedTenants.tenant.pin.code": {
                                "$exists": true
                            }
                        }
                    }
                },
                {
                    "col": colName, "i": {
                        "tenant.pin.code": 1,
                        "tenant.id": 1
                    }, "o": {
                        unique: true,
                        partialFilterExpression: {
                            "tenant.pin.code": {
                                "$exists": true
                            }
                        }
                    }
                }
            ];
            __self.indexCount = indexes.length;
            indexing._len = indexes.length;

            for (let i = 0; i < indexes.length; i++) {
                __self.mongoCore.createIndex(indexes[i].col, indexes[i].i, indexes[i].o, (err, index) => {
                    soajs.log.debug("Index: " + index + " created with error: " + err);
                    __self.counter++;
                });
            }

            soajs.log.debug("User: Indexes for " + tCode + " Updated!");
        }
    }
}

/**
 * To clean up deleted group for main tenant
 *
 * @param data
 *  should have:
 *      required (tId, groupCode, tenant)
 *
 * @param cb
 */
User.prototype.cleanDeletedGroup = function (data, cb) {
    let __self = this;
    if (!data || !data.groupCode || !data.tenant) {
        let error = new Error("User: group Code and tenant information are required.");
        return cb(error, null);
    }
    if (data.tenant.type === "client" && data.tenant.main) {
        //TODO: clean up from sub tenant & index
        let condition = {"config.allowedTenants.tenant.id": data.tenant.id};
        let extraOptions = {};
        let s = {"$pull": {"config.allowedTenants.$.groups": data.groupCode}};
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
    }
    else {
        let condition = {"tenant.id": data.tenant.id};
        let extraOptions = {};
        let s = {"$pull": {groups: data.groupCode}};
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
    }
};


/**
 * To get a user by username
 *
 * @param data
 *  should have:
 *      required (username)
 *      optional (status || [status, status])
 *
 * @param cb
 */
User.prototype.getUserByUsername = function (data, cb) {
    let __self = this;
    if (!data || !data.username) {
        let error = new Error("User: username is required.");
        return cb(error, null);
    }
    let condition = {
        '$or': [
            {'username': data.username},
            {'email': data.username}
        ]
    };
    if (data.status) {
        if (Array.isArray(data.status)) {
            condition.status = {"$in": data.status};
        }
        else {
            condition.status = data.status;
        }
    }
    let options = {
        "projection": {
            "password": 0,
            "config": 0,
            "socialId": 0,
            "tenant.pin.code": 0
        }
    };
    if (data.keep && data.keep.pin) {
        delete options.projection.config;
        delete options.projection["tenant.pin.code"];
    }
    __self.mongoCore.findOne(colName, condition, options, (err, record) => {
        return cb(err, record);
    });
};

/**
 * To get a user by id
 *
 * @param data
 *  should have:
 *      required (id)
 *      optional (status, keep{pwd:1})
 *
 * @param cb
 */
User.prototype.getUser = function (data, cb) {
    let __self = this;
    if (!data || !data.id) {
        let error = new Error("User: id is required.");
        return cb(error, null);
    }
    __self.validateId(data.id, (err, _id) => {
        if (err) {
            return cb(err, null);
        }
        let condition = {'_id': _id};
        if (data.status) {
            if (Array.isArray(data.status)) {
                condition.status = {"$in": data.status};
            }
            else {
                condition.status = data.status;
            }
        }
        let options = {
            "projection": {
                "password": 0,
                "config": 0,
                "socialId": 0,
                "tenant.pin.code": 0
            }
        };
        if (data.keep && data.keep.pin) {
            delete options.projection.config;
            delete options.projection["tenant.pin.code"];
        }
        if (data.keep && data.keep.allowedTenants) {
            delete options.projection.config;
            delete options.projection["config.allowedTenants.tenant.pin.code"];
            options.projection["config.allowedTenants.tenant.pin"] = 0;
        }
        if (data.keep && data.keep.pwd) {
            delete options.projection.password;
        }
        __self.mongoCore.findOne(colName, condition, options, (err, record) => {
            return cb(err, record);
        });
    });
};

/**
 * To update a field and optional the status
 *
 * @param data
 *  should have:
 *      required (id || _id, what, whatField)
 *      optional (status)
 *
 * @param cb
 */
User.prototype.updateOneField = function (data, cb) {
    let __self = this;
    if (!data || !(data.id || data._id) || !(data.what && data[data.what])) {
        let error = new Error("User: either id or _id and the what field to update are required.");
        return cb(error, null);
    }

    let doUpdate = (_id) => {
        let condition = {
            '_id': _id
        };
        let extraOptions = {
            'upsert': false
        };
        let s = {
            '$set': {
                [data.what]: data[data.what]
            }
        };
        if (data.status && data.what !== "status") {
            s.$set.status = data.status;
        }
        __self.mongoCore.updateOne(colName, condition, s, extraOptions, (err, record) => {
            if (!record || (record && !record.nModified)) {
                let error = new Error("User: [" + data.what + "] for user [" + _id.toString() + "] was not update.");
                return cb(error);
            }
            return cb(err, record.nModified);
        });
    };
    if (data.id) {
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            doUpdate(_id);
        });
    }
    else {
        doUpdate(data._id);
    }
};

/**
 * To get users
 *
 * @param data
 *  should have:
 *      optional (limit, start, keywords, config)
 *
 * @param cb
 */
User.prototype.getUsers = function (data, cb) {
    let __self = this;
    let condition = {};
    let options = {};
    if (data && data.limit) {
        options.skip = data.start;
        options.limit = data.limit;
        options.sort = {};
    }
    if (data && data.keywords) {
        let rePattern = new RegExp(data.keywords, 'i');
        condition.$or = [
            {"username": {"$regex": rePattern}},
            {"email": {"$regex": rePattern}},
            {"firstName": {"$regex": rePattern}},
            {"lastName": {"$regex": rePattern}},
        ];
    }
    options.projection = {
        'password': 0,
        'config': 0,
        'socialId': 0,
        'tenant.pin.code': 0
    };
    if (data && data.config) {
        delete options.projection.config;
        options.projection['config.allowedTenants.tenant.pin.code'] = 0;
    }
    if (data && data.tenant && data.tenant.main && data.tenant.main.id) {
        condition["config.allowedTenants.tenant.id"] = data.tenant.id;
    } else if (data && data.scope) {
        let tId = data.tenant.id;
        if (data.scope === "myTenancy") {
            condition["tenant.id"] = tId;
        } else if (data.scope === "otherTenancy") {
            condition["tenant.id"] = {"$ne": tId};
        } else if (data.scope === "otherTenancyInvited") {
            condition["tenant.id"] = {"$ne": tId};
            condition["config.allowedTenants.tenant.id"] = tId;
        }
    }
    __self.mongoCore.find(colName, condition, options, (err, records) => {
        return cb(err, records);
    });
};

/**
 * To get users by ids
 *
 * @param data
 *  should have:
 *      required (ids [id, id])
 *      optional (limit, start, ids, config)
 *
 * @param cb
 */
User.prototype.getUsersByIds = function (data, cb) {
    let __self = this;
    if (!data || !data.ids || !Array.isArray(data.ids)) {
        let error = new Error("User: An array of ids is required.");
        return cb(error, null);
    }
    let _ids = [];
    async.each(data.ids, function (id, callback) {
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
        let condition = {};
        condition._id = {
            "$in": _ids
        };
        let options = {};
        if (data && data.limit) {
            options.skip = data.start;
            options.limit = data.limit;
            options.sort = {};
        }
        options.projection = {
            'password': 0,
            'config': 0,
            'socialId': 0,
            'tenant.pin.code': 0
        };
        if (data && data.config) {
            delete options.projection.config;
            options.projection['config.allowedTenants.tenant.pin.code'] = 0;
        }
        __self.mongoCore.find(colName, condition, options, (err, records) => {
            return cb(err, records);
        });
    });
};

/**
 * To check if a given username exist
 *
 * @param data
 *  should have:
 *      required (username)
 *      optional (exclude_id)
 *
 * @param cb
 */
User.prototype.checkUsername = function (data, cb) {
    let __self = this;
    if (!data || !data.username) {
        let error = new Error("User: username is required.");
        return cb(error, null);
    }
    let condition = {
        '$or': [
            {'username': data.username},
            {'email': data.username}
        ]
    };
    if (data.email) {
        condition = {
            '$or': [
                {'username': data.username},
                {'email': data.email}
            ]
        };
    }
    if (data.exclude_id) {
        condition._id = {"$ne": data.exclude_id};
    }
    __self.mongoCore.countDocuments(colName, condition, {}, (err, count) => {
        return cb(err, count);
    });
};

/**
 * To count the number of users that matches certain keywords
 *
 * @param data
 *  should have:
 *      optional (keywords)
 *
 * @param cb
 */
User.prototype.countUsers = function (data, cb) {
    let __self = this;
    let condition = {};
    if (data && data.keywords) {
        let rePattern = new RegExp(data.keywords, 'i');
        condition.$or = [
            {"username": {"$regex": rePattern}},
            {"email": {"$regex": rePattern}},
            {"firstName": {"$regex": rePattern}},
            {"lastName": {"$regex": rePattern}}
        ];
    }
    if (data && data.tenant && data.tenant.main && data.tenant.main.id) {
        condition["config.allowedTenants.tenant.id"] = data.tenant.id;
    } else if (data && data.scope) {
        let tId = data.tenant.id;
        if (data.scope === "myTenancy") {
            condition["tenant.id"] = tId;
        } else if (data.scope === "otherTenancy") {
            condition["tenant.id"] = {"$ne": tId};
        } else if (data.scope === "otherTenancyInvited") {
            condition["tenant.id"] = {"$ne": tId};
            condition["config.allowedTenants.tenant.id"] = tId;
        }
    }
    __self.mongoCore.countDocuments(colName, condition, {}, (err, count) => {
        return cb(err, count);
    });
};

/**
 * To add a user
 *
 * @param data
 *  should have:
 *      required (username, firstName, lastName, email, password, status, tenant{id,code})
 *      optional (profile, groups, config)
 *
 * @param cb
 */
User.prototype.add = function (data, cb) {
    let __self = this;
    if (!data || !data.username || !data.firstName || !data.lastName || !data.email || !data.password || !data.status || !data.tenant) {
        let error = new Error("User: username, firstName, lastName, email, password, status and tenant information are required.");
        return cb(error, null);
    }

    let record = {
        "username": data.username,
        "firstName": data.firstName,
        "lastName": data.lastName,
        "email": data.email,

        "password": data.password,
        "status": data.status,

        "tenant": data.tenant
    };
    if (data.ln) {
        record.ln = data.ln;
    }

    record.ts = new Date().getTime();

    record.profile = data.profile || {};
    record.groups = data.groups || [];
    record.config = data.config || {};

    __self.mongoCore.insertOne(colName, record, {}, (err, record) => {
        if (record && Array.isArray(record)) {
            record = record [0];
        }
        return cb(err, record);
    });
};

/**
 * To edit a user
 *
 * @param data
 *  should have:
 *      required (id, _id)
 *      optional one of those (username, firstName, lastName, email, profile, groups, status)
 *
 * @param cb
 */
User.prototype.edit = function (data, cb) {
    let __self = this;
    if (!data || !(data.id || data._id)) {
        let error = new Error("User: either id or _id is required.");
        return cb(error, null);
    }

    let doUpdate = (_id) => {
        let condition = {
            '_id': _id
        };
        let extraOptions = {
            'upsert': false
        };
        if (data.username || data.firstName || data.lastName || data.profile || data.groups || data.email || data.status) {
            let s = {'$set': {}};

            if (data.username) {
                s.$set.username = data.username;
            }
            if (data.firstName) {
                s.$set.firstName = data.firstName;
            }
            if (data.lastName) {
                s.$set.lastName = data.lastName;
            }
            if (data.email) {
                s.$set.email = data.email;
            }
            if (data.profile) {
                s.$set.profile = data.profile;
            }
            if (data.groups) {
                s.$set.groups = data.groups;
            }
            if (data.status) {
                s.$set.status = data.status;
            }
            if (data.ln) {
                s.$set.ln = data.ln;
            }
            __self.mongoCore.updateOne(colName, condition, s, extraOptions, (err, record) => {
                let nModified = 0;
                if (!record) {
                    nModified = 0;
                } else {
                    nModified = record.nModified || 0;
                }
                return cb(err, nModified);
            });
        }
        else {
            let error = new Error("User: nothing to update.");
            return cb(error);
        }
    };
    if (data.id) {
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            doUpdate(_id);
        });
    }
    else {
        doUpdate(data._id);
    }
};

/**
 * To save user record
 *
 * @param data
 *  should have:
 *      required (_id)
 *
 * @param cb
 */
User.prototype.save = function (data, cb) {
    let __self = this;
    if (!data || !data._id) {
        let error = new Error("User: _id is required.");
        return cb(error, null);
    }
    let condition = {
        "_id": data._id
    };
    let extraOptions = {
        'upsert': false
    };
    let s = {'$set': data};
    __self.mongoCore.updateOne(colName, condition, s, extraOptions, (err, record) => {
        let nModified = 0;
        if (!record) {
            nModified = 0;
        } else {
            nModified = record.nModified || 0;
        }
        return cb(err, nModified);
    });
};

/**
 * To uninvite a user
 *
 * @param data
 *  should have:
 *      required (user[id | username | email], status, tenant)
 *
 * @param cb
 */
User.prototype.uninvite = function (data, cb) {
    let __self = this;
    if (!data || !data.user || !(data.user.id || data.user.username || data.user.email) || !data.status || !data.tenant) {
        let error = new Error("User: user [id | username | email], status, and tenant information are required.");
        return cb(error, null);
    }

    let doUninvite = (condition) => {
        let s = {
            "$pull": {
                "config.allowedTenants": {"tenant.id": data.tenant.id}
            }
        };
        condition.status = data.status;
        __self.mongoCore.updateOne(colName, condition, s, null, (err, record) => {
            if (!record || (record && !record.nModified)) {
                let user = data.user.id || data.user.username || data.user.email;
                let error = new Error("User: user [" + user + "] was not uninvited.");
                return cb(error);
            }
            return cb(err, record.nModified);
        });
    };

    if (data.user.username) {
        let condition = {'username': data.user.username};
        doUninvite(condition);
    }
    else if (data.user.email) {
        let condition = {'email': data.user.email};
        doUninvite(condition);
    } else {
        __self.validateId(data.user.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            let condition = {"_id": _id};
            doUninvite(condition);
        });
    }
};

/**
 * To edit user's groups
 *
 * @param data
 *  should have:
 *      required (user[id | username | email], status, tenant, groups)
 *
 * @param cb
 */
User.prototype.editGroups = function (data, cb) {
    let __self = this;
    if (!data || !data.user || !(data.user.id || data.user.username || data.user.email) || !data.status || !data.tenant || !data.groups) {
        let error = new Error("User: user [id | username | email], status, groups, and tenant information are required.");
        return cb(error, null);
    }

    let doEdit = (condition) => {
        let s = null;
        if (data.tenant.type === "client" && data.tenant.main) {
            s = {
                "$set": {
                    "config.allowedTenants.$.groups": data.groups
                }
            };
            condition["config.allowedTenants.tenant.id"] = data.tenant.id;
        }
        else {
            s = {
                "$set": {
                    "groups": data.groups
                }
            };
            condition["tenant.id"] = data.tenant.id;
        }
        condition.status = data.status;
        __self.mongoCore.updateOne(colName, condition, s, null, (err, record) => {
            let nModified = 0;
            if (!record) {
                nModified = 0;
            } else {
                nModified = record.nModified || 0;
            }
            if (!nModified && data.tenant.type === "product") {
                //try to update the groups in case of roaming
                s = {
                    "$set": {
                        "config.allowedTenants.$.groups": data.groups
                    }
                };
                condition["config.allowedTenants.tenant.id"] = data.tenant.id;
                condition["tenant.id"] = {"$ne": data.tenant.id};
                condition.status = data.status;
                __self.mongoCore.updateOne(colName, condition, s, null, (err, record) => {
                    let nModified = 0;
                    if (!record) {
                        nModified = 0;
                    } else {
                        nModified = record.nModified || 0;
                    }
                    return cb(err, nModified);
                });
            } else {
                return cb(err, nModified);
            }
        });
    };

    if (data.user.username) {
        let condition = {'username': data.user.username};
        doEdit(condition);
    }
    else if (data.user.email) {
        let condition = {'email': data.user.email};
        doEdit(condition);
    } else {
        __self.validateId(data.user.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            let condition = {"_id": _id};
            doEdit(condition);
        });
    }
};

/**
 * To delete or update a user pin
 *
 * @param data
 *  should have:
 *      required (user[id | username | email], status, tenant, pin[delete || (code || allowed)])
 *
 * @param cb
 */
User.prototype.deleteUpdatePin = function (data, cb) {
    let __self = this;

    if (!data || !data.user || !(data.user.id || data.user.username || data.user.email) || !data.status || !data.pin || !data.tenant) {
        let error = new Error("User: user [id | username | email], status, pin and tenant information are required.");
        return cb(error, null);
    }

    let doDelete = (condition) => {
        let s = null;
        if (data.tenant.type === "client" && data.tenant.main) {
            s = {
                "$unset": {
                    "config.allowedTenants.$.tenant.pin": 1
                }
            };
            condition["config.allowedTenants.tenant.id"] = data.tenant.id;
        }
        else {
            s = {
                "$unset": {
                    "tenant.pin": 1
                }
            };
            condition["tenant.id"] = data.tenant.id;
        }

        __self.mongoCore.updateOne(colName, condition, s, null, (err, record) => {
            let nModified = 0;
            if (!record) {
                nModified = 0;
            } else {
                nModified = record.nModified || 0;
            }
            if (!nModified && data.tenant.type === "product") {
                //try to delete the pin in case of roaming
                s = {
                    "$unset": {
                        "config.allowedTenants.$.tenant.pin": 1
                    }
                };
                condition["config.allowedTenants.tenant.id"] = data.tenant.id;
                condition["tenant.id"] = {"$ne": data.tenant.id};
                __self.mongoCore.updateOne(colName, condition, s, null, (err, record) => {
                    let nModified = 0;
                    if (!record) {
                        nModified = 0;
                    } else {
                        nModified = record.nModified || 0;
                    }
                    return cb(err, nModified);
                });
            } else {
                return cb(err, nModified);
            }
        });
    };

    let doUpdate = (condition) => {
        let s = {"$set": {}};
        if (data.tenant.type === "client" && data.tenant.main) {
            if (data.pin.code) {
                s.$set["config.allowedTenants.$.tenant.pin.code"] = data.pin.code;
            }
            if (data.pin.hasOwnProperty("allowed")) {
                s.$set["config.allowedTenants.$.tenant.pin.allowed"] = data.pin.allowed;
            }
            condition["config.allowedTenants.tenant.id"] = data.tenant.id;
        }
        else {

            if (data.pin.code) {
                s.$set["tenant.pin.code"] = data.pin.code;
            }
            if (data.pin.hasOwnProperty("allowed")) {
                s.$set["tenant.pin.allowed"] = data.pin.allowed;
            }
            condition["tenant.id"] = data.tenant.id;
        }
        __self.mongoCore.updateOne(colName, condition, s, null, (err, record) => {
            let nModified = 0;
            if (!record) {
                nModified = 0;
            } else {
                nModified = record.nModified || 0;
            }
            if (!nModified && data.tenant.type === "product") {
                //try to update the pin in case of roaming
                let s = {"$set": {}};
                if (data.pin.code) {
                    s.$set["config.allowedTenants.$.tenant.pin.code"] = data.pin.code;
                }
                if (data.pin.hasOwnProperty("allowed")) {
                    s.$set["config.allowedTenants.$.tenant.pin.allowed"] = data.pin.allowed;
                }
                condition["config.allowedTenants.tenant.id"] = data.tenant.id;
                condition["tenant.id"] = {"$ne": data.tenant.id};
                __self.mongoCore.updateOne(colName, condition, s, null, (err, record) => {
                    let nModified = 0;
                    if (!record) {
                        nModified = 0;
                    } else {
                        nModified = record.nModified || 0;
                    }
                    return cb(err, nModified);
                });
            } else {
                return cb(err, nModified);
            }
        });
    };

    let doPin = (condition) => {
        condition.status = data.status;
        if (data.pin.delete) {
            doDelete(condition);
        }
        else {
            if (!(data.pin.code || data.pin.hasOwnProperty("allowed"))) {
                let error = new Error("User: pin [code or allowed] is required.");
                return cb(error, null);
            }
            doUpdate(condition);
        }
    };

    if (data.user.username) {
        let condition = {'username': data.user.username};
        doPin(condition);
    }
    else if (data.user.email) {
        let condition = {'email': data.user.email};
        doPin(condition);
    } else {
        __self.validateId(data.user.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            let condition = {"_id": _id};
            doPin(condition);
        });
    }
};

User.prototype.delete = function (data, cb) {
    let __self = this;
    if (!data || !data.id) {
        let error = new Error("User: id is required.");
        return cb(error, null);
    }
    __self.validateId(data.id, (err, _id) => {
        if (err) {
            return cb(err, null);
        }
        let condition = {'_id': _id};
        __self.mongoCore.findOne(colName, condition, null, (err, record) => {
            if (err) {
                return cb(err);
            }
            if (!record) {
                let error = new Error("User: cannot delete record. Not found.");
                return cb(error, null);
            }
            if (record.locked) {
                //return error msg that this record is locked
                let error = new Error("User: cannot delete a locked record.");
                return cb(error, null);
            }
            __self.mongoCore.deleteOne(colName, condition, null, (err) => {
                return cb(err, record);
            });
        });
    });
};

User.prototype.validateId = function (id, cb) {
    let __self = this;

    if (!id) {
        let error = new Error("User: must provide an id.");
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

User.prototype.closeConnection = function (count) {
    let __self = this;
    count = count || 1;
    if (!__self.mongoCoreExternal) {
        if (__self.mongoCore) {
            if (__self.counter >= __self.indexCount || count > indexing._len) {
                __self.mongoCore.closeDb();
            } else {
                count++;
                __self.closeConnection(count);
            }
        }
    }
};

module.exports = User;