"use strict";


let bl = {

    "list": (soajs, model, cb) => {
        let modelObj = new model (soajs);
        let data = {};
        data.tId = soajs.inputmaskData.tId;
        modelObj.getGroups(data, (error, records) => {
            modelObj.closeConnection();
            if (error)
                soajs.log.error(error);
            return cb(error, records);
        })
    }

};


module.exports = bl;