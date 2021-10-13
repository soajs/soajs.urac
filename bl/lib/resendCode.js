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
    "message": require("../../lib/message.js")
};

let bl = null;
let local = (soajs, inputmaskData, options, cb) => {
    let modelObj = bl.user.mt.getModel(soajs);
    options = {};
    options.mongoCore = modelObj.mongoCore;

    inputmaskData = inputmaskData || {};
    inputmaskData.status = ["pendingJoin"];
    bl.user.getUserByUsername(soajs, inputmaskData, options, (error, userRecord) => {
        if (error) {
            //close model
            bl.user.mt.closeModel(modelObj);
            return cb(error, null);
        }

        let data = {};
        data.userId = userRecord._id.toString();
        data.username = userRecord.username;
        data.service = "join";
        bl.token.add(soajs, data, options, (error, tokenRecord) => {
            if (error) {
                bl.user.mt.closeModel(modelObj);
                return cb(error, null);
            }
            let emailCode = true;
            let _continue = () => {
                if (inputmaskData.confirmation === "emailAndPhone" || inputmaskData.confirmation === "phone") {
                    let data = {};
                    data.firstName = userRecord.firstName;
                    data.lastName = userRecord.lastName;
                    data.email = userRecord.email;
                    data.phone = userRecord.phone;
                    data.confirmation = inputmaskData.confirmation;
                    data.inviteToken = tokenRecord.token;
                    data.service = "joinInvite";
                    data.code = true;
                    bl.token.addInvite(soajs, data, options, (error, tokenRecord) => {
                        bl.user.mt.closeModel(modelObj);
                        if (error) {
                            return cb(error, null);
                        }
                        lib.message.send(soajs, data.service, data, tokenRecord, function (error) {
                            if (error) {
                                soajs.log.info(data.service + ': No SMS was sent: ' + error.message);
                                //TODO: add send code by email
                            }
                            return cb(null, {"id": userRecord._id.toString()});
                        });
                    });
                } else {
                    if (emailCode) {
                        let data = {};
                        data.userId = userRecord._id.toString();
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
                                return cb(null, {"id": userRecord._id.toString()});
                            });
                        });
                    } else {
                        bl.user.mt.closeModel(modelObj);
                        return cb(null, {"id": userRecord._id.toString()});
                    }
                }
            };
            if (inputmaskData.confirmation === "email") {
                if (soajs.servicesConfig.urac && Object.hasOwnProperty.call(soajs.servicesConfig.urac, 'joinInviteEmailCode')) {
                    emailCode = soajs.servicesConfig.urac.joinInviteEmailCode;
                } else if (soajs.registry && soajs.registry.custom && soajs.registry.custom.urac && soajs.registry.custom.urac.value && soajs.registry.custom.urac.value.hasOwnProperty('joinInviteEmailCode')) {
                    emailCode = soajs.registry.custom.urac.value.joinInviteEmailCode;
                }
            } else {
                emailCode = false;
            }
            inputmaskData.doNotSendEmail = (inputmaskData.confirmation === "phone") || emailCode;
            if (inputmaskData.doNotSendEmail) {
                _continue();
            } else {
                lib.mail.send(soajs, data.service, userRecord, tokenRecord, function (error) {
                    if (error) {
                        soajs.log.info(data.service + ': No Mail was sent: ' + error.message);
                    }
                    _continue();
                });
            }
        });
    });
};

module.exports = function (_bl) {
    bl = _bl;
    return local;
};