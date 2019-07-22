"use strict";

let bl = {
    "list": (soajs, inputmaskData, modelObj, cb) => { //Check if needed
        //Pagination

        let data = {};

        data.pagination.skip = inputmaskData.start;
        data.pagination.limit = inputmaskData.limit;

        modelObj.countTokens(data, (err, records) => {
            if (err) {
                soajs.log.error(err);
                return cb({
                    "code": 407,
                    "msg": soajs.config.errors[407]
                });
            }
            modelObj.getTokens(data, (err, records) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 418,
                        "msg": soajs.config.errors[418]
                    });
                }
                return cb(null, records);
            });
            return cb(null, records);
        });
    },

    "find": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};

    }, // Check if needed

    "delete": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.id = inputmaskData.tId;

        modelObj.validateId(data, (err) => {
            if (err) {
                soajs.log.error(err);
                return cb({
                    "code": 413,
                    "msg": soajs.config.errors[413]
                });
            }
            modelObj.getToken(data, (err) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 418,
                        "msg": soajs.config.errors[418]
                    });
                }
                modelObj.deleteToken(data, (err, record) => {
                    if (err) {
                        soajs.log.error(err);
                        return cb({
                            "code": 420,
                            "msg": soajs.config.errors[420]
                        });
                    }
                    return cb(null, record);
                });
            });
        });
    },

    "edit": (soajs, inputmaskData, modelObj, cb) => {

    }, // Check if needed

    "add": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.token= inputmaskData.token;
        data.expires= inputmaskData.expires;
        data.status= inputmaskData.status;
        data.ts= inputmaskData.ts;
        data.service= inputmaskData.service;
        data.username= inputmaskData.username;

        modelObj.addToken(data, (err, record) => {
           if (err) {
               soajs.log.error(err);
               // return cb({
               //     "code": 418,
               //     "msg": soajs.config.errors[418]
               // }); Need to check error
           }
           return cb(null, record);
        });
    }, // Check if needed
}

module.exports = bl;
