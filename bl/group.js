"use strict";

let bl = {

    "list": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.tId = inputmaskData.tId;
        modelObj.getGroups(data, (err, records) => {
            if (err) {
                soajs.log.error(err);
                return cb({
                    "code": 415,
                    "msg": soajs.config.errors[415] + " - " + err.message
                });
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
                return cb({
                    "code": 400,
                    "msg": soajs.config.errors[400] + " - " + err.message
                });
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
                return cb({
                    "code": 415,
                    "msg": soajs.config.errors[415] + " - " + err.message
                });
            }
            return cb(null, record);
        });
    },

    "add": (soajs, inputmaskData, modelObj, cb) => {

        let data = {};
        data.name = inputmaskData.name;
        data.description = inputmaskData.description;
        data.config = inputmaskData.config;
        data.code = inputmaskData.code;

        let continueCreation = () => {
            modelObj.addGroup(data, (err, record) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 416,
                        "msg": soajs.config.errors[416] + " - " + err.message
                    });
                }
                return cb(null, record);
            });
        };

        if (inputmaskData.tId) {
            modelObj.validateId(data, (err, id) => {
                if (err) {
                    return cb({
                        "code": 611,
                        "msg": soajs.config.errors[611] + " - " + err.message
                    });
                }
                inputmaskData.tId = id;

                data.tId = inputmaskData.tId.toString();
                data.tCode = inputmaskData.tCode;

                continueCreation();
            })
        } else {
            continueCreation();
        }
    },

    "getGroup": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.id = inputmaskData.gId;
        data.code = inputmaskData.code;

        modelObj.validateId(data, (err) => {
            if (err) {
                return cb({
                    "code": 417,
                    "msg": soajs.config.errors[417]
                });
            }
            modelObj.getGroup(data, (err, record) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 474,
                        "msg": soajs.config.errors[474] + " - " + err.message
                    });
                }
                return cb(null, record);
            });
        });
    },

    "editGroup": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.id = inputmaskData.gId;

        data.name = inputmaskData.name;
        data.description = inputmaskData.description;
        data.config = inputmaskData.config;

        modelObj.validateId(data, (err) => {
            if (err) {
                return cb({
                    "code": 417,
                    "msg": soajs.config.errors[417]
                });
            }
            modelObj.editGroup(data, (err, record) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 431,
                        "msg": soajs.config.errors[431] + " - " + err.message
                    });
                }
                return cb(null, record);
            });
        });
    },

    "deleteGroup": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.id = inputmaskData.gId;
        modelObj.validateId(data, (err) => {
            if (err) {
                return cb({
                    "code": 417,
                    "msg": soajs.config.errors[417]
                });
            }
            modelObj.deleteGroup(data, (err, cb) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 419,
                        "msg": soajs.config.errors[419] + " - " + err.message
                    });
                }
            });
        });
    },

    // We should add a new API later on, and we will introduce a new API
    // "addPackages": (soajs, inputmaskData, modelObj, cb) => {
    //     //not found in Lib
    // }
};

module.exports = bl;
