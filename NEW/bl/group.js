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

    "list": (soajs, inputmaskData, cb) => {
        let modelObj = bl.mt.getModel(soajs);
        let data = {};
        if (!inputmaskData){
            return cb(bl.handleError(soajs, 400, null));
        }
        modelObj.getGroups(inputmaskData, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb (bl.handleError(soajs, 602, err));
            }
            return cb(null, records);
        });
    }

};

module.exports = bl;