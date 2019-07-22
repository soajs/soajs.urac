"use strict";
const colName = "token";
const core = require("soajs");
const Mongo = core.mongo;

function Token(soajs, mongoCore) {
    let __self = this;
    if (mongoCore)
        __self.mongoCore = mongoCore;
    if (!__self.mongoCore) {
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, soajs.config.serviceName, soajs.tenant.code));
    }
// Check if main or sub tenant affects mongo connection
}

Token.prototype.validateId = function (data, cb) {
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


Token.prototype.getTokens = function (data, cb) {
    let __self = this;
    let condition = {};

    __self.mongoCore.find(colName, condition, null, null, (err, record) => {
        return cb(err, record);
    });
};

Token.prototype.getToken = function (data, cb) {
    let __self = this;
    if (!data || !data.id) {
        let error = new Error("must provide id.");
        return cb(error, null);
    }
    let condition = {};
    if (data.id) {
        condition = {'_id': data.id};
    }
    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        if (err) {
            return cb(err);
        }
        return cb(null, record);
    });
};

Token.prototype.deleteToken = function (data, cb) {
    let __self = this;
    if (!data.id) {
        let error = new Error("id is required.");
        return cb(error, null);
    }
    let condition = {"_id": data.id};

    __self.mongoCore.findOne(colName, condition, null, null, (err, record) => {
        if (err) {
            return cb(err);
        }
        if (record.locked) {
            let error = new Error("cannot delete a locked record.");
            return cb(error, null);
        }

        __self.mongoCore.remove(colName, condition, (err) => {
            if (err) {
                return cb(err);
            }
            return cb(null, record);
        });
    });
};

Token.prototype.countTokens = function (data, cb) {
    let __self = this;
    let condition = { '_id': data.id };

    __self.mongoCore.mongoDb.count(colName, condition, null, null, (err, record) => {
        return cb(err, record);
    });
};

Token.prototype.addToken = function (data, cb) {
    let __self = this;

    // Check what to insure on creation

    __self.mongoCore.insert(colName, data, (err, record) => {
        return cb(err, record);
    });
}

Token.prototype.closeConnection = function () {
    let __self = this;

    __self.mongoCore.closeDb();
};

module.exports = Token;