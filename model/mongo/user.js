"use strict";
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
        __self.mongoCore.findOne(colName, condition, {socialId: 0, password: 0}, null, (err, record) => {
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

    let updateStatus = (_id) => {
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
            updateStatus(_id);
        });
    }
    else {
        updateStatus(data._id);
    }
};

/**
 * To get users
 *
 * @param data
 *  should have:
 *      optional (tId, limit, start, keywords, config)
 *
 * @param cb
 */
User.prototype.getUsers = function (data, cb) {
    let __self = this;
    let condition = {};
    if (data && data.tId) {
        condition["tenant.id"] = data.tId;
    }
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
    __self.mongoCore.count(colName, condition, (err, record) => {
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