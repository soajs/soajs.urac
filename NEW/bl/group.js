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
            "msg": bl.localConfig.errors[errCode]
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
        data.tId = inputmaskData.tId;
        modelObj.getGroups(data, (err, records) => {
            bl.mt.closeModel(modelObj);
            if (err) {
                return cb (bl.handleError(soajs, 415, err));
            }
            return cb(null, records);
        });
    }

};

module.exports = bl;