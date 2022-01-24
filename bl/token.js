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
    "addInvite": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.phone = inputmaskData.phone;
        data.email = inputmaskData.email;
        data.membership = inputmaskData.membership || null;
        data.confirmation = inputmaskData.confirmation;
        data.service = inputmaskData.service;
        data.code = inputmaskData.code || false;
        data.inviteToken = inputmaskData.inviteToken || null;
        data.status = 'active';

        if (inputmaskData.firstName) {
            data.firstName = inputmaskData.firstName;
        }
        if (inputmaskData.lastName) {
            data.lastName = inputmaskData.lastName;
        }

        if (soajs.servicesConfig && soajs.servicesConfig.urac && soajs.servicesConfig.urac.tokenExpiryTTL) {
            data.tokenExpiryTTL = soajs.servicesConfig.urac.tokenExpiryTTL;
        } else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.tokenExpiryTTL) {
            data.tokenExpiryTTL = soajs.registry.custom.urac.value.tokenExpiryTTL;
        } else {
            data.tokenExpiryTTL = 2 * 24 * 3600000;
        }

        modelObj.addInvite(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
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
        data.userId = inputmaskData.userId;
        data.username = inputmaskData.username;
        data.service = inputmaskData.service;
        data.code = inputmaskData.code || false;
        data.status = 'active';

        if (inputmaskData.email) {
            data.email = inputmaskData.email;
        }
        if (inputmaskData.phone) {
            data.phone = inputmaskData.phone;
        }

        if (soajs.servicesConfig && soajs.servicesConfig.urac && soajs.servicesConfig.urac.tokenExpiryTTL) {
            data.tokenExpiryTTL = soajs.servicesConfig.urac.tokenExpiryTTL;
        } else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.tokenExpiryTTL) {
            data.tokenExpiryTTL = soajs.registry.custom.urac.value.tokenExpiryTTL;
        } else {
            data.tokenExpiryTTL = 2 * 24 * 3600000;
        }

        modelObj.add(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    },
    "get": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.token = inputmaskData.token;
        data.service = inputmaskData.service;
        data.services = inputmaskData.services;
        data.status = 'active';
        modelObj.get(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            if (!record) {
                return cb(bl.handleError(soajs, 600, err));
            }
            //check if token expired
            if (new Date(record.expires).getTime() < new Date().getTime()) {
                return cb(bl.handleError(soajs, 599, err));
            }
            return cb(null, record);
        });
    },
    "updateStatus": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.token = inputmaskData.token;
        data.status = inputmaskData.status;
        modelObj.updateStatus(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    },
    "search": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        modelObj.search(inputmaskData, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    }
};

module.exports = bl;
