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

        __self.mongoCore.createIndex(colName, {'username': 1, 'email': 1}, {}, function (err, result) {
        });
        __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
        });
        __self.mongoCore.createIndex(colName, {'username': 1, 'tenant.id': 1}, {}, function (err, result) {
        });
        soajs.log.debug("User: Indexes for " + soajs.tenant.id + " Updated!");
    }
}

/**
 * To clean up deleted group for main tenant
 *
 * @param data
 *  should have:
 *      required (tId, groupCode)
 *
 * @param cb
 */
User.prototype.cleanDeletedGroup = function (data, cb) {
    let __self = this;
    if (!data || !data.tId || !data.groupCode || !data.tenant) {
        let error = new Error("User: tenant ID and group Code are required.");
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
        ],
        'status': data.status
    };
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
 * To update a filed
 *
 * @param data
 *  should have:
 *      required (id || _id, what, whatField)
 *
 * @param cb
 */
User.prototype.updateOneField = function (data, cb) {
    let __self = this;
    if (!data || !(data.id || data._id) || !(data.what && data[data.what])) {
        let error = new Error("Token: either id or _id and the what field to update are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {
            [data.what]: data[data.what]
        }
    };
    if (data.status && data.what !== "status") {
        s['$set'].status = data.status;
    }

    let doUpdate = (_id) => {
        let condition = {
            '_id': _id
        };
        let extraOptions = {
            'upsert': false,
            'safe': true
        };
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
            {"username": rePattern},
            {"email": rePattern},
            {"firstName": rePattern},
            {"lastName": rePattern}
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
 *      optional (limit, start, uIds, config)
 *
 * @param cb
 */
User.prototype.getUsersByIds = function (data, cb) {
    let __self = this;
    if (!data || !data.uIds || !Array.isArray(data.uIds)) {
        let error = new Error("Token: An array of ids is required.");
        return cb(error, null);
    }
    let _ids = [];
    async.each(data.uIds, function (id, callback) {
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
    if (data.exclude_id){
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
 *      required (username)
 *
 * @param cb
 */
User.prototype.countUsers = function (data, cb) {
    let __self = this;
    let condition = {};
    if (data && data.keywords) {
        let rePattern = new RegExp(data.keywords, 'i');
        condition['$or'] = [
            {"username": rePattern},
            {"email": rePattern},
            {"firstName": rePattern},
            {"lastName": rePattern}
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
 *      required (code, name, description)
 *      optional (config, tId, tCode)
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
    record.config = data.config || {"packages": {}, "keys": {}};

    __self.mongoCore.insert(colName, record, (err, record) => {
        if (record && Array.isArray(record))
            record = record [0];
        return cb(err, record);
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
        return cb(e, null);
    }
};

User.prototype.closeConnection = function () {
    let __self = this;

    if (!__self.mongoCoreExternal)
        __self.mongoCore.closeDb();
};

module.exports = User;