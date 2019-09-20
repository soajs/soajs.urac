"use strict";
const async = require("async");
const colName = "users";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function User(soajs, localConfig, mongoCore) {
    let __self = this;
    if (mongoCore) {
        __self.mongoCore = mongoCore;
        __self.mongoCoreExternal = true;
    }
    if (!__self.mongoCore) {
        __self.mongoCoreExternal = false;
        let tCode = soajs.tenant.code;
        if (soajs.tenant.type === "client" && soajs.tenant.main) {
            tCode = soajs.tenant.main.code;
        }
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, localConfig.serviceName, tCode));
    }
    if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
        indexing[soajs.tenant.id] = true;

        __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
        });
        __self.mongoCore.createIndex(colName, {'username': 1, 'email': 1, 'status': 1}, {}, function (err, result) {
        });
        __self.mongoCore.createIndex(colName, {'_id': 1, 'status': 1}, {}, function (err, result) {
        });
        __self.mongoCore.createIndex(colName, {
            'username': 1,
            'email': 1,
            'firstName': 1,
            'lastName': 1
        }, {}, function (err, result) {
        });

        //the following are set @ urac.driver
        __self.mongoCore.createIndex(colName, {"username": 1}, {unique: true}, function () {
        });
        __self.mongoCore.createIndex(colName, {"email": 1}, {unique: true}, function () {
        });
        __self.mongoCore.createIndex(colName,
            {
                "config.allowedTenants.tenant.pin.code": 1,
                "config.allowedTenants.tenant.id": 1
            },
            {
                unique: true,
                partialFilterExpression: {
                    "config.allowedTenants.tenant.pin.code": {
                        "$exists": true
                    }
                }
            }
        );
        __self.mongoCore.createIndex(colName,
            {
                "tenant.pin.code": 1,
                "tenant.id": 1
            },
            {
                unique: true,
                partialFilterExpression: {
                    "tenant.pin.code": {
                        "$exists": true
                    }
                }
            }
        );

        soajs.log.debug("User: Indexes for " + soajs.tenant.id + " Updated!");
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
    if (!data || !data.tId || !data.groupCode || !data.tenant) {
        let error = new Error("User: tenant ID, group Code and tenant information are required.");
        return cb(error, null);
    }
    if (data.tenant.type === "client" && data.tenant.main) {
        //TODO: clean up from sub tenant
    }
    else {
        let condition = {"tenant.id": data.tId};
        let extraOptions = {multi: true};
        let s = {"$pull": {groups: data.groupCode}};
        __self.mongoCore.update(colName, condition, s, extraOptions, (err, response) => {
            return cb(err, response);
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
    __self.mongoCore.findOne(colName, condition, {socialId: 0, password: 0}, null, (err, record) => {
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
            condition.status = data.status;
        }
        let fields = {socialId: 0, password: 0};
        if (data.keep && data.keep.pwd) {
            delete fields.password;
        }

        __self.mongoCore.findOne(colName, condition, fields, null, (err, record) => {
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
            'upsert': false,
            'safe': true
        };
        let s = {
            '$set': {
                [data.what]: data[data.what]
            }
        };
        if (data.status && data.what !== "status") {
            s['$set'].status = data.status;
        }

        __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
            if (!record) {
                let error = new Error("User: [" + data.what + "] for user [" + _id.toString() + "] was not update.");
                return cb(error);
            }
            return cb(err, record);
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
    let pagination = {};
    if (data && data.limit) {
        pagination['skip'] = data.start;
        pagination['limit'] = data.limit;
        pagination.sort = {};
    }
    if (data && data.keywords) {
        let rePattern = new RegExp(data.keywords, 'i');
        condition['$or'] = [
            {"username": {"$regex": rePattern}},
            {"email": {"$regex": rePattern}},
            {"firstName": {"$regex": rePattern}},
            {"lastName": {"$regex": rePattern}},
        ];
    }
    let fields = {
        'password': 0,
        'config': 0,
        'socialId': 0,
        'tenant.pin.code': 0,
        'config.allowedTenants.tenant.pin.code': 0
    };
    if (data && data.config) {
        delete fields.config;
    }
    __self.mongoCore.find(colName, condition, fields, pagination, (err, records) => {
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
        let pagination = {};
        if (data && data.limit) {
            pagination['skip'] = data.start;
            pagination['limit'] = data.limit;
            pagination.sort = {};
        }
        let fields = {
            'password': 0,
            'config': 0,
            'socialId': 0,
            'tenant.pin.code': 0,
            'config.allowedTenants.tenant.pin.code': 0
        };
        if (data && data.config) {
            delete fields.config;
        }
        __self.mongoCore.find(colName, condition, fields, pagination, (err, records) => {
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
        ],
    };
    if (data.exclude_id) {
        condition["_id"] = {"$ne": data.exclude_id};
    }
    __self.mongoCore.count(colName, condition, (err, count) => {
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
        condition['$or'] = [
            {"username": {"$regex": rePattern}},
            {"email": {"$regex": rePattern}},
            {"firstName": {"$regex": rePattern}},
            {"lastName": {"$regex": rePattern}}
        ];
    }
    __self.mongoCore.count(colName, condition, (err, count) => {
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

    record.ts = new Date().getTime();

    record.profile = data.profile || {};
    record.groups = data.groups || [];
    record.config = data.config || {};

    __self.mongoCore.insert(colName, record, (err, record) => {
        if (record && Array.isArray(record))
            record = record [0];
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
            'upsert': false,
            'safe': true
        };
        if (data.username || data.firstName || data.lastName || data.profile || data.groups || data.email || data.status) {
            let s = {'$set': {}};

            if (data.username) {
                s['$set'].username = data.username;
            }
            if (data.firstName) {
                s['$set'].firstName = data.firstName;
            }
            if (data.lastName) {
                s['$set'].lastName = data.lastName;
            }
            if (data.email) {
                s['$set'].email = data.email;
            }
            if (data.profile) {
                s['$set'].profile = data.profile;
            }
            if (data.groups) {
                s['$set'].groups = data.groups;
            }
            if (data.status) {
                s['$set'].status = data.status;
            }
            __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
                if (!record) {
                    let error = new Error("User: user [" + _id.toString() + "] was not update.");
                    return cb(error);
                }
                return cb(err, record);
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
    __self.mongoCore.update(colName, condition, null, null, (err, record) => {
        if (!record) {
            let error = new Error("User: user [" + data._id.toString() + "] was not saved.");
            return cb(error);
        }
        return cb(err, record);
    });
};

/**
 * To uninvite a user
 *
 * @param data
 *  should have:
 *      required ((id || username), status, tenant)
 *
 * @param cb
 */
User.prototype.uninvite = function (data, cb) {
    let __self = this;

    if (!data || !(data.id || data.username) || !data.status || !data.tenant) {
        let error = new Error("User: id or username in addition to status and tenant information are required.");
        return cb(error, null);
    }

    let doUninvite = (condition) => {
        let s = {
            "$pull": {
                "config.allowedTenants": {"tenant.id": data.tenant.id}
            }
        };
        condition.status = data.status;
        __self.mongoCore.update(colName, condition, s, null, (err, record) => {
            if (!record) {
                let user = data.id || data.username;
                let error = new Error("User: user [" + user + "] was not uninvited.");
                return cb(error);
            }
            return cb(err, record);
        });
    };

    if (data.username) {
        let condition = {
            '$or': [
                {'username': data.username},
                {'email': data.username}
            ]
        };
        doUninvite(condition);
    }
    else {
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            let condition = {
                "_id": _id
            };
            doUninvite(condition);
        });
    }
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
        return cb(e, null);
    }
};

User.prototype.closeConnection = function () {
    let __self = this;

    if (!__self.mongoCoreExternal)
        __self.mongoCore.closeDb();
};

module.exports = User;