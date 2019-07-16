"use strict";

let bl = {

    "getUser": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.id = inputmaskData.uId;

        modelObj.validateId((data, err) => {
            if (err) {
                return cb({
                    "code": 411,
                    "msg": soajs.config.errors[411]
                });
            }
            modelObj.getUser(data, (err, record) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 405,
                        "msg": soajs.config.errors[405] + " - " + err.message
                    });
                }
                return cb(null, record);
            });
        });
    },


    //Check token issues and password utils
    "addUser": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.firstName = inputmaskData.firstName;
        data.lastName = inputmaskData.lastName;
        data.username = inputmaskData.username;
        data.email = inputmaskData.email;
        data.password = inputmaskData.password;
        data.status = inputmaskData.status;
        //data.profile = inputmaskData.profile;
        //groups
        //tId

        // Check if User already exists and if not add user

        modelObj.checkIfExists((data, err) => {
            if (err) {
                return cb({
                    "code": 402,
                    "msg": soajs.config.errors[402]
                });
            }
            /*
            * Check if staus is active and password exists
            * Otherwise create a password randomly
            * Encrypt password
            */
            if (inputmaskData.profile) {
                data.profile = inputmaskData.profile;
            }
            if (inputmaskData.groups) {
                data.groups = inputmaskData.groups;
            }
            if (inputmaskData.tId) {
                modelObj.validateId(data, (err, record) => {
                    if (err) {
                        return cb({
                            "code": 611,
                            "msg": soajs.config.errors[611]
                        });
                    }
                    data.tId = inputmaskData.tId;
                    data.tCode = inputmaskData.tCode;

                    if (inputmaskData.pin) {
                        data.pin = inputmaskData.pin;
                    }
                    modelObj.addUser((data, err) => {
                        if (err) {
                            return cb({
                                "code": 414,
                                "msg": soajs.config.errors[414]
                            });
                        }
                        return cb(null, record);
                    });
                });
            }
            modelObj.addUser(data, (err, record) => {
                if (err) {
                    return cb({
                        "code": 414,
                        "msg": soajs.config.errors[414]
                    });
                }
                return cb(null, record);
            });
        });
    },


    // Implemented in utils
    "editUser": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.id = inputmaskData.uId;
        data.firstName = inputmaskData.firstName;
        data.lastName = inputmaskData.lastName;
        data.username = inputmaskData.username;
        data.email = inputmaskData.email;
        data.password = inputmaskData.password;

        if (!data.locked) {
            if (inputmaskData.config) {
                let configObj = inputmaskData.config;
                if (typeof (data.config) !== 'object') {
                    data.config = {};
                }
                if (configObj.packages) {
                    data.config.packages = configObj.packages;
                }
                if (configObj.keys) {
                    data.config.keys = configObj.keys;
                }
                if (configObj.allowedTenants) {
                    data.config.allowedTenants = configObj.allowedTenants;
                }
            }
            data.status = inputmaskData.status;
            if (inputmaskData.groups) {
                data.groups = inputmaskData.groups;
            } else {
                data.groups = [];
            }
        }


        if (inputmaskData.password && inputmaskData.password !== '') {
            // Utils Usage
            // data.password = utils.encryptPwd(soajs.servicesConfig.urac, inputmaskData.password., soajs.config);
        }
        if (inputmaskData.pin) {
            if (!data.tenant.pin) {
                data.tenant.pin = {};
            }
            if (inputmaskData.pin.code) {
                /* OLD CODE */
                // data.tenant.pin.code = makePin(req.soajs.config.pinCode.length);
            }
            if (inputmaskData.pin.hasOwnProperty('allowed')) {
                data.tenant.pin.allowed = inputmaskData.pin.allowed;
            }
        }

        if (inputmaskData.profile) {
            data.profile = inputmaskData.profile;
        }

        modelObj.validateId((data, err) => {
            if (err) {
                return cb({
                    "code": 411,
                    "msg": soajs.config.errors[411]
                });
            }
            modelObj.getUser(data, (err, record) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 405,
                        "msg": soajs.config.errors[405] + " - " + err.message
                    });
                }
                if (!soajs.tenant.locked) {
                    return cb({
                        "code": 500,
                        "msg": soajs.config.errors[500]
                    });
                }
                if (inputmaskData.groups && Array.isArray(inputmaskData.groups && inputmaskData.groups.length > 0)) {
                    if (data.tenant && data.tenant.id) {
                        modelObj.getUser((data, err) => {
                            if (err) {
                                return cb({
                                    "code": 404,
                                    "msg": soajs.config.errors[404]
                                });
                            }
                            modelObj.countUsers(data, (err, count) => {
                                if (err) {
                                    return cb({
                                        "code": 407,
                                        "msg": soajs.config.errors[407]
                                    });
                                }
                                if (count > 0) {
                                    return cb({
                                        "code": 410,
                                        "msg": soajs.config.errors[410]
                                    });
                                }
                                modelObj.editUser((data, err) => {
                                    if (err) {
                                        return cb({
                                            "code": 403,
                                            "msg": soajs.config.errors[403]
                                        });
                                    }
                                    return cb(null, record);
                                });
                            });
                        });
                    }
                }
                modelObj.editUser((data, err) => {
                    if (err) {
                        soajs.log.error(err);
                        return cb({
                            "code": 403,
                            "msg": soajs.config.errors[403] + " - " + err.message
                        });
                    }
                    return cb(null, record);
                });
            });
        });
    },

    "deleteUser": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};

        if (!inputmaskData.uId) {
            //must provide id
        }

        data.id = inputmaskData.uId;

        modelObj.validateId((data, err) => {
            if (err) {
                return cb({
                    "code": 411,
                    "msg": soajs.config.errors[411]
                });
            }
            modelObj.getUser(data, (err) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 405,
                        "msg": soajs.config.errors[405] + " - " + err.message
                    });
                }
                modelObj.deleteUser(data, (err, record) => {
                    if (err) {
                        soajs.log.error(err);
                        return cb({
                            "code": 421,
                            "msg": soajs.config.errors[421] + " - " + err.message
                        });
                    }
                    return cb(null, record);
                });
            });
        });
    },

    "inviteUser": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        if (!inputmaskData.username && !inputmaskData.email) {
            return cb({
                "code": 428,
                "msg": soajs.config.errors[428]
            });
        }
        if (inputmaskData.username) {
            data.username = inputmaskData.username;
        }

        if (inputmaskData.email) {
            data.email = inputmaskData.email;
        }

        modelObj.getUser(data, (err, record) => {
            if (err || !record) {
                soajs.log.error(err);
                return cb({
                    "code": 405,
                    "msg": soajs.config.errors[405] + " - " + err.message
                });
            }

            if (!soajs.tenant.locked && record.locked) {
                return cb({
                    "code": 500,
                    "msg": req.soajs.config.errors[500]
                });
            }
            if (!record.config) {
                record.config = {};
            }

            if (!record.config.allowedTenants) {
                record.config.allowedTenants = [];
            }

            let found = false;

            if (record.config.allowedTenants.length > 0) {
                record.config.allowedTenants.forEach((tenant) => {
                    if (tenant.tenant && tenant.tenant.id && tenant.tenant.id === inputmaskData.tId) {
                        found = true;
                    }
                });
            }
            if (found) {
                return cb({
                    "code": 429,
                    "msg": soajs.config.errors[429]
                });
            }

            let object = {
                tenant: {
                    id: inputmaskData.tId,
                    code: inputmaskData.tCode,
                    pin: {}
                }
            };

            if (inputmaskData.groups) {
                object.groups = inputmaskData.groups;
            }

            record.config.allowedTenants.push(object);

            modelObj.addUser(data, (err) => {
               if (err) {
                   return cb({
                       "code": 414,
                       "msg": soajs.config.errors[414]
                   });
               }
            });
            return cb(null, record);
        });
    },

    "inviteUsers": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.users = inputmaskData.users;
        // Invite multiple users
    },

    "inviteUserByID": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.id = inputmaskData.uId;

        modelObj.validateId(data, (err, record) => {
            if (err) {
                return cb({
                    "code": 411,
                    "msg": soajs.config.errors[411]
                });
            }
            if (!soajs.tenant.locked && record.locked) {
                return cb({
                    "code": 500,
                    "msg": soajs.config.errors[500]
                });
            }
            if (!record.config) {
                record.config = {};
            }

            if (!record.config.allowedTenants) {
                record.config.allowedTenants = [];
            }

            let found = false;

            if (record.config.allowedTenants.length > 0) {
                record.config.allowedTenants.forEach((oneTenant) => {
                    if (oneTenant.tenant && oneTenant.tenant.id
                        && oneTenant.tenant.id === inputmaskData.tenantId) {
                        found = true;
                    }
                });
            }

            if (found) {
                return cb({
                    "code": 429,
                    "msg": soajs.config.errors[429]
                });
            }

            let object = {
                tenant: {
                    id: inputmaskData.tId,
                    code: inputmaskData.tCode,
                    pin: {}
                }
            };

            if (inputmaskData.groups) {
                object.groups = inputmaskData.groups;
            }

            record.config.allowedTenants.push(object);

            modelObj.addUser(record, (err, record) => {
                if (err) {
                    return cb({
                        "code": 414,
                        "msg": soajs.config.errors[414]
                    });
                }
            return cb(null, record);
            });
        });
    },

    "unInviteUsers": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        if (!inputmaskData.username && !inputmaskData.email) {
            return cb({
                "code": 428,
                "msg": soajs.config.errors[428]
            });
        }
        if (inputmaskData.username) {
            data.username = inputmaskData.username;
        } else if (inputmaskData.email) {
            data.email = inputmaskData.email;
        }
        data.updatedFields = {
            "$pull": {
                "config.allowedTenants": { tId: inputmaskData.tId }
            }
        };

        data.extraOptions = { multi: true };

        modelObj.editUser(data, (err, record) => {
            if (err) {
                return cb({
                    "code": 422,
                    "msg": soajs.config.errors[422]
                });
            }
            return cb (null, record);
        });
    },

    "unInviteUserByID": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};
        data.id = inputmaskData.uId;

        modelObj.validateId(data, (err) => {
            if (err) {
                return cb({
                    "code": 411,
                    "msg": soajs.config.errors[411]
                });
            }
            data.updatedFields = {
                "$pull": {
                    "config.allowedTenants": { tId: inputmaskData.tId}
                }
            };
            modelObj.editUser(data, (err, record) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 422,
                        "msg": soajs.config.errors[422]
                    });
                }
                return cb (null, record);
            });
        });
    },

    "addEditPinCode": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};

        if (!inputmaskData.username || !inputmaskData.email) {
            return cb({
                "code": 428,
                "msg": req.soajs.config.errors[428]
            });
        }
        if (inputmaskData.username) {
            data.username = inputmaskData.username;
        }
        if (inputmaskData.email) {
            data.email = inputmaskData.email;
        }

        modelObj.getUser(data, (err, record) => {
            if (!soajs.tenant.locked && record.locked) {
                return cb({
                    "code": 500,
                    "msg": soajs.config.errors[500]
                });
            }
            if (!record.config || !record.config.allowedTenants || record.config.allowedTenants === 0) {
                return cb({
                    "code": 430,
                    "msg": soajs.config.errors[430]
                });
            }

            let allowedTenants = record.config.allowedTenants;

            let index = allowedTenants.map(allowedTenant => {
               return allowedTenant.tenant.id;
            }).indexOf(inputmaskData.tId);

            if (index === -1) {
                return cb({
                    "code": 430,
                    "msg": req.soajs.config.errors[430]
                });
            }

            if (!allowedTenants[index].tenant.pin) {
                allowedTenants[index].tenant.pin = {};
            }
            if (inputmaskData.pin) {
                if (inputmaskData.pin.code) {
                    let pinCode = getPinCodeConfig(req.soajs);
                    // allowedTenants[index].tenant.pin.code = makePin(pinCode);
                }
                if (inputmaskData.pin.hasOwnProperty("allowed")) {
                    allowedTenants[index].tenant.pin.allowed = inputmaskData.pin.allowed;
                }
            }
            if (inputmaskData.groups) {
                allowedTenants[index].groups = inputmaskData.groups;
            }

            record.config.allowedTenants = allowedTenants;

            modelObj.editUser(record, (err, res) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 422,
                        "msg": soajs.config.errors[422]
                    });
                }
                return (null, res);
            });

        });
    },

    "deletePinCode": (soajs, inputmaskData, modelObj, cb) => {
        let data = {};

        if (!inputmaskData.username || !inputmaskData.email) {
            return cb({
                "code": 428,
                "msg": req.soajs.config.errors[428]
            });
        }
        if (inputmaskData.username) {
            data.username = inputmaskData.username;
        }
        if (inputmaskData.email) {
            data.email = inputmaskData.email;
        }

        modelObj.getUser(data, (err, record) => {
            if (!soajs.tenant.locked && record.locked) {
                return cb({
                    "code": 500,
                    "msg": soajs.config.errors[500]
                });
            }
            if (!record.config || !record.config.allowedTenants || record.config.allowedTenants === 0) {
                return cb({
                    "code": 430,
                    "msg": soajs.config.errors[430]
                });
            }

            let allowedTenants = record.config.allowedTenants;

            let index = allowedTenants.map(allowedTenant => {
                return allowedTenant.tenant.id;
            }).indexOf(inputmaskData.tId);

            if (index === -1) {
                return cb({
                    "code": 430,
                    "msg": req.soajs.config.errors[430]
                });
            }

            record.config.allowedTenants = allowedTenants;

            modelObj.editUser(record, (err, res) => {
                if (err) {
                    soajs.log.error(err);
                    return cb({
                        "code": 422,
                        "msg": soajs.config.errors[422]
                    });
                }
                return (null, res);
            });

        });
    }

};

module.exports = bl;


//Check record vs Data