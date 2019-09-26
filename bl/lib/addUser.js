'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const lib = {
    "mail": require("../../lib/mail.js"),
    "pin": require("../../lib/pin.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    inputmaskData = inputmaskData || {};

    bl.user.countUser(soajs, inputmaskData, options, (error, found) => {
        if (error) {
            //close model
            bl.user.mt.closeModel(modelObj);
            return cb(error, null);
        }
        if (found) {
            //close model
            bl.user.mt.closeModel(modelObj);
            return cb(bl.user.handleError(soajs, 402, null));
        }

        inputmaskData.config = {};

        let doAdd = (pin, pinCode) => {
            bl.user.add(soajs, inputmaskData, options, (error, userRecord) => {
                if (error) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(error, null);
                }
                if (pin) {
                    userRecord.pin = pinCode;
                    lib.mail.send(soajs, 'invitePin', userRecord, null, function (error) {
                        if (error) {
                            soajs.log.info('invitePin: No Mail was sent: ' + error);
                        }
                    });
                }
                if (userRecord.status !== "pendingNew") {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(null, {
                        id: userRecord._id.toString()
                    });
                }
                else {
                    let data = {};
                    data.userId = userRecord._id.toString();
                    data.username = userRecord.username;
                    data.service = "addUser";
                    bl.token.add(soajs, data, options, (error, tokenRecord) => {
                        bl.user.mt.closeModel(modelObj);
                        if (error) {
                            return cb(error, null);
                        }
                        lib.mail.send(soajs, "addUser", userRecord, tokenRecord, function (error, mailRecord) {
                            if (error) {
                                soajs.log.info('addUser: No Mail was sent: ' + error);
                            }
                            return cb(null, {
                                id: userRecord._id.toString(),
                                token: tokenRecord.token,
                                link: mailRecord.link || null
                            });
                        });
                    });
                }
            });
        };

        let doPin = (mainTenant) => {
            let generatedPin = null;
            if (inputmaskData.pin && inputmaskData.pin.code) {
                let pinConfig = lib.pin.config(soajs, bl.user.localConfig);
                try {
                    generatedPin = lib.pin.generate(pinConfig);
                    if (mainTenant) {
                        inputmaskData.tenant.pin.code = generatedPin;
                        inputmaskData.tenant.pin.allowed = !!inputmaskData.pin.allowed;
                    }
                    else {
                        inputmaskData.config.allowedTenants[0].tenant.pin.code = generatedPin;
                        inputmaskData.config.allowedTenants[0].tenant.pin.allowed = !!inputmaskData.pin.allowed;
                    }
                    doAdd(true, generatedPin);
                } catch (e) {
                    //close model
                    bl.user.mt.closeModel(modelObj);
                    return cb(bl.user.handleError(soajs, 525, e));
                }
            }
            else {
                doAdd(false, null);
            }
        };

        if (soajs.tenant.type === "client" && soajs.tenant.main) {
            inputmaskData.tenant = {
                id: soajs.tenant.main.id,
                code: soajs.tenant.main.code,
                pin: {}
            };
            if (!inputmaskData.config.allowedTenants) {
                inputmaskData.config.allowedTenants = [];
            }
            let allowedTenantObj = {
                "tenant": {
                    "id": soajs.tenant.id,
                    "code": soajs.tenant.code,
                    "pin": {}
                }
            };
            if (inputmaskData.groups) {
                allowedTenantObj.groups = inputmaskData.groups;
                inputmaskData.groups = [];
            }

            inputmaskData.config.allowedTenants.push(allowedTenantObj);

            doPin(false);
        } else {
            inputmaskData.tenant = {
                "id": soajs.tenant.id,
                "code": soajs.tenant.code,
                "pin": {}
            };

            doPin(true);
        }
    });
};


module.exports = function (_bl) {
    bl = _bl;
    return local;
};