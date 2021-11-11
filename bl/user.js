'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const get = (p, o) => p.reduce((xs, x) => (xs && xs[x]) ? xs[x] : null, o);

const lib = {
    "pwd": require("../lib/pwd.js")
};

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
        return !!response;
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
    "countUser": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.username = inputmaskData.username;
        data.email = inputmaskData.email;
        data.exclude_id = inputmaskData.exclude_id || null;
        modelObj.checkUsername(data, (err, count) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, bl.handleUpdateResponse(count));
        });
    },
    "countUsers": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.keywords = inputmaskData.keywords;
        data.tenant = soajs.tenant;
        data.scope = inputmaskData.scope || null;
        modelObj.countUsers(data, (err, count) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, count);
        });
    },

    "getUserTenants": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let data = {};
        if (soajs && soajs.urac && soajs.urac._id) {
            data.id = soajs.urac._id;
        } else {
            return cb(bl.handleError(soajs, 520, null));
        }
        data.keep = {"allowedTenants": true};

        let modelObj = bl.mt.getModel(soajs, options);
        modelObj.getUser(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            if (!record) {
                return cb(bl.handleError(soajs, 520, err));
            }
            return cb(null, {
                "tenant": record.tenant || null,
                "groups": record.groups || null,
                "allowedTenants": (record.config ? record.config.allowedTenants || null : null)
            });
        });
    },

    "getUser": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.id = inputmaskData.id;
        if (!inputmaskData.ignoreStatus) {
            data.status = inputmaskData.status || "active";
        }
        data.keep = inputmaskData.keep;

        modelObj.getUser(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            if (!record) {
                return cb(bl.handleError(soajs, 520, err));
            }
            return cb(null, record);
        });
    },
    "getUserByUsername": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.username = inputmaskData.username;
        //data.status = inputmaskData.status || "active";

        data.keep = inputmaskData.keep;

        modelObj.getUserByUsername(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            if (!record) {
                return cb(bl.handleError(soajs, 520, err));
            }
            return cb(null, record);
        });
    },
    "getUsers": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.start = inputmaskData.start;
        data.limit = inputmaskData.limit;
        data.keywords = inputmaskData.keywords;
        data.config = inputmaskData.config;
        data.tenant = soajs.tenant;
        data.scope = inputmaskData.scope || null;
        if (inputmaskData.status) {
            data.status = inputmaskData.status;
        }
        modelObj.getUsers(data, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, records);
        });
    },
    "getUsersBasicInfo": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.skip = inputmaskData.skip;
        data.limit = inputmaskData.limit;
        data.keywords = inputmaskData.keywords;
        data.tenant = soajs.tenant;
        if (inputmaskData.status) {
            data.status = inputmaskData.status;
        }
        modelObj.getUsersBasicInfo(data, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, records);
        });
    },

    "getUsersByIds": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.start = inputmaskData.start;
        data.limit = inputmaskData.limit;
        data.ids = inputmaskData.ids;
        data.config = inputmaskData.config;
        modelObj.getUsersByIds(data, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, records);
        });
    },

    "cleanDeletedGroup": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.groupCode = inputmaskData.groupCode;
        data.tenant = soajs.tenant;
        modelObj.cleanDeletedGroup(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    },

    "updateStatus": (soajs, inputmaskData, options, cb) => {
        inputmaskData = inputmaskData || {};
        inputmaskData.what = 'status';
        bl.updateOneField(soajs, inputmaskData, options, cb);
    },

    "updateOneField": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData || !inputmaskData.what) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.id = inputmaskData.id || null;
        data._id = inputmaskData._id || null;
        data.what = inputmaskData.what;
        data[inputmaskData.what] = inputmaskData[inputmaskData.what];
        if (inputmaskData.status && inputmaskData.what !== "status") {
            data.status = inputmaskData.status;
        }
        modelObj.updateOneField(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                if (err.message && err.message.match("was not update")) {
                    return cb(bl.handleError(soajs, 533, null));
                }
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, bl.handleUpdateResponse(record));
        });
    },

    "add": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }

        inputmaskData.password = inputmaskData.password || Math.random().toString(36).slice(-10);
        let encryptionConfig = {};
        if (soajs.servicesConfig && soajs.servicesConfig.hashIterations) {
            encryptionConfig.hashIterations = soajs.servicesConfig.hashIterations;
        } else {
            let hashIterations = get(["registry", "custom", "urac", "value", "hashIterations"], soajs);
            if (hashIterations) {
                encryptionConfig.hashIterations = hashIterations;
            }
        }
        if (soajs.servicesConfig && soajs.servicesConfig.optionalAlgorithm) {
            encryptionConfig.optionalAlgorithm = soajs.servicesConfig.optionalAlgorithm;
        } else {
            let optionalAlgorithm = get(["registry", "custom", "urac", "value", "optionalAlgorithm"], soajs);
            if (optionalAlgorithm) {
                encryptionConfig.optionalAlgorithm = optionalAlgorithm;
            }
        }
        lib.pwd.encrypt(encryptionConfig, inputmaskData.password, bl.localConfig, (err, pwdEncrypted) => {
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            let modelObj = bl.mt.getModel(soajs, options);

            let data = {};
            data.username = inputmaskData.username;
            data.firstName = inputmaskData.firstName;
            data.lastName = inputmaskData.lastName;
            data.email = inputmaskData.email;

            data.password = pwdEncrypted;
            data.status = inputmaskData.status;

            data.profile = inputmaskData.profile;
            data.groups = inputmaskData.groups;
            data.config = inputmaskData.config;

            data.tenant = inputmaskData.tenant;
            data.ln = inputmaskData.ln || null;
            data.phone = inputmaskData.phone || null;

            modelObj.add(data, (err, record) => {
                bl.mt.closeModel(modelObj);
                if (err) {
                    return cb(bl.handleError(soajs, 602, err));
                }
                record.password = inputmaskData.password;
                return cb(null, record);
            });

        });
    },

    "edit": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }

        let modelObj = bl.mt.getModel(soajs, options);

        let data = {};
        data.id = inputmaskData.id;
        data._id = inputmaskData._id;
        data.username = inputmaskData.username;
        data.firstName = inputmaskData.firstName;
        data.lastName = inputmaskData.lastName;
        data.email = inputmaskData.email;

        data.profile = inputmaskData.profile;
        data.groups = inputmaskData.groups;
        data.status = inputmaskData.status;
        data.ln = inputmaskData.ln || null;
        data.phone = inputmaskData.phone || null;

        modelObj.edit(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            if (!record) {
                return cb(bl.handleError(soajs, 533, null));
            }
            return cb(null, bl.handleUpdateResponse(record));
        });
    },

    "resetPassword": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let encryptionConfig = {};
        if (soajs.servicesConfig && soajs.servicesConfig.hashIterations) {
            encryptionConfig.hashIterations = soajs.servicesConfig.hashIterations;
        } else {
            let hashIterations = get(["registry", "custom", "urac", "value", "hashIterations"], soajs);
            if (hashIterations) {
                encryptionConfig.hashIterations = hashIterations;
            }
        }
        if (soajs.servicesConfig && soajs.servicesConfig.optionalAlgorithm) {
            encryptionConfig.optionalAlgorithm = soajs.servicesConfig.optionalAlgorithm;
        } else {
            let optionalAlgorithm = get(["registry", "custom", "urac", "value", "optionalAlgorithm"], soajs);
            if (optionalAlgorithm) {
                encryptionConfig.optionalAlgorithm = optionalAlgorithm;
            }
        }
        lib.pwd.encrypt(encryptionConfig, inputmaskData.password, bl.localConfig, (err, pwdEncrypted) => {
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }

            let data = {};
            data._id = inputmaskData._id;
            data.what = 'password';
            data.password = pwdEncrypted;
            //we always set status to active in case of addUser to activate the user
            data.status = 'active';
            bl.updateOneField(soajs, data, options, cb);
        });
    },

    "uninvite": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }

        let modelObj = bl.mt.getModel(soajs, options);

        let data = {};
        data.user = inputmaskData.user;
        data.tenant = soajs.tenant;
        //data.status = 'active';
        modelObj.uninvite(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    },

    "editGroups": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }

        let modelObj = bl.mt.getModel(soajs, options);

        let data = {};
        data.user = inputmaskData.user;
        data.tenant = soajs.tenant;
        //data.status = 'active';
        data.groups = inputmaskData.groups;

        modelObj.editGroups(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, bl.handleUpdateResponse(record));
        });
    },

    "delete": (soajs, inputmaskData, options, cb) => {
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
};

module.exports = bl;