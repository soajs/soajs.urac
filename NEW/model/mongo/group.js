"use strict";
const colName = "groups";
const core = require("soajs");
const Mongo = core.mongo;
const User = require("./user.js");

let indexing = {};

function Group(soajs, mongoCore) {
    let __self = this;
    if (mongoCore)
        __self.mongoCore = mongoCore;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
        if (indexing && soajs && soajs.tenant && soajs.tenant.id && !indexing[soajs.tenant.id]) {
            indexing[soajs.tenant.id] = true;

            __self.mongoCore.createIndex(colName, {'code': 1}, {unique: true}, function (err, result) {
            });
            __self.mongoCore.createIndex(colName, {'tenant.id': 1}, {}, function (err, result) {
            });
            soajs.log.debug("Indexes for " + soajs.tenant.id + " Updated!");
        }
    }
}

/**
 * To get group(s)
 *
 * @param data
 *  should have:
 *      optional (tId)
 *
 * @param cb
 */
Group.prototype.getGroups = function (data, cb) {
    let __self = this;
    let condition = {};
    if (data && data.tId) {
        condition = {"tenant.id": data.tId};
    }
    __self.mongoCore.find(colName, condition, null, null, (err, records) => {
        return cb(err, records);
    });
};

/**
 * To get a group
 *
 * @param data
 *  should have:
 *      required (id)
 *      optional (code)
 *
 * @param cb
 */
Group.prototype.getGroup = function (data, cb) {
    let __self = this;
    if (!data || !(data.id || data.code)) {
        let error = new Error("must provide either id or code.");
        return cb(error, null);
    }
    let condition = {};

    if (data.id){
        __self.validateId(data.id, (err, _id) => {
            if (err) {
                return cb(err, null);
            }
            condition = {'_id': _id};
            __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
                return cb(err, record);
            });
        });
    } else if (data.code) {
        condition = {'code': data.code};
    }
    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        return cb(err, record);
    });
};

/**
 * To add a group
 *
 * @param data
 *  should have:
 *      required (code, name, description)
 *      optional (config, tId, tCode)
 *
 * @param cb
 */
Group.prototype.add = function (data, cb) {
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

/**
 * To edit a group
 *
 * @param data
 *  should have:
 *      required (id, name)
 *      optional (config, description)
 *
 * @param cb
 */
Group.prototype.edit = function (data, cb) {
    let __self = this;
    if (!data || !data.name || !data.id) {
        let error = new Error("name and id are required.");
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
        if (data.config) {
            s['$set'].config = data.config;
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



Group.prototype.validateId = function (id, cb) {
    let __self = this;

    if (!id) {
        let error = new Error("must provide an id.");
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

    __self.mongoCore.closeDb();
};

module.exports = Group;