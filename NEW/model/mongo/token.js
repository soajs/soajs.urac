"use strict";
const colName = "token";
const core = require("soajs");
const Mongo = core.mongo;
const uuid = require('uuid');

let indexing = {};

function Token(soajs, localConfig, mongoCore) {
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

        __self.mongoCore.createIndex(colName, {
            'userId': 1,
            'service': 1,
            'status': 1
        }, {unique: true}, function (err, result) {
        });

        soajs.log.debug("Token: Indexes for " + soajs.tenant.id + " Updated!");
    }
}

Token.prototype.add = function (data, cb) {
    let __self = this;
    if (!data || !data.userId || !data.username || !data.service) {
        let error = new Error("Token: userId, username, and what service are required.");
        return cb(error, null);
    }
    let tokenExpiryTTL = 2 * 24 * 3600000;
    if (data.tokenExpiryTTL) {
        tokenExpiryTTL = data.tokenExpiryTTL;
    }
    let s = {
        '$set': {
            'userId': data.userId,
            'username': data.username,
            'token': uuid.v4(),
            'expires': new Date(new Date().getTime() + tokenExpiryTTL),
            'status': 'active',
            'ts': new Date().getTime(),
            'service': data.service,
        }
    };
    let condition = {
        'userId': data.userId,
        'service': data.service,
        'status': 'active'
    };
    let extraOptions = {
        'upsert': true,
        'safe': true
    };
    __self.mongoCore.update(colName, condition, s, extraOptions, (err, record) => {
        if (!record) {
            let error = new Error("Token: token for [" + data.service + "] was not created.");
            return cb(error);
        }
        return cb(err, record);
    });
};

Token.prototype.closeConnection = function () {
    let __self = this;

    if (!__self.mongoCoreExternal)
        __self.mongoCore.closeDb();
};

module.exports = Token;