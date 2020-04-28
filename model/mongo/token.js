"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const colName = "tokens";
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
        }, {unique: true}, (err, index) => {
            soajs.log.debug("Index: " + index + " created with error: " + err);
        });
        __self.mongoCore.createIndex(colName, {
            'token': 1,
            'service': 1,
            'status': 1
        }, {unique: true}, (err, index) => {
            soajs.log.debug("Index: " + index + " created with error: " + err);
        });

        soajs.log.debug("Token: Indexes for " + soajs.tenant.id + " Updated!");
    }
}

Token.prototype.updateStatus = function (data, cb) {
    let __self = this;
    if (!data || !data.token || !data.status) {
        let error = new Error("Token: status and token are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {
            'status': data.status
        }
    };
    let condition = {
        'token': data.token
    };
    let extraOptions = {
        'upsert': false,
        'safe': true
    };

    __self.mongoCore.updateOne(colName, condition, s, extraOptions, (err, record) => {
        if (!record || (record && !record.nModified)) {
            let error = new Error("Token: status for token [" + data.token + "] was not update.");
            return cb(error);
        }
        return cb(err, record.nModified);
        /*
        { n: 0, nModified: 0, ok: 1 }
         */
        /*
        if (!record) {
            let error = new Error("Token: status for token [" + data.token + "] was not update.");
            return cb(error);
        }
        return cb(err, record);
        */
    });
};

Token.prototype.add = function (data, cb) {
    let __self = this;
    if (!data || !data.userId || !data.username || !data.service || !data.tokenExpiryTTL) {
        let error = new Error("Token: tokenExpiryTTL, userId, username, and what service are required.");
        return cb(error, null);
    }
    let token = uuid.v4();
    let s = {
        '$set': {
            'userId': data.userId,
            'username': data.username,
            'token': token,
            'expires': new Date(new Date().getTime() + data.tokenExpiryTTL),
            'status': 'active',
            'ts': new Date().getTime(),
            'service': data.service,
        }
    };

    if (data.email) {
        s.$set.email = data.email;
    }

    let condition = {
        'userId': data.userId,
        'service': data.service,
        'status': data.status
    };
    let extraOptions = {
        'upsert': true,
        'safe': true
    };
    __self.mongoCore.updateOne(colName, condition, s, extraOptions, (err, record) => {
        if (!record || (record && !(record.nModified || record.upserted))) {
            let error = new Error("Token: token for [" + data.service + "] was not created.");
            return cb(error);
        }
        return cb(err, {'token': token, 'ttl': data.tokenExpiryTTL});
        /*
        { n: 1,
          nModified: 0,
          upserted: [ { index: 0, _id: 5ea87612833ccbfae71675f3 } ],
          ok: 1 }
         */
        /*
        if (!record) {
            let error = new Error("Token: token for [" + data.service + "] was not created.");
            return cb(error);
        }
        return cb(err, {'token': token, 'ttl': data.tokenExpiryTTL});
        */
    });
};

Token.prototype.get = function (data, cb) {
    let __self = this;
    if (!data || !data.token || !(data.service || (data.services && Array.isArray(data.services)))) {
        let error = new Error("Token: token, and what service(s) are required.");
        return cb(error, null);
    }
    let condition = {
        'token': data.token,
        'status': data.status
    };

    //At this point service or services are available
    if (data.service) {
        condition.service = data.service;
    }
    else {
        condition.service = {'$in': data.services};
    }

    __self.mongoCore.findOne(colName, condition, null, (err, record) => {
        return cb(err, record);
    });
};

Token.prototype.list = function (data, cb) {
    let __self = this;

    __self.mongoCore.find(colName, null, null, (err, record) => {
        return cb(err, record);
    });
};

Token.prototype.closeConnection = function () {
    let __self = this;

    if (!__self.mongoCoreExternal) {
        __self.mongoCore.closeDb();
    }
};

module.exports = Token;