"use strict";


let bl = {

    "list": (soajs, inputmaskData, model, cb) => {
        let modelObj = new model (soajs);
        let data = {};
        data.tId = inputmaskData.tId;
        modelObj.getGroups(data, (err, records) => {
            modelObj.closeConnection();
            if (err) {
                soajs.log.error(err);
                return cb({"code": 415, "msg": soajs.config.errors[415] + " - " + err.message});
            }
            return cb(null, records);
        })
    }

};


module.exports = bl;