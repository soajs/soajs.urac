'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const async = require("async");
const lib = {
    "mail": null,
    "pin": require("../../lib/pin.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    inputmaskData = inputmaskData || {};
    if (!inputmaskData.users) {
        return cb(bl.user.handleError(soajs, 530, null));
    }

    if (!inputmaskData.tenant) {
        inputmaskData.tenant = soajs.tenant;
    }

    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    let data = {
        //"status": "active"
    };

    let records = {"succeeded": [], "failed": []};
    async.eachLimit(inputmaskData.users, 20, function (oneUser, callback) {

        let goInvite = (error, userRecord, responseObj) => {
            if (error) {
                records.failed.push(responseObj);
                return callback();
            }
            if (userRecord.tenant.id === inputmaskData.tenant.id) {
                responseObj.reason = bl.user.localConfig.errors[536];//"User is already in the tenant tenancy.";
                responseObj.id = userRecord._id;
                records.failed.push(responseObj);
                return callback();
            }
            if (!userRecord.config) {
                userRecord.config = {};
            }
            if (!userRecord.config.allowedTenants) {
                userRecord.config.allowedTenants = [];
            }
            let found = false;
            if (userRecord.config.allowedTenants.length > 0) {
                userRecord.config.allowedTenants.forEach((oneTenant) => {
                    if (oneTenant.tenant && oneTenant.tenant.id && oneTenant.tenant.id === inputmaskData.tenant.id) {
                        found = true;
                    }
                });
            }
            if (found) {
                responseObj.reason = bl.user.localConfig.errors[529];//"User has already been invited.";
                responseObj.id = userRecord._id;
                records.failed.push(responseObj);
                return callback();
            }
            let obj = {
                "tenant": {
                    "id": inputmaskData.tenant.id,
                    "code": inputmaskData.tenant.code
                }
            };
            obj.tenant.pin = {};
            if (oneUser.groups) {
                obj.groups = oneUser.groups;
            } else if (oneUser.membership) {
                let membershipConfig = null;
                if (soajs.servicesConfig && soajs.servicesConfig.urac && soajs.servicesConfig.urac.membership) {
                    if (soajs.servicesConfig.urac.membership[oneUser.membership]) {
                        membershipConfig = soajs.servicesConfig.urac.membership[oneUser.membership];
                    }
                }
                if (!membershipConfig && soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.membership) {
                    if (soajs.registry.custom.urac.value.membership[oneUser.membership]) {
                        membershipConfig = soajs.registry.custom.urac.value.membership[oneUser.membership];
                    }
                }
                if (membershipConfig) {
                    if (membershipConfig.groups) {
                        if (Array.isArray(membershipConfig.groups) && membershipConfig.groups.length > 0) {
                            obj.groups = membershipConfig.groups;
                        } else {
                            soajs.log.warn("Skipping [" + oneUser.membership + "] membership setting, groups must be an array of at least one group");
                        }
                    }
                } else {
                    soajs.log.debug("Skipping [" + oneUser.membership + "] membership, unable to find any setting for it");
                }
            }

            let generatedPin = null;
            if (oneUser.pin && oneUser.pin.code) {
                let pinConfig = lib.pin.config(soajs, bl.user.localConfig);
                try {
                    generatedPin = lib.pin.generate(pinConfig);
                    obj.tenant.pin.code = generatedPin;
                    obj.tenant.pin.allowed = !!oneUser.pin.allowed;
                    if (!userRecord.tenant.pin) {
                        userRecord.tenant.pin = {};
                    }
                    userRecord.tenant.pin.allowed = !!oneUser.pin.allowed;
                } catch (e) {
                    responseObj.reason = "Failed to generate pin at this.";
                    records.failed.push(responseObj);
                    return callback();
                }
            }
            userRecord.config.allowedTenants.push(obj);

            modelObj.save(userRecord, (err, response) => {
                if (err) {
                    console.log(err.message)
                    responseObj.reason = err.message;
                    records.failed.push(responseObj);
                    return callback();
                }
                if (response && generatedPin) {
                    userRecord.pin = generatedPin;
                    lib.mail.send(soajs, 'invitePin', userRecord, null, function (error) {
                        if (error) {
                            soajs.log.info('invitePin: No Mail was sent: ' + error.message);
                        }
                    });
                }
                records.succeeded.push(responseObj);
                return callback();
            });
        };

        if (oneUser.user.id) {
            let responseObj = {"id": oneUser.user.id};
            data.id = oneUser.user.id;
            data.keep = {"pin": true};
            bl.user.getUser(soajs, data, options, (error, userRecord) => {
                return goInvite(error, userRecord, responseObj);
            });
        } else if (oneUser.user.username) {
            let responseObj = {"username": oneUser.user.username};
            data.username = oneUser.user.username;
            data.keep = {"pin": true};
            bl.user.getUserByUsername(soajs, data, options, (error, userRecord) => {
                return goInvite(error, userRecord, responseObj);
            });
        } else if (oneUser.user.email) {
            let responseObj = {"email": oneUser.user.email};
            data.username = oneUser.user.email;
            data.keep = {"pin": true};
            bl.user.getUserByUsername(soajs, data, options, (error, userRecord) => {
                return goInvite(error, userRecord, responseObj);
            });
        } else {
            let responseObj = {"reason": "Cannot invite a user without providing its id or username."};
            records.failed.push(responseObj);
            return callback();
        }
    }, function () {
        //close model
        bl.user.mt.closeModel(modelObj);
        return cb(null, records);
    });
};


module.exports = function (_bl) {
    bl = _bl;
    lib.mail = require("../../lib/mail.js")(bl);
    return local;
};
