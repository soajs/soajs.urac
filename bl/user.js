'use strict';

const lib = {
    "pwd": require("../lib/pwd.js")
};

let bl = {
    "model": null,
    "soajs_service": null,
    "localConfig": null,

    "handleError": (soajs, errCode, err) => {
        if (err) {
            soajs.log.error(err);
        }
        return ({
            "code": errCode,
            "msg": bl.localConfig.errors[errCode] + ((err && errCode === 602) ? err.message : "")
        });
    },

    "mt": {
        "getModel": (soajs, options) => {
            let mongoCore = null;
            if (options && options.mongoCore)
                mongoCore = options.mongoCore;
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
        modelObj.checkUsername(data, (err, count) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, (count > 0));
        });
    },
    "countUsers": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.keywords = inputmaskData.keywords;
        modelObj.countUsers(data, (err, count) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, count);
        });
    },
    "getUser": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.id = inputmaskData.uId;
        data.status = inputmaskData.status;
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
        data.id = inputmaskData.username;
        data.status = "active";
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
        modelObj.getUsers(data, (err, records) => {
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
        data.uIds = inputmaskData.uIds;
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
        data.tId = inputmaskData.tId;
        data.groupCode = inputmaskData.groupCode;
        data.tenant = soajs.tenant;
        modelObj.cleanDeleteGroup(data, (err, record) => {
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
    /*
        "updateEmail": (soajs, inputmaskData, options, cb) => {
            if (!inputmaskData) {
                return cb(bl.handleError(soajs, 400, null));
            }
            let modelObj = bl.mt.getModel(soajs, options);
            let data = {};
            data.id = inputmaskData.id;
            data._id = inputmaskData._id;
            data.what = "email";
            data.email = inputmaskData.email;
            modelObj.updateOneField(data, (err, record) => {
                bl.mt.closeModel(modelObj);
                if (err) {
                    return cb(bl.handleError(soajs, 602, err));
                }
                return cb(null, record);
            });
        },
    */
    "updateOneField": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData && !inputmaskData.what) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.id = inputmaskData.id || inputmaskData.uId;
        data._id = inputmaskData._id;
        data.what = inputmaskData.what;
        data[inputmaskData.what] = inputmaskData[inputmaskData.what];
        modelObj.updateOneField(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    },

    "join": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }

        lib.pwd.encrypt(soajs.servicesConfig, inputmaskData.password, bl.localConfig, (err, pwdEncrypted) => {
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            let modelObj = bl.mt.getModel(soajs, options);

            let data = {};
            data.username = inputmaskData.username;
            data.firstName = inputmaskData.firstName;
            data.lastName = inputmaskData.lastName;
            data.email = inputmaskData.email;

            let requireValidation = true;
            if (soajs.servicesConfig.urac) {
                if (Object.hasOwnProperty.call(soajs.servicesConfig.urac, 'validateJoin')) {
                    requireValidation = soajs.servicesConfig.urac.validateJoin;
                }
            }
            data.status = (requireValidation) ? 'pendingJoin' : 'active';

            data.tId = soajs.tenant.id;
            data.tCode = soajs.tenant.code;
            data.password = pwdEncrypted;
            modelObj.add(data, (err, record) => {
                bl.mt.closeModel(modelObj);
                if (err) {
                    return cb(bl.handleError(soajs, 602, err));
                }
                return cb(null, record);
            });

        });
    }
};

module.exports = bl;