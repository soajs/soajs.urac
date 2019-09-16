'use strict';

const lib = {
    "pwd": require("../lib/pwd.js")
};

let bl = {
    "model": null,
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
        data.exclude_id = inputmaskData.exclude_id || null;
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
        data.id = inputmaskData.id;
        data.status = inputmaskData.status || "active";
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
        data.status = inputmaskData.status || "active";
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

    "updateOneField": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData && !inputmaskData.what) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs, options);
        let data = {};
        data.id = inputmaskData.id || null;
        data._id = inputmaskData._id || null;
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

    "add": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }

        inputmaskData.password = inputmaskData.password || Math.random().toString(36).slice(-10);

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

            data.password = pwdEncrypted;
            data.status = inputmaskData.status;

            data.profile = inputmaskData.profile;
            data.groups = inputmaskData.groups;
            data.config = inputmaskData.config;

            data.tenant = inputmaskData.tenant;

            modelObj.add(data, (err, record) => {
                bl.mt.closeModel(modelObj);
                if (err) {
                    return cb(bl.handleError(soajs, 602, err));
                }
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

        modelObj.edit(data, (err, record) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, record);
        });
    },

    "resetPassword": (soajs, inputmaskData, options, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }

        lib.pwd.encrypt(soajs.servicesConfig, inputmaskData.password, bl.localConfig, (err, pwdEncrypted) => {
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
    }
};

module.exports = bl;