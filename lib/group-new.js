"use strict";

let bl = {

    "list": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.tId = inputmaskData.tId;
        modelObj.getGroups(data, (err, records) => {
            if (err) {
                soajs.log.error(err);
                return cb({"code": 415, "msg": soajs.config.errors[415] + " - " + err.message});
            }
            return cb(null, records);
        });
    },


    "addEnvironment": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.allowedEnvironments = inputmaskData.allowedEnvironments;
        data.groups = inputmaskData.groups;
        modelObj.addAllowedEnvironments(data, (err, records) => {
            if (err) {
                soajs.log.error(err);
                return cb({"code": 400, "msg": soajs.config.errors[400] + " - " + err.message});
            }
            return cb(null, records);
        });
    },

    "find": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.id = inputmaskData.id;
        modelObj.getGroup(data, (err, record) => {
            if (err) {
                soajs.log.error(err);
                return cb({"code": 415, "msg": soajs.config.errors[415] + " - " + err.message});
            }
            return cb(null, record);
        });
    }

};


module.exports = bl;