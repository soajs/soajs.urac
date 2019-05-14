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

            //needed by deleteGroup @ groups to pull group from all users once deleted
            __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
            });
            soajs.log.debug("Indexes for " + soajs.tenant.id + " Updated!");
        }
    }
}

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
    let condition = {};
    if (data.id) {
        condition = {'_id': data.id};

        __self.mongoCore.findOne(colName, condition, {socialId: 0, password: 0}, null, (err, record) => {
            return cb(err, record);
        });
    }
    else {
        let error = new Error("id is required.");
        return cb(error, null);
    }
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
User.prototype.checkUsername = function (data, cb) {
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
    __self.mongoCore.mongoDb.count(colNamen, condition, (err, response) => {
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

User.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = User;