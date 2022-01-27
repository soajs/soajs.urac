"use strict";

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const colName = "template";
const core = require("soajs");
const Mongo = core.mongo;

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);
let indexing = {};

function Template(soajs, localConfig, mongoCore) {
    let __self = this;
    __self.keepConnectionAlive = false;
    if (mongoCore) {
        __self.mongoCore = mongoCore;
        __self.mongoCoreExternal = true;
    }
    if (!__self.mongoCore) {
        __self.mongoCoreExternal = false;
        let tCode = soajs.tenant.code;

        let masterDB = get(["registry", "custom", "urac", "value", "masterDB"], soajs);
        if (masterDB) {
            if (!soajs.registry.coreDB[masterDB]) {
                soajs.log.error("Template: Unable to find [" + masterDB + "] db configuration under registry.");
            }
            tCode = masterDB;
            __self.mongoCore = new Mongo(soajs.registry.coreDB[masterDB]);
        } else {
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
        }
        __self.indexCount = 0;
        __self.counter = 0;
        if (indexing && tCode && !indexing[tCode]) {
            indexing[tCode] = true;

            let indexes = [];
            __self.indexCount = indexes.length;
            indexing._len = indexes.length;

            for (let i = 0; i < indexes.length; i++) {
                __self.mongoCore.createIndex(indexes[i].col, indexes[i].i, indexes[i].o, (err, index) => {
                    soajs.log.debug("Index: " + index + " created with error: " + err);
                    __self.counter++;
                });
            }

            soajs.log.debug("Template: Indexes for " + tCode + " Updated!");
        }
    }
}

Template.prototype.get = function (data, cb) {
    let __self = this;
    if (!data || !data.name || !data.status) {
        let error = new Error("Template: name and status are required.");
        return cb(error, null);
    }
    let condition = {
        'name': data.name,
        'status': data.status
    };

    __self.mongoCore.findOne(colName, condition, null, (err, record) => {
        return cb(err, record);
    });
};

Template.prototype.closeConnection = function (count) {
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

module.exports = Template;
