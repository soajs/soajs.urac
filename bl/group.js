'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

let bl = {
    "model": null,
    "localConfig": null,

    "handleError": (soajs, errCode, err) => {
        if (err) {
            soajs.log.error(err.message);
        }
        return ({
            "code": errCode,
            "msg": bl.localConfig.errors[errCode] + ((err && errCode === 602) ? err.message : "")
        });
    },
    "handleUpdateResponse": (response) => {
        if (response) {
            return true;
        } else {
            return false;
        }
    },
    "mt": {
        "getModel": (soajs, options) => {
            let mongoCore = null;
            if (options && options.mongoCore) {
                mongoCore = options.mongoCore;
            }
            return new bl.model(soajs, bl.localConfig, mongoCore);
        },
        "closeModel": (modelObj) => {
            modelObj.closeConnection();
        }
    },

    "getGroups": (soajs, inputmaskData, options, cb) => {
        let modelObj = bl.mt.getModel(soajs, options);
        modelObj.getGroups(inputmaskData, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, records);
        });
    },

    "getGroup": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.id = inputmaskData.id;
        data.code = inputmaskData.code;
        modelObj.getGroup(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            if (!record) {
                return cb(bl.handleError(soajs, 420, err));
            }
            return cb(null, record);
        });
    },

    "add": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.name = inputmaskData.name;
        data.description = inputmaskData.description;
        data.environments = inputmaskData.environments;
        data.packages = inputmaskData.packages;
        data.code = inputmaskData.code;
        data.locked = inputmaskData.locked || null;
        data.tId = soajs.tenant.id;
        data.tCode = soajs.tenant.code;
        if (inputmaskData.tenant) {
            data.tId = inputmaskData.tenant.id || data.tId;
            data.tCode = inputmaskData.tenant.code || data.tCode;
        }
        modelObj.add(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    },

    "add_multiple": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let data = [];
        for (let i = 0; i < inputmaskData.groups.length; i++) {
            let record = {
                "code": inputmaskData.groups[i].code,
                "name": inputmaskData.groups[i].name,
                "description": inputmaskData.groups[i].description
            };
            if (inputmaskData.groups[i].locked) {
                record.locked = inputmaskData.groups[i].locked;
            }
            if (inputmaskData.tenant) {
                record.tenant = {
                    "id": inputmaskData.tenant.id,
                    "code": inputmaskData.tenant.code
                };
            } else if (soajs.tenant) {
                record.tenant = {
                    "id": soajs.tenant.id,
                    "code": soajs.tenant.code
                };
            }
            record.config = {
                "allowedPackages": {}
            };
            if (inputmaskData.groups[i].packages) {
                for (let j = 0; j < inputmaskData.groups[i].packages.length; j++) {
                    let prodPack = inputmaskData.groups[i].packages[j];
                    record.config.allowedPackages[prodPack.product] = prodPack.packages;
                }
            }
            data.push(record);
        }
        if (inputmaskData.tenant) {
            soajs.tenant = inputmaskData.tenant;
        }
        let modelObj = bl.mt.getModel(soajs, options);
        modelObj.add_multiple(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                if (err.message.indexOf("duplicate key") === -1) {
                    return cb(bl.handleError(soajs, 602, err));
                }
            }
            return cb(null, record);
        });
    },

    "deleteGroups": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.ids = inputmaskData.ids;
        data.tenantId = inputmaskData.tenant.id;
        modelObj.deleteMany(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    },

    "deleteGroup": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.id = inputmaskData.id;
        modelObj.delete(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    },

    "edit": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.id = inputmaskData.id;
        data.name = inputmaskData.name;
        data.description = inputmaskData.description;
        data.environments = inputmaskData.environments;
        data.packages = inputmaskData.packages;

        modelObj.edit(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, bl.handleUpdateResponse(record));
        });
    },

    "updateEnvironments": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.environments = inputmaskData.environments;
        data.groups = inputmaskData.groups;
        modelObj.updateEnvironments(data, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, bl.handleUpdateResponse(records));
        });
    },

    "updatePackages": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.packages = inputmaskData.packages;
        data.groups = inputmaskData.groups;
        modelObj.updatePackages(data, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, bl.handleUpdateResponse(records));
        });
    }

};

module.exports = bl;
