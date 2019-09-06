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
            "msg": bl.localConfig.errors[errCode] + (errCode === 602 ? err.message : "")
        });
    },


    "mt": {
        "getModel": (soajs, mongoCore) => {
            let modelObj = new bl.model(soajs, mongoCore);
            return modelObj;
        },
        "closeModel": (modelObj) => {
            modelObj.closeConnection();
        }
    },

    "getUser": (soajs, inputmaskData, cb) => {
        let modelObj = bl.mt.getModel(soajs);
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        modelObj.getUser(inputmaskData, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            if (!records) {
                return cb(bl.handleError(soajs, 500, err));
            }
            return cb(null, records);
        });
    },

    "getUsers": (soajs, inputmaskData, cb) => {
        let modelObj = bl.mt.getModel(soajs);
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        modelObj.getUsers(inputmaskData, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            return cb(null, records);
        });
    },

    "countUser": (soajs, inputmaskData, cb) => {
        let modelObj = bl.mt.getModel(soajs);
        if (!inputmaskData) {
            return cb(bl.handleError(soajs, 400, null));
        }
        modelObj.countUser(inputmaskData, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb(bl.handleError(soajs, 602, err));
            }
            if (!records || records.length < 1)
                return cb(null, false);
            else
                return cb(null, true);
        });
    }
};

module.exports = bl;