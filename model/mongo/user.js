"use strict";
const colName = "users";
const core = require("soajs");
const Mongo = core.mongo;

let indexing = {};

function User(soajs, mongoCore) {
    let __self = this;
    if (mongoCore)
        __self.mongoCore = mongoCore;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
        if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
            indexing[soajs.tenant.id] = true;

            __self.mongoCore.createIndex(colName, {'username': 1, 'email': 1}, {}, function (err, result) {
            });
            __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
            });
            __self.mongoCore.createIndex(colName, {'username': 1, 'tenant.id': 1}, {}, function (err, result) {
            });
            soajs.log.debug("Indexes for " + soajs.tenant.id + " Updated!");
        }
    }
}

/**
 * To Count Users based on id or username
 *
 * @param data
 *  should have:
 *      optional (username, id)
 *
 * @param cb
 */

User.prototype.countUsers = function (data, cb) {

    let condition = {
        '$or':
            [
                {'username': data.username},
                {'_id': data.id}
            ]
    };// to be based on data (username, id, etc..)

    let __self = this;
    __self.mongoCore.mongoDb.count(colName, condition, null, null, (err, record) => {
        return cb(err, record);
    });
};

/**
 * To validate and convert an id to mongodb objectID
 *
 * @param data
 *  should have:
 *      required (id)
 *
 * @param cb
 */
User.prototype.validateId = function (data, cb) {
    let __self = this;
    try {
        if (process.env.SOAJS_TEST) {
            return cb(null, data.id);
        }
        data.id = __self.mongoCore.ObjectId(data.id);
        return cb(null, data.id);
    } catch (e) {
        return cb(e);
    }
};


/**
 * To get a user
 *
 * @param data
 *  should have:
 *      required (id)
 *
 * @param cb
 */

User.prototype.getUser = function (data, cb) {
    let __self = this;
    if (!data.id) {
        let error = new Error("id is required.");
        return cb(error, null);
    }
    let condition = {'_id': data.id};

    __self.mongoCore.findOne(colName, condition, {socialId: 0, password: 0}, null, (err, record) => {
        return cb(err, record);
    });
};

/**
 * To check if a Username/Email is already taken
 *
 * @param data
 *  should have:
 *      required (username)
 *
 * @param cb
 */
User.prototype.checkIfExists = function (data, cb) {
    let __self = this;
    if (!data.username || !data.email) {
        let error = new Error("username/email is required.");
        return cb(error, null);
    }
    let condition = {
        '$or':
            [
                {'username': data['username']},
                {'email': data['username']}
            ]
    };
    __self.mongoCore.mongoDb.count(colName, condition, (err, response) => {
        return cb(err, response);
    });
};

/**
 * To delete a group for all users of that tenant
 *
 * @param data
 *  should have:
 *      required (tId, groupCode)
 *
 * @param cb
 */
User.prototype.deleteGroup = function (data, cb) {
    let __self = this;
    if (!data.tId || !data.groupCode) {
        let error = new Error("tId and groupCode are required.");
        return cb(error, null);
    }
    let condition = {"tenant.id": data.tId};
    let extraOptions = {multi: true};
    let s = {"$pull": {groups: data.groupCode}};
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, response) => {
        return cb(err, response);
    });
};


/**
 * To add a group for all users of that tenant
 *
 * @param data
 *  should have:
 *      required (users, groupCode, tId)
 *
 * @param cb
 */
User.prototype.addGroup = function (data, cb) {
    let __self = this;
    if (!data || !data.groupCode || !data.tId || !data.users || !Array.isArray(data.users) || data.users.length <= 0) {
        let error = new Error("users, tId and groupCode are required.");
        return cb(error, null);
    }

    let condition = {'username': {$in: data.users}};
    if (data.tId)
        condition["tenant.id"] = data.tId;
    let extraOptions = {multi: true};
    let s = {"$push": {groups: data.groupCode}};
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, response) => {
        return cb(err, response);
    });
};

/**
 * To get user(s)
 *
 * @param data
 *  should have:
 *
 * @param cb
 */
User.prototype.getUsers = function (data, cb) {
    let __self = this;
    let condition = {};
    __self.mongoCore.find(colName, condition, null, null, (err, record) => {
        return cb(err, record);
    });
};

/**
 * To edit a user
 *
 * @param data
 *  should have:
 *      required (id)
 *      optional (firstName, lastName, userName, email, password)
 *
 * @param cb
 */
User.prototype.editUser = function (data, cb) { // Check!!!
    let __self = this;
    if (!data || !data.id || !data.userName) {
        let error = new Error("id and userName are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {
            'firstName': data.firstName,
            'lastName': data.lastName,
            'userName': data.userName,
            'email': data.email,
            'password': data.password
        }
    };
    let condition = {'_id': data.id};
    let extraOptions = {
        'upsert': false,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
        return cb(err, record);
    });
};

User.prototype.addUser = function (data, cb) {
    // Check if username or email are already taken
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

User.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = User;