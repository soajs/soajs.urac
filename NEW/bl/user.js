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
    }


};

module.exports = bl;