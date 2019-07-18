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

    let __self = this;
    if (!data) {
        let error = new Error("username or id are required.");
        return cb(error, null);
    }
    let condition = {
        '$or':
            [
                {'username': data.username},
                {'_id': data.id}
            ]
    };// to be based on data (username, id, etc..)

    __self.mongoCore.count(colName, condition, (err, record) => {
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
User.prototype.getUserById = function (data, cb) {
    let __self = this;
    if (!data || !data.id) {
        let error = new Error("id is required.");
        return cb(error, null);
    }
    let objectId = __self.mongoCore.ObjectId(data.id);
    let condition = {'_id': objectId};

    __self.mongoCore.findOne(colName, condition, { password: 0 }, null, (err, record) => {
        if (err) {
            return cb(err);
        }
        return cb(err, record);
    });
}; // Failed when tested


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
        let error = new Error("username is required.");
        return cb(error, null);
    }
    let condition = {'username': data.username};

    __self.mongoCore.findOne(colName, condition, { password: 0 }, null, (err, record) => {
        if (err) {
            return cb(err);
        }
        return cb(err, record);
    });
}; // Failed when tested

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
    if (!data || !data.username && !data.email) {
        let error = new Error("username/email is required.");
        return cb(error, null);
    }
    let condition = {
        '$or':
            [
                {'username': data['username']},
                {'email': data['email']}
            ]
    };
    __self.mongoCore.count(colName, condition, (err, response) => {
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
 * To add a user
 *
 * @param data
 *  should have:
 *      required (id)
 *      optional ()
 *
 * @param cb
 */
User.prototype.addUser = function (data, cb) {
    // Check if username or email are already taken
    let __self = this;

    if (!data) {
        let error = new Error("are required.");
        return cb(error, null);
    }

    let record = {
        username: data.username,
        password: data.password, //Check encryption with Antoine
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        status: data.status,
        config: {},
        ts: data.ts
    }

    if (data.profile) {
        record.profile = data.profile;
    }
    if (data.groups) {
        record.groups = data.groups;
    }

    __self.mongoCore.insert(colName, record, (err, record) => {
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
User.prototype.editUser = function (data, cb) { // Check!!! Didn't pass test
    let __self = this;
    if (!data || !data.id || !data.username) {
        let error = new Error("id and username are required.");
        return cb(error, null);
    }

    let record = {
        username: data.username,
        password: data.password, //Check encryption with Antoine
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        status: data.status,
        config: {},
        ts: data.ts
    }

    let condition = {'_id': data.id};
    let extraOptions = {
        'upsert': false,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, record, extraOptions, (err, record) => {
        return cb(err, record);
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
User.prototype.deleteGroup = function (data, cb) { // Needs to be moved to index
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
User.prototype.addGroup = function (data, cb) { // Needs to be moved to index
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
 * To delete a user
 *
 * @param data
 *  should have:
 *      required (id)
 *      optional ()
 *
 * @param cb
 */
User.prototype.deleteUser = function (data, cb) {
    let __self = this;
    if (!data || !data.id) {
        let error = new Error("id is required.");
        return cb(error);
    }
    let objectId = __self.mongoCore.ObjectId(data.id);
    let condition = {'_id': objectId};
    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        if (err) {
            return cb(err);
        }
        if (record.locked) {
            //return error msg that this record is locked
            let error = new Error("cannot delete a locked record.");
            return cb(error);
        }
        __self.mongoCore.remove(colName, condition, (err, record) => {
            if (err) {
                return cb(err);
            }
            if (!record || record === []){
                let error = new Error("Couldn't find record.");
                return cb(error);
            }
            return cb(null, true);
        });
    });
};

User.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = User;