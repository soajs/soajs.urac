'use strict';

/**
 * @license
 * Copyright SOAJS All Rights Reserved.
 *
 * Use of this source code is governed by an Apache license that can be
 * found in the LICENSE file at the root of this repository
 */

const lib = {
    "message": require("../../lib/message.js"),
    "mail": require("../../lib/mail.js"),
    "generateUsername": require("../../lib/generateUsername.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    let modelObj = bl.user.mt.getModel(soajs, options);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    if (!inputmaskData.username) {
        inputmaskData.username = lib.generateUsername();
    }
    let emailCode = true;
    if (inputmaskData.confirmation === "email") {
        if (soajs.servicesConfig.urac && Object.hasOwnProperty.call(soajs.servicesConfig.urac, 'joinInviteEmailCode')) {
            emailCode = soajs.servicesConfig.urac.joinInviteEmailCode;
        } else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.hasOwnProperty('joinInviteEmailCode')) {
            emailCode = soajs.registry.custom.urac.value.joinInviteEmailCode;
        }
    } else {
        emailCode = false;
    }
    inputmaskData.keepToken = true;
    inputmaskData.doNotSendEmail = (inputmaskData.confirmation === "phone") || emailCode;
    console.log(inputmaskData);
    console.log(emailCode);
    bl.join(soajs, inputmaskData, options, (error, response) => {
        console.log(response);
        if (error) {
            bl.user.mt.closeModel(modelObj);
            return cb(error, null);
        }
        if (inputmaskData.confirmation === "emailAndPhone" || inputmaskData.confirmation === "phone") {
            let data = {};
            data.firstName = inputmaskData.firstName;
            data.lastName = inputmaskData.lastName;
            data.email = inputmaskData.email;
            data.phone = inputmaskData.phone || null;
            data.confirmation = inputmaskData.confirmation;
            data.inviteToken = response.token;
            data.service = "joinInvite";
            data.code = true;
            bl.token.addInvite(soajs, data, options, (error, tokenRecord) => {
                bl.user.mt.closeModel(modelObj);
                if (error) {
                    return cb(error, null);
                }
                if (data.phone) {
                    lib.message.send(soajs, data.service, data, tokenRecord, function (error) {
                        if (error) {
                            soajs.log.info(data.service + ': No SMS was sent: ' + error.message);
                            //TODO: add send code by email
                        }
                        return cb(null, {"id": response.id, "status": response.status});
                    });
                } else {
                    return cb(null, {"id": response.id, "status": response.status});
                }
            });
        } else {
            if (emailCode && !inputmaskData.emailConfirmed) {
                let data = {};
                data.userId = response.id;
                data.username = inputmaskData.username;
                data.service = "join_code";
                data.code = true;
                bl.token.add(soajs, data, options, (error, tokenRecord) => {
                    bl.user.mt.closeModel(modelObj);
                    if (error) {
                        return cb(error, null);
                    }
                    lib.mail.send(soajs, data.service, inputmaskData, tokenRecord, function (error) {
                        if (error) {
                            soajs.log.info(data.service + ': No Mail was sent: ' + error.message);
                        }
                        return cb(null, {"id": response.id, "status": response.status});
                    });
                });
            } else {
                bl.user.mt.closeModel(modelObj);
                return cb(null, {"id": response.id, "status": response.status});
            }
        }
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};
