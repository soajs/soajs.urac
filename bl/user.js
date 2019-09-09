'use strict';

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
    "countUser": (soajs, inputmaskData, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs);
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
    "countUsers": (soajs, inputmaskData, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs);
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
    "getUser": (soajs, inputmaskData, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs);
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
    "getUsers": (soajs, inputmaskData, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs);
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

    "getUsersByIds": (soajs, inputmaskData, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs);
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

    "cleanDeletedGroup": (soajs, inputmaskData, cb) => {
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        let modelObj = bl.mt.getModel(soajs);
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
    }
};

module.exports = bl;