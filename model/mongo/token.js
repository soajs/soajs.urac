"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

const colName = "tokens";
const core = require("soajs");
const Mongo = core.mongo;
const {v4: uuidv4} = require('uuid');

let indexing = {};

let build_options = (data) => {
    let options = {
        "skip": 0,
        "limit": 100
    };
    options.sort = {"ts": 1};
    if (data.limit) {
        options.limit = data.limit;
    }
    if (data.start) {
        options.skip = data.start;
    }
    return options;
};

function Token(soajs, localConfig, mongoCore) {
    let __self = this;
    __self.keepConnectionAlive = false;
    if (mongoCore) {
        __self.mongoCore = mongoCore;
        __self.mongoCoreExternal = true;
    }
    if (!__self.mongoCore) {
        __self.mongoCoreExternal = false;
        let tCode = soajs.tenant.code;
        if (soajs.tenant.main && soajs.tenant.main.code) {
            tCode = soajs.tenant.main.code;
        }
        let masterCode = get(["registry", "custom", "urac", "value", "masterCode"], soajs);
        if (masterCode) {
            tCode = masterCode;
        } else {
            let dbCodes = get(["registry", "custom", "urac", "value", "dbCodes"], soajs);
            if (dbCodes) {
                for (let c in dbCodes) {
                    if (dbCodes.hasOwnProperty(c)) {
                        if (dbCodes[c].includes(tCode)) {
                            tCode = c;
                            break;
                        }
                    }
                }
            }
        }
        __self.mongoCore = new Mongo(soajs.meta.tenantDB(soajs.registry.tenantMetaDB, localConfig.serviceName, tCode));

        __self.indexCount = 0;
        __self.counter = 0;
        if (indexing && tCode && !indexing[tCode]) {
            indexing[tCode] = true;

            let indexes = [
                {
                    "col": colName, "i": {
                        'userId': 1,
                        'service': 1,
                        'status': 1
                    }, "o": {}
                },
                {
                    "col": colName, "i": {
                        'token': 1,
                        'service': 1,
                        'status': 1
                    }, "o": {}
                }
            ];
            __self.indexCount = indexes.length;
            indexing._len = indexes.length;

            for (let i = 0; i < indexes.length; i++) {
                __self.mongoCore.createIndex(indexes[i].col, indexes[i].i, indexes[i].o, (err, index) => {
                    soajs.log.debug("Index: " + index + " created with error: " + err);
                    __self.counter++;
                });
            }

            soajs.log.debug("Token: Indexes for " + tCode + " Updated!");
        }
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
        'upsert': false
    };

    __self.mongoCore.updateOne(colName, condition, s, extraOptions, (err, record) => {
        if (!record || (record && !record.nModified)) {
            let error = new Error("Token: status for token [" + data.token + "] was not update.");
            return cb(error);
        }
        return cb(err, record.nModified);
    });
};

Token.prototype.addInvite = function (data, cb) {
    let __self = this;
    if (!data || !(data.email || data.phone) || !data.service || !data.tokenExpiryTTL) {
        let error = new Error("Token: tokenExpiryTTL, (email or phone), and what service are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {
            'userId': data.email,
            'email': data.email,
            'phone': data.phone,
            'confirmation': data.confirmation,
            'expires': new Date(new Date().getTime() + data.tokenExpiryTTL),
            'status': 'active',
            'ts': new Date().getTime(),
            'service': data.service,
        }
    };
    if (data.code) {
        s.$set.token = "" + Math.floor(100000 + Math.random() * 900000);
    } else {
        const token = uuidv4();
        s.$set.token = token;
    }
    if (data.firstName) {
        s.$set.firstName = data.firstName;
    }
    if (data.lastName) {
        s.$set.lastName = data.lastName;
    }
    if (data.inviteToken) {
        s.$set.inviteToken = data.inviteToken;
    }

    let condition = {
        'userId': data.email,
        'service': data.service
    };
    let extraOptions = {
        'upsert': true
    };
    __self.mongoCore.updateOne(colName, condition, s, extraOptions, (err, record) => {
        if (!record || (record && !(record.nModified || record.upsertedCount))) {
            let error = new Error("Token: token for [" + data.service + "] was not created.");
            return cb(error);
        }
        if (data.code) {
            return cb(err, {'code': s.$set.token, 'ttl': data.tokenExpiryTTL});
        } else {
            return cb(err, {'token': s.$set.token, 'ttl': data.tokenExpiryTTL});
        }
    });
};

Token.prototype.add = function (data, cb) {
    let __self = this;
    if (!data || !data.userId || !data.username || !data.service || !data.tokenExpiryTTL) {
        let error = new Error("Token: tokenExpiryTTL, userId, username, and what service are required.");
        return cb(error, null);
    }
    let s = {
        '$set': {
            'userId': data.userId,
            'username': data.username,
            'expires': new Date(new Date().getTime() + data.tokenExpiryTTL),
            'status': 'active',
            'ts': new Date().getTime(),
            'service': data.service,
        }
    };
    if (data.code) {
        s.$set.token = Math.floor(100000 + Math.random() * 900000).toString();
    } else {
        const token = uuidv4();
        s.$set.token = token;
    }
    if (data.email) {
        s.$set.email = data.email;
    }
    if (data.phone) {
        s.$set.phone = data.phone;
    }

    let condition = {
        'userId': data.userId,
        'service': data.service
    };
    let extraOptions = {
        'upsert': true
    };
    __self.mongoCore.updateOne(colName, condition, s, extraOptions, (err, record) => {
        if (!record || (record && !(record.nModified || record.upsertedCount))) {
            let error = new Error("Token: token for [" + data.service + "] was not created.");
            return cb(error);
        }
        if (data.code) {
            return cb(err, {'code': s.$set.token, 'ttl': data.tokenExpiryTTL});
        } else {
            return cb(err, {'token': s.$set.token, 'ttl': data.tokenExpiryTTL});
        }
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
    } else {
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

Token.prototype.search = function (data, cb) {
    let __self = this;
    if (!data || !data.service) {
        let error = new Error("Token: service is required.");
        return cb(error, null);
    }
    let options = build_options(data);
    let condition = {
        "service": data.service
    };
    __self.mongoCore.find(colName, condition, options, (error, response) => {
        if (error) {
            return cb(error);
        } else {
            __self.count(data, condition, colName, (error, count) => {
                if (error) {
                    return cb(error);
                } else {
                    return cb(null, {
                        "count": count,
                        "limit": options.limit,
                        "start": options.skip,
                        "items": response
                    });
                }
            });
        }
    });
};

Token.prototype.count = function (data, condition, col, cb) {
    let __self = this;

    let options = {};
    __self.mongoCore.countDocuments(col, condition, options, cb);

};

Token.prototype.closeConnection = function (count) {
    let __self = this;
    count = count || 1;
    if (!__self.mongoCoreExternal) {
        if (__self.mongoCore) {
            if (__self.counter >= __self.indexCount || count > indexing._len) {
                if (!__self.keepConnectionAlive) {
                    __self.mongoCore.closeDb();
                }
            } else {
                count++;
                __self.closeConnection(count);
            }
        }
    }
};

module.exports = Token;
